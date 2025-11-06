import mongoose from "mongoose";
import Sirket from "../../shared/models/sirketModel.js";
import Cards from "../../shared/models/cardModel.js";
import Rekvizitler from "../../shared/models/rekvizitlerModel.js";
import RbacPeoplePermission from "../../shared/models/rbacPeopleModel.js";
import argon2 from "argon2";
import nodemailer from "nodemailer";
import PeopleUser from "../../shared/models/peopleUserModel.js";
import TempsirketInfo from "../../shared/model/people/tempSirketInfo.js";
import MuqavilelerModel from "../../shared/model/partner/muqavilelerModel.js";

import fs from "fs";
import path from "path";

const STATUS = { ACTIVE: 0, INACTIVE: 1, DELETED: 2, PENDING_DELETE: 3 };
const statusFromString = (s) =>
  s === "active"
    ? STATUS.ACTIVE
    : s === "inactive"
      ? STATUS.INACTIVE
      : s === "pending-delete"
        ? STATUS.PENDING_DELETE
        : s === "deleted"
          ? STATUS.DELETED
          : undefined;
const statusToString = (n) =>
  n === STATUS.ACTIVE
    ? "active"
    : n === STATUS.INACTIVE
      ? "inactive"
      : n === STATUS.PENDING_DELETE
        ? "pending-delete"
        : n === STATUS.DELETED
          ? "deleted"
          : "unknown";

export const getSirketler = async (req, res) => {
  try {
    console.log("[getSirketler] user =", req.user);
    const cards = await Cards.find();
    return res.render("pages/sirketler/sirketler", {
      error: "",
      cards,
      csrfToken: req.csrfToken(),
    });
  } catch {
    return res.status(500).send("Internal Server Error");
  }
};

