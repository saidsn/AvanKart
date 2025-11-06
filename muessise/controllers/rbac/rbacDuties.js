import Duties from "../../../shared/models/duties.js";
import PartnerUser from "../../../shared/models/partnyorUserModel.js";

export const createDuty = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({
        message: "Vəzifə adı tələb olunur.",
        success: false,
      });
    }

    // Get user by ID at PartnerUser to find muessise_id
    const user = await PartnerUser.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: "İstifadəçi tapılmadı.",
        success: false,
      });
    }

    const muessise_id = user.muessise_id;

    if (!muessise_id) {
      return res.status(400).json({
        error: "İstifadəçinin muessise_id-si tapılmadı.",
        success: false,
      });
    }

    // Check if duty already exists in same muessise_id
    const existingDuty = await Duties.findOne({
      // Regex beacuse of case-sensivity
      name: { $regex: new RegExp(`^${name}$`, "i") },
      muessise_id: muessise_id,
    });

    if (existingDuty) {
      return res.status(400).json({
        error: "Bu vəzifə artıq mövcuddur.",
        success: false,
      });
    }

    const duty = new Duties({
      name,
      muessise_id,
      creator_id: userId,
    });

    await duty.save();

    return res.status(201).json({
      message: "Vəzifə uğurla yaradıldı.",
      success: true,
      redirect: "/muessise-info",
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
    const { name, id } = req.body;
    const userId = req.user.id;
    const newName = name;
    const dutyId = id; 
    if (!newName || !userId) {
      return res.status(401).json({
        message: "Duty id or new name are required",
        success: false,
      });
    }

    const user = await PartnerUser.findById(userId);
    if (!user) {
      return res.status(400).json({
        message: "User not found",
        success: false,
      });
    }

    const muessise_id = user.muessise_id;

    const duties = await Duties.findById(dutyId);

    if (!duties)
      return res.status(404).json({
        message: "Duty not found",
        success: false,
      });

    if (String(muessise_id) !== String(duties.muessise_id))
      return res.status(403).json({
        message: "You are not authorized to edit this page",
        success: false,
      });

    duties.name = newName;
    await duties.save();

    return res.status(200).json({
      message: "Duty updated successfully",
      success: true,
      redirect: '/muessise-info'
    });
  } catch (error) {
    console.error("Error updating duty", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      redirect: '/muessise-info'
    });
  }
};

export const showDuties = async (req, res) => {
  try {
    const { start, length, draw, query, order, columns } = req.body;
    const myUser = await PartnerUser.findById(req.user?.id);
    const muessiseId = myUser.muessise_id;

    if (!muessiseId) {
      return res.status(400).json({
        message: "Müəssisə ID-si tapılmadı.",
        success: false,
      });
    }

    let sort = {};
    if (order && order.length > 0) {
      const orderColumnIndex = order[0].column;
      const orderDir = order[0].dir === "asc" ? 1 : -1;
      const orderColumnName = columns[orderColumnIndex].data;
      sort[orderColumnName] = orderDir;
    } else {
      sort.date = -1; // default sıralama (tarih azalan)
    }

    const filter = { muessise_id: muessiseId, deleted: false };

    if (query && query.trim() !== "") {
      const searchRegex = new RegExp(query.trim(), "i");
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [{ name: searchRegex }],
      });
    }

    const recordFiltered = await Duties.countDocuments(filter);
    const recordTotal = await Duties.countDocuments(filter);
    const duties = await Duties.find({
      muessise_id: muessiseId,
      deleted: false,
    })
      .skip(Number(start))
      .limit(Number(length))
      .sort(sort)
      .populate("creator_id", "name surname");

    if (duties.length === 0)
      return res.status(200).json({
        message: "Duty not found",
        draw: draw ?? 1,
        recordFiltered: 0,
        recordTotal: 0,
        data: [],
        success: false,
      });

    let data = [];
    for (let duty of duties) {
      const membersCount = await PartnerUser.countDocuments({
        duty: duty._id,
        muessise_id: muessiseId,
        deleted: false,
      });

      const createdBy = `${duty.creator_id?.name || ""}  ${
        duty.creator_id?.surname || ""
      } `;
      const createdDate = new Date(duty.created_at).toLocaleDateString("az-AZ");
      data.push({
        id: duty._id,
        roleName: duty.name,
        membersInRole: membersCount,
        createdBy,
        createdDate,
      });
    }

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
