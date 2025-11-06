import mongoose from "mongoose";
import softDeletePlugin from "../utils/softDeletePlugin.js";
import Rekvizitler from "./rekvizitlerModel.js";

const sirketSchema = new mongoose.Schema(
  {
    activity_type: { type: String, required: true }, //
    commission_percentage: { type: Number, default: 0, min: 0, max: 100 }, //
    cashback_percentage: { type: Number, default: 0, min: 0, max: 100 }, //
    authorized_person: {
      name: { type: String, required: true },
      gender: {
        type: String,
        enum: ["male", "female", "other"],
        required: true,
      },
      duty: String,
      phone_suffix: String,
      phone: { type: Number, unique: true, sparse: true },
      email: { type: String, unique: true, sparse: true },
    }, //
    sirket_id: { type: String, unique: true }, //
    company_status: { type: Number, default: 0 }, //
    sirket_balance: { type: Number, default: 0 }, //
    sirket_name: {
      type: String,
      trim: true,
    },
    sirket_category: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      // required: true,
      trim: true,
    },
    services: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      maxlength: 150,
      trim: true,
    },
    cards: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cards",
      },
    ],
    schedule: {
      type: Object,
      default: {},
    },
    phone: {
      type: [
        {
          number: String,
          prefix: String,
        },
      ],
      default: [],
    },
    email: {
      type: [String],
      default: [],
    },
    website: {
      type: [String],
      default: [],
    },
    social: {
      type: Map,
      of: String,
      default: {},
    },
    xarici_cover_image: String,
    xarici_cover_image_path: String,
    daxili_cover_image: String,
    daxili_cover_image_path: String,
    profile_image: String,
    profile_image_path: String,
    creator_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminUser",
      required: true,
    },
    rekvizitler: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rekvizitler",
      // required: true
    },
  },
  {
    timestamps: true,
  }
);

sirketSchema.pre("save", async function (next) {
  if (this.sirket_id) return next();
  try {
    let sirket_id;
    do {
      sirket_id = "CM-" + Math.floor(10000000 + Math.random() * 90000000);
    } while (await this.constructor.findOne({ sirket_id }));

    this.sirket_id = sirket_id;
    next();
  } catch (err) {
    next(err);
  }
});

sirketSchema.plugin(softDeletePlugin);

export const Sirket = mongoose.model("Sirket", sirketSchema);

export default Sirket;
