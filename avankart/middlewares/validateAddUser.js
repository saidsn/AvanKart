import i18n from "i18n";

export const validateAddUser = (req, res, next) => {
  const { fullName, gender, email, phoneNumber, dutyId, muessiseName, authId } =
    req.body;
  const errors = [];

  // fullName validation
  if (
    !fullName ||
    typeof fullName !== "string" ||
    fullName.trim().length === 0
  ) {
    errors.push(i18n.__("add_user.fullname_required"));
  } else if (fullName.trim().split(" ").length < 2) {
    errors.push(i18n.__("add_user.fullname_must_contain_two_words"));
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
    const phoneRegex = /^[0-9]{7,15}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ""))) {
      errors.push(i18n.__("add_user.phone_invalid"));
    }
  }
  // dutyId validation (optional)
  if (dutyId !== undefined && dutyId !== null && dutyId !== "") {
    if (typeof dutyId !== "string" && typeof dutyId !== "number") {
      errors.push(i18n.__("add_user.duty_id_invalid"));
    }
  }
  // muessiseName validation
  // if (
  //   !muessiseName ||
  //   typeof muessiseName !== "string" ||
  //   muessiseName.trim().length === 0
  // ) {
  //   errors.push("Muessise name is required and must be a valid string");
  // }

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
