import InstitutionApplication from "../../../shared/model/avankartaz/institutionApplication.js";
import ApplicationCategory from "../../../shared/model/avankartaz/applicationCategory.js";

const index = async (req, res) => {
  try {
    const {
      category,
      startDate,
      endDate,
      search,
      lang,
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    if (search) {
      filter.institutionName = { $regex: search, $options: "i" };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await InstitutionApplication.countDocuments(filter);

    const applications = await InstitutionApplication.find(filter)
      .populate("category")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    let responseData = applications;
    if (lang && ["az", "tr", "en", "ru"].includes(lang)) {
      responseData = applications.map((app) => {
        const appObj = app.toObject();
        if (appObj.category && appObj.category.title) {
          appObj.category.title = appObj.category.title[lang];
        }
        return appObj;
      });
    }

    res.status(200).json({
      success: true,
      message: "Müraciətlər uğurla əldə edildi",
      data: responseData,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Müraciətlər əldə edilərkən xəta baş verdi",
      error: error.message,
    });
  }
};

const show = async (req, res) => {
  try {
    const { id } = req.params;
    const { lang } = req.query;
    const application = await InstitutionApplication.findById(id).populate("category");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Müraciət tapılmadı",
      });
    }

    let responseData = application;
    if (lang && ["az", "tr", "en", "ru"].includes(lang)) {
      const appObj = application.toObject();
      if (appObj.category && appObj.category.title) {
        appObj.category.title = appObj.category.title[lang];
      }
      responseData = appObj;
    }

    res.status(200).json({
      success: true,
      message: "Müraciət uğurla əldə edildi",
      data: responseData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Müraciət əldə edilərkən xəta baş verdi",
      error: error.message,
    });
  }
};

const create = async (req, res) => {
  try {
    const categories = await ApplicationCategory.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Form məlumatları uğurla əldə edildi",
      data: {
        categories
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Form məlumatları əldə edilərkən xəta baş verdi",
      error: error.message,
    });
  }
};

const store = async (req, res) => {
  try {
    const { institutionName, category, email, phone, message } = req.body;

    if (!institutionName || !category || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "Bütün məlumatlar daxil edilməlidir",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Düzgün email formatı daxil edin",
      });
    }

    const newApplication = new InstitutionApplication({
      institutionName,
      category,
      email,
      phone,
      message,
    });

    await newApplication.save();

    const populatedApplication = await InstitutionApplication.findById(
      newApplication._id
    ).populate("category");

    res.status(201).json({
      success: true,
      message: "Müraciət uğurla göndərildi",
      data: populatedApplication,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Müraciət göndərilərkən xəta baş verdi",
      error: error.message,
    });
  }
};

const edit = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await InstitutionApplication.findById(id).populate("category");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Müraciət tapılmadı",
      });
    }

    const categories = await ApplicationCategory.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Müraciət və form məlumatları uğurla əldə edildi",
      data: {
        application,
        categories
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Müraciət məlumatları əldə edilərkən xəta baş verdi",
      error: error.message,
    });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { institutionName, category, email, phone, message } = req.body;

    const application = await InstitutionApplication.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Müraciət tapılmadı",
      });
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Düzgün email formatı daxil edin",
        });
      }
    }

    if (institutionName) application.institutionName = institutionName;
    if (category) application.category = category;
    if (email) application.email = email;
    if (phone) application.phone = phone;
    if (message) application.message = message;

    await application.save();

    const populatedApplication = await InstitutionApplication.findById(id).populate("category");

    res.status(200).json({
      success: true,
      message: "Müraciət uğurla yeniləndi",
      data: populatedApplication,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Müraciət yenilənərkən xəta baş verdi",
      error: error.message,
    });
  }
};

const destroy = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await InstitutionApplication.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Müraciət tapılmadı",
      });
    }

    await InstitutionApplication.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Müraciət uğurla silindi",
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Müraciət silinərkən xəta baş verdi",
      error: error.message,
    });
  }
};

export const institutionApplicationController = {
  index,
  show,
  create,
  store,
  edit,
  update,
  destroy,
};
