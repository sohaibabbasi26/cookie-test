const { DataTypes } = require("sequelize");
const { sequelize } = require("../configurations/sequelizeConfig");
const User = require("../models/user");

const Reminder = sequelize.define("Reminder", {
  reminderId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "userId",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  },
  time: {
    type: DataTypes.TIME,
    allowNull: false,
  },

  repeatDays: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  specificDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  repeatType: {
    type: DataTypes.ENUM("daily", "weekly", "specific_date", ""),
    allowNull: false,
    defaultValue: "weekly",
  },
});

module.exports = Reminder;
