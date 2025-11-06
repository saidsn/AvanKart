import AddCardBalance from "../../../shared/model/people/addBalances.js";
import AddedBalance from "../../../shared/model/people/addedBalances.js";
import PeopleCardBalance from "../../../shared/model/people/cardBalances.js";
import PeopleUser from "../../../shared/models/peopleUserModel.js";
import RbacPeoplePermission from "../../../shared/models/rbacPeopleModel.js";
import SirketDuty from "../../../shared/models/Sirketduties.js";
import ImtiyazQruplari from "../../../shared/model/people/imtiyazQruplari.js";
import Cards from "../../../shared/models/cardModel.js";
import { sendMail } from "../../../shared/utils/otpHandler.js";
import mongoose from "mongoose";
import i18n from "i18n";

export const addBalance = async (req, res) => {
  try {

    const userId = req.user._id || req.user.id;

    const user = await PeopleUser.findById(userId).populate({
      path: "sirket_id",
      populate: {
        path: "cards",
        select: "name _id background_color", // yalnız name və _id gələcək
        options: { strictPopulate: false },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "İstifadəçi tapılmadı",
      });
    }

    if (!user.sirket_id) {
      return res.status(400).json({
        success: false,
        message: "İstifadəçi heç bir şirkətə bağlı deyil",
      });
    }

    const sirket = user.sirket_id;

    const permissions = await ImtiyazQruplari.find({
      sirket_id: sirket._id,
    }).select("name _id");

    // Render üçün data hazırlayırıq
    const renderData = {
      permissions: permissions.map((permission) => ({
        name: permission.name,
        _id: permission._id,
      })),
      sirket_balance: sirket.sirket_balance || 0,
      sirket_id: sirket._id,
      cards: sirket.cards,
      sirket_name: sirket.sirket_name,
      csrfToken: req.csrfToken(),
    };

    return res.render("pages/emeliyyatlar/addBalance", renderData);
  } catch (error) {
    console.error("addBalance render error:", error);
    return res.status(500).json({
      success: false,
      message: "Daxili server xətası",
      error: error.message,
    });
  }
};

export const editBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { balance_id } = req.params;

    const user = await PeopleUser.findById(userId).populate({
      path: "sirket_id",
      select: "sirket_name sirket_id sirket_balance cards",
      populate: {
        path: "cards",
        select: "name _id background_color",
        options: { strictPopulate: false },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "İstifadəçi tapılmadı",
      });
    }

    if (!user.sirket_id) {
      return res.status(400).json({
        success: false,
        message: "İstifadəçi heç bir şirkətə bağlı deyil",
      });
    }

    const sirket = user.sirket_id;

    const balance = await AddCardBalance.findOne({
      sirket_id: sirket._id,
      balance_id,
      status: 'active'
    });

    if (!balance) return res.redirect("/");

    // Balance card verilerini populate ederek al
    const balanceCard = await AddedBalance.find({
      sirket_id: sirket._id,
      balance_id: balance._id,
    }).populate('card_id', 'name _id')
      .populate('imtiyaz_id', 'name _id')
      .populate('user_id', 'name surname _id');

    // Permissions listesini al
    const permissions = await ImtiyazQruplari.find({
      sirket_id: sirket._id,
    }).select("name _id");

    // editData'yı oluştur (sadece exceptions)
    let editData = {
      exceptions: {}
    };

    // Unique users ve imtiyazlar topla
    const uniqueUserIds = new Set();
    const uniqueImtiyazIds = new Set();

    // balanceCard verilerini işle
    balanceCard.forEach((bal) => {
      if (!bal.imtiyaz_id || !bal.user_id || !bal.card_id) return;

      const permId = bal.imtiyaz_id._id.toString();
      const userId = bal.user_id._id.toString();
      const cardId = bal.card_id._id.toString(); // CARD._ID KULLAN
      const addedBalance = bal.added_balance || 0;

      // Unique ID'leri topla
      uniqueUserIds.add(userId);
      uniqueImtiyazIds.add(permId);

      // Exceptions yapısını oluştur
      if (!editData.exceptions[permId]) {
        editData.exceptions[permId] = {};
      }
      if (!editData.exceptions[permId][userId]) {
        editData.exceptions[permId][userId] = {};
      }
      editData.exceptions[permId][userId][cardId] = addedBalance.toString();
    });

    console.log('Generated editData:', JSON.stringify(editData, null, 2));

    // Render üçün data hazırlayırıq
    const renderData = {
      permissions: permissions.map((permission) => ({
        name: permission.name,
        _id: permission._id.toString(),
      })),
      imtiyazlar: Array.from(uniqueImtiyazIds),
      users: Array.from(uniqueUserIds),
      sirket_balance: sirket.sirket_balance || 0,
      sirket_id: sirket._id,
      cards: sirket.cards,
      sirket_name: sirket.sirket_name,
      csrfToken: req.csrfToken(),
      balanceId: balance.balance_id,
      editData
    };

    return res.render("pages/emeliyyatlar/editBalance", renderData);
  } catch (error) {
    console.error("editBalance render error:", error);
    return res.status(500).json({
      success: false,
      message: "Daxili server xətası",
      error: error.message,
    });
  }
};

