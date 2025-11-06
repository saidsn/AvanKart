import { generateRandomPassword } from "../../utils/generatePassword.js";
import {
  generateOtp,
  sendMail,
  smsChooser,
} from "../../../shared/utils/otpHandler.js";
// import TempAddedPartnerProfileChanges from "../../../shared/models/tempAddedPartnerProfileChanges.js";
// import User from "../../../shared/models/partnyorUserModel.js";
// import TempPartnerProfileChanges from "../../../shared/models/tempPartnerProfileChanges.js";
import TempPartnerUserDelete from "../../../shared/model/partner/tempPartnerUserDelete.js";
// import PartnerUser from "../../../shared/models/partnyorUserModel.js";
import OtpModel from "../../../shared/models/otp.js";
import TempAddedPeopleProfileChanges from "../../../shared/models/tempAddedPeopleProfileChanges.js";
import PeopleUser from "../../../shared/models/peopleUserModel.js";
import TempPeopleUserDelete from "../../../shared/model/people/tempPeopleUserDelete.js";
import TempPeopleProfileChanges from "../../../shared/models/tempPeopleProfileChanges.js";
import OldSirketUsers from "../../../shared/model/people/oldSirketUsers.js";
import RbacPeoplePermission from "../../../shared/models/rbacPeopleModel.js";
import argon2 from "argon2";

