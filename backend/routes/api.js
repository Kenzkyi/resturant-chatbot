const path = require("path");
const fs = require("fs");
const { Router } = require("express");
const { sessionMiddleware } = require("../middlewares/session");
const {
  handleChatMessage,
  resetSession,
  verifyPayment,
} = require("../controllers/chatController");

const README_PATH = path.join(__dirname, "../README.md");

const router = Router();

router.get("/", (_req, res) => {
  try {
    const readme = fs.readFileSync(README_PATH, "utf-8");
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.send(readme);
  } catch {
    res.status(500).json({ error: "Could not load documentation." });
  }
});
router.get("/verify-payment/:reference", verifyPayment);
router.post("/chat", sessionMiddleware, handleChatMessage);
router.get("/reset", sessionMiddleware, resetSession);

module.exports = router;
