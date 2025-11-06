import { generateRandomPassword } from "../../utils/generatePassword.js";
import {
  generateOtp,
  sendMail,
  smsChooser,
} from "../../../shared/utils/otpHandler.js";
import TempAddedPartnerProfileChanges from "../../../shared/models/tempAddedPartnerProfileChanges.js";
import User from "../../../shared/models/partnyorUserModel.js";
import TempPartnerProfileChanges from "../../../shared/models/tempPartnerProfileChanges.js";
import TempPartnerUserDelete from "../../../shared/model/partner/tempPartnerUserDelete.js";
import PartnerUser from "../../../shared/models/partnyorUserModel.js";
import OtpModel from "../../../shared/models/otp.js";
import { Duties } from "../../../shared/models/dutyModel.js";
import argon2 from "argon2";
import i18n from "i18n";
import OldMuessiseUsers from "../../../shared/model/partner/oldMuessiseUsers.js";
import NotificationModel from "../../../shared/models/notificationModel.js";
import { sendNotification } from "../../../shared/utils/sendNotification.js";

export const showUsers = async (req, res) => {
  try {
    const { draw, query, order, start, length } = req.body;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access - user ID not found",
      });
    }

    const currentUser = await PartnerUser.findById(userId).select("muessise_id");
    if (!currentUser || !currentUser.muessise_id) {
      return res.status(403).json({
        success: false,
        message: "User does not belong to any organization",
      });
    }

    let baseQuery = { muessise_id: currentUser.muessise_id };

    if (query && query.trim() !== "") {
      const searchRegex = new RegExp(query.trim(), "i");
      baseQuery.$or = [
        { name: searchRegex },
        { surname: searchRegex },
      ];
    }

    const totalRecords = await PartnerUser.countDocuments({ muessise_id: currentUser.muessise_id });
    const filteredRecords = await PartnerUser.countDocuments(baseQuery);

    let sortQuery = { createdAt: -1 };
    if (order && order.length > 0) {
      const { column, dir } = order[0];
      const direction = dir === "asc" ? 1 : -1;
      const columnMap = {
        0: "name",
        1: "email",
        2: "phone",
        3: "gender",
        4: "createdAt",
      };
      const sortField = columnMap[column] || "createdAt";
      sortQuery = { [sortField]: direction };
    }

    const startIndex = parseInt(start) || 0;
    const pageSize = parseInt(length) || 10;

    const users = await PartnerUser.find(baseQuery)
      .select("name surname email phone phone_suffix gender createdAt duty perm")
      .populate("duty", "name")
      .populate("perm", "name")
      .sort(sortQuery)
      .skip(startIndex)
      .limit(pageSize)
      .lean();

    const formattedData = users.map((user) => {
      const name = user.name?.trim() || "";
      const surname = user.surname?.trim() || "";
      const displayName = name && surname ? `${name} ${surname}` : name || surname || "";

      return {
        id: user._id,
        name,
        surname,
        displayName,
        email: user.email || "",
        phone: user.phone || "",
        phone_suffix: user.phone_suffix || "",
        gender: user.gender || "",
        duty_name: user.duty?.name || "Təyin olunmayıb",
        permission_name: user.perm?.name || "Təyin olunmayıb",
        createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString("az-AZ") : "",
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedData,
      recordsTotal: totalRecords,
      recordsFiltered: filteredRecords,
      draw: parseInt(draw) || 1,
    });
  } catch (error) {
    console.error("Error in showUsers controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error occurred while fetching users",
      error: error.message,
    });
  }
};


