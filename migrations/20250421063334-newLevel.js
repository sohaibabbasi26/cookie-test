'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('videos', 'level', {
       type: Sequelize.ENUM('basic', 'intermediate', 'advanced'),
      allowNull: false, 
      defaultValue: "basic"
    });

   
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('videos', 'level');
  },
};