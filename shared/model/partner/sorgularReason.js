import { model, Schema } from 'mongoose';
import softDeletePlugin from '../../utils/softDeletePlugin.js';

const reasonSchema = new Schema({
    name: { type: String },
    text: { type: String },
    category: { type: String, enum: ['general', 'account', 'pay'], default: 'general' },
    admin_id: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
}, { timestamps: true });

reasonSchema.plugin(softDeletePlugin);

const SorgularReason = model("SorgularReason", reasonSchema);

export default SorgularReason;
