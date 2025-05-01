'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('videos', 'views', {
       type: Sequelize.INTEGER,
      allowNull: false, 
      defaultValue: 0
    });

   
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('videos', 'views');
  },
};