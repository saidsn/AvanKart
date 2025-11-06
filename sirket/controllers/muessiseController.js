import PeopleUser from "../../shared/models/peopleUserModel.js";
import { Sirket } from "../../shared/models/sirketModel.js";
import Duties from "../../shared/models/duties.js";
import RbacPermission from "../../shared/models/rbacPermission.model.js";
import RbacPeoplePermission from "../../shared/models/rbacPeopleModel.js";
import SirketDuty from "../../shared/models/Sirketduties.js";
import Cards from "../../shared/models/cardModel.js";
import TempSirketInfo from "../../shared/model/people/tempSirketInfo.js";
import Rekvizitler from "../../shared/models/rekvizitlerModel.js";
import MuqavilelerModel from "../../shared/model/partner/muqavilelerModel.js";

export const muessiseInfo = async (req, res) => {
  try {
    const userId = req.user?.id;
    const user = await PeopleUser.findById(userId);
    if (!user) return res.status(404).send("User not found");

    const sirketId = user?.sirket_id || user?.muessise_id;
    const sirket = await Sirket.findById(sirketId).populate(
      "rekvizitler creator_id cards"
    );
    if (!sirket) return res.status(404).send("Sirket not found");

    const allCards = await Cards.find({ status: "active" }).sort({ name: 1 });
    const duties = await SirketDuty.find({ sirket_id : sirketId });
    const permissions = await RbacPeoplePermission.find({
      $or: [{ sirket_id: sirketId }, { muessise_id: sirketId }],
    });
      const rekvizitler = await Rekvizitler.find();


    res.render("pages/muessiseInfo.ejs", {
      muessise: sirket,
      allCards,
      csrfToken: req.csrfToken(),
      activeLang: req.getLocale(),
      duties,
      permissions,
      rekvizitler,
    });

  } catch (error) {
    console.error("Sirket info error:", error);
    res.status(500).send("Internal server error");
  }
};

export const getMuessisePageInfo = async (req, res) => {
  try {
    const userId = req.user?.id;
    const user = await PeopleUser.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: res.__("messages.muessiseController.user_not_found"),
      });
    }

    const sirketId = user?.sirket_id || user?.muessise_id;
    const sirket = await Sirket.findById(sirketId).populate(
      "rekvizitler creator_id cards"
    );

    if (!sirket) {
      return res.status(404).json({
        success: false,
        message: res.__("messages.muessiseController.muessise_not_found"),
      });
    }

    const allCards = await Cards.find({ status: "active" }).sort({ name: 1 });
    
    res.json({
      success: true,
      muessise: sirket,
      allCards,
      csrfToken: req.csrfToken(),
      activeLang: req.getLocale(),
    });
  } catch (err) {
    console.error("Error fetching sirket info:", err);
    res.status(500).json({
      success: false,
      message: res.__("messages.muessiseController.internal_server_error"),
      details: process.env.NODE_ENV === "development" ? err.message : null,
    });
  }
};

export const getHistoryDetails = async (req, res) => {
  try {
    const { history_id } = req.body;
    const userId = req.user.id;
    if (!userId || !history_id) {
      return res.status(400).json({
        success: false,
        message: "User id or Temp sirket id not provided",
      });
    }

    const tempSirket = await TempSirketInfo.findOne({ _id: history_id })
      .populate({ path: "cards" })
      .populate({ path: "user_id", select: "name surname" });
    if (!tempSirket)
      return res
        .status(200)
        .json({ message: "Temp sirket not found", success: false });

    const user = await PeopleUser.findOne({ _id: userId });
    if (!user)
      return res
        .status(200)
        .json({ message: "User not found", success: false });

    const sirketId = user?.sirket_id || user?.muessise_id;
    const tempCompanyId = tempSirket.sirket_id || tempSirket.muessise_id;
    if (!tempCompanyId || String(sirketId) !== String(tempCompanyId)) {
      return res.status(404).json({
        success: false,
        message: "You do not have permission to access this record.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Temp sirket data send successfully",
      data: tempSirket,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export { muessiseInfo as sirketInfo, getMuessisePageInfo as getSirketPageInfo };
