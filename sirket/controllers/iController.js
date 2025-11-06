import Session from "../../shared/model/people/peopleSessionModel.js";
import PeopleUser from "../../shared/models/peopleUserModel.js";
import { ObjectId } from "mongodb";

export const renderSettingsPage = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await PeopleUser.findById(userId);

    return res.render("../../sirket/views/pages/settings", {
      activeLang: req.getLocale(),
      csrfToken: req.csrfToken(),
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
};

export const renderSessionsPage = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await PeopleUser.findById(userId);

    return res.render("../../sirket/views/pages/activeSessions", {
      activeLang: req.getLocale(),
      csrfToken: req.csrfToken(),
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
};

export const render2FAPage = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await PeopleUser.findById(userId);

    return res.render("../../sirket/views/pages/2FASettings", {
      activeLang: req.getLocale(),
      csrfToken: req.csrfToken(),
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
};

export const activeSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { customSearch, start_date, end_date, status } = req.body;

    // Debug log
    console.log("Active sessions search params:", {
      customSearch,
      start_date,
      end_date,
      status,
    });

    // Build query object
    let query = { user_id: userId };

    // Add search filter if provided
    if (customSearch && customSearch.trim()) {
      query.$or = [
        { device_name: { $regex: customSearch, $options: "i" } },
        { device_os: { $regex: customSearch, $options: "i" } },
        { location: { $regex: customSearch, $options: "i" } },
      ];
    }

    // Add date filters if provided
    if (start_date || end_date) {
      query.last_login_date = {};
      if (start_date) {
        query.last_login_date.$gte = new Date(start_date);
      }
      if (end_date) {
        query.last_login_date.$lte = new Date(end_date);
      }
    }

    // Get total count first (without search filters)
    const totalCount = await Session.countDocuments({ user_id: userId });

    // Get filtered sessions
    const sessions = await Session.find(query).sort({
      last_login_date: -1,
    }); //last login date coming first (desc order)

    const data = sessions.map((session) => ({
      id: session._id,
      name: `${session.device_name}, ${session.device_os}`,
      date: new Date(session.last_login_date).toLocaleString("az-AZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      location: session.location,
    }));

    // Debug log
    console.log("Returning sessions:", {
      totalCount,
      filteredCount: data.length,
      hasSearch: !!customSearch,
    });

    return res.status(200).json({
      data,
      recordsTotal: totalCount,
      recordsFiltered: data.length,
    });
  } catch (error) {
    console.error("activeSessions error:", error);
    return res
      .status(500)
      .json({ error: res.__("error.iController.internal_server_error") });
  }
};

export const endSession = async (req, res) => {
  try {
    const { sessionId } = req.body; //session id
    const id = new ObjectId(sessionId);
    const sessionToDelete = await Session.findById(id);

    if (!sessionToDelete) {
      return res.status(404).json({
        success: false,
        error: res.__("errors.iController.session_not_found"),
      });
    }

    if (
      !req.user ||
      sessionToDelete.user_id.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: res.__("messages.iController.access_denied"),
      });
    }
    await Session.findByIdAndDelete(id);

    if (
      req.session &&
      req.session.id &&
      req.session.id.toString() &&
      req.sessionID === id.toString()
    ) {
      return res.json({
        success: true,
        message: res.__("messages.iController.session_deleted"),
        redirect: "/auth/login",
      });
    }
    return res.json({
      success: true,
      message: res.__("messages.iController.session_deleted"),
      redirect: "/settings/active-sessions",
    });
  } catch (error) {
    console.error("End Session Error", error);
    return res.status(500).json({
      success: false,
      message: res.__("messages.iController.internal_server_error"),
    });
  }
};
