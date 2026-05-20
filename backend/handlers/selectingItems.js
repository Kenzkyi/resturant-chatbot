const RESTAURANT_MENU = require("../assets/menu");
const OrderItem = require("../config/orderItem");
const {
  MAIN_MENU_TEXT,
  ITEM_MENU_FOOTER,
  buildCartSummary,
  getOrCreateCart,
  handleCheckout,
} = require("../utils");

const handleSelectingItems = async (session, cleanMessage) => {
  const activeCart = await getOrCreateCart(session.deviceId);

  switch (cleanMessage) {
    case "0":
      await activeCart.update({ status: "cancelled" });
      await session.update({ currentOption: "MAIN_MENU" });
      return "Order cancelled. How can we help you today?\n\n" + MAIN_MENU_TEXT;

    case "2":
      await session.update({ currentOption: "MAIN_MENU" });
      return "Returned to Main Menu.\n\n" + MAIN_MENU_TEXT;

    case "97": {
      const cartItems = await OrderItem.findAll({ where: { orderId: activeCart.id } });
      if (cartItems.length === 0) {
        return "Your current cart is empty. 🛒\n\n" + ITEM_MENU_FOOTER;
      }
      return buildCartSummary(cartItems);
    }

    case "99":
      return handleCheckout(activeCart, session);

    default:
      if (cleanMessage.startsWith("-")) {
        return handleRemoveItem(activeCart, cleanMessage.slice(1));
      }
      return handleAddItem(activeCart, cleanMessage);
  }
};

const handleRemoveItem = async (activeCart, itemId) => {
  const orderItem = await OrderItem.findOne({
    where: { orderId: activeCart.id, itemId },
  });

  if (!orderItem) {
    return `Item ${itemId} is not in your cart.` + ITEM_MENU_FOOTER;
  }

  if (orderItem.quantity > 1) {
    orderItem.quantity -= 1;
    await orderItem.save();
    return `Decreased quantity of item ${itemId} in your cart.` + ITEM_MENU_FOOTER;
  }

  await orderItem.destroy();
  return `Removed item ${itemId} from your cart.` + ITEM_MENU_FOOTER;
};

const handleAddItem = async (activeCart, itemId) => {
  const menuItem = RESTAURANT_MENU.find((item) => item.id === itemId);

  if (!menuItem) {
    return `Item ${itemId} is not on the menu.` + ITEM_MENU_FOOTER;
  }

  const existing = await OrderItem.findOne({
    where: { orderId: activeCart.id, itemId: menuItem.id },
  });

  if (existing) {
    existing.quantity += 1;
    await existing.save();
    return `Increased quantity of item ${menuItem.id} in your cart.` + ITEM_MENU_FOOTER;
  }

  await OrderItem.create({ orderId: activeCart.id, itemId: menuItem.id, quantity: 1 });
  return `Added item ${menuItem.id} to your cart.` + ITEM_MENU_FOOTER;
};

module.exports = { handleSelectingItems };
