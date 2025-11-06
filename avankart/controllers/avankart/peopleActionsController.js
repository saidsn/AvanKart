import PeopleUser from "../../../shared/models/peopleUserModel.js";
import TempPeopleUserDelete from "../../../shared/model/people/tempPeopleUserDelete.js";
import Cards from "../../../shared/models/cardModel.js";
import UserRozet from "../../../shared/models/userRozet.js";
import RozetCategory from "../../../shared/models/rozetCategoryModel.js";
import mongoose from "mongoose";
import UserMukafat from "../../../shared/models/userMukafat.js";
import Cashback from "../../../shared/models/cashBackModel.js"
import AddedBalance from "../../../shared/model/people/addedBalances.js"
import TransactionsUser from "../../../shared/models/transactionsModel.js";
import Sirket from "../../../shared/models/sirketModel.js";
import Muessise from "../../../shared/models/muessiseModel.js";
import Ticket from "../../../shared/model/partner/ticket.js"
import SorgularReason from "../../../shared/model/partner/sorgularReason.js";
import PeopleCardBalance from "../../../shared/model/people/cardBalances.js";
import RequestCard from "../../../shared/model/people/requestActivateCard.js";
import CardConditions from "../../../shared/models/cardConditionsModel.js";
import { generateOtp, sendMail } from "../../../shared/utils/otpHandler.js";
import OtpModel from "../../../shared/models/otp.js";

// Helper: find user by people_id (external id)
async function findByPeopleId(peopleId) {
  if (!peopleId) return null;
  return PeopleUser.findOne({ people_id: peopleId });
}

// POST /api/people/:peopleId/deactivate
export const deactivatePeopleUser = async (req, res) => {
  try {
    const { peopleId } = req.params;
    const user = await findByPeopleId(peopleId);
    if (!user) return res.status(404).json({ success: false, message: "İstifadəçi tapılmadı" });
    if (user.status === 1) return res.json({ success: true, message: "Artıq deaktivdir" });

    user.status = 1; // 1 = Deaktiv
    await user.save();
    return res.json({ success: true, message: "Deaktiv edildi" });
  } catch (e) {
    console.error("deactivatePeopleUser error", e);
    return res.status(500).json({ success: false, message: "Server xətası" });
  }
};

// POST /api/people/:peopleId/activate
export const activatePeopleUser = async (req, res) => {
  try {
    const { peopleId } = req.params;
    const user = await findByPeopleId(peopleId);
    if (!user) return res.status(404).json({ success: false, message: "İstifadəçi tapılmadı" });
    if (user.status === 0) return res.json({ success: true, message: "Artıq aktivdir" });
    if (user.status === 2) return res.status(400).json({ success: false, message: "Silinmiş istifadəçi aktiv edilə bilməz" });
    user.status = 0; // 0 = Aktiv
    await user.save();
    return res.json({ success: true, message: "Aktiv edildi" });
  } catch (e) {
    console.error("activatePeopleUser error", e);
    return res.status(500).json({ success: false, message: "Server xətası" });
  }
};

// POST /api/people/:peopleId/delete-request
export const requestDeletePeopleUser = async (req, res) => {
  try {
    const { peopleId } = req.params;
    const target = await findByPeopleId(peopleId);
    if (!target) return res.status(404).json({ success: false, message: "İstifadəçi tapılmadı" });

    const senderId = req.user?.id || req.user?._id;
    if (!senderId) return res.status(401).json({ success: false, message: "Auth tələb olunur" });

    // Mövcud açıq (otp təsdiqi gözləyən) sənəddə varsa yenidən əlavə etmə
    await TempPeopleUserDelete.findOneAndUpdate(
      { sender_id: senderId },
      { $addToSet: { users: target._id } },
      { upsert: true, new: true }
    );

    return res.json({ success: true, message: "Silinmə müraciəti əlavə olundu" });
  } catch (e) {
    console.error("requestDeletePeopleUser error", e);
    return res.status(500).json({ success: false, message: "Server xətası" });
  }
};