export const addUser = async (req, res) => {
  try {
    // 1. Request body-dən dataları almaq
    const {
      fullName,
      gender,
      email,
      phoneNumber,
      dutyId,
      muessiseName,
      authId,
      phone_suffix,
    } = req.body;

    const isDev = process.env.NODE_ENV === "development";

    if (isDev) {
      console.log("req.user:", req.user);
    }

    // 2. Name və surname bölmə
    const nameParts = (fullName || "").trim().replace(/\s+/g, " ").split(" ");
    const name = nameParts[0] || "";
    const surname = nameParts.slice(1).join(" "); // <-- soyad dolsun
    const normalizedFullName = (fullName || "").trim().replace(/\s+/g, " ");

    // 3. Random password yaratmaq
    const randomPassword = generateRandomPassword();
    const userId = req.user.id;

    if (!userId)
      return res.status(400).json({
        success: false,
        message: "User id not found ",
      });
    const user = await PartnerUser.findById(userId);
    if (!user)
      return res.status(400).json({
        success: false,
        message: "User not found",
      });

    if (isDev) {
      console.log("user.muessise_id:", user.muessise_id);
    }

    const doesEmailExist = await PartnerUser.findOne({ email: email });
    if (doesEmailExist) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // 4. Model structure-a uyğun data hazırlamaq
    const tempUserData = {
      user_id: req.user.id,
      muessise_id: user.muessise_id, // Add the current user's muessise_id
      name: name,
      surname: surname,
      fullName: normalizedFullName,
      full_name: normalizedFullName,
      email: email,
      phone_number: phoneNumber,
      phone_suffix: (phone_suffix || "").replace(/^\+/, ""),
      password: randomPassword,
      gender: gender,
      dutyId: dutyId || null,
      permissionId: authId || null,
      otp_type: "email",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };

    if (isDev) {
      console.log("tempUserData being saved:", tempUserData);
    }

    const createdTempUser =
      await TempAddedPartnerProfileChanges.create(tempUserData);

    if (isDev) {
      console.log("createdTempUser:", createdTempUser);
    }

    const creatorUser = await PartnerUser.findById(req.user.id).select(
      "otp_email_status otp_sms_status otp_authenticator_status email phone phone_suffix"
    );

    if (!creatorUser) {
      return res.status(404).json({
        success: false,
        message: "Creator user not found",
      });
    }

    let otpSent = false;
    let otpResponse = null;
    let otpError = null;

    try {
      if (creatorUser.otp_email_status) {
        const otp = generateOtp();

        if (isDev) {
          console.log(`🔐 Email OTP for ${creatorUser.email}: ${otp}`);
        }

        try {
          const emailSent = await sendMail(creatorUser.email, otp, isDev);

          if (emailSent) {
            otpResponse = {
              success: true,
              method: "email",
              message: "OTP sent to email",
            };
            otpSent = true;

            await TempAddedPartnerProfileChanges.findByIdAndUpdate(
              createdTempUser._id,
              {
                otp: otp,
                otp_type: "email",
              }
            );
          } else {
            otpError = "Email sending failed";
          }
        } catch (emailError) {
          otpError = "Email sending error: " + emailError.message;
        }
      } else if (creatorUser.otp_sms_status) {
        const otp = generateOtp();

        if (isDev) {
          console.log("SMS OTP generated:", otp);
          console.log("SMS parameters:", {
            phone_suffix: creatorUser.phone_suffix,
            phone: creatorUser.phone,
            debug: isDev,
          });
        }

        try {
          // Development modunda debug: true göndər
          const smsResult = await smsChooser(
            "sms",
            otp,
            creatorUser.phone_suffix,
            creatorUser.phone, // phoneNumber əvəzinə phone
            "sms",
            isDev
          );

          if (isDev) {
            console.log("SMS result:", smsResult);
          }

          if (smsResult && smsResult.success) {
            otpResponse = {
              success: true,
              method: "sms",
              message: "OTP sent to SMS",
            };
            otpSent = true;

            // Temporary record-a OTP məlumatları əlavə etmək
            await TempAddedPartnerProfileChanges.findByIdAndUpdate(
              createdTempUser._id,
              {
                otp: otp,
                otp_type: "sms",
              }
            );
          } else {
            if (isDev) {
              console.log("SMS sending failed, result:", smsResult);
            }
            otpError = "SMS sending failed";
          }
        } catch (smsError) {
          if (isDev) {
            console.log("SMS catch error:", smsError);
          }
          console.error("SMS OTP error:", smsError);
          otpError = "SMS sending error: " + smsError.message;
        }
      }
      // Authenticator prioriteti
      else if (creatorUser.otp_authenticator_status) {
        if (isDev) {
          console.log("Authenticator OTP selected");
        }

        otpSent = true;
        otpResponse = {
          success: true,
          method: "authenticator",
          message: "Use authenticator app for verification",
        };

        // Temporary record-a authenticator məlumatları əlavə etmək
        await TempAddedPartnerProfileChanges.findByIdAndUpdate(
          createdTempUser._id,
          {
            otp_type: "other",
          }
        );
      }
    } catch (otpGeneralError) {
      console.error("General OTP error:", otpGeneralError);
      otpError = "OTP process failed: " + otpGeneralError.message;
    }

    // Response qaytarmaq
    if (otpSent && otpResponse && otpResponse.success) {
      return res.status(200).json({
        success: true,
        message: "User data saved temporarily. OTP sent to creator.",
        otpSent: true,
        otpRequired: true,
        otpMethod: otpResponse.method,
        tempRecordId: createdTempUser._id,
        tempDeleteId: createdTempUser._id, // for compatibility
        user_email: creatorUser.email,
        url: "/muessise-info/accept-add-user",
        otpResponse,
        muessise_id: user.muessise_id,
      });
    } else if (otpError) {
      return res.status(200).json({
        success: true,
        message:
          "User data saved, but OTP sending failed. Manual verification required.",
        otpSent: false,
        otpError,
        tempRecordId: createdTempUser._id,
        muessise_id: user.muessise_id,
      });
    } else {
      const newUser = await PartnerUser.create({
        name,
        surname, // <-- əlavə edildi
        fullName: normalizedFullName, // <-- əlavə edildi
        full_name: normalizedFullName, // <-- əlavə edildi
        email,
        phone: phoneNumber,
        phone_suffix: (phone_suffix || "").replace(/^\+/, ""),
        gender,
        password: randomPassword,
        duty: dutyId,
        perm: authId,
        muessise_id: user.muessise_id,
      });

      await sendMail(
        email,
        `Sistemə giriş üçün məlumatlar:
      Email: ${email}
        Şifrə: ${randomPassword}`,
        isDev
      );

      return res.status(200).json({
        success: true,
        message:
          "User data saved without OTP verification (no OTP methods enabled).",
        otpSent: false,
        tempRecordId: createdTempUser._id,
        userData: {
          name,
          surname, // <-- əlavə edildi
          fullName: normalizedFullName, // <-- əlavə edildi
          phone_number: phoneNumber,
          muessise_id: user.muessise_id,
        },
      });
    }
  } catch (error) {
    console.error("Error in addUser controller:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error occurred while processing user data",
      error: error.message,
      details: "Please contact system administrator",
    });
  }
};

