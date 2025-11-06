import mongoose from "mongoose";
import AdminUser from "../../../shared/models/adminUsersModel.js";
import Duty from "../../../shared/models/duties.js";
import Muessise from "../../../shared/models/muessiseModel.js";

/* ----------------------------- Köməkçi util-lər ---------------------------- */

const { Types } = mongoose;

// DB-də PM-xxxxxxxxxx saxlanılır, UI-də ADM-... göstərək
const toDisplayAdminId = (rawId) =>
  rawId ? String(rawId).replace(/^PM-/i, "ADM-") : null;

// Axtarışda ADM- yazılsa DB üçün PM-ə çevirək
const normalizeIdSearch = (s) => String(s || "").replace(/^ADM-/i, "PM-");

// RegExp escape
const escapeRegExp = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Birdən çox açardan array oxu
const readMany = (payload, keys) => {
  const out = [];
  (keys || []).forEach((k) => {
    const v = payload?.[k];
    if (v == null) return;
    if (Array.isArray(v)) out.push(...v);
    else out.push(v);
  });
  return out;
};

const genderAz = { male: "Kişi", female: "Qadın", other: "Digər" };

// Status map (db ↔ az)
const statusToAz = {
  active: "Aktiv",
  deactive: "Deaktiv",
  deleted: "Silinib",
  "pending delete": "Silinmə gözləyir",
};
const statusFromAz = {
  Aktiv: "active",
  Deaktiv: "deactive",
  Silinmişlər: "deleted",
  "Silinmə gözləyir": "pending delete",
};

// Tarix formatı (DD.MM.YYYY)
const formatDate = (d) => {
  if (!d) return "—";
  try {
    const dt = new Date(d);
    const dd = String(dt.getDate()).padStart(2, "0");
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const yyyy = dt.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  } catch {
    return "—";
  }
};

// UI GET istəyi DataTables + JSON.stringify ilə gəlir — rahat parse üçün
function parseIncomingParams(req) {
  if (req.body && Object.keys(req.body || {}).length) return req.body;

  const q = req.query || {};
  const keys = Object.keys(q);

  if (keys.length === 1 && keys[0] && keys[0].trim().startsWith("{")) {
    try {
      return JSON.parse(keys[0]);
    } catch {}
  }

  const draw = Number(q.draw || 1);
  const start = Number(q.start || 0);
  const length = Number(q.length || 3);
  const rawSearch =
    q["search[value]"] ?? (typeof q.search === "string" ? q.search : "") ?? "";

  return { draw, start, length, search: rawSearch, ...q };
}

/* ---------------------------- Helper: Admin tap ---------------------------- */
// :admin_id -> ObjectId / ADM-xxxx / PM-xxxx hər üçünü dəstəklə
async function findAdminByAnyId(admin_id) {
  if (!admin_id) return null;

  // ObjectId?
  if (Types.ObjectId.isValid(String(admin_id))) {
    const byMongo = await AdminUser.findById(admin_id).lean();
    if (byMongo) return byMongo;
  }

  // ADM-xxx -> PM-xxx normallaşdır
  const pm = normalizeIdSearch(String(admin_id).trim());
  const byPm = await AdminUser.findOne({ adminUser_id: pm }).lean();
  if (byPm) return byPm;

  // Son çarə: toplaşmış boşluğa həssas regex (ehtiyat)
  const rx = new RegExp(`^${escapeRegExp(pm)}$`, "i");
  return AdminUser.findOne({ adminUser_id: rx }).lean();
}

