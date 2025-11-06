import RbacPartnerPermUsers from "../../../shared/model/partner/rbacPartnerPermsModel.js";
import PeopleUser from "../../../shared/models/peopleUserModel.js";
// import PartnerUser from "../../../shared/models/partnyorUserModel.js";
import RbacPermission from "../../../shared/models/rbacPermission.model.js";

export const editPermGroupData = async (req, res) => {
  try {
    const { users, permissions } = req.body;
    const senderId = req.user.id;

    // Sender user
    const senderUser = await PeopleUser.findById(senderId);
    if (!senderUser || !senderUser.sirket_id) {
      return res
        .status(400)
        .json({ success: false, message: "Şirkət tapılmadı." });
    }

    const sirketId = senderUser.sirket_id;

    // Permission yoxla
    if (!permissions || String(permissions.sirket_id) !== String(sirketId)) {
      return res
        .status(400)
        .json({ success: false, message: "Permission şirkətə uyğun deyil." });
    }

    // User-ları yoxla və əlavə et
    for (const userId of users) {
      let existing = await RbacPartnerPermUsers.findOne({
        sirket_id: sirketId,
        users: userId,
      });

      if (!existing) {
        // Yeni əlavə et
        await RbacPartnerPermUsers.create({
          sender_id: senderId,
          sirket_id: sirketId,
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
    const permDoc = await RbacPermission.findOne({ sirket_id: sirketId });
    if (!permDoc) {
      return res
        .status(404)
        .json({ success: false, message: "Permission tapılmadı." });
    }

    // Fields update
    Object.keys(permissions).forEach((key) => {
      if (key !== "sirket_id") {
        permDoc[key] = permissions[key] || "none";
      }
    });

    await permDoc.save();

    // Son table
    const allPerms = await RbacPermission.find({ sirket_id: sirketId });

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
