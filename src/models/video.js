const { DataTypes } = require('sequelize');
const {sequelize} = require('../configurations/sequelizeConfig');
const {Plan} = require('./associations');


const Video = sequelize.define('Video', {
    videoId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    level: {
        type: DataTypes.ENUM('basic', 'intermediate', 'advanced'),
        allowNull: false

    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    planId: {  // Add planId with default value 1
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 2,
        references: {
            model: Plan,
            key: 'planId'
        }
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    uri: {
        type: DataTypes.STRING,
        allowNull: false
    },
    duration: {
        type: DataTypes.STRING,
        defaultValue: "00:00"
    },
    thumbnail: {
        type: DataTypes.STRING,
        defaultValue: ""
    },
    views: {
        type: DataTypes.INTEGER,
       allowNull: false, 
       defaultValue: 0
     }
}, {
    tableName: 'videos' 
});

module.exports = Video; 
