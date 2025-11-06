import { generateOtp, sendMail } from "../../../shared/utils/otpHandler.js";
import OtpModel from "../../../shared/models/otp.js";
import TempPartnerDutyDelete from "../../../shared/model/partner/tempPartnerDutyDelete.js";
import TempPartnerPermDelete from "../../../shared/model/partner/tempPartnerPermDelete.js";
import TempPeopleDutyDelete from "../../../shared/model/people/tempPeopleDutyDelete.js";
import TempPeoplePermDelete from "../../../shared/model/people/tempPeoplePermDelete.js";
import RbacPermission from "../../../shared/models/rbacPermission.model.js";
import RbacPeoplePermission from "../../../shared/models/rbacPeopleModel.js";
import SirketDuty from "../../../shared/models/Sirketduties.js";
// import User from "../../models/userModel.js";
import PeopleUser from "../../../shared/models/peopleUserModel.js";

export const rbacDeleteDuty = async (req, res) => {
  try {
    let { id, ids } = req.body;
    const senderId = req.user.id;

    if (typeof ids === "string") {
      try {
        ids = JSON.parse(ids);
      } catch {
        ids = ids
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    const currentUser = await PeopleUser.findById(senderId).select(
      "sirket_id email phone phone_suffix"
    );
    const sirketId = currentUser?.sirket_id;
    if (!sirketId) {
      return res
        .status(401)
        .json({ success: false, message: "Company (sirket_id) not found" });
    }

    const dutyIds = [];
    if (id) dutyIds.push(id);
    if (Array.isArray(ids)) dutyIds.push(...ids);

    if (dutyIds.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No ID(s) provided" });
    }

    // Searching for duties (şirkət filteri ilə)
    const duties = await SirketDuty.find({
      _id: { $in: dutyIds },
      sirket_id: sirketId,
    });

    if (!duties.length) {
      return res
        .status(404)
        .json({ success: false, message: "No matching duties found" });
    }

    const otp = generateOtp(6);
    const expire_time = new Date(Date.now() + 5 * 60 * 1000 + 10000);
    const debug = process.env.NODE_ENV !== "production";

    await OtpModel.create({
      user_id: senderId,
      email: currentUser.email,
      phone_suffix: currentUser.phone_suffix,
      phone_number: currentUser.phone,
      otp,
      expire_time,
      otp_to: "sirket",
    });
    await sendMail(currentUser.email, otp, debug);

    const tempDelete = await TempPeopleDutyDelete.create({
      sender_id: senderId,
      duties: duties.map((d) => d._id),
      otp_code: otp,
    });

    return res.json({
      success: true,
      message: "Otp göndərildi",
      otpRequired: true,
      email: currentUser.email,
      tempDeleteId: tempDelete._id,
      acceptUrl: "/rbac/rbacAccept/delete",
      resendUrl: "/resend-otp",
    });
  } catch (err) {
    console.error("Error in rbacDeleteDuty:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const rbacDeletePerm = async (req, res) => {
  try {
    const { id, ids } = req.body;

    let dutyIds = [];
    if (id) dutyIds.push(id);
    if (Array.isArray(ids)) dutyIds.push(...ids);

    const { id: userId } = req.user;

    const currentUser = await PeopleUser.findById(userId).select("sirket_id");
    const sirketId = currentUser?.sirket_id;

    if (!userId || !sirketId) {
      console.log("User authentication failed!");
      return res.status(401).json({
        message: "User id or company id not found",
        success: false,
      });
    }

    const permissionModel = await RbacPeoplePermission.find({
      _id: { $in: dutyIds },
      sirket_id: sirketId,
    });

    if (!permissionModel.length)
      return res.status(404).json({
        message: "Permission not found",
        success: false,
      });

    const hasDefault = permissionModel.some((e) => e.default === true);
    if (hasDefault)
      return res.status(404).json({
        message: "Delete not possible",
        success: false,
        redirect: "/muessise-info", // yönlendirme path'ini frontend beklentine göre istersen /sirket-info yap
      });

    const otp = generateOtp(6);
    const expire_time = new Date(Date.now() + 5 * 60 * 1000 + 10000);

    const user = await PeopleUser.findById(userId);
    if (!user)
      return res.status(400).json({
        message: "User not found",
        success: false,
      });

    await OtpModel.create({
      email: user.email,
      user_id: userId,
      phone_number: user.phone,
      phone_suffix: user.phone_suffix,
      otp,
      expire_time,
      otp_to: "sirket",
    });

    const debug = process.env.NODE_ENV !== "production";
    await sendMail(user.email, otp, debug);

    const tempPartnerDelete = await TempPeoplePermDelete.create({
      sender_id: userId,
      permissions: dutyIds,
      otp_code: otp,
    });
    await tempPartnerDelete.save();

    return res.status(200).json({
      message: "Rbac permission created",
      success: true,
      otpRequired: true,
      tempDeleteId: tempPartnerDelete._id,
      userEmail: user.email,
      email: user.email,
      acceptUrl: "",
      resendUrl: "/resend-otp",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const acceptDeleteDuty = async (req, res) => {
  try {
    const { otp1, otp2, otp3, otp4, otp5, otp6, tempDeleteId } = req.body;
    const userId = req.user.id;
    const otp =
      otp1.trim() +
      otp2.trim() +
      otp3.trim() +
      otp4.trim() +
      otp5.trim() +
      otp6.trim();
    if (!userId)
      return res
        .status(401)
        .json({ message: "User not found", success: false });

    const otpModelCheck = await OtpModel.findOne({
      user_id: userId,
      otp,
      otp_to: "sirket",
    });
    if (!otpModelCheck)
      return res.status(401).json({ message: "Otp is wrong", success: false });
    if (otpModelCheck.expire_time < Date.now())
      return res
        .status(401)
        .json({ message: "Otp time is over", success: false });

    const tempDelete = await TempPeopleDutyDelete.findById(tempDeleteId);
    if (!tempDelete)
      return res
        .status(400)
        .json({ message: "TempDelete not found", success: false });
    if (String(tempDelete.sender_id) !== String(userId))
      return res
        .status(401)
        .json({ message: "Permission denied", success: false });

    const dutiesIds = tempDelete.duties;

    await SirketDuty.deleteMany({ _id: { $in: dutiesIds } });

    await PeopleUser.updateMany(
      { duty: { $in: dutiesIds } },
      { $unset: { duty: 1 } }
    );

    await OtpModel.deleteOne({ user_id: userId, otp, otp_to: "sirket" });
    await TempPeopleDutyDelete.deleteOne({ _id: tempDeleteId });

    return res.status(200).json({
      message: "Duties deleted successfully",
      success: true,
      redirect: "/sirket-info",
    });
  } catch (error) {
    console.error("error message", error);
    return res
      .status(500)
      .json({ error: "Internal server error", success: false });
  }
};

export const acceptPermissionDelete = async (req, res) => {
  try {
    const { tempDeleteId, otpCode } = req.body;

    console.log("Accept permission delete:", { tempDeleteId, otpCode });

    // Temp delete record tap
    const tempDelete = await TempPeoplePermDelete.findById(tempDeleteId);
    console.log("Found temp delete record:", tempDelete);

    if (!tempDelete) {
      console.log("Temp delete record not found!");
      return res.status(400).json({
        message: "Silmə tələbi tapılmadı və ya müddəti bitib",
        success: false,
      });
    }

    // OTP yoxlanışı
    const otpCheck = await OtpModel.findOne({
      user_id: tempDelete.sender_id,
      otp: otpCode,
      otp_to: "sirket",
    });

    if (!otpCheck) {
      return res.status(400).json({
        message: "OTP kodu yanlışdır",
        success: false,
      });
    }
    if (otpCheck.expire_time < Date.now()) {
      return res.status(400).json({
        message: "Otp time is over",
        success: false,
      });
    }

    console.log("Will delete permissions with IDs:", tempDelete.permissions);

    // Permission-ları sil
    const deleteResult = await RbacPeoplePermission.deleteMany({
      _id: { $in: tempDelete.permissions },
      // sirket_id filteri eklemek istersen burada ekleyebilirsin
    });
    console.log("Permission delete result:", deleteResult);

    // Bu permission-lara sahib user-lərin permission-larını null et
    const userUpdateResult = await PeopleUser.updateMany(
      { perm: { $in: tempDelete.permissions } },
      { $unset: { perm: 1 } }
    );
    console.log("User permission update result:", userUpdateResult);

    // Temp record-u sil
    const tempDeleteResult =
      await TempPeoplePermDelete.findByIdAndDelete(tempDeleteId);
    console.log("Temp delete cleanup result:", tempDeleteResult);

    // ilgili OTP kaydını da temizle
    await OtpModel.deleteOne({
      user_id: tempDelete.sender_id,
      otp: otpCode,
      otp_to: "sirket",
    });

    console.log("✅ Permission silmə tamamlandı");

    return res.status(200).json({
      message: "Permission uğurla silindi",
      success: true,
      redirect: "/muessise-info", // gerekirse /sirket-info
    });
  } catch (error) {
    console.error("Accept permission delete error:", error);
    return res.status(500).json({
      message: "Server xətası",
      success: false,
    });
  }
};

export const acceptDeletePerm = async (req, res) => {
  try {
    const { otp, tempDeleteId } = req.body;

    const userId = req.user.id;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    const otpModelCheck = await OtpModel.findOne({
      user_id: userId,
      otp,
      otp_to: "sirket",
    });

    if (!otpModelCheck) {
      return res.status(401).json({ success: false, message: "Otp is wrong" });
    }

    if (otpModelCheck.expire_time < Date.now()) {
      return res
        .status(401)
        .json({ success: false, message: "Otp time is over" });
    }

    const tempDelete = await TempPeoplePermDelete.findById(tempDeleteId);
    if (!tempDelete) {
      return res
        .status(400)
        .json({ success: false, message: "Temp delete data not found" });
    }

    if (String(tempDelete.sender_id) !== String(userId)) {
      return res
        .status(401)
        .json({ success: false, message: "Permission denied" });
    }

    const permissionIds = tempDelete.permissions;
    await RbacPeoplePermission.deleteMany({ _id: { $in: permissionIds } });

    await OtpModel.deleteOne({ user_id: userId, otp, otp_to: "sirket" });
    await TempPeoplePermDelete.deleteOne({ _id: tempDeleteId });

    return res.status(200).json({
      message: "Permissions deleted successfully",
      success: true,
      redirect: "/muessise-info", // gerekirse /sirket-info
    });
  } catch (error) {
    console.error("acceptDeletePerm error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
