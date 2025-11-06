import mongoose from "mongoose";
import softDeletePlugin from "../../utils/softDeletePlugin.js";

const oldSirketUsersSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PeopleUser",
  },
  user_sirket_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PeopleUser",
  },
  sirket_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sirket",
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

oldSirketUsersSchema.plugin(softDeletePlugin);

const OldSirketUsers = mongoose.model("OldSirketUsers", oldSirketUsersSchema);

export default OldSirketUsers;
