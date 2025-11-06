import MobileAppLink from "../../../shared/model/avankartaz/mobileAppLink.js";

const index = async (req, res) => {
  try {
    const { search } = req.query;

    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const mobileAppLinks = await MobileAppLink.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
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

export const mobileAppLinkController = {
  index,
  show,
  store
};
