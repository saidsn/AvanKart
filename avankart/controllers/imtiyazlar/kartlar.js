import Cards from "../../../shared/models/cardModel.js";
import AddedBalance from "../../../shared/model/people/addedBalances.js";
import CardConditions from "../../../shared/models/cardConditionsModel.js";
import RequestCard from "../../../shared/model/people/requestActivateCard.js";
import PeopleUser from "../../../shared/models/peopleUserModel.js";
import PeopleUsers from "../../../shared/models/peopleUsersModel.js";
import PeopleCardBalance from "../../../shared/model/people/cardBalances.js";
import CardsCategory from "../../../shared/models/cardsCategoryModel.js";
import mongoose from "mongoose";

import fs from "fs";
import path from "path";

const iconsDir = path.join(process.cwd(), "public/icons");

function formatDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // özel regex karakterlerini \ ile kaçar
}

export const getCards = async (req, res) => {
  try {
    return res.render("pages/imtiyazlar/kartlar", {
      error: "",
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    console.error("delete-ticket error:", error);
    return res.status(500).send("Internal Server Error");
  }
};

export const getIcons = async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 20;
  const search = (req.query.search || "").toLowerCase();

  fs.readdir(iconsDir, (err, files) => {
    if (err) return res.status(500).json({ error: err.message });

    let svgs = files.filter((file) => file.endsWith(".svg"));
    if (search) {
      svgs = svgs.filter((file) => file.toLowerCase().includes(search));
    }
    const sliced = svgs.slice(page * limit, (page + 1) * limit);

    res.json(sliced);
  });
};

export const getTotalCardCount = async (req, res) => {
  try {
    const totalCards = await Cards.countDocuments();

    res.json({
      success: true,
      totalCards: totalCards,
      message: `Toplam ${totalCards} kart mövcuddur.`,
    });
  } catch (error) {
    console.error("Kart sayısı hesaplanırken hata:", error);
    res.status(500).json({
      success: false,
      message: "Kart sayısı hesaplanırken bir hata oluştu.",
    });
  }
};

export const getCardsData = async (req, res) => {
  const { draw } = req.body;
  const { search, filters } = req.query;
  try {
    const allCards = await Cards.countDocuments();

    const match = {};
    if (search && search.trim()) {
      const safeSearch = escapeRegex(search.trim());
      match.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { status: { $regex: safeSearch, $options: "i" } },
      ];
    }
    if (filters) {
      if (filters.status && filters.status.length > 0) {
        match.status = { $in: filters.status };
      }
      if (filters.card_category && filters.card_category.length > 0) {
        match.category = {
          $in: filters.card_category.map(
            (id) => new mongoose.Types.ObjectId(id) // 👈 new ekledim
          ),
        };
      }
    }

    const statistics = await Cards.aggregate([
      // 1. Lookup: peoplecardbalances (for active / passive)
      { $match: match },
      {
        $lookup: {
          from: "peoplecardbalances",
          localField: "_id",
          foreignField: "card_id",
          as: "balances",
        },
      },

      // 2. Lookup: requestcards (for waiting / rejected)
      {
        $lookup: {
          from: "requestcards",
          localField: "_id",
          foreignField: "card_id",
          as: "requests",
        },
      },
      {
        $project: {
          name: 1,
          icon: 1,
          background_color: 1,
          status: 1,

          // Active
          activeUsers: {
            $size: {
              $filter: {
                input: "$balances",
                as: "b",
                cond: { $eq: ["$$b.status", "active"] },
              },
            },
          },

          // Passive
          deactiveUsers: {
            $size: {
              $filter: {
                input: "$balances",
                as: "b",
                cond: { $eq: ["$$b.status", "passive"] },
              },
            },
          },

          // Rejected
          rejected: {
            $size: {
              $filter: {
                input: "$requests",
                as: "r",
                cond: { $eq: ["$$r.status", "rejected"] },
              },
            },
          },

          // Waiting
          appeals: {
            $size: {
              $filter: {
                input: "$requests",
                as: "r",
                cond: { $eq: ["$$r.status", "waiting"] },
              },
            },
          },
        },
      },

      { $sort: { name: 1 } },
    ]);

    // UI için formatlı veriyi oluştur
    const formattedData = statistics.map((card) => {
      const typeMap = {
        Yemək: "Yemək",
        Hədiyyə: "Hədiyyə",
        Yanacaq: "Yanacaq",
        Market: "Market",
        Biznes: "Biznes",
        Premium: "Premium",
        "Avto Yuma": "Avto Yuma",
      };

      // Arkaplan renk mapping'i
      const backgroundMap = {
        Yemək: "bg-[#FFBC0D]",
        Hədiyyə: "bg-[#32B5AC]",
        Yanacaq: "bg-[#64D2FF]",
        Market: "bg-[#34A853]",
        Biznes: "bg-[#00A3FF]",
        Premium: "bg-[#B5D38F]",
        "Avto Yuma": "bg-[#B8CDF2]",
      };

      // Logo mapping'i
      const logoMap = {
        Yemək: "/images/Avankart/Imtiyazlar/Kartlar/ForkKnife.svg",
        Hədiyyə: "/images/Avankart/Imtiyazlar/Kartlar/Gift.svg",
        Yanacaq: "/images/Avankart/Imtiyazlar/Kartlar/lucide_fuel.svg",
        Market: "/images/Avankart/Imtiyazlar/Kartlar/ShoppingBag.svg",
        Biznes: "/images/Avankart/Imtiyazlar/Kartlar/Briefcase.svg",
        Premium: "/images/Avankart/Imtiyazlar/Kartlar/CurrencyEth.svg",
        "Avto Yuma": "/images/Avankart/Imtiyazlar/Kartlar/uil_car-wash.svg",
      };

      const kartType = typeMap[card.name] || card.name;
      const background =
        card.background_color || backgroundMap[card.name] || "bg-gray-200";
      const kartLogo = card.icon || logoMap[card.name] || "/icons/card-01.svg";

      return {
        kartId: card._id,
        kartLogo: kartLogo,
        background: background,
        kartType: kartType,
        activeUsers: card.activeUsers?.toString() || "0",
        deactiveUsers: card.deactiveUsers?.toString() || "0",
        rejected: card.rejected?.toString() || "0",
        appeals: card.appeals?.toString() || "0",
        status: card.status === "active" ? "Aktiv" : "Deaktiv",
      };
    });

    return res.json({
      success: true,
      draw,
      data: formattedData,
      totalCards: statistics.length,
      recordsFiltered: statistics.length,
      recordsTotal: allCards,
    });
  } catch (error) {
    console.error("Kart istatistikleri alınırken hata:", error);
    res.status(500).json({
      success: false,
      message: "Kart istatistikleri alınırken bir hata oluştu.",
    });
  }
};

