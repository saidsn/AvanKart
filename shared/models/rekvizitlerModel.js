import mongoose from "mongoose";
import { Types } from "mongoose";
import softDeletePlugin from "../utils/softDeletePlugin.js";
import Muessise from "./muessiseModel.js";
import PartnerUser from "./partnyorUserModel.js";

const rekvizitlerSchema = new mongoose.Schema(
  {
    muessise_id: {
      type: String,
      ref: "Muessise",
    },
    muessise_name: {
      type: String,
    },
    sirket_id: {
      type: String,
      ref: "Sirket",
    },
    sirket_name: {
      type: String,
    },
    company_name: {
      type: String,
    },
    bank_info: {
      bank_name: String,
      swift: String,
      settlement_account: String,
      bank_code: String,
      muxbir_hesabi: String,
      correspondent_account: String,
    },
    adder_id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "fromModel",
    },
    fromModel: {
      type: String,
      required: true,
      enum: ["Muessise", "AdminUser"],
    },
    huquqi_unvan: String,
    legal_address: String,
    location_point: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        index: "2dsphere",
        default: undefined,
      },
    },
    voen: { type: String, unique: true, sparse: true },
  },
  {
    timestamps: true,
  }
);

rekvizitlerSchema.plugin(softDeletePlugin);

const Rekvizitler = mongoose.model("Rekvizitler", rekvizitlerSchema);

export default Rekvizitler;
