import Duties from "../../../shared/models/duties.js";
import TempPartnerDutyDelete from "../../../shared/model/partner/tempPartnerDutyDelete.js";
import { generateOtp, sendMail } from "../../../shared/utils/otpHandler.js";
import PartnerUser from "../../../shared/models/partnyorUserModel.js";
import OtpModel from "../../../shared/models/otp.js";
import TempPartnerPermDelete from "../../../shared/model/partner/tempPartnerPermDelete.js";
import RbacPermission from "../../../shared/models/rbacPermission.model.js";
import User from "../../models/userModel.js";

export const rbacDeleteDuty = async (req, res) => {
  try {
    let { id, ids } = req.body;
    const senderId = req.user.id;

    console.log("Raw request body:", req.body);

    // Parse ids if it's a JSON string
    if (typeof ids === "string") {
      try {
        ids = JSON.parse(ids);
      } catch (e) {
        console.log("Failed to parse ids JSON:", e);
      }
    }

    const currentUser = await PartnerUser.findById(senderId).select(
      "muessise_id"
    );
    const muessiseId = currentUser.muessise_id;

    // Getting IDs
    const dutyIds = [];
    if (id) dutyIds.push(id);
    if (Array.isArray(ids)) dutyIds.push(...ids);

    console.log("Final dutyIds:", dutyIds);

    if (dutyIds.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No ID(s) provided" });
    }

    // Searching for duties
    const duties = await Duties.find({
      _id: { $in: dutyIds },
      muessise_id: muessiseId,
    });

    console.log();

    if (!duties.length) {
      return res
        .status(404)
        .json({ success: false, message: "No matching duties found" });
    }

    // Generating OTP
    const otp = generateOtp(6);
    const expire_time = new Date(Date.now() + 5 * 60 * 1000 + 10000); // 5 dk + 10 sn
    const debug = process.env.NODE_ENV !== "production";

    const user = await PartnerUser.findById(senderId);
    if (!user || !user.email) {
      return res
        .status(400)
        .json({ success: false, message: "User email not found" });
    }
    await OtpModel.create({
      user_id: senderId,
      email: user.email,
      phone_suffix: user.phone_suffix,
      phone_number: user.phone,
      otp,
      expire_time,
    });
    await sendMail(user.email, otp, debug);

    // Saving to DB
    const tempDelete = new TempPartnerDutyDelete({
      sender_id: senderId,
      duties: duties.map((d) => d._id),
      otp_code: otp,
    });

    await tempDelete.save();

    return res.json({
      success: true,
      otpRequired: true,
      email: user.email,
      tempDeleteId: tempDelete._id,
    });
  } catch (err) {
    console.error("Error in rbacDeleteDuty:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// export const rbacDeletePerm = async (req, res) => {
//   try {
//     const { id, ids } = req.body;

//     let dutyIds = [];
//     if (id) dutyIds.push(id);
//     if (Array.isArray(ids)) dutyIds.push(...ids);

//     const { id: userId } = req.user;

//     const currentUser = await PartnerUser.findById(userId).select(
//       "muessise_id"
//     );

//     const muessiseId = currentUser.muessise_id;

//     if (!userId || !muessiseId) {
//       console.log("User authentication failed!");
//       return res.status(401).json({
//         message: "User id or Duty id not found",
//         success: false,
//       });
//     }

//     const permissionModel = await RbacPermission.find({
//       _id: {
//         $in: dutyIds,
//       },
//       muessise_id: muessiseId,
//     });

//     if (!permissionModel.length)
//       return res.status(404).json({
//         message: "Permission not found",
//         success: false,
//       });
//     const hasDefault = permissionModel.some((e) => e.default === true);

//     if (hasDefault)
//       return res.status(404).json({
//         message: "Delete not possible",
//         success: false,
//         redirect: "/muessise-info",
//       });

//     const otp = generateOtp(6);
//     const expire_time = new Date(Date.now() + 5 * 60 * 1000 + 10000);
//     const user = await PartnerUser.findById(userId);
//     if (!user)
//       return res.status(400).json({
//         message: "User not found",
//         success: false,
//       });

//     const otpCreate = await OtpModel.create({
//       email: user.email,
//       user_id: userId,
//       phone_number: user.phone_number,
//       phone_suffix: user.phone_suffix,
//       otp,
//       expire_time,
//     });

//     const debug = process.env.NODE_ENV !== "production";

//     await sendMail(user.email, otp, debug);
//     const tempPartnerDelete = await TempPartnerPermDelete.create({
//       sender_id: userId,
//       permissions: dutyIds,
//       otp_code: otp,
//     });
//     await tempPartnerDelete.save();

//     return res.status(200).json({
//       message: "Rbac permission created",
//       success: true,
//       otpRequired: true,
//       tempDeleteId: tempPartnerDelete._id,
//       userEmail: user.email,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       message: "Internal server error",
//       success: false,
//     });
//   }
// };

export const rbacDeletePerm = async (req, res) => {
  try {
    const { id, ids } = req.body;

    // 1) ID'leri topla (tekli + çoklu + farklı formatlar)
    let dutyIds = [];

    // çoklu: ids array / JSON-string / "a,b,c"
    if (ids !== undefined) {
      if (Array.isArray(ids)) {
        dutyIds.push(...ids);
      } else if (typeof ids === "string") {
        // x-www-form-urlencoded ile JSON.stringify([...]) gelebilir
        try {
          const parsed = JSON.parse(ids);
          if (Array.isArray(parsed)) {
            dutyIds.push(...parsed);
          } else {
            // "1,2,3" gibi ayrılmışsa
            dutyIds.push(
              ...ids
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            );
          }
        } catch {
          // JSON parse edilemediyse "1,2,3" gibi düşün
          dutyIds.push(
            ...ids
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          );
        }
      }
    }

    // tekli: id veya permissionId
    if (id) dutyIds.push(id);
    if (req.body.permissionId) dutyIds.push(req.body.permissionId);

    // normalize + uniq + string'e çevir
    dutyIds = [...new Set(dutyIds.map(String))];

    if (dutyIds.length === 0) {
      return res.status(400).json({
        message: "Silinəcək permission ID(ləri) göndərin.",
        success: false,
      });
    }

    // 2) Kullanıcı / müəssisə doğrulama
    const { id: userId } = req.user || {};
    const currentUser = await PartnerUser.findById(userId).select(
      "muessise_id email phone_number phone_suffix"
    );

    const muessiseId = currentUser?.muessise_id;
    if (!userId || !muessiseId) {
      return res.status(401).json({
        message: "User id or Muessise id not found",
        success: false,
      });
    }

    // 3) Bu müəssisəyə ait olan permission kayıtlarını çek
    const permissionModel = await RbacPermission.find({
      _id: { $in: dutyIds },
      muessise_id: muessiseId,
    }).select("_id default");

    if (!permissionModel.length) {
      return res.status(404).json({
        message: "Permission not found",
        success: false,
      });
    }

    // İstekle gelen ama bulunamayan / yetkisiz id'ler
    const foundIds = permissionModel.map((p) => String(p._id));
    const skippedIds = dutyIds.filter((x) => !foundIds.includes(String(x)));

    // Default olan varsa silme sürecini başlatma (senin mevcut davranışını koruyorum)
    const hasDefault = permissionModel.some((e) => e.default === true);
    if (hasDefault) {
      return res.status(404).json({
        message: "Delete not possible",
        success: false,
        redirect: "/muessise-info",
      });
    }

    // 4) OTP üret + e-posta gönder + geçici silme kaydı oluştur
    const otp = generateOtp(6);
    const expire_time = new Date(Date.now() + 5 * 60 * 1000 + 10000); // 5dk + 10sn
    const debug = process.env.NODE_ENV !== "production";

    // OTP kaydı
    await OtpModel.create({
      email: currentUser.email,
      user_id: userId,
      phone_number: currentUser.phone_number,
      phone_suffix: currentUser.phone_suffix,
      otp,
      expire_time,
    });

    // Mail gönder
    await sendMail(currentUser.email, otp, debug);

    // Sadece gerçekten bulunup yetkili olunan ID'leri geçici kayda yaz
    const tempPartnerDelete = await TempPartnerPermDelete.create({
      sender_id: userId,
      permissions: foundIds,
      otp_code: otp,
    });
    await tempPartnerDelete.save();

    // 5) Response — mevcut alanları bozmadan ek bilgi döndürüyorum
    return res.status(200).json({
      message: "Rbac permission created",
      success: true,
      otpRequired: true,
      tempDeleteId: tempPartnerDelete._id,
      userEmail: currentUser.email,

      // ekstra bilgilendirme (UI'yi bozmaz, istersen kullan)
      selectedCount: foundIds.length,
      skippedIds, // bulunamayan/erişilemeyen ID'ler
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
    const otp = `${otp1 || ""}${otp2 || ""}${otp3 || ""}${otp4 || ""}${otp5 || ""}${otp6 || ""}`.trim();

    const userId = req.user.id;
    if (!userId)
      return res.status(401).json({
        message: "User not found",
        success: false,
      });

    const otpModelCheck = await OtpModel.findOne({
      user_id: userId,
      otp,
    });

    console.log("OTP model check:", otpModelCheck);

    if (!otpModelCheck)
      return res.status(401).json({
        message: "Otp is wrong",
        success: false,
      });

    if (otpModelCheck.expire_time < Date.now())
      return res.status(401).json({
        message: "Otp time is over",
        success: false,
      });

    const tempDelete = await TempPartnerDutyDelete.findById(tempDeleteId);
    if (!tempDelete)
      return res.status(400).json({
        message: "Templated not found",
        success: false,
      });

    if (String(tempDelete.sender_id) !== String(userId))
      return res.status(401).json({
        message: "Permission denied",
        success: false,
      });

    const dutiesIds = tempDelete.duties;
    await Duties.deleteMany({ _id: { $in: dutiesIds } });

    await OtpModel.deleteOne({
      user_id: userId,
      otp,
    });

    await TempPartnerDutyDelete.deleteOne({ _id: tempDeleteId });

    return res.status(200).json({
      message: "Duties deleted successfully",
      success: true,
      redirect: "/muessise-info",
    });
  } catch (error) {
    console.error("error message", error);
    return res.status(500).json({
      error: "Internal server error",
      success: false,
    });
  }
};

export const acceptPermissionDelete = async (req, res) => {
  try {
    const { tempDeleteId, otpCode } = req.body;

    console.log("Accept permission delete:", { tempDeleteId, otpCode });

    // Temp delete record tap
    const tempDelete = await TempPartnerPermDelete.findById(tempDeleteId);
    console.log("Found temp delete record:", tempDelete);

    if (!tempDelete) {
      console.log("Temp delete record not found!");
      return res.status(400).json({
        message: "Silmə tələbi tapılmadı və ya müddəti bitib",
        success: false,
      });
    }

    // OTP yoxlanışı
    console.log("OTP comparison:", {
      provided: otpCode,
      stored: tempDelete.otp_code,
      match: tempDelete.otp_code === otpCode,
    });

    if (tempDelete.otp_code !== otpCode) {
      console.log("OTP mismatch!");
      return res.status(400).json({
        message: "OTP kodu yanlışdır",
        success: false,
      });
    }

    console.log("Will delete permissions with IDs:", tempDelete.duties);

    // Permission-ları sil
    const deleteResult = await RbacPermission.deleteMany({
      _id: { $in: tempDelete.permissions },
    });
    console.log("Permission delete result:", deleteResult);

    // Bu permission-lara sahib user-lərin permission-larını null et
    const userUpdateResult = await PartnerUser.updateMany(
      { perm: { $in: tempDelete.permissions } },
      { $unset: { perm: 1 } }
    );
    console.log("User permission update result:", userUpdateResult);

    // Temp record-u sil
    const tempDeleteResult = await TempPartnerPermDelete.findByIdAndDelete(
      tempDeleteId
    );
    console.log("Temp delete cleanup result:", tempDeleteResult);

    console.log("✅ Permission silmə tamamlandı");

    return res.status(200).json({
      message: "Permission uğurla silindi",
      success: true,
      redirect: "/muessise-info",
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
    const { otp1, otp2, otp3, otp4, otp5, otp6, tempDeleteId } = req.body;
    const otp = `${otp1 || ""}${otp2 || ""}${otp3 || ""}${otp4 || ""}${otp5 || ""}${otp6 || ""}`.trim();
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    // OTP modelini yoxla
    const otpModelCheck = await OtpModel.findOne({ user_id: userId, otp: Number(otp) });

    if (!otpModelCheck) {
      return res.status(401).json({ success: false, message: "Otp is wrong" });
    }

    if (otpModelCheck.expire_time < Date.now()) {
      return res.status(401).json({ success: false, message: "Otp time is over" });
    }

    const tempDelete = await TempPartnerPermDelete.findById(tempDeleteId);
    if (!tempDelete) {
      return res.status(400).json({ success: false, message: "Temp delete data not found" });
    }

    if (String(tempDelete.sender_id) !== String(userId)) {
      return res.status(401).json({ success: false, message: "Permission denied" });
    }

    const permissionIds = tempDelete.permissions;
    await RbacPermission.deleteMany({ _id: { $in: permissionIds } });

    await OtpModel.deleteOne({ user_id: userId, otp: Number(otp) });

    await TempPartnerPermDelete.deleteOne({ _id: tempDeleteId });

    return res.status(200).json({
      message: "Permissions deleted successfully",
      success: true,
      redirect: "/muessise-info",
    });
  } catch (error) {
    console.error("❌ [ERROR] acceptDeletePerm failed:", error.message, error.stack);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