export const listTable = async (req, res) => {
  try {
    const {
      draw = 1,
      start = 0,
      length = 10,
      search = {},
      status = "all",
      order = [],
    } = req.body || {};

    const term = (search?.value || "").trim();
    const q = {};
    if (term) {
      q.$or = [
        { sirket_name: { $regex: term, $options: "i" } },
        { sirket_id: { $regex: term, $options: "i" } },
        { email: { $elemMatch: { $regex: term, $options: "i" } } },
        { "authorized_person.name": { $regex: term, $options: "i" } },
      ];
    }

    let sort = { updatedAt: -1 };
    if (Array.isArray(order) && order.length) {
      const dir = order[0].dir === "asc" ? 1 : -1;
      if (order[0].column === 3) sort = { updatedAt: dir };
    }

    const s = statusFromString(status);

    let rows = [];
    let filtered = 0;

    if (s !== undefined) q.company_status = s;

    rows = await Sirket.find(q)
      .sort(sort)
      .skip(Number(start))
      .limit(Number(length))
      .populate({ path: "creator_id", select: "name surname" })
      .lean();

    filtered = await Sirket.countDocuments(q);

    const data = rows.map((c) => ({
      _id: c._id,
      name: c.sirket_name || "",
      company_id: c.sirket_id || "",
      logo: c.profile_image_path || c.profile_image || null,
      commission: c.commission_percentage ?? null,
      email: Array.isArray(c.email) ? c.email[0] || "" : "",
      updated_at: c.updatedAt,
      authorized_person: c.authorized_person?.name || "",
      created_by: c.creator_id
        ? `${c.creator_id.name} ${c.creator_id.surname}`
        : "",
      status: statusToString(c.company_status),
    }));

    const counts = {
      all: await Sirket.countDocuments({}),
      active: await Sirket.countDocuments({ company_status: STATUS.ACTIVE }),
      inactive: await Sirket.countDocuments({
        company_status: STATUS.INACTIVE,
      }),
      deleted: await Sirket.countDocuments({ company_status: STATUS.DELETED }),
      pendingDelete: await Sirket.countDocuments({
        company_status: STATUS.PENDING_DELETE,
      }),
    };

    return res.json({
      draw,
      recordsTotal: filtered,
      recordsFiltered: filtered,
      data,
      counts,
    });
  } catch {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const createAdminPermission = async (sirketId, creatorId) => {
  try {
    const adminPermission = await RbacPeoplePermission.create({
      name: "Admin",
      sirket_id: sirketId,
      dashboard: "full",
      emeliyyatlar: "full",
      hesablasma: "full",
      iscilerin_balansi: "full",
      e_qaime: "full",
      isciler: "full",
      sirket_melumatlari: "full",
      profil: "full",
      istifadeciler: "full",
      salahiyyet_qruplari: "full",
      rekvizitler: "full",
      muqavileler: "full",
      users: [],
      creator: creatorId,
      default: true,
    });

    return adminPermission;
  } catch (error) {
    console.error("[createAdminPermission] error:", error);
    throw error;
  }
};

const generatePassword = (length = 12) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const sendWelcomeEmail = async (to, username, password, debugMode = false) => {
  const subject = "Avankart Şirkət Hesabınız Yaradıldı";
  const text = `
Salam,

Sizin üçün Avankart şirkət hesabı yaradıldı.

Giriş məlumatları:
Username: ${username}
Password: ${password}

Giriş linki: https://company.avankart.com

Təhlükəsizlik üçün ilk girişdən sonra şifrənizi dəyişməyi unutmayın.

Hörmətlə,
Avankart Komandası
  `;

  if (debugMode) {
    console.log("Debug mode - Email content:", { to, username, password });
    return true;
  }

  try {
    const transporter = nodemailer.createTransporter({
      service: "gmail",
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOpts = {
      from: `"Avankart" <${process.env.SMTP_MAIL}>`,
      to,
      subject,
      text,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Avankart Şirkət Hesabınız Yaradıldı</h2>
          <p>Salam,</p>
          <p>Sizin üçün Avankart şirkət hesabı yaradıldı.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Giriş Məlumatları:</h3>
            <p><strong>Username:</strong> ${username}</p>
            <p><strong>Password:</strong> ${password}</p>
          </div>
          
          <p><a href="https://company.avankart.com" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Giriş Et</a></p>
          
          <p><em>Təhlükəsizlik üçün ilk girişdən sonra şifrənizi dəyişməyi unutmayın.</em></p>
          
          <p>Hörmətlə,<br>Avankart Komandası</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOpts);
    return true;
  } catch (error) {
    console.error("Welcome email send error:", error.message);
    return false;
  }
};

export const createCompany = async (req, res) => {
  try {
    const {
      sirket_name,
      email,
      commission_percentage,
      authorized_person_name,
      authorized_person_gender,
      authorized_person_phone,
      authorized_person_phone_suffix,
      sirket_category,
      activity_type,
      description,

      bank_name,
      swift,
      settlement_account,
      bank_code,
      muxbir_hesabi,
      huquqiaddress,
      voen,
    } = req.body || {};

    const {xarici_cover_image,
            daxili_cover_image,
            profile_image} = req.files;

    if (!sirket_name) {
      return res
        .status(400)
        .json({ ok: false, message: "sirket_name is required" });
    }

    let peopleUser = null;
    let generatedPassword = null;

    if (email && authorized_person_name) {
      const existingUser = await PeopleUser.findOne({
        email: email.toLowerCase(),
      });
      // Email check conflict
      if (existingUser) {
        return res.status(409).json({
          ok: false,
          message: "Bu email ünvanı artıq sistemdə mövcuddur",
        });
      }
    }

    const sirket = await Sirket.create({
      sirket_name,
      // TODO: Activity_type popupreadkte den duzgun gelmir, baxmaq lazimdir
      sirket_category: sirket_category || "general",
      activity_type: activity_type || sirket_category || "general",
      commission_percentage: commission_percentage
        ? Number(commission_percentage)
        : 0,
      description: description || undefined,
      address: req.body?.address || undefined,
      profile_image : profile_image[0].filename,
      profile_image_path : profile_image[0].path,
      authorized_person: authorized_person_name
        ? {
          name: authorized_person_name,
          gender: authorized_person_gender || "male",
          phone: authorized_person_phone
            ? Number(authorized_person_phone)
            : undefined,
          phone_suffix: authorized_person_phone_suffix || "+994",
          email: email || undefined,
        }
        : undefined,
      email: email ? (Array.isArray(email) ? email : [email]) : undefined,
      company_status: STATUS.ACTIVE,
      creator_id:
        req.user?._id || req.user?.id || new mongoose.Types.ObjectId(),
    });

    let adminPermission = null;
    try {
      adminPermission = await createAdminPermission(
        sirket._id,
        req.user?._id || req.user?.id || new mongoose.Types.ObjectId()
      );
    } catch (permError) {
      console.error(
        "[createCompany] Admin permission yaradıla bilmədi:",
        permError
      );
    }

    if (email && authorized_person_name) {
      generatedPassword = generatePassword();
      const hashedPassword = await argon2.hash(generatedPassword);

      // Username yarat
      const username =
        email.split("@")[0] ||
        authorized_person_name.toLowerCase().replace(/\s+/g, "");

      try {
        peopleUser = await PeopleUser.create({
          name: authorized_person_name.split(" ")[0] || authorized_person_name,
          surname: authorized_person_name.split(" ").slice(1).join(" ") || "",
          email: email.toLowerCase(),
          username: username,
          password: hashedPassword,
          phone: authorized_person_phone || undefined,
          phone_suffix: authorized_person_phone_suffix
            ? Number(authorized_person_phone_suffix.replace("+", ""))
            : 994,
          gender: authorized_person_gender || "male",
          sirket_id: sirket._id,
          perm: adminPermission ? adminPermission._id : null, // Admin permission-u assign et
          status: 1, // Active
        });

        // Admin permission-a bu user-i əlavə et
        if (adminPermission && peopleUser) {
          adminPermission.users.push(peopleUser._id);
          await adminPermission.save();
        }

        // Email göndər
        try {
          const emailSent = await sendWelcomeEmail(
            email,
            username,
            generatedPassword,
            true
          );

          if (!emailSent) {
            console.warn("[createCompany] Email göndərilə bilmədi:", email);
          }
        } catch (emailError) {
          console.error("[createCompany] Email error:", emailError);
        }
      } catch (userError) {
        console.error(
          "[createCompany] PeopleUser yaradıla bilmədi:",
          userError
        );
      }
    }

    let rekvizit = null;
    if (bank_name || swift || voen || huquqiaddress) {
      rekvizit = await Rekvizitler.create({
        sirket_id: sirket.sirket_id,
        sirket_name: sirket.sirket_name,
        bank_info: {
          bank_name: bank_name || undefined,
          swift: swift || undefined,
          settlement_account: settlement_account || undefined,
          bank_code: bank_code || undefined,
          muxbir_hesabi: muxbir_hesabi || undefined,
        },
        huquqiaddress: huquqiaddress || undefined,
        voen: voen || undefined,
        adder_id:
          req.user?._id || req.user?.id || new mongoose.Types.ObjectId(),
        fromModel: "AdminUser",
      });

      sirket.rekvizitler = rekvizit._id;
      await sirket.save();
    }

    return res.json({
      ok: true,
      sirket_id: String(sirket._id),
      rekvizit_id: rekvizit ? String(rekvizit._id) : null,
      people_user_id: peopleUser ? String(peopleUser._id) : null,
      admin_permission_id: adminPermission ? String(adminPermission._id) : null,
      email_sent: peopleUser ? true : false,
      message: peopleUser
        ? "Şirkət yaradıldı və səlahiyyətli şəxsə admin səlahiyyəti ilə giriş məlumatları göndərildi"
        : "Şirkət yaradıldı",
    });
  } catch (e) {
    console.error("[createCompany] error =", e);

    if (e?.name === "ValidationError") {
      return res.status(400).json({
        ok: false,
        message: e.message,
        fields: Object.keys(e.errors || {}),
      });
    }
    if (e?.code === 11000) {
      return res.status(409).json({
        ok: false,
        message: "Duplicate key error",
        key: e.keyValue,
      });
    }
    return res
      .status(500)
      .json({ ok: false, message: "Internal Server Error" });
  }
};
export const getSirketInside = async (req, res) => {
  try {
    console.log("[getSirketInside] params =", req.params);
    const cards = await Cards.find();
    const { id } = req.params;

    const company = await Sirket.findById(id).lean();
    if (!company) return res.status(404).render("404");

    const companyRekvizits = await Rekvizitler.find({
      sirket_id: company._id
    }).lean();

    const contracts = await MuqavilelerModel.find({ sirket_id: company._id }).lean();

    const newCompany = {
      ...company,
    };

    return res.render("pages/sirketler/inside", {
      csrfToken: req.csrfToken(),
      cards,
      company: newCompany,
      companyRekvizits: companyRekvizits || [],
      contracts: contracts || [],
      pendingPatch: null,
    });
  } catch {
    return res.status(500).send("Internal Server Error");
  }
};

export const getCompanyByIdApi = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Sirket.findById(id).lean();
    if (!company)
      return res.status(404).json({ ok: false, message: "not found" });
    return res.json({ ok: true, company });
  } catch {
    return res
      .status(500)
      .json({ ok: false, message: "Internal Server Error" });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;

    // Get the current company data before updating
    const currentCompany = await Sirket.findById(id);
    if (!currentCompany) {
      return res.status(404).json({ ok: false, message: "Company not found" });
    }

    // Create tempSirketInfo for history/timeline
    const tempSirketInfo = new TempsirketInfo({
      sirket_id: id,
      user_id: req.user?._id || req.user?.id,
      admin_id: req.user?._id || req.user?.id,
      sirket_name: currentCompany.sirket_name,
      sirket_category: currentCompany.sirket_category,
      address: currentCompany.address,
      services: currentCompany.services || [],
      description: currentCompany.description,
      phone: currentCompany.phone || [],
      email: currentCompany.email || [],
      website: currentCompany.website || [],
      social: currentCompany.social || {},
      schedule: currentCompany.schedule || {},
    });

    // Handle photo fields - preserve existing if not provided in body
    if (!req.body.xarici_cover_image && !req.body.xarici_cover_image_path) {
      tempSirketInfo.xarici_cover_image = currentCompany.xarici_cover_image;
      tempSirketInfo.xarici_cover_image_path =
        currentCompany.xarici_cover_image_path;
    } else {
      tempSirketInfo.xarici_cover_image = req.body.xarici_cover_image;
      tempSirketInfo.xarici_cover_image_path = req.body.xarici_cover_image_path;
    }

    if (!req.body.daxili_cover_image && !req.body.daxili_cover_image_path) {
      tempSirketInfo.daxili_cover_image = currentCompany.daxili_cover_image;
      tempSirketInfo.daxili_cover_image_path =
        currentCompany.daxili_cover_image_path;
    } else {
      tempSirketInfo.daxili_cover_image = req.body.daxili_cover_image;
      tempSirketInfo.daxili_cover_image_path = req.body.daxili_cover_image_path;
    }

    if (!req.body.profile_image && !req.body.profile_image_path) {
      tempSirketInfo.profile_image = currentCompany.profile_image;
      tempSirketInfo.profile_image_path = currentCompany.profile_image_path;
    } else {
      tempSirketInfo.profile_image = req.body.profile_image;
      tempSirketInfo.profile_image_path = req.body.profile_image_path;
    }

    // Save tempSirketInfo for history
    await tempSirketInfo.save();

    // Prepare the patch object with all allowed fields except rekvizit and selahiyetli sexs
    const patch = {
      sirket_name: req.body?.sirket_name,
      commission_percentage: req.body?.commission_percentage,
      cashback_percentage: req.body?.cashback_percentage,
      address: req.body?.address,
      description: req.body?.description,
      sirket_category: req.body?.sirket_category,
      activity_type: req.body?.activity_type,
      services: req.body?.services,
      schedule: req.body?.schedule,
      website: req.body?.website
        ? Array.isArray(req.body.website)
          ? req.body.website
          : [req.body.website]
        : undefined,
      email: req.body?.email
        ? Array.isArray(req.body.email)
          ? req.body.email
          : [req.body.email]
        : undefined,
      phone: req.body?.phone,
      social: req.body?.social,
      "authorized_person.name": req.body?.authorized_person_name,
      "authorized_person.gender": req.body?.authorized_person_gender,
      "authorized_person.duty": req.body?.authorized_person_duty,
      "authorized_person.phone_suffix":
        req.body?.authorized_person_phone_suffix,
      "authorized_person.phone": req.body?.authorized_person_phone,
      "authorized_person.email": req.body?.authorized_person_email,
    };

    // Handle photo fields - if not provided in body, don't change existing ones
    if (
      req.body.xarici_cover_image !== undefined ||
      req.body.xarici_cover_image_path !== undefined
    ) {
      patch.xarici_cover_image = req.body.xarici_cover_image;
      patch.xarici_cover_image_path = req.body.xarici_cover_image_path;
    }

    if (
      req.body.daxili_cover_image !== undefined ||
      req.body.daxili_cover_image_path !== undefined
    ) {
      patch.daxili_cover_image = req.body.daxili_cover_image;
      patch.daxili_cover_image_path = req.body.daxili_cover_image_path;
    }

    if (
      req.body.profile_image !== undefined ||
      req.body.profile_image_path !== undefined
    ) {
      patch.profile_image = req.body.profile_image;
      patch.profile_image_path = req.body.profile_image_path;
    }

    // Remove undefined values from patch
    Object.keys(patch).forEach(
      (k) => patch[k] === undefined && delete patch[k]
    );

    // Update the company
    await Sirket.updateOne({ _id: id }, { $set: patch });

    return res.json({ ok: true });
  } catch (error) {
    console.error("[updateCompany] error:", error);
    return res
      .status(500)
      .json({ ok: false, message: "Internal Server Error" });
  }
};

export const updateCompanyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const s = statusFromString(req.body?.status);
    if (![STATUS.ACTIVE, STATUS.INACTIVE].includes(s)) {
      return res.status(400).json({ ok: false, message: "bad status" });
    }
    await Sirket.updateOne({ _id: id }, { $set: { company_status: s } });
    return res.json({ ok: true });
  } catch {
    return res
      .status(500)
      .json({ ok: false, message: "Internal Server Error" });
  }
};

