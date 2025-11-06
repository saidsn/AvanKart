const uploadSingle = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Şəkil yüklənməyib",
      });
    }

    const imagePath = `/image/avankartaz/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: "Şəkil uğurla yükləndi",
      data: {
        filename: req.file.filename,
        path: imagePath,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Şəkil yüklənərkən xəta baş verdi",
      error: error.message,
    });
  }
};

const uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Şəkillər yüklənməyib",
      });
    }

    const images = req.files.map((file) => ({
      filename: file.filename,
      path: `/image/avankartaz/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
    }));

    res.status(200).json({
      success: true,
      message: "Şəkillər uğurla yükləndi",
      data: images,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Şəkillər yüklənərkən xəta baş verdi",
      error: error.message,
    });
  }
};

export const uploadController = {
  uploadSingle,
  uploadMultiple,
};
