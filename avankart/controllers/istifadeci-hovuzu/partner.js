import AdminUser from "../../../shared/models/adminUsersModel.js";
import PartnerUser from "../../../shared/models/partnyorUserModel.js";
import OtpModel from "../../../shared/models/otp.js";
import TempPartnerUserDelete from "../../../shared/model/partner/tempPartnerUserDelete.js";
import QrCode from "../../../shared/models/qrCodeModel.js";
import OldMuessiseUsers from "../../../shared/model/partner/oldMuessiseUsers.js";
import TransactionsUser from "../../../shared/models/transactionsModel.js";
import Card from "../../../shared/models/cardModel.js";
import { Muessise } from "../../../shared/models/muessiseModel.js";
import DeleteRequest from "../../../shared/models/deleteRequestModel.js";
import { generateOtp, sendMail } from "../../../shared/utils/otpHandler.js";
import Ticket from "../../../shared/model/partner/ticket.js";
import SorgularReason from "../../../shared/model/partner/sorgularReason.js";
import TicketFile from "../../../shared/model/partner/ticketFile.js";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// import Duties from "../../../shared/models/duties.js";

// Helper function to sanitize file paths (replace backslashes with forward slashes)
const sanitizeFilePath = (path) => {
  return path ? path.replace(/\\/g, "/") : path;
};

// Helper function to check if partner has a pending delete request
async function getHasDeleteRequestByPartnyorId(partnyorId) {
  const partner = await PartnerUser.findOne({ partnyor_id: partnyorId }).select(
    "_id"
  );
  if (!partner) return false;
  return !!(await DeleteRequest.exists({
    user: partner._id,
    status: "waiting",
  }));
}

export const getPartner = async (req, res) => {
  try {
    return res.render("pages/istifadeci-hovuzu/partner/partner.ejs", {
      error: "",
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    console.error("delete-ticket error:", error);
    return res.status(500).send("Internal Server Error");
  }
};

export const getPartnerData = async (req, res) => {
  try {
    const requestBody =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const {
      draw,
      start = 0,
      length = 10,
      search = {},
      status,
      muessise_filter,
      gender_filter,
    } = requestBody;
    const searchValue = search.value || "";
    const currentUserId = req.user.id;

    // Build search query
    let query = {
      _id: { $ne: currentUserId },
    };

    // Handle status filtering
    let isDeletedQuery = false;
    if (status && status !== "Hamısı") {
      switch (status) {
        case "Aktiv":
          query.status = 1;
          break;
        case "Deaktiv":
          query.status = 0;
          break;
        case "Silinmişlər":
          isDeletedQuery = true; // Flag to use special deleted query methods
          break;
        case "Silinmə": // Handle "Silinmə gözləyir" - frontend sends "Silinmə" as first word
          // case 'Gözləyir':
          query.status = 2;
          break;
      }
    }

    // Handle muessise filter (can be array or single value)
    if (
      muessise_filter &&
      muessise_filter !== "" &&
      muessise_filter !== "all"
    ) {
      if (Array.isArray(muessise_filter) && muessise_filter.length > 0) {
        // Multiple muessise selection
        query.muessise_id = { $in: muessise_filter };
      } else if (typeof muessise_filter === "string") {
        // Single muessise selection
        query.muessise_id = muessise_filter;
      }
    }

    // Handle gender filter
    if (gender_filter && gender_filter !== "" && gender_filter !== "all") {
      query.gender = gender_filter;
    }

    console.log("query: ", query);

    // Enhanced search functionality
    let useAggregation = false;
    let aggregationPipeline = [];

    if (searchValue) {
      // Check if we need to search in muessise name
      const muessiseNameSearch = {
        "muessise_lookup.muessise_name": { $regex: searchValue, $options: "i" },
      };

      // Create basic search conditions for user fields
      const userSearchConditions = [
        { name: { $regex: searchValue, $options: "i" } },
        { surname: { $regex: searchValue, $options: "i" } },
        { email: { $regex: searchValue, $options: "i" } },
        { phone: { $regex: searchValue, $options: "i" } },
        { partnyor_id: { $regex: searchValue, $options: "i" } },
      ];

      // Use aggregation to include muessise name search
      useAggregation = true;

      // Build aggregation pipeline
      aggregationPipeline = [
        // Match the base query first
        { $match: query },
        // Lookup muessise data
        {
          $lookup: {
            from: "muessises",
            localField: "muessise_id",
            foreignField: "_id",
            as: "muessise_lookup",
          },
        },
        // Unwind the muessise array (it will be empty if no match)
        {
          $unwind: {
            path: "$muessise_lookup",
            preserveNullAndEmptyArrays: true,
          },
        },
        // Search in user fields OR muessise name
        {
          $match: {
            $or: [...userSearchConditions, muessiseNameSearch],
          },
        },
      ];
    } else {
      // If no search, don't add $or to the query
      // Remove $or property if it exists to avoid cast errors
      if (query.$or !== undefined) {
        delete query.$or;
      }
    }

    // Get total count for pagination (excluding current user)
    let totalRecords, filteredRecords, partners;

    if (isDeletedQuery) {
      // Handle deleted users
      const deletedBaseQuery = { deleted: true, _id: { $ne: currentUserId } };

      if (useAggregation) {
        // For deleted users with search, use aggregation
        const deletedAggregationPipeline = [
          { $match: deletedBaseQuery },
          ...aggregationPipeline.slice(1), // Skip the first $match as we already have it
        ];

        // Add additional filters for deleted query
        if (
          muessise_filter &&
          muessise_filter !== "" &&
          muessise_filter !== "all"
        ) {
          deletedAggregationPipeline.splice(1, 0, {
            $match: { muessise_id: muessise_filter },
          });
        }
        if (gender_filter && gender_filter !== "" && gender_filter !== "all") {
          deletedAggregationPipeline.splice(1, 0, {
            $match: { gender: gender_filter },
          });
        }

        try {
          // Count total deleted records
          totalRecords = await PartnerUser.countDeleted({
            _id: { $ne: currentUserId },
          });

          // Get filtered results with aggregation
          const aggregatedResults = await PartnerUser.aggregate([
            ...deletedAggregationPipeline,
            { $sort: { createdAt: -1 } },
            { $skip: parseInt(start) },
            { $limit: parseInt(length) },
          ]);

          // Count filtered results
          const countResults = await PartnerUser.aggregate([
            ...deletedAggregationPipeline,
            { $count: "total" },
          ]);
          filteredRecords = countResults[0]?.total || 0;

          // Populate the aggregated results
          partners = await PartnerUser.populate(aggregatedResults, [
            { path: "duty", select: "name" },
            { path: "muessise_id", select: "muessise_name" },
          ]);
        } catch (error) {
          console.log(
            "Aggregation failed for deleted users, using fallback:",
            error.message
          );
          // Fallback to simple query
          totalRecords = await PartnerUser.countDeleted({
            _id: { $ne: currentUserId },
          });
          filteredRecords = await PartnerUser.countDeleted(query);
          partners = await PartnerUser.findDeleted(query)
            .populate("duty", "name")
            .populate("muessise_id", "muessise_name")
            .sort({ createdAt: -1 })
            .skip(parseInt(start))
            .limit(parseInt(length));
        }
      } else {
        // Simple deleted user query without search
        const deletedQuery = { ...query, deleted: true };

        try {
          totalRecords = await PartnerUser.countDeleted({
            _id: { $ne: currentUserId },
          });
          filteredRecords = await PartnerUser.countDeleted(query);
          partners = await PartnerUser.findDeleted(query)
            .populate("duty", "name")
            .populate("muessise_id", "muessise_name")
            .sort({ createdAt: -1 })
            .skip(parseInt(start))
            .limit(parseInt(length));
        } catch (pluginError) {
          console.log(
            "Plugin methods failed, using manual approach:",
            pluginError.message
          );
          totalRecords = await PartnerUser.collection.countDocuments({
            deleted: true,
            _id: { $ne: currentUserId },
          });
          filteredRecords =
            await PartnerUser.collection.countDocuments(deletedQuery);

          const partnerDocs = await PartnerUser.collection
            .find(deletedQuery)
            .sort({ createdAt: -1 })
            .skip(parseInt(start))
            .limit(parseInt(length))
            .toArray();

          partners = await PartnerUser.populate(partnerDocs, [
            { path: "duty", select: "name" },
            { path: "muessise_id", select: "muessise_name" },
          ]);
        }
      }
    } else {
      // Handle non-deleted users
      if (useAggregation) {
        // Use aggregation for complex search including muessise name
        try {
          // Count total non-deleted records
          totalRecords = await PartnerUser.countDocuments({
            _id: { $ne: currentUserId },
          });

          // Get filtered results with aggregation
          const aggregatedResults = await PartnerUser.aggregate([
            ...aggregationPipeline,
            { $sort: { createdAt: -1 } },
            { $skip: parseInt(start) },
            { $limit: parseInt(length) },
          ]);

          // Count filtered results
          const countResults = await PartnerUser.aggregate([
            ...aggregationPipeline,
            { $count: "total" },
          ]);
          filteredRecords = countResults[0]?.total || 0;

          // Populate the aggregated results
          partners = await PartnerUser.populate(aggregatedResults, [
            { path: "duty", select: "name" },
            { path: "muessise_id", select: "muessise_name" },
          ]);
        } catch (error) {
          console.log("Aggregation failed, using simple query:", error.message);
          // Fallback to simple query
          if (searchValue) {
            query.$or = [
              { name: { $regex: searchValue, $options: "i" } },
              { surname: { $regex: searchValue, $options: "i" } },
              { email: { $regex: searchValue, $options: "i" } },
              { phone: { $regex: searchValue, $options: "i" } },
              { partnyor_id: { $regex: searchValue, $options: "i" } },
            ];
          }
          totalRecords = await PartnerUser.countDocuments({
            _id: { $ne: currentUserId },
          });
          filteredRecords = await PartnerUser.countDocuments(query);
          partners = await PartnerUser.find(query)
            .populate("duty", "name")
            .populate("muessise_id", "muessise_name")
            .sort({ createdAt: -1 })
            .skip(parseInt(start))
            .limit(parseInt(length));
        }
      } else {
        // Simple query without complex search
        totalRecords = await PartnerUser.countDocuments({
          _id: { $ne: currentUserId },
        });
        filteredRecords = await PartnerUser.countDocuments(query);
        partners = await PartnerUser.find(query)
          .populate("duty", "name")
          .populate("muessise_id", "muessise_name")
          .sort({ createdAt: -1 })
          .skip(parseInt(start))
          .limit(parseInt(length));
      }
    }

    // Format data for DataTable
    const formattedData = await Promise.all(
      partners.map(async (partner) => {
        const fullName =
          `${partner.name || ""} ${partner.surname || ""}`.trim();
        const birthDate = partner.birth_date
          ? new Date(partner.birth_date).toLocaleDateString("az-AZ")
          : null;

        let statusText = "";
        let statusColor = "";

        // Check if this is a deleted user first
        if (partner.deleted) {
          statusText = "Silinmiş";
          statusColor = "bg-[#F44336]";
        } else {
          switch (partner.status) {
            case 1:
              statusText = "Aktiv";
              statusColor = "bg-[#4FC3F7]";
              break;
            case 0:
              statusText = "Deaktiv";
              statusColor = "bg-[#FF9800]";
              break;
            case 2:
              statusText = "Gözləyir";
              statusColor = "bg-[#9E9E9E]";
              break;
            default:
              statusText = "Bilinmir";
              statusColor = "bg-[#9E9E9E]";
          }
        }

        // Check if there's a delete request for this partner
        const hasDeleteRequest = await DeleteRequest.exists({
          user: partner._id,
          status: "waiting",
        });

        return {
          _id: partner._id,
          id: partner.partnyor_id || partner._id,
          name: partner.name || "",
          surname: partner.surname || "",
          fullName: fullName || "Ad yoxdur",
          gender:
            partner.gender === "male"
              ? "Kişi"
              : partner.gender === "female"
                ? "Qadın"
                : partner.gender || "—",
          date: birthDate,
          jobTitle: partner.duty?.name || "—",
          email: partner.email || "—",
          phone: `+${partner.phone_suffix || "994"} ${partner.phone}`,
          status: statusText,
          statusColor: statusColor,
          muessise: partner.muessise_id?.muessise_name || "—",
          hire_date: partner.hire_date
            ? new Date(partner.hire_date).toLocaleDateString("az-AZ")
            : "—",
          last_login_ip: partner.last_login_ip || "—",
          createdAt: new Date(partner.createdAt).toLocaleDateString("az-AZ"),
          hasDeleteRequest: !!hasDeleteRequest,
        };
      })
    );

    // Debug logging to identify NaN issue (can be removed in production)
    console.log("Pagination Debug:", {
      totalRecords,
      filteredRecords,
      isDeletedQuery,
      queryLength: Object.keys(query).length,
      useAggregation,
      searchValue: searchValue || "none",
      muessise_filter: muessise_filter || "none",
      gender_filter: gender_filter || "none",
    });

    // Ensure values are numbers and not null/undefined
    totalRecords = totalRecords || 0;
    filteredRecords = filteredRecords || 0;

    // Return DataTable format
    res.json({
      draw: parseInt(draw),
      recordsTotal: totalRecords,
      recordsFiltered: filteredRecords,
      data: formattedData,
      start: parseInt(start),
      length: parseInt(length),
    });
  } catch (err) {
    console.error("getPartnerData error:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      draw: req.body.draw || 1,
      recordsTotal: 0,
      recordsFiltered: 0,
      data: [],
      start: parseInt(req.body.start) || 0,
      length: parseInt(req.body.length) || 10,
    });
  }
};

export const getPartnerCounts = async (req, res) => {
  try {
    const currentUserId = req.user.id; // Get currently logged in user ID

    // Use the mongoose-delete plugin methods for proper counting
    // Count only non-deleted users (using the default countDocuments which excludes deleted by the plugin)
    const totalCount = await PartnerUser.countDocuments({
      _id: { $ne: currentUserId },
    });
    const activeCount = await PartnerUser.countDocuments({
      status: 1,
      _id: { $ne: currentUserId },
    });
    const deactiveCount = await PartnerUser.countDocuments({
      status: 0,
      _id: { $ne: currentUserId },
    });
    const pendingCount = await PartnerUser.countDocuments({
      status: 2,
      _id: { $ne: currentUserId },
    });

    // Use the mongoose-delete plugin's countDeleted method for accurate count with fallback
    let deletedCount;
    try {
      deletedCount = await PartnerUser.countDeleted({
        _id: { $ne: currentUserId },
      });
    } catch (pluginError) {
      console.log(
        "Plugin countDeleted method failed, using manual approach:",
        pluginError.message
      );
      deletedCount = await PartnerUser.collection.countDocuments({
        deleted: true,
        _id: { $ne: currentUserId },
      });
    }

    res.json({
      total: totalCount,
      active: activeCount,
      deactive: deactiveCount,
      pending: pendingCount,
      deleted: deletedCount,
    });
  } catch (err) {
    console.error("getPartnerCounts error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get filter options for dropdowns
export const getFilterOptions = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Get all muessise options
    const muessises = await Muessise.find(
      {},
      { muessise_name: 1, _id: 1 }
    ).sort({ muessise_name: 1 });

    // Get available gender options from the schema
    const genderOptions = [
      { value: "male", label: "Kişi" },
      { value: "female", label: "Qadın" },
      { value: "other", label: "Digər" },
    ];

    res.json({
      muessises: muessises.map((m) => ({
        value: m._id,
        label: m.muessise_name,
      })),
      genders: genderOptions,
    });
  } catch (err) {
    console.error("getFilterOptions error:", err);
    return res.status(500).json({ error: "Internal Server Errorrrrr" });
  }
};

// Send OTP for user activation
export const sendActivateOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    const adminUser = req.user;

    if (!userId) {
      return res.status(400).json({ error: "User ID tələb olunur" });
    }

    // Find the target user
    const mongoose = await import("mongoose");
    const isValidObjectId = mongoose.default.Types.ObjectId.isValid(userId);

    let query;
    if (isValidObjectId) {
      query = {
        $or: [{ _id: userId }, { partnyor_id: userId }],
      };
    } else {
      query = { partnyor_id: userId };
    }

    const targetUser = await PartnerUser.findOne(query);

    if (!targetUser) {
      return res.status(404).json({ error: "İstifadəçi tapılmadı" });
    }

    // Check if user is already active
    if (targetUser.status === 1) {
      return res.status(400).json({ error: "İstifadəçi artıq aktivdir" });
    }

    // Get admin user details
    const admin = await AdminUser.findById(adminUser.id);
    if (!admin || !admin.email) {
      return res.status(404).json({ error: "Admin email tapılmadı" });
    }

    // Generate OTP
    const otpCode = generateOtp(6);
    const expireTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store OTP in database with target user's actual phone info
    await OtpModel.create({
      user_id: adminUser.id,
      otp_to: "admin",
      email: admin.email,
      phone_number: targetUser.phone || "",
      phone_suffix: targetUser.phone_suffix || "994",
      otp: otpCode,
      expire_time: expireTime,
    });

    // Send OTP via email
    const debugMode = process.env.NODE_ENV !== "production";
    const emailSent = await sendMail(admin.email, otpCode, debugMode);

    if (!emailSent && !debugMode) {
      return res.status(500).json({ error: "OTP göndərilməsi zamanı xəta" });
    }

    res.json({
      success: true,
      message: "Aktivləşdirmə üçün OTP kod göndərildi",
      ...(debugMode && { otpCode: otpCode }),
    });
  } catch (err) {
    console.error("Send activate OTP error:", err);
    return res.status(500).json({ error: "Server xətası" });
  }
};

