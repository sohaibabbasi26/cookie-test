'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create the 'videos' table
    await queryInterface.createTable('videos', {
      videoId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      categoryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      planId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 2,
        references: {
          model: 'plans',  // Ensure this references the 'plans' table
          key: 'planId',
        },
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      uri: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      duration: {
        type: Sequelize.STRING,
        defaultValue: '00:00',
      },
      thumbnail: {
        type: Sequelize.STRING,
        defaultValue: '',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop the 'videos' table if rolling back the migration
    await queryInterface.dropTable('videos');
  },
};
