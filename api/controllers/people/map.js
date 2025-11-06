import Muessise from "../../../shared/models/muessiseModel.js";
import redisClient from "../../redisClient.js";
export const getOnMap = async (req, res) => {
    try {
        const { northEast, southWest } = req.body;

        if (!northEast || !southWest) {
            return res.status(400).json({ success: false, message: "northEast and southWest required." });
        }

        const cacheKey = `muessiseler:${northEast.lat},${northEast.lng},${southWest.lat},${southWest.lng}`;

        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            return res.json({ success: true, data: JSON.parse(cachedData), cached: true });
        }

        const muessiseler = await Muessise.find({
            location_point: {
                $geoWithin: {
                    $box: [
                        [southWest.lng, southWest.lat], // sol-aşağı
                        [northEast.lng, northEast.lat]  // sağ-yuxarı
                    ]
                }
            }
        }).select("profile_image_path location_point _id").limit(500);

        await redisClient.setEx(cacheKey, 45, JSON.stringify(muessiseler));

        res.json({ success: true, data: muessiseler, cached: false });

    } catch (error) {
        console.error("Get on Map error:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
}