export const getCardData = async (req, res) => {
  try {
    const { kartId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(kartId)) {
      console.warn("Invalid card ID format:", kartId);
      return res.status(400).render("pages/404", {
        error: "Invalid card ID format",
        csrfToken: req.csrfToken(),
      });
    }

    // Kart bilgilerini veritabanından çek
    const card = await Cards.findById(kartId);

    if (!card) {
      return res.status(404).render("pages/404", {
        error: "Kart bulunamadı",
        csrfToken: req.csrfToken(),
      });
    }

    // EJS template'ine gönderilecek veri
    const cardData = {
      id: card._id,
      name: card.name,
      icon: card.icon,
      description: card.description || `${card.name} kartı`,
      status: card.status,
      background: card.background_color,
      logo: card.icon,
      createdAt: card.createdAt
        ? new Date(card.createdAt).toLocaleDateString("tr-TR")
        : "Bilinmir",
    };

    return res.render("pages/imtiyazlar/kartlarInside", {
      error: "",
      csrfToken: req.csrfToken(),
      card: cardData,
      users: [],
    });
  } catch (error) {
    console.error("Kart detayı getirilirken hata:", error);
    return res.status(500).render("pages/404", {
      error: "Kart detayları getirilirken bir hata oluştu",
      csrfToken: req.csrfToken(),
    });
  }
};

export const getCardFormattedData = async (req, res) => {
  try {
    const { kartId } = req.params; // /cards/edit/:id

    const card = await Cards.findById(kartId);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: "Card not found",
      });
    }

    // Return only the fields needed for edit
    const cardData = {
      id: card._id,
      name: card.name,
      description: card.description || "",
      background_color: card.background_color || "",
      icon: card.icon || "",
      status: card.status,
    };

    return res.status(200).json({
      success: true,
      data: cardData,
    });
  } catch (error) {
    console.error("Error fetching card for edit:", error);
    return res.status(500).json({
      success: false,
      message: "Error occurred while fetching card",
    });
  }
};

