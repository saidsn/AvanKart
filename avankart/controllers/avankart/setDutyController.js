import PeopleUser from "../../../shared/models/peopleUserModel.js";
import SirketDuty from "../../../shared/models/Sirketduties.js";

export const setDutyController = async (req, res) => {
  try {
    const { peopleId } = req.params;
    const { dutyId } = req.body || {};

    const user = await PeopleUser.findById(peopleId).select("_id sirket_id duty");
    if (!user) return res.status(404).json({ success: false, message: "İstifadəçi tapılmadı" });

    if (!dutyId) {
      await PeopleUser.findByIdAndUpdate(user._id, { $set: { duty: null } });
      return res.json({ success: true, message: "Vəzifə silindi", data: { userId: user._id, duty: null } });
    }

    const duty = await SirketDuty.findOne({ _id: dutyId, deleted: false }).select("_id sirket_id name");
    if (!duty) return res.status(404).json({ success: false, message: "Duty tapılmadı" });

    if (user.sirket_id && duty.sirket_id && String(user.sirket_id) !== String(duty.sirket_id)) {
      return res.status(400).json({ success: false, message: "Duty bu istifadəçinin şirkətinə aid deyil" });
    }

    await PeopleUser.findByIdAndUpdate(user._id, { $set: { duty: duty._id } });
    return res.json({ success: true, message: "Vəzifə təyin olundu", data: { userId: user._id, duty: { id: duty._id, name: duty.name } } });
  } catch (e) {
    console.error("setDutyController error:", e);
    return res.status(500).json({ success: false, message: "Server xətası" });
  }
};

export default setDutyController;
