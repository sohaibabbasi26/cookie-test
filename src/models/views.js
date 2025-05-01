const { DataTypes } = require('sequelize');
const { sequelize } = require('../configurations/sequelizeConfig');

const Views = sequelize.define('Views', {
  viewId: {
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
    allowNull: true, // Null for anonymous views
  },
  viewedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'views'
});

module.exports = Views;
