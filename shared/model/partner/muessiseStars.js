import mongoose, { model, Schema} from "mongoose";
import softDeletePlugin from "../../utils/softDeletePlugin";


const muessiseStartsSchema = new Schema({
    sirket_user:{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: "SirketUsers"
    },
    muessise_id: {
        unique: true,
        type: String,
        ref: "Muessise"
    },
    rating: {
        type: Number,
        default: 5,
        min: 0,
        max: 5
    },
    added_time:{
        type: Date,
        required: true
    }
},{
    timestamps: true
});

muessiseStartsSchema.index(
    {
    sirket_user: 1,
    muessise_id: 1
    }
);

muessiseStartsSchema.plugin(softDeletePlugin);

const MuessiseStarts = model("MuessiseStarts", muessiseStartsSchema);

export default MuessiseStarts;