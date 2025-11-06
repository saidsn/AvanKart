import CompanyApplication from "../../../shared/model/avankartaz/companyApplication.js";

const index = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      search,
      minEmployeeCount,
      maxEmployeeCount,
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

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
      filter.companyName = { $regex: search, $options: "i" };
    }

    if (minEmployeeCount || maxEmployeeCount) {
      filter.employeeCount = {};
      if (minEmployeeCount) {
        filter.employeeCount.$gte = parseInt(minEmployeeCount);
      }
      if (maxEmployeeCount) {
        filter.employeeCount.$lte = parseInt(maxEmployeeCount);
      }
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await CompanyApplication.countDocuments(filter);

    const maxEmployeeResult = await CompanyApplication.findOne()
      .sort({ employeeCount: -1 })
      .select("employeeCount");
    const maxEmployeeInDb = maxEmployeeResult ? maxEmployeeResult.employeeCount : 0;

    const applications = await CompanyApplication.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      message: "Müraciətlər uğurla əldə edildi",
      data: applications,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
      filters: {
        minEmployeeCount: 0,
        maxEmployeeCount: maxEmployeeInDb,
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
    const application = await CompanyApplication.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Müraciət tapılmadı",
      });
    }

    res.status(200).json({
      success: true,
      message: "Müraciət uğurla əldə edildi",
      data: application,
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
    res.status(200).json({
      success: true,
      message: "Form məlumatları uğurla əldə edildi",
      data: {}
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
    const { companyName, employeeCount, email, phone, message } = req.body;

    if (!companyName || !employeeCount || !email || !phone || !message) {
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

    if (employeeCount < 1) {
      return res.status(400).json({
        success: false,
        message: "İşçi sayı ən az 1 olmalıdır",
      });
    }

    const newApplication = new CompanyApplication({
      companyName,
      employeeCount,
      email,
      phone,
      message,
    });

    await newApplication.save();

    res.status(201).json({
      success: true,
      message: "Müraciət uğurla göndərildi",
      data: newApplication,
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

    const application = await CompanyApplication.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Müraciət tapılmadı",
      });
    }

    res.status(200).json({
      success: true,
      message: "Müraciət və form məlumatları uğurla əldə edildi",
      data: {
        application
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
    const { companyName, employeeCount, email, phone, message } = req.body;

    const application = await CompanyApplication.findById(id);

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

    if (employeeCount && employeeCount < 1) {
      return res.status(400).json({
        success: false,
        message: "İşçi sayı ən az 1 olmalıdır",
      });
    }

    if (companyName) application.companyName = companyName;
    if (employeeCount) application.employeeCount = employeeCount;
    if (email) application.email = email;
    if (phone) application.phone = phone;
    if (message) application.message = message;

    await application.save();

    res.status(200).json({
      success: true,
      message: "Müraciət uğurla yeniləndi",
      data: application,
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

    const application = await CompanyApplication.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Müraciət tapılmadı",
      });
    }

    await CompanyApplication.findByIdAndDelete(id);

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

export const companyApplicationController = {
  index,
  show,
  create,
  store,
  edit,
  update,
  destroy,
};