export const acceptAddedUser = async (req, res) => {
  try {
    const { tempDeleteId, otp1, otp2, otp3, otp4, otp5, otp6, id, otp } =
      req.body;

    // Support both old format (id, otp) and new format (tempDeleteId, otp1-otp6)
    let otpCode, recordId;

    if (tempDeleteId && otp1 && otp2 && otp3 && otp4 && otp5 && otp6) {
      // New format from OTP popup
      otpCode = `${otp1}${otp2}${otp3}${otp4}${otp5}${otp6}`;
      recordId = tempDeleteId;
    } else if (id && otp) {
      // Old format for backward compatibility
      otpCode = otp;
      recordId = id;
    } else {
      return res.status(400).json({
        success: false,
        message: "OTP və ya ID daxil edilməyib",
      });
    }

    if (!recordId || !otpCode || otpCode.length !== 6) {
      return res.status(400).json({
        success: false,
        message: "OTP kodu 6 rəqəm olmalıdır",
      });
    }

    const tempUser = await TempAddedPartnerProfileChanges.findById(recordId);

    const isDev = process.env.NODE_ENV === "development";
    if (isDev) {
      console.log("tempUser from DB:", tempUser);
    }

    if (!tempUser) {
      return res.status(404).json({
        success: false,
        message: "OTP üçün müvəqqəti istifadəçi tapılmadı",
      });
    }

    if (tempUser.otp !== otpCode) {
      return res.status(401).json({
        success: false,
        message: "OTP yanlışdır",
      });
    }

    // Hash the password with Argon2
    const hashedPassword = await argon2.hash(tempUser.password);

    const userCreateData = {
      name: tempUser.name,
      surname: tempUser.surname,
      email: tempUser.email,
      password: hashedPassword,
      phone: tempUser.phone_number,
      phone_suffix: (tempUser.phone_suffix || "").toString().replace(/^\+/, ""),
      gender: tempUser.gender,
      muessise_id: tempUser.muessise_id, // Set the muessise_id from temp data
      duty: tempUser.dutyId,
      perm: tempUser.permissionId,
      created_by: tempUser.user_id,
    };

    if (isDev) {
      console.log("userCreateData:", userCreateData);
    }

    const newUser = await PartnerUser.create(userCreateData);

    if (isDev) {
      console.log("newUser created:", newUser);
    }

    await sendMail(tempUser.email, {
      subject: "Hesab təsdiqləndi",
      html: `
        <p>Salam ${tempUser.name},</p>
        <p>Hesabınız uğurla təsdiqləndi.</p>
        <p><strong>Login email:</strong> ${tempUser.email}</p>
        <p><strong>Şifrə:</strong> ${tempUser.password}</p>
      `,
    });

    await TempAddedPartnerProfileChanges.findByIdAndDelete(recordId);

    return res.status(200).json({
      success: true,
      message: "Hesab təsdiqləndi və yaradıldı",
      userId: newUser._id,
    });
  } catch (error) {
    console.error("acceptAddedUser error:", error);
    return res.status(500).json({
      success: false,
      message: "Daxili server xətası",
    });
  }
};

// export const editUser = async (req, res) => {
//   try {
//     const {
//       user_id, // required
//       fullName, // optional
//       gender, // optional
//       email, // optional
//       phoneNumber, // optional
//       dutyId, // optional
//       authId, // optional
//     } = req.body;

//     const isDev = process.env.NODE_ENV === "development";

//     if (isDev) {
//       console.log("Edit request from user:", req.user);
//       console.log("Target user_id:", user_id);
//       console.log("Update data:", {
//         fullName,
//         gender,
//         email,
//         phoneNumber,
//         dutyId,
//         authId,
//       });
//     }

//     // Get sender user's datas
//     const senderUser = await PartnerUser.findById(req.user.id).select(
//       "muessise_id name email"
//     );

//     if (!senderUser) {
//       return res.status(404).json({
//         success: false,
//         message: "Sender user not found",
//       });
//     }

//     if (!senderUser.muessise_id) {
//       return res.status(403).json({
//         success: false,
//         message: "Sender user does not belong to any organization",
//       });
//     }

//     // Edited user's data
//     const targetUser = await PartnerUser.findById(user_id);

//     if (!targetUser) {
//       return res.status(404).json({
//         success: false,
//         message: "Target user not found",
//       });
//     }

//     if (!targetUser.muessise_id) {
//       return res.status(403).json({
//         success: false,
//         message: "Target user does not belong to any organization",
//       });
//     }

//     // check for same muessise_id
//     if (
//       senderUser.muessise_id.toString() !== targetUser.muessise_id.toString()
//     ) {
//       return res.status(403).json({
//         success: false,
//         message: "You can only edit users from your own organization",
//       });
//     }

//     if (isDev) {
//       console.log("Security check passed - same organization");
//     }

//     let name, surname;
//     if (fullName) {
//       const nameParts = fullName.split(" ");
//       name = nameParts[0];
//       surname = nameParts.slice(1).join(" ");
//     }

//     const updateData = {
//       user_id: user_id,
//       expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
//       device_details: {
//         target_user_id: user_id,
//         editor_user_id: req.user.id,
//         operation_type: "edit_user",
//       },
//     };

//     if (fullName) {
//       updateData.name = name;
//       updateData.surname = surname;
//     }
//     if (gender) updateData.gender = gender;
//     if (email) updateData.email = email;
//     if (phoneNumber) updateData.phone_number = phoneNumber;
//     if (dutyId) updateData.device_details.dutyId = dutyId;
//     if (authId) updateData.device_details.permissionId = authId;

//     if (isDev) {
//       console.log("Creating temp edit record...");
//       console.log("Update data:", updateData);
//     }

