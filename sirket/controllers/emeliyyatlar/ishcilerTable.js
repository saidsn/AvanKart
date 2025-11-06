import mongoose from "mongoose";
import AddCardBalance from "../../../shared/model/people/addBalances.js";
import PeopleUser from "../../../shared/models/peopleUserModel.js";
import InvitePeople from "../../../shared/model/people/invitePeopleModel.js";

export const iscilerTable = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      start_date,
      end_date,
      genders,
      search,
      tab,
    } = req.body || {};

    const me = await PeopleUser.findById(req.user.id).select("sirket_id");
    if (!me?.sirket_id) {
      return res.status(404).json({ message: "Şirkət tapılmadı" });
    }

    const dtStart = Number(req.body.start ?? 0);
    const dtLength = Number(req.body.length ?? 0);
    const perPage = dtLength > 0 ? dtLength : Number(limit) || 10;
    const pageNum =
      dtLength > 0 ? Math.floor(dtStart / perPage) + 1 : Number(page) || 1;
    const skip = (pageNum - 1) * perPage;

    // Build filter for PeopleUsers
    const userFilter = { sirket_id: me.sirket_id };

    if (start_date || end_date) {
      userFilter.createdAt = {};
      if (start_date) userFilter.createdAt.$gte = new Date(start_date);
      if (end_date) userFilter.createdAt.$lte = new Date(end_date);
    }

    if (Array.isArray(genders) && genders.length) {
      userFilter.gender = { $in: genders };
    }

    if (tab === "aktiv") userFilter.dismissal_date = null;
    if (tab === "ayrilan") userFilter.dismissal_date = { $ne: null };

    const searchRegex = search ? String(search).trim() : "";
    if (searchRegex) {
      userFilter.$or = [
        { name: { $regex: searchRegex, $options: "i" } },
        { surname: { $regex: searchRegex, $options: "i" } },
        { email: { $regex: searchRegex, $options: "i" } },
        { phone: { $regex: searchRegex, $options: "i" } },
        { people_id: { $regex: searchRegex, $options: "i" } },
      ];
    }

    // Get PeopleUsers
    const peopleUsers = await PeopleUser.find(userFilter)
      .populate("duty", "name")
      .populate("imtiyaz", "name")
      .sort({ createdAt: -1 })
      .lean();

    // Build filter for InvitePeople (only if tab is not "ayrilan")
    let invitedUsers = [];
    if (tab !== "ayrilan") {
      const inviteFilter = {
        sirket_id: me.sirket_id,
        status: { $in: ["pending", "rejected"] },
      };

      if (start_date || end_date) {
        inviteFilter.createdAt = {};
        if (start_date) inviteFilter.createdAt.$gte = new Date(start_date);
        if (end_date) inviteFilter.createdAt.$lte = new Date(end_date);
      }

      // Get invited people with populated user data
      const invites = await InvitePeople.find(inviteFilter)
        .populate({
          path: "user_id",
          select: "name surname email phone people_id gender",
        })
        .sort({ createdAt: -1 })
        .lean();

      // Filter invited users by search and gender
      invitedUsers = invites
        .filter((invite) => {
          if (!invite.user_id) return false;

          // Gender filter
          if (Array.isArray(genders) && genders.length) {
            if (!genders.includes(invite.user_id.gender)) return false;
          }

          // Search filter
          if (searchRegex) {
            const userData = invite.user_id;
            const searchFields = [
              userData.name,
              userData.surname,
              userData.email,
              userData.phone,
              userData.people_id,
            ].filter(Boolean);

            const matchesSearch = searchFields.some((field) =>
              new RegExp(searchRegex, "i").test(field)
            );

            if (!matchesSearch) return false;
          }

          return true;
        })
        .map((invite) => ({
          _id: invite.user_id._id,
          id: invite.user_id.people_id || "",
          name: [invite.user_id.name, invite.user_id.surname]
            .filter(Boolean)
            .join(" ")
            .trim() || invite.user_id.email?.split("@")[0] || invite.user_id.people_id || "",
          gender: invite.user_id.gender || "",
          position: "",
          department: "",
          email: invite.user_id.email || "",
          phone: invite.user_id.phone || "",
          status: "Invite",
          inviteStatus: invite.status,
          start: invite.createdAt,
          endDate: null,
        }));
    }

    // Format PeopleUsers
    const formattedUsers = peopleUsers.map((user) => {
      const fullName = [user.name, user.surname].filter(Boolean).join(" ").trim();
      return {
        _id: user._id,
        id: user.people_id || "",
        name: fullName || user.email?.split("@")[0] || user.people_id || "",
        gender: user.gender || "",
        position: user.duty?.name || "",
        department: user.imtiyaz?.name || "",
        email: user.email || "",
        phone:
          user.phone_suffix && user.phone
            ? `+${user.phone_suffix}${user.phone}`
            : user.phone || "",
        status:
          user.status === 1
            ? "Aktiv"
            : user.status === 0
            ? "Qaralama"
            : user.status === 2
            ? "Ayrılan"
            : "Naməlum",
        inviteStatus: null,
        start: user.hire_date || user.createdAt,
        endDate: user.dismissal_date || null,
      };
    });
    console.log('inviteds')
    console.log(invitedUsers);
    // Combine and sort all users
    const allUsers = [...formattedUsers, ...invitedUsers].sort(
      (a, b) => new Date(b.start) - new Date(a.start)
    );

    // Pagination
    const paginatedData = allUsers.slice(skip, skip + perPage);

    // Get total counts
    const recordsTotal = await PeopleUser.countDocuments({
      sirket_id: me.sirket_id,
    }) + (tab !== "ayrilan" 
      ? await InvitePeople.countDocuments({
          sirket_id: me.sirket_id,
          status: { $in: ["pending", "rejected"] },
        })
      : 0);

    const recordsFiltered = allUsers.length;

    return res.json({
      data: paginatedData,
      recordsTotal,
      recordsFiltered,
      page: pageNum,
      limit: perPage,
    });
  } catch (err) {
    console.error("iscilerTable error:", err);
    return res.status(500).json({ message: "Server xətası", error: err.message });
  }
};

