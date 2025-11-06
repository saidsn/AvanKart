import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../utils/softDeletePlugin.js";
// import Muessise from "./muessiseModel.js"; // Assuming this is the correct import for the Muessise model
import PartnerUser from "./partnyorUserModel.js"; // Assuming this is the correct import for the PartnerUser model

const dutiesSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    muessise_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Muessise",
    },
    creator_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PartnerUser",
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

const Duty = mongoose.model("Duty", dutiesSchema);
export default Duty;
