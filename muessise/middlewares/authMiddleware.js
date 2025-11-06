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

// Middleware to validate and sanitize input data
export const registerMiddleware = [
    body('username').trim().escape().notEmpty().withMessage(i18n.__('auth.name_required')),
    body('referal').trim().escape(),
    body('email').isEmail().withMessage(i18n.__('auth.invalid_email')).notEmpty().withMessage(i18n.__('auth.mail_required')),
    body('phone').trim().escape().notEmpty().withMessage(i18n.__('auth.phone_required')).matches(/^\+\d{8,15}$/).withMessage(i18n.__('auth.invalid_phone')),
    body('password').trim().escape().notEmpty().withMessage(i18n.__('auth.password_required'))
];

export const loginMiddleware = [
    body('email').trim().escape().isEmail().withMessage(i18n.__('auth.invalid_email')).notEmpty().withMessage(i18n.__('auth.mail_required')),
    body('password').trim().escape().notEmpty().withMessage(i18n.__('auth.password_required'))
];