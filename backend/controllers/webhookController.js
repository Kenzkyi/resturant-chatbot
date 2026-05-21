const crypto = require("crypto");
const Order = require("../config/order");
const Session = require("../config/userSession");

const handlePaystackWebhook = async (req, res) => {
  const signature = req.headers["x-paystack-signature"];
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(req.body)
    .digest("hex");

  if (hash !== signature) {
    console.warn("Invalid Paystack webhook signature.");
    return res.status(400).send("Invalid signature");
  }

  try {
    const { event, data } = JSON.parse(req.body);
    console.log(event, data);

    if (event === "charge.success") {
      const orderId = data.reference.replace("order_", "");
      const order = await Order.findByPk(orderId);

      if (!order) {
        return res.sendStatus(200);
      }

      await order.update({ status: "paid" });

      const session = await Session.findOne({
        where: { deviceId: order.deviceId },
      });
      if (session) {
        await session.update({ currentOption: "MAIN_MENU" });
      }
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.sendStatus(500);
  }
};

module.exports = { handlePaystackWebhook };
