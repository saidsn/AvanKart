import AdminUser from "../../../shared/models/adminUsersModel.js";
import Duty from "../../../shared/models/duties.js";
import RbacAdminPermission from "../../../shared/models/rbacAdminPermission.model.js";
import { generateOtp, sendMail } from "../../../shared/utils/otpHandler.js";
import argon2 from "argon2";

function mapStatus(doc) {
  switch (doc.status) {
    case "active":
      return "Aktiv";
    case "deactive":
      return "Deaktiv";
    case "deleted":
      return "Silinib";
    case "pending delete":
      return "Gözləyir";
    default:
      return doc.status || "Naməlum";
  }
}

export const getAvankartUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page || "1");
    const limit = parseInt(req.query.limit || "10");
    const skip = (page - 1) * limit;
    const search = (req.query.search || "").trim();

    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const users = req.query.users ? req.query.users.split(",") : [];
    const genders = req.query.genders ? req.query.genders.split(",") : [];
    const statuses = req.query.statuses ? req.query.statuses.split(",") : [];
    const duties = req.query.duties ? req.query.duties.split(",") : [];
    const permissions = req.query.permissions
      ? req.query.permissions.split(",")
      : [];

    const query = {
      deletedAt: { $exists: false },
    };

    // Status filter - if not specified, show only active users (default behavior)
    if (statuses.length > 0) {
      const statusConditions = [];
      if (statuses.includes("active")) {
        statusConditions.push(
          { status: { $ne: "deactive" } },
          { status: { $exists: false } }
        );
      }
      if (statuses.includes("inactive")) {
        statusConditions.push({ status: "deactive" });
      }
      if (statusConditions.length > 0) {
        query.$or = statusConditions;
      }
    } else {
      // Default: only show active users
      query.$and = [
        {
          $or: [
            { status: { $ne: "deactive" } },
            { status: { $exists: false } },
          ],
        },
      ];
    }

    if (search) {
      if (!query.$and) query.$and = [];
      query.$and.push({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { surname: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ],
      });
    }

    if (users.length > 0) {
      query._id = { $in: users };
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    if (genders.length > 0) {
      query.gender = { $in: genders };
    }

    if (duties.length > 0) {
      query.duty = { $in: duties };
    }

    if (permissions.length > 0) {
      query.permission_group = { $in: permissions };
    }

    const [items, total] = await Promise.all([
      AdminUser.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select(
          "adminUser_id name surname gender duty permission_group email phone phone_suffix createdAt status profile_image profile_image_url"
        )
        .populate({ path: "duty", select: "name" })
        .populate({ path: "permission_group", select: "name" })
        .lean(),
      AdminUser.countDocuments(query),
    ]);

    const data = items.map((u) => ({
      _id: u._id, // MongoDB _id for filtering
      id: u.adminUser_id,
      fullName: [u.name, u.surname].filter(Boolean).join(" "),
      initials: [u.name?.[0], u.surname?.[0]]
        .filter(Boolean)
        .join("")
        .toUpperCase(),
      gender:
        u.gender === "male"
          ? "Kişi"
          : u.gender === "female"
            ? "Qadın"
            : "Digər",
      position:
        u.duty && typeof u.duty === "object"
          ? u.duty.name || "-"
          : u.duty
            ? "(tapılmadı)"
            : "-",
      authorityGroup:
        u.permission_group && typeof u.permission_group === "object"
          ? u.permission_group.name || "-"
          : "-",
      email: u.email || "-",
      phone:
        (u.phone_suffix ? "+" + u.phone_suffix + " " : "") + (u.phone || ""),
      startDate: u.createdAt
        ? new Date(u.createdAt).toLocaleDateString("az-Latn-AZ")
        : "-",
      status: mapStatus(u),
      avatar: u.profile_image_url || null,
      dutyId: typeof u.duty === "object" ? u.duty?._id : u.duty || null, // debug purpose
    }));

    return res.json({
      success: true,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      data,
    });
  } catch (e) {
    console.error("getAvankartUsers error:", e);
    return res.status(500).json({ success: false, message: "Server xətası" });
  }
};

export const getAvankartUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await AdminUser.findOne({ adminUser_id: id })
      .populate({ path: "duty", select: "name" })
      .populate({ path: "permission_group", select: "name" })
      .lean();
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "İstifadəçi tapılmadı" });

    return res.json({
      success: true,
      data: {
        id: user.adminUser_id,
        name: user.name || "",
        surname: user.surname || "",
        fullName: [user.name, user.surname].filter(Boolean).join(" "),
        gender: user.gender,
        email: user.email,
        phone_suffix: user.phone_suffix || "",
        phone: user.phone || "",
        duty: user.duty ? { id: user.duty._id, name: user.duty.name } : null,
        permission_group: user.permission_group
          ? { id: user.permission_group._id, name: user.permission_group.name }
          : null,
        status: user.status,
      },
    });
  } catch (e) {
    console.error("getAvankartUser error:", e);
    return res.status(500).json({ success: false, message: "Server xətası" });
  }
};

