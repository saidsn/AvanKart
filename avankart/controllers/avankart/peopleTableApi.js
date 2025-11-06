import PeopleUser from "../../../shared/models/peopleUserModel.js";
import Sirket from "../../../shared/models/sirketModel.js";
import TempPeopleUserDelete from "../../../shared/model/people/tempPeopleUserDelete.js";

// Status numeric -> label xəritəsi (şərti olaraq)
const STATUS_MAP = {
  0: "Aktiv",
  1: "Deaktiv",
  2: "Silinib",
};

// Gender -> label
const GENDER_MAP = {
  male: "Kişi",
  female: "Qadın",
  other: "Digər",
};

export const peopleTableApi = async (req, res) => {
  try {
    if (process.env.NODE_ENV !== "production") {
      // Sadə diaqnostika üçün gələn body-ni log et
      console.log("[peopleTableApi] incoming body:", req.body);
    }
    const {
      draw = 1,
      start = 0,
      length = 10,
      search = "",
      status, // filtre üçün (Aktiv, Deaktiv və s.)
      genders, // array or single gender values
      cardGender, // fallback ad (mövcud frontend dəyişəni)
      companies, // array of company ObjectIds
      companys, // fallback yazılışı
      countsOnly, // yeni: yalnız tab count-ları istənirsə true
    } = typeof req.body === "object" ? req.body : {};

    // DataTables bəzən search obyekt göndərə bilər ( { value: "..." } ). Onu normalizə edirik.
    const rawSearch = search;
    const searchTerm =
      typeof rawSearch === "string"
        ? rawSearch.trim()
        : rawSearch && typeof rawSearch === "object" && rawSearch.value
          ? String(rawSearch.value).trim()
          : "";

    // Şirkət adına görə də axtarış dəstəyi: əvvəl uyğun şirkət _id-lərini tapırıq
    let companyIdMatches = [];
    if (searchTerm) {
      try {
        companyIdMatches = await Sirket.find({
          sirket_name: { $regex: searchTerm, $options: "i" },
        }).distinct("_id");
      } catch (e) {
        console.warn("[peopleTableApi] company name search error:", e.message);
      }
    }

    // axtarış şərti (ad, soyad, tam ad kombinasiyası, email, people_id və şirkət adı uyğun gələnlər)
    const searchFilter = searchTerm
      ? (() => {
          const orConds = [
            { name: { $regex: searchTerm, $options: "i" } },
            { surname: { $regex: searchTerm, $options: "i" } },
            { email: { $regex: searchTerm, $options: "i" } },
            { people_id: { $regex: searchTerm, $options: "i" } },
            {
              $expr: {
                $regexMatch: {
                  input: { $concat: ["$name", " ", "$surname"] },
                  regex: searchTerm,
                  options: "i",
                },
              },
            },
            {
              $expr: {
                $regexMatch: {
                  input: { $concat: ["$surname", " ", "$name"] },
                  regex: searchTerm,
                  options: "i",
                },
              },
            },
          ];
          if (companyIdMatches.length) {
            orConds.push({ sirket_id: { $in: companyIdMatches } });
          }
          return { $or: orConds };
        })()
      : {};

    // status filtrini numeric rekorda çevirmək (əgər klassik statuslardan biridir)
    let statusFilter = {};
    let specialPending = null; // 'silinme' | 'deaktiv'
    if (status) {
      if (status === "Silinmə gözləyir") {
        specialPending = "silinme";
      } else if (status === "Deaktivasiya gözləyir") {
        specialPending = "deaktiv"; // placeholder
      } else if (status === "Silinmişlər") {
        statusFilter = { status: 2 };
      } else if (status === "Aktiv") {
        statusFilter = { status: 0 };
      } else if (status === "Deaktiv") {
        statusFilter = { status: 1 };
      }
    }

    if (countsOnly) {
      // Pending deletion user ids
      const pendingDocs = await TempPeopleUserDelete.find({})
        .select("users")
        .lean();
      const pendingDeleteIds = new Set();
      pendingDocs.forEach((doc) =>
        doc.users.forEach((id) => pendingDeleteIds.add(String(id)))
      );
      const pendingArray = Array.from(pendingDeleteIds);

      // Count base statuses excluding pending for aktiv/deaktiv
      const [aktivRaw, deaktivRaw, silinmis] = await Promise.all([
        PeopleUser.countDocuments({ status: 0 }),
        PeopleUser.countDocuments({ status: 1 }),
        PeopleUser.countDocuments({ status: 2 }),
      ]);

      let pendingDeleteCount = 0;
      if (pendingArray.length) {
        pendingDeleteCount = await PeopleUser.countDocuments({
          _id: { $in: pendingArray },
          status: { $in: [0, 1] },
        });
      }

      // Aktiv / Deaktiv saylarından pending-i çıx
      const aktiv =
        aktivRaw -
        (pendingDeleteCount
          ? await PeopleUser.countDocuments({
              _id: { $in: pendingArray },
              status: 0,
            })
          : 0);
      const deaktiv =
        deaktivRaw -
        (pendingDeleteCount
          ? await PeopleUser.countDocuments({
              _id: { $in: pendingArray },
              status: 1,
            })
          : 0);

      const deactivationPending = 0; // placeholder
      const total =
        aktiv + deaktiv + silinmis + pendingDeleteCount + deactivationPending;

      return res.status(200).json({
        data: {
          total,
          aktiv: Math.max(aktiv, 0),
          deaktiv: Math.max(deaktiv, 0),
          silinmis,
          pendingDelete: pendingDeleteCount,
          deactivationPending,
        },
      });
    }
    // Gender filter
    let genderFilter = {};
    const genderInput = Array.isArray(genders)
      ? genders
      : Array.isArray(cardGender)
        ? cardGender
        : genders || cardGender
          ? [genders || cardGender]
          : [];
    if (genderInput.length) {
      genderFilter = { gender: { $in: genderInput.filter(Boolean) } };
    }

    // Company filter
    let companyFilter = {};
    const companyInput = Array.isArray(companies)
      ? companies
      : Array.isArray(companys)
        ? companys
        : companies || companys
          ? [companies || companys]
          : [];
    if (companyInput.length) {
      companyFilter = { sirket_id: { $in: companyInput.filter(Boolean) } };
    }

    let baseQuery = {
      ...searchFilter,
      ...statusFilter,
      ...genderFilter,
      ...companyFilter,
    };

    const totalCount = await PeopleUser.countDocuments();
    const filteredCount = await PeopleUser.countDocuments(baseQuery);
    if (process.env.NODE_ENV !== "production") {
      console.log(
        "[peopleTableApi] searchTerm:",
        searchTerm,
        "companyMatches:",
        companyIdMatches.length
      );
      console.log("[peopleTableApi] baseQuery:", JSON.stringify(baseQuery));
      console.log(
        "[peopleTableApi] counts => total:",
        totalCount,
        "filtered:",
        filteredCount
      );
    }

    // Əvvəlcə bazadan (klassik filtrlər) uyğun istifadəçiləri götürürük
    let users = await PeopleUser.find(baseQuery)
      .populate("duty", "name")
      .populate("sirket_id", "sirket_name")
      .skip(Number(start))
      .limit(Number(length));

    // Pending deletion set
    const userIds = users.map((u) => u._id);
    let pendingDeleteSet = new Set();
    if (userIds.length) {
      const pendingDocs = await TempPeopleUserDelete.find({
        users: { $in: userIds },
      })
        .select("users")
        .lean();
      pendingDocs.forEach((doc) =>
        doc.users.forEach((id) => pendingDeleteSet.add(String(id)))
      );
    }

    // Əgər xüsusi pending status filtri varsa, nəticələri post-filter edirik
    if (specialPending === "silinme") {
      users = users.filter(
        (u) => pendingDeleteSet.has(String(u._id)) && u.status !== 2
      );
    } else if (specialPending === "deaktiv") {
      users = users.filter(() => false); // gələcək implementasiya
    } else {
      // Normal tablar: Aktiv və Deaktiv seçildikdə pending silinmə istifadəçilərini çıxar
      if (statusFilter.status === 0 || statusFilter.status === 1) {
        users = users.filter((u) => !pendingDeleteSet.has(String(u._id)));
      }
      // Silinmişlər seçilibsə statusFilter.status===2; pending etiketi tətbiq olunmur.
    }

    const data = users.map((u) => {
      const verified =
        u.otp_email_status === 2 ||
        u.otp_sms_status === 2 ||
        u.otp_authenticator_status === 2;

      let statusLabel = STATUS_MAP[u.status] || "Aktiv";
      if (pendingDeleteSet.has(String(u._id)) && u.status !== 2) {
        statusLabel = "Silinmə gözləyir";
      }
      // Yeni sahələr: activationStatus (əsas numeric status-un label-i) və pendingDelete boolean
      const activationStatus = STATUS_MAP[u.status] || "Aktiv";
      const pendingDelete = pendingDeleteSet.has(String(u._id)) && u.status !== 2;
      return {
        id: u.people_id || u._id.toString(), // cədvəldə ID üçün
        name: `${u.name || ""} ${u.surname || ""}`.trim(),
        gender: GENDER_MAP[u.gender] || "-",
        jobTitle: u.duty?.name || "—",
        email: u.email || "—",
        phone: `+${u.phone_suffix || "994"} ${u.phone || ""}`.trim(),
        company: u.sirket_id?.sirket_name || "—",
        createdAt: u.createdAt
          ? u.createdAt.toLocaleDateString("az-AZ", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })
          : "—",
        verified: verified ? "TRUE" : "FALSE",
        status: statusLabel, // legacy field (geri uyğunluq)
        activationStatus,   // əsas activation status badge-i üçün
        pendingDelete,      // ikinci badge göstərə bilmək üçün
      };
    });

    return res.status(200).json({
      draw: Number(draw),
      recordsTotal: totalCount,
      recordsFiltered: filteredCount,
      data,
    });
  } catch (err) {
    console.error("peopleTableApi error:", err);
    return res.status(500).json({ message: "Server xətası" });
  }
};

export default peopleTableApi;
