import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const tempAddedPeopleProfileChangesSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'PeopleUser',
    required: true,
    index: true
  },
  name: {
    type: String,
    trim: true
  },
  surname: {
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
  duty: { type: Schema.Types.ObjectId, ref: "SirketDuty", default: null },
  perm: { type: Schema.Types.ObjectId, ref: "RbacPeoplePermission", default: null },
  password: {
    type: String
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

tempAddedPeopleProfileChangesSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const TempAddedPeopleProfileChanges = model('TempAddedPeopleProfileChanges', tempAddedPeopleProfileChangesSchema);

export default TempAddedPeopleProfileChanges;
