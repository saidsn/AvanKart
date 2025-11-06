import mongoose from "mongoose";
import softDeletePlugin from "../utils/softDeletePlugin.js";
import InvitePartner from "../model/partner/invitePartnerModel.js";
import InvitePeople from "../model/people/invitePeopleModel.js";

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["read", "unread"],
      default: "unread",
    },
    muessise_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Muessise",
      required: false,
      default: null
    },
    sirket_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sirket",
      required: false,
      default: null
    },
    type: {
      type: String,
      enum: ["notification", "invation", "update"],
      required: true,
    },
    category: {
      type: String,
      enum: ["personal", "corporate"],
      required: true,
      default: null
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'userModel',
      // required: true,
    },
    userModel: {
      type: String,
      required: true,
      enum: ['PartnerUser', 'AdminUser', 'PeopleUser'],
      default: 'PartnerUser'
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'creatorModel',
      required: true,
    },
    creatorModel: {
      type: String,
      required: true,
      enum: ['AdminUser', 'Muessise', 'Sirket'],
      default: 'AdminUser'
    },
    invitationId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "inviteRef",
      required: false
    },
    inviteRef: {
      type: String,
      required: true,
      enum: ['InvitePeople', 'AdminUser', 'InvitePartner'],
      default: 'InvitePartner'
    },
    invitationStatus: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      required: false,
      default: null,
    },
  },
  { timestamps: true }
);

notificationSchema.pre("save", function (next) {
  if (this.type !== "invation") {
    this.invitationId = null;
    this.invitationStatus = null;
  }

  if (this.type === "invation" && !this.invitationId) {
    return next(
      new Error("InvitationId is required for invitation type notifications")
    );
  }

  next();
});

notificationSchema.plugin(softDeletePlugin);

notificationSchema.index({ user: 1, place: 1 });

const NotificationModel = mongoose.model("Notification", notificationSchema);

export default NotificationModel;