export const updateAvankartUser = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const user = await AdminUser.findOne({ adminUser_id: id });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "İstifadəçi tapılmadı" });

    const allowed = [
      "name",
      "surname",
      "gender",
      "email",
      "phone_suffix",
      "phone",
      "duty",
      "permission_group",
    ];

    const genderEnum = ["male", "female", "other"];

    for (const key of allowed) {
      if (body[key] === undefined) continue;
      if (key === "gender" && body.gender && !genderEnum.includes(body.gender))
        continue;
      user[key] = body[key];
    }

    if (body.email) {
      const exists = await AdminUser.findOne({
        email: body.email,
        _id: { $ne: user._id },
      });
      if (exists)
        return res
          .status(409)
          .json({ success: false, message: "Email artıq mövcuddur" });
    }
    if (body.phone) {
      const existsP = await AdminUser.findOne({
        phone: body.phone,
        _id: { $ne: user._id },
      });
      if (existsP)
        return res
          .status(409)
          .json({ success: false, message: "Telefon artıq mövcuddur" });
    }

    await user.save();
    return res.json({ success: true, message: "Yeniləndi" });
  } catch (e) {
    console.error("updateAvankartUser error:", e);
    return res.status(500).json({ success: false, message: "Server xətası" });
  }
};

export const deleteAvankartUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await AdminUser.findOne({ adminUser_id: id });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "İstifadəçi tapılmadı" });

    user.status = "deactive";
    user.deletedAt = new Date();
    await user.save();

    return res.json({
      success: true,
      message: "İstifadəçi hovuzdan çıxarıldı",
    });
  } catch (e) {
    console.error("deleteAvankartUser error:", e);
    return res.status(500).json({ success: false, message: "Server xətası" });
  }
};

export const listDuties = async (_req, res) => {
  try {
    const duties = await Duty.find({ deleted: { $ne: true } })
      .select("name")
      .sort({ name: 1 })
      .lean();
    return res.json({
      success: true,
      data: duties.map((d) => ({ id: d._id, name: d.name })),
    });
  } catch (e) {
    console.error("listDuties error:", e);
    return res.status(500).json({ success: false, message: "Server xətası" });
  }
};

