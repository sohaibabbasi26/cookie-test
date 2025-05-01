'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE "users" 
      ALTER COLUMN "fcmToken" TYPE JSONB 
      USING "fcmToken"::jsonb;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback to the previous type, assuming it was TEXT or VARCHAR
    await queryInterface.sequelize.query(`
      ALTER TABLE "users" 
      ALTER COLUMN "fcmToken" TYPE TEXT 
      USING "fcmToken"::TEXT;
    `); 
  }
};

