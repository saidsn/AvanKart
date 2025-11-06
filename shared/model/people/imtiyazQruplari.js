import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../../utils/softDeletePlugin.js";

const ImtiyazQruplariSchema = new Schema(
  {
    name: { type: String, trim: true, required: true },
    user_id: { type: Schema.Types.ObjectId, ref: "PeopleUser", required: true },
    sirket_id: { type: Schema.Types.ObjectId, ref: "Sirket", required: true },
    memberCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// soft delete plugin
ImtiyazQruplariSchema.plugin(softDeletePlugin);

const ImtiyazQruplari = mongoose.model(
  "ImtiyazQruplari",
  ImtiyazQruplariSchema
);

export default ImtiyazQruplari;
