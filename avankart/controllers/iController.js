import { ObjectId } from "mongodb";
import AdminUser from "../../shared/models/adminUsersModel.js"
import AdminSession from "../../shared/models/adminSessionModel.js";

export const renderSettingsPage = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await AdminUser.findById(userId);
    if(!user && user.length === 0 ) {
      return res.status(401).json({
        message: "USer not found",
        success: false
      })
    }

    return res.render("../../avankart/views/pages/settings", {
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
    const user = await AdminUser.findById(userId);
    const sessionCount = await AdminSession.countDocuments({user_id: userId});

    return res.render("pages/activeSessions", {
      activeLang: req.getLocale(),
      csrfToken: req.csrfToken(),
      user,
      sessionCount
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
};

export const render2FAPage = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await AdminUser.findById(userId);

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
    const query = {user_id: userId}
    const {
      search,
      start_date,
      end_date
    } = req.body;

    if(search[0] || search[0].trim() !== "" ) {
      query.$or = [
        { device_name: { $regex: search[0], $options: "i" }},
        {location: { $regex: search[0], $options: "i" }}
      ]
    }

    console.log(end_date,"date baxiriq")
    if(start_date && end_date) {
      query.last_login_date = {
        $gte: new Date(start_date),
        $lte: new Date(end_date)
      }
    } else if( start_date) {
       query.last_login_date = {
        $gte: new Date(start_date)
      }
    } else if(end_date) {
       query.last_login_date = {
        $lte: new Date(end_date)
      }
    }


    const sessions = await AdminSession.find(query).sort({
      last_login_date: -1,
    });

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

    return res.status(200).json({ data });
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
    const sessionToDelete = await AdminSession.findById(id);

    if (!sessionToDelete) {
      return res
        .status(404)
        .json({
          success: false,
          error: res.__("errors.iController.session_not_found"),
        });
    }

    if (
      !req.user ||
      sessionToDelete.user_id.toString() !== req.user.id.toString()
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message: res.__("messages.iController.access_denied"),
        });
    }
    await AdminSession.findByIdAndDelete(id);

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
    return res
      .status(500)
      .json({
        success: false,
        message: res.__("messages.iController.internal_server_error"),
      });
  }
};
