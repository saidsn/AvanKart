import RbacPermission from "../../../shared/models/rbacPermission.model.js";
import PartnerUser from "../../../shared/models/partnyorUserModel.js";
import TempMuessiseInfo from "../../../shared/model/partner/tempMuessiseInfo.js";
import Duty from "../../../shared/models/duties.js";
import mongoose from "mongoose";

// Permission qrupundakı istifadəçiləri göstərmə funksiyası
export const showPermUsers = async (req, res) => {
  try {
    const { permissionId } = req.body;
    const userId = req.user.id;

    // İstifadəçinin muessise_id-sini tap
    const user = await PartnerUser.findById(userId);
    if (!user || !user.muessise_id) {
      return res.status(400).json({
        success: false,
        message: "İstifadəçi məlumatları tapılmadı.",
      });
    }

    const muessise_id = user.muessise_id;

    // Permission qrupunu tap
    const permission = await RbacPermission.findOne({
      _id: permissionId,
      muessise_id: muessise_id,
    });

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: "Permission qrupu tapılmadı.",
      });
    }

    // Bu permission qrupuna aid istifadəçiləri tap
    const usersInPermission = await PartnerUser.find({
      muessise_id: muessise_id,
      permission_groups: permissionId,
    }).select("name surname email phone_number gender speciality");

    // Data formatı frontend üçün hazırla
    const formattedUsers = usersInPermission.map((user) => {
      const fullName = `${u.name || ""} ${u.surname || ""}`.trim();

      return {
        fullName,
        name: `${user.name || ""} ${user.surname || ""}`.trim(),
        gender: user.gender || "Məlum deyil",
        speciality: user.speciality || "Məlum deyil",
        phone: user.phone_number || "Məlum deyil",
        group: permission.name || "Məlum deyil",
        email: user.email || "Məlum deyil",
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedUsers,
      message: "İstifadəçilər uğurla yükləndi.",
    });
  } catch (error) {
    console.error("showPermUsers xətası:", error);
    return res.status(500).json({
      success: false,
      message: "Server xətası baş verdi.",
      error: error.message,
    });
  }
};

export const createPermGroup = async (req, res) => {
  try {
    let { name, users = [], permissions = {} } = req.body;
    const creatorId = req.user.id;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Name tələb olunur", success: false });
    }

    name = name.trim().toLowerCase();

    const existingGroup = await RbacPermission.findOne({ name });
    if (existingGroup) {
      return res.status(400).json({
        message: "Bu adda permission qrupu artıq mövcuddur",
        success: false,
      });
    }

    const creatorUser = await PartnerUser.findById(creatorId);
    if (!creatorUser || !creatorUser.muessise_id) {
      return res.status(400).json({
        message: "Göndərən istifadəçinin müəssisə ID-si tapılmadı.",
        success: false,
      });
    }
    const muessise_id = creatorUser.muessise_id;

    // Users array-i ObjectId-ə çeviririk
    const userObjectIds = users.map((id) => new mongoose.Types.ObjectId(id));

    const selectedUsers = await PartnerUser.find({ _id: { $in: userObjectIds } });
    for (const user of selectedUsers) {
      if (!user.muessise_id || user.muessise_id.toString() !== muessise_id.toString()) {
        return res.status(400).json({
          message: `İstifadəçi (${user._id}) uyğun müəssisəyə aid deyil.`,
          success: false,
        });
      }
    }

    const validEnums = ["full", "read", "none", "admin"];
    const permissionKeys = [
      "contracts",
      "requisites",
      "role_groups",
      "profile",
      "edit_users",
      "company_information",
      "avankart_partner",
      "accounting",
      "dashboard",
    ];

    const sanitizedPermissions = {};
    for (const key of permissionKeys) {
      const value = permissions[key];
      sanitizedPermissions[key] = validEnums.includes(value) ? value : "none";
    }

    const permissionDoc = new RbacPermission({
      muessise_id,
      name,
      ...sanitizedPermissions,
      creator: creatorId,
      users: selectedUsers.map(u => u._id), 
    });

    await permissionDoc.save();

    // 🔹 Hər user-ə perm əlavə edirik
    for (const user of selectedUsers) {
      user.perm = permissionDoc._id;
      await user.save();
    }

    return res.status(200).json({
      message: "Permission qrupu uğurla yaradıldı.",
      success: true,
      redirect: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server xətası baş verdi.",
      success: false,
      error: error.message,
    });
  }
};