//     const tempEditRecord = await TempPartnerProfileChanges.create(updateData);

//     if (isDev) {
//       console.log("Temp edit record created:", tempEditRecord._id);
//     }

//     // Check editor user's OTP statuses
//     const editorUser = await PartnerUser.findById(req.user.id).select(
//       "otp_email_status otp_sms_status otp_authenticator_status email phone phone_suffix"
//     );

//     if (!editorUser) {
//       return res.status(404).json({
//         success: false,
//         message: "Editor user not found for OTP verification",
//       });
//     }

//     if (isDev) {
//       console.log("Editor user OTP statuses:", {
//         email_status: editorUser.otp_email_status,
//         sms_status: editorUser.otp_sms_status,
//         authenticator_status: editorUser.otp_authenticator_status,
//         email: editorUser.email,
//         phone: editorUser.phone,
//         phone_suffix: editorUser.phone_suffix,
//       });
//     }

//     let otpSent = false;
//     let otpResponse = null;
//     let otpError = null;

//     try {
//       if (editorUser.otp_email_status) {
//         const otp = generateOtp();

//         if (isDev) {
//           console.log("Email OTP generated for edit:", otp);
//         }

//         try {
//           const emailSent = await sendMail(editorUser.email, otp, isDev);

//           if (emailSent) {
//             otpResponse = {
//               success: true,
//               method: "email",
//               message: "OTP sent to email for user edit verification",
//             };
//             otpSent = true;

//             await TempPartnerProfileChanges.findByIdAndUpdate(
//               tempEditRecord._id,
//               {
//                 otp: otp,
//                 otp_type: "email",
//               }
//             );
//           } else {
//             otpError = "Email sending failed";
//           }
//         } catch (emailError) {
//           console.error("Email OTP error in edit:", emailError);
//           otpError = "Email sending error: " + emailError.message;
//         }
//       } else if (editorUser.otp_sms_status) {
//         const otp = generateOtp();

//         if (isDev) {
//           console.log("SMS OTP generated for edit:", otp);
//           console.log("SMS parameters:", {
//             phone_suffix: editorUser.phone_suffix,
//             phone: editorUser.phone,
//             debug: isDev,
//           });
//         }

//         try {
//           const smsResult = await smsChooser(
//             "sms",
//             otp,
//             editorUser.phone_suffix,
//             editorUser.phone,
//             "sms",
//             isDev
//           );

//           if (isDev) {
//             console.log("SMS result for edit:", smsResult);
//           }

//           if (smsResult && smsResult.success) {
//             otpResponse = {
//               success: true,
//               method: "sms",
//               message: "OTP sent to SMS for user edit verification",
//             };
//             otpSent = true;

//             await TempPartnerProfileChanges.findByIdAndUpdate(
//               tempEditRecord._id,
//               {
//                 otp: otp,
//                 otp_type: "sms",
//               }
//             );
//           } else {
//             if (isDev) {
//               console.log("SMS sending failed for edit, result:", smsResult);
//             }
//             otpError = "SMS sending failed";
//           }
//         } catch (smsError) {
//           if (isDev) {
//             console.log("SMS catch error in edit:", smsError);
//           }
//           console.error("SMS OTP error in edit:", smsError);
//           otpError = "SMS sending error: " + smsError.message;
//         }
//       } else if (editorUser.otp_authenticator_status) {
//         if (isDev) {
//           console.log("Authenticator OTP selected for edit");
//         }

//         otpSent = true;
//         otpResponse = {
//           success: true,
//           method: "authenticator",
//           message: "Use authenticator app for user edit verification",
//         };

//         await TempPartnerProfileChanges.findByIdAndUpdate(tempEditRecord._id, {
//           otp_type: "other",
//         });
//       }
//     } catch (otpGeneralError) {
//       console.error("General OTP error in edit:", otpGeneralError);
//       otpError = "OTP process failed: " + otpGeneralError.message;
//     }
//     if (otpSent && otpResponse && otpResponse.success) {
//       return res.status(200).json({
//         success: true,
//         message:
//           "User edit request saved temporarily. OTP sent for verification.",
//         otpSented: true,
//         otpMethod: otpResponse.method,
//         tempRecordId: tempEditRecord._id,
//         targetUser: {
//           id: targetUser._id,
//           name: targetUser.name,
//           email: targetUser.email,
//         },
//         otpResponse,
//       });
//     } else if (otpError) {
//       return res.status(200).json({
//         success: true,
//         message:
//           "User edit request saved, but OTP sending failed. Manual verification required.",
//         otpSented: false,
//         otpError,
//         tempRecordId: tempEditRecord._id,
//         targetUser: {
//           id: targetUser._id,
//           name: targetUser.name,
//           email: targetUser.email,
//         },
//       });
//     } else {
//       targetUser.gender = updateData.gender;
//       targetUser.duty = updateData.dutyId;
//       targetUser.perm = updateData.authId;
//       targetUser.email = updateData.email;
//       targetUser.phone_number = updateData.phone_number;
//       targetUser.phone_suffix = updateData.phone_suffix;
//       targetUser.name = updateData.name;
//       targetUser.surname = updateData.surname ?? "";

//       await targetUser.save();

