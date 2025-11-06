import multer from "multer";
import path from "path";
import fs from "fs";

// Allowed image types
const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const muessiseId = req.muessise_id || "temp"; // fallback
    const uploadPath = `public/images/upload/${muessiseId}/info`;

    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const muessiseId = req.muessise_id || "MM-UNKNOWN";
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();

    const newName = `${muessiseId}-${timestamp}${ext}`;
    cb(null, newName);
  },
});

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Yalnız JPG, PNG və WEBP şəkillərə icazə verilir."), false);
  }
};

const limits = {
  fileSize: 8 * 1024 * 1024, // 8MB
};

export const uploadMuessiseImages = multer({
  storage,
  fileFilter,
  limits,
});
