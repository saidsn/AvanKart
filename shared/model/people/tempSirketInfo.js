import mongoose from "mongoose";

const { Schema,model } = mongoose
const TempsirketInfoSchema = new Schema({
    sirket_id: {
      type: String,
      required: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "PeopleUser",
      required: true,
    },
    admin_id: {
      type: Schema.Types.ObjectId,
      ref: "AdminUser",
      required: false,
      default: null
    },
    sirket_name: {
      type: String,
      trim: true,
    },
    sirket_category: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    services: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      maxlength: 150,
      trim: true,
    },
    cards: [
      {
        type: Schema.Types.ObjectId,
        ref: "Cards",
      },
    ],
    schedule: {
      type: Object,
      default: {},
    },
    phone: {
      type: [
        {
          number: String,
          prefix: String,
        },
      ],
      default: [],
    },
    email: {
      type: [String],
      default: [],
    },
    website: {
      type: [String],
      default: [],
    },
    social: {
      type: Schema.Types.Mixed,
      default: {},
    },
    xarici_cover_image: String,
    xarici_cover_image_path: String,
    daxili_cover_image: String,
    daxili_cover_image_path: String,
    profile_image: String,
    profile_image_path: String,
  },{
    timestamps: true
  });

const TempsirketInfo = model("TempsirketInfo", TempsirketInfoSchema);

export default TempsirketInfo;
