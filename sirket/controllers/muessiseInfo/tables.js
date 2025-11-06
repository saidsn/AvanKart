import MuqavilelerModel from '../../../shared/model/partner/muqavilelerModel.js';
import PeopleUser from '../../../shared/models/peopleUserModel.js';
// import PartnerUser from '../../../shared/models/partnyorUserModel.js';

export const muessiseMuqavile = async (req, res) => {
  const { search, start_date, end_date, draw, start = 0, length = 8 } = req.body;
  const user = req.user;

  try {
    // PeopleUser-dən sirket_id götürürük
    const userFromDb = await PeopleUser.findById(user.id).select('sirket_id')

    if (!userFromDb) {
      return res.status(404).json({ error: "User not found" });
    }
    // Keçid dövründə qırılmaması üçün hər iki sahəni dəstəkləyirik
    const baseQuery = {
      $or: [
        { sirket_id: userFromDb.sirket_id },
        { muessise_id: userFromDb.sirket_id } // köhnə model üçün fallback
      ]
    };

    const filterQuery = { ...baseQuery };

    if (search) {
      filterQuery.fileName = { $regex: search, $options: 'i' };
    }

    if (start_date && end_date) {
      filterQuery.createdAt = {
        $gte: new Date(start_date),
        $lte: new Date(end_date)
      };
    }

    const totalCount = await MuqavilelerModel.countDocuments(baseQuery);
    const filteredCount = await MuqavilelerModel.countDocuments(filterQuery);
    const muqavilelerRaw = await MuqavilelerModel.find(filterQuery)
      .sort({ createdAt: -1 })
      .skip(Number(start))
      .limit(Number(length))
      .populate('added_user', 'name surname');
      
    muqavilelerRaw.forEach(item => {
            const [baseName, extension] = item.fileName.split(".");
            const parts = baseName.split("-");
            const lastPart = parts.pop(); 
            const title = "Müqavilə-" + lastPart;
            item.fileName = title
    });
    const muqavileler = muqavilelerRaw.map(muqavile => ({
      title: muqavile.fileName,
      date: muqavile.createdAt.toLocaleDateString('az-AZ', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }),
      time: muqavile.createdAt.toLocaleTimeString('az-AZ', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      format: muqavile.filePath.split('.').pop(),
      fileName: muqavile.filePath
    }));

    return res.status(200).json({
      draw: Number(draw),
      recordsTotal: totalCount,
      recordsFiltered: filteredCount,
      data: muqavileler
    });
  } catch (error) {
    console.error("Error fetching muqavileler:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const filterMuessiseMuqavile = async (req, res) => {
  const { search, start_date, end_date, draw, start = 0, length = 8 } = req.body;
  const user = req.user;
  try {
    // PeopleUser-dən sirket_id götürürük
    const userFromDb = await PeopleUser.findById(user.id).select('sirket_id')

    if (!userFromDb) {
      return res.status(404).json({ error: "User not found" });
    }
    // Keçid dövründə qırılmaması üçün hər iki sahəni dəstəkləyirik
    const baseQuery = {
      $or: [
        { sirket_id: userFromDb.sirket_id },
        { muessise_id: userFromDb.sirket_id } // köhnə model üçün fallback
      ]
    };

    const filterQuery = { ...baseQuery };

    if (search) {
      filterQuery.fileName = { $regex: search, $options: 'i' };
    }

    if (start_date && end_date) {
      filterQuery.createdAt = {
        $gte: new Date(start_date),
        $lte: new Date(end_date)
      };
    }

    const totalCount = await MuqavilelerModel.countDocuments(baseQuery);
    const filteredCount = await MuqavilelerModel.countDocuments(filterQuery);
    const muqavilelerRaw = await MuqavilelerModel.find(filterQuery)
      .sort({ createdAt: -1 })
      .skip(Number(start))
      .limit(Number(length))
      // .populate('added_user', 'name surname');
      
    muqavilelerRaw.forEach(item => {
            const [baseName, extension] = item.fileName.split(".");
            const parts = baseName.split("-");
            const lastPart = parts.pop(); 
            const title = "Müqavilə-" + lastPart;
            item.fileName = title
    });


    const muqavileler = muqavilelerRaw.map(muqavile => ({
      title: muqavile.fileName,
      date: muqavile.createdAt.toLocaleDateString('az-AZ', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }),
      time: muqavile.createdAt.toLocaleTimeString('az-AZ', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      format: muqavile.filePath.split('.').pop(),
      fileName: muqavile.filePath
    }));

    return res.status(200).json({
      draw: Number(draw),
      recordsTotal: totalCount,
      recordsFiltered: filteredCount,
      data: muqavileler,
      csrfToken: req.csrfToken()
    });
  } catch (error) {
    console.error("Error fetching muqavileler:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
