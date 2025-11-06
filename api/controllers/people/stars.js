import MuessiseStarts from "../../../shared/model/partner/muessiseStars.js";


export const getMuessiseStars = async (req,res) => {
    const { muessise_id } = req.body;

    try {
    const starsData = await MuessiseStarts.find({muessise_id: muessise_id});
    if( !starsData || starsData.length === 0 ) return res.status(400).json({
        message: "Stars not found",
        success: false
    });

    const filteredStars = starsData.filter( item => item.stars !== null && item.star >= 0 && item.star <= 5 );
    if (filteredStars.length === 0) {
            return res.status(200).json({
                message: "No valid star ratings found.",
                success: true
            });
        }
    const totalStars = filteredStars.reduce((sum, item) => sum += item.star, 0);
    const count = filteredStars.length;
    let averageRating = 0;

    if(count > 0) {
        averageRating = totalStars / count;
    };
    return res.status(200).json({
        message: "Average rating calculated successfully",
        success: true,
        averageRating: averageRating
    });
        
    } catch (error) {
        console.log(error, error.message);
        return res.status(500).json({
                message: "Internal server error",
                success: false
            });
    };
};


export const addMuessiseStars = async (req,res) => {
    const { muessise_id, rating } = req.body;

    try {

        if (!muessise_id || rating == null)  return res.status(400).json({ 
            message: "Muessise ID or rating is missing.",
            success: false
        });
        
        
        if (rating < 0 || rating > 5) return res.status(400).json({
            message: "Rating must be between 0 and 5.",
            success: false
        });
        

        const starsData = new MuessiseStarts({
            muessise_id: muessise_id,
            rating: rating
        });
        
            await  starsData.save()
            return res.status(201).json({
                message: "Update is successfully",
                success: true
            });

    } catch (error) {
            console.log("Error adding new star rating:", error.message);
            return res.status(500).json({
                message: "Internal server error",
                success: false
            });
    };


};