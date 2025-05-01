const {sequelize} = require('../configurations/sequelizeConfig');

async function syncModels() {
  try {
    sequelize.sync({ force: false , alter: true }).then(() => {
      console.log("Database & tables created!");
    });
  } catch (err) {
    console.log("[SOME ERROR OCCURRED WHILE SYNCING THE MODELS]:", err);
    return;
  }
}   

module.exports = {
  syncModels,
};