export const iscilerTablePerm = async (req, res) => {
  try {
    const { draw, start = 0, length = 10, id } = req.body || {};

    const peopleUser = await PeopleUser.findById(req.user.id).select(
      "sirket_id"
    );
    if (!peopleUser || !peopleUser.sirket_id) {
      return res.status(404).json({ message: "Şirkət tapılmadı" });
    }

    const sirketId = new mongoose.Types.ObjectId(peopleUser.sirket_id);
    const permId = new mongoose.Types.ObjectId(id);

    const match = { sirket_id: sirketId, imtiyaz: permId };

    const recordsTotal = await PeopleUser.countDocuments(match);

    const data = await PeopleUser.aggregate([
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $skip: parseInt(start) },
      { $limit: parseInt(length) },
      {
        $lookup: {
          from: "Duties",
          localField: "duty",
          foreignField: "_id",
          as: "dutyData",
        },
      },
      {
        $addFields: {
          dutyData: {
            $cond: {
              if: { $gt: [{ $size: "$dutyData" }, 0] },
              then: { $arrayElemAt: ["$dutyData.name", 0] },
              else: "-",
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          people_id: 1,
          name: 1,
          perm: 1,
          imtiyaz: 1,
          surname: 1,
          duty: 1,
          dutyData: 1,
        },
      },
    ]);

    return res.json({
      draw,
      recordsTotal,
      recordsFiltered: recordsTotal,
      data,
    });
  } catch (err) {
    console.error("iscilerTable error:", err);
    return res
      .status(500)
      .json({ message: "Server xətası", error: err.message });
  }
};
