import mongoose from "mongoose";
import softDeletePlugin from "../utils/softDeletePlugin.js";

const auditSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminUser",
      required: true,
    },
    user_name: {
      type: String,
    },
    user_position: {
      type: String,
    },
    action: {
      type: String,
      required: true,
      enum: ["CREATE", "READ", "UPDATE", "DELETE", "APPROVE"],
    },
    path: {
      type: String,
      required: true,
    },
    page: {
      type: String,
    },
    resource: {
      type: String, // What was affected (e.g., "Müəssisə", "Şirkət", "İstifadəçi")
    },
    resource_id: {
      type: String, // ID of the affected resource
    },
    details: {
      type: mongoose.Schema.Types.Mixed, // Additional details about the action
    },
    ip_address: {
      type: String,
    },
    user_agent: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: "audits",
  }
);

auditSchema.plugin(softDeletePlugin);

// Add indexes for better query performance
auditSchema.index({ user_id: 1, createdAt: -1 });
auditSchema.index({ action: 1, createdAt: -1 });
auditSchema.index({ resource: 1, createdAt: -1 });
auditSchema.index({ deleted: 1 });

const Audit = mongoose.model("Audit", auditSchema);

export default Audit;
