'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'dcmToken', {
      type: Sequelize.STRING,  // Use STRING or another type based on your requirements
      allowNull: true,         // Set to false if you want to make it required
      defaultValue: null,      // Optional: Set a default value if needed
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'dcmToken');
  }
};
