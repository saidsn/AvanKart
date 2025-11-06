import Audit from "../../../shared/models/auditModel.js";

// Create audit log
export const createAuditLog = async (req, res) => {
  try {
    const { action, path, page, resource, resource_id, details } = req.body;

    const userId = req.session?.user?.id || req.user?.id;
    const userName = req.session?.user?.name || req.user?.name;
    const userPosition = req.session?.user?.position || req.user?.position;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "İstifadəçi təsdiqlənməyib",
      });
    }

    const auditLog = new Audit({
      user_id: userId,
      user_name: userName,
      user_position: userPosition,
      action,
      path,
      page: page || path,
      resource,
      resource_id,
      details,
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get("user-agent"),
    });

    await auditLog.save();

    return res.status(201).json({
      success: true,
      message: "Audit loqu uğurla əlavə edildi",
      data: auditLog,
    });
  } catch (error) {
    console.error("Error creating audit log:", error);
    return res.status(500).json({
      success: false,
      message: "Xəta baş verdi",
      error: error.message,
    });
  }
};

// Get all audit logs with filtering and pagination
export const getAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      action,
      resource,
      user_id,
      startDate,
      endDate,
      search,
    } = req.query;

    // Build query
    const query = { deleted: false };

    // Support multiple actions (comma-separated)
    if (action) {
      const actions = action.split(",").map((a) => a.trim());
      if (actions.length > 1) {
        query.action = { $in: actions };
      } else {
        query.action = action;
      }
    }

    if (resource) query.resource = resource;
    if (user_id) query.user_id = user_id;

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        // Set end date to end of day
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endOfDay;
      }
    }

    // Search in user_name, page, or resource
    if (search) {
      query.$or = [
        { user_name: { $regex: search, $options: "i" } },
        { page: { $regex: search, $options: "i" } },
        { resource: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [audits, total] = await Promise.all([
      Audit.find(query)
        .populate("user_id", "name email position")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Audit.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: audits,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return res.status(500).json({
      success: false,
      message: "Xəta baş verdi",
      error: error.message,
    });
  }
};

// Get audit statistics
export const getAuditStats = async (req, res) => {
  try {
    const stats = await Audit.aggregate([
      { $match: { deleted: false } },
      {
        $group: {
          _id: "$action",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get resource-specific stats
    const resourceStats = await Audit.aggregate([
      { $match: { deleted: false } },
      {
        $group: {
          _id: "$resource",
          count: { $sum: 1 },
        },
      },
    ]);

    // Format statistics
    const formattedStats = {
      total: stats.reduce((sum, item) => sum + item.count, 0),
      changes: stats.find((s) => s._id === "UPDATE")?.count || 0,
      deletions: stats.find((s) => s._id === "DELETE")?.count || 0,
      approvals: stats.find((s) => s._id === "APPROVE")?.count || 0,
      creates: stats.find((s) => s._id === "CREATE")?.count || 0,
      approvedMuessise:
        resourceStats.find(
          (s) => s._id === "Müəssisə" || s._id === "Üzv müəssisələr"
        )?.count || 0,
      addedSirket:
        resourceStats.find((s) => s._id === "Şirkət" || s._id === "Üzv şirkət")
          ?.count || 0,
    };

    return res.status(200).json({
      success: true,
      data: formattedStats,
    });
  } catch (error) {
    console.error("Error fetching audit stats:", error);
    return res.status(500).json({
      success: false,
      message: "Xəta baş verdi",
      error: error.message,
    });
  }
};

// Get single audit log by ID
export const getAuditLogById = async (req, res) => {
  try {
    const { id } = req.params;

    const audit = await Audit.findOne({ _id: id, deleted: false }).populate(
      "user_id",
      "name email position"
    );

    if (!audit) {
      return res.status(404).json({
        success: false,
        message: "Audit loqu tapılmadı",
      });
    }

    return res.status(200).json({
      success: true,
      data: audit,
    });
  } catch (error) {
    console.error("Error fetching audit log:", error);
    return res.status(500).json({
      success: false,
      message: "Xəta baş verdi",
      error: error.message,
    });
  }
};

// Delete audit logs (soft delete)
export const deleteAuditLogs = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Silinəcək audit loqların ID-ləri göndərilməlidir",
      });
    }

    await Audit.updateMany({ _id: { $in: ids } }, { deleted: true });

    return res.status(200).json({
      success: true,
      message: `${ids.length} audit loqu uğurla silindi`,
    });
  } catch (error) {
    console.error("Error deleting audit logs:", error);
    return res.status(500).json({
      success: false,
      message: "Xəta baş verdi",
      error: error.message,
    });
  }
};

// Export audit logs to Excel (returns data for frontend to process)
export const exportAuditLogs = async (req, res) => {
  try {
    const { action, resource, user_id, startDate, endDate } = req.query;

    // Build query
    const query = { deleted: false };

    if (action) query.action = action;
    if (resource) query.resource = resource;
    if (user_id) query.user_id = user_id;

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const audits = await Audit.find(query)
      .populate("user_id", "name email position")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: audits,
      count: audits.length,
    });
  } catch (error) {
    console.error("Error exporting audit logs:", error);
    return res.status(500).json({
      success: false,
      message: "Xəta baş verdi",
      error: error.message,
    });
  }
};