// Verify OTP and activate user
export const verifyActivateOTP = async (req, res) => {
  try {
    const { otpCode, userId } = req.body;
    const adminUser = req.user;

    if (!otpCode || !userId) {
      return res
        .status(400)
        .json({ error: "OTP kodu və user ID tələb olunur" });
    }

    // Get admin user details for verification
    const admin = await AdminUser.findById(adminUser.id);
    if (!admin || !admin.email) {
      return res.status(404).json({ error: "Admin məlumatları tapılmadı" });
    }

    // Find and verify OTP using multiple fields for uniqueness
    const otpRecord = await OtpModel.findOne({
      user_id: adminUser.id,
      otp_to: "admin",
      email: admin.email,
      otp: otpCode,
      expire_time: { $gt: new Date() },
    });

    if (!otpRecord) {
      return res
        .status(400)
        .json({ error: "Yanlış və ya vaxtı keçmiş OTP kodu" });
    }

    // Find target user
    const mongoose = await import("mongoose");
    const isValidObjectId = mongoose.default.Types.ObjectId.isValid(userId);

    let query;
    if (isValidObjectId) {
      query = {
        $or: [{ _id: userId }, { partnyor_id: userId }],
      };
    } else {
      query = { partnyor_id: userId };
    }

    const targetUser = await PartnerUser.findOne(query);

    if (!targetUser) {
      return res.status(404).json({ error: "Hədəf istifadəçi tapılmadı" });
    }

    // Activate user
    await PartnerUser.findByIdAndUpdate(targetUser._id, { status: 1 });

    // Delete used OTP
    await OtpModel.findByIdAndDelete(otpRecord._id);

    res.json({
      success: true,
      message: `${targetUser.name} ${targetUser.surname} aktiv edildi`,
    });
  } catch (err) {
    console.error("Verify activate OTP error:", err);
    return res.status(500).json({ error: "Server xətası" });
  }
};

// Send OTP for user deactivation
export const sendDeactivateOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    const adminUser = req.user;

    if (!userId) {
      return res.status(400).json({ error: "User ID tələb olunur" });
    }

    // Find the target user
    const mongoose = await import("mongoose");
    const isValidObjectId = mongoose.default.Types.ObjectId.isValid(userId);

    let query;
    if (isValidObjectId) {
      query = {
        $or: [{ _id: userId }, { partnyor_id: userId }],
      };
    } else {
      query = { partnyor_id: userId };
    }

    const targetUser = await PartnerUser.findOne(query);

    if (!targetUser) {
      return res.status(404).json({ error: "İstifadəçi tapılmadı" });
    }

    // Check if user is already inactive
    if (targetUser.status === 0) {
      return res.status(400).json({ error: "İstifadəçi artıq deaktivdir" });
    }

    // Get admin user details
    const admin = await AdminUser.findById(adminUser.id);
    if (!admin || !admin.email) {
      return res.status(404).json({ error: "Admin email tapılmadı" });
    }

    // Generate OTP
    const otpCode = generateOtp(6);
    const expireTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store OTP in database with target user's actual phone info
    await OtpModel.create({
      user_id: adminUser.id,
      otp_to: "admin",
      email: admin.email,
      phone_number: targetUser.phone || "",
      phone_suffix: targetUser.phone_suffix || "994",
      otp: otpCode,
      expire_time: expireTime,
    });

    // Send OTP via email
    const debugMode = process.env.NODE_ENV !== "production";
    const emailSent = await sendMail(admin.email, otpCode, debugMode);

    if (!emailSent && !debugMode) {
      return res.status(500).json({ error: "OTP göndərilməsi zamanı xəta" });
    }

    res.json({
      success: true,
      message: "Deaktivləşdirmə üçün OTP kod göndərildi",
      ...(debugMode && { otpCode: otpCode }),
    });
  } catch (err) {
    console.error("Send deactivate OTP error:", err);
    return res.status(500).json({ error: "Server xətası" });
  }
};

