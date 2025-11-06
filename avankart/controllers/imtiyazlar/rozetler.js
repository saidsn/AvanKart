import mongoose from "mongoose";
import CardsCategory from "../../../shared/models/cardsCategoryModel.js";
import Cards from "../../../shared/models/cardModel.js";
import Rozet from "../../../shared/models/rozetModel.js";
import RozetCategory from "../../../shared/models/rozetCategoryModel.js";
// Rozet Categories Controllers
export const getRozetCategories = async (req, res) => {
  try {
    // const categories = await CardsCategory.find().select("name _id").lean();
    return res.render("pages/imtiyazlar/rozetler/rozetler", {
      error: "",
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    console.error("Kart kategorileri alınırken hata:", error);
    return res.status(500).json({
      success: false,
      message: "Server xətası",
    });
  }
};

export const getRozetCategoriesPost = async (req, res) => {
  try {
    const { search } = req.body;

    // Case-insensitive
    const query = {};
    if (search && search.trim() !== "") {
      query.name = { $regex: search.trim(), $options: "i" };
    }

    const categories = await RozetCategory.find(query)
      .populate("creator", "name surname")
      .lean();

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server xətası",
      data: [],
    });
  }
};

export const editRozetCategoryName = async (req, res) => {
  const { id } = req.params;
  const { categoryName } = req.body;
  if (!categoryName || categoryName.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Kateqoriya adı boş ola bilməz.",
    });
  }
  try {
    const updatedCategory = await RozetCategory.findByIdAndUpdate(
      id,
      { name: categoryName },
      { new: true }
    );
    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: "Kateqoriya tapılmadı.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Kateqoriya uğurla yeniləndi.",
      data: updatedCategory,
    });
  } catch (error) {
    console.error("Kateqoriya yenilənərkən xəta:", error);
    return res.status(500).json({
      success: false,
      message: "Server xətası",
    });
  }
}

export const deleteRozetCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await RozetCategory.deleteOne({ _id: id });
    if (result.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Kateqoriya tapılmadı",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Kateqoriya uğurla silindi",
    });
  } catch (error) {
    console.error("Kateqoriya silinərkən xəta:", error);
    return res.status(500).json({
      success: false,
      message: "Server xətası",
    });
  };
};

export const createRozetCategory = async (req, res) => {
  const { categoryName } = req.body;
  const userId = req.user
  if (!categoryName || categoryName.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Kategori adı boş ola bilməz.",
    });
  }
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "İstifadəçi ID-si mövcud deyil.",
    });
  }
  try {
    const newCategory = new RozetCategory({ name: categoryName, creator: new mongoose.Types.ObjectId(userId) });
    await newCategory.save();

    return res.status(201).json({
      success: true,
      message: "Yeni kateqoriya yaradıldı.",
      data: newCategory,
    });
  } catch (error) {
    console.error("Kateqoriya yaradılarkən xəta:", error);
    return res.status(500).json({
      success: false,
      message: "Server xətası",
    });
  }
};

