import RbacPermission from "../../../shared/models/rbacPermission.model.js";
import RbacPeoplePermission from "../../../shared/models/rbacPeopleModel.js";
import PeopleUser from "../../../shared/models/peopleUserModel.js";
import TempsirketInfo from "../../../shared/model/people/tempSirketInfo.js";
import ImtiyazQruplari from "../../../shared/model/people/imtiyazQruplari.js";

// Permission qrupundakı istifadəçiləri göstərmə funksiyası
export const showPermUsers = async (req, res) => {
  try {
    const { permissionId } = req.body;
    const userId = req.user.id;

    // İstifadəçinin sirket_id-sini tap
    const user = await PeopleUser.findById(userId);
    if (!user || !user.sirket_id) {
      return res.status(400).json({
        success: false,
        message: "İstifadəçi məlumatları tapılmadı.",
      });
    }

    const sirket_id = user.sirket_id;

    // Permission qrupunu tap
    const permission = await RbacPeoplePermission.findOne({
      _id: permissionId,
      sirket_id: sirket_id,
    });

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: "Permission qrupu tapılmadı.",
      });
    }

    // Bu permission qrupuna aid istifadəçiləri tap
    const usersInPermission = await PeopleUser.find({
      sirket_id: sirket_id,
      permission_groups: permissionId,
    }).select("name surname email phone_number gender speciality");

    // Data formatı frontend üçün hazırla
    const formattedUsers = usersInPermission.map((u) => ({
      name: `${u.name || ""} ${u.surname || ""}`.trim(),
      gender: u.gender || "Məlum deyil",
      speciality: u.speciality || "Məlum deyil",
      phone: u.phone_number || "Məlum deyil",
      group: permission.name || "Məlum deyil",
      email: u.email || "Məlum deyil",
    }));

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
      return res
        .status(400)
        .json({ message: "Name tələb olunur", success: false });
    }
    name = name.trim().toLowerCase();

    const existingGroup = await RbacPeoplePermission.findOne({ name });
    if (existingGroup) {
      return res.status(400).json({
        message: "Bu adda permission qrupu artıq mövcuddur",
        success: false,
      });
    }

    const creatorUser = await PeopleUser.findById(creatorId);
    if (!creatorUser || !creatorUser.sirket_id) {
      return res.status(400).json({
        message: "Göndərən istifadəçinin şirkət ID-si tapılmadı.",
        success: false,
      });
    }
    const sirket_id = creatorUser.sirket_id;

    const selectedUsers = await PeopleUser.find({ _id: { $in: users } });
    for (const u of selectedUsers) {
      if (!u.sirket_id || String(u.sirket_id) !== String(sirket_id)) {
        return res.status(400).json({
          message: `İstifadəçi (${u._id}) uyğun şirkətə aid deyil.`,
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

    const permissionDoc = new RbacPeoplePermission({
      sirket_id,
      name,
      ...sanitizedPermissions,
      creator: creatorId,
    });

    await permissionDoc.save();

    for (const u of selectedUsers) {
      u.perm = permissionDoc._id;
      await u.save();
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
    const sirketId = req.user.sirket_id;

    const permission = await RbacPeoplePermission.findById(id);
    if (!permission) {
      return res.status(404).json({ success: false, message: "Access Denied" });
    }

    if (String(permission.sirket_id) !== String(sirketId)) {
      return res.status(403).json({ success: false, message: "Access Denied" });
    }

    permission.role_groups = role_groups;
    await permission.save();

    const allPerms = await RbacPeoplePermission.find({ sirket_id: sirketId });

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
    const data = await TempsirketInfo.find(
      { user_id: { $ne: null } },
      { _id: 1, sirket_name: 1, createdAt: 1 }
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
    const { id: userId, sirket_id: sirketId } = req.user;
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

    if (!sirketId)
      return res.status(400).json({
        message: "User sirket_id not found",
        success: false,
      });

    const duplicate = await RbacPeoplePermission.findOne({
      _id: { $ne: id },
      name: { $regex: new RegExp(`^${newName}$`, "i") },
      sirket_id: sirketId,
    });

    if (duplicate)
      return res.status(400).json({
        message: "This permission name already exists",
        success: false,
      });

    const permission = await RbacPeoplePermission.findById(id);
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

    if (String(permission.sirket_id) !== String(sirketId)) {
      return res.status(401).json({
        message: "Access denied",
        success: false,
      });
    }

    permission.name = newName.trim();
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

    const myUser = await PeopleUser.findById(req.user?.id);

    const sirketId = myUser?.sirket_id;

    if (!sirketId) {
      return res.status(400).json({
        message: "Şirkət ID-si tapılmadı.",
        success: false,
      });
    }

    const existingPerms = await RbacPeoplePermission.find({
      sirket_id: sirketId,
    });

    if (existingPerms.length === 0) {
      const defaultPermissions = [
        {
          name: "Sistem İnzibatçısı",
          salahiyyet_qruplari: "full",
          sirket_id: sirketId,
          creator: req.user?.id,
          dashboard: "full",
          hesablasma: "full",
          emeliyyatlar: "full",
          isciler: "full",
          iscilerin_balansi: "full",
          e_qaime: "full",
          sirket_melumatlari: "full",
          profil: "full",
          istifadeciler: "full",
          rekvizitler: "full",
          muqavileler: "full",
          default: true,
        },
        {
          name: "Maliyyə Departamenti",
          salahiyyet_qruplari: "read",
          sirket_id: sirketId,
          creator: req.user?.id,
          dashboard: "read",
          hesablasma: "read",
          emeliyyatlar: "read",
          isciler: "read",
          iscilerin_balansi: "read",
          e_qaime: "read",
          sirket_melumatlari: "read",
          profil: "read",
          istifadeciler: "read",
          rekvizitler: "read",
          muqavileler: "read",
          default: true,
        },
        {
          name: "İnsan Resursları",
          salahiyyet_qruplari: "read",
          sirket_id: sirketId,
          creator: req.user?.id,
          dashboard: "read",
          hesablasma: "read",
          emeliyyatlar: "read",
          isciler: "read",
          iscilerin_balansi: "read",
          e_qaime: "read",
          sirket_melumatlari: "read",
          profil: "read",
          istifadeciler: "read",
          rekvizitler: "read",
          muqavileler: "read",
          default: true,
        },
      ];

      // Default permission-ları yaratdıqdan sonra yenidən sorğu et
      try {
        for (let perm of defaultPermissions) {
          await new RbacPeoplePermission(perm).save();
        }
      } catch (saveError) {
        console.error("Error saving default permissions:", saveError);
        return res.status(500).json({
          message: "Default permission-lar yaradılarkən xəta baş verdi.",
          success: false,
          error: saveError.message,
        });
      }
    }

    // Axtarış filteri
    const searchFilter = search
      ? { name: { $regex: search, $options: "i" }, sirket_id: sirketId }
      : { sirket_id: sirketId };

    let total, filtered, data;

    try {
      total = await RbacPeoplePermission.countDocuments({
        sirket_id: sirketId,
      });

      filtered = await RbacPeoplePermission.countDocuments(searchFilter);
    } catch (countError) {
      console.error("Error counting permissions:", countError);
      return res.status(500).json({
        message: "Permission sayımında xəta baş verdi.",
        success: false,
        error: countError.message,
      });
    }

    // Sort (order) üçün column tapılır
    let sortOption = { createdAt: -1 }; // default

    if (order.length > 0 && columns.length > 0) {
      const columnIndex = parseInt(order[0].column);
      const columnName = columns[columnIndex]?.data;
      const direction = order[0].dir === "asc" ? 1 : -1;

      // Yalnız icazə verilən sahələrə görə sort et (security üçün)
      const sortableFields = {
        groupName: "name",
        createdDate: "createdAt",
      };

      if (sortableFields[columnName]) {
        sortOption = { [sortableFields[columnName]]: direction };
      }
    }

    try {
      data = await RbacPeoplePermission.find(searchFilter)
        .skip(parseInt(start))
        .limit(parseInt(length))
        .sort(sortOption);
    } catch (findError) {
      console.error("Error finding permissions:", findError);
      return res.status(500).json({
        message: "Permission məlumatları alınarkən xəta baş verdi.",
        success: false,
        error: findError.message,
      });
    }

    let formattedData = [];

    try {
      formattedData = await Promise.all(
        data.map(async (item, index) => {
          try {
            let memberCount = 0;
            try {
              memberCount = await PeopleUser.countDocuments({ perm: item._id });
            } catch (memberCountError) {
              console.warn(
                "Error counting members for permission:",
                item._id,
                memberCountError
              );
              memberCount = 0;
            }

            const fields = [
              "dashboard",
              "hesablasma",
              "emeliyyatlar",
              "isciler",
              "iscilerin_balansi",
              "e_qaime",
              "sirket_melumatlari",
              "profil",
              "istifadeciler",
              "salahiyyet_qruplari",
              "rekvizitler",
              "muqavileler",
            ];

            const normalizedValues = fields.map((key) => {
              try {
                const val = (item[key] || "").toString().trim();
                return val;
              } catch (fieldError) {
                console.warn(`Error processing field ${key}:`, fieldError);
                return "";
              }
            });

            const readableRole = normalizedValues.every((val) => val === "full")
              ? "Tam idarə"
              : normalizedValues.every((val) => val === "read")
                ? "Baxış"
                : "Özəlləşdirilmiş";

            // createdAt sahəsini düzgün şəkildə işlə
            let formattedDate = "N/A";
            try {
              const dateField =
                item.createdAt ||
                item.created_at ||
                item.createdDate ||
                new Date();

              if (dateField) {
                const date = new Date(dateField);
                if (!isNaN(date.getTime())) {
                  formattedDate = date.toLocaleString("az-AZ", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                }
              }
            } catch (dateError) {
              console.warn(
                "Date formatting error for item:",
                item._id,
                dateError
              );
              formattedDate = "N/A";
            }

            return {
              id: item._id?.toString() || "N/A",
              groupName: item.name || "N/A",
              permissions: readableRole,
              memberCount: String(memberCount),
              createdDate: formattedDate,
              default: Boolean(item.default),
            };
          } catch (itemError) {
            console.error(
              "Error processing permission item:",
              item._id,
              itemError
            );
            // Xəta halında da minimal məlumat qaytar
            return {
              id: item._id?.toString() || "error",
              groupName: item.name || "N/A",
              permissions: "N/A",
              memberCount: "0",
              createdDate: "N/A",
              default: Boolean(item.default),
            };
          }
        })
      );
    } catch (formatError) {
      console.error("Error formatting data:", formatError);
      return res.status(500).json({
        message: "Məlumatlar formatlanarkən xəta baş verdi.",
        success: false,
        error: formatError.message,
      });
    }

    const response = {
      draw: draw || 1,
      recordsTotal: total || 0,
      recordsFiltered: filtered || 0,
      data: formattedData || [],
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("showPermissions main error:", error);
    console.error("Error stack:", error.stack);

    // Təcili halda ən azı boş DataTable response qaytar
    return res.status(200).json({
      draw: req.body.draw || 1,
      recordsTotal: 0,
      recordsFiltered: 0,
      data: [],
      error: {
        message: "Server xətası baş verdi.",
        details: error.message,
      },
    });
  }
};

export const showImtiyaz = async (req, res) => {
  try {
    const {
      start = 0,
      length = 10,
      draw,
      search = "",
      order = [],
      columns = [],
    } = req.body;

    const myUser = await PeopleUser.findById(req.user?.id);

    const sirketId = myUser?.sirket_id;

    if (!sirketId) {
      return res.status(400).json({
        message: "Şirkət ID-si tapılmadı.",
        success: false,
      });
    }

    const existingPerms = await ImtiyazQruplari.find({
      sirket_id: sirketId,
    });

    // Axtarış filteri
    const searchFilter = search
      ? { name: { $regex: search, $options: "i" }, sirket_id: sirketId }
      : { sirket_id: sirketId };

    let total, filtered, data;

    try {
      // changed: RbacPeoplePermission -> ImtiyazQruplari
      total = await ImtiyazQruplari.countDocuments({
        sirket_id: sirketId,
      });

      // changed: RbacPeoplePermission -> ImtiyazQruplari
      filtered = await ImtiyazQruplari.countDocuments(searchFilter);
    } catch (countError) {
      console.error("Error counting permissions:", countError);
      return res.status(500).json({
        message: "Permission sayımında xəta baş verdi.",
        success: false,
        error: countError.message,
      });
    }

    // Sort (order) üçün column tapılır
    let sortOption = { createdAt: -1 }; // default

    if (order.length > 0 && columns.length > 0) {
      const columnIndex = parseInt(order[0].column);
      const columnName = columns[columnIndex]?.data;
      const direction = order[0].dir === "asc" ? 1 : -1;

      // Yalnız icazə verilən sahələrə görə sort et (security üçün)
      const sortableFields = {
        groupName: "name",
        createdDate: "createdAt",
      };

      if (sortableFields[columnName]) {
        sortOption = { [sortableFields[columnName]]: direction };
      }
    }

    try {
      data = await ImtiyazQruplari.find(searchFilter)
        .skip(parseInt(start))
        .limit(parseInt(length))
        .sort(sortOption);
    } catch (findError) {
      console.error("Error finding permissions:", findError);
      return res.status(500).json({
        message: "Permission məlumatları alınarkən xəta baş verdi.",
        success: false,
        error: findError.message,
      });
    }

    let formattedData = [];

    try {
      formattedData = await Promise.all(
        data.map(async (item, index) => {
          try {
            // Qrupdakı üzvlərin sayı (PeopleUser.perm ilə bağlanır)
            let memberCount = 0;
            try {
              memberCount = await PeopleUser.countDocuments({ perm: item._id });
            } catch (memberCountError) {
              console.warn(
                "Error counting members for permission:",
                item._id,
                memberCountError
              );
              memberCount = 0;
            }

            // createdAt sahəsini düzgün şəkildə işlə
            let formattedDate = "N/A";
            try {
              const dateField =
                item.createdAt ||
                item.created_at ||
                item.createdDate ||
                new Date();

              if (dateField) {
                const date = new Date(dateField);
                if (!isNaN(date.getTime())) {
                  formattedDate = date.toLocaleString("az-AZ", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                }
              }
            } catch (dateError) {
              console.warn(
                "Date formatting error for item:",
                item._id,
                dateError
              );
              formattedDate = "N/A";
            }

            return {
              id: item._id?.toString() || "N/A",
              groupName: item.name || "N/A",
              memberCount: String(memberCount),
              createdDate: formattedDate,
            };
          } catch (itemError) {
            console.error(
              "Error processing permission item:",
              item._id,
              itemError
            );
            // Xəta halında da minimal məlumat qaytar
            return {
              id: item._id?.toString() || "error",
              groupName: item.name || "N/A",
              memberCount: "0",
              createdDate: "N/A",
            };
          }
        })
      );
    } catch (formatError) {
      console.error("Error formatting data:", formatError);
      return res.status(500).json({
        message: "Məlumatlar formatlanarkən xəta baş verdi.",
        success: false,
        error: formatError.message,
      });
    }

    const response = {
      draw: draw || 1,
      recordsTotal: total || 0,
      recordsFiltered: filtered || 0,
      data: formattedData || [],
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("showPermissions main error:", error);
    console.error("Error stack:", error.stack);

    // Təcili halda ən azı boş DataTable response qaytar
    return res.status(200).json({
      draw: req.body.draw || 1,
      recordsTotal: 0,
      recordsFiltered: 0,
      data: [],
      error: {
        message: "Server xətası baş verdi.",
        details: error.message,
      },
    });
  }
};

export const addImtiyaz = async (req, res) => {
  try {
    let { name, ids = [] } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Imtiyaz adı tələb olunur' });
    }
    name = name.trim();

    const requester = await PeopleUser.findById(req.user?.id).select('_id sirket_id');
    if(!requester || !requester.sirket_id){
      return res.status(400).json({ success:false, message:'Şirkət məlumatı tapılmadı' });
    }

  const escapeRegex = (s='') => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const isExist = await ImtiyazQruplari.findOne({ name: { $regex: new RegExp(`^${escapeRegex(name)}$`, 'i') }, sirket_id: requester.sirket_id });
    if (isExist) {
      return res.status(400).json({ success: false, message: 'Bu adda imtiyaz qrupu mövcuddur' });
    }

    if(!Array.isArray(ids)) ids = [];
    const uniqueIds = [...new Set(ids.filter(Boolean))];
    const users = await PeopleUser.find({ _id: { $in: uniqueIds } }).select('_id sirket_id');
    for(const u of users){
      if(!u.sirket_id || String(u.sirket_id) !== String(requester.sirket_id)){
        return res.status(400).json({ success:false, message:`İstifadəçi (${u._id}) bu şirkətə aid deyil` });
      }
    }

    const newImtiyazQrup = new ImtiyazQruplari({
      name,
      user_id: requester._id,
      sirket_id: requester.sirket_id,
    });
    await newImtiyazQrup.save();

    if(users.length){
      await PeopleUser.updateMany({ _id: { $in: users.map(u=>u._id) } }, { $set: { imtiyaz: newImtiyazQrup._id } });
    }

  return res.status(201).json({ success:true, message:'İmtiyaz qrupu uğurla əlavə edildi.', data:{ id:newImtiyazQrup._id, name:newImtiyazQrup.name, usersAdded: users.length }});
  } catch (error) {
    console.error('addİmtiyaz error:', error);
  return res.status(500).json({ success:false, message:'Server xətası', details: error.message, stack: process.env.NODE_ENV==='development'?error.stack:undefined });
  }
};

// 1. Permission detallarını almaq üçün (tam edit popup üçün)
export const getPermissionDetails = async (req, res) => {
  try {
    const { permissionId } = req.body;

    if (!permissionId) {
      return res.status(400).json({
        message: "Permission ID tələb olunur.",
        success: false,
      });
    }

    // User-i əldə et və sirket_id-ni tap
    const myUser = await PeopleUser.findById(req.user?.id);
    if (!myUser || !myUser.sirket_id) {
      return res.status(400).json({
        message: "İstifadəçi və ya şirkət ID-si tapılmadı.",
        success: false,
      });
    }

    const sirketId = myUser.sirket_id;

    const permission = await RbacPeoplePermission.findById(permissionId);

    if (!permission) {
      return res.status(404).json({
        message: "Permission tapılmadı.",
        success: false,
      });
    }

    // Şirkət yoxlaması
    if (String(permission.sirket_id) !== String(sirketId)) {
      return res.status(403).json({
        message: "Bu permission-a giriş icazəniz yoxdur.",
        success: false,
      });
    }

    // Bütün sahələri (formda istifadə olunan) qaytar
    return res.status(200).json({
      success: true,
      data: {
        id: permission._id,
        name: permission.name,
        dashboard: permission.dashboard,
        emeliyyatlar: permission.emeliyyatlar,
        hesablasma: permission.hesablasma,
        iscilerin_balansi: permission.iscilerin_balansi,
        e_qaime: permission.e_qaime,
        isciler: permission.isciler,
        avankart_partner: permission.avankart_partner,
        sirket_melumatlari: permission.sirket_melumatlari,
        profil: permission.profil,
        istifadeciler: permission.istifadeciler,
        salahiyyet_qruplari: permission.salahiyyet_qruplari,
        rekvizitler: permission.rekvizitler,
        muqavileler: permission.muqavileler,
        default: permission.default || false,
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

    // User-i əldə et və sirket_id-ni tap
    const myUser = await PeopleUser.findById(req.user?.id);
    if (!myUser || !myUser.sirket_id) {
      return res.status(400).json({
        message: "İstifadəçi və ya şirkət ID-si tapılmadı.",
        success: false,
      });
    }

    const sirketId = myUser.sirket_id;

    const permission = await RbacPeoplePermission.findById(id);

    if (!permission) {
      return res.status(404).json({
        message: "Permission tapılmadı.",
        success: false,
      });
    }

    // Şirkət yoxlaması
    if (String(permission.sirket_id) !== String(sirketId)) {
      return res.status(403).json({
        message: "Bu endpoint yalnız həmin şirkətin permission-larına aiddir.",
        success: false,
      });
    }
    // Ad dublikasiya yoxlaması
    const duplicate = await RbacPeoplePermission.findOne({
      _id: { $ne: id },
      name: { $regex: new RegExp(`^${newName.trim()}$`, "i") },
      sirket_id: sirketId,
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
export const editPermissionFull = async (req, res) => {
  try {
    const { id, name: newName, permissions } = req.body;

    // User-i əldə et və sirket_id-ni tap
    const myUser = await PeopleUser.findById(req.user?.id);
    if (!myUser || !myUser.sirket_id) {
      return res.status(400).json({
        message: "İstifadəçi və ya şirkət ID-si tapılmadı.",
        success: false,
      });
    }

    const sirketId = myUser.sirket_id;

    if (!id || !newName || !newName.trim() || !permissions) {
      return res.status(400).json({
        message: "ID, ad və permission məlumatları tələb olunur.",
        success: false,
      });
    }

    const permission = await RbacPeoplePermission.findById(id);

    if (!permission) {
      return res.status(404).json({
        message: "Permission tapılmadı.",
        success: false,
      });
    }

    // Şirkət yoxlaması
    if (String(permission.sirket_id) !== String(sirketId)) {
      return res.status(403).json({
        message: "Bu permission-a giriş icazəniz yoxdur.",
        success: false,
      });
    }

    // Default permission yoxlaması - default-ları tam edit etmək olmaz
    if (permission.default) {
      return res.status(400).json({
        message: "Default permission-ları tam dəyişmək olmaz.",
        success: false,
      });
    }

    // Ad dublikasiya yoxlaması
    const duplicate = await RbacPeoplePermission.findOne({
      _id: { $ne: id },
      name: { $regex: new RegExp(`^${newName.trim()}$`, "i") },
      sirket_id: sirketId,
    });

    if (duplicate) {
      return res.status(400).json({
        message: "Bu adda permission artıq mövcuddur.",
        success: false,
      });
    }

    // Permission məlumatlarını yenilə
  permission.name = newName.trim();
  permission.dashboard = permissions.dashboard || "none";
  permission.emeliyyatlar = permissions.emeliyyatlar || "none";
  permission.hesablasma = permissions.hesablasma || "none";
  permission.iscilerin_balansi = permissions.iscilerin_balansi || "none";
  permission.e_qaime = permissions.e_qaime || "none";
  permission.isciler = permissions.isciler || "none";
  permission.avankart_partner = permissions.avankart_partner || "none";
  permission.sirket_melumatlari = permissions.sirket_melumatlari || "none";
  permission.profil = permissions.profil || "none";
  permission.istifadeciler = permissions.istifadeciler || "none";
  permission.salahiyyet_qruplari = permissions.salahiyyet_qruplari || "none";
  permission.rekvizitler = permissions.rekvizitler || "none";
  permission.muqavileler = permissions.muqavileler || "none";
    await permission.save();

    return res.status(200).json({
      message: "Permission uğurla yeniləndi.",
      success: true,
    });
  } catch (error) {
    console.error("editPermissionFull error:", error);
    return res.status(500).json({
      message: "Server xətası baş verdi.",
      success: false,
    });
  }
};

// 4. Permission silmək (yalnız default=false olanlar)
export const deletePermission = async (req, res) => {
  try {
    const { permissionId } = req.body;
    const myUser = await PeopleUser.findById(req.user?.id);
    const sirketId = myUser?.sirket_id;

    if (!sirketId) {
      return res.status(400).json({
        message: "Şirkət ID-si tapılmadı.",
        success: false,
      });
    }

    if (!permissionId) {
      return res.status(400).json({
        message: "Permission ID tələb olunur.",
        success: false,
      });
    }

    const permission = await RbacPeoplePermission.findById(permissionId);

    if (!permission) {
      return res.status(404).json({
        message: "Permission tapılmadı.",
        success: false,
      });
    }

    // Şirkət yoxlaması
    if (String(permission.sirket_id) !== String(sirketId)) {
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
    const usersWithThisPermission = await PeopleUser.countDocuments({
      perm: permissionId,
    });

    if (usersWithThisPermission > 0) {
      return res.status(400).json({
        message: `Bu permission-dan ${usersWithThisPermission} istifadəçi istifadə edir. Əvvəl onların permission-ını dəyişin.`,
        success: false,
      });
    }

    await RbacPeoplePermission.findByIdAndDelete(permissionId);

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
