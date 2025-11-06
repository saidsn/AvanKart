import mongoose from 'mongoose';
const { Schema, model } = mongoose;
import PartnerUser from '../../models/partnyorUserModel.js';

const tempPartnerUserDeleteSchema = new Schema({
  sender_id: {
    type: Schema.Types.ObjectId,
    ref: 'PartnerUser',
    required: true,
    index: true
  },
  users: [{ type: Schema.Types.ObjectId, ref: 'PartnerUser' }],
  otp_code: { type: String },
  otp_send_time: { type: Date, default: Date.now },
}, {
  timestamps: true
});

// TTL index burada tek tanımlı şekilde bırakılıyor
tempPartnerUserDeleteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const TempPartnerUserDelete = model('TempPartnerUserDelete', tempPartnerUserDeleteSchema);

export default TempPartnerUserDelete;