//imtiyaz kartlari section
export const getAllCards = async (req, res) => {
  try {
    const { query } = req.body;
    let filter = {};
    if (query && query.trim() !== "") {
      filter = { name: { $regex: query, $options: "i" } };
    }
    const cards = await Cards.find(filter).lean();
    return res.json({
      success: true, message: "Cardlar Ugurla getirildi", cards
    })
  } catch (error) {
    console.error("getAllCards error: ", error);
    return res.status(500).send("Internal Server Error.")
  }
}

//Rozets Section
export const getUserRozets = async (req, res) => {
  try {
    const peopleId = req.params.peopleId;
    const { search, categories } = req.body;

    const user = await PeopleUser.findOne({ people_id: peopleId });
    if (!user) return res.status(404).json({ success: false, message: "User Tapılmadı" });

    const userRozets = await UserRozet.find({ user: user._id, isRevoked: false })
      .populate({ path: "rozet", populate: { path: "rozet_category" } });

    let filteredRozets = userRozets;
    if (search && search.trim() !== "") {
      const term = search.trim().toLowerCase();
      filteredRozets = filteredRozets.filter(ur => ur.rozet.name.toLowerCase().includes(term));
    }
    if (categories && categories.length > 0) {
      filteredRozets = filteredRozets.filter(ur => categories.includes(ur.rozet?.rozet_category?.id));
    }

    // Categorize
    const groupedByCategory = {};
    filteredRozets.forEach(ur => {
      const categoryName = ur.rozet?.rozet_category?.name || "Other";
      if (!groupedByCategory[categoryName]) groupedByCategory[categoryName] = [];
      groupedByCategory[categoryName].push({
        rozet_id: ur.rozet._id,
        name: ur.rozet.name,
        description: ur.rozet.description,
        image_name: ur.rozet.image_name,
        image_path: ur.rozet.image_path,
        target: ur.rozet.target,
        target_type: ur.rozet.target_type,
        conditions: ur.rozet.conditions,
        earnedAt: ur.earnedAt,
        revokedAt: ur.revokedAt
      });
    });

    return res.json({
      success: true,
      rozetCategories: groupedByCategory
    });

  } catch (error) {
    console.error("getUserRozets error:", error);
    return res.status(500).send("Internal Server Error.");
  }
};
export const getRozetCategories = async (req, res) => {
  try {
    const categories = await RozetCategory.find().lean();
    return res.json({ success: true, data: categories });
  } catch (error) {
    console.error("getRozetCategories error:", error);
    return res.status(500).json({ success: false, data: [] });
  }
};

