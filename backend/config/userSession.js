const { DataTypes } = require("sequelize");
const sequelize = require(".");

const Session = sequelize.define(
  "session",
  {
    deviceId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      primaryKey: true,
      field: "device_id",
    },
    currentOption: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "MAIN_MENU",
      field: "current_option",
    },
  },
  {
    tableName: "sessions",
  },
);

module.exports = Session;
