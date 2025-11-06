import i18n from "i18n";

export const validateDeleteUser = (req, res, next) => {
  const { id, ids } = req.body;
  const errors = [];
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;

  if (!id && !ids) {
    errors.push(i18n.__("delete_user.id_or_ids_required"));
  }

  if (id && typeof id !== "string") {
    errors.push(i18n.__("delete_user.id_must_be_string"));
  } else if (id && !objectIdRegex.test(id)) {
    errors.push(i18n.__("delete_user.id_invalid_objectid"));
  }

  if (ids && !Array.isArray(ids)) {
    errors.push(i18n.__("delete_user.ids_must_be_array"));
  } else if (ids) {
    ids.forEach((userId, index) => {
      if (typeof userId !== "string") {
        errors.push(i18n.__("delete_user.id_index_must_be_string", { index }));
      } else if (!objectIdRegex.test(userId)) {
        errors.push(
          i18n.__("delete_user.id_index_invalid_objectid", { index })
        );
      }
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: i18n.__("delete_user.validation_failed"),
      errors: errors,
    });
  }

  next();
};
