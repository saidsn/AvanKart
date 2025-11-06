import RbacPartnerPermUsers from "../../../shared/model/partner/rbacPartnerPermsModel.js";
import PartnerUser from "../../../shared/models/partnyorUserModel.js";
import RbacPermission from "../../../shared/models/rbacPermission.model.js";

export const editPermGroupData = async (req, res) => {
  try {
    const { users, permissions } = req.body;
    const senderId = req.user.id;

    // Sender user
    const senderUser = await PartnerUser.findById(senderId);
    if (!senderUser || !senderUser.muessise_id) {
      return res
        .status(400)
        .json({ success: false, message: "Muessise tapılmadı." });
    }

    const muessiseId = senderUser.muessise_id;

    // Permission yoxla
    if (
      !permissions ||
      permissions.muessise_id.toString() !== muessiseId.toString()
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Permission muessise uyğun deyil." });
    }

    // User-ları yoxla və əlavə et
    for (const userId of users) {
      let existing = await RbacPartnerPermUsers.findOne({
        muessise_id: muessiseId,
        users: userId,
      });

      if (!existing) {
        // Yeni əlavə et
        await RbacPartnerPermUsers.create({
          sender_id: senderId,
          muessise_id: muessiseId,
          users: [userId],
        });
      } else {
        // Mövcud record varsa, əlavə user yoxdursa push et
        if (!existing.users.includes(userId)) {
          existing.users.push(userId);
          await existing.save();
        }
      }
    }

    // Permissions modelini update et
    const permDoc = await RbacPermission.findOne({ muessise_id: muessiseId });
    if (!permDoc) {
      return res
        .status(404)
        .json({ success: false, message: "Permission tapılmadı." });
    }

    // Fields update
    Object.keys(permissions).forEach((key) => {
      if (key !== "muessise_id") {
        permDoc[key] = permissions[key] || "none";
      }
    });

    await permDoc.save();

    // Son table
    const allPerms = await RbacPermission.find({ muessise_id: muessiseId });

    return res.status(200).json({
      success: true,
      message: "Permission və user-lar uğurla dəyişdirildi.",
      table: allPerms,
    });
  } catch (error) {
    console.error("editPermGroupData error:", error);
    return res.status(500).json({ success: false, message: "Server xətası." });
  }
};
