import mongoose from "mongoose";
const { Schema, model } = mongoose;
import PartnerUser from "./partnyorUserModel.js";

const deleteRequestSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "PartnerUser",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["waiting", "approved", "rejected"],
      default: "waiting",
      required: true,
    },
    reason: {
      type: String,
      trim: true,
    },
    requested_by: {
      type: Schema.Types.ObjectId,
      ref: "AdminUser",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
deleteRequestSchema.index({ user: 1, status: 1 });

const DeleteRequest = model("DeleteRequest", deleteRequestSchema);

export default DeleteRequest;
