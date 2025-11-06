import Sirket from "../../../shared/models/sirketModel.js";
import PeopleUser from "../../../shared/models/peopleUserModel.js";

// Returns companies (default all), optional ?withPeopleOnly=1 to restrict.
export const peopleCompaniesListApi = async (req, res) => {
  try {
    const { withPeopleOnly } = req.query;
    let query = {};
    if (withPeopleOnly) {
      const companyIds = await PeopleUser.distinct("sirket_id", { sirket_id: { $ne: null } });
      query = companyIds.length ? { _id: { $in: companyIds } } : { _id: null }; // force empty if none
    }
    const companies = await Sirket.find(query)
      .select("_id sirket_name")
      .sort({ sirket_name: 1 })
      .limit(1000)
      .lean();

    return res.json({
      data: companies.map((c) => ({ id: c._id, name: c.sirket_name })),
    });
  } catch (e) {
    console.error("peopleCompaniesListApi error:", e);
    return res.status(500).json({ message: "Şirkət siyahısı alınmadı" });
  }
};

export default peopleCompaniesListApi;