//       return res.status(200).json({
//         success: true,
//         message:
//           "User edit request saved without OTP verification (no OTP methods enabled).",
//         otpSented: false,
//         tempRecordId: tempEditRecord._id,
//         targetUser: {
//           id: targetUser._id,
//           name: targetUser.name,
//           email: targetUser.email,
//         },
//       });
//     }
//   } catch (error) {
//     console.error("Error in editUser controller:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Internal server error occurred while processing edit request",
//       error: error.message,
//       details: "Please contact system administrator",
//     });
//   }
// };

export const editUser = async (req, res) => {
  try {
    const {
      user_id, // required
      fullName, // optional
      gender, // optional
      email, // optional
      phoneNumber, // optional (şemada: phone)
      dutyId, // optional (şemada: duty)
      authId, // optional (şemada: perm)
      phonePrefix, // optional (şemada: phone_suffix) - formdan geliyorsa
    } = req.body;

    const isDev = process.env.NODE_ENV === "development";

    // Editor user
    const senderUser = await PartnerUser.findById(req.user.id).select(
      "muessise_id name email"
    );
    if (!senderUser)
      return res
        .status(404)
        .json({ success: false, message: "Sender user not found" });
    if (!senderUser.muessise_id)
      return res.status(403).json({
        success: false,
        message: "Sender user does not belong to any organization",
      });

    // Target user
    const targetUser = await PartnerUser.findById(user_id);
    if (!targetUser)
      return res
        .status(404)
        .json({ success: false, message: "Target user not found" });
    if (!targetUser.muessise_id)
      return res.status(403).json({
        success: false,
        message: "Target user does not belong to any organization",
      });

    // same org
    if (
      senderUser.muessise_id.toString() !== targetUser.muessise_id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only edit users from your own organization",
      });
    }

    // ---- PATCH hazirla (hemen uygulanacak alanlar) ----
    const patch = {};

    // fullName parcalama + normalize
    if (typeof fullName === "string" && fullName.trim() !== "") {
      const normalizedFull = fullName.trim().replace(/\s+/g, " ");
      const parts = normalizedFull.split(" ");
      const first = parts[0] || "";
      const last = parts.slice(1).join(" ") || "";

      patch.name = first;
      patch.surname = last;
      patch.fullName = normalizedFull; // camelCase
      patch.full_name = normalizedFull; // underscore
    }

    if (typeof gender === "string" && gender) patch.gender = gender; // "male" | "female"
    if (typeof email === "string" && email) patch.email = email;

    // Telefon alanlari: şema phone / phone_suffix
    if (typeof phoneNumber === "string" && phoneNumber)
      patch.phone = phoneNumber;
    if (typeof phonePrefix === "string" && phonePrefix) {
      const onlyDigits = phonePrefix.replace(/[^\d]/g, "");
      patch.phone_suffix = onlyDigits || phonePrefix;
    }

    // Vezife (duty) ve selahiyyet (perm)
    // Boş/undefined gelirse MEVCUT DEGERI SILME! Sadece gelirse ayarla.
    if (typeof dutyId === "string" && dutyId) patch.duty = dutyId;
    if (typeof authId === "string" && authId) patch.perm = authId;

    if (isDev) {
      console.log("Edit User - Request Body:", req.body);
      console.log("Edit User - Patch to apply:", patch);
    }

    // ---- TEMP kayit (OTP icin) ----
    const updateData = {
      user_id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      device_details: {
        target_user_id: user_id,
        editor_user_id: req.user.id,
        operation_type: "edit_user",
      },
      // patch icindeki sahalari bilgisel olarak da saklayalim (audit)
      ...patch,
    };

    // Ayrica duty/perm'i device_details altinda da tut (senin önceki yapina uyum)
    if (patch.duty) updateData.device_details.dutyId = patch.duty;
    if (patch.perm) updateData.device_details.permissionId = patch.perm;

    const tempEditRecord = await TempPartnerProfileChanges.create(updateData);

    if (isDev) {
      console.log("Edit User - updateData sent to temp record:", updateData);
      console.log("Edit User - tempEditRecord created:", tempEditRecord);
    }

    // ---- OTP flow ----
    const editorUser = await PartnerUser.findById(req.user.id).select(
      "otp_email_status otp_sms_status otp_authenticator_status email phone phone_suffix"
    );
    if (!editorUser) {
      return res.status(404).json({
        success: false,
        message: "Editor user not found for OTP verification",
      });
    }

    let otpSent = false,
      otpResponse = null,
      otpError = null;

    try {
      if (editorUser.otp_email_status) {
        const otp = generateOtp();

        if (isDev) {
          console.log(`🔐 Edit User Email OTP for ${editorUser.email}: ${otp}`);
        }

        const emailSent = await sendMail(editorUser.email, otp, isDev);
        if (emailSent) {
          otpResponse = {
            success: true,
            method: "email",
            message: "OTP sent to email for user edit verification",
          };
          otpSent = true;
          await TempPartnerProfileChanges.findByIdAndUpdate(
            tempEditRecord._id,
            { otp, otp_type: "email" }
          );
        } else {
          otpError = "Email sending failed";
        }
      } else if (editorUser.otp_sms_status) {
        const otp = generateOtp();
        if (isDev)
          console.log("SMS OTP generated for edit:", otp, {
            phone_suffix: editorUser.phone_suffix,
            phone: editorUser.phone,
            debug: isDev,
          });
        const smsResult = await smsChooser(
          "sms",
          otp,
          editorUser.phone_suffix,
          editorUser.phone,
          "sms",
          isDev
        );
        if (smsResult && smsResult.success) {
          otpResponse = {
            success: true,
            method: "sms",
            message: "OTP sent to SMS for user edit verification",
          };
          otpSent = true;
          await TempPartnerProfileChanges.findByIdAndUpdate(
            tempEditRecord._id,
            { otp, otp_type: "sms" }
          );
        } else {
          otpError = "SMS sending failed";
        }
      } else if (editorUser.otp_authenticator_status) {
        otpSent = true;
        otpResponse = {
          success: true,
          method: "authenticator",
          message: "Use authenticator app for user edit verification",
        };
        await TempPartnerProfileChanges.findByIdAndUpdate(tempEditRecord._id, {
          otp_type: "other",
        });
      }
    } catch (e) {
      console.error("General OTP error in edit:", e);
      otpError = "OTP process failed: " + e.message;
    }

    // OTP gerektiyse: sadece temp kayit olusturduk, UI OTP surecine girecek
    if (otpSent && otpResponse?.success) {
      return res.status(200).json({
        success: true,
        message:
          "User edit request saved temporarily. OTP sent for verification.",
        otpSented: true,
        otpSent: true,
        otpRequired: true,
        otpMethod: otpResponse.method,
        tempRecordId: tempEditRecord._id,
        tempDeleteId: tempEditRecord._id, // for compatibility
        user_email: editorUser.email,
        url: "/muessise-info/accept-edit-user",
        targetUser: {
          id: targetUser._id,
          name: targetUser.name,
          email: targetUser.email,
        },
        otpResponse,
      });
    } else if (otpError) {
      return res.status(200).json({
        success: true,
        message:
          "User edit request saved, but OTP sending failed. Manual verification required.",
        otpSented: false,
        otpError,
        tempRecordId: tempEditRecord._id,
        targetUser: {
          id: targetUser._id,
          name: targetUser.name,
          email: targetUser.email,
        },
      });
    }

    // ---- OTP YOKSA: hemen uygula ----

    // Bos patch ise hic dokunma
    if (Object.keys(patch).length > 0) {
      Object.assign(targetUser, patch);
      await targetUser.save();
    }

    return res.status(200).json({
      success: true,
      message:
        "User edit applied without OTP verification (no OTP methods enabled).",
      otpSented: false,
      tempRecordId: tempEditRecord._id,
      targetUser: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
      },
    });
  } catch (error) {
    console.error("Error in editUser controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error occurred while processing edit request",
      error: error.message,
      details: "Please contact system administrator",
    });
  }
};

