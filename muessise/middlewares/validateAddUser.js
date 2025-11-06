import i18n from "i18n";

export const validateAddUser = (req, res, next) => {
  const { fullName, gender, email, phoneNumber, dutyId, muessiseName, authId, phone_suffix } =
    req.body;
  const errors = [];

  // fullName validation
  if (
    !fullName ||
    typeof fullName !== "string" ||
    fullName.trim().length === 0
  ) {
    errors.push(i18n.__("add_user.fullname_required"));
  }

  // gender validation
  if (!gender || typeof gender !== "string") {
    errors.push(i18n.__("add_user.gender_required"));
  } else if (!["male", "female", "other"].includes(gender.toLowerCase())) {
    errors.push(i18n.__("add_user.gender_invalid"));
  }

  // email validation
  if (!email || typeof email !== "string") {
    errors.push(i18n.__("add_user.email_required"));
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push(i18n.__("add_user.email_invalid"));
    }
  }

  // phoneNumber validation
  if (!phoneNumber || typeof phoneNumber !== "string") {
    errors.push(i18n.__("add_user.phone_required"));
  } else {
    // Normalize phone: keep digits only and remove leading zeroes
    const digitsOnly = String(phoneNumber).replace(/\D/g, "");
    const normalized = digitsOnly.replace(/^0+/, "");
    const phoneRegex = /^[0-9]{7,15}$/;
    if (!phoneRegex.test(normalized)) {
      errors.push(i18n.__("add_user.phone_invalid"));
    } else {
      // write normalized back for downstream
      req.body.phoneNumber = normalized;
    }
  }
  // phone_suffix validation (optional)
  if (phone_suffix !== undefined && phone_suffix !== null && phone_suffix !== "") {
    const suffixOk = /^\+?\d{1,4}$/.test(String(phone_suffix));
    if (!suffixOk) {
      errors.push(i18n.__("add_user.phone_suffix_invalid"));
    }
  }
  // dutyId validation (optional)
  if (dutyId !== undefined && dutyId !== null && dutyId !== "") {
    if (typeof dutyId !== "string" && typeof dutyId !== "number") {
      errors.push(i18n.__("add_user.duty_id_invalid"));
    }
  }
  // muessiseName validation (commented out)

  // authId validation (optional)
  if (authId !== undefined && authId !== null && authId !== "") {
    if (typeof authId !== "string" && typeof authId !== "number") {
      errors.push(i18n.__("add_user.auth_id_invalid"));
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: i18n.__("add_user.validation_failed"),
      errors: errors,
    });
  }

  next();
};
