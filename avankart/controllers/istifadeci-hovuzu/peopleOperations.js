import TransactionsUser from "../../../shared/models/transactionsModel.js";
import PeopleUser from "../../../shared/models/peopleUserModel.js";
import CardsCategory from "../../../shared/models/cardsCategoryModel.js";
import Cards from "../../../shared/models/cardModel.js";
import mongoose from "mongoose";

// Korporativ şirkətlər siyahısı üçün endpoint


export const getPeopleOperationsCorporate = async (req, res) => {
  try {
    console.log('🏢 Korporativ operations endpoint called');
    console.log('📋 Request params:', req.params);
    console.log('📋 Request body:', req.body);
    
    const body = req.body || {};
    const draw = Number(body.draw || 1);
    const start = Number(body.start || 0);
    const length = Number(body.length || 10);
    
    const { people_id } = req.params;
    if (!people_id) {
      console.log('❌ people_id missing');
      return res
        .status(400)
        .json({ success: false, message: "people_id tələb olunur" });
    }

    console.log('🔍 Searching for people_id:', people_id);

    // Əvvəlcə bu people_id ilə real user-i database-də tapaq
    console.log('👤 Finding real user ObjectId...');
    const peopleUser = await PeopleUser.findOne({ people_id: people_id });
    
    if (!peopleUser) {
      console.log('❌ User not found with people_id:', people_id);
      return res.json({
        draw: draw,
        recordsTotal: 0,
        recordsFiltered: 0,
        data: [],
      });
    }
    
    const realPeopleObjectId = peopleUser._id;
    console.log('✅ Found user ObjectId:', realPeopleObjectId);

    // Bu istifadəçinin əlaqəli olduğu şirkətləri tapaq
    // Burada şirkət məlumatlarını almaq üçün müxtəlif mənbələrdən istifadə edə bilərik
    
    console.log('📊 Starting aggregation pipeline...');
    
    // Misal olaraq: TransactionsUser-da bu people_id ilə əlaqəli işləri olan şirkətləri tapaq  
    const corporateAggregation = await TransactionsUser.aggregate([
      {
        $match: {
          from: realPeopleObjectId, // "people" deyil, "from" - düzəldildi
          subject: { $ne: null, $ne: "" } // subject field-i əsasında qruplaşdıraq
        }
      },
      {
        $group: {
          _id: "$subject", // subject field-i ilə qruplaşdır (bank/şirkət adı)
          transactionCount: { $sum: 1 },
          totalIncome: {
            $sum: {
              $cond: [{ $gt: ["$amount", 0] }, "$amount", 0]
            }
          },
          totalExpense: {
            $sum: {
              $cond: [{ $lt: ["$amount", 0] }, { $abs: "$amount" }, 0]
            }
          },
          firstTransaction: { $min: "$createdAt" },
          lastTransaction: { $max: "$createdAt" }
        }
      },
      {
        $project: {
          _id: 1,
          companyName: { 
            $ifNull: ["$_id", "Naməlum Şirkət"] 
          },
          companyCategory: "Bank/Maliyyə Təşkilatı",
          activityType: "Maliyyə Xidmətləri",
          companyStatus: 1,
          transactionCount: 1,
          totalIncome: { $round: ["$totalIncome", 2] },
          totalExpense: { $round: ["$totalExpense", 2] },
          firstTransaction: 1,
          lastTransaction: 1
        }
      },
      { $sort: { transactionCount: -1 } },
      { $skip: start },
      { $limit: length }
    ]);

    console.log('📈 Corporate aggregation result:', corporateAggregation);
    console.log('📊 Found', corporateAggregation.length, 'companies');

    // Ümumi sayını tapaq
    const totalCountAggregation = await TransactionsUser.aggregate([
      {
        $match: {
          from: realPeopleObjectId, // "people" deyil, "from" - düzəldildi
          subject: { $ne: null, $ne: "" } // subject field-i əsasında say
        }
      },
      {
        $group: {
          _id: "$subject"
        }
      },
      {
        $count: "total"
      }
    ]);

    const totalRecords = totalCountAggregation[0]?.total || 0;
    
    console.log('📊 Total records:', totalRecords);

    // DataTable formatında cavab qaytar
    const tableData = corporateAggregation.map((item) => ({
      company_name: item.companyName,
      transaction_count: item.transactionCount,
      total_expense: `${item.totalExpense.toLocaleString()} AZN`,
      total_income: `${item.totalIncome.toLocaleString()} AZN`,
      start_date: item.firstTransaction ? new Date(item.firstTransaction).toLocaleDateString('az-AZ') : '-',
      end_date: item.lastTransaction ? new Date(item.lastTransaction).toLocaleDateString('az-AZ') : '-',
      company_id: item._id
    }));

    console.log('📋 Table data prepared:', tableData);
    console.log('✅ Sending response with', tableData.length, 'rows');

    res.json({
      draw: draw,
      recordsTotal: totalRecords,
      recordsFiltered: totalRecords,
      data: tableData,
    });

  } catch (error) {
    console.error("Korporativ əməliyyatlar xətası:", error);
    res.status(500).json({
      success: false,
      message: "Server xətası",
      error: error.message,
    });
  }
};

