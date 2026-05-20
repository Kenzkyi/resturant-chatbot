// models/Order.js
const { DataTypes } = require("sequelize");
const sequelize = require(".");

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    deviceId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "device_id",
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "cart", // 🛒 Can be 'cart', 'paid', or 'cancelled'
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
      field: "total_amount",
    },
  },
  {
    tableName: "orders",
  },
);

module.exports = Order;
