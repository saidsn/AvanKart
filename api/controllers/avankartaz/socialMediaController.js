import SocialMedia from "../../../shared/model/avankartaz/socialMedia.js";

const index = async (req, res) => {
  try {
    const { search } = req.query;

    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const socialMedias = await SocialMedia.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: socialMedias,
      total: socialMedias.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Sosial medialər əldə edilərkən xəta baş verdi",
      error: error.message,
    });
  }
};

const show = async (req, res) => {
  try {
    const { id } = req.params;
    const socialMedia = await SocialMedia.findById(id);

    if (!socialMedia) {
      return res.status(404).json({
        success: false,
        message: "Sosial media tapılmadı",
      });
    }

    res.status(200).json({
      success: true,
      data: socialMedia,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Sosial media əldə edilərkən xəta baş verdi",
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

    const newSocialMedia = new SocialMedia({
      name,
      icon: iconPath,
      link,
      status: status || "active",
    });

    await newSocialMedia.save();

    res.status(201).json({
      success: true,
      message: "Sosial media uğurla yaradıldı",
      data: newSocialMedia,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Sosial media yaradılarkən xəta baş verdi",
      error: error.message,
    });
  }
};

export const socialMediaController = {
  index,
  show,
  store
};