export const requestDelete = async (req, res) => {
  try {
    const { id } = req.params;
    await Sirket.updateOne(
      { _id: id },
      { $set: { company_status: STATUS.PENDING_DELETE } }
    );
    return res.json({ ok: true });
  } catch {
    return res
      .status(500)
      .json({ ok: false, message: "Internal Server Error" });
  }
};

export const getSirketCounts = async (req, res) => {
  try {
    // Use aggregation to count companies by status
    const counts = await Sirket.aggregate([
      {
        $group: {
          _id: "$company_status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Initialize counts object
    const result = {
      all: 0,
      active: 0,
      deactive: 0,
      deleted: 0,
      pending_delete: 0,
    };

    // Map the aggregation results to our status categories
    counts.forEach((item) => {
      const status = item._id;
      const count = item.count;

      result.all += count; // Add to total

      switch (status) {
        case STATUS.ACTIVE:
          result.active = count;
          break;
        case STATUS.INACTIVE:
          result.deactive = count;
          break;
        case STATUS.DELETED:
          result.deleted = count;
          break;
        case STATUS.PENDING_DELETE:
          result.pending_delete = count;
          break;
        default:
          // Handle any unexpected status values
          break;
      }
    });

    return res.json({
      ok: true,
      counts: result,
    });
  } catch (error) {
    console.error("Error fetching sirket counts:", error);
    return res
      .status(500)
      .json({ ok: false, message: "Internal Server Error" });
  }
};

export const createOrEditRekvizit = async (req, res) => {
  const {
    bank_name,
    swift,
    hesablasma,
    huquqi_unvan,
    bank_kodu,
    muxbir_hesabi,
    voen,
    sirket_name,
    coordinates,
    type
  } = req.body;

  if (
    !bank_name ||
    !swift ||
    !hesablasma ||
    !huquqi_unvan ||
    !bank_kodu ||
    !muxbir_hesabi ||
    !voen ||
    !sirket_name
  ) {
    return res.status(400).json({
      success: false,
      message: "Bütün sahələri doldurun"
    });
  }

  if (type === 'create') {
    console.log('Creating new rekvizit...');
    const { sirket_id } = req.body;

    if (!sirket_id) {
      return res.status(400).json({
        success: false,
        message: "Müəssisə ID-si tələb olunur"
      });
    }

    try {
      const sirket = await Sirket.findOne({ _id: sirket_id }).select("sirket_name");
      if (!sirket) return res.status(401).json({
        message: "Şirkət tapılmadı",
        success: false
      });
      // Check if VOEN already exists for this sirket
      if (voen) {
        const existingRekvizit = await Rekvizitler.findOne({
          voen: voen.toString().trim(),
          sirket_id: sirket._id
        });

        if (existingRekvizit) {
          return res.status(400).json({
            success: false,
            message: "Bu VÖEN nömrəsi artıq bu şirkət üçün mövcuddur"
          });
        }
      }

      // Parse coordinates if provided
      let locationPoint = undefined;
      if (coordinates && coordinates.trim()) {
        try {
          const coordArray = coordinates.split(',').map(coord => parseFloat(coord.trim()));
          if (coordArray.length === 2 && !isNaN(coordArray[0]) && !isNaN(coordArray[1])) {
            locationPoint = {
              type: "Point",
              coordinates: [coordArray[1], coordArray[0]] // MongoDB expects [longitude, latitude]
            };
          }
        } catch (error) {
          console.log('Invalid coordinates format:', coordinates);
        }
      }

      const newRekvizit = new Rekvizitler({
        sirket_id,
        // muessise_name: muessise.muessise_name,
        sirket_name,
        bank_info: {
          bank_name: bank_name || '',
          swift: swift || '',
          settlement_account: hesablasma || '',
          bank_code: bank_kodu || '',
          muxbir_hesabi: muxbir_hesabi || '',
        },
        huquqi_unvan: huquqi_unvan || '',
        location_point: locationPoint,
        voen: voen || '',
        adder_id: req.user?._id,
        fromModel: req.user?.role === "admin" ? "AdminUser" : "Muessise"
      });

      // Save the rekvizit to database
      await newRekvizit.save();
      console.log('✅ Rekvizit saved successfully:', newRekvizit._id);

      const rekvizitCount = await Rekvizitler.countDocuments({ _id: sirket._id });

      return res.status(200).json({
        success: true,
        message: "Rekvizit uğurla əlavə edildi",
        csrfToken: req.csrfToken(),
        data: {
          rekvizit: newRekvizit,
          count: rekvizitCount
        }
      });
    } catch (error) {
      console.error('❌ Error creating rekvizit:', error);

      // Handle mongoose validation errors
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: "Məlumat doğrulama xətası",
          details: error.message
        });
      }

      // Handle duplicate key errors
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Bu VÖEN nömrəsi artıq mövcuddur"
        });
      }

      res.status(500).json({ success: false, message: "Server xətası baş verdi" });
    }

  } else if (type === 'edit') {
    console.log('Editing existing rekvizit...');
    const { rekvizit_id } = req.body;
    try {
      console.log('✏️ Editing rekvizit:', rekvizit_id);

      // Find the existing rekvizit
      const existingRekvizit = await Rekvizitler.findById(rekvizit_id);
      if (!existingRekvizit) {
        return res.status(404).json({
          success: false,
          message: "Rekvizit tapılmadı"
        });
      }

      // Check permission - only allow if user is admin or the creator
      if (req.user?.role !== "admin" && existingRekvizit.adder_id?.toString() !== req.user?._id?.toString()) {
        return res.status(403).json({
          success: false,
          message: "Bu rekviziti redaktə etmək səlahiyyətiniz yoxdur"
        });
      }

      // Check if VOEN already exists for another rekvizit (if VOEN is being changed)
      if (voen && voen !== existingRekvizit.voen) {
        const duplicateVoen = await Rekvizitler.findOne({
          voen: voen.toString().trim(),
          sirket_id: existingRekvizit.sirket_id,
          _id: { $ne: rekvizit_id }
        });

        if (duplicateVoen) {
          return res.status(400).json({
            success: false,
            message: "Bu VÖEN nömrəsi artıq mövcuddur"
          });
        }
      }

      // Parse coordinates if provided
      let locationPoint = existingRekvizit.location_point;
      if (coordinates && coordinates.trim()) {
        try {
          const coordArray = coordinates.split(',').map(coord => parseFloat(coord.trim()));
          if (coordArray.length === 2 && !isNaN(coordArray[0]) && !isNaN(coordArray[1])) {
            locationPoint = {
              type: "Point",
              coordinates: [coordArray[1], coordArray[0]] // MongoDB expects [longitude, latitude]
            };
          }
        } catch (error) {
          console.log('Invalid coordinates format:', coordinates);
        }
      }

      // Update the rekvizit
      const updatedRekvizit = await Rekvizitler.findByIdAndUpdate(
        rekvizit_id,
        {
          sirket_name: sirket_name || existingRekvizit.sirket_name,
          bank_info: {
            bank_name: bank_name || existingRekvizit.bank_info.bank_name,
            swift: swift || existingRekvizit.bank_info.swift,
            settlement_account: hesablasma || existingRekvizit.bank_info.settlement_account,
            bank_code: bank_kodu || existingRekvizit.bank_info.bank_code,
            muxbir_hesabi: muxbir_hesabi || existingRekvizit.bank_info.muxbir_hesabi,
          },
          huquqi_unvan: huquqi_unvan || existingRekvizit.huquqi_unvan,
          location_point: locationPoint || existingRekvizit.location_point,
          voen: voen || existingRekvizit.voen,
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      );

      console.log('✅ Rekvizit updated successfully:', updatedRekvizit._id);

      return res.status(200).json({
        success: true,
        message: "Rekvizit uğurla yeniləndi",
        csrfToken: req.csrfToken(),
        data: {
          rekvizit: updatedRekvizit
        }
      });

    } catch (error) {
      console.error('❌ Error updating rekvizit:', error);
      return res.status(500).json({
        success: false,
        message: "Server xətası baş verdi"
      });
    }
  }
};