export const showUsers = async (req, res) => {
  try {
    const { draw, query, order, columns, start, length, permissionId } = req.body;
    const isDev = process.env.NODE_ENV === "development";

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const currentUser = await PeopleUser.findById(userId).select("sirket_id");
    if (!currentUser?.sirket_id) {
      return res.status(403).json({ success: false, message: "User not in organization" });
    }

    let baseQuery = { sirket_id: currentUser.sirket_id };

    if (query && query.trim() !== "") {
      const searchRegex = new RegExp(query.trim(), "i");
      baseQuery.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    const totalRecords = await PeopleUser.countDocuments({ sirket_id: currentUser.sirket_id });
    const filteredRecords = await PeopleUser.countDocuments(baseQuery);

    let sortQuery = { createdAt: -1 };
    if (order && order.length > 0) {
      const columnMap = {
        0: "name",
        1: "email",
        2: "phone",
        3: "gender",
        4: "createdAt",
      };
      const sortField = columnMap[order[0].column] || "createdAt";
      sortQuery = { [sortField]: order[0].dir === "asc" ? 1 : -1 };
    }

    const startIndex = parseInt(start) || 0;
    const pageSize = parseInt(length) || 10;

    const users = await PeopleUser.find(baseQuery)
      .select("name surname email phone phone_suffix gender createdAt duty perm")
      .populate("duty", "name")
      .populate("perm", "name")
      .sort(sortQuery)
      .skip(startIndex)
      .limit(pageSize)
      .lean();

    // 🔹 permission.users array-ni götür
    let selectedUserIds = [];
    if (permissionId) {
      const permission = await RbacPeoplePermission.findById(permissionId).select("users");
      if (permission) {
        selectedUserIds = permission.users.map(u => u.toString());
      }
    }

    // 🔹 hər user üçün isChecked əlavə et
    const formattedData = users.map((user) => ({
      DT_RowId: user._id,
      id: user._id,
      name: user.name || "",
      surname: user.surname || "",
      email: user.email || "",
      phone: user.phone || "",
      phone_suffix: user.phone_suffix || "",
      gender: user.gender || "",
      duty_name: user.duty?.name || "Təyin olunmayıb",
      permission_name: user.perm?.name || "Təyin olunmayıb",
      createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString("az-AZ") : "",
      isChecked: selectedUserIds.includes(user._id.toString()),
    }));

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
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const addUser = async (req, res) => {
  try {
    const { fullName, gender, email, phoneNumber, phone_suffix, dutyId, authId } = req.body;
    const isDev = process.env.NODE_ENV === "development";

    const nameParts = fullName.split(" ");
    const name = nameParts[0];
    const surname = nameParts.slice(1).join(" ");

    const randomPassword = generateRandomPassword();

    const userId = req.user?.id;
    if (!userId) {
      return res.json({
        success: false,
        message: "User id not found",
      });
    }

    const creator = await PeopleUser.findById(userId);
    if (!creator) {
      return res.json({
        success: false,
        message: "Creator user not found",
      });
    }

    let cleanedPhoneNumber = phoneNumber.trim();
    if (cleanedPhoneNumber.startsWith('0')) {
      cleanedPhoneNumber = cleanedPhoneNumber.replace(/^0+/, '');
    }

    let cleanedPhoneSuffix = phone_suffix.trim();
    if (cleanedPhoneSuffix.startsWith('0')) {
      cleanedPhoneSuffix = cleanedPhoneSuffix.replace(/^0+/, '');
    }

    const tempUserData = {
      user_id: userId,
      name,
      email,
      phone_number: cleanedPhoneNumber,
      phone_suffix: cleanedPhoneSuffix,
      password: randomPassword,
      gender,
      duty: dutyId || null,
      perm: authId || null,
      otp_type: "email",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };

    const existingUser = await PeopleUser.findOne({
      $or: [
        { email },
        { $and: [{ phone_number: phoneNumber }, { phone_suffix }] }
      ]
    });

    if (existingUser) {
      return res.json({
        success: false,
        error: "Bu email və ya telefon artıq sistemdə mövcuddur."
      });
    }

    const createdTempUser =
    await TempAddedPeopleProfileChanges.create(tempUserData);

    // OTP generasiya və email göndərmə
    const otp = generateOtp();
    if (isDev) console.log(`🔐 OTP for ${email}: ${otp}`);

    const emailSent = await sendMail(
      creator.email,
      `Sizin OTP kodunuz: ${otp}`,
      isDev
    );

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        error: "OTP email göndərilə bilmədi",
      });
    }

    // OTP-ni DB-də saxlamaq
    await TempAddedPeopleProfileChanges.findByIdAndUpdate(createdTempUser._id, {
      otp,
    });

    return res.status(200).json({
      success: true,
      message: "Temp user yaradıldı və OTP email göndərildi",
      tempDeleteId: createdTempUser._id,
      user_email: creator.email,
      sirket_id: creator.sirket_id,
      url: '/muessise-info/accept-add-user',
      otpRequired: true
    });
  } catch (error) {
    console.error("Error in addUser:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const acceptAddedUser = async (req, res) => {
  try {
    const { tempDeleteId, otp1,otp2,otp3,otp4,otp5,otp6 } = req.body;
    const otp = `${otp1}${otp2}${otp3}${otp4}${otp5}${otp6}`
        .trim();
    const id = tempDeleteId;
    const isDev = process.env.NODE_ENV === "development";
    if (!id || !otp) {
      return res.json({
        success: false,
        message: "OTP və ya ID daxil edilməyib",
      });
    }
    const myUser = await PeopleUser.findById(req.user.id);
    
    const tempUser = await TempAddedPeopleProfileChanges.findById(id);

    if (!tempUser) {
      return res.json({
        success: false,
        message: "OTP üçün müvəqqəti istifadəçi tapılmadı",
      });
    }

    if (tempUser.otp !== otp) {
      return res.json({
        success: false,
        message: "OTP yanlışdır " +tempUser.otp+ "!=="+ otp,
      });
    }

    const fullPhone = `${tempUser.phone_suffix || ""}${
      tempUser.phone_number || ""
    }`;
    const hashedPassword = await argon2.hash(tempUser.password);
    const newUser = await PeopleUser.create({
      name: tempUser.name,
      surname: tempUser.surname,
      email: tempUser.email,
      password: hashedPassword,
      phone: tempUser.phone_number,
      phone_suffix: tempUser.phone_suffix,
      gender: tempUser.gender,
      sirket_id: myUser.sirket_id,
      perm: tempUser.perm,
      duty: tempUser.duty,
      created_by: myUser._id, // schema-da yoxdursa əlavə etməyək
    });
    let html = `
        <p>Salam, ${tempUser.name}.</p>
        <p>Hesabınız uğurla yaradıldı.</p>
        <p><strong>Login email:</strong> ${tempUser.email}</p>
        <p><strong>Şifrə:</strong> ${tempUser.password}</p>
        <p><strong>Panel:</strong> <a href="https://company.avankart.com">company.avankart.com</a></p>
      `;
    await sendMail(tempUser.email, html, isDev, 'Avankarta xoş gəlmisiniz.');

    await TempAddedPeopleProfileChanges.findByIdAndDelete(id);

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

export const editUser = async (req, res) => {
  try {
    const {
      user_id,
      fullName,
      gender,
      email,
      phoneNumber,
      phonePrefix,
      dutyId,
      authId
    } = req.body;
    const phone_suffix = phonePrefix;
    if (!user_id) {
      return res.status(400).json({ success: false, message: "User id tələb olunur" });
    }
    const isDev = process.env.NODE_ENV === "development";
    const targetUser = await PeopleUser.findById(user_id);
    const myUser = await PeopleUser.findById(req.user.id);
    if (!targetUser || !myUser) {
      return res.status(404).json({ success: false, message: "Target user tapılmadı" });
    }

    // Email başqa user-də varmı yoxla
    if (email) {
      const existingUser = await PeopleUser.findOne({ _id: { $ne: user_id }, email });
      if (existingUser) {
        return res.json({ success: false, error: "Bu email artıq başqa istifadəçidə mövcuddur." });
      }
    }

    // Telefon və suffix başındakı 0-ları silək
    let cleanedPhoneNumber = phoneNumber?.trim() || targetUser.phone_number;
    let cleanedPhoneSuffix = phone_suffix?.trim() || targetUser.phone_suffix;

    if (cleanedPhoneNumber.startsWith('0')) cleanedPhoneNumber = cleanedPhoneNumber.replace(/^0+/, '');
    if (cleanedPhoneSuffix.startsWith('0')) cleanedPhoneSuffix = cleanedPhoneSuffix.replace(/^0+/, '');

    // Full name-i name/surname-ə ayır
    let name = targetUser.name;
    let surname = targetUser.surname || "";
    if (fullName) {
      const parts = fullName.trim().split(/\s+/); // 1'den fazla boşluğu tek boşluk gibi değerlendirir
      name = parts[0];
      surname = parts.slice(1).join(" ");
    }

    // Temp record yarat
    const tempEditData = {
      user_id,
      name,
      surname,
      gender: gender || targetUser.gender,
      email: email || targetUser.email,
      phone_number: cleanedPhoneNumber,
      phone_suffix: cleanedPhoneSuffix,
      duty: dutyId || targetUser.duty,
      perm: authId || targetUser.perm,
      otp_type: "email",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };

    const tempEditRecord = await TempPeopleProfileChanges.create(tempEditData);

    // OTP generasiya və email göndərmə
    const otp = generateOtp();
    const emailSent = await sendMail(myUser.email, otp, isDev);

    if (!emailSent) {
      return res.status(500).json({ success: false, error: "OTP email göndərilə bilmədi" });
    }

    // OTP-ni DB-də saxla
    await TempPeopleProfileChanges.findByIdAndUpdate(tempEditRecord._id, { otp });

    return res.status(200).json({
      success: true,
      message: "User edit request saved. OTP email vasitəsilə göndərildi",
      tempRecordId: tempEditRecord._id,
      url: '/muessise-info/accept-edit-user',
      otpRequired: true,
      tempDeleteId: tempEditRecord._id,
      user_email: myUser.email,
    });

  } catch (error) {
    console.error("Error in editUser:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

export const acceptEditUser = async (req, res) => {
  try {
    const { tempDeleteId, otp1, otp2, otp3, otp4, otp5, otp6 } = req.body;
    const otp = `${otp1}${otp2}${otp3}${otp4}${otp5}${otp6}`.trim();

    // OTP doğrulama gerekiyorsa burada ekle
    // if (!verifyOtp(otp)) return res.json({ success: false, error: "OTP yanlışdır" });

    const editlenecekData = await TempPeopleProfileChanges.findById(tempDeleteId);
    if (!editlenecekData)
      return res.json({ success: false, message: "Error finding user data" });
    if(editlenecekData.otp !== otp) return res.json({ success: false, message: "Otp yanlışdır." });
    const editlenecekUser = await PeopleUser.findById(editlenecekData.user_id);
    if (!editlenecekUser)
      return res.json({ success: false, error: "Error finding user" });

    // Tüm değişiklikleri uygula
    const fields = ['name', 'surname', 'gender', 'duty', 'perm', 'email', 'phone_number', 'phone_suffix'];
    fields.forEach(field => {
      if (editlenecekData[field] !== undefined) {
        // phone_number ve phone_suffix isimleri model ile uyumlu olmalı
        if (field === 'phone_number') editlenecekUser.phone = editlenecekData.phone_number;
        else if (field === 'phone_suffix') editlenecekUser.phone_suffix = editlenecekData.phone_suffix;
        else editlenecekUser[field] = editlenecekData[field];
      }
    });

    await editlenecekUser.save();

    return res.status(200).json({
      success: true,
      message: "Dəyişikliklər yadda saxlanıldı.",
      redirect: "/muessise-info"
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

export const deleteUser = async (req, res) => {
  const { id, ids } = req.body;

  console.log("DELETE USER REQUEST:", id, ids);

  // Validate that only one parameter is provided
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
    const myUser = await PeopleUser.findById(req.user.id);
    if (id) {
      const user = await PeopleUser.findById(id).select("sirket_id");
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Check if the user belongs to the same sirket_id
      if (
        myUser.sirket_id &&
        String(user.sirket_id) !== String(myUser.sirket_id)
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

      const foundUsers = await PeopleUser.find({
        _id: { $in: ids },
      }).select("sirket_id");

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

      // Check if all users belong to the same sirket_id
      const sirketId = myUser.sirket_id;
      for (const user of foundUsers) {
        if (String(user.sirket_id) !== String(sirketId)) {
          return res.status(403).json({
            success: false,
            message: "You can only delete users from your own organization",
          });
        }
      }

      userIds = [...ids];
      users = [...foundUsers];
    }

    // Create temporary deletion record
    const deletedUser = await TempPeopleUserDelete.create({
      sender_id: req.user.id,
      users: userIds,
    });

    // Generate and send OTP
    const generatedOtp = generateOtp();
    console.log(
      `🔐 [OTP Generated] User: ${myUser.email}, OTP: ${generatedOtp}`
    );

    const otpCode = await OtpModel.create({
      user_id: req.user.id,
      email: myUser.email,
      otp: generatedOtp,
      expire_time: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes expiry
      otp_to: "sirket",
    });

    const debug = process.env.NODE_ENV !== "production";

    await sendMail(myUser.email, otpCode.otp, debug);

    // Update deletion record with OTP info
    deletedUser.otp_code = otpCode.otp;
    deletedUser.otp_send_time = new Date();
    await deletedUser.save();

    return res.status(200).json({
      success: true,
      otpRequired: true,
      tempId: userIds,
      tempDeleteId: deletedUser._id,
      user_email: myUser.email,
      resendUrl: "/resend-otp",
      url: "/muessise-info/accept-delete-user",
    });
  } catch (err) {
    console.error("Error in deleteUser:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error occurred while processing deletion",
      error: err.message,
    });
  }
};

export const acceptDeleteUser = async (req, res) => {
  try {
    const { otp1, otp2, otp3, otp4, otp5, otp6, tempId } = req.body;
    const userId = req.user?.id || req.user?._id;
    const user = await PeopleUser.findById(userId);

    // OTP məlumatlarının mövcudluğunu yoxla
    if (!otp1 && !otp2 && !otp3 && !otp4 && !otp5 && !otp6) {
      console.log("❌ [acceptDeleteUser] No OTP provided");
      return res.status(400).json({
        success: false,
        message:
          "OTP kodu daxil edilməyib. Zəhmət olmasa 6 rəqəmli kodu daxil edin.",
      });
    }

    const otpArray = [otp1, otp2, otp3, otp4, otp5, otp6];

    // Hər bir OTP rəqəmini yoxla
    for (let i = 0; i < otpArray.length; i++) {
      if (!otpArray[i]) {
        return res.status(400).json({
          success: false,
          message: `${i + 1}-ci rəqəm boşdur. Zəhmət olmasa bütün 6 rəqəmi daxil edin.`,
        });
      }

      if (typeof otpArray[i] !== "string") {
        return res.status(400).json({
          success: false,
          message: `${i + 1}-ci rəqəmin formatı səhvdir. Yalnız rəqəm daxil edin.`,
        });
      }

      // Boşluqları sil və yalnız rəqəmləri saxla
      otpArray[i] = otpArray[i].trim().replace(/[^0-9]/g, "");

      if (otpArray[i].length !== 1) {
        return res.status(400).json({
          success: false,
          message: `${i + 1}-ci rəqəm düzgün deyil. Hər bir xana üçün yalnız bir rəqəm daxil edin.`,
        });
      }

      // Rəqəmin 0-9 arasında olduğunu yoxla
      const digit = parseInt(otpArray[i]);
      if (isNaN(digit) || digit < 0 || digit > 9) {
        return res.status(400).json({
          success: false,
          message: `${i + 1}-ci rəqəm səhvdir. Yalnız 0-9 arası rəqəm daxil edin.`,
        });
      }
    }

    const otp = otpArray.join("");

    // Final OTP uzunluq yoxlaması
    if (otp.length !== 6) {
      console.log("❌ [acceptDeleteUser] Invalid OTP length:", otp.length);
      return res.status(400).json({
        success: false,
        message:
          "OTP kodu 6 rəqəmli olmalıdır. Zəhmət olmasa bütün xanaları doldurun.",
      });
    }

    // OTP-nin yalnız rəqəmlərdən ibarət olduğunu yoxla
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "OTP kodu yalnız rəqəmlərdən ibarət olmalıdır.",
      });
    }

    // İlk öncə tempId ilə, sonra sender_id ilə axtaraq
    let latestRequest = null;

    if (tempId) {
      latestRequest = await TempPeopleUserDelete.findById(tempId);
      console.log(
        "🔍 [acceptDeleteUser] Request found by tempId:",
        latestRequest ? "YES" : "NO"
      );
    }

    if (!latestRequest) {
      latestRequest = await TempPeopleUserDelete.findOne({
        sender_id: userId,
      }).sort({ createdAt: -1 });
      console.log(
        "🔍 [acceptDeleteUser] Request found by sender_id:",
        latestRequest ? "YES" : "NO"
      );
    }

    console.log(
      "🔍 [acceptDeleteUser] Latest deletion request:",
      latestRequest
    );

    if (!latestRequest) {
      console.log("❌ [acceptDeleteUser] No deletion request found");
      return res.status(404).json({
        success: false,
        message:
          "Silinəcək istifadəçi tələbi tapılmadı. Zəhmət olmasa yenidən cəhd edin.",
      });
    }

    // OTP kodunun vaxtının keçib-keçmədiyini yoxla
    if (latestRequest.otp_send_time) {
      const now = new Date();
      const otpSendTime = new Date(latestRequest.otp_send_time);
      const timeDifference = (now - otpSendTime) / (1000 * 60); // dəqiqə ilə

      if (timeDifference > 15) {
        await TempPeopleUserDelete.findByIdAndDelete(latestRequest._id);
        return res.status(400).json({
          success: false,
          message:
            "OTP kodunun vaxtı keçib. Zəhmət olmasa yenidən silmə əməliyyatını başladın.",
        });
      }
    }

    if (latestRequest.otp_code !== otp) {
      return res.status(400).json({
        success: false,
        message:
          "OTP kodu düzgün deyil. Zəhmət olmasa email-də aldığınız kodu daxil edin.",
      });
    }

    if (!latestRequest.users || latestRequest.users.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Silinəcək istifadəçi məlumatları tapılmadı. Zəhmət olmasa yenidən cəhd edin.",
      });
    }

    let deletedUsers = [];
    let errorMessages = [];

    if (Array.isArray(latestRequest.users)) {
      for (const userIdToDelete of latestRequest.users) {
        // Daha güvənli müqayisə - hem string hem də ObjectId formatında
        const userIdDeleteStr = String(userIdToDelete);
        const currentUserIdStr = String(userId);

        if (userIdDeleteStr === currentUserIdStr) {
          errorMessages.push("Özünüzü silə bilməzsiniz");
          continue;
        }

        try {
          const userToDelete = await PeopleUser.findById(userIdToDelete);
          if (userToDelete) {
            // İşçini OldSirketUsers-ə əlavə et
            await OldSirketUsers.create({
              user_id: userToDelete._id,
              user_sirket_id: req.user.id, // Silən istifadəçinin ID-si
              sirket_id: userToDelete.sirket_id, // İşçinin şirkət ID-si
              hire_date: userToDelete.createdAt, // İşə başlama tarixi
              dismissal_date: new Date(), // İşdən çıxma tarixi
            });

            // İşçinin sirket_id-sini null et
            userToDelete.sirket_id = null;
            await userToDelete.save();

            deletedUsers.push(userToDelete.name || userToDelete.email);
          } else {
            errorMessages.push("İstifadəçi tapılmadı");
          }
        } catch (error) {
          console.error("Error deleting user:", userIdToDelete, error);
          errorMessages.push(`İstifadəçi silmə xətası: ${userIdToDelete}`);
        }
      }
    } else {
      const userIdToDelete = latestRequest.users;

      // Daha güvənli müqayisə - hem string hem də ObjectId formatında
      const userIdDeleteStr = String(userIdToDelete);
      const currentUserIdStr = String(userId);

      if (userIdDeleteStr === currentUserIdStr) {
        return res.status(400).json({
          success: false,
          message: "Özünüzü silə bilməzsiniz. Bu əməliyyat qadağandır.",
        });
      }

      try {
        const userToDelete = await PeopleUser.findById(userIdToDelete);
        if (userToDelete) {
          // İşçini OldSirketUsers-ə əlavə et
          await OldSirketUsers.create({
            user_id: userToDelete._id,
            user_sirket_id: req.user.id, // Silən istifadəçinin ID-si
            sirket_id: userToDelete.sirket_id, // İşçinin şirkət ID-si
            hire_date: userToDelete.createdAt, // İşə başlama tarixi
            dismissal_date: new Date(), // İşdən çıxma tarixi
          });

          // İşçinin sirket_id-sini null et
          userToDelete.sirket_id = null;
          userToDelete.perm = null;
          userToDelete.duty = null;
          await userToDelete.save();

          deletedUsers.push(userToDelete.name || userToDelete.email);
        } else {
          errorMessages.push("İstifadəçi tapılmadı");
        }
      } catch (error) {
        console.error("Error deleting single user:", userIdToDelete, error);
        errorMessages.push(`İstifadəçi silmə xətası: ${userIdToDelete}`);
      }
    }

    await TempPeopleUserDelete.findByIdAndDelete(latestRequest._id);

    let responseMessage = "";
    let success = false;

    if (deletedUsers.length > 0) {
      success = true;
      if (deletedUsers.length === 1) {
        responseMessage = `${deletedUsers[0]} adlı istifadəçi uğurla silindi`;
      } else {
        responseMessage = `${deletedUsers.length} istifadəçi uğurla silindi`;
      }

      if (errorMessages.length > 0) {
        responseMessage += `, lakin ${errorMessages.length} xəta baş verdi`;
      }
    } else {
      if (errorMessages.length > 0) {
        responseMessage = `Heç bir istifadəçi silinmədi. Xətalar: ${errorMessages.join(", ")}`;
      } else {
        responseMessage = "Heç bir istifadəçi silinmədi";
      }
    }

    return res.status(success ? 200 : 400).json({
      success: success,
      message: responseMessage,
      deletedUsers: deletedUsers,
      errors: errorMessages,
    });
  } catch (error) {
    console.error("[acceptDeleteUser]", error);
    return res.status(500).json({
      success: false,
      message:
        "Server xətası baş verdi. Zəhmət olmasa bir az sonra yenidən cəhd edin.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
