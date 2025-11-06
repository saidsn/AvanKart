import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../utils/softDeletePlugin.js";

const settlementReport = new Schema(
  {
    creator: {
      type: Schema.Types.ObjectId,
      ref: "PartnerUser",
    },
    invoice_number: {
      type: String,
      required: true,
      trim: true,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    transaction_count: {
      type: Number,
      required: true,
      min: 0,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    message: {
      type: String,
      default: "",
      trim: true,
    },
    admin_user: {
      type: Schema.Types.ObjectId,
      ref: "AdminUser",
      default: null,
    },
    seen_at: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "baxildi", "canceled"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

settlementReport.plugin(softDeletePlugin);

const SettlementReport = mongoose.model("HesablasmaReport", settlementReport);
export default SettlementReport;
