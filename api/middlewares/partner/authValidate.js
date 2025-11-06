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
export const loginMiddleware = [
    body('email').custom((value) => {
        const specialUsers = ['admin', 'superadmin'];
        if (specialUsers.includes(value)) return true;
        if (!/^\S+@\S+\.\S+$/.test(value)) throw new Error(i18n.__('auth.invalid_email'));
        return true;
      }).notEmpty().withMessage(i18n.__('auth.mail_required')),
    body('password').trim().escape().notEmpty().withMessage(i18n.__('auth.password_required')),
    body('remember_me').optional().isBoolean().withMessage(i18n.__('auth.remember_me_bool'))
];

export const registerMiddleware = [
    body('name').notEmpty().withMessage('auth.name_required'),
    body('surname').notEmpty().withMessage('auth.surname_required'),
    body('username').isString().withMessage('auth.username_invalid'),
    body('birth_date').notEmpty().isISO8601().withMessage('auth.birth_date_invalid'),
    body('email')
      .notEmpty().withMessage('auth.email_required')
      .matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i).withMessage('auth.email_invalid'),
    body('phone_suffix').notEmpty().isString().withMessage('auth.phone_suffix_required'),
    body('phone_number').notEmpty().isString().withMessage('auth.phone_number_required'),
    body('gender').notEmpty().isIn(['male', 'female', 'other']).withMessage('auth.gender_invalid'),
    body('password').notEmpty().isLength({ min: 6 }).withMessage('auth.password_invalid'),
    body('password_again')
      .notEmpty().withMessage('auth.password_again_required')
      .custom((value, { req }) => value === req.body.password).withMessage('auth.passwords_not_match'),
    body('username').optional().isString().withMessage('auth.device_invalid'),
    body('terms')
      .custom(value => value === true || value === 'true').withMessage('auth.terms_required')
  ]

  export const forgotPasswordMiddleware = [
    body("email")
    .notEmpty().withMessage("auth.email_required")  
    .matches(/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i)
    // .isEmail() optional
    .withMessage("auth.email_invalid")
  ]

  export const submitForgottonPasswordMiddleware = [
    body("new_password")
      .notEmpty().withMessage("auth.password_required")
      .isLength({ min: 6 }).withMessage("auth.password_length"),
    body('password_again')
      .notEmpty().withMessage('auth.password_again_required')
      .custom((value, { req }) => value === req.body.new_password).withMessage('auth.passwords_not_match'),
  ];