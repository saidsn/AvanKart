import i18n from "i18n";

export const validateEditUser = (req, res, next) => {
  const { user_id, fullName, gender, email, phoneNumber, dutyId, authId } =
    req.body;
  const errors = [];

  const objectIdRegex = /^[0-9a-fA-F]{24}$/;

  if (!user_id || typeof user_id !== "string") {
    errors.push(i18n.__("edit_user.user_id_required"));
  } else if (!objectIdRegex.test(user_id)) {
    errors.push(i18n.__("edit_user.user_id_invalid_objectid"));
  }

  if (fullName !== undefined) {
    if (
      !fullName ||
      typeof fullName !== "string" ||
      fullName.trim().length === 0
    ) {
      errors.push(i18n.__("edit_user.full_name_invalid"));
    } else if (fullName.trim().split(" ").length < 2) {
      errors.push(i18n.__("edit_user.full_name_not_enough_parts"));
    }
  }

  if (gender !== undefined) {
    if (!gender || typeof gender !== "string") {
      errors.push(i18n.__("edit_user.gender_invalid"));
    } else if (!["male", "female", "other"].includes(gender.toLowerCase())) {
      errors.push(i18n.__("edit_user.gender_not_allowed"));
    }
  }

  if (email !== undefined) {
    if (!email || typeof email !== "string") {
      errors.push(i18n.__("edit_user.email_invalid"));
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push(i18n.__("edit_user.email_format_invalid"));
      }
    }
  }

  if (phoneNumber !== undefined) {
    if (!phoneNumber || typeof phoneNumber !== "string") {
      errors.push(i18n.__("edit_user.phone_invalid"));
    } else {
      const phoneRegex = /^[0-9]{7,15}$/;
      if (!phoneRegex.test(phoneNumber.replace(/\s/g, ""))) {
        errors.push(i18n.__("edit_user.phone_format_invalid"));
      }
    }
  }

  if (dutyId !== undefined && dutyId !== null && dutyId !== "") {
    if (typeof dutyId !== "string" && typeof dutyId !== "number") {
      errors.push(i18n.__("edit_user.duty_id_invalid"));
    }
  }

  if (authId !== undefined && authId !== null && authId !== "") {
    if (typeof authId !== "string" && typeof authId !== "number") {
      errors.push(i18n.__("edit_user.auth_id_invalid"));
    }
  }

  const updateFields = [fullName, gender, email, phoneNumber, dutyId, authId];
  if (updateFields.every((field) => field === undefined)) {
    errors.push(i18n.__("edit_user.no_update_fields"));
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: i18n.__("edit_user.validation_failed"),
      errors: errors,
    });
  }

  next();
};
