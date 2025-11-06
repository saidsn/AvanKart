import mongoose, { Schema, model} from "mongoose";
import softDeletePlugin from "../../utils/softDeletePlugin.js";

 const favoriteMuessiseSchema = new Schema({
     sirket_user:{ 
         type: mongoose.Schema.Types.ObjectId,
         ref: "SirketUsers"
     },
     muessise_id: {
        //  unique: true,
         type: mongoose.Schema.Types.ObjectId,
         ref: "Muessise"
     },
     added_time:{
         type: Date,
         required: true
     },
     isFavorite: {
        type: Boolean,
        default: true
     },
     attemps: {
        type: Number,
        default: 1
     }
 },{
     timestamps: true
 });

 favoriteMuessiseSchema.index(
    {
        sirket_user: 1,
        muessise_id: 1
    }
 );

 favoriteMuessiseSchema.pre("save", function (next) {
    const now = new Date();
    
    // Eğer updatedAt 3 günden eskiyse deneme sayısını sıfırla
    if (this.updatedAt) {
        const diffMs = now - this.updatedAt;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        
        if (diffDays >= 3) {
            this.attemps = 0;
        }
    }

    // Deneme hakkı dolmuşsa kaydı engelle
    if (this.attemps >= 5) {
        // const err = new Error("3 gün içinde maksimum deneme hakkı doldu");
        // err.status = 429;
        return next();
    }

    // Normalde kaydedilecekse deneme sayısını artır
    this.attemps = (this.attemps || 0) + 1;

    next();
});

 favoriteMuessiseSchema.plugin(softDeletePlugin);

 const FavoriteMuessise = model("FavoriteMuessise",favoriteMuessiseSchema);

 export default  FavoriteMuessise