import PartnerUser from "../../shared/models/partnyorUserModel.js";
import { sendNotification } from "../../shared/utils/sendNotification.js";

export const testNotification = async (req, res) => {
  try {
    const { title, body } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: "Title və Body mütləqdir" });
    }

    // Tokeni olan istifadəçiləri tap
    const usersWithToken = await PartnerUser.find({ token: { $ne: null } });

    const tokens = usersWithToken.map((user) => user.token);

    const result = await sendNotification({
      title,
      body,
      tokens,
      data: {
        customKey: "customValue", // istəyə uyğun əlavə data
      },
    });

    if (!result.success) {
      return res
        .status(500)
        .json({ message: "Bildiriş göndərilə bilmədi", error: result.message });
    }

    return res
      .status(200)
      .json({ message: "Bildiriş göndərildi", response: result.result });
  } catch (error) {
    console.error("[testNotification]", error);
    return res.status(500).json({ message: "Server xətası baş verdi" });
  }
};
