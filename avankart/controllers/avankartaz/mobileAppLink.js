import MobileAppLink from "../../../shared/model/avankartaz/mobileAppLink.js";

const index = async (req, res) => {
  try {
    return res.render("pages/avankartaz/mobil", {
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

    const mobileAppLinks = await MobileAppLink.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Mobil tətbiq linkləri uğurla əldə edildi",
      data: mobileAppLinks,
      total: mobileAppLinks.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Mobil tətbiq linkləri əldə edilərkən xəta baş verdi",
      error: error.message,
    });
  }
};

const show = async (req, res) => {
  try {
    const { id } = req.params;
    const mobileAppLink = await MobileAppLink.findById(id);

    if (!mobileAppLink) {
      return res.status(404).json({
        success: false,
        message: "Mobil tətbiq linki tapılmadı",
      });
    }

    res.status(200).json({
      success: true,
      message: "Mobil tətbiq linki uğurla əldə edildi",
      data: mobileAppLink,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Mobil tətbiq linki əldə edilərkən xəta baş verdi",
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

    const newMobileAppLink = new MobileAppLink({
      name,
      icon: iconPath,
      link,
      status: status || "active",
    });

    await newMobileAppLink.save();

    res.status(201).json({
      success: true,
      message: "Mobil tətbiq linki uğurla yaradıldı",
      data: newMobileAppLink,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Mobil tətbiq linki yaradılarkən xəta baş verdi",
      error: error.message,
    });
  }
};

const edit = async (req, res) => {
  try {
    const { id } = req.params;

    const mobileAppLink = await MobileAppLink.findById(id);

    if (!mobileAppLink) {
      return res.status(404).json({
        success: false,
        message: "Mobil tətbiq linki tapılmadı",
      });
    }

    res.status(200).json({
      success: true,
      message: "Mobil tətbiq linki və form məlumatları uğurla əldə edildi",
      data: {
        mobileAppLink,
        statuses: ["active", "inactive"]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Mobil tətbiq linki məlumatları əldə edilərkən xəta baş verdi",
      error: error.message,
    });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, link, status } = req.body;

    const mobileAppLink = await MobileAppLink.findById(id);

    if (!mobileAppLink) {
      return res.status(404).json({
        success: false,
        message: "Mobil tətbiq linki tapılmadı",
      });
    }

    if (status && !["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status yalnız active və ya inactive ola bilər",
      });
    }

    if (name) mobileAppLink.name = name;
    if (link) mobileAppLink.link = link;
    if (status) mobileAppLink.status = status;

    if (req.file) {
      mobileAppLink.icon = `/image/avankartaz/${req.file.filename}`;
    }

    await mobileAppLink.save();

    res.status(200).json({
      success: true,
      message: "Mobil tətbiq linki uğurla yeniləndi",
      data: mobileAppLink,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Mobil tətbiq linki yenilənərkən xəta baş verdi",
      error: error.message,
    });
  }
};

const destroy = async (req, res) => {
  try {
    const { id } = req.params;

    const mobileAppLink = await MobileAppLink.findById(id);

    if (!mobileAppLink) {
      return res.status(404).json({
        success: false,
        message: "Mobil tətbiq linki tapılmadı",
      });
    }

    await MobileAppLink.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Mobil tətbiq linki uğurla silindi",
      data: mobileAppLink,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Mobil tətbiq linki silinərkən xəta baş verdi",
      error: error.message,
    });
  }
};

export const mobileAppLinkController = {
  index,
  list,
  show,
  create,
  store,
  edit,
  update,
  destroy,
};