export const getBalanceInside = async (req, res) => {
  const { balance_id } = req.params;
  const myUser = await PeopleUser.findById(req.user?.id);

  const balance = await AddCardBalance.findOne({
    balance_id: balance_id,
    sirket_id: myUser.sirket_id,
  });
  if (!balance) {
    return res.redirect("/");
  }

  const statusMap = { qaralama: res.__("hesablasmalar.status_list.qaralama"), 
        waiting: res.__("hesablasmalar.status_list.wait"), 
        waiting_aktiv: res.__("hesablasmalar.status_list.waiting_aktiv"), 
        waiting_tamamlandi: res.__( "hesablasmalar.status_list.waiting_tamamlandi" ), 
        aktiv: res.__("hesablasmalar.status_list.aktiv"), 
        active: res.__("hesablasmalar.status_list.aktiv"), 
        reported: res.__("hesablasmalar.status_list.reported"), 
        tamamlandi: res.__("hesablasmalar.status_list.tamamlandi"), 
        complated: res.__("hesablasmalar.status_list.tamamlandi"), };

  return res.render("pages/emeliyyatlar/balances.ejs", {
    balance,
    statusMap,
    csrfToken: req.csrfToken(),
  });
};


export const postBalanceInside = async (req, res) => {
  const { draw, balance_id, search } = req.body;

  const myUser = await PeopleUser.findById(req.user?.id);

  const test =  await AddCardBalance.findById(balance_id)

  const balance = await AddedBalance.aggregate([
    { 
      $match: { 
        balance_id: new mongoose.Types.ObjectId(balance_id),
        sirket_id: myUser.sirket_id 
      } 
    },
    {
      $addFields: {
        card_id_safe: { $ifNull: ["$card_id", null] }
      }
    },
    {
      $lookup: {
        from: "cards",
        localField: "card_id_safe",
        foreignField: "_id",
        as: "card"
      }
    },
    { 
      $unwind: {
        path: "$card",
        preserveNullAndEmptyArrays: true
      } 
    },
    // Search ekleme
    ...(search
      ? [
          {
            $match: {
              "card.name": { $regex: search, $options: "i" } // Büyük/küçük harf duyarsız
            }
          }
        ]
      : []),
    {
      $group: {
        _id: "$card_id_safe",
        card_name: { $first: { $ifNull: ["$card.name", "Undefined"] } },
        worker_count: { $sum: 1 },
        total_amount: { $sum: "$added_balance" },
        first_createdAt: { $first: "$createdAt" }
      }
    },
    {
      $addFields: {
        createdAtFormatted: {
          $dateToString: { format: "%d.%m.%Y %H:%M", date: "$first_createdAt" }
        },
        isHidden: false
      }
    },
    {
      $project: {
        first_createdAt: 0
      }
    }
  ]);

  return res.json({
    data: balance,
    recordsFiltered: balance.length,
    recordsTotal: balance.length,
    draw,
  });
};