//Mukafat Section
export const getUserMukafatlar = async (req, res) => {
  try {
    const { peopleId } = req.params;
    const { search } = req.body;

    const user = await PeopleUser.findOne({ people_id: peopleId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Bu people ID ilə istifadəçi tapılmadı.",
      });
    }

    const mukafatlar = await UserMukafat.find({ user: user._id })
      .populate({
        path: "mukafat",
        select: "name image_path forCard",
        populate: { path: "forCard", select: "name" },
      })
      .sort({ earnedAt: -1 });
    let filteredMukafats = mukafatlar;
    if (search && search.trim() !== "") {
      const term = search.trim().toLowerCase();
      filteredMukafats = filteredMukafats.filter(ur => ur.mukafat.name.toLowerCase().includes(term));
    }
    if (!mukafatlar || mukafatlar.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Bu istifadəçinin qazandığı mükafat yoxdur.",
      });
    }

    const groupedByCard = {};
    filteredMukafats.forEach((item) => {
      const cardName = item.mukafat?.forCard?.name || "Other";
      if (!groupedByCard[cardName]) groupedByCard[cardName] = [];
      groupedByCard[cardName].push({
        mukafat_id: item.mukafat?._id,
        mukafatName: item.mukafat?.name || "—",
        image: item.mukafat?.image_path || null,
        earnedAt: item.earnedAt,
        earned: item.earned,
        isUsed: item.isUsed,
      });
    });

    return res.status(200).json({
      success: true,
      cardCategories: groupedByCard,
    });

  } catch (error) {
    console.error("Mükafatları gətirərkən xəta:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};


//Statiskika Charts
export const cashbackChart = async (req, res) => {
  try {
    const peopleId = req.params.peopleId;
    const user = await PeopleUser.findOne({ people_id: peopleId });
    if (!user) return res.status(404).json({ success: false, message: "User Tapılmadı" });
    const cashbacks = await Cashback.find({ user_id: user }).populate("card_id", "name");

    const grouped = {};

    cashbacks.forEach(cb => {
      const cardName = cb.card_id?.name || null;
      if (!grouped[cardName]) grouped[cardName] = 0;
      grouped[cardName] += cb.cashback;
    });

    const groupedArray = Object.entries(grouped).map(([cardName, totalCashback]) => ({
      cardName,
      totalCashback
    }));

    const grandTotal = cashbacks.reduce((sum, cb) => sum + cb.cashback, 0);

    res.status(200).json({
      success: true,
      totalCashback: grandTotal,
      data: groupedArray
    });

  } catch (error) {
    console.error("Cashback chart error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error."
    });
  }
};
export const addedBalancesChart = async (req, res) => {
  try {
    const peopleId = req.params.peopleId;
    const user = await PeopleUser.findOne({ people_id: peopleId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Tapılmadı"
      });
    }

    const { years, sirketIds, cardIds } = req.body;

    const filter = { user_id: new mongoose.Types.ObjectId(user._id) };

    if (years && Array.isArray(years) && years.length > 0) {
      const minYear = Math.min(...years);
      const maxYear = Math.max(...years);

      filter.createdAt = {
        $gte: new Date(`${minYear}-01-01T00:00:00.000Z`),
        $lte: new Date(`${maxYear}-12-31T23:59:59.999Z`)
      };
    }

    if (sirketIds && Array.isArray(sirketIds) && sirketIds.length > 0) {
      filter.sirket_id = {
        $in: sirketIds.map(id => new mongoose.Types.ObjectId(id))
      };
    }

    if (cardIds && Array.isArray(cardIds) && cardIds.length > 0) {
      filter.card_id = {
        $in: cardIds.map(id => new mongoose.Types.ObjectId(id))
      };
    }


    const balances = await AddedBalance.find(filter)
      .populate("card_id", "name")
      .sort({ createdAt: 1 });

    const grouped = {};

    balances.forEach(b => {
      const cardName = b.card_id?.name || "Naməlum Kart";
      const month = new Date(b.createdAt).getMonth();
      if (!grouped[cardName]) {
        grouped[cardName] = Array(12).fill(0);
      }

      grouped[cardName][month] += b.added_balance;
    });

    const groupedArray = Object.entries(grouped).map(([cardName, monthlyData]) => ({
      cardName,
      monthlyData, // [yanvar, fevral, mart, ...]
      totalAddedBalance: monthlyData.reduce((sum, val) => sum + val, 0)
    }));

    groupedArray.sort((a, b) => b.totalAddedBalance - a.totalAddedBalance);

    const grandTotal = balances.reduce((sum, b) => sum + b.added_balance, 0);

    res.status(200).json({
      success: true,
      totalAddedBalance: grandTotal,
      data: groupedArray,
      appliedFilters: {
        years: years || [],
        sirketIds: sirketIds || [],
        cardIds: cardIds || [],
        resultCount: balances.length
      }
    });

  } catch (error) {
    console.error("AddedBalances chart error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
      error: error.message
    });
  }
};
export const transactionsChart = async (req, res) => {
  try {
    const { peopleId } = req.params;
    const { years, cardIds, sirketIds, muessiseIds } = req.body;

    const user = await PeopleUser.findOne({ people_id: peopleId }).select("_id");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "İstifadəçi tapılmadı."
      });
    }

    const filter = { from: new mongoose.Types.ObjectId(user._id) };

    if (years?.length) {
      const minYear = Math.min(...years);
      const maxYear = Math.max(...years);
      filter.createdAt = {
        $gte: new Date(`${minYear}-01-01T00:00:00.000Z`),
        $lte: new Date(`${maxYear}-12-31T23:59:59.999Z`)
      };
    }

    // Kart filteri
    if (cardIds?.length) {
      filter.cards = { $in: cardIds.map(id => new mongoose.Types.ObjectId(id)) };
    }

    // Şirkət filteri
    if (sirketIds?.length) {
      filter.from_sirket = { $in: sirketIds.map(id => new mongoose.Types.ObjectId(id)) };
    }

    // Müəssisə filteri
    if (muessiseIds?.length) {
      filter.to = { $in: muessiseIds.map(id => new mongoose.Types.ObjectId(id)) };
    }


    // Əməliyyatları gətir
    const transactions = await TransactionsUser.find(filter)
      .populate("cards", "name")
      .populate("from_sirket", "name")
      .populate("to", "muessise_name")
      .sort({ createdAt: 1 })
      .lean();

    if (!transactions.length) {
      return res.status(200).json({
        success: true,
        message: "Filtrə uyğun əməliyyat tapılmadı.",
        lineChartData: [],
        doughnutData: [],
        months: [
          "Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun",
          "İyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"
        ],
        appliedFilters: {
          years: years || [],
          cardIds: cardIds || [],
          sirketIds: sirketIds || [],
          muessiseIds: muessiseIds || [],
          resultCount: 0
        }
      });
    }

    const grouped = {};
    transactions.forEach(t => {
      const cardName = t.cards?.name || "Naməlum Kart";
      const monthIndex = new Date(t.createdAt).getMonth(); // 0–11
      if (!grouped[cardName]) grouped[cardName] = Array(12).fill(0);
      grouped[cardName][monthIndex] += t.amount || 0;
    });

    // Aylıq (Line chart üçün)
    const lineChartData = Object.entries(grouped).map(([cardName, monthlyData]) => ({
      cardName,
      data: monthlyData
    }));

    // Ümumi məbləğ (Doughnut üçün)
    const doughnutData = Object.entries(grouped).map(([cardName, monthlyData]) => ({
      cardName,
      totalAmount: monthlyData.reduce((sum, v) => sum + v, 0)
    }));

    doughnutData.sort((a, b) => b.totalAmount - a.totalAmount);

    res.status(200).json({
      success: true,
      months: [
        "Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun",
        "İyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"
      ],
      lineChartData,
      doughnutData,
      appliedFilters: {
        years: years || [],
        cardIds: cardIds || [],
        sirketIds: sirketIds || [],
        muessiseIds: muessiseIds || [],
        resultCount: transactions.length
      }
    });

  } catch (error) {
    console.error("Xərcləmə chart xətası:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
      error: error.message
    });
  }
};


