import mongoose from "mongoose";
import softDeletePlugin from "../utils/softDeletePlugin.js";

const { Schema } = mongoose;
const PERMISSION_ENUM = ["full", "read", "none"];

const rbacAdminPermissionSchema = new Schema(
  {
    name: { type: String, trim: true, required: true },
    // Which admin users belong to this group
    users: [{ type: Schema.Types.ObjectId, ref: "AdminUser" }],
    // Example permission domains (adjust as UI grows)
    dashboard: { type: String, enum: PERMISSION_ENUM, required: true, default: "full" },
    users_module: { type: String, enum: PERMISSION_ENUM, required: true, default: "full" },
    duties_module: { type: String, enum: PERMISSION_ENUM, required: true, default: "full" },
    transactions_module: { type: String, enum: PERMISSION_ENUM, required: true, default: "read" },
    notifications_module: { type: String, enum: PERMISSION_ENUM, required: true, default: "read" },
    settings_module: { type: String, enum: PERMISSION_ENUM, required: true, default: "read" },
    creator: { type: Schema.Types.ObjectId, ref: "AdminUser" },
    default: { type: Boolean, default: false },
  },
  { timestamps: true }
);

rbacAdminPermissionSchema.plugin(softDeletePlugin);

const RbacAdminPermission = mongoose.model("RbacAdminPermission", rbacAdminPermissionSchema);
export default RbacAdminPermission;
