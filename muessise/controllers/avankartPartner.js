import PartnerUser from "../../shared/models/partnyorUserModel.js";
import TransactionsUser from "../../shared/models/transactionsModel.js";
import mongoose from "mongoose";
import Cards from "../../shared/models/cardModel.js";
import OldMuessiseUsers from "../../shared/model/partner/oldMuessiseUsers.js";
import InvitePartner from "../../shared/model/partner/invitePartnerModel.js";

export const getAvankartPartnerPage = (req, res) => {
  return res.render("pages/avankartPartner/partner.ejs", {
    error: "",
    csrfToken: req.csrfToken(),
    layout: "./layouts/main.ejs",
  });
};

export const partnerTable = async (req, res) => {
  try {
    const {
      search = [],
      start_date,
      end_date,
      draw = 1,
      start = 0,
      length = 10,
      gender = ["male", "female"],
      category = "current",
      users = [],
    } = req.body;

    const currentUser = await PartnerUser.findById(req.user?.id);
    if (!currentUser)
      return res
        .status(401)
        .json({ message: res.__("messages.avankartPartner.unauthorized") });

    // Normalize incoming date parameters: accept snake_case or camelCase
    const startDateValue = start_date || req.body.startDate || null;
    const endDateValue = end_date || req.body.endDate || null;

    // Ensure variables are declared to avoid ReferenceError when assigning later
    let usersCount = 0;
    let userList = [];
    let invitedList = [];

    // Build base query
    const baseQuery = {
      muessise_id: currentUser.muessise_id,
      ...(search[1] && {
        $or: [
          { name: { $regex: search[0], $options: "i" } },
          { surname: { $regex: search[0], $options: "i" } },
          { email: { $regex: search[0], $options: "i" } },
        ],
      }),
      gender: { $in: gender },
    };

    // Attach date range filter if provided. We compare a unified date:
    // use hire_date when present, otherwise fall back to createdAt.
    if (startDateValue || endDateValue) {
      const rangeFilter = {};
      if (startDateValue) rangeFilter.$gte = new Date(startDateValue);
      if (endDateValue) {
        const ed = new Date(endDateValue);
        ed.setHours(23, 59, 59, 999); // inclusive end of day
        rangeFilter.$lte = ed;
      }

      baseQuery.$and = [
        {
          $or: [
            { hire_date: { $exists: true, $ne: null, ...rangeFilter } },
            {
              $and: [
                { hire_date: { $in: [null, undefined] } },
                { createdAt: { ...rangeFilter } },
              ],
            },
          ],
        },
      ];
    }

    if (category === "current") {
      const query = {
        ...baseQuery,
        ...(users.length > 0 && { _id: { $in: users } }),
      };

      usersCount = await PartnerUser.countDocuments(query);
      userList = await PartnerUser.find(query).lean();

      const inviteQuery = {
        muessise_id: currentUser.muessise_id,

        status: { $in: ["pending", "rejected", "accepted"] },
        ...(startDateValue && {
          createdAt: { $gte: new Date(startDateValue) },
        }),
        ...(endDateValue && { createdAt: { $lte: new Date(endDateValue) } }),
      };

      const invites = await InvitePartner.find(inviteQuery)
        .populate({
          path: "user_id",
          select:
            "name surname email phone phone_suffix partnyor_id gender total_qr_codes",
        })
        .lean();

      invitedList = invites
        .filter((invite) => {
          if (!invite.user_id) return false;

          if (!gender.includes(invite.user_id.gender)) return false;

          if (search && search[1]) {
            const u = invite.user_id;
            const fullName = `${u.name || ""} ${u.surname || ""}`.trim();
            const reverseFullName = `${u.surname || ""} ${u.name || ""}`.trim();
            const fields = [
              u.name,
              u.surname,
              u.email,
              fullName,
              reverseFullName,
            ].filter(Boolean);
            const matches = fields.some((f) =>
              new RegExp(search[0], "i").test(f)
            );
            if (!matches) return false;
          }

          if (users.length > 0) {
            if (
              !users.some(
                (id) => id.toString() === invite.user_id._id.toString()
              )
            ) {
              return false;
            }
          }

          return true;
        })
        .map((invite) => ({
          id: invite.user_id._id ?? invite.user_id.partnyor_id ?? "",
          fullname:
            `${invite.user_id.name || ""} ${invite.user_id.surname || ""}`.trim(),
          gender: res.__("partials.popup.muessiseEditPopup.male"),
          email: invite.user_id.email,
          qrCodeCount: invite.user_id.total_qr_codes || 0,
          partner_id: invite.user_id.partnyor_id,
          phoneNumber: `+${invite.user_id.phone_suffix ?? "994"} ${invite.user_id.phone || ""}`,
          start: "N/A",
          hireDate: "N/A",
          dismissalDate: "N/A",
          isInvite: true,
          inviteStatus: res.__("isciler." + invite.status),
          inviteRawStatus: invite.status,
          sortDate: invite.createdAt,
        }));

      const formattedUsers = userList.map((user) => {
        return {
          id: user._id ?? user.partnyor_id ?? "",
          fullname: `${user.name} ${user.surname ?? ""}`,
          gender: user.gender,
          email: user.email,
          qrCodeCount: user.total_qr_codes || 0,
          partner_id: user.partnyor_id,
          phoneNumber: `+${user.phone_suffix ?? "994"} ${user.phone}`,
          start:
            user.hire_date || user.createdAt
              ? (user.hire_date || user.createdAt).toLocaleDateString("az-AZ", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })
              : "N/A",
          hireDate:
            user.hire_date || user.createdAt
              ? (user.hire_date || user.createdAt).toLocaleDateString("az-AZ", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })
              : "N/A",
          dismissalDate: user.dismissal_date
            ? user.dismissal_date.toLocaleDateString("az-AZ", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })
            : "N/A",
          isInvite: false,
          sortDate: user.hire_date || user.createdAt,
        };
      });

      const allUsers = [...formattedUsers, ...invitedList].sort(
        (a, b) => new Date(b.sortDate) - new Date(a.sortDate)
      );

      usersCount = formattedUsers.length + invitedList.length;
      const paginated = allUsers.slice(
        Number(start),
        Number(start) + Number(length)
      );
      paginated.forEach((u) => delete u.sortDate);

      return res.status(200).json({
        draw: Number(draw),
        recordsTotal: usersCount,
        recordsFiltered: allUsers.length,
        data: paginated,
      });
    }

    if (category === "old") {
      const query = {
        ...baseQuery,
        ...(users.length > 0 && { user_id: { $in: users } }),
      };

      usersCount = await OldMuessiseUsers.countDocuments(query);
      userList = await OldMuessiseUsers.find(query)
        .populate("user_id")
        .populate("muessise_id")
        .limit(Number(length))
        .skip(Number(start));

      const formattedUsers = userList.map((oldUser) => {
        return {
          id: oldUser.user_id._id,
          fullname: `${oldUser.user_id.name} ${oldUser.user_id.surname}`,
          email: oldUser.user_id.email,
          phoneNumber: `+${oldUser.user_id.phone_suffix} ${oldUser.user_id.phone}`,
          partner_id: oldUser.user_id.partnyor_id,
          qr: oldUser.user_id.total_qr_codes || 0,
          start: oldUser.hire_date
            ? oldUser.hire_date.toLocaleDateString("az-AZ", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })
            : "N/A",
          end: oldUser.end_date
            ? oldUser.end_date.toLocaleDateString("az-AZ", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })
            : "N/A",
          hireDate: oldUser.hire_date
            ? oldUser.hire_date.toLocaleDateString("az-AZ", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })
            : "N/A",
          dismissalDate: oldUser.end_date
            ? oldUser.end_date.toLocaleDateString("az-AZ", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })
            : "N/A",
        };
      });

      return res.status(200).json({
        draw: Number(draw),
        recordsTotal: usersCount,
        recordsFiltered: formattedUsers.length,
        data: formattedUsers,
      });
    }

    return res
      .status(400)
      .json({ message: res.__("messages.avankartPartner.invalid_category") });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: res.__("messages.avankartPartner.server_error") });
  }
};

