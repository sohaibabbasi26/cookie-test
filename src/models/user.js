const { DataTypes } = require('sequelize');
const { sequelize } = require('../configurations/sequelizeConfig');
const Plan = require("./plans");

const User = sequelize.define('User', {
  userId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dob: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  otp: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  provider: { 
    type: DataTypes.ENUM("Google", "Apple", "Manual"),
    defaultValue: "Manual"
  },
  user_type: {
    type: DataTypes.ENUM("User", "Admin"),
    defaultValue: "User",
    allowNull: true
  },
  planId: {
    type: DataTypes.INTEGER,  
    references: {
      model: Plan,  
      key: 'planId'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'  
  },
  liked_videos: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  saved_videos: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  subscribed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  notificationEnability: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  profile_picture: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  timezone: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Asia/Karachi'  
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '' 
  },
  fcmToken: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  }
}, {
  tableName: 'users'
});

User.belongsTo(Plan, { foreignKey: 'planId', as: 'plan' });

module.exports = User;
