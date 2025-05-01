'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Step 1: Add the column as nullable
    await queryInterface.addColumn('Reminders', 'title', {
      type: Sequelize.STRING,
      allowNull: true, // Initially, allow null values
    });

    // Step 2: Update existing rows with a default value
    await queryInterface.sequelize.query(`
      UPDATE "Reminders" SET "title" = 'Default Title' WHERE "title" IS NULL;
    `);

    // Step 3: Change the column to NOT NULL
    await queryInterface.changeColumn('Reminders', 'title', {
      type: Sequelize.STRING,
      allowNull: false, // Make it non-nullable
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Optionally, you can add the down migration to remove the column if needed
    await queryInterface.removeColumn('Reminders', 'title');
  }
};
