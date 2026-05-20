const RESTAURANT_MENU = require("../assets/menu");
const Order = require("../config/order");
const { MAIN_MENU_TEXT, ITEM_MENU_FOOTER } = require("../constants");
const { initializeTransaction } = require("../services/paystackService");

const buildMenuList = () => {
  let menuList = "🛒 **Our Menu Today:**\n\n";
  RESTAURANT_MENU.forEach((item) => {
    menuList += `Reply **${item.id}** for ${item.name} (₦${item.price})\n`;
  });
  menuList += "\nReply **97** to view cart, or **2** to return to Main Menu.";
  return menuList;
};

const buildCartSummary = (cartItems) => {
  let cartSummary = "📝 **Your Current Order:**\n\n";
  let grandTotal = 0;

  cartItems.forEach((item, index) => {
    const menuDetails = RESTAURANT_MENU.find((m) => m.id === item.itemId);
    if (menuDetails) {
      const itemTotal = menuDetails.price * item.quantity;
      grandTotal += itemTotal;
      cartSummary += `${index + 1}. **${menuDetails.name}**\n   Quantity: ${item.quantity} x ₦${menuDetails.price.toLocaleString()} = **₦${itemTotal.toLocaleString()}**\n\n`;
    }
  });

  cartSummary += `💳 **Total Amount: ₦${grandTotal.toLocaleString()}**\n`;
  cartSummary +=
    "\n👉 Reply with an **Item ID** to add more, **-Item ID** to reduce, **99** to checkout, **0** to cancel order, or **2** to return to Main Menu.";
  return cartSummary;
};

const buildOrderHistory = (pastOrders) => {
  if (pastOrders.length === 0) {
    return "📭 You haven't placed any paid orders yet! " + MAIN_MENU_TEXT;
  }

  let responseText = "📜 **Your Order History:**\n\n";

  pastOrders.forEach((order) => {
    const orderDate = new Date(order.createdAt).toLocaleDateString();
    responseText += `📅 **Order #${order.id}** - ${orderDate}\n`;
    responseText += `---------------------------\n`;

    order.items.forEach((item) => {
      const menuItem = RESTAURANT_MENU.find((m) => m.id === item.itemId);
      if (menuItem) {
        const itemTotal = menuItem.price * item.quantity;
        responseText += `• ${menuItem.name} x${item.quantity} (₦${itemTotal})\n`;
      }
    });

    responseText += `\n💵 **Total Paid:** ₦${order.totalAmount}\n`;
    responseText += `===========================\n\n`;
  });

  responseText += "Reply with *2* to return to the Main Menu.";
  return responseText;
};

const getOrCreateCart = async (deviceId) => {
  let cart = await Order.findOne({ where: { deviceId, status: "cart" } });
  if (!cart) cart = await Order.create({ deviceId });
  return cart;
};

const handleCheckout = async (activeCart, session) => {
  const amountInKobo = activeCart.totalAmount * 100;

  if (amountInKobo === 0) {
    return (
      "Your cart is empty. Please add items before checking out.\n\n" +
      MAIN_MENU_TEXT
    );
  }

  try {
    const { authorization_url } = await initializeTransaction({
      email: `${session.deviceId}@restaurantbot.com`,
      amount: amountInKobo,
      reference: `order_${activeCart.id}`,
      callbackUrl: process.env.FRONTEND_URL,
    });

    return `🎉 Your order total is **₦${activeCart.totalAmount.toLocaleString()}**.\n\n🔗 Please click the link below to complete your secure payment:\n${authorization_url}\n\n⏱️ Once paid, your order will automatically be processed!`;
  } catch (error) {
    console.error("Paystack transaction init error:", error);
    return (
      "⚠️ Sorry, there was an issue generating your payment link. Please try again in a moment using **99**.\n\n" +
      MAIN_MENU_TEXT
    );
  }
};

module.exports = {
  MAIN_MENU_TEXT,
  ITEM_MENU_FOOTER,
  buildMenuList,
  buildCartSummary,
  buildOrderHistory,
  getOrCreateCart,
  handleCheckout,
};
