import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../utils/softDeletePlugin.js";

const cardsCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminUser",
      required: true,
    },
  },
  { timestamps: true }
);

cardsCategorySchema.plugin(softDeletePlugin);

const CardsCategory = mongoose.model("CardsCategory", cardsCategorySchema);

export default CardsCategory;
