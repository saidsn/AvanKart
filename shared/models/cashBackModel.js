import { model, Schema } from "mongoose";
import softDeletePlugin from "../utils/softDeletePlugin.js";
import TransactionsUser from "./transactionsModel.js";

const cashBackSchema = new Schema({
    sirket_id: {
        type: Schema.Types.ObjectId,
        ref: 'Sirket',
        default: null
    },
    folder_id: {
        type: Schema.Types.ObjectId,
        ref: 'CashbackFolder',
        default: null
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'SirketUsers',
        default: null
    },
    transaction_id: {
        type: Schema.Types.ObjectId,
        ref: 'TransactionsUser',
        default: null
    },
    muessise_id: {
        type: Schema.Types.ObjectId,
        ref: 'Muessise',
        default: null
    },
    card_id: {
        type: Schema.Types.ObjectId,
        ref: 'Cards',
        default: null
    },
    from_amount: {
        type: Number,
        default: 0
    },
    cashback: {
        type: Number,
        default: 0
    },
}, { timestamps: true });


cashBackSchema.plugin(softDeletePlugin);
const CashBack = model("CashBack", cashBackSchema);
export default CashBack;