export const getDutiesTable = async (req, res) => {
  try {
    const page = parseInt(req.query.page || "1");
    const limit = parseInt(req.query.limit || "10");
    const skip = (page - 1) * limit;
    const search = (req.query.search || "").trim();

    const query = { deleted: { $ne: true } };
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const [duties, total] = await Promise.all([
      Duty.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .populate({ path: "creator_id", select: "name surname" })
        .lean(),
      Duty.countDocuments(query),
    ]);

    const data = await Promise.all(
      duties.map(async (duty) => {
        const userCount = await AdminUser.countDocuments({
          duty: duty._id,
          deletedAt: { $exists: false },
        });

        let createdBy = "-";
        if (duty.creator_id) {
          if (duty.creator_id.name || duty.creator_id.surname) {
            createdBy = [duty.creator_id.name, duty.creator_id.surname]
              .filter(Boolean)
              .join(" ");
          }
        }

        const createdDate = duty.created_at
          ? new Date(duty.created_at).toLocaleString("az-Latn-AZ", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "-";

        return {
          id: duty._id,
          name: duty.name,
          userCount: userCount,
          createdBy: createdBy,
          createdDate: createdDate,
        };
      })
    );

    return res.json({
      success: true,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      data,
    });
  } catch (e) {
    console.error("getDutiesTable error:", e);
    return res.status(500).json({ success: false, message: "Server xətası" });
  }
};

export const listAdminPermissionGroups = async (_req, res) => {
  try {
    const groups = await RbacAdminPermission.find({ deleted: { $ne: true } })
      .select("name")
      .sort({ createdAt: -1 })
      .lean();
    return res.json({
      success: true,
      data: groups.map((g) => ({ id: g._id, name: g.name })),
    });
  } catch (e) {
    console.error("listAdminPermissionGroups error:", e);
    return res.status(500).json({ success: false, message: "Server xətası" });
  }
};

export const getPermissionTypes = async (_req, res) => {
  try {
    const groups = await RbacAdminPermission.find({
      deleted: { $ne: true },
    }).lean();

    const typesSet = new Set();

    groups.forEach((group) => {
      const permissions = [];
      if (group.dashboard === "full") permissions.push("Dashboard");
      if (group.users_module === "full") permissions.push("İstifadəçilər");
      if (group.duties_module === "full") permissions.push("Vəzifələr");
      if (
        group.transactions_module === "full" ||
        group.transactions_module === "read"
      )
        permissions.push("Əməliyyatlar");
      if (
        group.notifications_module === "full" ||
        group.notifications_module === "read"
      )
        permissions.push("Bildirişlər");
      if (group.settings_module === "full" || group.settings_module === "read")
        permissions.push("Tənzimləmələr");

      const permissionText =
        permissions.length === 0
          ? "Məhdud"
          : permissions.length >= 5
            ? "Tam İdarə"
            : permissions.slice(0, 2).join(", ") +
              (permissions.length > 2 ? "..." : "");

      typesSet.add(permissionText);
    });

    const types = Array.from(typesSet).map((text) => {
      let value = "limited";
      if (text === "Tam İdarə") value = "full";
      else if (text === "Məhdud") value = "limited";
      else value = "partial";

      return { value, text };
    });

    return res.json({
      success: true,
      data: types,
    });
  } catch (e) {
    console.error("getPermissionTypes error:", e);
    return res.status(500).json({ success: false, message: "Server xətası" });
  }
};

export const getAdminPermissionGroupsTable = async (req, res) => {
  try {
    const page = parseInt(req.query.page || "1");
    const limit = parseInt(req.query.limit || "10");
    const skip = (page - 1) * limit;
    const search = (req.query.search || "").trim();

    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const minUsers = req.query.minUsers ? parseInt(req.query.minUsers) : null;
    const maxUsers = req.query.maxUsers ? parseInt(req.query.maxUsers) : null;
    const types = req.query.types ? req.query.types.split(",") : [];

    const query = { deleted: { $ne: true } };

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const [groups, total] = await Promise.all([
      RbacAdminPermission.find(query).sort({ createdAt: -1 }).lean(),
      RbacAdminPermission.countDocuments(query),
    ]);

    let data = await Promise.all(
      groups.map(async (group) => {
        const userCount = await AdminUser.countDocuments({
          permission_group: group._id,
          deletedAt: { $exists: false },
        });

        const permissions = [];
        if (group.dashboard === "full") permissions.push("Dashboard");
        if (group.users_module === "full") permissions.push("İstifadəçilər");
        if (group.duties_module === "full") permissions.push("Vəzifələr");
        if (
          group.transactions_module === "full" ||
          group.transactions_module === "read"
        )
          permissions.push("Əməliyyatlar");
        if (
          group.notifications_module === "full" ||
          group.notifications_module === "read"
        )
          permissions.push("Bildirişlər");
        if (
          group.settings_module === "full" ||
          group.settings_module === "read"
        )
          permissions.push("Tənzimləmələr");

        const permissionText =
          permissions.length === 0
            ? "Məhdud"
            : permissions.length >= 5
              ? "Tam İdarə"
              : permissions.slice(0, 2).join(", ") +
                (permissions.length > 2 ? "..." : "");

        const permissionType =
          permissions.length === 0
            ? "limited"
            : permissions.length >= 5
              ? "full"
              : "partial";

        return {
          id: group._id,
          name: group.name,
          permissions: permissionText,
          permissionType: permissionType,
          userCount: userCount,
          createdDate: group.createdAt
            ? new Date(group.createdAt).toLocaleString("az-Latn-AZ", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-",
        };
      })
    );

    if (minUsers !== null || maxUsers !== null) {
      data = data.filter((item) => {
        if (minUsers !== null && item.userCount < minUsers) return false;
        if (maxUsers !== null && item.userCount > maxUsers) return false;
        return true;
      });
    }

    if (types.length > 0) {
      data = data.filter((item) => types.includes(item.permissionType));
    }

    const totalFiltered = data.length;
    const paginatedData = data.slice(skip, skip + limit);

    return res.json({
      success: true,
      page,
      limit,
      total: totalFiltered,
      pages: Math.ceil(totalFiltered / limit),
      data: paginatedData,
    });
  } catch (e) {
    console.error("getAdminPermissionGroupsTable error:", e);
    return res.status(500).json({ success: false, message: "Server xətası" });
  }
};

function maskEmail(email) {
  if (!email || !email.includes("@")) return email;
  const [local, domain] = email.split("@");
  if (local.length <= 2) return local[0] + "***@" + domain;
  return local.slice(0, 2) + "***@" + domain;
}

export const createAvankartUser = async (req, res) => {
  try {
    const {
      name,
      surname,
      gender,
      email,
      phone_suffix,
      phone,
      duty,
      permission_group,
    } = req.body || {};

    if (!gender || !["male", "female", "other"].includes(gender)) {
      return res
        .status(400)
        .json({ success: false, message: "Gender yanlışdır" });
    }
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email tələb olunur" });
    }
    if (!phone) {
      return res
        .status(400)
        .json({ success: false, message: "Telefon tələb olunur" });
    }

    const existingEmail = await AdminUser.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email artıq mövcuddur",
        code: "EMAIL_IN_USE",
      });
    }
    const existingPhone = await AdminUser.findOne({ phone });
    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: "Telefon artıq mövcuddur",
        code: "PHONE_IN_USE",
      });
    }

    if (duty) {
      const dutyExists = await Duty.findById(duty).select("_id").lean();
      if (!dutyExists)
        return res
          .status(400)
          .json({ success: false, message: "Vəzifə tapılmadı" });
    }
    if (permission_group) {
      const pgExists = await RbacAdminPermission.findById(permission_group)
        .select("_id")
        .lean();
      if (!pgExists)
        return res
          .status(400)
          .json({ success: false, message: "Səlahiyyət qrupu tapılmadı" });
    }

    const tempPasswordPlain = Math.random().toString(36).slice(-12) + "!A1";
    const hashed = await argon2.hash(tempPasswordPlain);
    const otp = generateOtp(6);

    const user = await AdminUser.create({
      name: name || "",
      surname: surname || "",
      gender,
      email,
      phone_suffix: phone_suffix ? Number(phone_suffix) : undefined,
      phone,
      duty: duty || undefined,
      permission_group: permission_group || undefined,
      password: hashed,
      otp_code: otp,
      email_otp_status: false,
      last_otp_date: new Date(),
      status: "active",
    });

    const debugEmail = process.env.DEBUG_EMAIL === "1";
    const mailOk = await sendMail(email, otp, debugEmail);
    if (!mailOk) {
    }

    return res.status(201).json({
      success: true,
      userId: user.adminUser_id,
      email,
      maskedEmail: maskEmail(email),
      mailSent: mailOk,
      debugEmailMode: debugEmail,
      message: mailOk ? "OTP göndərildi" : "OTP email göndərilə bilmədi",
      otpExpiresIn: 300,
      resendDelay: 60,
    });
  } catch (e) {
    console.error("createAvankartUser error:", e);
    return res.status(500).json({ success: false, message: "Server xətası" });
  }
};

