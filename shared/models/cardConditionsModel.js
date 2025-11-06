import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../utils/softDeletePlugin.js";

const cardConditionsSchema = new mongoose.Schema({
    cardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cards',
        required: true
    },
    description: {
        type: String
    },
    title: {
        type: String,
        default: 'usage'
    },
    category: {
        type: String,
        enum: ['usage','activate','deactivate','default','deactivate_reason'],
        default: 'usage'
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminUser',
        required: true
    },
}, { timestamps: true });

cardConditionsSchema.plugin(softDeletePlugin);

const CardConditions = mongoose.model('CardConditions', cardConditionsSchema);

export default CardConditions;
