import { create } from "qrcode";
import FavoriteMuessise from "../../../shared/model/partner/favoriteMuessises.js";

export const favoriteMuessise = async (req, res) => {
  try {
    const userId = req.user;
    const { muessise_id } = req.body;
    if (!muessise_id) {
      return res.status(400).json({ message: "muessise_id göndərilməlidir" });
    }

    let exists = await FavoriteMuessise.findOne({
      sirket_user: userId,
      muessise_id
    });
    console.log(exists);

    if (exists) {
      if (!exists.isFavorite) {
        // Favoriye eklenmek isteniyor
        const diffDays = (Date.now() - new Date(exists.updatedAt)) / (1000 * 60 * 60 * 24);

        // 3 gün kontrolü
        if (exists.attemps >= 25 && diffDays < 2) {
          return res.status(200).json({
            status: "added",
            message: "3 gün içinde maksimum sorğu haqqı doldu"
          });
        }

        // 3 günden fazlaysa deneme sıfırlanır
        if (diffDays >= 3) {
          exists.attemps = 0;
        }

        exists.isFavorite = true;
        exists.attemps = Number(exists.attemps) + 1;
        exists.updatedAt = new Date();
        await exists.save();
        console.log('addedd');

        return res.status(200).json({
          status: "added",
          message: "added"
        });
      } else {

        // Favoriden çıkarılıyor
        exists.isFavorite = false;
        exists.updatedAt = new Date();
        await exists.save();
        console.log('cixarildi');
        return res.status(200).json({
          status: "removed",
          message: "removed"
        });
      }
    }

    // yoksa yeni ekle
    await FavoriteMuessise.create({
      sirket_user: userId,
      muessise_id,
      added_time: new Date()
    });

    return res.status(200).json({
      status: "added",
      message: "added"
    });
  } catch (err) {
    console.error("favoriteMuessise error:", err);
    return res.status(500).json({ message: "Server xətası" });
  }
};