export const getCardConditions = async (req, res) => {
  try {
    const { kartId } = req.params;
    const { category = "usage" } = req.query; // usage, activate, deactivate, deactivate_reason

    // Geçerli category değerlerini kontrol et
    const validCategories = [
      "usage",
      "activate",
      "deactivate",
      "deactivate_reason",
    ];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message:
          "Geçersiz kategori. Geçerli kategoriler: usage, activate, deactivate, deactivate_reason",
      });
    }

    // Kartın var olup olmadığını kontrol et
    const card = await Cards.findById(kartId);
    if (!card) {
      return res.status(404).json({
        success: false,
        message: "Kart bulunamadı",
      });
    }

    // CardConditions'dan verileri çek
    const conditions = await CardConditions.find({
      cardId: kartId,
      category: category,
      isDeleted: { $ne: true }, // Soft delete kontrolü
    })
      .populate("creator", "name email") // Creator bilgilerini getir
      .sort({ createdAt: 1 }); // Oluşturulma tarihine göre sırala

    // Frontend için formatlı veri oluştur
    const formattedConditions = conditions.map((condition, index) => {
      return {
        id: condition._id,
        description: condition.description,
        title: condition.title,
        category: condition.category,
        creator: condition.creator ? condition.creator.name : "Bilinmeyen",
        createdAt: condition.createdAt,
        order: index + 1,
      };
    });

    // Kategoriye göre Türkçe başlık belirle
    const categoryTitles = {
      usage: "İstifadə qaydaları",
      activate: "Aktivasiya şərtləri",
      deactivate: "Deaktivasiya şərtləri",
      deactivate_reason: "Deaktiv etmə səbəbləri",
    };

    res.json({
      success: true,
      data: formattedConditions,
      category: category,
      categoryTitle: categoryTitles[category] || "Şərtlər",
      totalCount: formattedConditions.length,
      cardInfo: {
        id: card._id,
        name: card.name,
        status: card.status,
      },
    });
  } catch (error) {
    console.error("Kart şartları getirilirken hata:", error);
    res.status(500).json({
      success: false,
      message: "Kart şartları getirilirken bir hata oluştu.",
    });
  }
};

