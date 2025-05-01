'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'fcmToken');

    await queryInterface.addColumn('users', 'fcmToken', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      defaultValue: [], 
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'fcmToken');
    
    await queryInterface.addColumn('Users', 'fcmToken', {
      type: Sequelize.STRING,
      defaultValue: null,
    });
  },
};