// Rozet Controllers
export const getRozets = async (req, res) => {
  try {
    return res.render("pages/imtiyazlar/rozetler/inside", {
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server xətası");
  }
};

export const getRozetsPost = async (req, res) => {
  try {
    const { rozetid } = req.params;
    const { search } = req.body;

    if (!rozetid) {
      return res.status(400).json({
        success: false,
        message: "Kateqoriya ID-si mövcud deyil",
        data: [],
      });
    }

    // Query-i hazırla
    const query = { rozet_category: rozetid, deleted: false };
    if (search && search.trim() !== "") {
      query.name = { $regex: search.trim(), $options: "i" }; // case-insensitive search
    }

    const rozets = await Rozet.find(query) 
      .populate("creator", "name surname")
      .populate("card_category", "name")
      .populate("rozet_category", "name -_id")
      .lean();

    return res.status(200).json({
      success: true,
      data: rozets,
    });

  } catch (error) {
    console.error("Rozetləri gətirərkən xəta:", error);
    return res.status(500).json({
      success: false,
      message: "Server xətası",
      data: [],
    });
  }
};



// ==================== TARGET ENUM MAPPİNG ====================
const TARGET_ENUM_MAP = {
  "Xidmət sayı": "xidmet_sayi",
  "Müddət": "muddet",
  "Məbləğ": "amount",
  "Üzvlük": "uzvluk",
  "Kart": "active_card_count"
};

// ==================== ROZET YARATMA ====================
export const createRozet = async (req, res) => {
  try {
    const { processedFiles, params } = req;
    const { categoryId } = params;
    const userId = req.user.id;

    let body = req.body.data ? JSON.parse(req.body.data) : req.body;

    console.log("🟢 createRozet çağırıldı");
    console.log("📥 Body:", body);

    // Target mapping
    const mappedTarget = TARGET_ENUM_MAP[body.target] || body.target;

    let imageName = "default_badge.png";
    let imagePath = "/uploads/badges/default_badge.png";

    if (processedFiles && processedFiles.length > 0) {
      const file = processedFiles[0];
      imageName = file.filename;
      imagePath = file.route;
    }

    const newRozet = new Rozet({
      name: body.name,
      description: body.description,
      image_name: imageName,
      image_path: imagePath,
      muessise_category: body.muessise_category || [],
      target: mappedTarget,
      conditions: body.conditions || {
        xidmet_sayi: 0,
        muddet: 0,
        amount: 0,
        uzvluk: 0,
        active_card_count: 0
      },
      target_type: body.target_type || "target_count",
      card_category: body.card_category ? new mongoose.Types.ObjectId(body.card_category) : null,
      rozet_category: categoryId ? new mongoose.Types.ObjectId(categoryId) : null,
      creator: userId ? new mongoose.Types.ObjectId(userId) : null
    });

    await newRozet.save();

    if (categoryId) {
      await RozetCategory.findByIdAndUpdate(categoryId, { $inc: { rozet_count: 1 } });
    }

    return res.status(201).json({
      success: true,
      message: "Rozet uğurla yaradıldı",
      data: newRozet
    });

  } catch (err) {
    console.error("❌ createRozet ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server xətası baş verdi",
      error: err.message
    });
  }
};

// ==================== ROZET REDAKTƏ ETMƏ ====================
export const updateRozet = async (req, res) => {
  try {
    const { processedFiles, params } = req;
    const { rozetId } = params;

    let body = req.body.data ? JSON.parse(req.body.data) : req.body;

    const existingRozet = await Rozet.findById(rozetId);
    if (!existingRozet) {
      return res.status(404).json({
        success: false,
        message: "Rozet tapılmadı"
      });
    }

    const mappedTarget = TARGET_ENUM_MAP[body.target] || body.target;

    let imageName = existingRozet.image_name;
    let imagePath = existingRozet.image_path;

    // Yeni fayl yüklənibsə
    if (processedFiles && processedFiles.length > 0) {
      const file = processedFiles[0];
      imageName = file.filename;
      imagePath = file.route;
      console.log(" Yeni şəkil yükləndi:", imagePath);
    } else if (body.image_name && body.image_path) {
      // Frontend-dən gələn mövcud şəkil məlumatı
      imageName = body.image_name;
      imagePath = body.image_path;
      console.log(" Mövcud şəkil saxlanıldı:", imagePath);
    } else {
      // Heç nə göndərilməyibsə, köhnə datanı saxla
      console.log(" DB-dən mövcud şəkil saxlanıldı:", imagePath);
    }

    const updatedRozet = await Rozet.findByIdAndUpdate(
      rozetId,
      {
        name: body.name,
        description: body.description,
        image_name: imageName,
        image_path: imagePath,
        muessise_category: body.muessise_category || [],
        target: mappedTarget,
        conditions: body.conditions || existingRozet.conditions,
        target_type: body.target_type || existingRozet.target_type,
        card_category: body.card_category 
          ? new mongoose.Types.ObjectId(body.card_category) 
          : null,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Rozet uğurla redaktə edildi",
      data: updatedRozet
    });

  } catch (err) {
    console.error("❌ updateRozet ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server xətası baş verdi",
      error: err.message
    });
  }
};


export const deleteRozet = async (req, res) => {
  try {
    const { id } = req.body;
    console.log("🟢 deleteRozet çağırıldı, ID:", id);

    if (!id) {
      return res.status(400).json({ message: "Rozet ID göndərilməyib" });
    }

    const rozet = await Rozet.findById(id); 
    if (!rozet) {
      console.warn("⚠️ Rozet tapılmadı:", id);
      return res.status(404).json({ message: "Rozet tapılmadı" });
    }

    await Rozet.deleteOne({ _id: id });

    if (rozet.rozet_category) {
      await RozetCategory.findByIdAndUpdate(rozet.rozet_category, {
        $inc: { rozet_count: -1 },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Rozet uğurla soft silindi və kateqoriya count-u azaldıldı",
    });

  } catch (err) {
    console.error("❌ deleteRozet ERROR:", err);
    return res.status(500).json({
      message: "Server xətası baş verdi",
      error: err.message
    });
  }
};


//Other Controllers
export const getCards = async (req, res) => {
  try {
    const cards = await Cards.find({ deleted: false }).select("name _id").lean();
    return res.status(200).json({
      success: true,
      data: cards,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server xətası");
  }
}