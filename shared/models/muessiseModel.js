import mongoose from "mongoose";
import softDeletePlugin from "../utils/softDeletePlugin.js";
import Rekvizitler from "./rekvizitlerModel.js";

const muessiseSchema = new mongoose.Schema(
  {
    activity_type: { type: String, required: true }, //
    commission_percentage: { type: Number, default: 0, min: 0, max: 100 }, //
    authorized_person: {
      name: { type: String, required: true },
      gender: {
        type: String,
        enum: ["male", "female", "other"],
        required: true,
      },
      duty: String,
      phone_suffix: String,
      phone: { type: Number, unique: true, sparse: true },
      email: { type: String, unique: true, sparse: true },
    }, //
    muessise_id: { type: String, unique: true }, //
    company_status: { type: Number, default: 0 }, //
    muessise_name: {
      type: String,
      trim: true,
    },
    muessise_category: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      // required: true,
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
        type: mongoose.Schema.Types.ObjectId,
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
      type: Map,
      of: String,
      default: {},
    },
    xarici_cover_image: String,
    xarici_cover_image_path: String,
    daxili_cover_image: String,
    daxili_cover_image_path: String,
    profile_image: String,
    profile_image_path: String,
    creator_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminUser",
      required: true,
    },
    rekvizitler: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rekvizitler",
      // required: true
    },
    location_point: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        index: "2dsphere",
        default: undefined,
      },
    },

    // cover_images: {
    //     outter: String,
    //     inner: String,
    //     profile: String
    // },
    // company: {
    //     name: String,
    //     address: String
    // },
    // place: {
    //     name: String,
    //     about: String,
    //     address: String
    // },
    // services: [{ type: String, enum: ["lunch", "takeaway", "delivery"], required: true }],
    // bank_info: {
    //     bank_name: String,
    //     swift: String,
    //     settlement_account: String,
    //     bank_code: String,
    //     muxbir_hesabi: String
    // },
    // voen: { type: String, unique: true, sparse: true },
    // contract_document: String,
  },
  {
    timestamps: true,
  }
);

muessiseSchema.pre("save", async function (next) {
  if (this.muessise_id) return next();
  try {
    let muessise_id;
    do {
      muessise_id = "MM-" + Math.floor(10000000 + Math.random() * 90000000);
    } while (await this.constructor.findOne({ muessise_id }));

    this.muessise_id = muessise_id;
    next();
  } catch (err) {
    next(err);
  }
});

muessiseSchema.plugin(softDeletePlugin);

export const Muessise = mongoose.model("Muessise", muessiseSchema);

export default Muessise;

// {
//     muessise_id: {
//         type: String,
//             required: true,
//     },
//     user_id: {
//         type: Schema.Types.ObjectId,
//             ref: 'PartnerUser',
//                 required: true,
//     },
//     muessise_name: {
//         type: String,
//             trim: true,
//     },
//     muessise_category: {
//         type: String,
//             trim: true,
//     },
//     address: {
//         type: String,
//             trim: true,
//     },
//     services: {
//         type: [String],
//       default: [],
//     },
//     description: {
//         type: String,
//             maxlength: 150,
//                 trim: true,
//     },
//     cards: [
//         {
//             type: Schema.Types.ObjectId,
//             ref: 'Card',
//         },
//     ],
//         schedule: {
//         type: Object,
//       default: { },
//     },
//     phone: {
//         type: [
//             {
//                 number: String,
//                 prefix: String,
//             },
//         ],
//       default: [],
//     },
//     email: {
//         type: [String],
//       default: [],
//     },
//     website: {
//         type: [String],
//       default: [],
//     },
//     social: {
//         type: Map,
//             of: String,
//       default: { },
//     },
//     xarici_cover_image: String,
//         xarici_cover_image_path: String,
//             daxili_cover_image: String,
//                 daxili_cover_image_path: String,
//                     profile_image: String,
//                         profile_image_path: String,
//   }