export const deleteRekvizit = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️ Deleting rekvizit:', id);

    // Find the existing rekvizit
    const existingRekvizit = await Rekvizitler.findById(id);
    if (!existingRekvizit) {
      return res.status(404).json({
        success: false,
        message: "Rekvizit tapılmadı"
      });
    }

    // Check permission - only allow if user is admin or the creator
    if (req.user?.role !== "admin" && existingRekvizit.adder_id?.toString() !== req.user?._id?.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bu rekviziti silmək səlahiyyətiniz yoxdur"
      });
    }

    // Store sirket_id for count calculation
    const sirketId = existingRekvizit.sirket_id;

    // Delete the rekvizit
    await Rekvizitler.deleteOne({ _id: id });
    console.log('✅ Rekvizit deleted successfully:', id);

    // Get updated count
    const rekvizitCount = await Rekvizitler.countDocuments({ sirket_id: sirketId });

    return res.status(200).json({
      success: true,
      message: "Rekvizit uğurla silindi",
      csrfToken: req.csrfToken(),
      data: {
        deletedId: id,
        count: rekvizitCount
      }
    });

  } catch (error) {
    console.error('❌ Error deleting rekvizit:', error);
    return res.status(500).json({
      success: false,
      message: "Server xətası baş verdi"
    });
  }
};