/* ---------------------------- Filter builder ---------------------------- */
// UI-dən gələn filterləri mongoose filtərə çevir
async function buildFilter(payload) {
  const filter = {};

  // ---- STATUS ----
  const rawStatus = payload?.status;
  if (!rawStatus || rawStatus === "Hamısı") {
    filter.status = { $ne: "deleted" };
  } else {
    const st =
      statusFromAz[rawStatus] ||
      (String(rawStatus).startsWith("Silinmə") ? "pending delete" : undefined);
    if (st) filter.status = st;
  }

  // ---- FREE SEARCH (DataTables global search) ----
  const s0 =
    (typeof payload?.search === "object" && payload?.search?.value) ||
    payload?.search ||
    payload?.search_text ||
    payload?.["search[value]"] ||
    "";
  if (s0 && String(s0).trim()) {
    const s = String(s0).trim();
    const rx = new RegExp(escapeRegExp(s), "i");
    filter.$or = [
      { name: rx },
      { surname: rx },
      { email: rx },
      { phone: rx },
      { adminUser_id: new RegExp(escapeRegExp(normalizeIdSearch(s)), "i") },
    ];
  }

  // ---- GENDER ----
  const genderVals = readMany(payload, ["cardGender", "gender", "gender[]"]);
  if (genderVals.length) {
    const map = { man: "male", woman: "female" };
    const genders = genderVals.map((g) => map[g] || g).filter(Boolean);
    if (genders.length) filter.gender = { $in: genders };
  }

  // ---- DATE RANGE ----
  const start_date = payload?.start_date;
  const end_date = payload?.end_date;
  if (start_date || end_date) {
    filter.createdAt = {};
    if (start_date) filter.createdAt.$gte = new Date(start_date);
    if (end_date) {
      const end = new Date(end_date);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  // ---- POSITIONS (duty) ----
  const positions = readMany(payload, [
    "positions",
    "positions[]",
    "position_ids",
    "position_ids[]",
  ]);
  if (positions.length) {
    const slugToRegex = {
      "ux-designer": /ux/i,
      "project-manager": /project\s*manager/i,
      cto: /\bcto\b/i,
      "product-owner": /product\s*owner/i,
      developer: /developer|engineer/i,
    };
    const regs = positions
      .map(
        (p) =>
          slugToRegex[p] ||
          new RegExp(escapeRegExp(String(p).replace(/-/g, " ")), "i")
      )
      .filter(Boolean);

    if (regs.length) {
      const duties = await Duty.find({ name: { $in: regs } })
        .select("_id")
        .lean();
      const dutyIds = duties.map((d) => d._id);
      filter.duty = dutyIds.length ? { $in: dutyIds } : { $in: [] };
    }
  }

  // ---- COMPANIES → duty (kəsişmə) ----
  const companys = readMany(payload, [
    "companys",
    "companys[]",
    "company_ids",
    "company_ids[]",
  ]);
  if (companys.length) {
    const regs = companys.map(
      (c) => new RegExp(escapeRegExp(String(c).replace(/-/g, " ")), "i")
    );
    const muessiseler = await Muessise.find({ muessise_name: { $in: regs } })
      .select("_id")
      .lean();
    const muessiseIds = muessiseler.map((m) => m._id);

    let companyDutyIds = [];
    if (muessiseIds.length) {
      const duties = await Duty.find({ muessise_id: { $in: muessiseIds } })
        .select("_id")
        .lean();
      companyDutyIds = duties.map((d) => d._id);
    }

    if (filter.duty && Array.isArray(filter.duty.$in)) {
      // Mövcud duty ilə kəsişmə
      const set = new Set(filter.duty.$in.map((x) => String(x)));
      const inter = companyDutyIds.filter((id) => set.has(String(id)));
      filter.duty = inter.length ? { $in: inter } : { $in: [] };
    } else {
      filter.duty = companyDutyIds.length
        ? { $in: companyDutyIds }
        : { $in: [] };
    }
  }

  // ---- USERS (checkbox-lardan gələnlər) ----
  // `_id` (ObjectId), ADM/PM ID və ya ad/soyad ola bilər
  const usersRaw = readMany(payload, [
    "users",
    "users[]",
    "user_ids",
    "user_ids[]",
  ]).map((x) => String(x).trim());

  if (usersRaw.length) {
    const objIds = usersRaw
      .filter((u) => Types.ObjectId.isValid(u))
      .map((u) => new Types.ObjectId(u));

    const pmIds = usersRaw
      .filter((u) => /^ADM-|^PM-/i.test(u))
      .map((u) => normalizeIdSearch(u));

    const nameTexts = usersRaw.filter(
      (u) => !Types.ObjectId.isValid(u) && !/^ADM-|^PM-/i.test(u)
    );
    const nameRegs = nameTexts.map(
      (t) => new RegExp(escapeRegExp(t.replace(/-/g, " ")), "i")
    );

    const orUsers = [];
    if (objIds.length) orUsers.push({ _id: { $in: objIds } });
    if (pmIds.length) orUsers.push({ adminUser_id: { $in: pmIds } });
    if (nameRegs.length) {
      orUsers.push({ name: { $in: nameRegs } });
      orUsers.push({ surname: { $in: nameRegs } });
    }

    if (orUsers.length) {
      // Digər şərtlərlə AND, istifadəçi seçimi daxilində OR
      filter.$and = [...(filter.$and || []), { $or: orUsers }];
    } else {
      // heç nəyə düşmürsə boş nəticə
      filter._id = { $in: [] };
    }
  }

  return filter;
}

// status-suz (yalnız digər filtr şərtləri) baza filterini çıxarmaq üçün köməkçi:
async function buildFilterWithoutStatus(payload) {
  const clone = { ...(payload || {}) };
  delete clone.status; // status dimension-u çıxarırıq
  // “Hamısı” default olaraq deleted ≠ true olsun
  clone.status = "Hamısı";
  return buildFilter(clone);
}

/* ---------------------------- DataTables API GET ---------------------------- */
/**
 * GET /istifadeci-hovuzu/people/adminPanel/table
 * Cavab:
 *  { draw, recordsTotal, recordsFiltered, data, counters }
 */
export const getAdminTable = async (req, res) => {
  try {
    const payload = parseIncomingParams(req);

    let draw = Number(payload.draw || 1);
    let start = Math.max(Number(payload.start || 0), 0);
    const length = Math.min(Math.max(Number(payload.length || 3), 1), 100);

    // Data üçün filter
    const filter = await buildFilter(payload);

    // Counters üçün: status-suz baza filter (digər filterlər saxlanır)
    const baseFilterNoStatus = await buildFilterWithoutStatus(payload);

    // recordsTotal = baza sayı (silinmişlər çıxılsın, filtre-siz)
    const recordsTotal = await AdminUser.countDocuments({
      status: { $ne: "deleted" },
    });

    // Filtrlənmiş say
    const recordsFiltered = await AdminUser.countDocuments(filter);

    // start filtrdən sonra sıradan düşübsə, 0-a çək
    if (start >= recordsFiltered) start = 0;

    // Data
    const items = await AdminUser.find(filter)
      .select(
        "name surname adminUser_id gender birth_date duty email phone status createdAt email_otp_status sms_otp_status"
      )
      .populate({ path: "duty", select: "name" })
      .sort({ createdAt: -1 })
      .skip(start)
      .limit(length)
      .lean();

    const data = items.map((u) => {
      const fullName = [u.name, u.surname].filter(Boolean).join(" ").trim();
      return {
        name: fullName || "—",
        id: toDisplayAdminId(u.adminUser_id) || "ADM-XXXXXXXXXX",
        gender: genderAz[u.gender] || "—",
        date: formatDate(u.birth_date),
        jobTitle: u?.duty?.name || "—",
        email: u.email || "—",
        phone: u.phone || "—",
        status: statusToAz[u.status] || "—",
        amount: 0,
        _id: u._id,
      };
    });

    // Counters (digər filtrlər saxlanır, yalnız status dəyişir)
    const [
      allCount,
      activeCount,
      deactiveCount,
      pendingDeleteCount,
      deletedCount,
    ] = await Promise.all([
      AdminUser.countDocuments(baseFilterNoStatus),
      AdminUser.countDocuments({ ...baseFilterNoStatus, status: "active" }),
      AdminUser.countDocuments({ ...baseFilterNoStatus, status: "deactive" }),
      AdminUser.countDocuments({
        ...baseFilterNoStatus,
        status: "pending delete",
      }),
      AdminUser.countDocuments({ ...baseFilterNoStatus, status: "deleted" }),
    ]);

    return res.json({
      draw,
      recordsTotal,
      recordsFiltered,
      data,
      counters: {
        all: allCount,
        active: activeCount,
        deactive: deactiveCount,
        pendingDelete: pendingDeleteCount,
        deleted: deletedCount,
      },
    });
  } catch (err) {
    console.error("getAdminTable error:", err);
    return res.status(500).json({
      draw: 1,
      recordsTotal: 0,
      recordsFiltered: 0,
      data: [],
      error: "Admin siyahısı yüklənmədi",
      details: err?.message,
    });
  }
};

/* ----------------------------- Render funksiyaları ----------------------------- */

export const getAdmin = async (req, res) => {
  try {
    return res.render("pages/istifadeci-hovuzu/admin-panel/admin.ejs", {
      error: "",
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    console.error("getAdmin render error:", error);
    return res.status(500).send("Internal Server Error");
  }
};

export const getAdminInside = async (req, res) => {
  try {
    const { admin_id } = req.params;
    return res.render("pages/istifadeci-hovuzu/admin-panel/inside.ejs", {
      error: "",
      csrfToken: req.csrfToken(),
      admin_id
    });
  } catch (error) {
    console.error("getAdminInside render error:", error);
    return res.status(500).send("Internal Server Error");
  }
};

/* ----------------------- HƏRƏKƏTLƏR (3 nöqtə menyusu) ----------------------- */
/**
 * POST /api/hovuz/admin/:admin_id/status
 * body: { action: "activate" | "deactivate" }
 */
export const setAdminStatus = async (req, res) => {
  try {
    const { admin_id } = req.params;
    const action = String(req.body?.action || "").toLowerCase();

    if (!["activate", "deactivate"].includes(action)) {
      return res.status(400).json({ ok: false, error: "Yanlış action." });
    }

    const user = await findAdminByAnyId(admin_id);
    if (!user) {
      return res
        .status(404)
        .json({ ok: false, error: "İstifadəçi tapılmadı." });
    }

    if (user.status === "deleted") {
      return res
        .status(409)
        .json({ ok: false, error: "Silinmiş istifadəçini dəyişmək olmaz." });
    }

    const newStatus = action === "activate" ? "active" : "deactive";
    if (user.status === newStatus) {
      return res.json({
        ok: true,
        message: "Status dəyişməz qaldı.",
        admin_id: toDisplayAdminId(user.adminUser_id),
        status: statusToAz[user.status],
        status_raw: user.status,
      });
    }

    const updated = await AdminUser.findByIdAndUpdate(
      user._id,
      {
        $set: {
          status: newStatus,
          status_changed_at: new Date(),
        },
      },
      { new: true }
    ).lean();

    return res.json({
      ok: true,
      message: "Status yeniləndi.",
      admin_id: toDisplayAdminId(updated.adminUser_id),
      status: statusToAz[updated.status],
      status_raw: updated.status,
    });
  } catch (err) {
    console.error("setAdminStatus error:", err);
    return res.status(500).json({ ok: false, error: "Status yenilənmədi." });
  }
};

/**
 * POST /api/hovuz/admin/:admin_id/request-delete
 * “Silinmə üçün müraciət” → status = "pending delete"
 */
export const requestAdminDelete = async (req, res) => {
  try {
    const { admin_id } = req.params;
    const user = await findAdminByAnyId(admin_id);
    if (!user) {
      return res
        .status(404)
        .json({ ok: false, error: "İstifadəçi tapılmadı." });
    }

    if (user.status === "deleted") {
      return res
        .status(409)
        .json({ ok: false, error: "Artıq silinmiş istifadəçi." });
    }

    if (user.status === "pending delete") {
      return res.json({
        ok: true,
        message: "Artıq ‘Silinmə gözləyir’.",
        admin_id: toDisplayAdminId(user.adminUser_id),
        status: statusToAz[user.status],
        status_raw: user.status,
      });
    }

    const updated = await AdminUser.findByIdAndUpdate(
      user._id,
      {
        $set: {
          status: "pending delete",
          delete_requested_at: new Date(),
        },
      },
      { new: true }
    ).lean();

    return res.json({
      ok: true,
      message: "Silinmə üçün müraciət göndərildi.",
      admin_id: toDisplayAdminId(updated.adminUser_id),
      status: statusToAz[updated.status],
      status_raw: updated.status,
    });
  } catch (err) {
    console.error("requestAdminDelete error:", err);
    return res
      .status(500)
      .json({ ok: false, error: "Silinmə müraciəti göndərilmədi." });
  }
};

/* ------------------------- YENİ: PROFiL MƏLUMATI (JSON) ------------------------- */
/**
 * GET /istifadeci-hovuzu/people/adminPanel/admin/:admin_id/profile
 * Səhifədə soldakı “Şəxsi məlumatlar” blokunu doldurmaq üçün.
 * Cavab:
 *  { ok: true, data: { fullName, adminId, gender, birthDate, jobTitle, email, phone,
 *    membership, registrationDate, registrationDateText, registrationDuration,
 *    status, verification, twoFA, avatarUrl, initials } }
 */
const formatDateTimeHM = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt)) return "—";
  const hh = String(dt.getHours()).padStart(2, "0");
  const mm = String(dt.getMinutes()).padStart(2, "0");
  return `${formatDate(dt)} - ${hh}:${mm}`;
};

const humanizeSince = (from) => {
  if (!from) return "—";
  const start = new Date(from);
  if (isNaN(start)) return "—";
  const diffMs = Date.now() - start.getTime();
  const diffH = Math.max(0, Math.floor(diffMs / 36e5));
  const days = Math.floor(diffH / 24);
  const hours = diffH % 24;
  return `${days} gün, ${hours} saat`;
};

export const getAdminProfile = async (req, res) => {
  try {
    const { admin_id } = req.params;

    const base = await findAdminByAnyId(admin_id);
    if (!base) {
      return res
        .status(404)
        .json({ ok: false, error: "İstifadəçi tapılmadı." });
    }

    // duty və müəssisəni də götürək
    const user = await AdminUser.findById(base._id)
      .populate({
        path: "duty",
        select: "name muessise_id",
        populate: { path: "muessise_id", select: "muessise_name" },
      })
      .lean();

    const fullName = [user?.name, user?.surname]
      .filter(Boolean)
      .join(" ")
      .trim();
    const initials = fullName
      ? fullName
          .split(" ")
          .filter(Boolean)
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "";

    const membership =
      user?.duty?.muessise_id?.muessise_name ||
      user?.company ||
      user?.muessise_name ||
      null;

    const statusAz = statusToAz[user?.status] || "—";
    const verification = !!(
      user?.is_verified ??
      user?.email_verified ??
      user?.sms_verified ??
      false
    );
    const twoFA = !!(
      user?.twofa_enabled ||
      user?.email_otp_status ||
      user?.sms_otp_status
    );

    const data = {
      avatarUrl: user?.avatar_url || null,
      initials,
      fullName: fullName || "—",
      adminId: toDisplayAdminId(user?.adminUser_id) || "—",
      gender: genderAz[user?.gender] || "—",
      birthDate: user?.birth_date ? formatDate(user.birth_date) : "—",
      jobTitle: user?.duty?.name || "—",
      email: user?.email || "—",
      phone: user?.phone || "—",
      membership: membership || "—",
      registrationDate: user?.createdAt || null,
      registrationDateText: user?.createdAt
        ? formatDateTimeHM(user.createdAt)
        : "—",
      registrationDuration: user?.createdAt
        ? humanizeSince(user.createdAt)
        : "—",
      status: statusAz,
      verification, // Doğrulama (True/False)
      twoFA, // 2 addımlı doğrulama
    };

    return res.json({ ok: true, data });
  } catch (err) {
    console.error("getAdminProfile error:", err);
    return res
      .status(500)
      .json({ ok: false, error: "Profil məlumatı yüklənmədi." });
  }
};
