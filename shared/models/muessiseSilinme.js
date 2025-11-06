import mongoose, { Schema, model } from "mongoose";

// (Orijinal sadə schema) Başqa tapşırıq olduğuna görə status sahəsi çıxarıldı
const muessiseSilinmeSchema = new mongoose.Schema(
  {
    admin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminUser",
      required: true,
      default: null,
    },
    muessise_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Muessise",
      required: true,
      default: null,
    },
    otp: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 6,
    },
    sebeb: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const MuessiseSilinme = model("MuessiseSilinme", muessiseSilinmeSchema);
export default MuessiseSilinme;
