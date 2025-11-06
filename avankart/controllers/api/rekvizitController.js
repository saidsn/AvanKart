import Rekvizitler from "../../../shared/models/rekvizitlerModel.js";

// Create new rekvizit
export const createRekvizit = async (req, res) => {
  try {
    const {
      company_name,
      bank_name,
      swift,
      settlement_account,
      legal_address,
      bank_code,
      correspondent_account,
      voen,
    } = req.body;

    // Get user info from session
    const userId = req.session?.user?.id || req.user?.id;
    const userType = req.session?.user?.type || req.user?.type;

    // Validate required fields
    if (!company_name || !bank_name) {
      return res.status(400).json({
        success: false,
        message: "Şirkətin adı və Bankın adı mütləq doldurulmalıdır",
      });
    }

    // Create rekvizit data
    const rekvizitData = {
      company_name,
      bank_info: {
        bank_name,
        swift: swift || "",
        settlement_account: settlement_account || "",
        bank_code: bank_code || "",
        correspondent_account: correspondent_account || "",
        muxbir_hesabi: correspondent_account || "",
      },
      legal_address: legal_address || "",
      huquqi_unvan: legal_address || "",
      voen: voen || "",
      adder_id: userId,
      fromModel: "AdminUser", // Default to AdminUser, modify based on your auth system
    };

    // Create new rekvizit
    const newRekvizit = new Rekvizitler(rekvizitData);
    await newRekvizit.save();

    return res.status(201).json({
      success: true,
      message: "Rekvizit uğurla əlavə edildi",
      data: newRekvizit,
    });
  } catch (error) {
    console.error("Error creating rekvizit:", error);

    // Handle duplicate voen error
    if (error.code === 11000 && error.keyPattern?.voen) {
      return res.status(400).json({
        success: false,
        message: "Bu VÖEN artıq mövcuddur",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Xəta baş verdi",
      error: error.message,
    });
  }
};

// Get all rekvizitler
export const getRekvizitler = async (req, res) => {
  try {
    const userId = req.session?.user?.id || req.user?.id;

    console.log("Get rekvizitler iwe dusdu. userID: ", userId);
    console.log("req.session?.user?.id", req.session?.user?.id);
    console.log("req.user?.id", req.user?.id);

    // Get rekvizitler for the current user
    const rekvizitler = await Rekvizitler.find({
      adder_id: userId,
      deleted: false, // Changed from isDeleted to deleted
    }).sort({ createdAt: -1 });

    console.log("Found rekvizitler:", rekvizitler.length);

    return res.status(200).json({
      success: true,
      data: rekvizitler,
      count: rekvizitler.length,
    });
  } catch (error) {
    console.error("Error fetching rekvizitler:", error);
    return res.status(500).json({
      success: false,
      message: "Xəta baş verdi",
      error: error.message,
    });
  }
};

// Get single rekvizit by ID
export const getRekvizitById = async (req, res) => {
  try {
    const { id } = req.params;

    const rekvizit = await Rekvizitler.findOne({
      _id: id,
      deleted: false, // Changed from isDeleted to deleted
    });

    if (!rekvizit) {
      return res.status(404).json({
        success: false,
        message: "Rekvizit tapılmadı",
      });
    }

    return res.status(200).json({
      success: true,
      data: rekvizit,
    });
  } catch (error) {
    console.error("Error fetching rekvizit:", error);
    return res.status(500).json({
      success: false,
      message: "Xəta baş verdi",
      error: error.message,
    });
  }
};

// Update rekvizit
export const updateRekvizit = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      company_name,
      bank_name,
      swift,
      settlement_account,
      legal_address,
      bank_code,
      correspondent_account,
      voen,
    } = req.body;

    const rekvizit = await Rekvizitler.findOne({
      _id: id,
      deleted: false, // Changed from isDeleted to deleted
    });

    if (!rekvizit) {
      return res.status(404).json({
        success: false,
        message: "Rekvizit tapılmadı",
      });
    }

    // Update fields
    if (company_name) rekvizit.company_name = company_name;
    if (legal_address) {
      rekvizit.legal_address = legal_address;
      rekvizit.huquqi_unvan = legal_address;
    }
    if (voen) rekvizit.voen = voen;

    // Update bank_info
    if (bank_name) rekvizit.bank_info.bank_name = bank_name;
    if (swift !== undefined) rekvizit.bank_info.swift = swift;
    if (settlement_account !== undefined)
      rekvizit.bank_info.settlement_account = settlement_account;
    if (bank_code !== undefined) rekvizit.bank_info.bank_code = bank_code;
    if (correspondent_account !== undefined) {
      rekvizit.bank_info.correspondent_account = correspondent_account;
      rekvizit.bank_info.muxbir_hesabi = correspondent_account;
    }

    await rekvizit.save();

    return res.status(200).json({
      success: true,
      message: "Rekvizit uğurla yeniləndi",
      data: rekvizit,
    });
  } catch (error) {
    console.error("Error updating rekvizit:", error);

    // Handle duplicate voen error
    if (error.code === 11000 && error.keyPattern?.voen) {
      return res.status(400).json({
        success: false,
        message: "Bu VÖEN artıq mövcuddur",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Xəta baş verdi",
      error: error.message,
    });
  }
};

// Delete rekvizit (soft delete)
export const deleteRekvizit = async (req, res) => {
  try {
    const { id } = req.params;

    const rekvizit = await Rekvizitler.findOne({
      _id: id,
      deleted: false, // Changed from isDeleted to deleted
    });

    if (!rekvizit) {
      return res.status(404).json({
        success: false,
        message: "Rekvizit tapılmadı",
      });
    }

    // Soft delete
    rekvizit.deleted = true; // Changed from isDeleted to deleted
    await rekvizit.save();

    return res.status(200).json({
      success: true,
      message: "Rekvizit uğurla silindi",
    });
  } catch (error) {
    console.error("Error deleting rekvizit:", error);
    return res.status(500).json({
      success: false,
      message: "Xəta baş verdi",
      error: error.message,
    });
  }
};
