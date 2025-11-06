import ContactMethod from "../../../shared/model/avankartaz/contactMethod.js";

const index = async (req, res) => {
  try {
    const { search } = req.query;

    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const contactMethods = await ContactMethod.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: contactMethods,
      total: contactMethods.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Əlaqə vasitələri əldə edilərkən xəta baş verdi",
      error: error.message,
    });
  }
};

const show = async (req, res) => {
  try {
    const { id } = req.params;
    const contactMethod = await ContactMethod.findById(id);

    if (!contactMethod) {
      return res.status(404).json({
        success: false,
        message: "Əlaqə vasitəsi tapılmadı",
      });
    }

    res.status(200).json({
      success: true,
      data: contactMethod,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Əlaqə vasitəsi əldə edilərkən xəta baş verdi",
      error: error.message,
    });
  }
};

const store = async (req, res) => {
  try {
    const { name, link, status } = req.body;

    if (!name || !link) {
      return res.status(400).json({
        success: false,
        message: "Name və link daxil edilməlidir",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "İkon yüklənməlidir",
      });
    }

    if (status && !["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status yalnız active və ya inactive ola bilər",
      });
    }

    const iconPath = `/image/avankartaz/${req.file.filename}`;

    const newContactMethod = new ContactMethod({
      name,
      icon: iconPath,
      link,
      status: status || "active",
    });

    await newContactMethod.save();

    res.status(201).json({
      success: true,
      message: "Əlaqə vasitəsi uğurla yaradıldı",
      data: newContactMethod,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Əlaqə vasitəsi yaradılarkən xəta baş verdi",
      error: error.message,
    });
  }
};


export const contactMethodController = {
  index,
  show,
  store
};
