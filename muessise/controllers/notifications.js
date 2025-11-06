/**
 * - $gte / $lte → filters documents by a date range (greater/less than or equal)
 * - $in → matches any value in the specified array (e.g., statuses)
 * - $or → matches if at least one condition is true (used for multi-field search)
 * - $regex → performs pattern matching on string fields
 */
import NotificationModel from "../../shared/models/notificationModel.js";
import PartnerUser from "../../shared/models/partnyorUserModel.js";

export const notificationsPersonalTable = async (req, res) => {
  try {
    const userId = req.user?.id;
    const {
      start_date,
      end_date,
      statuses,
      query,
      search,
      category,
      start = 0,
      length = 10,
      draw = 1,
    } = req.body;

    //  Base filter başlanğıcı
    let baseFilter = {};

    //  Əgər corporate tipidirsə, userId ilə PartnerUser tapıb muessise_id al
    if (category === "corporate") {
      const partnerUser = await PartnerUser.findById(userId);
      if (!partnerUser || !partnerUser.muessise_id) {
        return res.status(404).json({ error: "User or muessise not found" });
      }
      baseFilter.muessise_id = partnerUser.muessise_id;
    } else {
      //  Personal notification-lar üçün sadəcə user id istifadə olunur
      baseFilter.user = userId;
    }

    // Date range filter
    if (start_date || end_date) {
      baseFilter.createdAt = {};
      if (start_date) baseFilter.createdAt.$gte = new Date(start_date);
      if (end_date) baseFilter.createdAt.$lte = new Date(end_date);
    }

    // Search filter
    if (search && search.value) {
      baseFilter.$and = baseFilter.$and || [];
      baseFilter.$and.push({
        $or: [
          { title: { $regex: search.value, $options: "i" } },
          { content: { $regex: search.value, $options: "i" } },
        ],
      });
    }

    //  Status filter
    if (Array.isArray(statuses) && statuses.length > 0) {
      baseFilter.status = { $in: statuses };
    }

    //  Category filter
    if (category) {
      baseFilter.category = category;
    }

    // ✅ Total counts
    const corporateTotal = await NotificationModel.countDocuments({
      muessise_id: (await PartnerUser.findById(userId))?.muessise_id,
      category: "corporate",
    });
    const personalTotal = await NotificationModel.countDocuments({
      user: userId,
      category: "personal",
    });

    // ✅ Count (with applied filter)
    const recordsFiltered = await NotificationModel.countDocuments(baseFilter);

    // ✅ Get notifications
    const notifications = await NotificationModel.find(baseFilter)
      .sort({ createdAt: -1 })
      .skip(Number(start))
      .limit(Number(length));

    // ✅ Count unread/read by category
    const corporateFiltered = await NotificationModel.find({
      muessise_id: (await PartnerUser.findById(userId))?.muessise_id,
      category: "corporate",
    });
    const personalFiltered = await NotificationModel.find({
      user: userId,
      category: "personal",
    });

    const corporateCounts = { total: 0, read: 0, unread: 0 };
    const personalCounts = { total: 0, read: 0, unread: 0 };

    corporateFiltered.forEach((n) => {
      corporateCounts.total++;
      if (n.status === "unread") corporateCounts.unread++;
      else corporateCounts.read++;
    });

    personalFiltered.forEach((n) => {
      personalCounts.total++;
      if (n.status === "unread") personalCounts.unread++;
      else personalCounts.read++;
    });

    const data = notifications.map((n) => ({
      id: n._id,
      title: n.title,
      content: n.text,
      status: n.status === "unread" ? "Yeni" : "Oxundu",
      status_data: n.status === "unread" ? "read" : "unread",
      date: new Date(n.createdAt).toLocaleString("az-AZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));

    return res.status(200).json({
      data,
      recordsTotal: category === "corporate" ? corporateTotal : personalTotal,
      recordsFiltered,
      counts: {
        corporate: corporateCounts,
        personal: personalCounts,
      },
    });
  } catch (error) {
    console.error("notificationsPersonalTable error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export const notificationsPage = async (req, res) => {
  try {
    const userId = req.user?.id;
    const user = await PartnerUser.findById(userId);
    return res.render("../../muessise/views/pages/notifications", {
      activeLang: req.getLocale(),
      csrfToken: req.csrfToken(),
      user,
    });
  } catch (error) {
    console.error("notificationsPage error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export const setas = async (req, res) => {
  try {
    const { id, status = "read" } = req.body;
    const userId = req.user.id;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Notfication Id is required." });
    }

    const user = await PartnerUser.findById(userId).select("muessise_id");
    if (!user || !user.muessise_id) {
      return res.status(403).json({
        success: false,
        message: "Access Denied, User muessieye aid deyil.",
      });
    }

    const notfication = await NotificationModel.findOne({
      _id: id,
      $or: [
        { user: userId, category: "personal" },
        { muessise_id: user.muessise_id, category: "corporate" },
      ],
    });

    if (!notfication) {
      return res
        .status(404)
        .json({ success: false, message: "Notfication not found." });
    }

    if (!["read", "unread"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    if (!notfication.creatorModel) notfication.creatorModel = "AdminUser";
    notfication.status = status;
    await notfication.save();

    return res
      .status(200)
      .json({ success: true, message: "Notfication status updated." });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error." });
  }
};
