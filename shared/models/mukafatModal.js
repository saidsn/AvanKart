import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../utils/softDeletePlugin.js";

const mukafatSchema = new Schema(
  {
    forCard: {
      type: Schema.Types.ObjectId,
      ref: "Cards",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image_name: {
      type: String,
      required: true,
      trim: true,
    },
    image_path: {
      type: String,
      required: true,
      trim: true,
    },
    muessise_category: {
      type: [String],
      default: [],
      index: true,
    },
    target: {
      type: String,
      required: true,
      enum: ["count", "muddet"],
    },
    conditions: {
      count: { type: Number, default: 0 },
      muddet: { type: Number, default: 0 }, // eksik olanı ekledim
      amount: { type: Number, default: 0 },
    },
    gift: {
      type: String,
      required: true,
      enum: ["sale", "bonus", "amount"],
    },
    gift_conditions: {
      sale: { type: Number, default: 0, min: 0, max: 100 },
      bonus: { type: Number, default: 0 },
      amount: { type: Number, default: 0 },
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "AdminUser",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

mukafatSchema.plugin(softDeletePlugin);

const Mukafat = mongoose.model("Mukafat", mukafatSchema);

export default Mukafat;
