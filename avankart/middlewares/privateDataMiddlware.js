import { body } from "express-validator";
import i18n from "i18n";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

i18n.configure({
  locales: ["az", "en", "ru"],
  directory: path.join(__dirname, "../", "locales"),
  defaultLocale: "en",
  cookie: "lang",
  updateFiles: false,
  objectNotation: true,
});

export const privateDataMiddleware = [
  body("name")
    .trim()
    .escape()
    .notEmpty()
    .withMessage(i18n.__("auth.name_required")),

  body("email")
    .isEmail()
    .withMessage(i18n.__("auth.invalid_email"))
    .notEmpty()
    .withMessage(i18n.__("auth.mail_required")),

  body("phone_suffix")
    .trim()
    .escape()
    .notEmpty()
    .withMessage(i18n.__("auth.phone_suffix_required")),

  body("phone_number")
    .trim()
    .escape()
    .notEmpty()
    .withMessage(i18n.__("auth.phone_number_required"))
    .matches(/^\d{6,15}$/)
    .withMessage(i18n.__("auth.invalid_phone_number")),
];
