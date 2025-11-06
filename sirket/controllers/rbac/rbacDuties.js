import SirketDuty from "../../../shared/models/Sirketduties.js";
import PeopleUser from "../../../shared/models/peopleUserModel.js";
// import PartnerUser from "../../../shared/models/partnyorUserModel.js";

export const createDuty = async (req, res) => {
  try {
    const { name, redirect } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({
        message: "Vəzifə adı tələb olunur.",
        success: false,
      });
    }

    // Get user by ID at PeopleUser to find sirket_id
    const user = await PeopleUser.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: "İstifadəçi tapılmadı.",
        success: false,
      });
    }

    const sirket_id = user.sirket_id;

    if (!sirket_id) {
      return res.status(400).json({
        error: "İstifadəçinin sirket_id-si tapılmadı.",
        success: false,
      });
    }

    // Check if duty already exists in same sirket_id
    const existingDuty = await SirketDuty.findOne({
      // Regex because of case-sensitivity
      name: { $regex: new RegExp(`^${name}$`, "i") },
      sirket_id: sirket_id,
    });

    if (existingDuty) {
      return res.status(400).json({
        error: "Bu vəzifə artıq mövcuddur.",
        success: false,
      });
    }

    const duty = new SirketDuty({
      name,
      sirket_id,
      creator_id: userId,
    });

    await duty.save();

    return res.status(201).json({
      message: "Vəzifə uğurla yaradıldı.",
      success: true,
      redirect: redirect ?? "/muessise-info",
      duty,
    });
  } catch (error) {
    console.error("Error creating duty:", error);
    return res.status(500).json({
      error: "Vəzifə yaradılarkən xəta baş verdi.",
      success: false,
    });
  }
};

export const editDuty = async (req, res) => {
  try {
    const { name, id, redirect } = req.body;
    const userId = req.user.id;
    const newName = name;
    const dutyId = id;
    if (!newName || !userId) {
      return res.status(401).json({
        message: "Duty id or new name are required",
        success: false,
      });
    }

    const user = await PeopleUser.findById(userId);
    if (!user) {
      return res.status(400).json({
        message: "User not found",
        success: false,
      });
    }

    const sirket_id = user.sirket_id;

    const duties = await SirketDuty.findById(dutyId);

    if (!duties)
      return res.status(404).json({
        message: "Duty not found",
        success: false,
      });

    if (String(sirket_id) !== String(duties.sirket_id))
      return res.status(403).json({
        message: "You are not authorized to edit this page",
        success: false,
      });

    duties.name = newName;
    await duties.save();

    return res.status(200).json({
      message: "Duty updated successfully",
      success: true,
      redirect: redirect ?? "/muessise-info",
    });
  } catch (error) {
    console.error("Error updating duty", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      redirect: redirect ?? "/muessise-info",
    });
  }
};

export const showDuties = async (req, res) => {
  try {
    const { start, length, draw, search, order, columns } = req.body;
    const query = search?.value?.trim() || "";
    const myUser = await PeopleUser.findById(req.user?.id);
    const sirketId = myUser?.sirket_id;

    if (!sirketId) {
      return res.status(400).json({
        message: "Şirkət ID-si tapılmadı.",
        success: false,
      });
    }

    // sıralama
    let sort = {};
    if (order && order.length > 0) {
      const orderColumnIndex = order[0].column;
      const orderDir = order[0].dir === "asc" ? 1 : -1;
      const orderColumnName = columns[orderColumnIndex].data;
      sort[orderColumnName] = orderDir;
    } else {
      sort.date = -1;
    }

    // filter tanımı
    const baseFilter = { sirket_id: sirketId, deleted: false };
    const filter = { ...baseFilter };

    if (query) {
      const regex = new RegExp(query, "i");
      filter.$or = [
        { name: regex },
        { "creator_id.name": regex },
        { "creator_id.surname": regex }
      ];
    }

    // toplam ve filtreli kayıt sayısı
    const recordTotal = await SirketDuty.countDocuments(baseFilter);
    const recordFiltered = await SirketDuty.countDocuments(filter);

    // duties çekme (pagination dahil)
    const duties = await SirketDuty.find(filter)
      .skip(Number(start) || 0)
      // .limit(Number(length) || 10)
      .sort(sort)
      .populate("creator_id", "name surname");

    if (duties.length === 0) {
      return res.status(200).json({
        message: "Duty not found",
        draw: draw ?? 1,
        recordFiltered: 0,
        recordTotal,
        data: [],
        success: false,
      });
    }

    // member count optimizasyonu
    const dutyIds = duties.map((d) => d._id);
    const membersCounts = await PeopleUser.aggregate([
      { $match: { duty: { $in: dutyIds }, sirket_id: sirketId, deleted: false } },
      { $group: { _id: "$duty", count: { $sum: 1 } } }
    ]);
    const countsMap = membersCounts.reduce((acc, cur) => {
      acc[cur._id.toString()] = cur.count;
      return acc;
    }, {});

    // response için format
    const data = duties.map((duty) => ({
      id: duty._id,
      roleName: duty.name,
      membersInRole: countsMap[duty._id.toString()] || 0,
      createdBy: `${duty.creator_id?.name || ""} ${duty.creator_id?.surname || ""}`,
      createdDate: new Date(duty.created_at).toLocaleDateString("az-AZ")
    }));

    return res.status(200).json({
      message: "Duties show is successfully",
      success: true,
      draw,
      recordFiltered,
      recordTotal,
      data,
    });
  } catch (error) {
    console.error("Error showing duty", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};