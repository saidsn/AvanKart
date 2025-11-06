import { model, Schema } from "mongoose";
import softDeletePlugin from "../../utils/softDeletePlugin.js";
import SorgularReason from "./sorgularReason.js"; // Assuming this is the correct import for the SorgularReason model 
import AdminUser from "../../models/adminUsersModel.js"; // Assuming this is the correct import for the AdminUser model
import Muessise from "../../models/muessiseModel.js";

const ticketSchema = new Schema(
  {
    category: {
      type: String,
      default: "",
    },
    reason: {
      type: Schema.Types.ObjectId,
      ref: "SorgularReason",
      default: null,
    },
    subject: {
      type: String,
      enum: ["AP İstifadəçi", "Müəssisə", "ap-istifadeci", "muessise", "sirket", "Şirkət"],
      default: "AP İstifadəçi",
    },
    user_id: {
      type: Schema.Types.ObjectId,
      refPath: 'userModel'
    },
    userModel: {
      type: String,
      required: true,
      enum: ['PartnerUser', 'PeopleUser', 'AdminUser'],
      default: 'PartnerUser' // izin verilen modeller
    },
    muessise_id: {
      type: Schema.Types.ObjectId,
      ref: "Muessise",
      default: null,
    },
    sirket_id: {
      type: Schema.Types.ObjectId,
      ref: "Sirket",
      default: null,
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    assigned: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "AdminUser",
          required: true,
        },
        assignedAt: {
          type: Date,
          default: Date.now,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
        assignedBy: {
          type: Schema.Types.ObjectId,
          ref: "AdminUser",
          default: null,
        }
      },
    ],
    ticket_id: {
      type: String,
      required: true,
      unique: true,
      match: /^S-\d{9}$/,
    },
    total: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["baxilir", "qaralama", "hell_olundu", "redd_edildi"],
      default: "qaralama",
    },
  },
  { timestamps: true }
);

ticketSchema.plugin(softDeletePlugin);

const Ticket = model("Ticket", ticketSchema);

export default Ticket;