export const partnerTransactionsTable = async (req, res) => {
  try {
    const {
      search = "",
      start_date,
      end_date,
      draw,
      min,
      max,
      start = 0,
      length = 10,
      card_status,
      user_id,
      card_category = [],
    } = req.body;

    const user = await PartnerUser.findById({ _id: user_id });

    if (!user) {
      return res.status(200).json({
        success: false,
        error: res.__("messages.avankartPartner.user_not_found"),
        draw: parseInt(draw) || 0,
        recordsTotal: 0,
        recordsFiltered: 0,
        data: [],
      });
    }

    const filters = {
      to: user.muessise_id,
      user: new mongoose.Types.ObjectId(user_id),
    };

    // Card status filter
    if (card_status) {
      filters.status = card_status;
    }

    // Card category filter
    const cardIdFilter = [];
    if (card_category?.length) {
      const validIds = card_category.filter(mongoose.Types.ObjectId.isValid);
      if (validIds.length > 0) {
        filters.cards = {
          $in: validIds.map((id) => new mongoose.Types.ObjectId(id)),
        };
      }
    }

    // Tarih filtresi (saat dahil)
    if (start_date && end_date) {
      const start = new Date(start_date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(end_date);
      end.setHours(23, 59, 59, 999);

      filters.createdAt = {
        $gte: start,
        $lte: end,
      };
    }

    // Mebleg aralığı filtresi
    const minAmount = parseFloat(min);
    const maxAmount = parseFloat(max);
    if (!isNaN(minAmount) && !isNaN(maxAmount)) {
      filters.amount = {
        $gte: minAmount,
        $lte: maxAmount,
      };
    }
    let searchStatus;
    let statuses = {
      Uğurlu: "success",
      Uğursuz: "failed",
      Gözləmədə: "pending",
      success: "success",
      failed: "failed",
      pending: "pending",
    };

    if (search === "Uğurlu" || search === "Uğursuz" || search === "Gözləmədə") {
      searchStatus = statuses[search];
    }

    // Arama filtresi
    const searchFilter = search
      ? [
          { transaction_id: { $regex: search, $options: "i" } },
          { subject: { $regex: search, $options: "i" } },
          ...(searchStatus
            ? [{ status: { $regex: searchStatus, $options: "i" } }]
            : []),
        ]
      : [];
    // $or çakışmalarını $and ile çöz
    if (cardIdFilter.length && searchFilter.length) {
      filters.$and = [{ $or: cardIdFilter }, { $or: searchFilter }];
    } else if (cardIdFilter.length) {
      filters.$or = cardIdFilter;
    } else if (searchFilter.length) {
      filters.$or = searchFilter;
    }

    const total = await TransactionsUser.countDocuments(filters);

    const transactions = await TransactionsUser.find(filters)
      .sort({ createdAt: -1 })
      .skip(parseInt(start))
      .limit(parseInt(length));

    return res.status(200).json({
      success: true,
      draw: parseInt(draw) || 0,
      recordsTotal: total,
      recordsFiltered: total,
      data: transactions,
    });
  } catch (error) {
    console.error("partnerTransactionsTable error:", error);
    return res.status(500).json({
      success: false,
      message: res.__("messages.avankartPartner.server_error"),
    });
  }
};

// TODO: BUNUN USTE ISLEEYECEYIK
export const partnerUserShow = async (req, res) => {
  try {
    const { partnyor_id } = req.params;
    const currentUser = await PartnerUser.findById(req.user?.id);
    if (!currentUser) return res.redirect("/");

    const partnerUser = await PartnerUser.findOne({ partnyor_id }).lean();
    if (!partnerUser) return res.redirect("/");

    if (String(partnerUser.muessise_id) !== String(currentUser.muessise_id)) {
      return res.redirect("/");
    }

    const transactions = await TransactionsUser.find({
      user: partnerUser._id,
      status: "success",
    })
      .populate("cards")
      .lean();

    const cardsMap = new Map();
    let total = 0;

    for (const tx of transactions) {
      const cardId =
        tx.cards?.id?.toString() || Math.random().toString(36).substring(2, 15);
      const cardName = tx.cards?.name || "Təyin olunmamış";

      const amount = tx.amount || 0;
      const comission = tx.comission || 0;
      const cleanAmount = amount - comission;

      if (!cardId) continue;

      if (!cardsMap.has(cardId)) {
        cardsMap.set(cardId, {
          cardId,
          _id: tx._id,
          name: cardName,
          color: tx.cards?.background_color || "#ccc",
          value: 0,
        });
      }

      var totalAmountForUndefinedCard = 0;
      for (const card of cardsMap.values()) {
        card.name === "Təyin olunmamış" &&
          (totalAmountForUndefinedCard += card.value);
      }

      const existing = cardsMap.get(cardId);
      existing.value += cleanAmount;
      total += cleanAmount;
    }

    const cards = [...cardsMap.values()];

    // Add real QR code count to user object
    const qrCodeCount = transactions.length;

    const userWithQRCount = {
      ...partnerUser,
      total_qr_codes:
        qrCodeCount > 0 ? qrCodeCount : partnerUser.total_qr_codes,
    };

    res.render("pages/avankartPartner/inside", {
      user: userWithQRCount,
      csrfToken: req.csrfToken(),
      cards,
      total,
      totalAmountForUndefinedCard,
      layout: "./layouts/main.ejs",
    });
  } catch (err) {
    console.error("partnerUserShow error:", err);
    res.status(500).send("Server error");
  }
};

export const restorePartnerUser = async (req, res) => {
  try {
    const { id } = req.body;
    const currentUser = await PartnerUser.findById(req.user?.id);

    if (!currentUser)
      return res
        .status(401)
        .json({ message: res.__("messages.auth.unauthorized") });

    const oldUser = await OldMuessiseUsers.findById(id);

    if (!oldUser || !oldUser.user_partner_id)
      return res
        .status(404)
        .json({ message: res.__("messages.avankartPartner.user_not_found") });

    if (String(oldUser.muessise_id) !== String(currentUser.muessise_id)) {
      return res
        .status(403)
        .json({ message: res.__("messages.avankartPartner.forbidden") });
    }

    const user = await PartnerUser.findById(oldUser.user_partner_id);

    if (!user)
      return res
        .status(404)
        .json({ message: res.__("messages.avankartPartner.user_not_found") });

    if (user.muessise_id) {
      req.body.id = user._id.toString();
      return await import("./avankartInvite.js").then(async (module) => {
        await module.invitePartner(req, res);
      });
    }

    user.muessise_id = currentUser.muessise_id;
    await user.save();
    await OldMuessiseUsers.findByIdAndDelete(oldUser._id);

    return res.status(200).json({
      message: res.__("messages.avankartPartner.user_restored_successfully"),
    });
  } catch (error) {
    console.error("restorePartnerUser error:", error);
    return res.status(500).json({ message: res.__("messages.server_error") });
  }
};

export const getUserData = async (req, res) => {
  try {
    const { partnyor_id } = req.body;

    const currentUser = await PartnerUser.findById(req.user?.id).lean();
    if (!currentUser) {
      return res
        .status(401)
        .json({ message: res.__("messages.auth.unauthorized") });
    }

    const partnerUser = await PartnerUser.findOne({ partnyor_id }).lean();
    if (!partnerUser) {
      return res.status(404).json({
        message:
          res.__("messages.avankartPartner.user_not_found") + " " + partnyor_id,
      });
    }

    if (String(partnerUser.muessise_id) === String(currentUser.muessise_id)) {
      return res
        .status(403)
        .json({ message: res.__("messages.avankartPartner.forbidden") });
    }

    return res.status(200).send({
      success: true,
      phone: partnerUser.phone_suffix,
      email: partnerUser.email,
      gender: partnerUser.gender,
      surname: partnerUser.surname,
      name: partnerUser.name,
      _id: partnerUser._id,
    });
  } catch (error) {
    console.error("getUserData error:", error);
    return res.status(500).json({ message: res.__("messages.server_error") });
  }
};
