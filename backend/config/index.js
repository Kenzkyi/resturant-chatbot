require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    },
  },
);

sequelize
  .authenticate()
  .then(() => console.log("Database connection established."))
  .catch((err) => {
    console.error("Unable to connect to database:", err);
    process.exit(1);
  });

module.exports = sequelize;
