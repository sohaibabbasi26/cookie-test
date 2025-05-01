const { DataTypes } = require("sequelize");
const { sequelize } = require("../configurations/sequelizeConfig");
        
const Saves = sequelize.define(
  "Saves",
  {
    saveId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    videoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
  },
  {
    tableName: "saves",
  }
);

module.exports = Saves;
