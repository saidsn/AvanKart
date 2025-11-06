import MukafatFolder from "../../../../shared/models/mukafatFolderModel.js";
import UserMukafat from "../../../../shared/models/userMukafat.js";
import Mukafat from "../../../../shared/models/mukafatModal.js";
import PeopleUser from "../../../../shared/models/peopleUserModel.js";
import Cards from "../../../../shared/models/cardModel.js";

// Mövcud getMukafat
export const getMukafat = async (req, res) => {
  try {
    return res.render("pages/emeliyyatlar/avankart/mukafat", {
      error: "",
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    console.error("getMukafat error:", error);
    return res.status(500).send("Internal Server Error");
  }
};

// API endpoint: Əsas səhifə - siyahı + filter + pagination
export const apiGetMukafatFolders = async (req, res) => {
  try {
    let { page = 1, limit = 10, search, status, month, year } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const query = {};

    if (search) {
      query.folder_id = { $regex: search, $options: "i" };
    }
    if (status) {
      query.$expr = {
        $cond: [
          {
            $and: [
              { $eq: [{ $month: "$createdAt" }, new Date().getMonth() + 1] },
              { $eq: [{ $year: "$createdAt" }, new Date().getFullYear()] },
            ],
          },
          status === "ongoing" ? true : false,
          status === "completed" ? true : false,
        ],
      };
    }
    if (month && year) {
      query.createdAt = {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1),
      };
    }

    const total = await MukafatFolder.countDocuments(query);
    const folders = await MukafatFolder.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json({ total, page, limit, folders });
  } catch (error) {
    console.error("apiGetMukafatFolders error:", error);
    return res.status(500).send("Internal Server Error");
  }
};

// Mövcud getMukafatDetails
export const getMukafatDetails = async (req, res) => {
  try {
    return res.render("pages/emeliyyatlar/avankart/mukafatDetails", {
      error: "",
      csrfToken: req.csrfToken(),
      data: [],
    });
  } catch (error) {
    console.error("getMukafatDetails error:", error);
    return res.status(500).send("Internal Server Error");
  }
};

// API endpoint: Daxili səhifə - folder detayları + filter + pagination
export const apiGetMukafatDetails = async (req, res) => {
  try {
    const { folder_id } = req.params;
    let {
      page = 1,
      limit = 10,
      userSearch,
      card,
      startDate,
      endDate,
      minAmount,
      maxAmount,
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const folder = await MukafatFolder.findOne({ folder_id });
    if (!folder) return res.status(404).json({ message: "Folder tapılmadı" });

    const query = { folder_id: folder._id };

    if (userSearch) {
      const users = await PeopleUser.find({
        $or: [
          { name: { $regex: userSearch, $options: "i" } },
          { surname: { $regex: userSearch, $options: "i" } },
        ],
      }).select("_id");
      query.user = { $in: users.map((u) => u._id) };
    }

    if (card) {
      const cards = await Cards.find({
        name: { $regex: card, $options: "i" },
      }).select("_id");
      query.mukafat = { $in: cards.map((c) => c._id) };
    }

    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    if (minAmount || maxAmount) {
      query.earned = {};
      if (minAmount) query.earned.$gte = parseFloat(minAmount);
      if (maxAmount) query.earned.$lte = parseFloat(maxAmount);
    }

    const total = await UserMukafat.countDocuments(query);
    const details = await UserMukafat.find(query)
      .populate("user")
      .populate({
        path: "mukafat",
        populate: { path: "forCard" },
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json({ total, page, limit, details, folder });
  } catch (error) {
    console.error("apiGetMukafatDetails error:", error);
    return res.status(500).send("Internal Server Error");
  }
};

// Kartları getiren API endpoint
export const apiGetCards = async (req, res) => {
  try {
    const cards = await Cards.find({}).select("_id name");
    return res.json(cards);
  } catch (error) {
    console.error("apiGetCards error:", error);
    return res.status(500).json({ message: "Server xətası" });
  }
};

// Yeni mükafat yaratmaq
// createMukafat fonksiyonunu iyileştirin
export const createMukafat = async (req, res) => {
  try {
    const {
      forCard,
      name,
      description,
      target,
      conditions,
      gift,
      gift_conditions,
    } = req.body;

    // Gerekli alanları kontrol et
    if (!name || !forCard) {
      return res.status(400).json({
        success: false,
        message: "Mükafat adı ve kart seçimi zorunludur",
      });
    }

    const mukafat = new Mukafat({
      forCard,
      name,
      description: description || "",
      target: parseInt(target) || 0,
      conditions: conditions || "",
      gift: gift || "",
      gift_conditions: gift_conditions || "",
      creator: req.user?._id || null,
    });

    await mukafat.save();

    return res.status(201).json({
      success: true,
      message: "Mükafat uğurla yaradıldı",
      mukafat: mukafat,
      mockData: {
        invoice: `AINV-${Date.now().toString().slice(-6)}`,
        customers: Math.floor(Math.random() * 300) + 200,
        transactions: Math.floor(Math.random() * 400) + 100,
        amount: parseFloat(target) || 100.0,
        date: new Date().toLocaleDateString("az-AZ"),
        status: "Davam edir",
      },
    });
  } catch (error) {
    console.error("createMukafat error:", error);
    return res.status(500).json({
      success: false,
      message: "Server xətası: " + error.message,
    });
  }
};

// Yeni folder yaratmaq
export const createMukafatFolder = async (req, res) => {
  try {
    const folder = new MukafatFolder();
    await folder.save();
    return res.status(201).json({ message: "Yeni folder yaradıldı", folder });
  } catch (error) {
    console.error("createMukafatFolder error:", error);
    return res.status(500).json({ message: "Server xətası" });
  }
};