//charts filters inside
export const getAllCompanies = async (req, res) => {
  try {
    const companies = await Sirket.find({}, { name: 1 });

    res.status(200).json({
      success: true,
      data: companies
    });
  } catch (error) {
    console.error("GetAllCompanies Xəta:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error."
    });
  }
};
// Müəssisələri gətir
export const getAllMuessiseler = async (req, res) => {
  try {
    const muessiseler = await Muessise.find({}, { muessise_name: 1 });

    res.status(200).json({
      success: true,
      data: muessiseler
    });
  } catch (error) {
    console.error("GetAllMuessiseler Xəta:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error."
    });
  }
};


//sorgular
export const getAllSorgular = async (req, res) => {
  try {
    const peopleId = req.params.peopleId;

    const user = await PeopleUser.findOne({ people_id: peopleId });

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User tapılmadı" });

    const sorgular = await Ticket.find({ user_id: user._id })
      .populate({
        path: "assigned.user",
        model: "AdminUser",
        select: "name surname",
      }).populate({
        path: "reason",
        model: SorgularReason,
        select: "name"
      });

    console.log("sorgular", sorgular);

    const formattedData = sorgular.map((sorgu) => ({
      status: sorgu.status,
      id: sorgu.ticket_id,
      title: sorgu.title,
      reason: sorgu.reason,
      responsible:
        sorgu.assigned && sorgu.assigned.length > 0
          ? sorgu.assigned
            .map((a) => `${a.user?.name || ''} ${a.user?.surname || ''}`)
            .join(", ")
          : "Təyin edilməyib",

      priority: sorgu.content,
      date: new Date(sorgu.createdAt).toLocaleDateString("az-AZ"),
      userType:
        sorgu.userModel === "PartnerUser"
          ? "Tərəfdaş"
          : sorgu.userModel === "AdminUser"
            ? "Admin"
            : "İstifadəçi",
    }));
    res.status(200).json({
      data: formattedData,
      recordsTotal: formattedData.length,
      recordsFiltered: formattedData.length,
    });
  } catch (error) {
    console.error("getAllSorgular error", error);
    res
      .status(500)
      .json({ success: false, message: "Internal Server Error." });
  }
};