// Upload contract function
export const uploadContract = async (req, res) => {
  try {
    const sirket_id = req.params.sirket_id;

    if (!sirket_id) {
      return res.status(400).json({
        success: false,
        message: "Şirkət ID-si tələb olunur"
      });
    }

    // Check if sirket exists
    const sirket = await Sirket.findOne({ _id: sirket_id });
    if (!sirket) {
      return res.status(404).json({
        success: false,
        message: "Şirkət tapılmadı"
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Fayl yüklənmədi"
      });
    }

    // Create contract record
    const newContract = new MuqavilelerModel({
      fileName: req.file.originalname,
      filePath: req.file.path,
      sirket_id: sirket._id,
      added_user: req.user?._id
    });

    const savedContract = await newContract.save();

    res.status(201).json({
      success: true,
      message: "Müqavilə uğurla yükləndi",
      data: savedContract
    });

  } catch (error) {
    console.error('Contract upload error:', error);
    res.status(500).json({
      success: false,
      message: "Server xətası baş verdi"
    });
  }
};

export const getContracts = async (req, res) => {
  try {
    const sirketId = req.params.sirket_id;
    const {
      draw,
      start = 0,
      length = 10,
      search = "",
      order = [{ column: 0, dir: "desc" }],
      start_date,
      end_date,
    } = req.body;

    let query = {
      sirket_id: sirketId,
    };

    console.log('search: ', search);


    if (search) {
      query.$or = [
        { fileName: { $regex: search, $options: "i" } },
      ];
    }

    if (start_date || end_date) {
      // query.createdAt.$gte = start_date ? new Date(start_date) : new Date(0);
      query.createdAt = {
        $gte: start_date ? new Date(start_date) : undefined,
        $lte: end_date ? new Date(end_date) : undefined,
      };
    }

    console.log("query", query);

    if (!sirketId) {
      return res.status(400).json({
        success: false,
        message: "Şirkət ID-si tələb olunur"
      });
    }

    // Check if sirket exists
    const sirket = await Sirket.findOne({ _id: sirketId });
    if (!sirket) {
      return res.status(404).json({
        success: false,
        message: "Şirkət tapılmadı"
      });
    }

    // Fetch contracts for the sirket
    const contracts = await MuqavilelerModel.find(query)
      .skip(parseInt(start))
      .limit(parseInt(length))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: `${contracts.length} müqavilə tapıldı`,
      data: contracts
    });
  } catch (error) {
    console.error('Error fetching contracts:', error);
    res.status(500).json({
      success: false,
      message: "Server xətası baş verdi"
    });
  }
};

