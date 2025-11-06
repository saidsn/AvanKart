import multer from "multer";
import path from "path";
import fs from "fs";

// Allowed image types
const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const muessiseId = req.muessise_id || "temp"; // fallback
    const uploadPath = `public/images/muessise/${muessiseId}/info`;

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

// Special configuration for muessise creation (when ID doesn't exist yet)
const tempStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tempDir = "public/images/temp/muessise-creation";
    fs.mkdirSync(tempDir, { recursive: true });
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const newName = `temp-${timestamp}-${file.fieldname}${ext}`;
    cb(null, newName);
  },
});

export const uploadMuessiseCreationImages = multer({
  storage: tempStorage,
  fileFilter,
  limits,
});

// Contract file upload configuration
const contractFileTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

const contractStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const sirketId = req.params.sirket_id || "unknown";
    const uploadPath = `public/files/uploads/contracts/${sirketId}`;

    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const sanitizedName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
    const newName = `contract-${timestamp}-${sanitizedName}${ext}`;
    cb(null, newName);
  },
});

const contractFileFilter = (req, file, cb) => {
  if (contractFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Yalnız PDF, JPG, PNG, WEBP və DOCX fayllarına icazə verilir."), false);
  }
};

const contractLimits = {
  fileSize: 50 * 1024 * 1024, // 50MB for contract files
};

export const uploadContractFiles = multer({
  storage: contractStorage,
  fileFilter: contractFileFilter,
  limits: contractLimits,
});
