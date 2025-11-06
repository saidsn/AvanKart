import PeopleUser from "../../shared/models/peopleUserModel.js";
import TransactionsUser from "../../shared/models/transactionsModel.js";
import mongoose from "mongoose";
import Cards from "../../shared/models/cardModel.js";
import OldMuessiseUsers from "../../shared/model/partner/oldMuessiseUsers.js";
import OldSirketUsers from "../../shared/model/people/oldSirketUsers.js";
import Sirket from "../../shared/models/sirketModel.js";
import PeopleCardBalance from "../../shared/model/people/cardBalances.js";
import AddCardBalance from "../../shared/model/people/addBalances.js";
import AddedBalance from "../../shared/model/people/addedBalances.js";

export const getAvankartPartnerPage = (req, res) => {
  return res.render("pages/avankartPartner/partner.ejs", {
    error: "",
    csrfToken: req.csrfToken(),
    layout: "./layouts/main.ejs",
  });
};

export const peopleTable = async (req, res) => {
  try {
    const {
      search = "",
      start_date,
      end_date,
      draw = 1,
      start = 0,
      length = 10,
      gender = ["male", "female"],
      genders,
      category = "current",
      users = [],
    } = req.body;

    const currentUser = await PeopleUser.findById(req.user?.id);
    if (!currentUser) {
      return res
        .status(401)
        .json({ message: res.__("messages.avankartPartner.unauthorized") });
    }

    const genderFilter =
      Array.isArray(genders) && genders.length ? genders : gender;

    if (category === "current") {
      const baseQuery = {
        sirket_id: currentUser.sirket_id,
        ...(search && {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { surname: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { people_id: { $regex: search, $options: "i" } },
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
                  regex: search,
                  options: "i",
                },
              },
            },
          ],
        }),
        ...(start_date && { hire_date: { $gte: new Date(start_date) } }),
        ...(end_date && { dismissal_date: { $lte: new Date(end_date) } }),
        gender: { $in: genderFilter },
      };

      const query = {
        ...baseQuery,
        ...(users.length > 0 && { _id: { $in: users } }),
      };

      const usersCount = await PeopleUser.countDocuments(query);
      const userList = await PeopleUser.find(query)
        .limit(Number(length))
        .skip(Number(start))
        .populate("duty", "name")
        .populate("perm", "name");

      const formattedUsers = userList.map((user) => ({
        id: user.people_id ?? user._id,
        fullname: `${user.name} ${user.surname ?? ""}`.trim(),
        gender: user.gender,
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
        dismissalDate: user.dismissal_date
          ? user.dismissal_date.toLocaleDateString("az-AZ", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })
          : "N/A",
        duty: user.duty?.name || "N/A",
        permission: user.perm?.name || "N/A",
      }));

      return res.status(200).json({
        draw: Number(draw),
        recordsTotal: usersCount,
        recordsFiltered: usersCount,
        data: formattedUsers,
      });
    }

    if (category === "old") {
      const matchOld = {
        sirket_id: new mongoose.Types.ObjectId(currentUser.sirket_id),
        ...(start_date && { hire_date: { $gte: new Date(start_date) } }),
        ...(end_date && { dismissal_date: { $lte: new Date(end_date) } }),
        ...(users.length > 0 && {
          user_id: { $in: users.map((id) => new mongoose.Types.ObjectId(id)) },
        }),
      };

      const pipeline = [
        { $match: matchOld },
        {
          $lookup: {
            from: "peopleusers",
            localField: "user_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $match: {
            ...(search && {
              $or: [
                { "user.name": { $regex: search, $options: "i" } },
                { "user.surname": { $regex: search, $options: "i" } },
                { "user.email": { $regex: search, $options: "i" } },
                { "user.people_id": { $regex: search, $options: "i" } },
                {
                  $expr: {
                    $regexMatch: {
                      input: { $concat: ["$user.name", " ", "$user.surname"] },
                      regex: search,
                      options: "i",
                    },
                  },
                },
                {
                  $expr: {
                    $regexMatch: {
                      input: { $concat: ["$user.surname", " ", "$user.name"] },
                      regex: search,
                      options: "i",
                    },
                  },
                },
              ],
            }),
            ...(Array.isArray(genderFilter) && genderFilter.length
              ? { "user.gender": { $in: genderFilter } }
              : {}),
          },
        },
        {
          $lookup: {
            from: "duties",
            localField: "user.duty",
            foreignField: "_id",
            as: "duty",
          },
        },
        { $unwind: { path: "$duty", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "permissions",
            localField: "user.perm",
            foreignField: "_id",
            as: "perm",
          },
        },
        { $unwind: { path: "$perm", preserveNullAndEmptyArrays: true } },
        {
          $facet: {
            rows: [
              { $sort: { dismissal_date: -1, hire_date: -1 } },
              { $skip: Number(start) },
              { $limit: Number(length) },
            ],
            total: [{ $count: "count" }],
          },
        },
      ];

      const agg = await OldSirketUsers.aggregate(pipeline);
      const rows = agg?.[0]?.rows || [];
      const totalCount = agg?.[0]?.total?.[0]?.count || 0;

      const formatted = rows.map((doc) => {
        const u = doc.user || {};
        return {
          id: u.people_id ?? u._id,
          fullname: `${u.name ?? ""} ${u.surname ?? ""}`.trim(),
          gender: u.gender,
          email: u.email,
          qrCodeCount: u.total_qr_codes,
          partner_id: u.people_id,
          phoneNumber: `+${u.phone_suffix ?? "994"} ${u.phone ?? ""}`,
          hireDate: doc.hire_date
            ? new Date(doc.hire_date).toLocaleDateString("az-AZ", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })
            : "N/A",
          dismissalDate: doc.dismissal_date
            ? new Date(doc.dismissal_date).toLocaleDateString("az-AZ", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })
            : "N/A",
          duty: doc.duty?.name || "N/A",
          permission: doc.perm?.name || "N/A",
          endDate: doc.dismissal_date
            ? new Date(doc.dismissal_date).toLocaleDateString("az-AZ", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })
            : "",
        };
      });

      return res.status(200).json({
        draw: Number(draw),
        recordsTotal: totalCount,
        recordsFiltered: totalCount,
        data: formatted,
      });
    }

    return res.status(400).json({
      message: res.__("messages.avankartPartner.invalid_category"),
    });
  } catch (err) {
    console.error("peopleTable error:", err);
    return res
      .status(500)
      .json({ message: res.__("messages.avankartPartner.server_error") });
  }
};

