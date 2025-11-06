import ContactMethod from "../../../shared/model/avankartaz/contactMethod.js";

const index = async (req, res) => {
  try {
    return res.render("pages/avankartaz/elaqe", {
      error: "",
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send("Internal Server Error");
  }
};

const list = async (req, res) => {
  try {
    const { search } = req.query;

    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const contactMethods = await ContactMethod.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Əlaqə vasitələri uğurla əldə edildi",
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
      message: "Əlaqə vasitəsi uğurla əldə edildi",
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

const create = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Form məlumatları uğurla əldə edildi",
      data: {
        statuses: ["active", "inactive"]
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

const edit = async (req, res) => {
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
      message: "Əlaqə vasitəsi və form məlumatları uğurla əldə edildi",
      data: {
        contactMethod,
        statuses: ["active", "inactive"]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Əlaqə vasitəsi məlumatları əldə edilərkən xəta baş verdi",
      error: error.message,
    });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, link, status } = req.body;

    const contactMethod = await ContactMethod.findById(id);

    if (!contactMethod) {
      return res.status(404).json({
        success: false,
        message: "Əlaqə vasitəsi tapılmadı",
      });
    }

    if (status && !["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status yalnız active və ya inactive ola bilər",
      });
    }

    if (name) contactMethod.name = name;
    if (link) contactMethod.link = link;
    if (status) contactMethod.status = status;

    if (req.file) {
      contactMethod.icon = `/image/avankartaz/${req.file.filename}`;
    }

    await contactMethod.save();

    res.status(200).json({
      success: true,
      message: "Əlaqə vasitəsi uğurla yeniləndi",
      data: contactMethod,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Əlaqə vasitəsi yenilənərkən xəta baş verdi",
      error: error.message,
    });
  }
};

const destroy = async (req, res) => {
  try {
    const { id } = req.params;

    const contactMethod = await ContactMethod.findById(id);

    if (!contactMethod) {
      return res.status(404).json({
        success: false,
        message: "Əlaqə vasitəsi tapılmadı",
      });
    }

    await ContactMethod.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Əlaqə vasitəsi uğurla silindi",
      data: contactMethod,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Əlaqə vasitəsi silinərkən xəta baş verdi",
      error: error.message,
    });
  }
};

export const contactMethodController = {
  index,
  list,
  show,
  create,
  store,
  edit,
  update,
  destroy,
};
