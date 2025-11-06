// middlewares/fileUploadMiddleware.js
import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import PeopleUser from "../../shared/models/peopleUserModel.js";
import AdminUser from "../../shared/models/adminUsersModel.js";

import i18n from "i18n";
 const __filename = fileURLToPath(import.meta.url);
 const __dirname = path.dirname(__filename);
// Allowed file types
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Generate unique filename
const generateUniqueFilename = (userId, originalName) => {
  const timestamp = Date.now();
  const extension = path.extname(originalName).toLowerCase();

  const userIdFormat = userId || "P-TEST001";
  return `${userIdFormat}-${timestamp}${extension}`;
};

// Create directory if not exists
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Directory created: ${dirPath}`);
  }
};

// Validate file type
const validateFileType = (mimetype) => {
  return ALLOWED_TYPES.includes(mimetype);
};

// Security check with Sharp for images
const processImageSecurity = async (buffer, outputPath) => {
  try {
    // Use Sharp to re-encode image for security
    await sharp(buffer)
      .jpeg({ quality: 90 }) // Convert to JPEG for consistency
      .resize(2048, 2048, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .toFile(outputPath);

    console.log(`🖼️ Image processed and saved: ${outputPath}`);
    return true;
  } catch (error) {
    console.error("Image processing error:", error);
    return false;
  }
};

// Validate PDF file
const validatePDF = (buffer) => {
  try {
    // Check PDF magic bytes
    const pdfMagicBytes = Buffer.from([0x25, 0x50, 0x44, 0x46]); // %PDF
    return buffer.subarray(0, 4).equals(pdfMagicBytes);
  } catch (error) {
    return false;
  }
};

// Multer configuration
const storage = multer.memoryStorage(); // Use memory storage for security processing

const fileFilter = (req, file, cb) => {
  console.log(
    `📤 File uploading: ${file.originalname}, Type: ${file.mimetype}`
  );

  if (validateFileType(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(i18n.__("upload.only_pdf_images_allowed")), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5, // Maximum 5 files per upload
  },
});

// Main middleware function
const muqavileUploadMiddleware = (fieldName = "files") => {
  return [
    // Multer middleware
    upload.array(fieldName, 5),

    // Security processing middleware
    async (req, res, next) => {
      try {
        if (!req.files || req.files.length === 0) {
          console.log("----req.files-----", req.files);
          return res.status(400).json({
            success: false,
            message: i18n.__("upload.no_file_selected"),
          });
        }

        // const { muessiseId } = req.params;

        const myUser = AdminUser.findById(req.user.id);
        const userId = myUser.user_id ?? "P-TEST001"; // From user session

        // PeopleUser-də axtarıb muessise_id götür
        const muessiseId = req.body.muessise_id
        if (userId && userId !== "P-TEST001") {
          try {
            const myUser = await AdminUser.findById(userId);
            muessiseId = myUser?.muessise_id;
          } catch (error) {
            console.log(
              "PeopleUser tapılmadı, default muessise_id istifadə olunur"
            );
          }
        }

        console.log(`📤 Processing ${req.files.length} files...`);
        console.log(`🎫 Muessise ID: ${muessiseId}`);
        console.log(`👤 User ID: ${userId}`);
        console.log(`🏢 Sirket ID: ${muessiseId}`); // Muessise ID → Sirket ID

        // Create upload directory - muessise_id istifadə olunur
        const uploadDir = path.join(
          __dirname,
          "..",
          "public",
          "files",
          "uploads",
          muessiseId // muessiseId → muessiseId
        );
        ensureDirectoryExists(uploadDir);

        const processedFiles = [];

        // Process each file
        for (const file of req.files) {
          try {
            const uniqueFilename = generateUniqueFilename(
              userId,
              file.originalname
            );
            const filePath = path.join(uploadDir, uniqueFilename);
            const webRoute = `/files/uploads/${muessiseId}/${uniqueFilename}`; // muessiseId → muessiseId

            if (file.mimetype.startsWith("image/")) {
              // Process image with Sharp
              const success = await processImageSecurity(file.buffer, filePath);
              if (!success) {
                throw new Error(
                  i18n.__("upload.image_processing_failed", file.originalname)
                );
              }

              // Update filename to .jpg since Sharp converts to JPEG
              const jpegFilename = uniqueFilename.replace(
                path.extname(uniqueFilename),
                ".jpg"
              );
              const jpegPath = path.join(uploadDir, jpegFilename);
              const jpegRoute = `/files/uploads/${muessiseId}/${jpegFilename}`; // muessiseId → muessiseId

              // Rename file to .jpg
              if (fs.existsSync(filePath) && !filePath.endsWith(".jpg")) {
                fs.renameSync(filePath, jpegPath);
              }

              processedFiles.push({
                originalName: jpegFilename,
                filename: jpegFilename,
                path: jpegPath,
                route: jpegRoute,
                mimetype: "image/jpeg",
                size: fs.statSync(jpegPath).size,
              });
            } else if (file.mimetype === "application/pdf") {
              // Validate PDF
              if (!validatePDF(file.buffer)) {
                throw new Error(
                  i18n.__("upload.invalid_pdf_file", file.originalname)
                );
              }

              // Save PDF file
              fs.writeFileSync(filePath, file.buffer);

              processedFiles.push({
                originalName: uniqueFilename,
                filename: uniqueFilename,
                path: filePath,
                route: webRoute,
                mimetype: file.mimetype,
                size: file.size,
              });
            }

            console.log(
              `✅ File processed: ${file.originalname} -> ${uniqueFilename}`
            );
          } catch (fileError) {
            console.error(
              `❌ File processing error (${file.originalname}):`,
              fileError.message
            );
            i18n.__(
              "upload.file_processing_failed",
              file.originalname,
              fileError.message
            );
          }
        }

        // Add processed files to request - muessiseId istifadə olunur
        req.processedFiles = processedFiles;
        req.uploadMeta = {
          userId,
          muessiseId, // muessiseId → muessiseId
          muessiseId,
        };

        console.log(
          `✅ All ${processedFiles.length} files processed successfully`
        );
        next();
      } catch (error) {
        console.error("File upload middleware error:", error);

        // Clean up any partially uploaded files
        if (req.processedFiles) {
          req.processedFiles.forEach((file) => {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
              console.log(`🗑️ Cleaned up file: ${file.path}`);
            }
          });
        }

        res.status(400).json({
          success: false,
          message: error.message || i18n.__("upload.upload_error"),
        });
      }
    },
  ];
};

export default muqavileUploadMiddleware;