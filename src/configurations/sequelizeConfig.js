const sequelizeCreds = require("../environments/sequelizeEnvironments");

const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  sequelizeCreds.development.database,
  sequelizeCreds.development.username,
  sequelizeCreds.development.password,
  {
    host: sequelizeCreds.development.host,
    port: sequelizeCreds.development.port,
    dialect: "postgres",
    logging: false,
  }
);

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

module.exports = {sequelize};