// Verify OTP and deactivate user
export const verifyDeactivateOTP = async (req, res) => {
  try {
    const { otpCode, userId } = req.body;
    const adminUser = req.user;

    if (!otpCode || !userId) {
      return res
        .status(400)
        .json({ error: "OTP kodu və user ID tələb olunur" });
    }

    // Get admin user details for verification
    const admin = await AdminUser.findById(adminUser.id);
    if (!admin || !admin.email) {
      return res.status(404).json({ error: "Admin məlumatları tapılmadı" });
    }

    // Find and verify OTP using multiple fields for uniqueness
    const otpRecord = await OtpModel.findOne({
      user_id: adminUser.id,
      otp_to: "admin",
      email: admin.email,
      otp: otpCode,
      expire_time: { $gt: new Date() },
    });

    if (!otpRecord) {
      return res
        .status(400)
        .json({ error: "Yanlış və ya vaxtı keçmiş OTP kodu" });
    }

    // Find target user
    const mongoose = await import("mongoose");
    const isValidObjectId = mongoose.default.Types.ObjectId.isValid(userId);

    let query;
    if (isValidObjectId) {
      query = {
        $or: [{ _id: userId }, { partnyor_id: userId }],
      };
    } else {
      query = { partnyor_id: userId };
    }

    const targetUser = await PartnerUser.findOne(query);

    if (!targetUser) {
      return res.status(404).json({ error: "Hədəf istifadəçi tapılmadı" });
    }

    // Deactivate user
    await PartnerUser.findByIdAndUpdate(targetUser._id, { status: 0 });

    // Delete used OTP
    await OtpModel.findByIdAndDelete(otpRecord._id);

    res.json({
      success: true,
      message: `${targetUser.name} ${targetUser.surname} deaktiv edildi`,
    });
  } catch (err) {
    console.error("Verify deactivate OTP error:", err);
    return res.status(500).json({ error: "Server xətası" });
  }
};

// Send OTP for user deletion
export const sendDeleteOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    const adminUser = req.user;

    if (!userId) {
      return res.status(400).json({ error: "User ID tələb olunur" });
    }

    // Find the target user
    const mongoose = await import("mongoose");
    const isValidObjectId = mongoose.default.Types.ObjectId.isValid(userId);

    let query;
    if (isValidObjectId) {
      query = {
        $or: [{ _id: userId }, { partnyor_id: userId }],
      };
    } else {
      query = { partnyor_id: userId };
    }

    const targetUser = await PartnerUser.findOne(query);

    if (!targetUser) {
      return res.status(404).json({ error: "İstifadəçi tapılmadı" });
    }

    // Get admin user details
    const admin = await AdminUser.findById(adminUser.id);
    if (!admin || !admin.email) {
      return res.status(404).json({ error: "Admin email tapılmadı" });
    }

    // Generate OTP
    const otpCode = generateOtp(6);
    console.log("[DEV] Generated Delete OTP:", otpCode);
    const expireTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Create temp delete record with OTP
    await TempPartnerUserDelete.create({
      sender_id: adminUser.id,
      users: [targetUser._id],
      otp_code: otpCode,
      otp_send_time: new Date(),
    });

    // Store OTP in database with target user's actual phone info
    await OtpModel.create({
      user_id: adminUser.id,
      otp_to: "admin",
      email: admin.email,
      phone_number: targetUser.phone || "",
      phone_suffix: targetUser.phone_suffix || "994",
      otp: otpCode,
      expire_time: expireTime,
    });

    // Send OTP via email
    const debugMode = process.env.NODE_ENV !== "production";
    const emailSent = await sendMail(admin.email, otpCode, debugMode);

    if (!emailSent && !debugMode) {
      return res.status(500).json({ error: "OTP göndərilməsi zamanı xəta" });
    }

    res.json({
      success: true,
      message: "Silinmə üçün OTP kod göndərildi",
      ...(debugMode && { otpCode: otpCode }),
    });
  } catch (err) {
    console.error("Send delete OTP error:", err);
    return res.status(500).json({ error: "Server xətası" });
  }
};

// Verify OTP and delete user
export const getCurrentUserEmail = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Find the current user to get their email
    const currentUser = await AdminUser.findById(currentUserId).select("email");

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        error: "İstifadəçi tapılmadı",
      });
    }

    return res.json({
      success: true,
      email: currentUser.email,
    });
  } catch (error) {
    console.error("getCurrentUserEmail error:", error);
    return res.status(500).json({
      success: false,
      error: "Server xətası",
    });
  }
};

export const verifyDeleteOTP = async (req, res) => {
  try {
    const { otpCode, userId } = req.body;
    const adminUser = req.user;

    if (!otpCode || !userId) {
      return res
        .status(400)
        .json({ error: "OTP kodu və user ID tələb olunur" });
    }

    // Find the temp delete record by OTP code
    const tempDeleteRecord = await TempPartnerUserDelete.findOne({
      otp_code: otpCode,
      sender_id: adminUser.id,
      otp_send_time: { $gt: new Date(Date.now() - 5 * 60 * 1000) }, // Check if OTP is not older than 5 minutes
    }).populate("users");

    if (!tempDeleteRecord) {
      return res
        .status(400)
        .json({ error: "Yanlış və ya vaxtı keçmiş OTP kodu" });
    }

    // Find target user
    const mongoose = await import("mongoose");
    const isValidObjectId = mongoose.default.Types.ObjectId.isValid(userId);

    let query;
    if (isValidObjectId) {
      query = {
        $or: [{ _id: userId }, { partnyor_id: userId }],
      };
    } else {
      query = { partnyor_id: userId };
    }

    const targetUser = await PartnerUser.findOne(query);

    if (!targetUser) {
      return res.status(404).json({ error: "Hədəf istifadəçi tapılmadı" });
    }

    // Verify that the target user is in the temp delete record
    const userInRecord = tempDeleteRecord.users.some(
      (user) => user._id.toString() === targetUser._id.toString()
    );

    if (!userInRecord) {
      return res
        .status(400)
        .json({ error: "Bu OTP kodu bu istifadəçi üçün etibarlı deyil" });
    }

    // Update user status to 2 (waiting to be deleted) instead of actually deleting
    await PartnerUser.findByIdAndUpdate(targetUser._id, {
      status: 2,
    });

    // Delete the temp record and associated OTP
    await TempPartnerUserDelete.findByIdAndDelete(tempDeleteRecord._id);
    await OtpModel.deleteOne({
      user_id: adminUser.id,
      otp: otpCode,
    });

    res.json({
      success: true,
      message: `${targetUser.name} ${targetUser.surname} silinmə üçün gözləmə siyahısına əlavə edildi`,
    });
  } catch (err) {
    console.error("Verify delete OTP error:", err);
    return res.status(500).json({ error: "Server xətası" });
  }
};

// Get partner details by ID
export const getPartnerDetails = async (req, res) => {
  try {
    const partnerId = req.params.id;
    const currentUserId = req.user.id;

    // Find the partner by ID and populate necessary fields
    const partner = await PartnerUser.findOne({ partnyor_id: partnerId })
      .populate("duty", "name")
      .populate("muessise_id", "muessise_name authorized_person address")
      .lean();

    if (!partner) {
      return res.status(404).render("pages/404.ejs", {
        error: "Partner tapılmadı",
        csrfToken: req.csrfToken(),
      });
    }

    // Get QR code statistics for this partner
    // const totalQrCodes = await QrCode.countDocuments({
    //   creator_id: partner._id,
    // });
    const totalQrCodes = await TransactionsUser.countDocuments({
      to: partner.muessise_id,
    });

    // Calculate QR codes created this month
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    const thisMonthQrCodes = await QrCode.countDocuments({
      creator_id: partner._id,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    });

    // Format the partner data for the template
    const formattedPartner = {
      id: partner.partnyor_id || "PA-XXXXXXXX",
      partnyor_id: partner.partnyor_id, // Include partnyor_id for JS
      fullName: `${partner.name || ""} ${partner.surname || ""}`.trim(),
      name: partner.name || "",
      surname: partner.surname || "",
      email: partner.email || "",
      phone: partner.phone
        ? `+${partner.phone_suffix || "994"} ${partner.phone}`
        : "",
      phone_suffix: partner.phone_suffix || "994",
      phone_number: partner.phone || "",
      birth_date: partner.birth_date
        ? new Date(partner.birth_date).toLocaleDateString("az-AZ")
        : "",
      gender:
        partner.gender === "male"
          ? "Kişi"
          : partner.gender === "female"
            ? "Qadın"
            : "Digər",
      duty: partner.duty?.name || "",
      muessise: {
        name: partner.muessise_id?.muessise_name || "",
        authorized_person: partner.muessise_id?.authorized_person?.name || "",
        address: partner.muessise_id?.address || "",
      },
      hire_date: partner.hire_date
        ? new Date(partner.hire_date).toLocaleDateString("az-AZ")
        : "",
      last_login_ip: partner.last_login_ip || "",
      status:
        partner.status === 1
          ? "Aktiv"
          : partner.status === 0
            ? "Deaktiv"
            : "Gözləyir",
      statusNumber: Number(partner.status), // 0|1|2 - numeric status for JS
      statusColor:
        partner.status === 1
          ? "bg-success"
          : partner.status === 0
            ? "bg-error"
            : "bg-warning",
      created_at: new Date(partner.createdAt).toLocaleDateString("az-AZ"),
      initials:
        `${partner.name?.charAt(0) || ""}${partner.surname?.charAt(0) || ""}`.toUpperCase(),
      qr_stats: {
        total: totalQrCodes || 0,
        this_month: thisMonthQrCodes || 0,
      },
    };

    return res.render("pages/istifadeci-hovuzu/partner/inside.ejs", {
      error: "",
      partner: formattedPartner,
      csrfToken: req.csrfToken(),
      // scripts: `
      //     <script src="/js/datatables/datatables.min.js"></script>
      //     <script src="/js/Avankart/istifadeciHovuzu/avankartPartner/partnerDetailsTable.js"></script>
      // `
    });
  } catch (error) {
    console.error("getPartnerDetails error:", error);
    return res.status(500).render("pages/500.ejs", {
      error: "Server xətası",
      csrfToken: req.csrfToken(),
    });
  }
};