export const deleteUser = async (req, res) => {
  const { id, ids } = req.body;

  const myUser = await PartnerUser.findById(req.user.id);

  if (!id && !ids) {
    return res.status(400).json({
      success: false,
      message: "Either 'id' or 'ids' must be provided",
    });
  }

  if (id && ids) {
    return res.status(400).json({
      success: false,
      message: "Cannot provide both 'id' and 'ids' parameters",
    });
  }

  let userIds = [];
  let users = [];

  try {
    if (id) {
      const user = await PartnerUser.findById(id).select(
        "muessise_id email fullname hire_date partnyor_id"
      );
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (
        myUser.muessise_id &&
        user.muessise_id.toString() !== myUser.muessise_id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "You can only delete users from your own organization",
        });
      }

      userIds = [id];
      users = [user];
    }

    if (ids) {
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: "IDs must be a non-empty array",
        });
      }

      const foundUsers = await PartnerUser.find({ _id: { $in: ids } }).select(
        "muessise_id email fullname hire_date partnyor_id"
      );

      if (foundUsers.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No users found for the provided IDs",
        });
      }

      if (foundUsers.length !== ids.length) {
        return res.status(404).json({
          success: false,
          message: "Some users were not found",
        });
      }

      // Check if all users belong to the same muessise_id
      const muessiseId = myUser.muessise_id.toString();
      for (const user of foundUsers) {
        if (user.muessise_id.toString() !== muessiseId) {
          return res.status(403).json({
            success: false,
            message: "You can only delete users from your own organization",
          });
        }
      }

      userIds = [...ids];
      users = [...foundUsers];
    }

    const deletedUser = await TempPartnerUserDelete.create({
      sender_id: req.user.id,
      users: userIds,
    });

    // Use the current user's email (the one performing the deletion), not the target user's email
    const currentUserEmail = myUser.email;

    const otpCode = await OtpModel.create({
      user_id: req.user.id,
      email: currentUserEmail,
      otp: generateOtp(),
      expire_time: new Date(Date.now() + 15 * 60 * 1000),
    });

    const debug = process.env.NODE_ENV !== "production";

    if (debug) {
      console.log(`🔐 Delete User OTP for ${currentUserEmail}: ${otpCode.otp}`);
    }

    let emailSent = false;
    try {
      emailSent = await sendMail(currentUserEmail, otpCode.otp, false);
    } catch (emailError) {
      console.error("Email send error:", emailError.message);
      // Continue with the process even if email fails in development
      if (debug) {
        console.log("Email sending failed, but continuing in development mode");
      }
    }

    deletedUser.otp_code = otpCode.otp;
    deletedUser.otp_send_time = new Date();
    await deletedUser.save();

    if (debug) {
      console.log("deleteUser - saved temp record:", {
        id: deletedUser._id,
        otp_code: deletedUser.otp_code,
        users: deletedUser.users,
      });
    }

    return res.status(200).json({
      success: true,
      email: currentUserEmail,
      tempDeleteId: deletedUser._id,
      otpRequired: true,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error occurred while processing deletion",
      error: err.message,
    });
  }
};

