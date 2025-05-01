module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE "videos"
      DROP CONSTRAINT IF EXISTS "videos_category_id_fk", -- Drop existing constraint if it exists
      ADD CONSTRAINT "videos_category_id_fk" FOREIGN KEY ("categoryId")
      REFERENCES "categories"("categoryId")
      ON DELETE CASCADE;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "likes"
      DROP CONSTRAINT IF EXISTS "likes_video_id_fk", -- Drop existing constraint if it exists
      ADD CONSTRAINT "likes_video_id_fk" FOREIGN KEY ("videoId")
      REFERENCES "videos"("videoId")
      ON DELETE CASCADE;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "views"
      DROP CONSTRAINT IF EXISTS "views_video_id_fk", -- Drop existing constraint if it exists
      ADD CONSTRAINT "views_video_id_fk" FOREIGN KEY ("videoId")
      REFERENCES "videos"("videoId")
      ON DELETE CASCADE;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "saves"
      DROP CONSTRAINT IF EXISTS "saves_video_id_fk", -- Drop existing constraint if it exists
      ADD CONSTRAINT "saves_video_id_fk" FOREIGN KEY ("videoId")
      REFERENCES "videos"("videoId")
      ON DELETE CASCADE;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE "videos"
      DROP CONSTRAINT IF EXISTS "videos_category_id_fk";
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "likes"
      DROP CONSTRAINT IF EXISTS "likes_video_id_fk";
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "views"
      DROP CONSTRAINT IF EXISTS "views_video_id_fk";
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "saves"
      DROP CONSTRAINT IF EXISTS "saves_video_id_fk";
    `);
  },
};
