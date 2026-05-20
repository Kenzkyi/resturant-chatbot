const Order = require("../config/order");
const OrderItem = require("../config/orderItem");
const {
  MAIN_MENU_TEXT,
  buildMenuList,
  buildCartSummary,
  buildOrderHistory,
  getOrCreateCart,
  handleCheckout,
} = require("../utils");

const handleMainMenu = async (session, cleanMessage) => {
  const activeCart = await getOrCreateCart(session.deviceId);

  switch (cleanMessage) {
    case "1":
      await session.update({ currentOption: "SELECTING_ITEMS" });
      return buildMenuList();

    case "97": {
      const cartItems = await OrderItem.findAll({ where: { orderId: activeCart.id } });
      if (cartItems.length === 0) {
        return "Your current cart is empty. 🛒\n\n" + MAIN_MENU_TEXT;
      }
      await session.update({ currentOption: "SELECTING_ITEMS" });
      return buildCartSummary(cartItems);
    }

    case "0":
      await activeCart.update({ status: "cancelled" });
      return "Order cancelled. How can we help you today?\n\n" + MAIN_MENU_TEXT;

    case "2":
      await session.update({ currentOption: "MAIN_MENU" });
      return "Returned to Main Menu.\n\n" + MAIN_MENU_TEXT;

    case "99":
      return handleCheckout(activeCart, session);

    case "98": {
      const pastOrders = await Order.findAll({
        where: { deviceId: session.deviceId, status: "paid" },
        include: [{ model: OrderItem, as: "items" }],
        order: [["createdAt", "DESC"]],
      });
      return buildOrderHistory(pastOrders);
    }

    default:
      return (
        `⚠️ Invalid option "${cleanMessage}". Please choose a number from the list:\n\n` +
        MAIN_MENU_TEXT
      );
  }
};

module.exports = { handleMainMenu };