export const partnerTransactionsTable = async (req, res) => {
  try {
    const {
      search = "",
      start_date,
      end_date,
      draw,
      min,
      max,
      start = 0,
      length = 10,
      card_status,
      user_id,
      card_category = [],
    } = req.body;

    const user = await PeopleUser.findById({ _id: user_id });

    if (!user) {
      return res.status(200).json({
        success: false,
        error: res.__("messages.avankartPartner.user_not_found"),
        draw: parseInt(draw) || 0,
        recordsTotal: 0,
        recordsFiltered: 0,
        data: [],
      });
    }

    const filters = {
      to: user.sirket_id,
      user: new mongoose.Types.ObjectId(user_id),
      status: "success", // Only return successful transactions
    };

    // Card status filter
    if (card_status) {
      filters.status = card_status;
    }

    // Card category filter
    const cardIdFilter = [];
    if (card_category?.length) {
      const validIds = card_category.filter(mongoose.Types.ObjectId.isValid);
      if (validIds.length > 0) {
        filters.cards = {
          $in: validIds.map((id) => new mongoose.Types.ObjectId(id)),
        };
      }
    }

    // Tarih filtresi (saat dahil)
    if (start_date && end_date) {
      const start = new Date(start_date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(end_date);
      end.setHours(23, 59, 59, 999);

      filters.createdAt = {
        $gte: start,
        $lte: end,
      };
    }

    // Mebleg aralığı filtresi
    const minAmount = parseFloat(min);
    const maxAmount = parseFloat(max);
    if (!isNaN(minAmount) && !isNaN(maxAmount)) {
      filters.amount = {
        $gte: minAmount,
        $lte: maxAmount,
      };
    }

    // Arama filtresi
    const searchFilter = search
      ? [
          { transaction_id: { $regex: search, $options: "i" } },
          { subject: { $regex: search, $options: "i" } },
        ]
      : [];
    // $or çakışmalarını $and ile çöz
    if (cardIdFilter.length && searchFilter.length) {
      filters.$and = [{ $or: cardIdFilter }, { $or: searchFilter }];
    } else if (cardIdFilter.length) {
      filters.$or = cardIdFilter;
    } else if (searchFilter.length) {
      filters.$or = searchFilter;
    }

    const total = await TransactionsUser.countDocuments(filters);

    const transactions = await TransactionsUser.find(filters)
      .sort({ createdAt: -1 })
      .skip(parseInt(start))
      .limit(parseInt(length));

    return res.status(200).json({
      success: true,
      draw: parseInt(draw) || 0,
      recordsTotal: total,
      recordsFiltered: total,
      data: transactions,
    });
  } catch (error) {
    console.error("partnerTransactionsTable error:", error);
    return res.status(500).json({
      success: false,
      message: res.__("messages.avankartPartner.server_error"),
    });
  }
};

// TODO: BUNUN USTE ISLEEYECEYIK
export const partnerUserShow = async (req, res) => {
  try {
    const { partnyor_id } = req.params;
    const currentUser = await PeopleUser.findById(req.user?.id);
    if (!currentUser) return res.redirect("/");

    const partnerUser = await PeopleUser.findOne({
      people_id: partnyor_id,
    }).lean();
    if (!partnerUser) return res.redirect("/");

    if (String(partnerUser.sirket_id) !== String(currentUser.sirket_id)) {
      return res.redirect("/");
    }

    // Get transactions

    const transactions = await TransactionsUser.find({
      user: partnerUser._id,
      status: "success",
    })
      .populate("cards")
      .lean();

    const cardsMap = new Map();
    let total = 0;

    for (const tx of transactions) {
      const cardId =
        tx.cards?.id?.toString() || Math.random().toString(36).substring(2, 15);
      const cardName = tx.cards?.name || "Təyin olunmamış";

      const amount = tx.amount || 0;
      const comission = tx.comission || 0;
      const cleanAmount = amount - comission;

      if (!cardId) continue;

      if (!cardsMap.has(cardId)) {
        cardsMap.set(cardId, {
          cardId,
          _id: tx._id,
          name: cardName,
          color: tx.cards?.background_color || "#ccc",
          value: 0,
        });
      }

      var totalAmountForUndefinedCard = 0;
      for (const card of cardsMap.values()) {
        card.name === "Təyin olunmamış" &&
          (totalAmountForUndefinedCard += card.value);
      }

      const existing = cardsMap.get(cardId);
      existing.value += cleanAmount;
      total += cleanAmount;
    }

    const cards = [...cardsMap.values()];

    res.render("pages/avankartPartner/inside", {
      user: partnerUser,
      csrfToken: req.csrfToken(),
      cards,
      total,
      totalAmountForUndefinedCard,
      layout: "./layouts/main.ejs",
    });
  } catch (err) {
    console.error("partnerUserShow error:", err);
    res.status(500).send("Server error");
  }
};

export const restorePartnerUser = async (req, res) => {
  try {
    const { id } = req.body;
    const currentUser = await PeopleUser.findById(req.user?.id);

    if (!currentUser)
      return res
        .status(401)
        .json({ message: res.__("messages.auth.unauthorized") });

    const oldUser = await OldMuessiseUsers.findById(id);

    if (!oldUser || !oldUser.user_partner_id)
      return res
        .status(404)
        .json({ message: res.__("messages.avankartPartner.user_not_found") });

    if (String(oldUser.sirket_id) !== String(currentUser.sirket_id)) {
      return res
        .status(403)
        .json({ message: res.__("messages.avankartPartner.forbidden") });
    }

    const user = await PeopleUser.findById(oldUser.user_partner_id);

    if (!user)
      return res
        .status(404)
        .json({ message: res.__("messages.avankartPartner.user_not_found") });

    if (user.sirket_id) {
      req.body.id = user._id.toString();
      return await import("./avankartInvite.js").then(async (module) => {
        await module.invitePartner(req, res);
      });
    }

    user.sirket_id = currentUser.sirket_id;
    await user.save();
    await OldMuessiseUsers.findByIdAndDelete(oldUser._id);

    return res.status(200).json({
      message: res.__("messages.avankartPartner.user_restored_successfully"),
    });
  } catch (error) {
    console.error("restorePartnerUser error:", error);
    return res.status(500).json({ message: res.__("messages.server_error") });
  }
};

export const getUserData = async (req, res) => {
  try {
    // Get user_id from URL params or request body - this is MongoDB ObjectId
    const user_id = req.params.partnyor_id || req.body.partnyor_id;

    if (!user_id) {
      return res.status(400).json({
        message: "user_id parametri tələb olunur",
      });
    }

    const currentUser = await PeopleUser.findById(req.user?.id).lean();
    if (!currentUser) {
      return res
        .status(401)
        .json({ message: res.__("messages.auth.unauthorized") });
    }

    const partnerUser = await PeopleUser.findOne({
      people_id: req.params.partnyor_id,
    }).lean();

    if (!partnerUser) {
      return res.status(404).json({
        message: "İstifadəçi tapılmadı: " + user_id,
      });
    }

    // Check if the user belongs to the same company
    if (String(partnerUser.sirket_id) === String(currentUser.sirket_id)) {
      return res
        .status(403)
        .json({ message: "Bu istifadəçi artıq sizin şirkətinizdədir." });
    }

    return res.status(200).send({
      success: true,
      phone: "+" + partnerUser.phone_suffix + partnerUser.phone,
      email: partnerUser.email,
      gender: partnerUser.gender,
      surname: partnerUser.surname,
      name: partnerUser.name,
      people_id: partnerUser.people_id,
      _id: partnerUser._id,
    });
  } catch (error) {
    console.error("getUserData error:", error);
    return res.status(500).json({ message: res.__("messages.server_error") });
  }
};

export const getUserDataPeople = async (req, res) => {
  try {
    const user_id = req.body.user_id || req.params.partnyor_id;

    if (!user_id) {
      return res.status(400).json({
        message: "user_id parametri tələb olunur",
      });
    }

    const currentUser = await PeopleUser.findById(req.user?.id).lean();
    if (!currentUser) {
      return res
        .status(401)
        .json({ message: res.__("messages.auth.unauthorized") });
    }

    // partner user(ler) axtar

    const partnerUsers = await PeopleUser.find({
      people_id: { $in: Array.isArray(user_id) ? user_id : [user_id] },
    }).lean();

    if (!partnerUsers.length) {
      console.log(user_id);
      return res.status(404).json({
        message: "İstifadəçi tapılmadı",
      });
    }

    // Şirkət uyğunluğunu yoxla
    const allSameCompany = partnerUsers.every(
      (u) => String(u.sirket_id) === String(currentUser.sirket_id)
    );
    if (!allSameCompany) {
      return res
        .status(403)
        .json({ message: "Bu istifadəçilərin hamısı sizin şirkətinizdə deyil." });
    }

    let cards = [];
    if (Array.isArray(user_id)) {
      // birdən çox user üçün şirkətin kartlarını göstər
      const sirket = await Sirket.findById(currentUser.sirket_id)
        .select("cards")
        .populate("cards", "name");
      cards = sirket?.cards || [];
    } else {
      // tək user üçün onun balans kartlarını çək
      const partnerUser = partnerUsers[0];

      const sirket = await Sirket.findById(currentUser.sirket_id)
        .select("cards")
        .populate("cards", "name");
      cards = sirket?.cards || [];
      

      return res.status(200).send({
        success: true,
        phone:
          (partnerUser.phone_suffix ? "+" + partnerUser.phone_suffix : "") +
          partnerUser.phone,
        email: partnerUser.email,
        gender: partnerUser.gender,
        surname: partnerUser.surname,
        name: partnerUser.name,
        people_id: partnerUser.people_id,
        _id: partnerUser._id,
        cards,
      });
    }

    // birdən çox user gəlmişsə hamısını array qaytar
    return res.status(200).send({
      success: true,
      users: partnerUsers.map((u) => ({
        phone: (u.phone_suffix ? "+" + u.phone_suffix : "") + u.phone,
        email: u.email,
        gender: u.gender,
        surname: u.surname,
        name: u.name,
        people_id: u.people_id,
        _id: u._id,
      })),
      cards,
    });
  } catch (error) {
    console.error("getUserData error:", error);
    return res.status(500).json({ message: res.__("messages.server_error") });
  }
};

export const addBalanceToUser = async (req, res) => {
  const { user_id = [], cards = [] } = req.body;

  try{
    const myUser = await PeopleUser.findById(req.user.id);
    if(!myUser){
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    if (Array.isArray(user_id) && user_id.length > 0 && cards && Object.keys(cards).length > 0) {
      // boş veya 0 değerli kartları filtrele
      const cardArray = Object.entries(cards)
        .filter(([_, balance]) => Number(balance) > 0)
        .map(([card_id, balance]) => ({
          card_id,
          balance: Number(balance) || 0,
          count: user_id.length // her kart için kaç kişiye eklendi
        }));

      const total_balance = cardArray.reduce((sum, c) => sum + c.balance, 0);

      // Ana klasör
      const balanceFolder = await AddCardBalance.create({
        user_id: myUser._id,
        sirket_id: myUser.sirket_id,
        cards: cardArray,   // burada hem balance hem count var
        total_balance,
        updatedBy: req.user.id,
        refModel: "PeopleUser"
      });

      // Her kullanıcı + her kart için detaylı kayıt
      for (const usr of user_id) {
        for (const c of cardArray) {
          await AddedBalance.create({
            balance_id: balanceFolder._id,
            user_id: usr,
            sirket_id: myUser.sirket_id,
            card_id: c.card_id,
            total_balance: c.balance,          // tek kullanıcının aldığı değer
            added_balance: c.balance,          // tek kullanıcının aldığı değer
            updatedBy: myUser._id
          });
        }
      }

      return res.json({
        success: true,
        message: "Balans artırıldı",
        redirect: "/isci/isciler-balance"
      })
    }

    return res.json({
      success: false,
      message: "Balans daxil edin"
    })

  }catch (err){
    console.log(err);
    return res.json({
      success: false,
      error: err,
      message: "Server error"
    })
  }
}
