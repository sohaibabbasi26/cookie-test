const { DataTypes } = require('sequelize');
const { sequelize } = require('../configurations/sequelizeConfig');

const Likes = sequelize.define('Likes', {
  likeId: {
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
}, {
  tableName: 'likes'
});

module.exports = Likes;
