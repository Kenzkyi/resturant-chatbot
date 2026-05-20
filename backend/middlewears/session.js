const Session = require("../config/userSession");

const sessionMiddlewear = async (req, res, next) => {
  try {
    const deviceId = req.headers["x-device-id"];

    if (!deviceId) {
      return res.status(400).json({ error: "Device ID is required" });
    }

    const [session] = await Session.findOrCreate({
      where: { deviceId },
      defaults: { currentOption: "MAIN_MENU" },
    });
    req.userSession = session;
    next();
  } catch (error) {
    console.error("Error in session middleware:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { sessionMiddlewear };
