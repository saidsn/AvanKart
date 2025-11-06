import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../utils/softDeletePlugin.js";

const rozetSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // gereksiz boşlukları önler
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    card_category: {
      type: Schema.Types.ObjectId,
      ref: "Cards",
      default: null, // null -> tüm kartlar için geçerli
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
      index: true, // filtreleme performansını artırır
    },
    target: {
      type: String,
      required: true,
      enum: ["xidmet_sayi", "muddet", "amount", "uzvluk", "active_card_count"],
    },
    target_type: {
      type: String,
      default: "target_count",
      enum: ["target_count", "income", "expense", "account", "company"],
    },
    // Her target tipi için ayrı koşul değerleri (örneğin: minimum veya eşik değer)
    conditions: {
      xidmet_sayi: { type: Number, default: 0 }, // xidmət sayı limiti
      muddet: { type: Number, default: 0 }, // gün sayısı
      amount: { type: Number, default: 0 }, // məbləğ limiti
      uzvluk: { type: Number, default: 0 }, // üzvlük sayı
      active_card_count: { type: Number, default: 0 }, // aktiv kart sayı
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "AdminUser",
      default: null,
    },
    rozet_category: {
      type: Schema.Types.ObjectId,
      ref: "RozetCategory",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

rozetSchema.plugin(softDeletePlugin);

const Rozet = mongoose.model("Rozet", rozetSchema);

export default Rozet;