// İmtiyaz qruplarına görə balans əlavə etmə
export const addBalanceByImtiyazGroup = async (req, res) => {
  try {
    const { imtiyaz_id, cards } = req.body;
    const userId = req.user._id || req.user.id;

    // Parametrləri yoxlayırıq
    if (!imtiyaz_id) {
      return res.status(400).json({
        success: false,
        message: "İmtiyaz qrupu ID-si tələb olunur",
      });
    }

    if (
      !cards ||
      typeof cards !== "object" ||
      Object.keys(cards).length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Ən azı bir kart və balans dəyəri təqdim edilməlidir",
      });
    }

    // İstifadəçini və şirkətini tapırıq
    const currentUser = await PeopleUser.findById(userId).populate("sirket_id");
    if (!currentUser || !currentUser.sirket_id) {
      return res.status(404).json({
        success: false,
        message: "İstifadəçi və ya şirkət tapılmadı",
      });
    }

    const sirket = currentUser.sirket_id;

    // İmtiyaz qrupunu yoxlayırıq
    const imtiyazGroup = await ImtiyazQruplari.findOne({
      _id: imtiyaz_id,
      sirket_id: sirket._id,
    });

    if (!imtiyazGroup) {
      return res.status(404).json({
        success: false,
        message: "İmtiyaz qrupu tapılmadı və ya sizə aid deyil",
      });
    }

    // İmtiyaz qrupuna aid istifadəçiləri tapırıq
    const usersInGroup = await PeopleUser.find({
      sirket_id: sirket._id,
      imtiyaz: imtiyaz_id,
      isDeleted: { $ne: true },
    });

    if (usersInGroup.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Bu imtiyaz qrupunda heç bir istifadəçi tapılmadı",
      });
    }

    // Kartları yoxlayırıq
    const cardIds = Object.keys(cards);
    const validCards = await Cards.find({
      _id: { $in: cardIds },
      sirket_id: sirket._id,
    });

    if (validCards.length !== cardIds.length) {
      return res.status(400).json({
        success: false,
        message: "Bəzi kartlar tapılmadı və ya şirkətə aid deyil",
      });
    }

    // Ümumi balansı hesablayırıq
    let totalBalance = 0;
    const cardBalances = [];

    for (const cardId of cardIds) {
      const balance = parseFloat(cards[cardId]);
      if (isNaN(balance) || balance <= 0) {
        return res.status(400).json({
          success: false,
          message: `Kart ${cardId} üçün keçərli balans dəyəri daxil edin`,
        });
      }
      totalBalance += balance;
      cardBalances.push({
        card_id: cardId,
        count: balance,
      });
    }

    // 1. Əvvəlcə boş AddCardBalance yaradırıq
    const newBalance = new AddCardBalance({
      user_id: currentUser._id,
      sirket_id: sirket._id,
      cards: cardBalances,
      total_balance: 0, // Əvvəlcə 0 olaraq saxlayırıq
      status: "active",
      updatedBy: currentUser._id,
    });

    const savedBalance = await newBalance.save();

    // 2. Hər istifadəçi üçün AddedBalance yaradırıq və balance_id əlavə edirik
    const addedBalancesPromises = [];

    for (const user of usersInGroup) {
      for (const cardBalance of cardBalances) {
        const addedBalance = new AddedBalance({
          user_id: user._id,
          balance_id: savedBalance._id,
          sirket_id: sirket._id,
          card_id: cardBalance.card_id,
          imtiyaz_id: imtiyaz_id,
          added_balance: cardBalance.count,
          total_balance: cardBalance.count,
          last_balance: 0,
          status: "active",
        });
        addedBalancesPromises.push(addedBalance.save());
      }
    }

    await Promise.all(addedBalancesPromises);

    // 3. AddCardBalance-ı total_balance ilə update edirik
    await AddCardBalance.findByIdAndUpdate(savedBalance._id, {
      total_balance: totalBalance * usersInGroup.length,
      status: "pending_otp", // OTP gözləyən status
    });

    // 4. OTP yaradırıq
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpireTime = new Date(Date.now() + 10 * 60 * 1000); // 10 dəqiqə

    // 5. OTP-ni AddCardBalance-a əlavə edirik
    await AddCardBalance.findByIdAndUpdate(savedBalance._id, {
      $set: {
        "otp.code": otpCode,
        "otp.createdAt": otpExpireTime,
      },
    });

    console.log("Otp: " + otpCode);

    // 6. Email göndəririk
    const emailSubject = "İmtiyaz Qrupuna Balans Əlavə Etmə - OTP Kodu";
    const emailText = `
Salam ${currentUser.name || currentUser.email},

İmtiyaz qrupu "${imtiyazGroup.name}" üçün balans əlavə etmə əməliyyatını təsdiqləmək üçün OTP kodunuz: ${otpCode}

Əməliyyat təfərrüatları:
- İmtiyaz qrupu: ${imtiyazGroup.name}
- İstifadəçi sayı: ${usersInGroup.length}
- Ümumi balans: ${totalBalance * usersInGroup.length}
- Hər istifadəçi üçün balans: ${totalBalance}

Bu kod 10 dəqiqə ərzində keçərlidir.

Təşəkkür edirik.
Avankart Komandası
    `;
    let isDev = process.env.NODE_ENV !== "PRODUCTION";
    try {
      await sendMail(currentUser.email, emailSubject, isDev,emailText);
    } catch (emailError) {
      console.error("Email göndərmə xətası:", emailError);
      // Email göndərilməsə belə, əməliyyat uğurlu sayılacaq
    }

    return res.status(200).json({
      success: true,
      message: `${usersInGroup.length} istifadəçiyə balans əlavə etmə əməliyyatı yaradıldı. OTP kodu email ünvanınıza göndərildi.`,
      otpRequired: true,
      resendUrl: "/resend-otp",
      data: {
        balance_id: savedBalance.balance_id,
        _id: savedBalance._id,
        imtiyaz_group: imtiyazGroup.name,
        users_count: usersInGroup.length,
        total_balance: totalBalance * usersInGroup.length,
        balance_per_user: totalBalance,
        cards_count: cardBalances.length,
      },
    });
  } catch (error) {
    console.error("addBalanceByImtiyazGroup error:", error);
    return res.status(500).json({
      success: false,
      message: "Daxili server xətası",
      error: error.message,
    });
  }
};