export const editPermGroup = async (req, res) => {
  try {
    const { id, role_groups } = req.body;
    const muessiseId = req.user.muessise_id;

    const permission = await RbacPermission.findById(id);
    if (!permission) {
      return res.status(404).json({ success: false, message: "Access Denied" });
    }

    if (permission.muessise_id.toString() !== muessiseId.toString()) {
      return res.status(403).json({ success: false, message: "Access Denied" });
    }

    permission.role_groups = role_groups;
    await permission.save();

    const allPerms = await RbacPermission.find({ muessise_id: muessiseId });

    return res.status(200).json({
      success: true,
      message: "Permission Group updated successfully.",
      table: allPerms,
    });
  } catch (error) {
    console.error("editPermGroup error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error." });
  }
};

export const showHistoryTable = async (req, res) => {
  try {
    let formattedData = [];
    const data = await TempMuessiseInfo.find(
      { user_id: { $ne: null } },
      { _id: 1, muessise_name: 1, createdAt: 1 }
    )
      .populate("user_id")
      .sort({ createdAt: -1 });
    if (data.length > 0) {
      formattedData = data.map((item) => ({
        id: item._id,
        name: item.user_id
          ? item.user_id.name +
          "" +
          (item.user_id?.surname ? " " + item.user_id.surname : "")
          : "Silinmiş istifadəçi",
        date: new Date(item.createdAt).toLocaleString("az-AZ"),
      }));
    }

    return res.status(200).json({ success: true, data: formattedData });
  } catch (error) {
    console.error("showHistoryTable error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

export const editPermName = async (req, res) => {
  try {
    const { id, name: newName } = req.body;
    const { id: userId, muessise_id: muessiseId } = req.user;
    if (!id || !newName)
      return res.status(401).json({
        message: "Id or name are not found",
        success: false,
      });
    if (!newName || typeof newName !== "string" || !newName.trim()) {
      return res.status(400).json({
        message: "Permission name is invalid",
        success: false,
      });
    }

    if (!muessiseId)
      return res.status(400).json({
        message: "User id not found",
        success: false,
      });

    const duplicate = await RbacPermission.findOne({
      _id: { $ne: id },
      name: { $regex: new RegExp(`^${newName}$`, "i") },
    });

    if (duplicate)
      return res.status(400).json({
        message: "This permission name already exists",
        success: false,
      });

    const permission = await RbacPermission.findById(id);
    if (!permission)
      return res.status(400).json({
        message: "Permission denied",
        success: false,
      });
    if (permission.default)
      return res.status(400).json({
        message: "Default permission can't change",
        success: false,
      });

    if (String(permission.muessise_id) !== String(muessiseId)) {
      return res.status(401).json({
        message: "Access denied",
        success: false,
      });
    }

    permission.name = newName;
    await permission.save();

    return res.status(200).json({
      message: "Permission name  changed successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

//Old version
// export const showPermissions = async (req, res) => {
//   try {
//     const {
//       start = 0,
//       length = 10,
//       draw,
//       search = "",
//       order = [],
//       columns = [],
//     } = req.body;
//     const myUser = await PartnerUser.findById(req.user?.id);

//     const muessiseId = myUser.muessise_id;

//     if (!muessiseId) {
//       return res.status(400).json({
//         message: "Müəssisə ID-si tapılmadı.",
//         success: false,
//       });
//     }

//     const existingPerms = await RbacPermission.find({
//       muessise_id: muessiseId,
//     });
//     if (existingPerms.length === 0) {
//       const defaultPermissions = [
//         {
//           name: "Sistem İnzibatçısı",
//           role_groups: "full",
//           muessise_id: muessiseId,
//           creator: req.user?.id,
//           dashboard: "full",
//           accounting: "full",
//           avankart_partner: "full",
//           company_information: "full",
//           profile: "full",
//           edit_users: "full",
//           requisites: "full",
//           contracts: "full",
//           default: true,
//           users: []
//         },
//         {
//           name: "Maliyyə Departamenti",
//           role_groups: "read",
//           muessise_id: muessiseId,
//           creator: req.user?.id,
//           dashboard: "read",
//           accounting: "read",
//           avankart_partner: "read",
//           company_information: "read",
//           profile: "read",
//           edit_users: "read",
//           requisites: "read",
//           contracts: "read",
//           default: true,
//           users: []
//         },
//         {
//           name: "İnsan Resursları",
//           role_groups: "read",
//           muessise_id: muessiseId,
//           creator: req.user?.id,
//           dashboard: "read",
//           accounting: "read",
//           avankart_partner: "read",
//           company_information: "read",
//           profile: "read",
//           edit_users: "read",
//           requisites: "read",
//           contracts: "read",
//           default: true,
//           users: []
//         },
//       ];
//       for (let perm of defaultPermissions) {
//         await new RbacPermission(perm).save();
//       }
//     }

//     // Axtarış filteri
//     const searchFilter = search
//       ? { name: { $regex: search, $options: "i" }, muessise_id: muessiseId }
//       : { muessise_id: muessiseId };

//     const total = await RbacPermission.countDocuments({
//       muessise_id: muessiseId,
//     });
//     const filtered = await RbacPermission.countDocuments(searchFilter);

//     // Sort (order) üçün column tapılır
//     let sortOption = { createdAt: -1 }; // default

//     if (order.length > 0 && columns.length > 0) {
//       const columnIndex = parseInt(order[0].column);
//       const columnName = columns[columnIndex]?.data;
//       const direction = order[0].dir === "asc" ? 1 : -1;

//       // Yalnız icazə verilən sahələrə görə sort et (security üçün)
//       const sortableFields = {
//         groupName: "name",
//         createdDate: "createdAt",
//       };

//       if (sortableFields[columnName]) {
//         sortOption = { [sortableFields[columnName]]: direction };
//       }
//     }

//     const data = await RbacPermission.find(searchFilter)
//       .skip(parseInt(start))
//       .limit(parseInt(length))
//       .sort(sortOption);

//     // Formatlanmış nəticə
//     const formattedData = await Promise.all(
//       data.map(async (item) => {
//         const memberCount = await PartnerUser.countDocuments({
//           perm: item._id,
//         });
//         const fields = [
//           "dashboard",
//           "accounting",
//           "avankart_partner",
//           "company_information",
//           "profile",
//           "edit_users",
//           "role_groups",
//           "requisites",
//           "contracts",
//         ];
//         const normalizedValues = fields.map((key) => {
//           const val = (item[key] || "").trim();
//           return val;
//         });
//         const readableRole = normalizedValues.every((val) => val === "full")
//           ? "Tam idarə"
//           : normalizedValues.every((val) => val === "read")
//             ? "Baxış"
//             : "Özəlləşdirilmiş";

//         return {
//           id: item._id,
//           groupName: item.name,
//           permissions: readableRole,
//           memberCount: String(memberCount),
//           createdDate: item.createdAt.toLocaleString("az-AZ", {
//             day: "2-digit",
//             month: "2-digit",
//             year: "numeric",
//             hour: "2-digit",
//             minute: "2-digit",
//           }),
//           default: item.default || false, // ƏLAVƏ EDİLDİ
//         };
//       })
//     );

//     return res.status(200).json({
//       draw,
//       recordsTotal: total,
//       recordsFiltered: filtered,
//       data: formattedData,
//     });
//   } catch (error) {
//     console.error("showPermissions error:", error);
//     return res.status(500).json({
//       message: "Server xətası baş verdi.",
//       success: false,
//     });
//   }
// };

// 1. Permission detallarını almaq üçün (tam edit popup üçün)
// Düzəlişli getPermissionDetails funksiyası


export const showPermissions = async (req, res) => {
  try {
    const {
      start = 0,
      length = 10,
      draw,
      search = "",
      order = [],
      columns = [],
    } = req.body;

    const myUser = await PartnerUser.findById(req.user?.id);
    const muessiseId = myUser?.muessise_id;

    if (!muessiseId) {
      return res.status(400).json({
        message: "Müəssisə ID-si tapılmadı.",
        success: false,
      });
    }

    // Default permissions array
    const defaultPermissions = [
      {
        name: "Sistem İnzibatçısı",
        role_groups: "full",
        muessise_id: muessiseId,
        creator: req.user?.id,
        dashboard: "full",
        accounting: "full",
        avankart_partner: "full",
        company_information: "full",
        profile: "full",
        edit_users: "full",
        requisites: "full",
        contracts: "full",
        default: true,
        users: []
      },
      {
        name: "Maliyyə Departamenti",
        role_groups: "read",
        muessise_id: muessiseId,
        creator: req.user?.id,
        dashboard: "read",
        accounting: "read",
        avankart_partner: "read",
        company_information: "read",
        profile: "read",
        edit_users: "read",
        requisites: "read",
        contracts: "read",
        default: true,
        users: []
      },
      {
        name: "İnsan Resursları",
        role_groups: "read",
        muessise_id: muessiseId,
        creator: req.user?.id,
        dashboard: "read",
        accounting: "read",
        avankart_partner: "read",
        company_information: "read",
        profile: "read",
        edit_users: "read",
        requisites: "read",
        contracts: "read",
        default: true,
        users: []
      },
    ];

    // Hər permission üçün yoxlama
    for (let perm of defaultPermissions) {
      const exists = await RbacPermission.findOne({
        muessise_id: muessiseId,
        name: perm.name
      });
      if (!exists) {
        await new RbacPermission(perm).save();
      }
    }

    // Axtarış filteri
    const searchFilter = search
      ? { name: { $regex: search, $options: "i" }, muessise_id: muessiseId }
      : { muessise_id: muessiseId };

    const total = await RbacPermission.countDocuments({ muessise_id: muessiseId });
    const filtered = await RbacPermission.countDocuments(searchFilter);

    // Sort (order) üçün column tapılır
    let sortOption = { createdAt: -1 };
    if (order.length > 0 && columns.length > 0) {
      const columnIndex = parseInt(order[0].column);
      const columnName = columns[columnIndex]?.data;
      const direction = order[0].dir === "asc" ? 1 : -1;
      const sortableFields = { groupName: "name", createdDate: "createdAt" };
      if (sortableFields[columnName]) {
        sortOption = { [sortableFields[columnName]]: direction };
      }
    }

    const data = await RbacPermission.find(searchFilter)
      .skip(parseInt(start))
      .limit(parseInt(length))
      .sort(sortOption);

    // Formatlanmış nəticə
    const formattedData = await Promise.all(
      data.map(async (item) => {
        const memberCount = await PartnerUser.countDocuments({ perm: item._id });
        const fields = [
          "dashboard", "accounting", "avankart_partner", "company_information",
          "profile", "edit_users", "role_groups", "requisites", "contracts"
        ];
        const normalizedValues = fields.map((key) => (item[key] || "").trim());
        const readableRole = normalizedValues.every((val) => val === "full")
          ? "Tam idarə"
          : normalizedValues.every((val) => val === "read")
            ? "Baxış"
            : "Özəlləşdirilmiş";

        return {
          id: item._id,
          groupName: item.name,
          permissions: readableRole,
          memberCount: String(memberCount),
          createdDate: item.createdAt.toLocaleString("az-AZ", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          default: item.default || false,
        };
      })
    );

    return res.status(200).json({
      draw,
      recordsTotal: total,
      recordsFiltered: filtered,
      data: formattedData,
    });

  } catch (error) {
    console.error("showPermissions error:", error);
    return res.status(500).json({
      message: "Server xətası baş verdi.",
      success: false,
    });
  }
};


export const getPermissionDetails = async (req, res) => {
  try {
    const { permissionId } = req.body;

    if (!permissionId) {
      return res.status(400).json({
        message: "Permission ID tələb olunur.",
        success: false,
      });
    }

    // User-i əldə et və muessise_id-ni tap
    const myUser = await PartnerUser.findById(req.user?.id);
    if (!myUser || !myUser.muessise_id) {
      return res.status(400).json({
        message: "İstifadəçi və ya müəssisə ID-si tapılmadı.",
        success: false,
      });
    }

    const muessiseId = myUser.muessise_id;

    const permission = await RbacPermission.findById(permissionId)
      .populate({
        path: "users",
        select: "name surname",
        model: PartnerUser,
      });
    if (!permission) {
      return res.status(404).json({
        message: "Permission tapılmadı.",
        success: false,
      });
    }

    // Müəssisə yoxlaması
    if (permission.muessise_id.toString() !== muessiseId.toString()) {
      return res.status(403).json({
        message: "Bu permission-a giriş icazəniz yoxdur.",
        success: false,
      });
    }
    const users = permission.users?.map(u => ({
      _id: u._id,
      fullname: `${u.name} ${u.surname}`
    })) || [];

    return res.status(200).json({
      success: true,
      data: {
        id: permission._id,
        name: permission.name,
        dashboard: permission.dashboard,
        accounting: permission.accounting,
        avankart_partner: permission.avankart_partner,
        company_information: permission.company_information,
        profile: permission.profile,
        edit_users: permission.edit_users,
        role_groups: permission.role_groups,
        requisites: permission.requisites,
        contracts: permission.contracts,
        default: permission.default || false,
        users,
      },
    });
  } catch (error) {
    console.error("getPermissionDetails error:", error);
    return res.status(500).json({
      message: "Server xətası baş verdi.",
      success: false,
    });
  }
};


export const getDefaultPermissionDetails = async (req, res) => {
  try {
    const { permissionId } = req.body;

    if (!permissionId) {
      return res.status(400).json({
        message: "Permission ID tələb olunur.",
        success: false,
      });
    }

    const myUser = await PartnerUser.findById(req.user?.id);
    if (!myUser || !myUser.muessise_id) {
      return res.status(400).json({
        message: "İstifadəçi və ya müəssisə ID-si tapılmadı.",
        success: false,
      });
    }

    const muessiseId = myUser.muessise_id;

    // Permission və user-ları populate edirik
    const permission = await RbacPermission.findById(permissionId)
      .populate({
        path: "users",
        select: "name surname email phone phone_suffix gender duty",
        model: PartnerUser,
      });

    if (!permission) {
      return res.status(404).json({
        message: "Permission tapılmadı.",
        success: false,
      });
    }

    if (permission.muessise_id.toString() !== muessiseId.toString()) {
      return res.status(403).json({
        message: "Bu permission-a giriş icazəniz yoxdur.",
        success: false,
      });
    }

    // Users array hazırlamaq
    const users = await Promise.all(
      (permission.users || []).map(async (u) => {
        let dutyName = null;
        if (u.duty) {
          const duty = await Duty.findById(u.duty);
          dutyName = duty ? duty.name : null;
        }

        return {
          _id: u._id,
          fullname: `${u.name} ${u.surname}`,
          gender: u.gender,
          email: u.email,
          phone: `+${u.phone_suffix}${u.phone}`,
          duty: dutyName,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("getDefaultPermissionDetails error:", error);
    return res.status(500).json({
      message: "Server xətası baş verdi.",
      success: false,
    });
  }
};


// permissiondan user silmek
export const deletePermissionUser = async (req, res) => {
  try {
    const { permissionId, userId } = req.params;
    if (!permissionId || !userId) {
      return res.status(400).json({ success: false, message: "Permission ID və User ID tələb olunur." });
    }

    // permission tap
    const permission = await RbacPermission.findById(permissionId);
    if (!permission) {
      return res.status(404).json({ success: false, message: "Permission tapılmadı." });
    }

    // User-i array-dən çıxar
    const updatedPermission = await RbacPermission.findByIdAndUpdate(
      permissionId,
      { $pull: { users: userId } }, // burada string istifadə et
      { new: true }
    ).populate({ path: "users", select: "name surname", model: PartnerUser });


    const users = updatedPermission.users.map(u => ({
      _id: u._id,
      fullname: `${u.name} ${u.surname}`
    }));
    return res.status(200).json({ success: true, message: "User silindi.", users });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server xətası baş verdi." });
  }
};

//permissiona user elave etmek normal 


export const addPermissionUser = async (req, res) => {
  try {
    const { permissionId, userIds } = req.body;

    if (!permissionId || !userIds) {
      return res.status(400).json({
        success: false,
        message: "Permission ID və userIds tələb olunur."
      });
    }

    const usersToAdd = Array.isArray(userIds) ? userIds : [userIds];

    // Burada 'new' istifadə olunur
    const objectIdsToAdd = usersToAdd.map(id => new mongoose.Types.ObjectId(id));

    const permission = await RbacPermission.findById(permissionId);
    if (!permission) {
      return res.status(404).json({ success: false, message: "Permission tapılmadı." });
    }

    if (!Array.isArray(permission.users)) {
      permission.users = [];
    }

    objectIdsToAdd.forEach(id => {
      if (!permission.users.includes(id)) {
        permission.users.push(id);
      }
    });
    // 2. PartnerUser modelində həmin user-lərin perm fieldini update edirik
    await PartnerUser.updateMany(
      { _id: { $in: usersToAdd } },
      { $set: { perm: permissionId } }
    )
    await permission.save();

    return res.status(200).json({
      success: true,
      message: "User(lər) əlavə olundu.",
      users: permission.users
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server xətası baş verdi." });
  }
};



const escapeRegExp = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const editPermissionName = async (req, res) => {
  try {
    const { id, name: newNameRaw } = req.body || {};
    const newName = (newNameRaw || "").trim();
    if (!id || !newName)
      return res
        .status(400)
        .json({ success: false, message: "ID və ad tələb olunur." });

    const me = await PartnerUser.findById(req.user?.id).select("muessise_id");
    if (!me?.muessise_id)
      return res
        .status(400)
        .json({
          success: false,
          message: "İstifadəçi və ya müəssisə ID-si tapılmadı.",
        });

    const perm = await RbacPermission.findById(id).select("muessise_id");
    if (!perm)
      return res
        .status(404)
        .json({ success: false, message: "Permission tapılmadı." });
    if (String(perm.muessise_id) !== String(me.muessise_id)) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Bu permission-a giriş icazəniz yoxdur.",
        });
    }

    const escapeRegex = (s) => (s || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const duplicate = await RbacPermission.findOne({
      _id: { $ne: id },
      muessise_id: me.muessise_id,
      name: { $regex: new RegExp(`^${escapeRegex(newName)}$`, "i") },
    }).lean();
    if (duplicate)
      return res
        .status(400)
        .json({
          success: false,
          message: "Bu adda permission artıq mövcuddur.",
        });

    const result = await RbacPermission.updateOne(
      { _id: id, muessise_id: me.muessise_id },
      { $set: { name: newName } },
      { runValidators: true }
    );
    if (result.matchedCount === 0)
      return res
        .status(404)
        .json({ success: false, message: "Permission tapılmadı." });

    const fresh = await RbacPermission.findById(id).select("_id name").lean();
    return res
      .status(200)
      .json({
        success: true,
        message: "Permission adı uğurla dəyişdirildi.",
        data: fresh,
      });
  } catch (e) {
    console.error("editPermissionName error:", e);
    return res
      .status(500)
      .json({ success: false, message: "Server xətası baş verdi." });
  }
};

// 2. Default permission-ın adını dəyişmək (sadə edit)
export const editPermissionDefaultName = async (req, res) => {
  try {
    const { id, name: newName } = req.body;

    if (!id || !newName || !newName.trim()) {
      return res.status(400).json({
        message: "ID və ad tələb olunur.",
        success: false,
      });
    }

    // User-i əldə et və muessise_id-ni tap
    const myUser = await PartnerUser.findById(req.user?.id);
    if (!myUser || !myUser.muessise_id) {
      return res.status(400).json({
        message: "İstifadəçi və ya müəssisə ID-si tapılmadı.",
        success: false,
      });
    }

    const muessiseId = myUser.muessise_id;

    const permission = await RbacPermission.findById(id);

    if (!permission) {
      return res.status(404).json({
        message: "Permission tapılmadı.",
        success: false,
      });
    }

    // Müəssisə yoxlaması
    if (permission.muessise_id.toString() !== muessiseId.toString()) {
      return res.status(403).json({
        message: "Bu permission-a giriş icazəniz yoxdur.",
        success: false,
      });
    }

    // Default permission yoxlaması
    if (!permission.default) {
      return res.status(400).json({
        message: "Bu endpoint yalnız default permission-lar üçündür.",
        success: false,
      });
    }

    // Ad dublikasiya yoxlaması
    const duplicate = await RbacPermission.findOne({
      _id: { $ne: id },
      name: { $regex: new RegExp(`^${newName.trim()}$`, "i") },
      muessise_id: muessiseId,
    });

    if (duplicate) {
      return res.status(400).json({
        message: "Bu adda permission artıq mövcuddur.",
        success: false,
      });
    }

    // Adı yenilə
    permission.name = newName.trim();
    await permission.save();

    return res.status(200).json({
      message: "Permission adı uğurla dəyişdirildi.",
      success: true,
    });
  } catch (error) {
    console.error("editPermissionDefaultName error:", error);
    return res.status(500).json({
      message: "Server xətası baş verdi.",
      success: false,
    });
  }
};

// 3. Normal permission-ı tam olaraq edit etmək (ad + permissions)
// export const editPermissionFull = async (req, res) => {
//   try {
//     const { id, name: newName, permissions } = req.body;

//     // User-i əldə et və muessise_id-ni tap
//     const myUser = await PartnerUser.findById(req.user?.id);
//     if (!myUser || !myUser.muessise_id) {
//       return res.status(400).json({
//         message: "İstifadəçi və ya müəssisə ID-si tapılmadı.",
//         success: false,
//       });
//     }

//     const muessiseId = myUser.muessise_id;

//     if (!id || !newName || !newName.trim() || !permissions) {
//       return res.status(400).json({
//         message: "ID, ad və permission məlumatları tələb olunur.",
//         success: false,
//       });
//     }

//     const permission = await RbacPermission.findById(id);

//     if (!permission) {
//       return res.status(404).json({
//         message: "Permission tapılmadı.",
//         success: false,
//       });
//     }

//     // Müəssisə yoxlaması
//     if (permission.muessise_id.toString() !== muessiseId.toString()) {
//       return res.status(403).json({
//         message: "Bu permission-a giriş icazəniz yoxdur.",
//         success: false,
//       });
//     }

//     // Default permission yoxlaması - default-ları tam edit etmək olmaz
//     if (permission.default) {
//       return res.status(400).json({
//         message: "Default permission-ları tam dəyişmək olmaz.",
//         success: false,
//       });
//     }

//     // Ad dublikasiya yoxlaması
//     const duplicate = await RbacPermission.findOne({
//       _id: { $ne: id },
//       name: { $regex: new RegExp(`^${newName.trim()}$`, "i") },
//       muessise_id: muessiseId,
//     });

//     if (duplicate) {
//       return res.status(400).json({
//         message: "Bu adda permission artıq mövcuddur.",
//         success: false,
//       });
//     }

//     // Permission məlumatlarını yenilə
//     // Permission məlumatlarını yenilə
//     permission.name = newName.trim();
//     permission.dashboard = permissions.dashboard || "none";
//     permission.accounting = permissions.accounting || "none";
//     permission.avankart_partner = permissions.avankart_partner || "none";
//     permission.company_information = permissions.company_information || "none";
//     permission.profile = permissions.profile || "none";
//     permission.edit_users = permissions.edit_users || "none";
//     permission.role_groups = permissions.role_groups || "none";
//     permission.requisites = permissions.requisites || "none";
//     permission.contracts = permissions.contracts || "none";
//     await permission.save();

//     return res.status(200).json({
//       message: "Permission uğurla yeniləndi.",
//       success: true,
//     });
//   } catch (error) {
//     console.error("editPermissionFull error:", error);
//     return res.status(500).json({
//       message: "Server xətası baş verdi.",
//       success: false,
//     });
//   }
// };

export const editPermissionFull = async (req, res) => {
  try {
    const { id } = req.body;

    // Hem `newName` hem `name` destekle
    const rawNewName =
      typeof req.body.newName === "string" ? req.body.newName : req.body.name;
    const newName = (rawNewName || "").trim();

    if (!id || !newName) {
      return res.status(400).json({
        success: false,
        message: "ID ve yeni ad zorunlu.",
      });
    }

    // Kullanıcı ve muessise kontrolü
    const myUser = await PartnerUser.findById(req.user?.id).select(
      "muessise_id"
    );
    if (!myUser?.muessise_id) {
      return res.status(400).json({
        success: false,
        message: "Kullanıcı veya muessise_id bulunamadı.",
      });
    }
    const muessiseId = myUser.muessise_id;

    // Permission getir
    const permission = await RbacPermission.findById(id);
    if (!permission) {
      return res.status(404).json({
        success: false,
        message: "Permission bulunamadı.",
      });
    }

    // Kurum yetkisi
    if (String(permission.muessise_id) !== String(muessiseId)) {
      return res.status(403).json({
        success: false,
        message: "Bu permission için yetkiniz yok.",
      });
    }

    // Default olan tamamen değiştirilemez
    if (permission.default) {
      return res.status(400).json({
        success: false,
        message: "Default permission tamamen değiştirilemez.",
      });
    }

    // İsim dublikasyon kontrolü (case-insensitive, kendi kaydını hariç tut)
    const duplicate = await RbacPermission.findOne({
      _id: { $ne: permission._id },
      muessise_id: muessiseId,
      name: { $regex: new RegExp(`^${escapeRegExp(newName)}$`, "i") },
    }).lean();

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: "Bu isim zaten mevcut.",
      });
    }

    // Permissions kaynağı: ya req.body.permissions ya da kök seviye
    const incoming =
      req.body.permissions && typeof req.body.permissions === "object"
        ? req.body.permissions
        : req.body;

    // Sadece gönderilen alanları güncelle (gönderilmeyenleri koru)
    const FIELDS = [
      "dashboard",
      "accounting",
      "avankart_partner",
      "company_information",
      "profile",
      "edit_users",
      "role_groups",
      "requisites",
      "contracts",
    ];
    const ALLOWED = new Set(["full", "read", "none"]);

    for (const key of FIELDS) {
      if (incoming[key] !== undefined) {
        const val = String(incoming[key]).toLowerCase();
        if (!ALLOWED.has(val)) {
          return res.status(400).json({
            success: false,
            message: `'${key}' için geçersiz değer: ${incoming[key]}. (full|read|none)`,
          });
        }
        permission[key] = val;
      }
    }

    // İsim güncelle
    permission.name = newName;

    await permission.save();

    return res.status(200).json({
      success: true,
      message: "Permission başarıyla güncellendi.",
      data: permission, // İstersen front için döndürüyorum
    });
  } catch (error) {
    console.error("editPermissionFull error:", error);
    return res.status(500).json({
      success: false,
      message: "Sunucu hatası.",
    });
  }
};

// 4. Permission silmək (yalnız default=false olanlar)
export const deletePermission = async (req, res) => {
  try {
    const { permissionId } = req.body;
    const myUser = await PartnerUser.findById(req.user?.id);
    const muessiseId = myUser.muessise_id;
    if (!muessiseId) {
      return res.status(400).json({
        message: "Müəssisə ID-si tapılmadı.",
        success: false,
      });
    }

    if (!permissionId) {
      return res.status(400).json({
        message: "Permission ID tələb olunur.",
        success: false,
      });
    }

    const permission = await RbacPermission.findById(permissionId);

    if (!permission) {
      return res.status(404).json({
        message: "Permission tapılmadı.",
        success: false,
      });
    }

    // Müəssisə yoxlaması
    if (permission.muessise_id.toString() !== muessiseId.toString()) {
      return res.status(403).json({
        message: "Bu permission-a giriş icazəniz yoxdur.",
        success: false,
      });
    }

    // Default permission silmək olmaz
    if (permission.default) {
      return res.status(400).json({
        message: "Default permission-ları silmək olmaz.",
        success: false,
      });
    }

    // Bu permission-dan istifadə edən user-lar varmı?
    const usersWithThisPermission = await PartnerUser.countDocuments({
      perm: permissionId,
    });

    if (usersWithThisPermission > 0) {
      return res.status(400).json({
        message: `Bu permission-dan ${usersWithThisPermission} istifadəçi istifadə edir. Əvvəl onların permission-ını dəyişin.`,
        success: false,
      });
    }

    await RbacPermission.findByIdAndDelete(permissionId);

    return res.status(200).json({
      message: "Permission uğurla silindi.",
      success: true,
    });
  } catch (error) {
    console.error("deletePermission error:", error);
    return res.status(500).json({
      message: "Server xətası baş verdi.",
      success: false,
    });
  }
};