export const verifyAvankartUserOtp = async (req, res) => {
  try {
    const { id } = req.params;
    const { otp } = req.body || {};
    if (!otp)
      return res
        .status(400)
        .json({ success: false, message: "OTP tələb olunur" });

    const user = await AdminUser.findOne({ adminUser_id: id });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "İstifadəçi tapılmadı" });
    if (user.email_otp_status)
      return res.status(409).json({
        success: false,
        message: "Artıq təsdiqlənib",
        code: "ALREADY_VERIFIED",
      });
    if (!user.otp_code)
      return res.status(410).json({
        success: false,
        message: "OTP mövcud deyil",
        code: "OTP_MISSING",
      });

    const createdMs = user.last_otp_date ? user.last_otp_date.getTime() : 0;
    const ageSec = (Date.now() - createdMs) / 1000;
    if (ageSec > 300) {
      return res.status(410).json({
        success: false,
        message: "OTP vaxtı bitib",
        code: "OTP_EXPIRED",
      });
    }

    if (otp !== user.otp_code) {
      return res
        .status(400)
        .json({ success: false, message: "OTP səhvdir", code: "INVALID_OTP" });
    }

    user.email_otp_status = true;
    user.otp_code = null;
    await user.save();
    return res.json({
      success: true,
      message: "OTP təsdiqləndi",
      status: "verified",
    });
  } catch (e) {
    console.error("verifyAvankartUserOtp error:", e);
    return res.status(500).json({ success: false, message: "Server xətası" });
  }
};

export const resendAvankartUserOtp = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await AdminUser.findOne({ adminUser_id: id });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "İstifadəçi tapılmadı" });
    if (user.email_otp_status)
      return res.status(409).json({
        success: false,
        message: "Artıq təsdiqlənib",
        code: "ALREADY_VERIFIED",
      });

    const now = Date.now();
    const last = user.last_otp_date ? user.last_otp_date.getTime() : 0;
    const diffSec = (now - last) / 1000;
    if (diffSec < 60) {
      return res.status(429).json({
        success: false,
        message: "Çox tezdir",
        code: "RESEND_TOO_SOON",
        retryAfter: Math.ceil(60 - diffSec),
      });
    }

    const otp = generateOtp(6);
    user.otp_code = otp;
    user.last_otp_date = new Date();
    await user.save();

    const mailOk = await sendMail(user.email, otp, false);

    return res.json({
      success: true,
      message: "Yeni OTP göndərildi",
      resendDelay: 60,
    });
  } catch (e) {
    console.error("resendAvankartUserOtp error:", e);
    return res.status(500).json({ success: false, message: "Server xətası" });
  }
};