export const getPartnerWorkingHistory = async (req, res) => {
  try {
    const partnerIdParam = req.params.id;

    if (!partnerIdParam) {
      return res.status(400).json({
        error: "Partner ID is required",
      });
    }

    // Find partner by partnyor_id (since that's what comes from the URL)
    const partner = await PartnerUser.findOne({
      partnyor_id: partnerIdParam,
    }).populate("muessise_id", "muessise_name profile_image_path");

    if (!partner) {
      return res.status(404).json({
        error: "Partner not found",
      });
    }

    // Check if there's a delete request for this partner
    const hasDeleteRequest =
      await getHasDeleteRequestByPartnyorId(partnerIdParam);

    // Handle both query and body parameters (for POST requests)
    const requestData = { ...req.query, ...req.body };

    // Parse DataTables parameters
    const draw = parseInt(requestData.draw, 10) || 1;
    const start = parseInt(requestData.start, 10) || 0;
    const length = parseInt(requestData.length, 10) || 10;
    const searchText = (requestData.search.value || "").trim();

    console.log("=== Partner Working History Search ===");
    console.log("Partner ID:", partnerIdParam);
    console.log("Search term:", searchText);
    console.log("Current workplace:", partner.muessise_id?.muessise_name);

    // Filter parameters
    const startDate = requestData.start_date;
    const endDate = requestData.end_date;
    const minAmount = parseFloat(requestData.min) || null;
    const maxAmount = parseFloat(requestData.max) || null;
    const companies = requestData.companys
      ? Array.isArray(requestData.companys)
        ? requestData.companys
        : [requestData.companys]
      : [];

    let workingPlaces = [];

    // 1. Current working place (from partner's muessise_id)
    if (partner.muessise_id) {
      // Check if current workplace matches search term (if search is provided)
      const currentWorkplaceName = partner.muessise_id.muessise_name || "";
      const matchesSearch =
        !searchText ||
        currentWorkplaceName.toLowerCase().includes(searchText.toLowerCase());

      console.log("Current workplace check:", {
        name: currentWorkplaceName,
        searchTerm: searchText,
        matches: matchesSearch,
      });

      if (matchesSearch) {
        // Calculate QR codes for current workplace
        let qrQuery = { creator_id: partner._id };
        if (partner.hire_date) {
          qrQuery.createdAt = { $gte: partner.hire_date };
        }
        // const qrCount = await QrCode.countDocuments(qrQuery);
        const qrCount = await TransactionsUser.countDocuments({
          to: partner.muessise_id,
        });

        // Calculate transaction amount for current workplace
        let transactionQuery = {
          user: partner._id,
          status: "success",
        };
        if (partner.hire_date) {
          transactionQuery.createdAt = { $gte: partner.hire_date };
        }

        const transactionSum = await TransactionsUser.aggregate([
          { $match: transactionQuery },
          { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
        ]);

        const totalAmount =
          transactionSum.length > 0 ? transactionSum[0].totalAmount : 0;

        const currentPlace = {
          muessise_name: currentWorkplaceName || "N/A",
          muessise_id: partner.muessise_id._id,
          profile_image_path: sanitizeFilePath(
            partner.muessise_id.profile_image_path || null
          ),
          qr_count: qrCount,
          amount: `${totalAmount.toFixed(2)} ₼`,
          start_date: partner.hire_date || partner.createdAt,
          end_date: null, // Current job, no end date
          is_current: true,
          partner_id: partner._id,
        };
        workingPlaces.push(currentPlace);
      }
    }

    // 2. Previous working places (from oldMuessiseUsers model)
    let searchQuery = { user_id: partner._id };
    if (searchText) {
      // We need to populate muessise_id first to search by name
      const oldWorkPlaces = await OldMuessiseUsers.find(searchQuery).populate(
        "muessise_id",
        "muessise_name profile_image_path"
      );
      console.log("oldWorkPlaces", oldWorkPlaces);

      // Filter by search term
      const filteredOldPlaces = oldWorkPlaces.filter((place) => {
        const placeName = place.muessise_id?.muessise_name || "";
        const matches = placeName
          .toLowerCase()
          .includes(searchText.toLowerCase());
        console.log("Old workplace check:", {
          name: placeName,
          searchTerm: searchText,
          matches: matches,
        });
        return matches;
      });

      for (const oldPlace of filteredOldPlaces) {
        const qrCount = await QrCode.countDocuments({
          creator_id: partner._id,
          createdAt: {
            $gte: oldPlace.hire_date || new Date("1900-01-01"),
            ...(oldPlace.dismissal_date && { $lte: oldPlace.dismissal_date }),
          },
        });

        // Calculate transaction amount for this old workplace
        let transactionQuery = {
          user: partner._id,
          status: "success",
          createdAt: {
            $gte: oldPlace.hire_date || new Date("1900-01-01"),
            ...(oldPlace.dismissal_date && { $lte: oldPlace.dismissal_date }),
          },
        };

        const transactionSum = await TransactionsUser.aggregate([
          { $match: transactionQuery },
          { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
        ]);

        const totalAmount =
          transactionSum.length > 0 ? transactionSum[0].totalAmount : 0;

        workingPlaces.push({
          muessise_name: oldPlace.muessise_id?.muessise_name || "N/A",
          muessise_id: oldPlace.muessise_id?._id,
          profile_image_path: sanitizeFilePath(
            oldPlace.muessise_id?.profile_image_path || null
          ),
          qr_count: qrCount,
          amount: `${totalAmount.toFixed(2)} ₼`,
          start_date: oldPlace.hire_date,
          end_date: oldPlace.dismissal_date,
          is_current: false,
          partner_id: partner._id,
        });
      }
    } else {
      // No search, get all old places
      const oldWorkPlaces = await OldMuessiseUsers.find(searchQuery)
        .populate("muessise_id", "muessise_name profile_image_path")
        .sort({ dismissal_date: -1 });

      for (const oldPlace of oldWorkPlaces) {
        const qrCount = await QrCode.countDocuments({
          creator_id: partner._id,
          createdAt: {
            $gte: oldPlace.hire_date || new Date("1900-01-01"),
            ...(oldPlace.dismissal_date && { $lte: oldPlace.dismissal_date }),
          },
        });

        // Calculate transaction amount for this old workplace
        let transactionQuery = {
          user: partner._id,
          status: "success",
          createdAt: {
            $gte: oldPlace.hire_date || new Date("1900-01-01"),
            ...(oldPlace.dismissal_date && { $lte: oldPlace.dismissal_date }),
          },
        };

        const transactionSum = await TransactionsUser.aggregate([
          { $match: transactionQuery },
          { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
        ]);

        const totalAmount =
          transactionSum.length > 0 ? transactionSum[0].totalAmount : 0;

        workingPlaces.push({
          muessise_name: oldPlace.muessise_id?.muessise_name || "N/A",
          muessise_id: oldPlace.muessise_id?._id,
          profile_image_path: sanitizeFilePath(
            oldPlace.muessise_id?.profile_image_path || null
          ),
          qr_count: qrCount,
          amount: `${totalAmount.toFixed(2)} ₼`,
          start_date: oldPlace.hire_date,
          end_date: oldPlace.dismissal_date,
          is_current: false,
          partner_id: partner._id,
        });
      }
    }

    console.log("workingPlaces: ", workingPlaces);

    // Apply filters
    let filteredPlaces = workingPlaces.filter((place) => {
      // Date filter
      if (startDate) {
        const placeStartDate = new Date(place.start_date);
        const filterStartDate = new Date(startDate);
        if (placeStartDate < filterStartDate) return false;
      }

      if (endDate) {
        const placeEndDate = place.end_date
          ? new Date(place.end_date)
          : new Date();
        const filterEndDate = new Date(endDate);
        if (placeEndDate > filterEndDate) return false;
      }

      // Amount filter
      if (minAmount !== null || maxAmount !== null) {
        const amountStr = place.amount || "0.00 ₼";
        const amount =
          parseFloat(amountStr.replace(" ₼", "").replace(",", "")) || 0;

        if (minAmount !== null && amount < minAmount) return false;
        if (maxAmount !== null && amount > maxAmount) return false;
      }

      // Company filter
      if (companies.length > 0) {
        if (!companies.includes(place.muessise_id?.toString())) return false;
      }

      return true;
    });

    // Sort by current job first, then by start date descending
    filteredPlaces.sort((a, b) => {
      if (a.is_current && !b.is_current) return -1;
      if (!a.is_current && b.is_current) return 1;

      const aDate = new Date(a.start_date || "1900-01-01");
      const bDate = new Date(b.start_date || "1900-01-01");
      return bDate - aDate;
    });

    console.log("=== Search Results Summary ===");
    console.log(
      "All workplaces found:",
      workingPlaces.map((p) => p.muessise_name)
    );
    console.log(
      "After filtering:",
      filteredPlaces.map((p) => p.muessise_name)
    );
    console.log("Search term was:", searchText);

    // Apply pagination
    const totalRecords = workingPlaces.length;
    const filteredRecords = filteredPlaces.length;
    const paginatedPlaces = filteredPlaces.slice(start, start + length);

    // Format data for DataTables
    const formattedData = paginatedPlaces.map((place) => {
      const startDate = place.start_date
        ? new Date(place.start_date).toLocaleDateString("az-AZ", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        : "N/A";

      const endDate = place.end_date
        ? new Date(place.end_date).toLocaleDateString("az-AZ", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        : place.is_current
          ? "Davam edir"
          : "N/A";

      return {
        muessise_name: place.muessise_name,
        muessise_id: place.muessise_id,
        profile_image_path: place.profile_image_path,
        qr_count: place.qr_count || 0,
        amount: place.amount,
        start_date: startDate,
        end_date: endDate,
        is_current: place.is_current,
        partner_id: place.partner_id,
        partnyor_id: partnerIdParam,
        hasDeleteRequest: hasDeleteRequest,
      };
    });

    return res.json({
      draw: draw,
      recordsTotal: totalRecords,
      recordsFiltered: filteredRecords,
      data: formattedData,
    });
  } catch (error) {
    console.error("getPartnerWorkingHistory error:", error);
    return res.status(500).json({
      error: "Server error",
    });
  }
};

export const getPartnerWorkplaceFilterOptions = async (req, res) => {
  try {
    // Handle both query and body parameters (for POST requests)
    const requestData = { ...req.query, ...req.body };
    const { partnerId, workplaceId } = requestData;
    const partnerIdParam = req.params.id || partnerId;

    if (!partnerIdParam) {
      return res.status(400).json({
        error: "Partner ID is required",
      });
    }

    // Find partner by partnyor_id or _id
    let partner;
    if (mongoose.Types.ObjectId.isValid(partnerIdParam)) {
      partner = await PartnerUser.findById(partnerIdParam).populate(
        "muessise_id",
        "muessise_name"
      );
    } else {
      partner = await PartnerUser.findOne({
        partnyor_id: partnerIdParam,
      }).populate("muessise_id", "muessise_name");
    }

    if (!partner) {
      return res.status(404).json({
        error: "Partner not found",
      });
    }

    let companies = [];

    // Add current workplace
    if (partner.muessise_id) {
      companies.push({
        id: partner.muessise_id._id,
        name: partner.muessise_id.muessise_name,
      });
    }

    // Add previous workplaces
    const oldWorkPlaces = await OldMuessiseUsers.find({
      user_id: partner._id,
    }).populate("muessise_id", "muessise_name");

    oldWorkPlaces.forEach((oldPlace) => {
      if (oldPlace.muessise_id) {
        companies.push({
          id: oldPlace.muessise_id._id,
          name: oldPlace.muessise_id.muessise_name,
        });
      }
    });

    // Remove duplicates
    const uniqueCompanies = companies.filter(
      (company, index, self) =>
        index ===
        self.findIndex((c) => c.id.toString() === company.id.toString())
    );

    // Get min and max amounts for the slider
    const amountRange = await TransactionsUser.aggregate([
      {
        $match: {
          partnerid: partner._id,
          ...(workplaceId && {
            workplaceid: new mongoose.Types.ObjectId(workplaceId),
          }),
        },
      },
      {
        $group: {
          _id: null,
          minAmount: { $min: "$totalamount" },
          maxAmount: { $max: "$totalamount" },
        },
      },
    ]);

    // Get date range
    const dateRange = await TransactionsUser.aggregate([
      {
        $match: {
          partnerid: partner._id,
          ...(workplaceId && {
            workplaceid: new mongoose.Types.ObjectId(workplaceId),
          }),
        },
      },
      {
        $group: {
          _id: null,
          minDate: { $min: "$transactiondatetime" },
          maxDate: { $max: "$transactiondatetime" },
        },
      },
    ]);

    return res.json({
      success: true,
      data: {
        companies: uniqueCompanies,
        minAmount: amountRange[0]?.minAmount || 0,
        maxAmount: amountRange[0]?.maxAmount || 1000,
        minDate:
          dateRange[0]?.minDate ||
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        maxDate: dateRange[0]?.maxDate || new Date(),
      },
    });
  } catch (error) {
    console.error("getPartnerWorkplaceFilterOptions error:", error);
    return res.status(500).json({
      error: "Server error",
    });
  }
};

export const getPartnerWorkplaceStats = async (req, res) => {
  try {
    const partnerIdParam = req.params.id;
    const muessiseId = req.params.muessiseId;

    if (!partnerIdParam || !muessiseId) {
      return res.status(400).json({
        error: "Partner ID and Muessise ID are required",
      });
    }

    // Find partner by partnyor_id
    const partner = await PartnerUser.findOne({ partnyor_id: partnerIdParam });

    if (!partner) {
      return res.status(404).json({
        error: "Partner not found",
      });
    }

    // Determine date range based on workplace
    let dateFilter = {};

    if (muessiseId === partner.muessise_id?.toString()) {
      // Current workplace - from hire_date to now
      if (partner.hire_date) {
        dateFilter.createdAt = { $gte: partner.hire_date };
      }
    } else {
      // Previous workplace - get date range from oldMuessiseUsers
      const oldWorkPlace = await OldMuessiseUsers.findOne({
        user_id: partner._id,
        muessise_id: muessiseId,
      });

      if (oldWorkPlace) {
        dateFilter.createdAt = {
          $gte: oldWorkPlace.hire_date || new Date("1900-01-01"),
          ...(oldWorkPlace.dismissal_date && {
            $lte: oldWorkPlace.dismissal_date,
          }),
        };
      }
    }

    // Build search query for transactions
    let searchQuery = {
      user: partner._id,
      status: "success",
      ...dateFilter,
    };

    // Get card category statistics
    const categoryStats = await TransactionsUser.aggregate([
      { $match: searchQuery },
      {
        $lookup: {
          from: "cards",
          localField: "cards",
          foreignField: "_id",
          as: "cardInfo",
        },
      },
      { $unwind: { path: "$cardInfo", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: {
            $ifNull: ["$cardInfo.card_category", "Digər"],
          },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Calculate total amount for percentage calculations
    const totalAmount = categoryStats.reduce(
      (sum, cat) => sum + cat.totalAmount,
      0
    );

    // Map categories to display format
    const categoryMapping = {
      yemək: "Yemək kartı",
      food: "Yemək kartı",
      hədiyyə: "Hədiyyə",
      gift: "Hədiyyə",
      yanacaq: "Yanacaq",
      fuel: "Yanacaq",
      market: "Market",
      biznes: "Biznes",
      business: "Biznes",
      premium: "Premium",
      avto_yuma: "Avto Yuma",
      car_wash: "Avto Yuma",
    };

    // Format the data for frontend
    const formattedStats = categoryStats.map((stat) => {
      const categoryKey = stat._id?.toLowerCase() || "digər";
      const displayName = categoryMapping[categoryKey] || stat._id || "Digər";
      const percentage =
        totalAmount > 0
          ? ((stat.totalAmount / totalAmount) * 100).toFixed(1)
          : 0;

      return {
        category: displayName,
        amount: stat.totalAmount,
        formattedAmount: `${stat.totalAmount.toFixed(2)} ₼`,
        percentage: parseFloat(percentage),
        formattedPercentage: `${percentage}%`,
        count: stat.count,
      };
    });

    // Sort by amount descending
    formattedStats.sort((a, b) => b.amount - a.amount);

    // Get min and max transaction amounts for slider
    const minTransaction = await TransactionsUser.findOne({
      user: partner._id,
      ...dateFilter,
    })
      .sort({ amount: 1 })
      .limit(1);

    const maxTransaction = await TransactionsUser.findOne({
      user: partner._id,
      ...dateFilter,
    })
      .sort({ amount: -1 })
      .limit(1);

    // Default values if no transactions found
    const minAmount = minTransaction ? Math.floor(minTransaction.amount) : 0;
    const maxAmount = maxTransaction ? Math.ceil(maxTransaction.amount) : 1000;

    return res.json({
      success: true,
      data: {
        categories: formattedStats,
        totalAmount: totalAmount,
        formattedTotalAmount: `${totalAmount.toFixed(2)} ₼`,
        minAmount: minAmount,
        maxAmount: maxAmount,
      },
    });
  } catch (error) {
    console.error("getPartnerWorkplaceStats error:", error);
    return res.status(500).json({
      error: "Server error",
    });
  }
};

export const getPartnerWorkplaceTransactions = async (req, res) => {
  try {
    const partnerIdParam = req.params.id;
    const muessiseId = req.params.muessiseId || req.params.workplaceId;

    if (!partnerIdParam || !muessiseId) {
      return res.status(400).json({
        error: "Partner ID and Workplace/Muessise ID are required",
      });
    }

    // Find partner by partnyor_id
    const partner = await PartnerUser.findOne({ partnyor_id: partnerIdParam });

    if (!partner) {
      return res.status(404).json({
        error: "Partner not found",
      });
    }

    // Handle both query and body parameters (for POST requests)
    const requestData = { ...req.query, ...req.body };

    // Parse DataTables parameters
    const draw = parseInt(requestData.draw, 10) || 1;
    const start = parseInt(requestData.start, 10) || 0;
    const length = parseInt(requestData.length, 10) || 10;
    const searchText = (requestData.search?.value || "").trim();

    // Get filter parameters
    const startDate = requestData.start_date;
    const endDate = requestData.end_date;
    const minAmount = parseFloat(requestData.min_amount) || null;
    const maxAmount = parseFloat(requestData.max_amount) || null;
    const categories = requestData.categories || [];
    const statuses = requestData.statuses || [];

    console.log("Transaction filters:", {
      startDate,
      endDate,
      minAmount,
      maxAmount,
      categories,
      statuses,
      searchText,
    });

    // Build base search query for transactions
    let searchQuery = {
      user: partner._id,
    };

    // Status filter - if statuses array is provided, use it, otherwise default to success only
    if (statuses && statuses.length > 0) {
      // Convert frontend status values to backend values
      const backendStatuses = statuses.map((status) => {
        if (status === "Uğurlu" || status === "success") return "success";
        if (status === "Uğursuz" || status === "failed") return "failed";
        return status;
      });
      searchQuery.status = { $in: backendStatuses };
    } else {
      searchQuery.status = "success"; // Default to successful transactions only
    }

    // Determine date range based on workplace
    let dateFilter = {};

    if (muessiseId === partner.muessise_id?.toString()) {
      // Current workplace - from hire_date to now
      if (partner.hire_date) {
        dateFilter.createdAt = { $gte: partner.hire_date };
      }
    } else {
      // Previous workplace - get date range from oldMuessiseUsers
      const oldWorkPlace = await OldMuessiseUsers.findOne({
        user_id: partner._id,
        muessise_id: muessiseId,
      });

      if (oldWorkPlace) {
        dateFilter.createdAt = {
          $gte: oldWorkPlace.hire_date || new Date("1900-01-01"),
          ...(oldWorkPlace.dismissal_date && {
            $lte: oldWorkPlace.dismissal_date,
          }),
        };
      }
    }

    // Apply workplace date filter
    if (Object.keys(dateFilter).length > 0) {
      searchQuery = { ...searchQuery, ...dateFilter };
    }

    // Apply additional date filters from request
    if (startDate || endDate) {
      let additionalDateFilter = {};

      if (startDate) {
        additionalDateFilter.$gte = new Date(startDate);
      }

      if (endDate) {
        // Add one day to include the end date
        const endDateTime = new Date(endDate);
        endDateTime.setDate(endDateTime.getDate() + 1);
        additionalDateFilter.$lt = endDateTime;
      }

      // Merge with existing date filter if any
      if (searchQuery.createdAt) {
        // If there's already a date filter from workplace, combine them
        if (additionalDateFilter.$gte && searchQuery.createdAt.$gte) {
          // Use the more restrictive start date
          additionalDateFilter.$gte = new Date(
            Math.max(
              additionalDateFilter.$gte.getTime(),
              searchQuery.createdAt.$gte.getTime()
            )
          );
        }
        if (additionalDateFilter.$lt && searchQuery.createdAt.$lte) {
          // Use the more restrictive end date
          additionalDateFilter.$lt = new Date(
            Math.min(
              additionalDateFilter.$lt.getTime(),
              searchQuery.createdAt.$lte.getTime()
            )
          );
        }
        searchQuery.createdAt = {
          ...searchQuery.createdAt,
          ...additionalDateFilter,
        };
      } else {
        searchQuery.createdAt = additionalDateFilter;
      }
    }

    // Apply amount filters
    if (minAmount !== null || maxAmount !== null) {
      searchQuery.amount = {};
      if (minAmount !== null) {
        searchQuery.amount.$gte = minAmount;
      }
      if (maxAmount !== null) {
        searchQuery.amount.$lte = maxAmount;
      }
    }

    console.log(
      "Final search query before aggregation:",
      JSON.stringify(searchQuery, null, 2)
    );

    // Apply search and category filters using aggregation pipeline
    let useAggregation = false;
    let aggregationPipeline = [];

    if (searchText || (categories && categories.length > 0)) {
      useAggregation = true;

      // Build aggregation pipeline for complex search
      aggregationPipeline = [
        { $match: searchQuery },
        {
          $lookup: {
            from: "cards",
            localField: "cards",
            foreignField: "_id",
            as: "cardInfo",
          },
        },
        {
          $unwind: {
            path: "$cardInfo",
            preserveNullAndEmptyArrays: true,
          },
        },
      ];

      // Add search and category conditions
      let searchConditions = [];

      if (searchText) {
        const searchRegex = new RegExp(searchText, "i");
        const num = Number(searchText);
        searchConditions.push(
          { transaction_id: searchRegex },
          { "cardInfo.name": searchRegex },
          { "cardInfo.card_category": searchRegex },
          { "cardInfo.card_type": searchRegex }
        );


        if (!Number.isNaN(num)) {
          searchConditions.push({ amount: num });
        }
      }

      if (categories && categories.length > 0) {
        searchConditions.push({
          "cardInfo.card_category": { $in: categories },
        });
      }

      if (searchConditions.length > 0) {
        if (searchConditions.length === 1) {
          aggregationPipeline.push({ $match: searchConditions[0] });
        } else {
          aggregationPipeline.push({
            $match: {
              $or: searchConditions,
            },
          });
        }
      }

      // Add sorting and pagination
      aggregationPipeline.push(
        { $sort: { createdAt: -1 } },
        { $skip: start },
        { $limit: length }
      );
    }

    // Get transactions with populated data
    let transactions, totalRecords, filteredRecords;

    if (useAggregation) {
      // Use aggregation for complex search/filtering
      try {
        transactions = await TransactionsUser.aggregate(aggregationPipeline);

        // Get total count with same filters but without pagination
        const countPipeline = aggregationPipeline.slice(0, -2); // Remove skip and limit
        countPipeline.push({ $count: "total" });
        const countResult = await TransactionsUser.aggregate(countPipeline);
        filteredRecords = countResult.length > 0 ? countResult[0].total : 0;

        // Get total records without any filters for recordsTotal
        const baseCountQuery = { user: partner._id };
        totalRecords = await TransactionsUser.countDocuments(baseCountQuery);

        // Populate card info manually for aggregation results if needed
        for (let transaction of transactions) {
          if (!transaction.cardInfo && transaction.cards) {
            try {
              const cardInfo = await Card.findById(transaction.cards);
              transaction.cardInfo = cardInfo;
            } catch (err) {
              console.log("Error populating card info:", err);
            }
          }
        }
      } catch (error) {
        console.error("Aggregation error:", error);
        // Fallback to simple query
        useAggregation = false;
      }
    }

    if (!useAggregation) {
      // Use simple query for basic filtering
      transactions = await TransactionsUser.find(searchQuery)
        .populate("cards", "name card_type amount card_category")
        .sort({ createdAt: -1 })
        .skip(start)
        .limit(length);

      filteredRecords = await TransactionsUser.countDocuments(searchQuery);

      // Get total records without any filters for recordsTotal
      const baseCountQuery = { user: partner._id };
      totalRecords = await TransactionsUser.countDocuments(baseCountQuery);
    }

    console.log(totalRecords, "sssssssssssssssssssssssssssssssssss");

    // Format data for DataTables
    const formattedData = transactions.map((transaction) => {
      const transactionDate = transaction.createdAt
        ? new Date(transaction.createdAt).toLocaleDateString("az-AZ", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        : "N/A";

      // Get card info from either populated field or aggregation result
      const cardInfo = transaction.cards || transaction.cardInfo;
      let cardName = "—";
      let cardCategory = "N/A";

      if (cardInfo) {
        if (typeof cardInfo === "object") {
          cardName = cardInfo.name || "—";
          cardCategory = cardInfo.card_category || "N/A";
        } else if (transaction.cardInfo) {
          cardName = transaction.cardInfo.name || "—";
          cardCategory = transaction.cardInfo.card_category || "N/A";
        }
      }

      return {
        transactionId: transaction.transaction_id || "N/A",
        cardName: cardName,
        cardCategory: cardCategory,
        amount: transaction.amount
          ? `${transaction.amount.toFixed(2)} ₼`
          : "0.00 ₼",
        date: transactionDate,
        status: transaction.status === "success" ? "Uğurlu" : "Uğursuz",
      };
    });

    return res.json({
      draw: draw,
      recordsTotal: totalRecords,
      recordsFiltered: filteredRecords,
      data: formattedData,
    });
  } catch (error) {
    console.error("getPartnerWorkplaceTransactions error:", error);
    return res.status(500).json({
      error: "Server error",
    });
  }
};

// Function to get filter options for partner transactions
export const getPartnerTransactionFilterOptions = async (req, res) => {
  try {
    const partnerIdParam = req.params.id;
    const muessiseId = req.params.muessiseId;

    if (!partnerIdParam) {
      return res.status(400).json({
        error: "Partner ID is required",
      });
    }

    // Find partner by partnyor_id
    const partner = await PartnerUser.findOne({ partnyor_id: partnerIdParam });

    if (!partner) {
      return res.status(404).json({
        error: "Partner not found",
      });
    }

    // Build base query for partner's transactions
    let baseQuery = { user: partner._id };

    // If specific workplace is requested, add date constraints
    if (muessiseId) {
      if (muessiseId === partner.muessise_id?.toString()) {
        // Current workplace - from hire_date to now
        if (partner.hire_date) {
          baseQuery.createdAt = { $gte: partner.hire_date };
        }
      } else {
        // Previous workplace - get date range from oldMuessiseUsers
        const oldWorkPlace = await OldMuessiseUsers.findOne({
          user_id: partner._id,
          muessise_id: muessiseId,
        });

        if (oldWorkPlace) {
          baseQuery.createdAt = {
            $gte: oldWorkPlace.hire_date || new Date("1900-01-01"),
            ...(oldWorkPlace.dismissal_date && {
              $lte: oldWorkPlace.dismissal_date,
            }),
          };
        }
      }
    }

    // Get min/max amounts
    const amountStats = await TransactionsUser.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: null,
          minAmount: { $min: "$amount" },
          maxAmount: { $max: "$amount" },
          totalTransactions: { $sum: 1 },
        },
      },
    ]);

    // Get available card categories with counts
    const categoryStats = await TransactionsUser.aggregate([
      { $match: baseQuery },
      {
        $lookup: {
          from: "cards",
          localField: "cards",
          foreignField: "_id",
          as: "cardInfo",
        },
      },
      {
        $unwind: {
          path: "$cardInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$cardInfo.card_category",
          count: { $sum: 1 },
        },
      },
      { $match: { _id: { $ne: null } } },
      { $sort: { count: -1 } },
    ]);

    // Get status distribution
    const statusStats = await TransactionsUser.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const filterOptions = {
      minAmount: amountStats.length > 0 ? amountStats[0].minAmount || 0 : 0,
      maxAmount:
        amountStats.length > 0 ? amountStats[0].maxAmount || 1000 : 1000,
      totalTransactions:
        amountStats.length > 0 ? amountStats[0].totalTransactions : 0,
      categories: categoryStats.map((cat) => ({
        name: cat._id,
        count: cat.count,
      })),
      statuses: statusStats.map((stat) => ({
        name: stat._id === "success" ? "Uğurlu" : "Uğursuz",
        value: stat._id,
        count: stat.count,
      })),
    };

    return res.json({
      success: true,
      data: filterOptions,
    });
  } catch (error) {
    console.error("getPartnerTransactionFilterOptions error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// Request delete for partner
export const requestDeletePartner = async (req, res) => {
  try {
    const partnerId = req.params.id;
    const adminUser = req.user;

    if (!partnerId) {
      return res.status(400).json({
        success: false,
        error: "Partner ID is required",
      });
    }

    // Find the partner
    const partner = await PartnerUser.findOne({ partnyor_id: partnerId });
    if (!partner) {
      return res.status(404).json({
        success: false,
        error: "Partner not found",
      });
    }

    // Check if there's already a pending delete request
    const existingRequest = await DeleteRequest.findOne({
      user: partner._id,
      status: "waiting",
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        error: "Bu istifadəçi üçün artıq silinmə müraciəti mövcuddur",
      });
    }

    // Create new delete request
    await DeleteRequest.create({
      user: partner._id,
      status: "waiting",
      requested_by: adminUser.id,
      reason: req.body.reason || "Silinmə müraciəti",
    });

    // Update partner status to 2 (waiting for deletion)
    await PartnerUser.findByIdAndUpdate(partner._id, { status: 2 });

    return res.json({
      success: true,
      message: "Silinmə müraciəti göndərildi",
    });
  } catch (error) {
    console.error("requestDeletePartner error:", error);
    return res.status(500).json({
      success: false,
      error: "Server xətası",
    });
  }
};

// Confirm delete for partner
export const confirmDeletePartner = async (req, res) => {
  try {
    const partnerId = req.params.id;
    const adminUser = req.user;

    if (!partnerId) {
      return res.status(400).json({
        success: false,
        error: "Partner ID is required",
      });
    }

    // Find the partner
    const partner = await PartnerUser.findOne({ partnyor_id: partnerId });
    if (!partner) {
      return res.status(404).json({
        success: false,
        error: "Partner not found",
      });
    }

    // Find the delete request
    const deleteRequest = await DeleteRequest.findOne({
      user: partner._id,
      status: "waiting",
    });

    if (!deleteRequest) {
      return res.status(404).json({
        success: false,
        error: "Silinmə müraciəti tapılmadı",
      });
    }

    // Update the delete request status to approved
    await DeleteRequest.findByIdAndUpdate(deleteRequest._id, {
      status: "approved",
    });

    return res.json({
      success: true,
      message: "Silinmə müraciəti təsdiqləndi",
    });
  } catch (error) {
    console.error("confirmDeletePartner error:", error);
    return res.status(500).json({
      success: false,
      error: "Server xətası",
    });
  }
};

// Toggle partner status (active/inactive)
export const togglePartnerStatus = async (req, res) => {
  try {
    const { id } = req.params; // partnyor_id
    const partner = await PartnerUser.findOne({ partnyor_id: id });
    if (!partner) {
      return res
        .status(404)
        .json({ success: false, error: "Partner not found" });
    }

    // 0 = inactive, 1 = active, 2 = deletion pending
    if (partner.status === 2) {
      return res.status(400).json({
        success: false,
        error: "Deletion pending. Cannot toggle status.",
      });
    }

    const nextStatus = partner.status === 1 ? 0 : 1;
    partner.status = nextStatus;
    await partner.save();

    return res.json({ success: true, status: nextStatus });
  } catch (err) {
    console.error("togglePartnerStatus error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// Partner ticket data endpoint
export const getPartnerTicketsData = async (req, res) => {
  try {
    const { partner_id } = req.params;
    const {
      search = "",
      status = "",
      start = 0,
      length = 10,
      draw = 1
    } = req.body;

    // Find the partner by partnyor_id
    const partner = await PartnerUser.findOne({ partnyor_id: partner_id });
    if (!partner) {
      return res.status(404).json({ success: false, error: "Partner not found" });
    }

    console.log("partner: ", partner);


    // Build query
    const query = {
      user_id: partner._id,
      userModel: 'PartnerUser'
    };

    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    // Add search filter if provided
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { ticket_id: { $regex: search, $options: "i" } }
      ];
    }

    // Execute query with pagination
    const tickets = await Ticket.find(query)
      .populate('reason', 'name')
      .populate('assigned', 'name email')
      .populate('user_id', 'name surname email')
      .sort({ createdAt: -1 })
      .skip(parseInt(start))
      .limit(parseInt(length))
      .lean();

    // Get total count
    const totalRecords = await Ticket.countDocuments({ user_id: partner._id, userModel: 'PartnerUser' });
    const filteredRecords = await Ticket.countDocuments(query);

    // Format tickets for frontend
    const formattedTickets = tickets.map(ticket => {
      // Format user initials
      const userName = ticket.user_id ? `${ticket.user_id.name || ""} ${ticket.user_id.surname || ""}`.trim() : "";
      const userInitials = userName.split(" ").map(n => n[0]).join("").toUpperCase();

      // Format date
      const createdDate = new Date(ticket.createdAt).toLocaleDateString('az-AZ');

      // Map status to Azerbaijani
      const statusMapping = {
        'qaralama': 'Qaralama',
        'baxilir': 'Baxılır',
        'hell_olundu': 'Həll olundu',
        'redd_edildi': 'Rədd edildi'
      };

      // Map priority
      const priorityMapping = {
        'high': 'High',
        'medium': 'Medium',
        'low': 'Low'
      };

      return {
        id: ticket.ticket_id,
        title: ticket.title,
        description: ticket.content,
        status: statusMapping[ticket.status] || ticket.status,
        priority: priorityMapping[ticket.priority] || 'Low',
        responsible: userName,
        userInitials: userInitials,
        date: createdDate,
        userType: "Partner",
        reasonName: ticket.reason?.name || "",
        assignedTo: ticket.assigned?.map(a => a.name).join(", ") || ""
      };
    });

    // Group by status for the kanban view
    const groupedTickets = {
      'Qaralama': formattedTickets.filter(t => t.status === 'Qaralama'),
      'Baxılır': formattedTickets.filter(t => t.status === 'Baxılır'),
      'Həll olundu': formattedTickets.filter(t => t.status === 'Həll olundu'),
      'Rədd edildi': formattedTickets.filter(t => t.status === 'Rədd edildi')
    };

    return res.json({
      success: true,
      data: formattedTickets,
      groupedData: groupedTickets,
      recordsTotal: totalRecords,
      recordsFiltered: filteredRecords,
      draw: parseInt(draw)
    });

  } catch (error) {
    console.error("getPartnerTicketsData error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// Partner ticket detail endpoint
export const getPartnerTicketDetail = async (req, res) => {
  try {
    const { partner_id, ticket_id } = req.params;

    // Find the partner by partnyor_id
    const partner = await PartnerUser.findOne({ partnyor_id: partner_id });
    if (!partner) {
      return res.status(404).render("error", {
        message: "Partner not found",
        error: { status: 404 }
      });
    }

    // Find the ticket with all related data
    const ticket = await Ticket.findOne({
      ticket_id: ticket_id,
      user_id: partner._id
    })
      .populate('reason', 'name text description')
      .populate('user_id', 'name surname email partnyor_id')
      .populate('muessise_id', 'muessise_name')
      .populate({
        path: 'assigned.user',
        select: 'name surname email profileImage role'
      })
      .populate({
        path: 'assigned.assignedBy',
        select: 'name surname email'
      })
      .lean();

    if (!ticket) {
      return res.status(404).render("error", {
        message: "Ticket not found",
        error: { status: 404 }
      });
    }

    // Format partner data
    const partnerData = {
      ...partner.toObject(),
      fullName: `${partner.name || ""} ${partner.surname || ""}`.trim(),
      initials: `${partner.name || ""}${partner.surname || ""}`.split("").slice(0, 2).join("").toUpperCase(),
      id: partner.partnyor_id || partner._id
    };

    // Format assigned users from the ticket's assigned array
    const assignedUsers = ticket.assigned && ticket.assigned.length > 0
      ? ticket.assigned.map(assignment => ({
        user: assignment.user || {},
        assignedAt: assignment.assignedAt || new Date(),
        isActive: assignment.isActive !== undefined ? assignment.isActive : false,
        assignedBy: assignment.assignedBy || null
      }))
      : [];

    // Fetch attachments from TicketFile collection
    const ticketFiles = await TicketFile.find({
      ticket_id: ticket._id,
      deleted: false
    })
      .populate('uploader', 'name surname')
      .sort({ createdAt: -1 })
      .lean();

    const attachments = ticketFiles.map(file => ({
      _id: file._id,
      filename: file.file_name,
      originalName: file.file_name,
      mimetype: file.file_type,
      size: parseInt(file.file_size) || 0,
      route: file.file_route,
      uploadedBy: file.uploader,
      uploadedAt: file.createdAt
    }));

    // Mock data for notes (you can implement this from a separate notes collection)
    const notes = [];

    // Add dynamic data to ticket
    const ticketData = {
      ...ticket,
      assignedUsers: assignedUsers,
      attachments: attachments,
      notes: notes
    };

    // Render the details page
    return res.render("pages/istifadeci-hovuzu/partner/sorguDetails.ejs", {
      partner: partnerData,
      ticket: ticketData,
      currentUser: req.user, // For identifying own notes
      csrfToken: req.csrfToken()
    });

  } catch (error) {
    console.error("getPartnerTicketDetail error:", error);
    return res.status(500).render("error", {
      message: "Server error",
      error: { status: 500 }
    });
  }
};

// Get available users for ticket assignment
export const getAvailableUsersForAssignment = async (req, res) => {
  try {
    const { partner_id, ticket_id } = req.params;

    // Find the partner
    const partner = await PartnerUser.findOne({ partnyor_id: partner_id });
    if (!partner) {
      return res.status(404).json({ success: false, error: "Partner not found" });
    }

    // Find the ticket to verify it exists and belongs to this partner
    const ticket = await Ticket.findOne({
      ticket_id: ticket_id,
      user_id: partner._id
    });

    if (!ticket) {
      return res.status(404).json({ success: false, error: "Ticket not found" });
    }

    // Get all admin users who can be assigned to tickets
    // Filtering by status 'active' and not soft deleted
    const availableUsers = await AdminUser.find({
      status: 'active',
      deleted: false
    })
      .select('name surname email profile_image profile_image_url duty adminUser_id')
      .populate('duty', 'name')
      .lean();

    // Get currently assigned user IDs (active assignments only)
    const currentAssignedUserIds = ticket.assigned
      ? ticket.assigned
        .filter(assignment => assignment.isActive === true)
        .map(assignment => assignment.user.toString())
      : [];

    // Format users for frontend
    const formattedUsers = availableUsers.map(user => ({
      _id: user._id,
      name: user.name || '',
      surname: user.surname || '',
      fullName: `${user.name || ''} ${user.surname || ''}`.trim(),
      email: user.email || '',
      profileImage: user.profile_image_url || user.profile_image || null,
      initials: `${user.name?.charAt(0) || ''}${user.surname?.charAt(0) || ''}`.toUpperCase(),
      role: user.duty?.name || 'Admin',
      adminUserId: user.adminUser_id
    }));

    return res.json({
      success: true,
      data: formattedUsers, // For ticketAssignment.js (tehkimEtPop)
      users: formattedUsers, // For sorgular.js (sorguPopup)
      currentAssignedUserIds: currentAssignedUserIds
    });

  } catch (error) {
    console.error("getAvailableUsersForAssignment error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// Assign user to ticket
export const assignUserToTicket = async (req, res) => {
  try {
    const { partner_id, ticket_id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: "User ID is required" });
    }

    // Find the partner
    const partner = await PartnerUser.findOne({ partnyor_id: partner_id });
    if (!partner) {
      return res.status(404).json({ success: false, error: "Partner not found" });
    }

    // Find the ticket
    const ticket = await Ticket.findOne({
      ticket_id: ticket_id,
      user_id: partner._id
    });

    if (!ticket) {
      return res.status(404).json({ success: false, error: "Ticket not found" });
    }

    // Verify the user exists
    const userToAssign = await AdminUser.findById(userId);
    if (!userToAssign) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Check if user is already assigned and active
    const existingActiveAssignment = ticket.assigned.find(
      a => a.user && a.user.toString() === userId && a.isActive
    );

    if (existingActiveAssignment) {
      return res.status(400).json({
        success: false,
        error: "Bu istifadəçi artıq bu sorğuya təhkim edilib"
      });
    }

    // Deactivate all current active assignments
    ticket.assigned.forEach(assignment => {
      if (assignment.isActive) {
        assignment.isActive = false;
      }
    });

    // Add new assignment
    ticket.assigned.push({
      user: userId,
      assignedAt: new Date(),
      isActive: true,
      assignedBy: req.user._id // The admin who is making this assignment
    });

    // Save the ticket
    await ticket.save();

    // Populate the new assignment for response
    await ticket.populate([
      {
        path: 'assigned.user',
        select: 'name surname email profileImage role'
      },
      {
        path: 'assigned.assignedBy',
        select: 'name surname email'
      }
    ]);

    // Get the latest assignment
    const latestAssignment = ticket.assigned[ticket.assigned.length - 1];

    return res.json({
      success: true,
      message: "İstifadəçi uğurla təhkim edildi",
      data: {
        assignment: {
          user: latestAssignment.user,
          assignedAt: latestAssignment.assignedAt,
          isActive: latestAssignment.isActive,
          assignedBy: latestAssignment.assignedBy
        }
      }
    });

  } catch (error) {
    console.error("assignUserToTicket error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// Upload files to ticket
export const uploadTicketFiles = async (req, res) => {
  try {
    console.log('=== uploadTicketFiles CALLED ===');
    console.log('req.params:', req.params);
    console.log('req.processedFiles:', req.processedFiles);

    const { partner_id, ticket_id } = req.params;

    // Find the partner
    const partner = await PartnerUser.findOne({ partnyor_id: partner_id });
    console.log('Partner found:', partner ? partner.partnyor_id : 'NOT FOUND');
    if (!partner) {
      return res.status(404).json({ success: false, error: "Partner not found" });
    }

    // Find the ticket
    const ticket = await Ticket.findOne({
      ticket_id: ticket_id,
      user_id: partner._id
    });
    console.log('Ticket found:', ticket ? ticket.ticket_id : 'NOT FOUND');

    if (!ticket) {
      return res.status(404).json({ success: false, error: "Ticket not found" });
    }

    // Check if files were processed by middleware
    if (!req.processedFiles || req.processedFiles.length === 0) {
      console.log('No processed files received');
      return res.status(400).json({
        success: false,
        error: "Fayl yüklənmədi"
      });
    }

    console.log(`Processing ${req.processedFiles.length} files for upload...`);

    // Create TicketFile documents for each uploaded file
    const uploadedFiles = [];
    for (const file of req.processedFiles) {
      console.log('Saving file to database:', file.filename);
      console.log('File route:', file.route);

      const ticketFile = new TicketFile({
        file_name: file.originalName,
        file_type: file.mimetype,
        file_route: file.route, // Relative web path
        file_path: file.route, // Store route instead of absolute path (deprecated field, kept for compatibility)
        file_size: file.size.toString(),
        uploader: partner._id,
        ticket_id: ticket._id,
        muessise_id: partner.muessise_id || null,
        sirket_id: partner.sirket_id || null
      });

      await ticketFile.save();
      console.log('File saved to database with ID:', ticketFile._id);

      uploadedFiles.push({
        _id: ticketFile._id,
        filename: ticketFile.file_name,
        mimetype: ticketFile.file_type,
        size: ticketFile.file_size,
        route: ticketFile.file_route,
        uploadedAt: ticketFile.createdAt
      });
    }

    console.log(`✅ Successfully saved ${uploadedFiles.length} files to database`);

    return res.json({
      success: true,
      message: `${uploadedFiles.length} fayl uğurla yükləndi`,
      data: uploadedFiles
    });

  } catch (error) {
    console.error("uploadTicketFiles error:", error);
    return res.status(500).json({
      success: false,
      error: "Fayllar yüklənərkən xəta baş verdi"
    });
  }
};

// Download ticket file
export const downloadTicketFile = async (req, res) => {
  try {
    console.log('=== downloadTicketFile CALLED ===');
    console.log('File ID:', req.params.file_id);

    const { file_id } = req.params;

    // Find the file
    const ticketFile = await TicketFile.findById(file_id);
    console.log('TicketFile found:', ticketFile ? 'YES' : 'NO');

    if (!ticketFile) {
      console.log('File not found in database');
      return res.status(404).json({ success: false, error: "Fayl tapılmadı" });
    }

    console.log('File details:', {
      name: ticketFile.file_name,
      route: ticketFile.file_route,
      type: ticketFile.file_type
    });

    // Construct absolute path from relative route
    // file_route is stored as: /files/uploads/sirket/{sirket_id}/tickets/{ticket_id}/{filename}
    const relativePath = ticketFile.file_route.replace(/^\/files\/uploads\//, '');
    // __dirname is at: /avankart/controllers/istifadeci-hovuzu/
    // We need to go up 2 levels to reach /avankart/, then into public/files/uploads/
    const absolutePath = path.join(__dirname, '..', '..', 'public', 'files', 'uploads', relativePath);

    console.log('Relative path:', relativePath);
    console.log('Absolute path:', absolutePath);

    // Check if file exists on disk
    const fs = await import('fs');
    if (!fs.existsSync(absolutePath)) {
      console.error(`❌ File not found at: ${absolutePath}`);
      return res.status(404).json({ success: false, error: "Fayl sistem üzərində tapılmadı" });
    }

    console.log('✅ File exists on disk, sending...');

    // Use res.download() for reliable file downloads
    try {
      res.download(absolutePath, ticketFile.file_name, (err) => {
        if (err) {
          console.error('❌ Download error:', err);
          if (!res.headersSent) {
            return res.status(500).json({
              success: false,
              error: "Fayl endirilməsində xəta baş verdi"
            });
          }
        } else {
          console.log('✅ File downloaded successfully');
        }
      });
    } catch (downloadError) {
      console.error('❌ Error initiating download:', downloadError);
      return res.status(500).json({
        success: false,
        error: "Fayl göndərilməsində xəta"
      });
    }

  } catch (error) {
    console.error("downloadTicketFile error:", error);
    return res.status(500).json({
      success: false,
      error: "Fayl endirilməsində xəta baş verdi"
    });
  }
};

export const updateTicket = async (req, res) => {
  try {
    console.log('=== updateTicket CALLED ===');
    const { partner_id, ticket_id } = req.params;
    const { category, reason, subject, subjectId, priority, title, content, assignedUser, status } = req.body;

    console.log('Update data:', { partner_id, ticket_id, category, reason, subject, priority, title, content, assignedUser, status });

    // Find the ticket
    const ticket = await Ticket.findOne({ ticket_id });

    if (!ticket) {
      console.log('❌ Ticket not found');
      return res.status(404).json({ success: false, error: "Sorğu tapılmadı" });
    }

    // Update basic fields - only if they have values
    if (category !== undefined && category !== '') ticket.category = category;
    if (priority !== undefined && priority !== '') ticket.priority = priority;
    if (title !== undefined && title !== '') ticket.title = title;
    if (content !== undefined && content !== '') ticket.content = content;
    if (subject !== undefined && subject !== '') ticket.subject = subject;
    if (status !== undefined && status !== '') {
      console.log('📊 Updating status to:', status);
      ticket.status = status;
    }

    // Update reason (if provided)
    if (reason !== undefined && reason !== '') {
      console.log('🔍 Looking for reason:', reason);

      // Try exact match first
      let reasonDoc = await SorgularReason.findOne({ name: reason });

      // If not found, try case-insensitive search
      if (!reasonDoc) {
        reasonDoc = await SorgularReason.findOne({
          name: { $regex: new RegExp(`^${reason}$`, 'i') }
        });
      }

      // If still not found, try partial match (contains)
      if (!reasonDoc) {
        reasonDoc = await SorgularReason.findOne({
          name: { $regex: new RegExp(reason, 'i') }
        });
      }

      if (reasonDoc) {
        console.log('✅ Found reason:', reasonDoc.name, 'ID:', reasonDoc._id);
        ticket.reason = reasonDoc._id;
      } else {
        console.log('❌ Reason not found in database:', reason);
        console.log('Available reasons:', await SorgularReason.find({}, 'name').lean());
        ticket.reason = null;
      }
    } else if (reason === '') {
      ticket.reason = null;
    }

    // Update subject ID if provided
    if (subjectId !== undefined && subjectId !== '') {
      ticket.subjectId = subjectId;
    }

    // Update assigned user if provided
    if (assignedUser && assignedUser !== '') {
      console.log('👤 Assigning user:', assignedUser);

      // Check if user is already actively assigned
      const alreadyAssigned = ticket.assigned && ticket.assigned.some(
        assignment => assignment.isActive && assignment.user.toString() === assignedUser.toString()
      );

      if (alreadyAssigned) {
        console.log('⚠️ User already assigned to this ticket');
        return res.status(400).json({
          success: false,
          error: "Bu istifadəçi artıq bu sorğuya təyin edilib"
        });
      }

      // Validate that the user exists
      const userExists = await AdminUser.findById(assignedUser);
      if (userExists) {
        console.log('✅ User found:', userExists.name, userExists.surname);

        // Deactivate all current assignments
        if (ticket.assigned && ticket.assigned.length > 0) {
          ticket.assigned.forEach(assignment => {
            assignment.isActive = false;
          });
          console.log(`Deactivated ${ticket.assigned.length} previous assignment(s)`);
        }

        // Add new assignment
        ticket.assigned.push({
          user: assignedUser,
          assignedAt: new Date(),
          isActive: true,
          assignedBy: req.user.id || req.user._id
        });

        console.log('✅ New assignment created');
      } else {
        console.log('❌ User not found:', assignedUser);
        return res.status(400).json({
          success: false,
          error: "Seçilən istifadəçi tapılmadı"
        });
      }
    }

    // Save the updated ticket
    await ticket.save();

    console.log('✅ Ticket updated successfully');

    return res.status(200).json({
      success: true,
      message: "Sorğu uğurla yeniləndi",
      ticket
    });

  } catch (error) {
    console.error("updateTicket error:", error);
    return res.status(500).json({
      success: false,
      error: "Sorğu yeniləməsində xəta baş verdi"
    });
  }
};

export const deleteTicketFile = async (req, res) => {
  try {
    console.log('=== deleteTicketFile CALLED ===');
    const { file_id } = req.params;

    console.log('File ID to delete:', file_id);

    // Find the file
    const ticketFile = await TicketFile.findById(file_id);

    if (!ticketFile) {
      console.log('❌ File not found in database');
      return res.status(404).json({ success: false, error: "Fayl tapılmadı" });
    }

    console.log('File to delete:', {
      name: ticketFile.file_name,
      route: ticketFile.file_route
    });

    // Construct absolute path
    const relativePath = ticketFile.file_route.replace(/^\/files\/uploads\//, '');
    const absolutePath = path.join(__dirname, '..', '..', 'public', 'files', 'uploads', relativePath);

    console.log('File path:', absolutePath);

    // Delete file from disk
    const fs = await import('fs');
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      console.log('✅ File deleted from disk');
    } else {
      console.log('⚠️ File not found on disk, but will remove from database');
    }

    // Delete from database
    await TicketFile.findByIdAndDelete(file_id);
    console.log('✅ File deleted from database');

    return res.status(200).json({
      success: true,
      message: "Fayl uğurla silindi"
    });

  } catch (error) {
    console.error("deleteTicketFile error:", error);
    return res.status(500).json({
      success: false,
      error: "Fayl silinməsində xəta baş verdi"
    });
  }
};

export const deleteTicket = async (req, res) => {
  try {
    console.log('=== deleteTicket CALLED ===');
    const { partner_id, ticket_id } = req.params;

    console.log('Deleting ticket:', { partner_id, ticket_id });

    // Find the ticket
    const ticket = await Ticket.findOne({ ticket_id });

    if (!ticket) {
      console.log('❌ Ticket not found');
      return res.status(404).json({ success: false, error: "Sorğu tapılmadı" });
    }

    // Delete all associated files from disk
    if (ticket.attachments && ticket.attachments.length > 0) {
      console.log(`🗑️ Deleting ${ticket.attachments.length} associated file(s)...`);

      for (const attachment of ticket.attachments) {
        try {
          const filePath = path.join(process.cwd(), 'public', attachment.path);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log('✅ Deleted file:', filePath);
          }

          // Delete from TicketFile collection
          await TicketFile.findByIdAndDelete(attachment._id);
        } catch (fileError) {
          console.error('Error deleting file:', attachment.filename, fileError);
          // Continue with other files even if one fails
        }
      }
    }

    // Delete the ticket
    await Ticket.findOneAndDelete({ ticket_id });
    console.log('✅ Ticket deleted successfully');

    return res.status(200).json({
      success: true,
      message: "Sorğu uğurla silindi"
    });

  } catch (error) {
    console.error("deleteTicket error:", error);
    return res.status(500).json({
      success: false,
      error: "Sorğu silinməsində xəta baş verdi"
    });
  }
};
