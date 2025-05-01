const { DataTypes } = require('sequelize');
const { sequelize } = require('../configurations/sequelizeConfig');

const Plan = sequelize.define('Plan', {
  planId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, 
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.0, 
  },
  features: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  durationInDays: {
    type: DataTypes.INTEGER, 
    allowNull: true,
    defaultValue: 0
  }
}, {
  tableName: 'plans'
});

module.exports = Plan;
