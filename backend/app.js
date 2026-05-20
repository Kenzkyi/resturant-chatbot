require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Order = require("./config/order");
const OrderItem = require("./config/orderItem");
const Session = require("./config/userSession");
const { handlePaystackWebhook } = require("./controllers/webhookController");
const apiRoutes = require("./routes/api");

const PORT = process.env.PORT || 3012;

const app = express();

app.use(cors({ origin: "*" }));

// Must be registered before express.json() so the raw Buffer is preserved for signature verification
app.post(
  "/webhooks/paystack",
  express.raw({ type: "application/json" }),
  handlePaystackWebhook,
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "API documentation is available at /api." });
});

app.use("/api", apiRoutes);

app.use((req, res) => res.status(404).json({ error: "Not found" }));

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

async function start() {
  await Order.sync({ alter: true });
  await OrderItem.sync({ alter: true });
  await Session.sync({ alter: true });
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
