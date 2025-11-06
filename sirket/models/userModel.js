import mongoose from 'mongoose';
import {v4 as uuidv4} from 'uuid';

const { Schema, model } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    default: null
  },
  password: {
    type: String,
    required: true
  },
  coin: {
    type: Number,
    default: 0
  },
  balance: {
    type: Number,
    default: 0
  },
  wallet: {
    type: String,
    default: null
  },
  referal: { 
    type: String,
    unique: true, 
    default: () => uuidv4().slice(0, 8) 
  },
  referrer: { 
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null 
  }
}, { timestamps: true });

const User = model('User', userSchema);

export default User;
