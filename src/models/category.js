const { DataTypes } = require("sequelize");
const {sequelize} = require('../configurations/sequelizeConfig');

const Category = sequelize.define("Category", {
    categoryId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    banner: {
        type: DataTypes.STRING,
        allowNull: false
    },
    colors: {
        type: DataTypes.JSONB
    },
    tagline: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'categories'  
});

module.exports = Category;
