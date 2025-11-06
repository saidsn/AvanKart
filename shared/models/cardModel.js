import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../utils/softDeletePlugin.js";

const cardModelSchema = new Schema(
  {
    background_color: {
      type: String,
    },
    icon: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CardsCategory",
      required: true,
    },
    conditions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CardConditions",
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive", "archived"],
      default: "inactive",
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminUser",
      required: true,
    },
    sirket_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sirket",
    },
  },
  { timestamps: true }
);

cardModelSchema.plugin(softDeletePlugin);

const Cards = mongoose.model("Cards", cardModelSchema);

export default Cards;
