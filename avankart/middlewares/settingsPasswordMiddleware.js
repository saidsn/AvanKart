import i18n from "i18n";

export const settingsPasswordMiddleware = (req, res, next) => {
  const { new_password, password_again } = req.body;

  const regex = /[!@\-_$?]/;
  const minLen = 8;

  if (!new_password || !password_again) {
    return res.status(400).json({
      error: i18n.__("settings.fill_all_fields"),
      csrfToken: req.csrfToken(),
    });
  }

  if (new_password !== password_again) {
    return res.status(400).json({
      error: i18n.__("settings.passwords_not_match"),
      csrfToken: req.csrfToken(),
    });
  }

  if (new_password.length < minLen || !regex.test(new_password)) {
    return res.status(400).json({
      error: i18n.__("settings.password_complexity"),
      csrfToken: req.csrfToken(),
    });
  }

  next();
};