export const downloadContract = async (req, res) => {
  try {
    const { contract_id } = req.params;

    if (!contract_id) {
      return res.status(400).json({
        success: false,
        message: "Müqavilə ID-si tələb olunur"
      });
    }

    // Find the contract
    const contract = await MuqavilelerModel.findById(contract_id);
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: "Müqavilə tapılmadı"
      });
    }

    // Check if file exists
    if (!fs.existsSync(contract.filePath)) {
      return res.status(404).json({
        success: false,
        message: "Müqavilə faylı tapılmadı"
      });
    }

    // Set headers and send the file for download
    res.download(contract.filePath, contract.fileName, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: "Fayl göndərilərkən xəta baş verdi"
          });
        }
      }
    });

  } catch (error) {
    console.error('Error downloading contract:', error);
    res.status(500).json({
      success: false,
      message: "Server xətası baş verdi"
    });
  }
};

export const deleteContract = async (req, res) => {
  try {
    const { contract_id } = req.params;

    if (!contract_id) {
      return res.status(400).json({
        success: false,
        message: "Müqavilə ID-si tələb olunur"
      });
    }

    // Find the contract
    const contract = await MuqavilelerModel.findById(contract_id);
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: "Müqavilə tapılmadı"
      });
    }

    // Check permission - only allow if user is admin or the creator
    if (req.user?.role !== "admin" && contract.added_user?.toString() !== req.user?._id?.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bu müqaviləni silmək səlahiyyətiniz yoxdur"
      });
    }

    // Delete the file from filesystem
    if (fs.existsSync(contract.filePath)) {
      fs.unlinkSync(contract.filePath);
      console.log('🗑️ Deleted contract file:', contract.filePath);
    } else {
      console.log('⚠️ Contract file not found, skipping file deletion:', contract.filePath);
    }

    // Delete the contract record from database
    await MuqavilelerModel.findByIdAndDelete(contract_id);
    console.log('✅ Deleted contract record:', contract_id);

    res.status(200).json({
      success: true,
      message: "Müqavilə uğurla silindi"
    });
  } catch (err) {
    console.error('Error deleting contract:', err);
    res.status(500).json({
      success: false,
      message: "Server xətası baş verdi"
    });
  }
};