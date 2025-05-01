const { DataTypes } = require("sequelize");
const { sequelize } = require("../configurations/sequelizeConfig");
const User = require("../models/user");

const NotificationSchema = sequelize.define("Notifications",{
    notificationId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User, 
            key: 'userId'
        }
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    type: {
        type: DataTypes.ENUM('new', 'announcement', 'reminder', 'update'),
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    tableName: 'Notifications',
    timestamps: true
});


module.exports = NotificationSchema