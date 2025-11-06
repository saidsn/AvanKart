import { validationResult } from "express-validator";
import { sendNotification } from "../../../shared/utils/sendNotification.js";
import PeopleUser from "../../../shared/models/peopleUserModel.js";
import InvitePeople from "../../../shared/model/people/invitePeopleModel.js";
import NotificationModel from "../../../shared/models/notificationModel.js";
import OldSirketUsers from "../../../shared/model/people/oldSirketUsers.js";

export const getNotification = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((e) => e.msg);
    return res.status(400).json({ error: formattedErrors[0] });
  }

  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const userId = req.user;
  const filter = req.query.filter;
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  try {
    if (isNaN(page) || page < 1) {
      return res.status(400).json({ message: "Invalid page number" });
    }

    const allowedFilters = ["read", "unread", "all", undefined];
    if (!allowedFilters.includes(filter)) {
      return res.status(400).json({ message: "Invalid filter value" });
    }

    const query = { user: userId };
    if (filter === "read") query.status = "read";
    else if (filter === "unread") query.status = "unread";

    const notifications = await NotificationModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const [all, read, unread] = await Promise.all([
      NotificationModel.countDocuments({ user: userId }),
      NotificationModel.countDocuments({ user: userId, status: "read" }),
      NotificationModel.countDocuments({ user: userId, status: "unread" }),
    ]);

    const formattedNotifications = notifications.map((e) => {
      let data;
      if (e.type === "invation") {
        data = {
          invator_name: e.data?.invator_name,
          invator_id: e.data?.invator_id,
        };
      } else if (e.type === "update") {
        data = {
          version: e.data?.version,
          changelog: e.data?.changelog,
        };
      } else {
        data = undefined;
      }

      return {
        id: e._id.toString(),
        title: e.title,
        text: e.text,
        date: e.createdAt,
        status: e.status,
        type: e.type,
        data,
      };
    });

    return res
      .status(200)
      .json({ all, read, unread, notification: formattedNotifications });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateNotificationStatus = async (req, res) => {
  const userId = req.user;
  const { status, notification_id } = req.body;

  try {
    if (!["read", "unread"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const result = await NotificationModel.updateOne(
      { _id: notification_id, user: userId },
      { $set: { status } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }
    if (result.modifiedCount === 0) {
      return res
        .status(200)
        .json({ message: "Status was already up to date." });
    }
    return res
      .status(200)
      .json({ message: "Notification status updated", result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const handleInviteAction = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => error.msg);
    return res.status(400).json({ error: formattedErrors[0] });
  }

  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const { notification_id, action } = req.body;
  const userId = req.user;

  try {
    const notification = await NotificationModel.findOne({
      _id: notification_id,
      user: userId,
      type: "invation",
    }).populate('invitationId');
      console.log('bura qeder gelir9 '+notification)

    if (!notification) {
      return res
        .status(404)
        .json({ message: "Notification not found or not an invitation" });
    }

    if (action === "ignore") {
      notification.status = "read";
      await notification.save();
      return res.status(200).json({ message: "Invitation ignored" });
    }

    if (action === "accept") {
      //  Update invitation status
      notification.status = "read";
      notification.invitationStatus = "accepted";
      await notification.save();

      const user = await PeopleUser.findById(userId).populate('sirket_id');
      if (!user) return res.status(404).json({ message: "User not found" });

      const oldSirketId = user.sirket_id?._id;
      const newSirketId = notification.invitationId?.sirket_id;

      // Köhnə sirket varsa, qeyd et və ona notification at
      if (oldSirketId && String(oldSirketId) !== String(newSirketId)) {
        await OldSirketUsers.create({
          user_id: userId,
          user_sirket_id: user._id,
          sirket_id: oldSirketId,
          dismissal_date: new Date(),
        });

        await NotificationModel.create({
          title: "İstifadəçi şirkəti tərk etdi",
          text: "İstifadəçi yeni şirkətə keçdi.",
          type: "notification",
          category: "corporate",
          user: userId,
          sirket_id: oldSirketId,
          creator: oldSirketId,
          creatorModel: "Sirket",
        });
      }

      await NotificationModel.create({
        title: notification.invitationId?.sirket_id?.sirket_name ?? 'Təbriklər',
        text: "Şirkət tərkibinə qəbul olundunuz",
        type: "notification",
        category: "personal",
        user: userId,
        sirket_id: newSirketId,
        creator: newSirketId,
        creatorModel: "Sirket",
      });

      await sendNotification({
        title: notification.invitationId.sirket_id?.sirket_name ?? 'Təbriklər',
        body: "Şirkət tərkibinə qəbul olundunuz",
        data: {},
        tokens: [user.firebase_token],
      });

      //  Yeni sirket_id-ni təyin et
      user.sirket_id = newSirketId;
      await user.save();

      await InvitePeople.findByIdAndUpdate({ _id: notification.invitationId?._id }, { status: action })
      await PeopleUser.findByIdAndUpdate({ _id: userId }, { hire_date: new Date() });
      await NotificationModel.deleteOne({ _id: notification_id });

      return res.status(200).json({ message: "Invitation accepted" });
    }

    return res.status(400).json({ message: "Invalid action" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
