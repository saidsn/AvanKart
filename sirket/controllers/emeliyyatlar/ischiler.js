import PeopleUser from "../../../shared/models/peopleUserModel.js";
import Sirket from "../../../shared/models/sirketModel.js";
import AddedBalance from "../../../shared/model/people/addedBalances.js";
import i18n from "i18n";
import AddCardBalance from "../../../shared/model/people/addBalances.js";
import Cards from "../../../shared/models/cardModel.js";
import mongoose from "mongoose";
import ImtiyazQruplari from "../../../shared/model/people/imtiyazQruplari.js";
import SirketDuty from "../../../shared/models/Sirketduties.js";
import TransactionsUser from "../../../shared/models/transactionsModel.js";
import InvitePeople from "../../../shared/model/people/invitePeopleModel.js";
import PeopleCardBalance from "../../../shared/model/people/cardBalances.js";

export const balancePage = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await PeopleUser.findById(userId).select("sirket_id");

    if (!user || !user.sirket_id) {
      return res.status(400).json({
        success: false,
        message: "İstifadəçi və ya şirkət tapılmadı",
      });
    }

    const sirketId = user.sirket_id;

    const sirket = await Sirket.findById(sirketId).select("createdAt");
    if (!sirket) {
      return res.status(400).json({
        success: false,
        message: "Şirkət tapılmadı",
      });
    }
    const isciCount = await PeopleUser.countDocuments({ sirket_id: sirketId });

    const sirketCreationYear = new Date(sirket.createdAt).getFullYear();
    const currentYear = new Date().getFullYear();

    const balanceData = await AddCardBalance.aggregate([
      {
        $match: {
          sirket_id: sirketId,
          deletedAt: { $exists: false }, // soft delete check
          // "otp.accepted": true, //changed  yalnız OTP-si təsdiqlənənlər
        },
      },
      {
        $facet: {
          // Compute normalized status buckets and totals in a single group
          statusCounts: [
            {
              $group: {
                _id: null,
                // Use only enum values from AddCardBalance: active, passive, canceled, waiting, reported, completed, complated
                activeCount: {
                  $sum: {
                    $cond: [
                      { $in: ["$status", ["active"]] },
                      1,
                      0,
                    ],
                  },
                },
                // Passive / Waiting: treat both 'passive' and 'waiting' as waiting-type
                passiveCount: {
                  $sum: {
                    $cond: [
                      { $in: ["$status", ["passive", "waiting"]] },
                      1,
                      0,
                    ],
                  },
                },
                // Completed: include both spellings
                completedCount: {
                  $sum: {
                    $cond: [
                      { $in: ["$status", ["completed", "complated"]] },
                      1,
                      0,
                    ],
                  },
                },
                // canceled and reported are treated as other/terminal statuses
                otherCount: {
                  $sum: {
                    $cond: [
                      { $in: ["$status", ["canceled", "reported"]] },
                      1,
                      0,
                    ],
                  },
                },
                // totalBalance and maxBalance should ignore nulls
                totalBalance: { $sum: { $ifNull: ["$total_balance", 0] } },
                totalCount: { $sum: 1 },
                maxBalance: { $max: { $ifNull: ["$total_balance", 0] } },
              },
            },
          ],
          // İl və aylara görə qruplama
          yearlyData: [
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" },
                },
                count: { $sum: 1 },
              },
            },
          ],
          totalStats: [
            {
              $group: {
                _id: null,
                totalBalance: { $sum: { $ifNull: ["$total_balance", 0] } },
                totalCount: { $sum: 1 },
              },
            },
          ],
          cards: [
            { $unwind: "$cards" },
            {
              $lookup: {
                from: "cards",
                localField: "cards.card_id",
                foreignField: "_id",
                as: "cardInfo",
              },
            },
            { $unwind: "$cardInfo" },
            {
              $group: {
                _id: "$cardInfo._id",
                name: { $first: "$cardInfo.name" },
              },
            },
            {
              $project: {
                _id: 0,
                name: 1,
              },
            },
          ],
        },
      },
    ]);


    const { statusCounts, yearlyData, totalStats } = balanceData[0];

    const statusAgg = (statusCounts && statusCounts[0]) || {};

    const active_count = statusAgg.activeCount || 0;
    const passive_count = statusAgg.passiveCount || 0;
    const completed_count = statusAgg.completedCount || 0;
    // totalBalance from the status aggregation (sums all matched docs)
    const totalBalance = (statusAgg.totalBalance !== undefined && statusAgg.totalBalance !== null)
      ? statusAgg.totalBalance
      : totalStats[0]?.totalBalance || 0;

    // maxBalance fallback
    const maxBalance = (statusAgg.maxBalance !== undefined && statusAgg.maxBalance !== null)
      ? statusAgg.maxBalance
      : 0;

    const qovluq = [];

    for (let year = currentYear; sirketCreationYear <= year; year--) {
      const monthlyData = {
        january: 0,
        february: 0,
        march: 0,
        april: 0,
        may: 0,
        june: 0,
        july: 0,
        august: 0,
        september: 0,
        october: 0,
        november: 0,
        december: 0,
      };

      let yearTotal = 0;

      yearlyData.forEach((data) => {
        if (data._id.year === year) {
          const monthNames = [
            "january",
            "february",
            "march",
            "april",
            "may",
            "june",
            "july",
            "august",
            "september",
            "october",
            "november",
            "december",
          ];

          const monthName = monthNames[data._id.month - 1];
          monthlyData[monthName] = data.count;
          yearTotal += data.count;
        }
      });

      qovluq.push({
        year: year,
        total: yearTotal,
        months: monthlyData,
      });
    }
    console.log(qovluq)
    const response = {
      success: true,
      data: {
        summary: {
          active_count,
          passive_count,
          completed_count,
          totalBalance: totalBalance || 0,
          maxBalance,
        },
        qovluq,
        isciCount,
        meta: {
          sirket_creation_year: sirketCreationYear,
          current_year: currentYear,
          total_records: totalStats[0]?.totalCount || 0,
        },
      },
      csrfToken: req.csrfToken(),
    };

    return res.render("pages/emeliyyatlar/isciler.ejs", response);
  } catch (error) {
    console.error("Balance page error:", error);
    return res.status(500).json({
      success: false,
      message: "Server xətası baş verdi",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const isciBalance = async (req, res) => {
  try {
    const { balance_id, card_id } = req.params;

    const records = await AddedBalance.find({ balance_id, card_id }).populate(
      "card_id"
    );


    if (!records.length) return res.status(404).send("Data not found.");

    const total_added_balance = records.reduce(
      (sum, r) => sum + r.added_balance,
      0
    );
    const total_users = records.length;

    const data = {
      card_name: records[0].card_id.name,
      total_users,
      added_balance: total_added_balance,
      balance_id,
      card_id,
      created_at: records[0].createdAt,
    };
    res.render("pages/emeliyyatlar/isci/users", { data: [data],csrfToken: req.csrfToken() });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error.");
  }
};

export const balanceTable = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      min,
      max,
      start_date,
      end_date,
      statuses = [],
      search,
      start = 0,
      length = 10,
      draw,
      year,
      month
    } = req.body;

    const user = await PeopleUser.findById(userId).select("sirket_id");
    if (!user || !user.sirket_id) {
      return res.status(400).json({
        success: false,
        message: "İstifadəçi və ya şirkət tapılmadı",
      });
    }

    const sirketId = user.sirket_id;

    let matchQuery = { sirket_id: sirketId };

    if (year && month) {
      // const [year, month] = specialFilter.split("-");
      const monthNames = {
        january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
        july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
      };
      const monthIndex = monthNames[month.toLowerCase()];
      matchQuery.createdAt = {
        $gte: new Date(parseInt(year), monthIndex, 1),
        $lte: new Date(parseInt(year), monthIndex + 1, 0, 23, 59, 59),
      };
    } else if (start_date || end_date) {
      matchQuery.createdAt = {};
      if (start_date) matchQuery.createdAt.$gte = new Date(start_date);
      if (end_date) matchQuery.createdAt.$lte = new Date(end_date);
    }

    if (min !== undefined || max !== undefined) {
      matchQuery.total_balance = {};
      if (min !== undefined) matchQuery.total_balance.$gte = parseFloat(min);
      if (max !== undefined) matchQuery.total_balance.$lte = parseFloat(max);
    }

    if (statuses.length > 0) {
      matchQuery.status = { $in: statuses };
    }

    let pipeline = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "cards",
          localField: "card_id",
          foreignField: "_id",
          as: "card",
        },
      },
      { $unwind: { path: "$card", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "peopleusers",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
        },
      },
        {
    $match: {
      "cards.0": { $exists: true }  // ilk element varsa, sənəd qalır
    }
  },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    ];

    if (search && search.trim()) {
      pipeline.push({
        $match: {
          $or: [
            { "balance_id": { $regex: search, $options: "i" } },
            { status: { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    const totalPipeline = [...pipeline, { $count: "total" }];
    const totalResult = await AddCardBalance.aggregate(totalPipeline);
    const recordsTotal = totalResult[0]?.total || 0;
    const recordsFiltered = recordsTotal;

    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: parseInt(start) },
      { $limit: parseInt(length) },
      {
        $project: {
          id: "$_id",
          balance_id: 1,
          cards: { $ifNull: [{ $map: { input: "$cards", as: "c", in: "$$c.card_id" } }, []] },
          added_balance: 1,
          total_balance: { $ifNull: ["$total_balance", "$added_balance"] },
          status: 1,
          createdAt: 1,
        },
      }
    );

    const data = await AddCardBalance.aggregate(pipeline);
   

    const statusMap = {
      qaralama: res.__('hesablasmalar.status_list.qaralama'),
      waiting: res.__('hesablasmalar.status_list.wait'),
      waiting_aktiv: res.__('hesablasmalar.status_list.wait'),
      waiting_tamamlandi: res.__('hesablasmalar.status_list.wait'),
      aktiv: res.__('hesablasmalar.status_list.aktiv'),
      active: res.__('hesablasmalar.status_list.aktiv'),
      reported: res.__('hesablasmalar.status_list.reported'),
      tamamlandi: res.__('hesablasmalar.status_list.tamamlandi'),
      complated: res.__('hesablasmalar.status_list.tamamlandi'),
      completed: res.__('hesablasmalar.status_list.tamamlandi'),
    };

    const formattedData = data.map(item => ({
      ...item,
      statusName: statusMap[item.status] || item.status,
    }));

  

    return res.json({
      data: formattedData,
      recordsFiltered,
      recordsTotal,
      draw: parseInt(draw) || 1,
    });

  } catch (error) {
    console.error("Balance table error:", error);
    return res.status(500).json({
      success: false,
      message: "Server xətası",
    });
  }
};

export const sendToAvankart = async (req, res) => {
  try {
    const { invoice } = req.body;

    const balance = await AddCardBalance.findOne({ 
      balance_id: invoice, 
      status: { $in: ["active", "waiting"] } 
    });
    
    const myUser = await PeopleUser.findById(req.user.id);
    
    if (!balance || !myUser) {
      return res.json({ success: false, error: "Invoice not found" });
    }

    const mySirket = await Sirket.findById(myUser.sirket_id);
    
    if (!mySirket) {
      return res.json({ success: false, error: "Şirkət tapılmadı" });
    }

    // Şirkət ID-lərini yoxla
    if (balance.sirket_id.toString() !== myUser.sirket_id.toString()) {
      return res.json({ success: false, error: "Bu əməliyyatı icra etmək üçün səlahiyyətiniz yoxdur" });
    }

    // Status "active" isə "waiting"-ə çevir
    if (balance.status === "active") {
      balance.status = "waiting";
      await balance.save();
      return res.json({ success: true, message: "Invoice gözləmə vəziyyətinə keçdi" });
    }

    // Status "waiting" isə əməliyyatları tamamla
    if (balance.status === "waiting") {
      // Şirkət balansını yoxla
      if (mySirket.sirket_balance < balance.total_balance) {
        return res.json({ success: false, message: "Balans kifayət qədər deyil" });
      }

      // Bu balans əməliyyatına aid olan istifadəçiləri tap
      const upUsers = await AddedBalance.find({ balance_id: balance._id });

      if (!upUsers || upUsers.length === 0) {
        return res.json({ success: false, error: "Bu əməliyyat üçün istifadəçi tapılmadı" });
      }

      // Hər bir istifadəçiyə balans əlavə et
      for (const addedBalance of upUsers) {
        const userId = addedBalance.user_id;
        
        if (!userId) continue;

        // İstifadəçinin kart balansını tap və ya yarat
        let cardBalance = await PeopleCardBalance.findOne({
          user_id: userId, 
          sirket_id: myUser.sirket_id, 
          card_id: addedBalance.card_id
        });

        if (cardBalance) {
          // Mövcud balansı yenilə
          cardBalance.last_balance = Number(cardBalance.balance);
          cardBalance.balance = (cardBalance.balance || 0) + addedBalance.added_balance;
          cardBalance.added_balance = Number(addedBalance.added_balance);
          await cardBalance.save();
        } else if(addedBalance.card_id){
          // Yeni kart balansı yarat
          cardBalance = new PeopleCardBalance({
            user_id: userId,
            sirket_id: myUser.sirket_id,
            card_id: addedBalance.card_id,
            // perm_id: addedBalance.perm_id,
            // imtiyaz_id: addedBalance.imtiyaz_id,
            last_balance: 0,
            balance: Number(addedBalance.added_balance),
            // added_balance: Number(addedBalance.added_balance),
            status: "active"
          });
          await cardBalance.save();
        }else{
          continue;
        }

        // İstifadəçinin ümumi balansını yenilə
        const user = await PeopleUser.findById(userId);
        if (user) {
          user.totalBalance += addedBalance.added_balance;
          user.lastPaymentDate = new Date();
          await user.save();
        }

        // AddedBalance status-u yenilə
        addedBalance.status = "complated";
        await addedBalance.save();
      }

      // Şirkətin balansını azalt
      mySirket.sirket_balance -= balance.total_balance;
      await mySirket.save();

      // Balance status-nu "completed" et
      balance.status = "complated";
      await balance.save();

      return res.json({ 
        success: true, 
        message: "Balans uğurla köçürüldü",
        affected_users: upUsers.length,
        total_amount: balance.total_balance
      });
    }

    // Digər status-lar üçün
    return res.json({ 
      success: false, 
      error: "Əməliyyat yalnız 'active' və ya 'waiting' statusda icra oluna bilər" 
    });

  } catch (error) {
    console.error("sendToAvankart error:", error);
    return res.status(500).json({
      success: false,
      error: "Serverdə xəta baş verdi",
    });
  }
};

export const deleteBalance = async (req, res) => {
  try {
    const { invoice } = req.body;

    const balance = await AddCardBalance.findOne({ balance_id: invoice });
    const myUser = await PeopleUser.findById(req.user.id);

    if (!balance) {
      return res.json({ success: false, error: "Invoice not found" });
    }

    if (balance.status !== "active" || balance.sirket_id.toString() !== myUser.sirket_id.toString()) {
      return res.json({ success: false, error: "Silmək mümkün olmadı" });
    }

    await AddCardBalance.deleteOne({ balance_id: invoice });

    return res.json({ success: true, message: "Invoice silindi" });
  } catch (error) {
    console.error("sendToAvankart error:", error);
    return res.status(500).json({
      success: false,
      error: "Serverdə xəta baş verdi",
    });
  }
}

export const imtiyazUsersPage = async (req, res) => {
  try {
    const { id } = req.params;

    const imtiyaz = await ImtiyazQruplari.findById(id);
    const myUser = await PeopleUser.findById(req.user.id);

    if (!myUser || !imtiyaz) {
      return res.redirect('/people/avankart-people');
    }

    return res.render('pages/isciler/imtiyazUsers.ejs',{ myUser, data: imtiyaz, title: res.__('isciler.isciler'),csrfToken: req.csrfToken() });
  } catch (error) {
    console.error("sendToAvankart error:", error);
    return res.status(500).json({
      success: false,
      error: "Serverdə xəta baş verdi",
    });
  }
};

export const dutyUsersPage = async (req, res) => {
  try {
    const { id } = req.params;

    const duty = await SirketDuty.findById(id);
    const myUser = await PeopleUser.findById(req.user.id);

    if (!myUser || !duty) {
      return res.redirect('/people/avankart-people');
    }

    return res.render('pages/isciler/dutyUsers.ejs',{ myUser, data:duty, title: res.__('isciler.isciler'),csrfToken: req.csrfToken() });
  } catch (error) {
    console.error("sendToAvankart error:", error);
    return res.status(500).json({
      success: false,
      error: "Serverdə xəta baş verdi",
    });
  }
};

export const userDetailsPage = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await PeopleUser.findOne({people_id: id});
    const myUser = await PeopleUser.findById(req.user.id);

    if (!myUser || !user || myUser.sirket_id?.toString() != user.sirket_id?.toString()) {
      console.log(myUser.sirket_id +" ============== "+ user.sirket_id)
      return res.redirect('/people/avankart-people');
    }

    return res.render('pages/isciler/insideUser.ejs',{ myUser, user, title: res.__('isciler.isciler'), csrfToken: req.csrfToken()});
  } catch (error) {
    console.error("sendToAvankart error:", error);
    return res.status(500).json({
      success: false,
      error: "Serverdə xəta baş verdi",
    });
  }
};

export const userCardDetails = async (req, res) => {
  const { people_id, searchText = "", page = 1, limit = 10, draw } = req.body;

  try {
    const myUser = await PeopleUser.findById(req.user.id).select("sirket_id");
    if (!myUser) return res.json({ success: false, error: "User not found" });

    const reqUser = await PeopleUser.findOne({
      people_id,
      sirket_id: myUser.sirket_id,
    }).select("_id");

    if (!reqUser) return res.redirect("/people/avankart-people");

    const query = { from: reqUser._id };

    // Arama varsa filtrele
    if (searchText ) {
      query.$or = [
        // { amount: { $regex: search, $options: "i" } },
        { "cards.name": { $regex: searchText, $options: "i" } },
      ];
    }

    const totalRecords = await TransactionsUser.countDocuments(query);

    const transactions = await TransactionsUser.find(query)
      .populate("cards", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const data = transactions.map((tr) => ({
      card_name: tr.cards?.name ?? "Undefined",
      amount: tr.amount ?? 0,
      date: tr.createdAt,
    }));

    return res.json({
      draw,
      recordsTotal: totalRecords,
      recordsFiltered: totalRecords,
      data,
    });
  } catch (err) {
    console.error("Kartlar error:", err);
    return res.json({ success: false, error: "Server error" });
  }
};

export const imtiyazDetails = async (req, res) => {
  try {
    const {
      imtiyaz_id = null,
      searchText = null,
      start_date,
      end_date,
      draw = 1,
      start = 0,
      length = 10,
      gender = ["male", "female"],
      category = "current",
      users = [],
    } = req.body;

    const currentUser = await PeopleUser.findById(req.user?.id);
    if (!currentUser) {
      return res
        .status(401)
        .json({ message: res.__("messages.avankartPartner.unauthorized") });
    }

    let usersCount = 0;
    let userList = [];
    let invitedList = [];

    if (category === "old") {
      const query = {
        sirket_id: currentUser.sirket_id,
        ...(searchText && {
          $or: [
            { name: { $regex: searchText, $options: "i" } },
            { surname: { $regex: searchText, $options: "i" } },
            { email: { $regex: searchText, $options: "i" } },
            { people_id: { $regex: searchText, $options: "i" } },
            {
              $expr: {
                $regexMatch: {
                  input: { $concat: ["$surname", " ", "$name"] },
                  regex: searchText,
                  options: "i",
                },
              },
            },
          ],
        }),
        ...(start_date && { hire_date: { $gte: new Date(start_date) } }),
        ...(end_date && { dismissal_date: { $lte: new Date(end_date) } }),
        gender: { $in: gender },
        ...(users.length > 0 && { _id: { $in: users } }),
      };

      usersCount = await OldSirketUser.countDocuments(query);
      userList = await OldSirketUser.find(query)
        .limit(Number(length))
        .skip(Number(start));
    } else {
      const baseQuery = {
        sirket_id: currentUser.sirket_id,
        imtiyaz: imtiyaz_id,
        ...(searchText && {
          $or: [
            { name: { $regex: searchText, $options: "i" } },
            { surname: { $regex: searchText, $options: "i" } },
            { email: { $regex: searchText, $options: "i" } },
            { people_id: { $regex: searchText, $options: "i" } },
            {
              $expr: {
                $regexMatch: {
                  input: { $concat: ["$name", " ", "$surname"] },
                  regex: search,
                  options: "i",
                },
              },
            },
            {
              $expr: {
                $regexMatch: {
                  input: { $concat: ["$surname", " ", "$name"] },
                  regex: searchText,
                  options: "i",
                },
              },
            },
          ],
        }),
        ...(start_date && { hire_date: { $gte: new Date(start_date) } }),
        ...(end_date && { dismissal_date: { $lte: new Date(end_date) } }),
        gender: { $in: gender },
      };

      const query = {
        ...baseQuery,
        ...(users.length > 0 && { _id: { $in: users } }),
      };

      usersCount = await PeopleUser.countDocuments(query);
      userList = await PeopleUser.find(query)
        .populate("duty", "name")
        .populate("imtiyaz", "name")
        .lean();

      // Update total count
      // usersCount += invitedList.length;
    }

    const formattedUsers = userList.map((user) => ({
      _id: user._id,
      id: user.people_id ?? user._id,
      fullname: `${user.name} ${user.surname ?? ""}`,
      gender: res.__('partials.popup.muessiseEditPopup.'+user.gender),
      email: user.email,
      qrCodeCount: user.total_qr_codes,
      partner_id: user.people_id,
      phoneNumber: `+${user.phone_suffix ?? "994"} ${user.phone}`,
      hireDate: user.hire_date
        ? user.hire_date.toLocaleDateString("az-AZ", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
        : "N/A",
      // dismissalDate: user.dismissal_date
      //   ? user.dismissal_date.toLocaleDateString("az-AZ", {
      //       year: "numeric",
      //       month: "2-digit",
      //       day: "2-digit",
      //     })
      //   : "N/A",
      duty: user.duty?.name || "N/A",
      // permission: user.imtiyaz?.name || "N/A",
      // isInvite: false,
      // sortDate: user.hire_date || user.createdAt, // Sıralama üçün
    }));

    // Combine both lists
    const allUsers = [...formattedUsers];

    // Sort by sortDate (newest first)
    allUsers.sort((a, b) => new Date(b.sortDate) - new Date(a.sortDate));

    // Apply pagination on combined and sorted list
    const paginatedUsers = allUsers.slice(Number(start), Number(start) + Number(length));

    // Remove sortDate from final response
    paginatedUsers.forEach(user => delete user.sortDate);

    return res.status(200).json({
      draw: Number(draw),
      recordsTotal: usersCount,
      recordsFiltered: allUsers.length,
      data: paginatedUsers,
    });
  } catch (err) {
    console.error("peopleTable error:", err);
    return res
      .status(500)
      .json({ message: res.__("messages.avankartPartner.server_error") });
  }
}; 

export const dutyDetails = async (req, res) => {
  try {
    const {
      imtiyaz_id = null,
      searchText = null,
      start_date,
      end_date,
      draw = 1,
      start = 0,
      length = 10,
      gender = ["male", "female"],
      category = "current",
      users = [],
    } = req.body;

    const currentUser = await PeopleUser.findById(req.user?.id);
    if (!currentUser) {
      return res
        .status(401)
        .json({ message: res.__("messages.avankartPartner.unauthorized") });
    }

    let usersCount = 0;
    let userList = [];
    let invitedList = [];

    if (category === "old") {
      const query = {
        sirket_id: currentUser.sirket_id,
        ...(searchText && {
          $or: [
            { name: { $regex: searchText, $options: "i" } },
            { surname: { $regex: searchText, $options: "i" } },
            { email: { $regex: searchText, $options: "i" } },
            { people_id: { $regex: searchText, $options: "i" } },
            {
              $expr: {
                $regexMatch: {
                  input: { $concat: ["$surname", " ", "$name"] },
                  regex: searchText,
                  options: "i",
                },
              },
            },
          ],
        }),
        ...(start_date && { hire_date: { $gte: new Date(start_date) } }),
        ...(end_date && { dismissal_date: { $lte: new Date(end_date) } }),
        gender: { $in: gender },
        ...(users.length > 0 && { _id: { $in: users } }),
      };

      usersCount = await OldSirketUser.countDocuments(query);
      userList = await OldSirketUser.find(query)
        .limit(Number(length))
        .skip(Number(start));
    } else {
      const baseQuery = {
        sirket_id: currentUser.sirket_id,
        duty: imtiyaz_id,
        ...(searchText && {
          $or: [
            { name: { $regex: searchText, $options: "i" } },
            { surname: { $regex: searchText, $options: "i" } },
            { email: { $regex: searchText, $options: "i" } },
            { people_id: { $regex: searchText, $options: "i" } },
            {
              $expr: {
                $regexMatch: {
                  input: { $concat: ["$name", " ", "$surname"] },
                  regex: search,
                  options: "i",
                },
              },
            },
            {
              $expr: {
                $regexMatch: {
                  input: { $concat: ["$surname", " ", "$name"] },
                  regex: searchText,
                  options: "i",
                },
              },
            },
          ],
        }),
        ...(start_date && { hire_date: { $gte: new Date(start_date) } }),
        ...(end_date && { dismissal_date: { $lte: new Date(end_date) } }),
        gender: { $in: gender },
      };

      const query = {
        ...baseQuery,
        ...(users.length > 0 && { _id: { $in: users } }),
      };

      usersCount = await PeopleUser.countDocuments(query);
      userList = await PeopleUser.find(query)
        .populate("duty", "name")
        .populate("imtiyaz", "name")
        .lean();

      // Update total count
      // usersCount += invitedList.length;
    }

    const formattedUsers = userList.map((user) => ({
      _id: user._id,
      id: user.people_id ?? user._id,
      fullname: `${user.name} ${user.surname ?? ""}`,
      gender: res.__('partials.popup.muessiseEditPopup.'+user.gender),
      email: user.email,
      qrCodeCount: user.total_qr_codes,
      partner_id: user.people_id,
      phoneNumber: `+${user.phone_suffix ?? "994"} ${user.phone}`,
      hireDate: user.hire_date
        ? user.hire_date.toLocaleDateString("az-AZ", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
        : "N/A",
      // dismissalDate: user.dismissal_date
      //   ? user.dismissal_date.toLocaleDateString("az-AZ", {
      //       year: "numeric",
      //       month: "2-digit",
      //       day: "2-digit",
      //     })
      //   : "N/A",
      duty: user.imtiyaz?.name || "N/A",
      // permission: user.imtiyaz?.name || "N/A",
      // isInvite: false,
      // sortDate: user.hire_date || user.createdAt, // Sıralama üçün
    }));

    // Combine both lists
    const allUsers = [...formattedUsers];

    // Sort by sortDate (newest first)
    allUsers.sort((a, b) => new Date(b.sortDate) - new Date(a.sortDate));

    // Apply pagination on combined and sorted list
    const paginatedUsers = allUsers.slice(Number(start), Number(start) + Number(length));

    // Remove sortDate from final response
    paginatedUsers.forEach(user => delete user.sortDate);

    return res.status(200).json({
      draw: Number(draw),
      recordsTotal: usersCount,
      recordsFiltered: allUsers.length,
      data: paginatedUsers,
    });
  } catch (err) {
    console.error("peopleTable error:", err);
    return res
      .status(500)
      .json({ message: res.__("messages.avankartPartner.server_error") });
  }
}; 