export const acceptDeleteUser = async (req, res) => {
  try {
    const { otp1, otp2, otp3, otp4, otp5, otp6, tempDeleteId } = req.body;
    const userId = req.user?.id || req.user?._id;
    const user = await PartnerUser.findById(userId);

    const otpArray = [otp1, otp2, otp3, otp4, otp5, otp6];

    for (let i = 0; i < otpArray.length; i++) {
      if (!otpArray[i] || typeof otpArray[i] !== "string") {
        return res.status(400).json({
          message: `OTP ${
            i + 1
          } kodu göndərilməyib və ya düzgün formatda deyil`,
        });
      }

      otpArray[i] = otpArray[i].trim().replace(/[^0-9]/g, "");

      if (otpArray[i].length !== 1) {
        return res.status(400).json({
          message: `OTP ${i + 1} kodu düzgün formatda deyil`,
        });
      }
    }

    const otp = otpArray.join("");

    if (otp.length !== 6) {
      return res.status(400).json({ message: "OTP kodu 6 rəqəmli olmalıdır" });
    }

    const isDev = process.env.NODE_ENV === "development";

    if (isDev) {
      console.log("acceptDeleteUser - tempDeleteId:", tempDeleteId);
      console.log("acceptDeleteUser - received OTP:", otp);
    }

    // Use tempDeleteId if provided, otherwise fallback to latest request
    let latestRequest;
    if (tempDeleteId) {
      latestRequest = await TempPartnerUserDelete.findById(tempDeleteId);
    } else {
      latestRequest = await TempPartnerUserDelete.findOne({
        sender_id: userId,
      }).sort({ createdAt: -1 });
    }

    if (!latestRequest) {
      return res
        .status(404)
        .json({ message: "Silinəcək user tələbi tapılmadı" });
    }

    if (isDev) {
      console.log("acceptDeleteUser - found request:", latestRequest);
      console.log("acceptDeleteUser - stored OTP:", latestRequest.otp_code);
    }

    if (latestRequest.otp_code !== otp) {
      return res.status(400).json({
        message: "OTP kodu düzgün deyil",
      });
    }

    if (!latestRequest.users || latestRequest.users.length === 0) {
      return res.status(400).json({
        message: "Silinəcək user tapılmadı",
      });
    }

    let deletedUsers = [];
    let errorMessages = [];

    // Instead of hard-deleting users, move them to OldMuessiseUsers and set their muessise_id to null
    if (Array.isArray(latestRequest.users)) {
      for (const userIdToDelete of latestRequest.users) {
        if (userIdToDelete.toString() === userId.toString()) {
          errorMessages.push("Özünüzü silə bilməzsiniz");
          continue;
        }

        try {
          const userToArchive = await PartnerUser.findById(userIdToDelete);
          if (userToArchive) {
            // Record previous muessise for history
            const prevMuessise = userToArchive.muessise_id;

            await OldMuessiseUsers.create({
              user_id: userToArchive._id,
              user_partner_id: userToArchive._id,
              muessise_id: prevMuessise || null,
              hire_date: userToArchive.hire_date || null,
              dismissal_date: new Date(),
            });

            // Set user's muessise_id to null (user is now detached from muessise)
            userToArchive.muessise_id = null;
            await userToArchive.save();

            // Send in-app notification and attempt push
            const notif = await NotificationModel.create({
              title: "Müəssisədən çıxarılma",
              text: "Siz müəssisədən çıxarıldınız.",
              type: "notification",
              category: "personal",
              user: userToArchive._id,
              muessise_id: prevMuessise || null,
              creator: prevMuessise || null,
              creatorModel: "Muessise",
            });

            // Attempt firebase push if token exists
            try {
              if (userToArchive.firebase_token) {
                await sendNotification({
                  title: "Müəssisə dəyişiklik",
                  body: "Siz müəssisədən çıxarılmısınız",
                  data: {},
                  tokens: [userToArchive.firebase_token],
                });
              }
            } catch (pushErr) {
              console.warn(
                "Push notification failed:",
                pushErr.message || pushErr
              );
            }

            deletedUsers.push(userToArchive.name || userToArchive.email);
          }
        } catch (error) {
          errorMessages.push(`User arxivlənməsi xətası: ${userIdToDelete}`);
        }
      }
    } else {
      const userIdToArchive = latestRequest.users;

      if (userIdToArchive.toString() === userId.toString()) {
        return res.status(400).json({
          message: "Özünüzü silə bilməzsiniz",
        });
      }

      try {
        const userToArchive = await PartnerUser.findById(userIdToArchive);
        if (userToArchive) {
          const prevMuessise = userToArchive.muessise_id;

          await OldMuessiseUsers.create({
            user_id: userToArchive._id,
            user_partner_id: userToArchive._id,
            muessise_id: prevMuessise || null,
            hire_date: userToArchive.hire_date || null,
            dismissal_date: new Date(),
          });

          userToArchive.muessise_id = null;
          await userToArchive.save();

          const notif = await NotificationModel.create({
            title: "Müəssisədən çıxarılma",
            text: "Siz müəssisədən çıxarıldınız.",
            type: "notification",
            category: "personal",
            user: userToArchive._id,
            muessise_id: prevMuessise || null,
            creator: prevMuessise || null,
            creatorModel: "Muessise",
          });

          try {
            if (userToArchive.firebase_token) {
              await sendNotification({
                title: "Müəssisə dəyişiklik",
                body: "Siz müəssisədən çıxarılmısınız",
                data: {},
                tokens: [userToArchive.firebase_token],
              });
            }
          } catch (pushErr) {
            console.warn(
              "Push notification failed:",
              pushErr.message || pushErr
            );
          }

          deletedUsers.push(userToArchive.name || userToArchive.email);
        } else {
          errorMessages.push("User tapılmadı");
        }
      } catch (error) {
        errorMessages.push(`User arxivlənməsi xətası: ${userIdToArchive}`);
      }
    }

    await TempPartnerUserDelete.findByIdAndDelete(latestRequest._id);

    let responseMessage = "";
    if (deletedUsers.length > 0) {
      responseMessage = `${deletedUsers.length} user uğurla silindi`;
      if (errorMessages.length > 0) {
        responseMessage += `, lakin ${errorMessages.length} xəta baş verdi`;
      }
    } else {
      responseMessage = "Heç bir user silinmədi";
    }

    return res.status(200).json({
      success: deletedUsers.length > 0,
      message: responseMessage,
      deletedUsers: deletedUsers,
      errors: errorMessages,
    });
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development";
    if (isDev) {
      console.error("acceptDeleteUser error:", error);
    }
    return res.status(500).json({
      message: "Server xətası baş verdi",
      ...(isDev && { error: error.message }),
    });
  }
};

