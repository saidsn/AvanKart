import Hesablasma from "../../shared/model/partner/Hesablasma.js";
import FAQ from "../../shared/models/faqModel.js";
import Sirket from "../../shared/models/sirketModel.js";
import PeopleUser from "../../shared/models/peopleUserModel.js";
import ImtiyazQruplari from "../../shared/model/people/imtiyazQruplari.js";

export const getHome = async (req, res) => {
  try {
    const currentLang = req.getLocale();
    const langFilter = `lang.${currentLang}`;
    const myUser = await PeopleUser.findById(req.user.id);
    // const sirket = await Sirket.findById(myUser.sirket_id).populate("cards");
    // const imtiyazlar = await ImtiyazQruplari.find({sirket_id: sirket._id});

    // Cards array-ini hazırla frontend üçün
    // const cards = sirket?.cards || [];

    return res.render("pages/index", {
      title: "Home Page",
      user: req.user,
      csrfToken: req.csrfToken(),
    });
  } catch (err) {
    return res.status(500).send("Error fetching posts");
  }
};

export const getHesablashmalar = async (req, res) => {
  try {
    const currentLang = req.getLocale();
    const langFilter = `lang.${currentLang}`;
    const myUser = req.user.id;
    const currentUser = await PeopleUser.findById(myUser);
    // Hesablaşmaların statuslarına görə sayını tap
    const qaralamaCount = await Hesablasma.countDocuments({
      status: "qaralama",
      sirket_id: currentUser.sirket_id,
    });
    const waitingActiveCount = await Hesablasma.countDocuments({
      status: "waiting_aktiv",
      sirket_id: currentUser.sirket_id,
    });
    const waitingTamamlandiCount = await Hesablasma.countDocuments({
      status: "waiting_tamamlandi",
      sirket_id: currentUser.sirket_id,
    });
    const reportedCount = await Hesablasma.countDocuments({
      status: { $regex: /^reported/ },
      sirket_id: currentUser.sirket_id,
    });
    const aktivCount = await Hesablasma.countDocuments({
      status: "aktiv",
      sirket_id: currentUser.sirket_id,
    });
    const tamamlandiCount = await Hesablasma.countDocuments({
      status: "tamamlandi",
      sirket_id: currentUser.sirket_id,
    });

    // Ümumi məbləğ
    const totalAmountResult = await Hesablasma.aggregate([
      { $match: { sirket_id: currentUser.sirket_id } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    const totalAmount = totalAmountResult[0]?.total || 0;

    return res.render("pages/hesablasmalar/hesablasmalar", {
      title: "Hesablashmalar Page",
      user: req.user,
      csrfToken: req.csrfToken(),
      counts: {
        qaralama: qaralamaCount,
        waiting_aktiv: waitingActiveCount,
        waiting_tamamlandi: waitingTamamlandiCount,
        reported: reportedCount,
        aktiv: aktivCount,
        tamamlandi: tamamlandiCount,
        total: totalAmount,
      },
    });
  } catch (err) {
    console.error("getHesablashmalar error:", err);
    return res.status(500).send("Error fetching hesablasmalar data");
  }
};

export const fag = async (req, res) => {
  try {
    const faqs = await FAQ.find(
      { project: "sirket" },
      { question: 1, answer: 1, _id: 0 }
    );

    res.status(200).json({ success: true, data: faqs });
  } catch (error) {
    console.error("FAQ controller error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error." });
  }
};

export const getUserDuty = async (req, res) => {
  try {
    const userId = req.user.id;
    const myUser = await PeopleUser.findById(userId).populate("duty");

    if (!myUser) {
      return res.json({
        success: false,
        name: "Təyin olunmayıb",
        surname: "Təyin olunmayıb",
        dutyName: "Təyin olunmayıb",
      });
    }

    return res.json({
      success: true,
      name: myUser.name || "",
      surname: myUser.surname || "",
      dutyName: myUser.duty
        ? myUser.duty.name || "Təyin olunmayıb"
        : "Təyin olunmayıb",
    });
  } catch (error) {
    return res.json({
      success: false,
      dutyName: "Təyin olunmayıb",
    });
  }
};
