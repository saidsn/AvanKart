import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import i18n from "i18n";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const DEFAULT_SIRKET = process.env.DEFAULT_SIRKET || "DEFAULT_SIRKET";

const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const validatePDF = (buffer) => {
  try {
    const pdfMagicBytes = Buffer.from([0x25, 0x50, 0x44, 0x46]);
    return buffer.subarray(0, 4).equals(pdfMagicBytes);
  } catch {
    return false;
  }
};

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) cb(null, true);
  else cb(new Error(i18n.__("upload.only_pdf_images_allowed")), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 10 },
});

const uniqueName = (prefix, originalName) => {
  const ext = path.extname(originalName).toLowerCase();
  return `${prefix}-${Date.now()}${ext || ""}`;
};

const fileUploadMiddleware = (fieldName = "files") => {
  return [
    upload.array(fieldName, 10),
    async (req, res, next) => {
      try {
        if (!req.files?.length) {
          return next();
        }
        const ticketId =
          req.params.ticketId || req.params.ticket_id || req.body.ticket_id;

        let sirketId = req.user?.sirket_id;
        if (!sirketId && req.user) {
          try {
            const mod = await import("../../shared/model/people/peopleUser.js");
            const PeopleUser = mod.default || mod.PeopleUser || null;
            if (PeopleUser) {
              const dbUser = await PeopleUser.findById(req.user).select(
                "sirket_id"
              );
              if (dbUser?.sirket_id) {
                sirketId = dbUser.sirket_id;
                // req.user.sirket_id = sirketId;
              }
            }
          } catch {}
        }
        sirketId = sirketId || DEFAULT_SIRKET;

        const userIdForName = req.user?._id || req.user?.id || "PEOPLE_TEST";
        const baseDir = path.join(
          __dirname,
          "..",
          "public",
          "files",
          "uploads",
          "sirket",
          String(sirketId),
          "tickets",
          String(ticketId || "no-ticket")
        );
        ensureDirectoryExists(baseDir);
        const processedFiles = [];
        for (const file of req.files) {
          const rawName = uniqueName(userIdForName, file.originalname);
          const diskPath = path.join(baseDir, rawName);
          let finalPath = diskPath;
          let finalRoute = `/files/uploads/sirket/${sirketId}/tickets/${
            ticketId || "no-ticket"
          }/${rawName}`;
          let finalMimetype = file.mimetype;
          if (file.mimetype.startsWith("image/")) {
            const tmpPath = diskPath.endsWith(".jpg")
              ? diskPath
              : diskPath.replace(path.extname(diskPath), ".jpg");
            await sharp(file.buffer)
              .jpeg({ quality: 90 })
              .resize(2048, 2048, { fit: "inside", withoutEnlargement: true })
              .toFile(tmpPath);
            finalPath = tmpPath;
            finalRoute = finalRoute.endsWith(".jpg") 
              ? finalRoute
              : finalRoute.replace(path.extname(finalRoute), ".jpg");
            finalMimetype = "image/jpeg";
          } else if (file.mimetype === "application/pdf") {
            if (!validatePDF(file.buffer)) {
              throw new Error(
                i18n.__("upload.invalid_pdf_file", file.originalname)
              );
            }
            fs.writeFileSync(diskPath, file.buffer);
          }
          const size = fs.statSync(finalPath).size;
          processedFiles.push({
            originalName: path.basename(finalPath),
            filename: path.basename(finalPath),
            path: finalPath,
            route: finalRoute,
            mimetype: finalMimetype,
            size,
          });
        }
        req.processedFiles = processedFiles;
        req.uploadMeta = { sirketId, ticketId };
        next();
      } catch (err) {
        if (req.processedFiles) {
          for (const f of req.processedFiles) {
            if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
          }
        }
        return res.status(400).json({
          success: false,
          message: err.message || i18n.__("upload.upload_error"),
        });
      }
    },
  ];
};

export default fileUploadMiddleware;