// Fərdi əməliyyatlar table-i üçün endpoint
export const getPeopleOperationsPersonal = async (req, res) => {
  try {
    const body = req.body || {};
    const draw = Number(body.draw || 1);
    const start = Number(body.start || 0);
    const length = Number(body.length || 10);

    const {
      startDate,
      endDate,
      cardCategories,
      destinations,
      statuses,
      minAmount,
      maxAmount,
      search,
    } = body;

    const { people_id } = req.params;
    if (!people_id) {
      return res
        .status(400)
        .json({ success: false, message: "people_id tələb olunur" });
    }

    const peopleUser = await PeopleUser.findOne({ people_id }).select(
      "_id people_id name surname"
    );
    if (!peopleUser) {
      return res
        .status(404)
        .json({ success: false, message: "İstifadəçi tapılmadı" });
    }

    const match = { from: peopleUser._id };

    // TARİX ARALIĞI
    if (startDate || endDate) {
      match.date = {};
      if (startDate && !isNaN(Date.parse(startDate))) {
        match.date.$gte = new Date(startDate);
      }
      if (endDate && !isNaN(Date.parse(endDate))) {
        const dt = new Date(endDate);
        dt.setHours(23, 59, 59, 999);
        match.date.$lte = dt;
      }
      if (Object.keys(match.date).length === 0) delete match.date;
    }

    // DESTINATIONS
    const destinationMapIn = {
      mədaxil: "Internal",
      Mədaxil: "Internal",
      məxaric: "External",
      Məxaric: "External",
    };

    if (
      destinations &&
      Array.isArray(destinations) &&
      destinations.length > 0
    ) {
      const rawDestinations = destinations
        .map((d) => destinationMapIn[d] || d)
        .filter((d) => ["Internal", "External"].includes(d));
      if (rawDestinations.length > 0) {
        match.destination = { $in: rawDestinations };
      }
    }

    // STATUSES
    const statusMapIn = {
      uğurlu: "success",
      uğursuz: "failed",
      gözləmədə: "pending",
    };

    if (statuses && Array.isArray(statuses) && statuses.length > 0) {
      const rawStatuses = statuses
        .map((s) => statusMapIn[s] || s)
        .filter((s) => ["success", "failed", "pending"].includes(s));
      if (rawStatuses.length > 0) {
        match.status = { $in: rawStatuses };
      }
    }

    // CARD CATEGORIES
    const toObjectIds = (arr) =>
      arr
        .filter(Boolean)
        .map((v) => {
          try {
            return new mongoose.Types.ObjectId(v);
          } catch {
            return null;
          }
        })
        .filter(Boolean);

    if (
      cardCategories &&
      Array.isArray(cardCategories) &&
      cardCategories.length > 0
    ) {
      const requestedCatIds = toObjectIds(cardCategories);
      if (requestedCatIds.length) {
        const cardIds = await Cards.find({ category: { $in: requestedCatIds } })
          .select("_id")
          .lean();
        const cardIdList = cardIds.map((c) => c._id);
        const orBlocks = [];
        orBlocks.push({ cardCategory: { $in: requestedCatIds } });
        if (cardIdList.length) orBlocks.push({ cards: { $in: cardIdList } });
        match.$or = match.$or ? [...match.$or, ...orBlocks] : orBlocks;
      }
    }

    // AMOUNT ARALIĞI
    if (minAmount || maxAmount) {
      match.amount = {};
      if (minAmount !== undefined && !isNaN(Number(minAmount)))
        match.amount.$gte = Number(minAmount);
      if (maxAmount !== undefined && !isNaN(Number(maxAmount)))
        match.amount.$lte = Number(maxAmount);
      if (Object.keys(match.amount).length === 0) delete match.amount;
    }

    // AXTARIŞ
    let searchValue = null;
    if (typeof search === "string" && search.trim())
      searchValue = search.trim();
    else if (search && typeof search === "object" && search.value)
      searchValue = String(search.value).trim();

    const orClauses = [];
    if (searchValue) {
      const statusRev = {
        success: "uğurlu",
        failed: "uğursuz",
        pending: "gözləmədə",
      };
      const destLocalizedToRaw = { mədaxil: "Internal", məxaric: "External" };
      const lowered = searchValue.toLowerCase();
      const regex = new RegExp(searchValue, "i");

      orClauses.push(
        { transaction_id: regex },
        { subject: regex },
        { status: regex }
      );

      Object.entries(statusRev).forEach(([eng, az]) => {
        const azLower = az.toLowerCase();
        if (azLower.includes(lowered) || lowered.includes(azLower)) {
          orClauses.push({ status: eng });
        }
      });

      Object.entries(destLocalizedToRaw).forEach(([azLower, rawVal]) => {
        if (azLower.includes(lowered) || lowered.includes(azLower)) {
          orClauses.push({ destination: rawVal });
        }
      });

      if (["internal", "external"].some((v) => v.includes(lowered))) {
        ["Internal", "External"].forEach((raw) => {
          if (raw.toLowerCase().includes(lowered))
            orClauses.push({ destination: raw });
        });
      }
    }

    let finalQuery = { ...match };
    if (orClauses.length && match.$or) {
      finalQuery.$or = [...match.$or, ...orClauses];
      delete finalQuery.$or.$or;
    } else if (orClauses.length) {
      finalQuery.$or = orClauses;
    }

    const skip = start;
    const limit = length;

    const recordsTotalPromise = TransactionsUser.countDocuments({
      from: peopleUser._id,
    });
    const recordsFilteredPromise = TransactionsUser.countDocuments(finalQuery);

    const rowsPromise = TransactionsUser.find(finalQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "cards",
        select: "name category background_color",
        populate: { path: "category", select: "name" },
      })
      .populate("cardCategory", "name")
      .populate("to", "muessise_name")
      .select(
        "transaction_id amount subject status destination date cards cardCategory to createdAt"
      )
      .lean();

    const [recordsTotal, recordsFiltered, rows] = await Promise.all([
      recordsTotalPromise,
      recordsFilteredPromise,
      rowsPromise,
    ]);

    const statusMapOut = {
      success: "uğurlu",
      failed: "uğursuz",
      pending: "gözləmədə",
    };
    const destinationMapOut = { Internal: "Mədaxil", External: "Məxaric" };

    const data = rows.map((t) => {
      const rawDate = t.date || t.createdAt;
      const dt = rawDate ? new Date(rawDate) : null;
      let cardCategoryName = null;
      if (t.cards && t.cards.category && typeof t.cards.category === "object") {
        cardCategoryName = t.cards.category.name || null;
      }
      if (
        !cardCategoryName &&
        t.cardCategory &&
        typeof t.cardCategory === "object"
      ) {
        cardCategoryName = t.cardCategory.name || null;
      }
      if (!cardCategoryName && t.cards && t.cards.name) {
        cardCategoryName = t.cards.name;
      }
      return {
        transaction_id: t.transaction_id,
        destination: destinationMapOut[t.destination] || t.destination,
        card_category: cardCategoryName,
        amount: Number(t.amount).toFixed(2),
        subject: t.subject || null,
        date: dt
          ? `${dt.toLocaleDateString("az-AZ", { timeZone: "Asia/Baku" })} ${dt.toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Asia/Baku" })}`
          : null,
        status: statusMapOut[t.status] || t.status,
      };
    });

    return res.status(200).json({
      success: true,
      draw,
      recordsTotal,
      recordsFiltered,
      data,
      pagination: {
        start: skip,
        length: limit,
        page: Math.floor(skip / (limit || 1)) + 1,
        totalPages: Math.ceil(recordsFiltered / (limit || 1)) || 1,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Daxili server xətası" });
  }
};

// Filter üçün kart kateqoriyaları endpoint (Fərdi əməliyyatlarda da lazımdır)
export const getPeopleOperationCardCategories = async (req, res) => {
  try {
    const { people_id } = req.params;
    
    if (!people_id) {
      return res
        .status(400)
        .json({ success: false, message: "people_id tələb olunur" });
    }

    const peopleUser = await PeopleUser.findOne({ people_id }).select("_id");
    if (!peopleUser) {
      return res
        .status(404)
        .json({ success: false, message: "İstifadəçi tapılmadı" });
    }

    const cardCategoryIds = await TransactionsUser.distinct("cardCategory", {
      from: peopleUser._id,
      cardCategory: { $exists: true, $ne: null },
    });

    const transactions = await TransactionsUser.find({
      from: peopleUser._id,
      cards: { $exists: true, $ne: null },
    })
      .populate("cards", "category name")
      .select("cards");

    const cardCategoryIdsFromCards = [];
    transactions.forEach((t) => {
      if (t.cards && t.cards.category) {
        cardCategoryIdsFromCards.push(t.cards.category);
      }
    });

    const allCategoryIds = [
      ...new Set([...cardCategoryIds, ...cardCategoryIdsFromCards]),
    ];

    const cardCategories = await CardsCategory.find({
      _id: { $in: allCategoryIds },
      deleted: { $ne: true },
    })
      .select("name")
      .sort("name");

    return res.status(200).json({
      success: true,
      cardCategories: cardCategories.map((cat) => ({
        id: cat._id,
        name: cat.name,
      })),
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Daxili server xətası" });
  }
};

// Seçilmiş şirkət (subject) üçün detallı əməliyyatlar (korporativ) cədvəli
export const getPeopleOperationsCorporateCompanyTable = async (req, res) => {
  try {
    const body = req.body || {};
    const draw = Number(body.draw || 1);
    const start = Number(body.start || 0);
    const length = Number(body.length || 15);
  const search = (body.search && (body.search.value || body.search)) || "";
  const { startDate, endDate, cardCategories, destinations, statuses, minAmount, maxAmount } = body;
    const { people_id } = req.params;
    const { company_id } = body; // subject kimi istifadə olunur

    if (!people_id || !company_id) {
      return res.status(400).json({ success: false, message: "people_id və company_id tələb olunur" });
    }

    // İstifadəçi tap
    const peopleUser = await PeopleUser.findOne({ people_id }).select("_id");
    if (!peopleUser) {
      return res.status(404).json({ success: false, message: "İstifadəçi tapılmadı" });
    }

    const baseMatch = { from: peopleUser._id, subject: company_id };

    // Tarix aralığı
    if (startDate || endDate) {
      baseMatch.date = {};
      if (startDate && !isNaN(Date.parse(startDate))) {
        baseMatch.date.$gte = new Date(startDate);
      }
      if (endDate && !isNaN(Date.parse(endDate))) {
        const dt = new Date(endDate);
        dt.setHours(23,59,59,999);
        baseMatch.date.$lte = dt;
      }
      if (Object.keys(baseMatch.date).length === 0) delete baseMatch.date;
    }

    // Destinations (Təyinat)
    const destinationMapIn = { mədaxil: 'Internal', Mədaxil: 'Internal', məxaric: 'External', Məxaric: 'External' };
    if (destinations && Array.isArray(destinations) && destinations.length) {
      const rawDest = destinations.map(d => destinationMapIn[d] || d).filter(d => ['Internal','External'].includes(d));
      if (rawDest.length) baseMatch.destination = { $in: rawDest };
    }

    // Statuses
    const statusMapIn = { uğurlu: 'success', uğursuz: 'failed', gözləmədə: 'pending' };
    if (statuses && Array.isArray(statuses) && statuses.length) {
      const rawStatuses = statuses.map(s => statusMapIn[s] || s).filter(s => ['success','failed','pending'].includes(s));
      if (rawStatuses.length) baseMatch.status = { $in: rawStatuses };
    }

    // Amount range
    if (minAmount !== undefined || maxAmount !== undefined) {
      baseMatch.amount = {};
      if (minAmount !== undefined && !isNaN(Number(minAmount))) baseMatch.amount.$gte = Number(minAmount);
      if (maxAmount !== undefined && !isNaN(Number(maxAmount))) baseMatch.amount.$lte = Number(maxAmount);
      if (Object.keys(baseMatch.amount).length === 0) delete baseMatch.amount;
    }

    // Card categories (IDs)
    if (cardCategories && Array.isArray(cardCategories) && cardCategories.length) {
      const ids = cardCategories
        .map(v => { try { return new mongoose.Types.ObjectId(v); } catch { return null; } })
        .filter(Boolean);
      if (ids.length) baseMatch.cardCategory = { $in: ids };
    }

    // Axtarış tətbiq et
    let finalMatch = { ...baseMatch };
    if (search && String(search).trim()) {
      const val = String(search).trim();
      const regex = new RegExp(val, "i");
      finalMatch.$or = [
        { transaction_id: regex },
        { subject: regex },
        { status: regex },
      ];
    }

    const [recordsTotal, recordsFiltered, rows] = await Promise.all([
      TransactionsUser.countDocuments({ from: peopleUser._id, subject: company_id }), // total only by subject ignoring filters
      TransactionsUser.countDocuments(finalMatch),
      TransactionsUser.find(finalMatch)
        .sort({ createdAt: -1 })
        .skip(start)
        .limit(length)
        .populate({
          path: "cards",
          select: "name category background_color",
          populate: { path: "category", select: "name" },
        })
        .populate("cardCategory", "name")
        .select("transaction_id amount subject status destination date cards cardCategory createdAt")
        .lean(),
    ]);

    const statusMapOut = { success: "uğurlu", failed: "uğursuz", pending: "gözləmədə" };
    const destinationMapOut = { Internal: "Mədaxil", External: "Məxaric" };

    const data = rows.map((t) => {
      const rawDate = t.date || t.createdAt;
      const dt = rawDate ? new Date(rawDate) : null;
      let cardCategoryName = null;
      if (t.cards && t.cards.category && typeof t.cards.category === "object") {
        cardCategoryName = t.cards.category.name || null;
      }
      if (!cardCategoryName && t.cardCategory && typeof t.cardCategory === "object") {
        cardCategoryName = t.cardCategory.name || null;
      }
      if (!cardCategoryName && t.cards && t.cards.name) {
        cardCategoryName = t.cards.name;
      }
      return {
        transaction_id: t.transaction_id,
        destination: destinationMapOut[t.destination] || t.destination,
        card_category: cardCategoryName,
        amount: Number(t.amount).toFixed(2),
        subject: t.subject || null,
        date: dt
          ? `${dt.toLocaleDateString("az-AZ", { timeZone: "Asia/Baku" })} ${dt.toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Asia/Baku" })}`
          : null,
        status: statusMapOut[t.status] || t.status,
      };
    });

    return res.json({
      draw,
      recordsTotal,
      recordsFiltered,
      data,
    });
  } catch (err) {
    console.error("Şirkət detay əməliyyatlar xətası:", err);
    return res.status(500).json({ success: false, message: "Server xətası" });
  }
};
