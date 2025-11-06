import { Schema, model } from "mongoose";
import softDeletePlugin from "../utils/softDeletePlugin.js";
import PartnerUser from "./partnyorUserModel.js";
import Muessise from "./muessiseModel.js";
import Hesablasma from "../model/partner/Hesablasma.js";
import CardsCategory from "../models/cardsCategoryModel.js";
import PeopleCardBalance from "../model/people/cardBalances.js";

const transactionsSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "PartnerUser" },
    from: { type: Schema.Types.ObjectId, ref: "PeopleUser" },
    from_sirket: { type: Schema.Types.ObjectId, ref: "Sirket", default: null },
    to: { type: Schema.Types.ObjectId, ref: "Muessise", required: true },
    note: { type: String, default: "" },
    currency: { type: String, enum: ["AZN", "TRY", "USD"] },
    transaction_id: { type: String, unique: true },
    hesablasma_id: { type: Schema.Types.ObjectId, ref: "Hesablasma" },
    destination: {
      type: String,
      enum: ["Internal", "External"],
      trim: true,
      default: "Internal",
    },
    cards: { type: Schema.Types.ObjectId, ref: "Cards" },
    cardbalance: { type: Schema.Types.ObjectId, ref: "PeopleCardBalance" },
    cardCategory: { type: Schema.Types.ObjectId, ref: "CardsCategory" },
    creatorPartnerId: { type: Schema.Types.ObjectId, ref: "PartnerUser" },
    amount: { type: Number, required: true, min: 0 },
    comission: { type: Number, required: true, min: 0 },
    subject: {
      type: String,
      trim: true,
      enum: ["Veysəloğlu", "Kapital", "Kəşbek"],
      default: "Kapital",
    },
    status: {
      type: String,
      enum: ["success", "failed", "pending"],
      default: "success",
    },
    lat: {
      type: Number,
      default: null,
    },
    lng: {
      type: Number,
      default: null,
    },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// correct transaction_id generation
transactionsSchema.pre("save", async function (next) {
  if (this.transaction_id) return next();
  try {
    let transaction_id;
    do {
      transaction_id = "TRX-" + Math.floor(10000000 + Math.random() * 90000000);
    } while (await this.constructor.findOne({ transaction_id }));

    this.transaction_id = transaction_id;
    next();
  } catch (err) {
    next(err);
  }
});

transactionsSchema.plugin(softDeletePlugin);

const TransactionsUser = model("TransactionsUser", transactionsSchema);
export default TransactionsUser;