export const acceptEditUser = async (req, res) => {
  try {
    const { tempDeleteId, otp1, otp2, otp3, otp4, otp5, otp6 } = req.body;
    const otp = `${otp1}${otp2}${otp3}${otp4}${otp5}${otp6}`;

    if (!tempDeleteId || !otp || otp.length !== 6) {
      return res.status(400).json({
        success: false,
        message: "OTP və ya temp record ID daxil edilməyib",
      });
    }

    // Find the temporary edit record
    const tempEditRecord =
      await TempPartnerProfileChanges.findById(tempDeleteId);
    if (!tempEditRecord) {
      return res.status(404).json({
        success: false,
        message: "Müvəqqəti redaktə qeydi tapılmadı",
      });
    }

    const isDev = process.env.NODE_ENV === "development";
    if (isDev) {
      console.log("tempEditRecord found:", tempEditRecord);
      console.log("device_details:", tempEditRecord.device_details);
    }

    // Verify OTP
    if (tempEditRecord.otp !== otp) {
      return res.status(401).json({
        success: false,
        message: "OTP kodu yanlışdır",
      });
    }

    // Find target user to edit
    const targetUserId = tempEditRecord.device_details?.target_user_id;
    if (!targetUserId) {
      return res.status(404).json({
        success: false,
        message: "Target user ID tapılmadı temp kayıtta",
      });
    }

    const targetUser = await PartnerUser.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "Redaktə ediləcək istifadəçi tapılmadı",
      });
    }

    // Apply the changes from temp record to target user
    // The changes are stored directly in the temp record, not in a changes object
    const fieldsToUpdate = [
      "name",
      "surname",
      "fullName",
      "full_name",
      "gender",
      "email",
      "phone",
      "phone_suffix",
      "duty",
      "perm",
    ];

    if (isDev) {
      console.log("Accept Edit User - Target user BEFORE changes:", {
        _id: targetUser._id,
        name: targetUser.name,
        surname: targetUser.surname,
        fullName: targetUser.fullName,
        full_name: targetUser.full_name,
        gender: targetUser.gender,
        email: targetUser.email,
        phone: targetUser.phone,
        phone_suffix: targetUser.phone_suffix,
        duty: targetUser.duty,
        perm: targetUser.perm,
      });
      console.log("Accept Edit User - Temp record fields:", {
        name: tempEditRecord.name,
        surname: tempEditRecord.surname,
        fullName: tempEditRecord.fullName,
        full_name: tempEditRecord.full_name,
        gender: tempEditRecord.gender,
        email: tempEditRecord.email,
        phone: tempEditRecord.phone,
        phone_suffix: tempEditRecord.phone_suffix,
        duty: tempEditRecord.duty,
        perm: tempEditRecord.perm,
      });
    }

    let changesApplied = 0;
    fieldsToUpdate.forEach((field) => {
      if (
        tempEditRecord[field] !== undefined &&
        tempEditRecord[field] !== null
      ) {
        if (isDev) {
          console.log(
            `Updating ${field}: "${targetUser[field]}" -> "${tempEditRecord[field]}"`
          );
        }
        targetUser[field] = tempEditRecord[field];
        changesApplied++;
      }
    });

    if (isDev) {
      console.log(`Accept Edit User - Applied ${changesApplied} changes`);
      console.log("Accept Edit User - Target user AFTER changes:", {
        _id: targetUser._id,
        name: targetUser.name,
        surname: targetUser.surname,
        fullName: targetUser.fullName,
        full_name: targetUser.full_name,
        gender: targetUser.gender,
        email: targetUser.email,
        phone: targetUser.phone,
        phone_suffix: targetUser.phone_suffix,
        duty: targetUser.duty,
        perm: targetUser.perm,
      });
    }

    // Save the updated user
    await targetUser.save();

    if (isDev) {
      console.log("User updated successfully:", targetUser);
    }

    // Clean up temporary record
    await TempPartnerProfileChanges.findByIdAndDelete(tempDeleteId);

    return res.status(200).json({
      success: true,
      message: "İstifadəçi məlumatları uğurla yeniləndi",
      userId: targetUser._id,
    });
  } catch (error) {
    console.error("acceptEditUser error:", error);
    return res.status(500).json({
      success: false,
      message: "Daxili server xətası",
    });
  }
};
