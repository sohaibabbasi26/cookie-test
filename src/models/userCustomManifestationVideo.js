const { DataTypes } = require("sequelize");
const { sequelize } = require("../configurations/sequelizeConfig");

const CustomManifestationVideo = sequelize.define(
  "Video",
  {
    custom_manifestation_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: "users",
        key: "userId",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    thumbnail: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
  },
  {
    tableName: "custom_manifestation_videos",
  }
);

module.exports = CustomManifestationVideo;