// İmtiyaz qrupu balans əməliyyatını OTP ilə təsdiqləmə
export const confirmBalanceByImtiyazGroup = async (req, res) => {
  try {
    const { balance_id, otp } = req.body;
    const userId = req.user._id || req.user.id;

    if (!balance_id || !otp) {
      return res.status(400).json({
        success: false,
        message: "Balance ID və OTP tələb olunur",
      });
    }

    // İstifadəçini tapırıq
    const currentUser = await PeopleUser.findById(userId).populate("sirket_id");
    if (!currentUser || !currentUser.sirket_id) {
      return res.status(404).json({
        success: false,
        message: "İstifadəçi və ya şirkət tapılmadı",
      });
    }

    // Balance qeydini tapırıq
    const balanceRecord = await AddCardBalance.findOne({
      _id: balance_id,
      sirket_id: currentUser.sirket_id._id,
      updatedBy: currentUser._id,
      status: "pending_otp",
    });

    if (!balanceRecord) {
      return res.status(404).json({
        success: false,
        message: "Balans qeydi tapılmadı və ya OTP təsdiqləməsi tələb olunmur",
      });
    }

    // OTP yoxlanışı
    if (!balanceRecord.otp || balanceRecord.otp.code !== otp) {
      return res.status(400).json({
        success: false,
        message: "OTP kodu yanlışdır",
      });
    }

    if (balanceRecord.otp.createdAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP kodunun vaxtı bitib",
      });
    }

    // ===== Snapshot yenilənməsi (PeopleCardBalance) =====
    // 1) AddedBalance qeydlərini çəkirik (yalnız bu əməliyyata aid)
    const relatedAdded = await AddedBalance.find({ balance_id }).lean();

    // 2) Balance statusunu atomik şəkildə pending_otp -> active dəyişirik
    await AddCardBalance.findByIdAndUpdate(
      balance_id,
      { status: "active", $unset: { otp: 1 } },
      { new: true }
    );

    // 3) Əlaqəli AddedBalance qeydlərini də "active" edirik (idempotent)
    await AddedBalance.updateMany({ balance_id }, { status: "active" });

    // 4) Hər AddedBalance üçün PeopleCardBalance upsert + $inc
    //    (idempotentlik: eyni əməliyyat təkrar gəlməsin deyə yalnız pending_otp statusu olan balanslar üçün icra edirik; burada artıq status dəyişdirilib)
    const now = new Date();
    for (const row of relatedAdded) {
      if (!row.card_id) continue;
      await PeopleCardBalance.updateOne(
        {
          user_id: row.user_id,
          card_id: row.card_id,
          sirket_id: row.sirket_id,
        },
        {
          $inc: { balance: row.added_balance || 0 },
          $set: {
            lastPayment: now,
            status: "active",
            updatedBy: currentUser._id,
            refModel: "PeopleUser",
          },
          $setOnInsert: { createdAt: now },
        },
        { upsert: true }
      );
    }

    return res.status(200).json({
      success: true,
      message:
        "İmtiyaz qrupu balans əməliyyatı uğurla təsdiqləndi və aktivləşdirildi",
      data: {
        balance_id: balanceRecord.balance_id,
        total_balance: balanceRecord.total_balance,
        status: "active",
      },
    });
  } catch (error) {
    console.error("confirmBalanceByImtiyazGroup error:", error);
    return res.status(500).json({
      success: false,
      message: "Daxili server xətası",
      error: error.message,
    });
  }
};
