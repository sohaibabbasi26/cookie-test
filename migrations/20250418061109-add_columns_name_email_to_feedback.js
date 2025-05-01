'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('feedback', 'name', {
      type: Sequelize.STRING,
      allowNull: false, 
      defaultValue: '', 
    });

    await queryInterface.addColumn('feedback', 'email', {
      type: Sequelize.STRING,
      allowNull: false, 
      defaultValue: '', 
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('feedback', 'name');
    await queryInterface.removeColumn('feedback', 'email');
  },
};

