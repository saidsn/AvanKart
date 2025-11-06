import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../utils/softDeletePlugin.js";
// import Muessise from "./muessiseModel.js"; // Assuming this is the correct import for the Muessise model
import PartnerUser from "./partnyorUserModel.js"; // Assuming this is the correct import for the PartnerUser model

const dutiesSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    sirket_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sirket",
    },
    creator_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PeopleUser",
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

dutiesSchema.plugin(softDeletePlugin);

const SirketDuty = mongoose.model("SirketDuty", dutiesSchema);
export default SirketDuty;
