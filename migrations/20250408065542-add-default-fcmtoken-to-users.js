'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      `ALTER TABLE "users" ALTER COLUMN "fcmToken" SET DEFAULT '{}';`
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      `ALTER TABLE "users" ALTER COLUMN "fcmToken" DROP DEFAULT;`
    );
  },
};

