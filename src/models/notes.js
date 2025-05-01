const { DataTypes } = require('sequelize');
const {sequelize} = require('../configurations/sequelizeConfig');

const Notes = sequelize.define('Notes', {
    notesId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
        references: {
            model: 'users',  
            key: 'userId',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description : {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    tableName: 'notes'  
});

module.exports = Notes;
