import mongoose from "mongoose";
import { validationResult } from "express-validator";

// Import models
import AddedBalance from "../../../../shared/model/people/addedBalances.js";
import AddCardBalance from "../../../../shared/model/people/addBalances.js";
import Cards from "../../../../shared/models/cardModel.js";
import PeopleUser from "../../../../shared/models/peopleUserModel.js";
import Sirket from "../../../../shared/models/sirketModel.js";
import Invoice from "../../../../shared/models/invoysSirketModel.js";
import ImtiyazQruplari from "../../../../shared/model/people/imtiyazQruplari.js";

// Sirket İsciler Controller
class SirketIscilerController {
  // Ana səhifə - şirkətlərin siyahısı
  async showIscilerPage(req, res) {
    try {
      const statuses = ["active", "passive", "canceled", "waiting", "reported", "completed"];

      // Status bazlı sayım ve toplam balance
      const aggregation = await AddCardBalance.aggregate([
        {
          $group: {
            _id: "$status",                     // status bazlı grupla
            count: { $sum: 1 },                 // status sayısı
            total_balance: { $sum: "$total_balance" } // bu status için toplam balance
          }
        }
      ]);

      // Tüm statusları 0 ile başlat
      const counts = {};
      statuses.forEach(status => counts[status] = 0);

      let totalBalance = 0;

      aggregation.forEach(item => {
        counts[item._id] = item.count || 0;
        totalBalance += item.total_balance || 0;
      });

      

      return res.render("pages/emeliyyatlar/sirket/isciler", {
        title: "İşçilərin balansı",
        csrfToken: req.csrfToken(),
        user: req.user,
        totalBalance,
        counts
      });

    } catch (error) {
      console.error("Sirket isciler page error:", error);
      return res.status(500).render("error", {
        message: "Səhifə yüklənərkən xəta baş verdi",
        error
      });
    }
  }

