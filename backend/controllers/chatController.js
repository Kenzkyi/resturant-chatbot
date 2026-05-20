const { handleMainMenu } = require("../handlers/mainMenu");
const { handleSelectingItems } = require("../handlers/selectingItems");
const { MAIN_MENU_TEXT } = require("../utils");
const { verifyTransaction } = require("../services/paystackService");

const handleChatMessage = async (req, res) => {
  const { message } = req.body;
  const session = req.userSession;
  const cleanMessage = message ? message.trim().toLowerCase() : "";

  if (!cleanMessage) {
    return res.status(400).json({ error: "Message cannot be empty" });
  }

  try {
    let responseText = "";

    switch (session.currentOption) {
      case "MAIN_MENU":
        responseText = await handleMainMenu(session, cleanMessage);
        break;
      case "SELECTING_ITEMS":
        responseText = await handleSelectingItems(session, cleanMessage);
        break;
      default:
        await session.update({ currentOption: "MAIN_MENU" });
        responseText = "Session reset. How can we help you today?\n\n" + MAIN_MENU_TEXT;
        break;
    }

    return res.status(200).json({ reply: responseText });
  } catch (error) {
    console.error("Chat controller error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const resetSession = async (req, res) => {
  try {
    await req.userSession.update({ currentOption: "MAIN_MENU" });
    return res.status(200).json({ message: "Session reset to main menu." });
  } catch (error) {
    console.error("Reset session error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const verifyPayment = async (req, res) => {
  const { reference } = req.params;
  const cleanReference = reference && typeof reference === "string" ? reference.trim() : "";

  if (!cleanReference) {
    return res.status(400).json({ error: "Invalid reference" });
  }

  try {
    const data = await verifyTransaction(cleanReference);
    if (data.status === "success") {
      return res.status(200).json({ message: "Payment verified successfully" });
    }
    return res.status(400).json({ error: "Payment verification failed" });
  } catch (error) {
    console.error("Payment verification error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { handleChatMessage, resetSession, verifyPayment };