export const checkUserCardsStatus = async (req, res) => {
  try {
    const { peopleId } = req.params;

    const user = await PeopleUser.findOne({ people_id: peopleId }).select("sirket_id _id");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Bu people ID ilə istifadəçi tapılmadı.",
      });
    }

    const allCards = await Cards.find({
      isDeleted: { $ne: true },
    })
      .select("_id name")
      .lean();

    if (!allCards.length) {
      return res.json({
        success: true,
        data: [],
        message: "Bu şirkətə aid kart yoxdur.",
      });
    }

    const userBalances = await PeopleCardBalance.find({
      user_id: user._id,
      isDeleted: { $ne: true },
    })
      .select("card_id status")
      .lean();

    // 4️⃣ Aktiv kartları Map şəklində saxla
    const activeCardsMap = new Map(
      userBalances
        .filter((b) => b.status === "active")
        .map((b) => [b.card_id.toString(), true])
    );

    const result = allCards.map((card) => ({
      cardId: card._id,
      cardName: card.name,
      isActive: activeCardsMap.has(card._id.toString()),
    }));

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("checkUserCardsStatus error:", error);
    res.status(500).json({
      success: false,
      message: "Kart statusları yoxlanarkən xəta baş verdi.",
    });
  }
};

export const getAllRequestsByUser = async (req, res) => {
  try {
    const { peopleId } = req.params;
    const { startDate, endDate, cardCategories, requestTypes, statuses, search } = req.body;

    // 🔹 User-i tapırıq
    const user = await PeopleUser.findOne({ people_id: peopleId }).select("_id sirket_id");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Bu people ID ilə istifadəçi tapılmadı.",
      });
    }

    // 🔹 Əsas query
    const query = { user_id: user._id, deleted: false };

    // ✅ Tarix filteri
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // ✅ Kartlar filteri
    if (cardCategories?.length > 0) {
      const ids = cardCategories.map(c => c.id);
      query.card_id = { $in: ids };
    }

    // ✅ Status filteri
    if (statuses?.length > 0) {
      query.status = { $in: statuses };
    }

    // 🔹 Bütün uyğun requestləri tapırıq
    let requests = await RequestCard.find(query)
      .populate("card_id", "name")
      .populate("reasons", "description")
      .sort({ createdAt: -1 });

    if (requestTypes?.length > 0) {
      requests = requests.filter(r => requestTypes.includes(r.actionMessage));
    }

    // ✅ Axtarış (search)
    if (search) {
      const lowerSearch = search.toLowerCase();
      requests = requests.filter(r =>
        r.card_id?.name?.toLowerCase().includes(lowerSearch)
      );
    }

    // 🔹 Heç nə tapılmadıqda
    if (!requests.length) {
      return res.status(200).json({ success: true, data: [] });
    }

    // 🔹 Tarixi formatlama helper
    const formatDate = (date) => {
      if (!date) return "-";
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      return `${day}.${month}.${year} - ${hours}:${minutes}`;
    };

    // 🔹 Formatlanmış nəticə
    const formatted = requests.map(r => ({
      id: r._id,
      card: r.card_id?.name || "—",
      date: formatDate(r.createdAt),
      type: r.actionMessage,
      resultDate: formatDate(r.action_time),
      result:
        r.status === "pending" ? "Gözləyir" :
          r.status === "rejected" ? "Rədd edilib" :
            r.status === "active" ? "Təsdiqlənib" : "Naməlum",
      reasons: r.reasons?.map(reason => reason.description).join(", ") || "-"
    }));

    res.status(200).json({
      success: true,
      data: formatted,
    });

  } catch (err) {
    console.error("Müraciətləri gətirərkən xəta:", err);
    res.status(500).json({
      success: false,
      message: "Serverdə xəta baş verdi",
    });
  }
};


