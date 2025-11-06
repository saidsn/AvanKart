import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../../utils/softDeletePlugin.js";

const muqavilelerModelSchema = new Schema({
  fileName: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  muessise_id: {
    type: Schema.Types.ObjectId,
    ref: 'Muessise',
    default: null
  },
  sirket_id: {
    type: Schema.Types.ObjectId,
    ref: 'Sirket',
    default: null
  },
  added_user: {
    type: Schema.Types.ObjectId,
    ref: "AvankartAdmin"
  },
},
  { timestamps: true, }
);

muqavilelerModelSchema.plugin(softDeletePlugin);

const MuqavilelerModel = mongoose.model('Muqavileler', muqavilelerModelSchema);

export default MuqavilelerModel;