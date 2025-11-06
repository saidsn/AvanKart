import { body } from 'express-validator';
import sanitizeHtml from 'sanitize-html';
import i18n from 'i18n';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

i18n.configure({
  locales: ['az', 'en', 'ru'],
  directory: path.join(__dirname, '../', 'locales'),
  defaultLocale: 'en',
  cookie: 'lang',
  updateFiles: false,
  objectNotation: true
});

export const validatePartnerProfileChange = [
  body("duty")
    .notEmpty().withMessage("Duty is required")
    .isIn(["updateName", "updateBirthDate", "updateEmail", "updatePassword", "updateNumber"]).withMessage("Invalid duty type"),

  body("name_surname")
    .if(body("duty").equals("updateName"))
    .notEmpty().withMessage("Name is required")
    .trim(),

  body("birth_date")
    .if(body("duty").equals("updateBirthDate"))
    .notEmpty().withMessage("Birth date is required"),

  body("email")
    .if(body("duty").equals("updateEmail"))
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email format")
    .normalizeEmail(),

  body("old_password")
    .if(body("duty").equals("updatePassword"))
    .notEmpty().withMessage("Old password is required"),

  body("new_password")
    .if(body("duty").equals("updatePassword"))
    .notEmpty().withMessage("New password is required")
    .isLength({ min: 6 }).withMessage("New password must be at least 6 characters long"),

  body("confirm_new_password")
    .if(body("duty").equals("updatePassword"))
    .custom((value, { req }) => {
      if (value !== req.body.new_password) throw new Error("Passwords do not match");
      return true;
    }),

  body("phone").optional().trim(),
  body("phone_suffix").optional().trim()
];