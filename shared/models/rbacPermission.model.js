import mongoose from "mongoose";
import softDeletePlugin from "../utils/softDeletePlugin.js";

const { Schema } = mongoose;
const PERMISSION_ENUM = ["full", "read", "none"];

const rbacPermissionSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    muessise_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Muessise",
    },
    dashboard: {
      type: String,
      enum: PERMISSION_ENUM,
      default: null,
    },
    accounting: {
      type: String,
      enum: PERMISSION_ENUM,
      default: null,
    },
    avankart_partner: {
      type: String,
      enum: PERMISSION_ENUM,
      default: null,
    },
    company_information: {
      type: String,
      enum: PERMISSION_ENUM,
      default: null,
    },
    profile: {
      type: String,
      enum: PERMISSION_ENUM,
      default: null,
    },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "PartnerUser" }],
    edit_users: {
      type: String,
      enum: PERMISSION_ENUM,
      default: null,
    },
    role_groups: {
      type: String,
      enum: PERMISSION_ENUM,
      default: null,
    },
    requisites: {
      type: String,
      enum: PERMISSION_ENUM,
      default: null,
    },
    contracts: {
      type: String,
      enum: PERMISSION_ENUM,
      default: null,
    },
    creator: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "PartnerUser",
    },
    default: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

rbacPermissionSchema.plugin(softDeletePlugin);

const RbacPermission = mongoose.model("RbacPermission", rbacPermissionSchema);

export default RbacPermission;
