import mongoose from "mongoose";
import softDeletePlugin from "../utils/softDeletePlugin.js";

const { Schema } = mongoose;
const PERMISSION_ENUM = ["full", "read", "none"];

const rbacPeoplePermissionSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    sirket_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Sirket",
    },
    dashboard: {
      type: String,
      enum: PERMISSION_ENUM,
      default: null,
    },
    emeliyyatlar: {
      type: String,
      enum: PERMISSION_ENUM,
      default: null,
    },
    hesablasma: {
      type: String,
      enum: PERMISSION_ENUM,
      default: null,
    },
    iscilerin_balansi: {
      type: String,
      enum: PERMISSION_ENUM,
      default: null,
    },
    e_qaime: {
      type: String,
      enum: PERMISSION_ENUM,
      default: null,
    },
    isciler: {
      type: String,
      enum: PERMISSION_ENUM,
      default: null,
     },
    // sirket_melumatlari: { // This permission is always "full" and cannot be changed but this field is not needed in the  UI.
    //   type: String,
    //   enum: PERMISSION_ENUM,
    //   default: "full",
    //   immutable: true,
    //   set: () => "full",
    // },
    profil: {
      type: String,
      enum: PERMISSION_ENUM,
      default: null,
    },
    istifadeciler: {
      type: String,
      enum: PERMISSION_ENUM,
      default: null,
    },
    salahiyyet_qruplari: {
      type: String,
      enum: PERMISSION_ENUM,
      default: null,
    },
    rekvizitler: {
      type: String,
      enum: PERMISSION_ENUM,
      default: null,
    },
    muqavileler: {
      type: String,
      enum: PERMISSION_ENUM,
      default: null,
    },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "PeopleUser" }],
    creator: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "PeopleUser",
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

rbacPeoplePermissionSchema.plugin(softDeletePlugin);

const RbacPeoplePermission = mongoose.model("RbacPeoplePermission", rbacPeoplePermissionSchema);

export default RbacPeoplePermission;
