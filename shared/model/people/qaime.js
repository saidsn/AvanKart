import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../../utils/softDeletePlugin.js";

const qaimeSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "PeopleUsers",
    },
    sirket_id: {
      type: Schema.Types.ObjectId,
      ref: "Sirket",
      required: true,
    },
    transaction_id: {
      type: Schema.Types.ObjectId,
      ref: "TransactionsUser",
      required: true,
    },
    cards: [
      {
        card_id: {
          type: Schema.Types.ObjectId,
          ref: "Cards",
        },
        amount: Number,
      },
    ],
    total_balance: {
      type: Number,
      default: 0,
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      refPath: "refModel",
    },
    refModel: {
      type: String,
      enum: ["AdminUser", "PeopleUser"],
    },
    qaime_id: {
      type: String,
    },
    status: {
      type: String,
      enum: [
        "active",
        "passive",
        "canceled",
        "waiting",
        "reported",
        "completed",
      ],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

qaimeSchema.plugin(softDeletePlugin);

// Text axtarış üçün index (qaime_id və status üzrə)
qaimeSchema.index({ qaime_id: "text", status: "text" });

qaimeSchema.pre("save", async function (next) {
  // Generate qaime_id if not exists
  if (!this.qaime_id) {
    try {
      let qaime_id;
      do {
        qaime_id =
          "EQA-" + Math.floor(10000000000 + Math.random() * 90000000000);
      } while (await this.constructor.findOne({ qaime_id }));

      this.qaime_id = qaime_id;
    } catch (err) {
      return next(err);
    }
  }

  // Calculate total_balance from cards if not set
  if (this.cards && this.cards.length > 0) {
    this.total_balance = this.cards.reduce(
      (sum, card) => sum + (card.amount || 0),
      0
    );
  }

  next();
});

const EQaime = mongoose.model("EQaime", qaimeSchema);

export default EQaime;
