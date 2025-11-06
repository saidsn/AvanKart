import mongoose from 'mongoose';
const { Schema, model } = mongoose;
import PartnerUser from './partnyorUserModel.js';

const tempAddedPartnerProfileChangesSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'PartnerUser',
    required: true,
    index: true
  },
  muessise_id: {
    type: String,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  surname: {
    type: String,
    trim: true
  },
  fullName: {
    type: String,
    trim: true
  },
  full_name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  phone_suffix: {
    type: String,
    trim: true
  },
  phone_number: {
    type: String,
    trim: true
  },
  birth_date: {
    type: Date
  },
  password: {
    type: String
  },
  dutyId: {
    type: Schema.Types.ObjectId,
    ref: 'Duty'
  },
  permissionId: {
    type: Schema.Types.ObjectId,
    ref: 'Permission'
  },
  otp: {
    type: String
  },
  otp_type: {
    type: String,
    enum: ['email', 'sms', 'other'],
    default: 'email'
  },
  gender: { type: String, enum: ["male", "female", "other"], default: "male" },
  expiresAt: {
    type: Date
  },
  device_details: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

// TTL index burada tek tanımlı şekilde bırakılıyor
tempAddedPartnerProfileChangesSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const TempAddedPartnerProfileChanges = model('TempAddedPartnerProfileChanges', tempAddedPartnerProfileChangesSchema);

export default TempAddedPartnerProfileChanges;
