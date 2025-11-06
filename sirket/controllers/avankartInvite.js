import InvitePartner from "../../shared/model/partner/invitePartnerModel.js";
import InvitePeople from "../../shared/model/people/invitePeopleModel.js";
import NotificationModel from "../../shared/models/notificationModel.js";
import PeopleUser from "../../shared/models/peopleUserModel.js";
import { sendNotification } from "../../shared/utils/sendNotification.js";
import mongoose from "mongoose";

export const invitePartner = async (req, res) => {
  const { id, ids } = req.body;
  const userId = req.user.id;
  const myUser = await PeopleUser.findById(userId).populate('sirket_id');
  const senderSirketId = myUser.sirket_id._id;

  if (!id && (!ids || ids.length === 0)) {
    return res
      .status(400)
      .json({ message: res.__("messages.invite.no_user_id_provided") });
  }

  if (id === userId) {
    return res
      .status(400)
      .json({ message: res.__("messages.invite.receiver_user_not_found") });
  }

  if (ids && ids.includes(userId)) {
    const index = ids.indexOf(userId);
    if (index !== -1) {
      ids.splice(index, 1);
    }
  }

  // Check sirket_id for single ID
  if (id) {
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const idquery = isObjectId
                        ? {
                            $or: [
                              { _id: id },
                              { people_id: id }
                            ]
                          }
                        : { people_id: id };
    const receiverUser = await PeopleUser.findOne(idquery);
    if (!receiverUser) {
      return res
        .status(404)
        .json({ message: res.__("messages.invite.receiver_user_not_found") });
    }
    if(receiverUser.sirket_id){
      if (receiverUser.sirket_id.toString() === senderSirketId.toString()) {
        return res.status(400).json({
          message: res.__("messages.invite.cannot_invite_same_sirket"),
        });
      }
    }
  }

  // Check sirket_id for multiple IDs
  if (ids && ids.length > 0) {
    const objectIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
    const stringIds = ids.filter(id => !mongoose.Types.ObjectId.isValid(id));

    const receiverUsers = await PeopleUser.find({
                                        $or: [
                                          { _id: { $in: objectIds } },
                                          { people_id: { $in: stringIds } }
                                        ]
                                      });
    const invalidUsers = receiverUsers.filter(
      (user) =>
        user.sirket_id &&
        senderSirketId &&
        user.sirket_id.toString() === senderSirketId.toString()
    );

    if (invalidUsers.length > 0) {
      return res.status(400).json({
        message: res.__("messages.invite.cannot_invite_same_sirket"),
      });
    }
  }

  const invites = [];

  // Yeni dəvət göndərməzdən əvvəl həmin istifadəçinin bütün 'pending' dəvətlərini ləğv et
  const cancelPreviousPending = async (userId) => {
    await InvitePeople.updateMany(
      { user_id: userId, status: "pending" },
      { $set: { status: "canceled" } }
    );
  };

  if (id) {
    await cancelPreviousPending(id);
    invites.push({
      user_id: id,
      inviter: userId,
      sirket_id: senderSirketId,
      status: "pending",
    });
  }

  if (ids && ids.length > 0) {
    for (const receivingUserID of ids) {
      await cancelPreviousPending(receivingUserID);
      invites.push({
        user_id: receivingUserID,
        inviter: userId,
        sirket_id: senderSirketId,
        status: "pending",
      });
    }
  }

  try {
    if (invites.length === 0) {
      return res.status(400).json({
        message: res.__("messages.invite.all_already_invited_recently")
      });
    }
    const inviteResults = await InvitePeople.insertMany(invites);
    const inviteCount = inviteResults.length;

    if (inviteCount === 0) {
      return res
        .status(500)
        .json({ message: res.__("messages.invite.failed_to_create_invites") });
    }

    await Promise.all(
      inviteResults.map(async (inviteResult, index) => {
        await NotificationModel.create({
          user: invites[index].user_id,
          type: "invation",
          category: "corporate",
          title: myUser.sirket_id?.sirket_name ?? "Yeni dəvət",
          sirket_id: myUser.sirket_id?._id,
          text: `Müəssisəmiz tərəfindən dəvət olundunuz`,
          status: "unread",
          creator: userId,
          creatorModel: "Sirket",
          userModel: "PeopleUser",
          invitationId: inviteResult._id,
          invitationStatus: "pending",
          inviteRef: "InvitePeople",
        });
      })
    );

    await sendFirebaseNotificationToUsers(
      invites.map((invite) => invite.user_id),
      {
        title: "Yeni dəvət",
        body: `Sizə yeni dəvət göndərildi`,
        data: {
          type: "invite",
          inviter_id: userId.toString(),
          sirket_id: myUser.sirket_id.toString(),
        },
      }
    );

    if (inviteCount === 1) {
      return res.status(201).json({
        message: res.__("messages.invite.worker_added"),
        invite: inviteResults[0],
      });
    }

    if (inviteCount > 1) {
      return res.status(201).json({
        message: res.__("messages.invite.workers_added", {
          count: inviteCount,
        }),
        invites: inviteResults,
      });
    }
  } catch (err) {
    console.error("Error inserting invites:", err);
    return res
      .status(500)
      .json({ message: res.__("messages.invite.failed_to_send_invites") });
  }
};

const sendFirebaseNotificationToUsers = async (userIds, notificationData) => {
  try {
    const users = await PeopleUser.find(
      {
        _id: { $in: userIds },
        firebase_token: { $ne: null, $exists: true, $ne: "" },
      },
      { firebase_token: 1, name: 1, surname: 1 }
    );

    if (users.length === 0) {
      console.log("Heç bir istifadəçinin firebase token-i tapılmadı");
      return;
    }

    const firebaseTokens = users
      .map((user) => user.firebase_token)
      .filter((token) => token);

    if (firebaseTokens.length === 0) {
      console.log("Etibarlı firebase token tapılmadı");
      return;
    }

    console.log(
      `${firebaseTokens.length} istifadəçiyə Firebase notification göndərilir...`
    );

    const result = await sendNotification({
      title: notificationData.title,
      body: notificationData.body,
      data: notificationData.data || {},
      tokens: firebaseTokens,
    });

    if (result.success) {
      console.log("Firebase notification uğurla göndərildi:", result.result);
    } else {
      console.error("Firebase notification göndərmə xətası:", result.message);
    }

    return result;
  } catch (error) {
    console.error("sendFirebaseNotificationToUsers xətası:", error);
    throw error;
  }
};