export const getDeactivateReasons = async (req, res) => {
  try {
    const { cardId, peopleId } = req.params;
    console.log("[DEBUG] cardId:", cardId, "peopleId:", peopleId);

    // user tapılır
    const user = await PeopleUser.findOne({ people_id: peopleId }).select("_id sirket_id");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Bu people ID ilə istifadəçi tapılmadı.",
      });
    }

    // category "deactivate_reason" olan condition-ları tapırıq
    const reasons = await CardConditions.find({
      cardId,
      category: "deactivate_reason",
      deleted: false
    }).select("description title");

    console.log("[DEBUG] reasons found:", reasons);

    // Əgər səbəblər tapılmadısa, boş array qaytarırıq
    res.status(200).json({
      success: true,
      data: reasons.length ? reasons : [],
    });

  } catch (err) {
    console.error("Deactivate reasons fetch error:", err);
    res.status(500).json({ success: false, message: "Serverdə xəta baş verdi" });
  }
};



export const deactiveUserCard = async (req, res) => {
  try {
    const peopleId = req.body.peopleId;
    console.log("☺😋😎🥰😂", peopleId)
    const user = await PeopleUser.findOne({ people_id: peopleId });

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User tapılmadı" });
    const otp = generateOtp(6);
    const expire_time = new Date(Date.now() + 5 * 60 * 1000);

    const otpDoc = await OtpModel.create({
      user_id: user._id,
      email: user.email,
      phone_suffix: user.phone_suffix,
      phone_number: user.phone,
      otp,
      expire_time,
      otp_to: "sirket",
    });
    await sendMail(user.email, otp, true);
    console.log("OTP uğurla yaradıldı:", otpDoc);

    return res.json({
      success: true,
      message: "OTP göndərildi",
      otpRequired: true,
      email: user.email,
    });
  } catch (error) {
    console.error("Error in deactiveUserCard:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const acceptDeactiveUserCard = async (req, res) => {
  try {
    const { otp1, otp2, otp3, otp4, otp5, otp6, peopleId, cardId, reasonIds } = req.body;
    const otp = otp1 + otp2 + otp3 + otp4 + otp5 + otp6;
    console.log("😃😃🤣🤣😂bodymiz", req.body)

    const user = await PeopleUser.findOne({ people_id: peopleId });
    if (!user)
      return res.status(404).json({ success: false, message: "User tapılmadı" });

    const otpModelCheck = await OtpModel.findOne({
      user_id: user._id,
      otp,
      otp_to: "sirket",
    });

    if (!otpModelCheck)
      return res.status(401).json({ message: "Otp is wrong", success: false });

    if (otpModelCheck.expire_time.getTime() < Date.now())
      return res
        .status(401)
        .json({ message: "OTP üçün vaxt bitdi", success: false });

    // OTP istifadə olundu, silirik
    await OtpModel.deleteMany({ user_id: user._id, otp_to: "sirket" });


    const balanceDoc = await PeopleCardBalance.findOne({
      user_id: user._id,
      card_id: cardId,
      sirket_id: user.sirket_id
    });
    if (!balanceDoc) {
      return res.status(404).json({ success: false, message: "Kart balansı tapılmadı" });
    }
    balanceDoc.status = "inactive";

    await balanceDoc.save();

    const newRequest = await RequestCard.create({
      user_id: user._id,
      card_id: cardId,
      status: "active",
      actionMessage: "Kartın deaktiv edilməsi",
      action_time: new Date(),
      attempts: 1,
      reasons: reasonIds,
      deleted: false,
    });

    console.log("Yeni request yaradıldı:", newRequest);

    return res.status(200).json({
      message: "Kart deaktiv edildi",
      success: true,
    });
  } catch (error) {
    console.error("error message", error);
    return res
      .status(500)
      .json({ error: "Internal server error", success: false });
  }
};

export const getUserActivationSummary = async (req, res) => {
  try {
    const { peopleId, cardId } = req.params;

    console.log("📥 Gələn sorğu:", "peopleid", peopleId, "cardid", cardId);

    // 1️⃣ İstifadəçi məlumatlarını tapırıq
    const user = await PeopleUser.findOne({ people_id: peopleId })
      .populate("sirket_id", "sirket_name _id")
      .populate("duty", "name")
      .lean();

    if (!user) {
      console.warn("⚠️ İstifadəçi tapılmadı");
      return res.status(404).json({ success: false, message: "User tapılmadı" });
    }

    console.log("👤 Tapılan user:", user);

    // 2️⃣ Son aktiv request card (kartın deaktiv edilməsi) tapılır
    const request = await RequestCard.findOne({
      user_id: user._id,
      card_id: cardId,
      status: "active",
      actionMessage: "Kartın deaktiv edilməsi",
    })
      .sort({ createdAt: -1 })
      .populate("reasons", "title description")
      .lean();

    console.log("🧾 Tapılan request:", request);

    const requestData = request
      ? {
        status: request.status,
        actionMessage: request.actionMessage,
        reasons: request.reasons || [],
      }
      : {
        status: null,
        actionMessage: null,
        reasons: [],
      };

    // 3️⃣ Aktiv kartların adlarını gətiririk
    const activeCards = await PeopleCardBalance.find({
      user_id: user._id,
      sirket_id: user.sirket_id?._id,
      status: "active",
    })
      .populate("card_id", "name icon background_color")
      .lean();

    console.log("💳 Aktiv kartlar:", activeCards);

    let allRequests = await RequestCard.find({
      user_id: user._id,
      card_id: cardId,
    })
      .sort({ createdAt: -1 })
      .select("createdAt status actionMessage")
      .lean();

    allRequests = allRequests.map((item) => {
      const date = new Date(item.createdAt);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");

      return {
        ...item,
        createdAt: `${day}.${month}.${year} - ${hours}:${minutes}`,
      };
    });


    console.log("📄 Bütün request cards:", allRequests);

    const result = {
      success: true,
      userInfo: {
        name: user.name,
        surname: user.surname,
        gender: user.gender,
        birth_date: user.birth_date,
        duty: user.duty?.name || "",
        email: user.email,
        sirket_id: user.sirket_id?._id || null,
        sirket_name: user.sirket_id?.sirket_name || null,
        phone: `${user.phone_suffix || ""}${user.phone || ""}`,
      },
      requestInfo: requestData,
      activeCards:
        activeCards.map((card) => ({
          card_id: card.card_id._id,
          card_name: card.card_id.name,
          card_icon: card.card_id.icon,
          background_color: card.card_id.background_color,
        })) || [],
      allRequests: allRequests || [],
    };

    console.log("✅ Cavab hazırlanıb:", result);
    return res.status(200).json(result);
  } catch (error) {
    console.error("💥 Xəta baş verdi:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};




export const activateUserCard = async (req, res) => {
  try {
    const { peopleId } = req.body;
    console.log("📌 ActivateUserCard request:", req.body);

    // 1️⃣ İstifadəçini tapırıq
    const user = await PeopleUser.findOne({ people_id: peopleId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tapılmadı",
      });
    }

    // 2️⃣ Mövcud OTP-ni yoxlayırıq (eyni user və otp_to = sirket)
    let existingOtp = await OtpModel.findOne({
      user_id: user._id,
      otp_to: "sirket",
    }).sort({ createdAt: -1 }); // ən sonuncunu götür

    // Əgər OTP tapılıbsa və vaxtı keçməyibsə → yenisini yaratmırıq
    if (existingOtp && existingOtp.expire_time > new Date()) {
      console.log("🟡 Aktiv OTP artıq mövcuddur:", existingOtp.otp);
      return res.json({
        success: true,
        message: "OTP artıq göndərilib. Eyni OTP-ni yoxlayın.",
        otpRequired: true,
        email: user.email,
      });
    }

    // Əgər OTP varsa amma vaxtı keçibsə → silirik
    if (existingOtp && existingOtp.expire_time <= new Date()) {
      await OtpModel.deleteMany({ user_id: user._id, otp_to: "sirket" });
      console.log("⏰ Köhnə OTP vaxtı bitib, silindi.");
    }

    // 3️⃣ Yeni OTP yaradırıq
    const otp = generateOtp(6);
    const expire_time = new Date(Date.now() + 5 * 60 * 1000); // 5 dəqiqə

    const newOtp = await OtpModel.create({
      user_id: user._id,
      email: user.email,
      phone_suffix: user.phone_suffix,
      phone_number: user.phone,
      otp,
      expire_time,
      otp_to: "sirket",
      createdAt: new Date(),
    });

    await sendMail(user.email, otp, true);
    console.log("🟢 Yeni OTP yaradıldı və göndərildi:", otp);

    return res.json({
      success: true,
      message: "Yeni OTP göndərildi.",
      otpRequired: true,
      email: user.email,
    });

  } catch (error) {
    console.error("❌ Error in activateUserCard:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};


export const confirmActivateUserCard = async (req, res) => {
  try {
    const { otp1, otp2, otp3, otp4, otp5, otp6, peopleId, cardId } = req.body;
    const otp = otp1 + otp2 + otp3 + otp4 + otp5 + otp6;
    console.log("📩 OTP verification request:", req.body);

    const user = await PeopleUser.findOne({ people_id: peopleId });
    if (!user)
      return res.status(404).json({ success: false, message: "User tapılmadı" });

    // 1️⃣ OTP-ni yoxlayırıq
    const otpCheck = await OtpModel.findOne({
      user_id: user._id,
      otp_to: "sirket",
    });

    if (!otpCheck)
      return res.status(401).json({
        success: false,
        message: "OTP tapılmadı. Zəhmət olmasa yenidən göndərin.",
      });

    if (otpCheck.otp !== otp) {
      if (otpCheck.expire_time.getTime() < Date.now()) {
        return res.status(401).json({
          success: false,
          message: "OTP üçün vaxt bitdi. Yenidən göndərin.",
        });
      }
      return res.status(401).json({
        success: false,
        message: "OTP səhvdir, yenidən yoxlayın.",
        retry: true,
      });
    }

    if (otpCheck.expire_time.getTime() < Date.now())
      return res.status(401).json({
        success: false,
        message: "OTP üçün vaxt bitdi. Yenidən göndərin.",
      });

    await OtpModel.deleteMany({ user_id: user._id, otp_to: "sirket" });

    // 2️⃣ Kart balansını tapırıq və ya yaradırıq
    let balanceDoc = await PeopleCardBalance.findOne({
      user_id: user._id,
      card_id: cardId,
      sirket_id: user.sirket_id,
    });

    if (!balanceDoc) {
      balanceDoc = await PeopleCardBalance.create({
        user_id: user._id,
        card_id: cardId,
        sirket_id: user.sirket_id,
        status: "active",
        balance: 0,
      });
      console.log("Yeni aktiv kart yaradıldı:", balanceDoc);
    } else {
      balanceDoc.status = "active";
      await balanceDoc.save();
      console.log("Kart statusu 'active' olaraq yeniləndi:", balanceDoc);
    }

    const newRequest = await RequestCard.create({
      user_id: user._id,
      card_id: cardId,
      status: "active",
      actionMessage: "Kartın aktivləşdirilməsi",
      action_time: new Date(),
      attempts: 1,
      reasons: [],
      deleted: false,
    });

    console.log("Yeni request yaradıldı:", newRequest);

    return res.status(200).json({
      success: true,
      message: "Kart aktivləşdirilməsi tamamlandı",
      activeCard: balanceDoc,
    });
  } catch (error) {
    console.error("Error in confirmActivateUserCard:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getUserRequestCards = async (req, res) => {
  try {
    const { peopleId } = req.params;

    const user = await PeopleUser.findOne({ people_id: peopleId });
    if (!user)
      return res.status(404).json({ success: false, message: "User tapılmadı" });

    const requests = await RequestCard.find({ user_id: user._id })
      .populate("reasons", "name description")
      .select("actionMessage _id status action_time reasons")
      .sort({ createdAt: -1 });

    // 3️⃣ Tapılmadıqda
    if (!requests || requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Bu istifadəçi üçün heç bir request tapılmadı",
      });
    }

    // 4️⃣ Cavabı qaytarırıq
    return res.status(200).json({
      success: true,
      total: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error("❌ Error in getUserRequestCards:", error);
    return res.status(500).json({
      success: false,
      message: "Server xətası baş verdi",
    });
  }
};


export default { deactivatePeopleUser, activatePeopleUser, requestDeletePeopleUser };
