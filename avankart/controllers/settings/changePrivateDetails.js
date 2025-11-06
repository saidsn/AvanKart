import { validationResult } from "express-validator"
import PeopleUser from "../../../shared/models/peopleUserModel.js";

export const changePrivateDetails = async (req, res) => {
  const { name, email, phone_suffix, phone_number } = req.body;
  const fullName = (name || "").trim().split(" ").filter(Boolean);
  const username = fullName.length > 0 ? fullName[0] : "";
  const surname = fullName.length > 1 ? fullName.slice(1).join(" ") : "";
    
  const userId = req.user.id;

  if (!userId) {
    return res.status(401).json({
      message: "User is not found",
      csrfToken: req.csrfToken(),
    });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({
      error: "Username or password is wrong!",
      csrfToken: req.csrfToken(),
      errors
    });
  }

  try {
    await PeopleUser.findByIdAndUpdate(userId, {
      name: username,
      surname,
      email,
      phone_suffix,
      phone_number,
    });
   

    return res.status(200).json({
      message: "Profile updated successfully",
      success: true,
      csrfToken: req.csrfToken(),
      redirect: "/settings",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal server error",
      csrfToken: req.csrfToken(),
    });
  }
};
