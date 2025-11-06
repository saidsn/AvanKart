import { model, Schema } from "mongoose";
import softDeletePlugin from "../../utils/softDeletePlugin.js";
import Hesablasma from "./Hesablasma.js"; // Assuming this is the correct import for the Hesablasma model

const fakturaFileSchema = new Schema(
  {
    file_name: { type: String },
    file_type: { type: String },
    file_route: { type: String },
    uploader: { type: Schema.Types.ObjectId, ref: "PartnerUser" },
    hesablasma_id: { type: Schema.Types.ObjectId, ref: "Hesablasma" },
  },
  { timestamps: true }
);

fakturaFileSchema.plugin(softDeletePlugin);

const FakturaFile = model("FakturaFile", fakturaFileSchema);

export default FakturaFile;