  // Şirkətlərin siyahısı - DataTables üçün JSON data
  async getCompaniesData(req, res) {
    try {
      const {
        draw,
        start,
        length,
        search,
        min,
        max,
        startDate,
        endDate,
        cards = [],
        minCardCount,
        maxCardCount,
      } = req.body;
      const status = cards;
      const minAmount = min;
      const maxAmount = max;
      // MongoDB aggregation pipeline
      let pipeline = [];

      // Match stage
      let matchStage = {};

      // Status filter - AddedBalance modelindəki status field-i
      if (status && status.length > 0) {
        const statusMapping = {
          active: ["active"],
          waiting: ["waiting"],
          pending: ["waiting"],
          completed: ["complated"],
          tamamlandi: ["tamamlandi"],
        };

        let mappedStatuses = [];
        status.forEach((s) => {
          if (statusMapping[s]) {
            mappedStatuses = [...mappedStatuses, ...statusMapping[s]];
          }
        });

        if (mappedStatuses.length > 0) {
          matchStage.status = { $in: mappedStatuses };
        }
      }

      // Məbləğ aralığı
      if (minAmount || maxAmount) {
        matchStage.total_balance = {};
        if (minAmount) matchStage.total_balance.$gte = parseFloat(minAmount);
        if (maxAmount) matchStage.total_balance.$lte = parseFloat(maxAmount);
      }

      // Tarix aralığı
      if (startDate || endDate) {
        matchStage.createdAt = {};
        if (startDate) matchStage.createdAt.$gte = new Date(startDate);
        if (endDate)
          matchStage.createdAt.$lte = new Date(endDate);
      }

      pipeline.push({ $match: matchStage });

      console.log("🔧 Match stage:", JSON.stringify(matchStage, null, 2));

      // Populate sirket məlumatları
      pipeline.push({
        $lookup: {
          from: "sirkets",
          localField: "sirket_id",
          foreignField: "_id",
          as: "sirket",
        },
      });

      pipeline.push({
        $unwind: "$sirket",
      });

      // Populate balance/invoice information if balance_id exists
      pipeline.push({
        $lookup: {
          from: "balances", // Adjust collection name as needed
          localField: "balance_id",
          foreignField: "_id",
          as: "balance_info",
        },
      });

      pipeline.push({
        $unwind: {
          path: "$balance_info",
          preserveNullAndEmptyArrays: true,
        },
      });

      // No grouping - each database record will be a separate row
      // Project to format the data structure
      pipeline.push({
        $project: {
          _id: 1,
          sirket: 1,
          balance_id: 1,
          balance_info: 1,
          card_id: 1,
          cards: 1,
          user_count: 1,
          total_balance: 1,
          createdAt: 1,
          status: 1,
        },
      });

      // Text axtarış
      if (search) {
        const searchRegex = new RegExp(search, "i");
        pipeline.push({
          $match: {
            $or: [
              { "sirket.sirket_name": searchRegex },
              { "sirket.sirket_id": searchRegex },
              { balance_id: searchRegex },
            ],
          },
        });
      }

      // Since we're not grouping anymore, we don't need card count filter
      // Individual records don't have a card count concept

      // Sort by createdAt desc
      pipeline.push({
        $sort: { createdAt: -1 },
      });

      // Total count üçün pipeline
      const countPipeline = [...pipeline, { $count: "total" }];

      // Pagination
      const startIndex = parseInt(start) || 0;
      const pageLength = parseInt(length) || 10;

      pipeline.push({ $skip: startIndex }, { $limit: pageLength });

      // Execute aggregation
      console.log("🚀 Final pipeline:", JSON.stringify(pipeline, null, 2));

      const [data, countResult] = await Promise.all([
        AddCardBalance.aggregate(pipeline),
        AddCardBalance.aggregate(countPipeline),
      ]);
      
      const totalRecords = countResult[0]?.total || 0;
      const maxAmountResult = await AddedBalance.aggregate([
      { $match: { deletedAt: { $exists: false } } }, // gerekiyorsa companyId filtresi ekle
      {
        $group: {
          _id: "$card_id",
          total_balance_sum: { $sum: "$total_balance" },
        }
      },
      { $sort: { total_balance_sum: -1 } },
      { $limit: 1 },
    ]);

    const globalMaxAmount = maxAmountResult[0]?.total_balance_sum || 0;
      // Format data for DataTables
      const formattedData = data.map((item) => {
        // Status mapping for frontend
        let frontendStatus = "completed";
        if (item.status === "active") frontendStatus = "active";
        if (item.status === "waiting") frontendStatus = "pending";

        return {
          _id: item._id,
          sirket_id: item.sirket._id.toString(), // Convert ObjectId to string for navigation
          company_name: item.sirket.sirket_name,
          company_id: item.sirket.sirket_id,
          company_logo: item.sirket.logo || "/images/default-company-logo.png",
          balance_id: item.balance_id?.toString() || "", // Convert ObjectId to string
          invoice_number:
            item.balance_info?.invoice_number ||
            (item.balance_id
              ? `${item.balance_id.toString().toUpperCase()}`
              : ""), // Generate BINV format if no specific invoice number
          card_count: item.cards?.length ?? 0, // Individual record, so card count is always 1
          amount: item.total_balance,
          formatted_amount: item.total_balance.toFixed(2),
          date: item.createdAt,
          formatted_date: new Date(item.createdAt).toLocaleDateString("az-AZ"),
          status: frontendStatus,
        };
      });

      // Statistikalar üçün separate aggregation
      const statsData = await AddedBalance.aggregate([
        {
          $lookup: {
            from: "sirkets",
            localField: "sirket_id",
            foreignField: "balance_id",
            as: "sirket",
          },
        },
        {
          $unwind: "$sirket",
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$total_balance" },
            activeCount: {
              $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
            },
            waitingCount: {
              $sum: { $cond: [{ $eq: ["$status", "waiting"] }, 1, 0] },
            },
            completedCount: {
              $sum: { $cond: [{ $eq: ["$status", "complated"] }, 1, 0] },
            },
          },
        },
      ]);

      const statistics = statsData[0] || {
        activeCount: 0,
        waitingCount: 0,
        completedCount: 0,
        totalAmount: 0,
      };

      console.log("📊 Statistics:", statistics);
      console.log("📋 Formatted data sample:", formattedData.slice(0, 2));
      console.log("🔑 Sirket ID for navigation:", formattedData[0]?.sirket_id);

      return res.json({
        draw: parseInt(draw),
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        data: formattedData,
        globalMaxAmount,
        statistics: {
          activeCompanies: statistics.activeCount, // Now refers to individual records with active status
          pendingCompanies: statistics.waitingCount, // Now refers to individual records with waiting status
          completedCompanies: statistics.completedCount, // Now refers to individual records with completed status
          totalAmount: statistics.totalAmount,
        },
      });
    } catch (error) {
      console.error("Get companies data error:", error);
      return res.status(500).json({ error: "Məlumatlar yüklənərkən xəta baş verdi" });
    }
  }

  // Şirkətin kartları səhifəsi
  async showCompanyCardsPage(req, res) {
    try {
      const { companyId } = req.params;
      console.log("🔥 showCompanyCardsPage called for company:", companyId);
      const balance = await AddCardBalance.findOne({ balance_id: companyId });
      // if (!balance) return res.redirect('/');
      // Get company data from AddedBalance - find any record for this company
      const companyBalance = await AddedBalance.findOne({
        balance_id: balance._id,
        deletedAt: { $exists: false },
      })
        .populate("sirket_id")
        .populate("card_id");

      if (!companyBalance) {
        console.log("❌ No balance data found for company:", companyId);

        // Try to get company data directly from Sirket model
        const company = await Sirket.findById(companyId);

        if (!company) {
          console.log("❌ Company not found in Sirket model:", companyId);
          return res.status(404).json({
            success: false,
            message: "Şirkət məlumatları tapılmadı",
          });
        }

        // Render page with basic company info and no balance data
        const basicCompanyData = {
          _id: companyId,
          name: company.sirket_name || "Unknown Company",
          id: company.sirket_id || companyId,
          invoice_number: balance.balance_id,
          card_count: 0,
          amount: 0,
          formatted_amount: "0.00",
          date: company.createdAt,
          formatted_date: company.createdAt
            ? new Date(company.createdAt).toLocaleDateString("az-AZ")
            : "",
          status: "active",
          logo: company.logo || "/images/default-company-logo.png",
        };

        return res.render("pages/emeliyyatlar/sirket/kartlari", {
          title: "işçilərin balansı",
          csrfToken: req.csrfToken(),
          user: req.user,
          company: basicCompanyData,
        });
      }

      // Calculate statistics for this company
      const statsData = await AddedBalance.aggregate([
        {
          $match: {
            balance_id: balance._id,
            deletedAt: { $exists: false },
          },
        },
        {
          $group: {
            _id: null,
            totalCards: { $sum: 1 },
            totalAmount: { $sum: "$total_balance" },
          },
        },
      ]);

      const statistics = statsData[0] || { totalCards: 0, totalAmount: 0 };

      // Format company data for the view
      const company = {
        _id: companyId,
        name: companyBalance.sirket_id?.sirket_name || "Unknown Company",
        id: companyBalance.sirket_id?.sirket_id || companyId,
        invoice_number: companyBalance.balance_id || "",
        card_count: balance.cards?.length ?? 0,
        amount: statistics.totalAmount,
        formatted_amount: statistics.totalAmount.toLocaleString("az-AZ", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        date: balance.createdAt,
        formatted_date: balance.createdAt
          ? new Date(balance.createdAt).toLocaleDateString("az-AZ")
          : "",
        status: balance.status || "active",
        logo:
          companyBalance.sirket_id?.profile_image_path || "/images/default-company-logo.png",
      };
      const cards = await Cards.find();
      console.log("✅ Company data prepared:", company);

      return res.render("pages/emeliyyatlar/sirket/kartlari", {
        title: "İşçilərin balansı",
        csrfToken: req.csrfToken(),
        user: req.user,
        company: company,
        cards
      });
    } catch (error) {
      console.error("Company cards page error:", error);
      return res.status(500).render("error", {
        message: "Səhifə yüklənərkən xəta baş verdi",
        error: error,
      });
    }
  }

  // Şirkət kartlarının data-sı
  async getCompanyCardsData(req, res) {
    try {
      const { companyId } = req.params;
      const { draw, start, length, card_category = [], search, min, max } = req.body;

      const balance = await AddCardBalance.findOne({ balance_id: companyId });
      if (!balance) return res.status(404).json({ error: "Şirkət tapılmadı" });

      const startIndex = parseInt(start) || 0;
      const pageLength = parseInt(length) || 10;

      // AddedBalance filtreleri
      const matchFilter = { balance_id: balance._id, deletedAt: { $exists: false } };

      // Pipeline
      const pipeline = [
        { $match: matchFilter },
        {
          $group: {
            _id: "$card_id",
            employee_count: { $sum: 1 },
            total_amount: { $sum: "$total_balance" },
            last_date: { $max: "$createdAt" },
          }
        },
        {
          $lookup: {
            from: "cards",
            localField: "_id",
            foreignField: "_id",
            as: "card",
          }
        },
        { $unwind: { path: "$card", preserveNullAndEmptyArrays: true } },
      ];

      if (Array.isArray(card_category) && card_category.length > 0) {
        const validCategoryIds = card_category.filter(id => mongoose.Types.ObjectId.isValid(id));
        if (validCategoryIds.length > 0) {
          pipeline.push({ $match: { "card._id": { $in: validCategoryIds.map(id => new mongoose.Types.ObjectId(id)) } } });
        }
      }

      if (max !== undefined) {
        pipeline.push({
          $match: {
            total_amount: {
              ...(min !== undefined ? { $gte: parseFloat(min) } : {}),
              ...(max !== undefined ? { $lte: parseFloat(max) } : {}),
            }
          }
        });
      }

      // search filtresi card.name veya card.description üzerinde
      if (search) {
        pipeline.push({
          $match: {
            $or: [
              { "card.name": { $regex: search, $options: "i" } },
              { "card.description": { $regex: search, $options: "i" } },
            ]
          }
        });
      }

      // Toplam kayıt sayısı için pipeline
      const countPipeline = [...pipeline, { $count: "total" }];

      // Sort ve pagination
      pipeline.push(
        { $sort: { "card.name": 1 } },
        { $skip: startIndex },
        { $limit: pageLength }
      );

      // Parallel olarak aggregation çalıştır
      const [cardsData, countResult] = await Promise.all([
        AddedBalance.aggregate(pipeline),
        AddedBalance.aggregate(countPipeline),
      ]);

      const totalRecords = countResult[0]?.total || 0;

      const maxAmountResult = await AddedBalance.aggregate([
        { $match: { balance_id: balance._id, deletedAt: { $exists: false } } },
        {
          $group: {
            _id: "$card_id",
            total_balance_sum: { $sum: "$total_balance" },
          }
        },
        { $sort: { total_balance_sum: -1 } },
        { $limit: 1 } // sadece en yüksek toplamı al
      ]);

      const maxAmount = maxAmountResult[0]?.total_balance_sum || 0;

      const formattedData = cardsData.map(card => ({
        _id: card._id,
        card_name: card.card?.name || "Bilinməyən Kart",
        card_description: card.card?.description || "",
        card_background_color: card.card?.background_color || "#9B59B6",
        card_icon: card.card?.icon || "stratis-credit-card-01",
        category: card.card?.category || "Digər",
        employee_count: card.employee_count || 0,
        amount: card.total_amount || 0,
        date: card.last_date
          ? new Date(card.last_date).toLocaleString("az-AZ", {
              day: "2-digit", month: "2-digit", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            })
          : "",
        formatted_amount: (card.total_amount || 0).toLocaleString("az-AZ", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      }));

      return res.json({
        draw: parseInt(draw),
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        data: formattedData,
        maxAmount
      });

    } catch (error) {
      console.error("getCompanyCardsData error:", error);
      return res.status(500).json({ error: "Məlumatlar yüklənərkən xəta baş verdi" });
    }
  }

  // Kartın işçiləri səhifəsi
  async showCardEmployeesPage(req, res) {
    try {
      const { companyId,cardId } = req.params;
      if(!cardId || !companyId || cardId === 'null' || companyId === 'null') return res.redirect('/');
      // First, try to find the card info from Cards model

      const balance = await AddCardBalance.findOne({ balance_id: companyId}).populate({ path: "sirket_id", select: "sirket_id sirket_name"});
      if(!balance) return res.redirect("/");
      // Now find related balance records using card_id
      const relatedBalances = await AddedBalance.find({
        card_id: cardId,
        balance_id: balance._id,
        deletedAt: { $exists: false },
      })
        .populate("card_id");
      const card = await Cards.findById(cardId);
      const cards = await ImtiyazQruplari.find({sirket_id : balance.sirket_id?._id});

      if (!card && relatedBalances.length === 0) {
        console.log("❌ Neither card nor balance data found for:", cardId);
        return res.redirect("/");
      }

      // Calculate statistics from balance records
      const totalAmount = relatedBalances.reduce(
        (sum, balance) => sum + (balance.total_balance || 0),
        0
      );
      const employeeCount = relatedBalances.length; // Each balance record represents an employee/instance
      const rawDate = card?.createdAt || relatedBalances[0]?.createdAt;
      const date = rawDate ? new Date(rawDate) : null;

      const formatDate = (d) => {
        const pad = (n) => String(n).padStart(2, "0");
        return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      };

      const formatted = date ? formatDate(date) : null;
      // Prepare card data for the view
      const cardData = {
        _id: cardId,
        category: card?.category?.name || card?.name || "Digər",
        name: card?.name || "Digər",
        employee_count: employeeCount,
        amount: totalAmount,
        date: formatted,
        company_id: balance?.sirket_id?._id || relatedBalances[0]?.sirket_id?._id,
        card_id: cardId,
        companyId
      };

      console.log("✅ Card data prepared:", cardData);

      return res.render("pages/emeliyyatlar/sirket/kartIscileri", {
        title: "İşçilərin balansı",
        csrfToken: req.csrfToken(),
        user: req.user,
        card: cardData,
        cards: cards,
      });
    } catch (error) {
      console.error("❌ Card employees page error:", error);
      console.error("❌ Error stack:", error.stack);
      return res.status(500).json({
        success: false,
        message: "Səhifə yüklənərkən xəta baş verdi",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Server error",
      });
    }
  }

  // Kart işçilərinin data-sı (userlərə görə qruplandırılmış)
  async getCardEmployeesData(req, res) {
    try {
      const { companyId, cardId } = req.params;
      const {
        draw,
        start,
        length,
        search,
        min,
        max,
        jobGroups = [],
        startDate,
        endDate,
      } = req.body;

      if (!cardId || !companyId || cardId === "null" || companyId === "null") {
        return res.redirect("/");
      }

      const balance = await AddCardBalance.findOne({ balance_id: companyId });
      if (!balance) return res.redirect("/");

      // Base filter
      const filter = {
        card_id: cardId,
        balance_id: balance._id,
        deletedAt: { $exists: false },
      };

      // JobGroups filter (imtiyaz_id)
      if (Array.isArray(jobGroups) && jobGroups.length > 0) {
        const validIds = jobGroups.filter((id) => mongoose.Types.ObjectId.isValid(id));
        if (validIds.length > 0) {
          filter.imtiyaz_id = { $in: validIds };
        }
      }

      // Date filter (MongoDB query seviyesinde)
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
      }

      // Get records
      const balanceRecords = await AddedBalance.find(filter)
        .populate("card_id")
        .populate("imtiyaz_id")
        .populate({
          path: "user_id",
          select: "name surname people_id duty sirket_id",
          populate: { path: "duty", select: "name" },
        })
        .populate({
          path: "sirket_id",
          select: "sirket_id sirket_name",
        });

      if (balanceRecords.length === 0) {
        return res.json({
          draw: parseInt(draw) || 1,
          recordsTotal: 0,
          recordsFiltered: 0,
          data: [],
        });
      }

      const globalMaxAmount = Math.max(
        ...balanceRecords.map((r) => r.total_balance || 0)
      );

      // Group by company (sirket_id)
      const userGroups = {};
      balanceRecords.forEach((record) => {
        const userId = record.sirket_id?._id?.toString();
        if (!userId) return;

        if (!userGroups[userId]) {
          userGroups[userId] = {
            _id: userId,
            sirket: record.sirket_id,
            user: record.user_id,
            imtiyaz: record.imtiyaz_id,
            total_balance: 0,
            card_count: 0,
            latest_date: record.createdAt,
            statuses: [],
          };
        }

        userGroups[userId].total_balance += record.total_balance || 0;
        userGroups[userId].card_count += 1;
        userGroups[userId].statuses.push(record.status);

        if (record.createdAt > userGroups[userId].latest_date) {
          userGroups[userId].latest_date = record.createdAt;
        }
      });

      // Convert to array
      let employeeRecords = Object.values(userGroups);

      // Search filter (frontend search text)
      if (search) {
        employeeRecords = employeeRecords.filter((record) => {
          return (
            record.sirket?.sirket_name
              ?.toLowerCase()
              .includes(search.toLowerCase()) ||
            record.sirket?.sirket_id
              ?.toLowerCase()
              .includes(search.toLowerCase()) ||
            record.user?.name
              ?.toLowerCase()
              .includes(search.toLowerCase()) ||
            record.user?.surname
              ?.toLowerCase()
              .includes(search.toLowerCase()) ||
            record.user?.people_id
              ?.toLowerCase()
              .includes(search.toLowerCase())
          );
        });
      }

      // Amount filter (frontend)
      if (min || max) {
        employeeRecords = employeeRecords.filter((record) => {
          const amount = record.total_balance || 0;
          if (min && amount < parseFloat(min)) return false;
          if (max && amount > parseFloat(max)) return false;
          return true;
        });
      }

      const totalRecords = employeeRecords.length;

      // Sort by balance
      employeeRecords.sort(
        (a, b) => (b.total_balance || 0) - (a.total_balance || 0)
      );

      // Pagination
      const startIndex = parseInt(start) || 0;
      const pageLength = parseInt(length) || 10;
      employeeRecords = employeeRecords.slice(startIndex, startIndex + pageLength);

      // Format date helper
      const formatDate = (d) => {
        const pad = (n) => String(n).padStart(2, "0");
        return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(
          d.getHours()
        )}:${pad(d.getMinutes())}`;
      };

      // Final data
      const formattedData = employeeRecords.map((record, index) => {
        const employeeId = record.sirket?.sirket_id || `USR-${record._id}`;
        const employeeName = record.sirket?.sirket_name || `User ${index + 1}`;

        let position = record.user?.duty?.name ?? "Staff";
        let positionGroup = record.imtiyaz?.name ?? "-";

        let status = "active";
        if (record.statuses?.includes("waiting")) status = "waiting";
        else if (record.statuses?.includes("inactive")) status = "inactive";

        return {
          _id: record._id,
          employee_id: employeeId.toString().slice(-10),
          employee_name: employeeName,
          user_id: record.user?.people_id,
          user_name: record.user ? `${record.user.name} ${record.user.surname}` : null,
          position,
          position_group: positionGroup,
          amount: record.total_balance || 0,
          formatted_amount: (record.total_balance || 0).toLocaleString("az-AZ", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          date: record.latest_date,
          formatted_date: record.latest_date
            ? formatDate(new Date(record.latest_date))
            : null,
          status,
          card_count: record.card_count || 1,
          companyId,
        };
      });

      return res.json({
        draw: parseInt(draw) || 1,
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        data: formattedData,
        globalMaxAmount,
      });
    } catch (error) {
      console.error("❌ Get card employees data error:", error);
      return res
        .status(500)
        .json({ error: "Məlumatlar yüklənərkən xəta baş verdi" });
    }
  }


  // Helper method to get basic company info from Sirket model
  async getBasicCompanyInfo(companyId) {
    try {
      const company = await Sirket.findById(companyId);
      if (!company) {
        return {
          id: companyId,
          name: "Unknown Company",
          invoice_number: "",
          formatted_date: "",
          status: "active",
        };
      }

      return {
        id: company.sirket_id || companyId,
        name: company.sirket_name || "Unknown Company",
        invoice_number: "",
        formatted_date: company.createdAt
          ? new Date(company.createdAt).toLocaleDateString("az-AZ")
          : "",
        status: "active",
      };
    } catch (error) {
      console.error("Error getting basic company info:", error);
      return {
        id: companyId,
        name: "Unknown Company",
        invoice_number: "",
        formatted_date: "",
        status: "active",
      };
    }
  }
}

export default new SirketIscilerController();
