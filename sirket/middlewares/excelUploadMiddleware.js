import multer from "multer";
import path from "path";
import fs from "fs";
import i18n from "i18n";

const allowedExcelTypes = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "public/files/excel";
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    cb(null, `excel-${timestamp}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (allowedExcelTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(i18n.__("excel.only_excel_allowed")), false);
  }
};

export const uploadExcel = multer({ storage, fileFilter });
