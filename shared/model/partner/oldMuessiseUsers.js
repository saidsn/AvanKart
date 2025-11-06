import mongoose from "mongoose";
import softDeletePlugin from "../../utils/softDeletePlugin.js";

const oldMuessiseUsersSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PartnerUser",
  },
  user_partner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PartnerUser",
  },
  muessise_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Muessise",
  },
  hire_date: {
    type: Date,
    default: null,
  },
  dismissal_date: {
    type: Date,
    default: null,
  },
});

oldMuessiseUsersSchema.plugin(softDeletePlugin);

const OldMuessiseUsers = mongoose.model(
  "OldMuessiseUsers",
  oldMuessiseUsersSchema
);

export default OldMuessiseUsers;
