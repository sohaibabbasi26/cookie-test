const { DataTypes } = require("sequelize");
const { sequelize } = require("../configurations/sequelizeConfig");

const Feedback = sequelize.define(
  "Feedback",
  {
    feedbackId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // name: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    // },
    // email: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    // },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    details: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "feedback",
  }
);

module.exports = Feedback;
