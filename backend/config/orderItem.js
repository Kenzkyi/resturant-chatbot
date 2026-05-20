// models/OrderItem.js
const { DataTypes } = require("sequelize");
const sequelize = require(".");
const Order = require("./order");
const RESTAURANT_MENU = require("../assets/menu");

const updateOrderTotal = async (orderId) => {
  // 1. Find all items currently in this specific cart
  const cartItems = await OrderItem.findAll({ where: { orderId } });

  let grandTotal = 0;

  // 2. Loop through and calculate the total using our centralized menu prices
  cartItems.forEach((item) => {
    const menuItem = RESTAURANT_MENU.find((m) => m.id === item.itemId);
    if (menuItem) {
      grandTotal += menuItem.price * item.quantity;
    }
  });

  // 3. Update the parent Order table record in real time
  await Order.update({ totalAmount: grandTotal }, { where: { id: orderId } });
};

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "order_id",
    },
    itemId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "item_id",
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
    },
  },
  {
    tableName: "order_items",
    hooks: {
      afterSave: async (orderItem) => {
        // After any change to an OrderItem, recalculate the total for the parent Order
        await updateOrderTotal(orderItem.orderId);
      },
      afterDestroy: async (orderItem) => {
        // After an item is removed, also recalculate the total
        await updateOrderTotal(orderItem.orderId);
      },
    },
  },
);

Order.hasMany(OrderItem, { foreignKey: "orderId", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

module.exports = OrderItem;
