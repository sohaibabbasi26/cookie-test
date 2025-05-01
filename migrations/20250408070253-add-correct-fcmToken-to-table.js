'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'fcmToken');

    await queryInterface.addColumn('users', 'fcmToken', {
      type: Sequelize.JSONB, 
      defaultValue: Sequelize.literal("'{}'"), 
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('users', 'fcmToken', {
      type: Sequelize.STRING,
      defaultValue: null, 
    });
  },
};

