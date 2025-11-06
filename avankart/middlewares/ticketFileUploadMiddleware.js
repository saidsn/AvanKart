// middlewares/ticketFileUploadMiddleware.js
import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
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
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file
const MAX_FILES = 5; // Maximum 5 files at once
const MAX_TOTAL_SIZE = 20 * 1024 * 1024; // 20MB total for all files combined

// Generate unique filename
const generateUniqueFilename = (userId, originalName) => {
  const timestamp = Date.now();
  const extension = path.extname(originalName).toLowerCase();
  const userIdFormat = userId || "UNKNOWN";
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
    await sharp(buffer)
      .jpeg({ quality: 90 })
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
    const pdfMagicBytes = Buffer.from([0x25, 0x50, 0x44, 0x46]); // %PDF
    return buffer.subarray(0, 4).equals(pdfMagicBytes);
  } catch (error) {
    return false;
  }
};

// Multer configuration
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  console.log(`📤 File uploading: ${file.originalname}, Type: ${file.mimetype}`);

  if (validateFileType(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Yalnız PDF, JPG və PNG faylları qəbul edilir"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE, // 5MB per file
    files: MAX_FILES, // Max 5 files
  },
});

// Ticket-specific file upload middleware
const ticketFileUploadMiddleware = (fieldName = "files") => {
  return [
    upload.array(fieldName, MAX_FILES),

    async (req, res, next) => {
      try {
        if (!req.files || req.files.length === 0) {
          console.log("No files uploaded");
          return res.status(400).json({
            success: false,
            error: "Fayl seçilməyib",
          });
        }

        // Check total file size
        const totalSize = req.files.reduce((sum, file) => sum + file.size, 0);
        if (totalSize > MAX_TOTAL_SIZE) {
          const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
          const maxSizeMB = (MAX_TOTAL_SIZE / (1024 * 1024)).toFixed(0);
          console.log(`❌ Total file size (${totalSizeMB}MB) exceeds limit (${maxSizeMB}MB)`);
          return res.status(400).json({
            success: false,
            error: `Faylların ümumi ölçüsü (${totalSizeMB}MB) limiti (${maxSizeMB}MB) aşır`,
          });
        }

        // Check individual file sizes
        for (const file of req.files) {
          if (file.size > MAX_FILE_SIZE) {
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            const maxSizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
            console.log(`❌ File ${file.originalname} (${fileSizeMB}MB) exceeds limit (${maxSizeMB}MB)`);
            return res.status(400).json({
              success: false,
              error: `Fayl "${file.originalname}" (${fileSizeMB}MB) maksimum ölçüdən (${maxSizeMB}MB) böyükdür`,
            });
          }
        }

        const { ticket_id } = req.params;
        if (!ticket_id) {
          return res.status(400).json({
            success: false,
            error: "Ticket ID tapılmadı",
          });
        }

        // Get user ID - try multiple possible locations
        let userId = req.user?.user_id || req.user?.id || req.user?._id;

        // If still no user ID, try to get from database
        if (!userId && req.user?.id) {
          try {
            const myUser = await AdminUser.findById(req.user.id);
            userId = myUser?.adminUser_id || myUser?._id || "UNKNOWN";
          } catch (error) {
            console.log("Could not get user ID from database");
            userId = "UNKNOWN";
          }
        }

        // Convert ObjectId to string if needed
        if (userId && typeof userId === 'object') {
          userId = userId.toString();
        }

        // Get sirket_id from user
        let sirketId = "DEFAULT_SIRKET";
        if (req.user?.id) {
          try {
            const myUser = await AdminUser.findById(req.user.id);
            sirketId = myUser?.sirket_id || "DEFAULT_SIRKET";
          } catch (error) {
            console.log("User not found, using default sirket_id");
          }
        }

        console.log(`📤 Processing ${req.files.length} ticket files...`);
        console.log(`🎫 Ticket ID: ${ticket_id}`);
        console.log(`👤 User ID: ${userId}`);
        console.log(`👤 User object:`, req.user);
        console.log(`🏢 Sirket ID: ${sirketId}`);

        // Create upload directory structure: /public/files/uploads/sirket/{sirket_id}/tickets/{ticket_id}
        const ticketUploadPath = path.join("sirket", sirketId, "tickets", ticket_id);
        const uploadDir = path.join(
          __dirname,
          "..",
          "public",
          "files",
          "uploads",
          ticketUploadPath
        );
        ensureDirectoryExists(uploadDir);

        const processedFiles = [];

        // Process each file
        for (const file of req.files) {
          try {
            const uniqueFilename = generateUniqueFilename(userId, file.originalname);
            const filePath = path.join(uploadDir, uniqueFilename);

            // Store RELATIVE path from public directory (not absolute system path)
            const relativeRoute = `/files/uploads/${ticketUploadPath}/${uniqueFilename}`;

            if (file.mimetype.startsWith("image/")) {
              // Process image with Sharp
              console.log(`Processing image: ${file.originalname}`);
              const success = await processImageSecurity(file.buffer, filePath);
              if (!success) {
                throw new Error(`Şəkil emal edilərkən xəta: ${file.originalname}`);
              }

              // Update filename to .jpg since Sharp converts to JPEG
              const jpegFilename = uniqueFilename.replace(
                path.extname(uniqueFilename),
                ".jpg"
              );
              const jpegPath = path.join(uploadDir, jpegFilename);
              const jpegRoute = `/files/uploads/${ticketUploadPath}/${jpegFilename}`;

              // Rename file to .jpg
              if (fs.existsSync(filePath) && !filePath.endsWith(".jpg")) {
                fs.renameSync(filePath, jpegPath);
                console.log(`Renamed ${filePath} to ${jpegPath}`);
              }

              console.log(`✅ Image saved at: ${jpegPath}`);
              console.log(`Web route: ${jpegRoute}`);

              processedFiles.push({
                originalName: jpegFilename,
                filename: jpegFilename,
                path: jpegPath, // Absolute path for file operations
                route: jpegRoute, // Relative web route for database
                mimetype: "image/jpeg",
                size: fs.statSync(jpegPath).size,
              });
            } else if (file.mimetype === "application/pdf") {
              // Validate PDF
              console.log(`Processing PDF: ${file.originalname}`);
              if (!validatePDF(file.buffer)) {
                throw new Error(`Etibarsız PDF faylı: ${file.originalname}`);
              }

              // Save PDF file
              fs.writeFileSync(filePath, file.buffer);
              console.log(`✅ PDF saved at: ${filePath}`);
              console.log(`Web route: ${relativeRoute}`);

              processedFiles.push({
                originalName: uniqueFilename,
                filename: uniqueFilename,
                path: filePath, // Absolute path for file operations
                route: relativeRoute, // Relative web route for database
                mimetype: file.mimetype,
                size: file.size,
              });
            }

            console.log(`✅ File processed: ${file.originalname} -> ${uniqueFilename}`);
          } catch (fileError) {
            console.error(`❌ File processing error (${file.originalname}):`, fileError.message);
            throw fileError;
          }
        }

        // Add processed files to request
        req.processedFiles = processedFiles;
        req.uploadMeta = {
          userId,
          sirketId,
          ticketId: ticket_id,
        };

        console.log(`✅ All ${processedFiles.length} files processed successfully`);
        next();
      } catch (error) {
        console.error("Ticket file upload middleware error:", error);

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
          error: error.message || "Fayl yükləmə xətası",
        });
      }
    },
  ];
};

export default ticketFileUploadMiddleware;
