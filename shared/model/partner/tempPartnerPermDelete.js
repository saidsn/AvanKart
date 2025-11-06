import mongoose from 'mongoose';
const { Schema, model } = mongoose;
import PartnerUser from '../../models/partnyorUserModel.js';
import rbacPermission from '../../models/rbacPermission.model.js'; // Assuming this is the correct import for the RbacPermission model

const tempPartnerPermDeleteSchema = new Schema({
  sender_id: {
    type: Schema.Types.ObjectId,
    ref: 'PartnerUser',
    required: true,
    index: true
  },
  permissions: [{ type: Schema.Types.ObjectId, ref: 'RbacPermission' }],
  otp_code: { type: String },
  otp_send_time: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// TTL index burada tek tanımlı şekilde bırakılıyor
tempPartnerPermDeleteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const TempPartnerPermDelete = model('TempPartnerPermDelete', tempPartnerPermDeleteSchema);

export default TempPartnerPermDelete;