export const getCardUsers = async (req, res) => {
  try {
    const { kartId } = req.params;
    const {
      status = "",
      page = 1,
      limit = 10,
      search = "",
      filters = {},
    } = req.query;

    const validStatuses = ["waiting", "active", "inactive", "rejected"];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const card = await Cards.findById(kartId);
    if (!card) {
      return res.status(404).json({ success: false, message: "Invalid card" });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // --- SEARCH FILTER ---
    let searchFilter = {};
    if (search && search.trim() !== "") {
      const safeSearch = escapeRegex(search.trim());
      const searchRegex = new RegExp(safeSearch, "i");

      searchFilter = {
        $or: [
          { name: searchRegex },
          { surname: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
        ],
      };
    }

    // --- POPUP FILTERS ---
    let filterMatch = {};
    if (filters) {
      // date range filter
      if (filters.start_date || filters.end_date) {
        filterMatch.createdAt = {};
        if (filters.start_date)
          filterMatch.createdAt.$gte = new Date(filters.start_date);
        if (filters.end_date)
          filterMatch.createdAt.$lte = new Date(filters.end_date);
      }
    }

    // --- DB QUERY ---
    let userData = null;
    if (status == "active" || status == "inactive") {
      userData = await PeopleCardBalance.find({
        card_id: kartId,
        status: status,
        isDeleted: { $ne: true },
        ...filterMatch,
      })
        .populate({
          path: "user_id",
          select: "name surname email phone phone_suffix people_id",
          match: searchFilter,
          populate: { path: "sirket_id", select: "sirket_name" },
        })
        .sort({ action_time: -1 })
        .skip(skip)
        .limit(limitNum);
    } else {
      userData = await RequestCard.find({
        card_id: kartId,
        status: status,
        isDeleted: { $ne: true },
        ...filterMatch,
      })
        .populate({
          path: "user_id",
          select: "name surname email phone phone_suffix people_id",
          match: searchFilter,
          populate: { path: "sirket_id", select: "sirket_name" },
        })
        .populate({ path: "reasons", select: "description title" })
        .sort({ action_time: -1 })
        .skip(skip)
        .limit(limitNum);

      if (status === "waiting" && userData.length > 0) {
        const combos = userData
          .map((u) => ({
            userId: u.user_id?._id,
            sirketId: u.user_id?.sirket_id?._id,
          }))
          .filter((c) => c.userId && c.sirketId);

        if (combos.length === 0) return;

        const userIds = combos.map((c) => c.userId);
        const sirketIds = combos.map((c) => c.sirketId);

        const existingBalances = await PeopleCardBalance.find({
          user_id: { $in: userIds },
          card_id: kartId,
          sirket_id: { $in: sirketIds },
          isDeleted: { $ne: true },
        }).select("user_id sirket_id status");

        const balanceMap = new Map(
          existingBalances.map((b) => [
            `${b.user_id.toString()}_${b.sirket_id.toString()}`,
            b.status,
          ])
        );

        userData = userData.map((u) => {
          const userIdStr = u.user_id?._id?.toString();
          const sirketIdStr = u.user_id?.sirket_id?._id?.toString();
          const key = `${userIdStr}_${sirketIdStr}`;
          const balanceStatus = balanceMap.get(key);

          let actionMessage = "Kartın aktivləşdirilməsi";
          if (balanceStatus === "active") {
            actionMessage = "Kartın deaktiv edilməsi";
          }

          return { ...u.toObject(), actionMessage };
        });
      }
    }

    // --- NULL user_id FILTER ---
    const filteredUserData = userData.filter((u) => u.user_id !== null);

    // --- FORMAT RESPONSE ---
    const formattedUsers = filteredUserData.map((u) => {
      const user = u.user_id;
      return {
        id: u._id,
        peopleId: user.people_id,
        userId: user._id,
        fullName: `${user.name || ""} ${user.surname || ""}`.trim(),
        actionMessage: u.actionMessage || null,
        email: user.email || "",
        phone: user.phone ? `+${user.phone_suffix} ${user.phone}` : "",
        company: user.sirket_id?.sirket_name || "",
        status: u.status,
        actionTime: u.action_time,
        requestDate: formatDate(u.createdAt),
        attempts: u.attempts,
        reasons:
          u.reasons?.map((r) => ({
            id: r._id,
            description: r.description,
            title: r.title,
          })) || [],
        cardInfo: { id: card._id, name: card.name },
      };
    });

    // --- TOTAL COUNT FOR PAGINATION ---
    const totalCount = filteredUserData.length;

    res.json({
      success: true,
      data: formattedUsers,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalItems: totalCount,
        itemsPerPage: limitNum,
      },
      status,
      searchTerm: search,
      filters,
      cardInfo: { id: card._id, name: card.name },
    });
  } catch (error) {
    console.error("Kart kullanıcıları getirilirken hata:", error);
    res.status(500).json({
      success: false,
      message: "Kart kullanıcıları getirilirken bir hata oluştu.",
    });
  }
};

export const createCardCondition = async (req, res) => {
  try {
    const { kartId } = req.params;
    const { title, description, category } = req.body;
    const creatorId = req.user?.id;

    const card = await Cards.findById(kartId);
    if (!card) {
      return res.status(404).json({
        success: false,
        message: "Kart bulunamadı",
      });
    }

    // Category doğrulaması
    const validCategories = [
      "usage",
      "activate",
      "deactivate",
      "deactivate_reason",
    ];
    if (category && !validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category`,
      });
    }

    // Yeni condition oluştur
    const newCondition = await CardConditions.create({
      cardId: kartId,
      title: title || "usage",
      description,
      category: category || "usage",
      creator: creatorId,
    });

    return res.status(201).json({
      success: true,
      message: "Yeni şərt əlavə edildi",
      data: newCondition,
    });
  } catch (error) {
    console.error("Yeni condition eklenirken hata:", error);
    res.status(500).json({
      success: false,
      message: "Yeni condition eklenirken bir hata oluştu.",
    });
  }
};

export const updateCardCondition = async (req, res) => {
  try {
    const { conditionId } = req.params;
    const { title, description, category } = req.body;
    const updaterId = req.user?.id;

    const condition = await CardConditions.findById(conditionId);
    if (!condition) {
      return res.status(404).json({
        success: false,
        message: "Condition not found",
      });
    }

    const validCategories = [
      "usage",
      "activate",
      "deactivate",
      "deactivate_reason",
    ];
    if (category && !validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category",
      });
    }

    condition.title = title || condition.title;
    condition.description = description || condition.description;
    condition.category = category || condition.category;
    condition.updater = updaterId;

    await condition.save();

    res.status(200).json({
      success: true,
      message: "Condition updated successfully",
      data: condition,
    });
  } catch (error) {
    console.error("Error updating condition:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while updating condition",
    });
  }
};

export const deleteCardCondition = async (req, res) => {
  try {
    const { conditionId } = req.params;

    const deleted = await CardConditions.findByIdAndDelete(conditionId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Condition not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Condition deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting condition:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while deleting condition",
    });
  }
};

export const createCard = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      background_color,
      icon,
      status = "active",
    } = req.body;
    const creatorId = req.user?.id;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: "Name and category are required",
      });
    }

    const newCard = await Cards.create({
      name,
      description,
      category,
      background_color: background_color || "",
      icon: icon || "",
      status: status || "inactive",
      creator: creatorId,
    });

    res.status(201).json({
      success: true,
      message: "Card created successfully",
      data: newCard,
    });
  } catch (error) {
    console.error("Error creating card:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while creating card",
    });
  }
};

// Update card using findByIdAndUpdate
export const updateCard = async (req, res) => {
  try {
    const cardId = req.params.id;
    const { name, description, background_color, icon } = req.body;

    // Update only provided fields
    const updatedCard = await Cards.findByIdAndUpdate(
      cardId,
      { name, description, background_color, icon },
      { new: true, runValidators: true } // return updated doc and validate
    );

    if (!updatedCard) {
      return res
        .status(404)
        .json({ success: false, message: "Card not found" });
    }

    res.status(200).json({
      success: true,
      message: "Card updated successfully",
      data: updatedCard,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ success: false, message: "Error updating card" });
  }
};

export const updateCardStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive", "archived"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const updatedCard = await Cards.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true, context: "query" }
    );

    if (!updatedCard) {
      return res.status(404).json({
        success: false,
        message: "Card not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: updatedCard,
    });
  } catch (error) {
    console.error("Error updating card status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating card status",
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await CardsCategory.find().select("name _id").lean();

    return res.json({
      success: true,
      data: categories.map((c) => ({
        id: c._id,
        name: c.name,
      })),
    });
  } catch (error) {
    console.error("Kart kategorileri alınırken hata:", error);
    return res.status(500).json({
      success: false,
      message: "Server xətası",
    });
  }
};

export const respondToRequestCard = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { decision } = req.body; // "approve" or "reject"

    const validDecisions = ["approve", "reject"];
    if (!validDecisions.includes(decision)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid decision" });
    }

    // find request and populate user + company + card
    const request = await RequestCard.findById(requestId)
      .populate({
        path: "user_id",
        populate: { path: "sirket_id", select: "_id" },
      })
      .populate("card_id");

    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    const existingBalance = await PeopleCardBalance.findOne({
      user_id: request.user_id?._id,
      card_id: request.card_id,
      sirket_id: request.user_id.sirket_id,
      isDeleted: { $ne: true },
    }).select("status");

    let actionMessage = "Kartın aktivləşdirilməsi";
    if (existingBalance && existingBalance.status === "active") {
      actionMessage = "Kartın deaktiv edilməsi";
    }

    // reject case
    if (decision === "reject") {
      await RequestCard.findByIdAndUpdate(requestId, {
        status: "rejected",
        actionMessage: actionMessage,
        action_time: new Date(),
      });
      return res.json({ success: true, message: "Request rejected" });
    }

    // approve case
    await RequestCard.findByIdAndUpdate(requestId, {
      status: "approved",
      actionMessage: actionMessage,
      action_time: new Date(),
    });

    // check existing balance
    const existing = await PeopleCardBalance.findOne({
      card_id: request.card_id._id,
      user_id: request.user_id._id,
      sirket_id: request.user_id.sirket_id._id, // must include company for uniqueness
      isDeleted: { $ne: true },
    });

    if (!existing) {
      // create new active balance if not exists
      await PeopleCardBalance.create({
        card_id: request.card_id._id,
        user_id: request.user_id._id,
        sirket_id: request.user_id.sirket_id._id,
        balance: 0,
        status: "active",
      });
    } else {
      if (existing.status == "active") {
        // toggle status to active
        await PeopleCardBalance.findByIdAndUpdate(existing._id, {
          status: "inactive",
        });
      } else {
        await PeopleCardBalance.findByIdAndUpdate(existing._id, {
          status: "active",
        });
      }
    }

    return res.json({
      success: true,
      message: "Request approved and balance activated",
    });
  } catch (err) {
    console.error("respondToRequestCard error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateCardBalanceStatus = async (req, res) => {
  try {
    const { balanceId } = req.params;

    const existing = await PeopleCardBalance.findById(balanceId);

    if (!existing)
      return res
        .status(404)
        .json({ success: false, message: "Balance not found" });

    if (existing.status == "active") {
      // toggle status to active
      await PeopleCardBalance.findByIdAndUpdate(existing._id, {
        status: "inactive",
        updatedAt: new Date(),
      });
    } else if (existing.status == "inactive") {
      await PeopleCardBalance.findByIdAndUpdate(existing._id, {
        status: "active",
        updatedAt: new Date(),
      });
    }

    res.json({
      success: true,
      message: `Balance status updated.`,
    });
  } catch (err) {
    console.error("updateCardBalanceStatus error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getDataForAcceptionPopup = async (req, res) => {
  try {
    const { id } = req.params;
    const tabName = req.query.for || "";

    const validTabs = ["requests", "inactives"];
    if (!validTabs.includes(tabName)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid tab name" });
    }

    // Step 1: Find request or card balance by ID
    let requestDoc;
    if (tabName === "requests") {
      requestDoc = await RequestCard.findById(id).populate({
        path: "user_id",
        select:
          "name surname gender birth_date email phone sirket_id duty createdAt",
        populate: [
          { path: "sirket_id", select: "name" },
          { path: "duty", select: "name" },
        ],
      });
    } else {
      requestDoc = await PeopleCardBalance.findById(id).populate({
        path: "user_id",
        select:
          "name surname gender birth_date email phone sirket_id duty createdAt",
        populate: [
          { path: "sirket_id", select: "name" },
          { path: "duty", select: "name" },
        ],
      });
    }

    if (!requestDoc) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    const user = requestDoc.user_id;
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Step 2: Get user's active cards
    const activeCards = await PeopleCardBalance.find({
      user_id: user._id,
      status: "active",
    })
      .populate({
        path: "card_id",
        select: "name background_color icon",
      })
      .select("card_id");

    const activeCardsFormatted = activeCards.map((c) => ({
      id: c.card_id?._id,
      name: c.card_id?.name,
      bgColor: c.card_id?.background_color,
      icon: c.card_id?.icon,
    }));

    // Step 3: Get user's previous requests (exclude current & waiting)
    const previousRequests = await RequestCard.find({
      user_id: user._id,
      _id: { $ne: id },
      status: { $in: ["approved", "rejected"] },
    })
      .sort({ createdAt: -1 })
      .select("createdAt status actionMessage");

    const previousRequestsFormatted = previousRequests.map((r) => ({
      requestDate: new Date(r.createdAt).toLocaleString("az-AZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      requestType: r.actionMessage || "Bilinmir",
      status: r.status,
    }));

    const existingBalance = await PeopleCardBalance.findOne({
      user_id: user._id,
      card_id: requestDoc.card_id,
      sirket_id: requestDoc.sirket_id,
      isDeleted: { $ne: true },
    }).select("status");

    let actionMessage = "Kartın aktivləşdirilməsi";
    if (existingBalance && existingBalance.status === "active") {
      actionMessage = "Kartın deaktiv edilməsi";
    }

    // Step 4: Prepare response
    const data = {
      fullName: `${user.name} ${user.surname}`,
      gender: user.gender,
      birthDate: user.birth_date,
      duty: user.duty?.name || null,
      email: user.email,
      company: user.sirket_id?.name || null,
      phone: user.phone,
      requestDate: requestDoc.createdAt,
      requestType: actionMessage,
      activeCards: activeCardsFormatted,
      previousRequests: previousRequestsFormatted,
    };

    res.json({ success: true, data });
  } catch (err) {
    console.error("getDataForAcceptionPopup error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
