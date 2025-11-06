import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../utils/softDeletePlugin.js";

const dutySchema = new Schema({
    name: { type: String, required: true}
}, { timestamps: true });

dutySchema.plugin(softDeletePlugin);

export const Duties = mongoose.model("Duties", dutySchema);