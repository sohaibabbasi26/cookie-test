const Video = require("../models/video");
const Category = require("../models/category");
const Plan = require("../models/plans");
const User = require("../models/user");
const Likes = require("../models/likes");
const Saves = require("../models/saves");
const Views = require("../models/views");
const Reminders = require("../models/reminders");
const Notification = require("../models/notifications");
const { sequelize } = require('../configurations/sequelizeConfig');
const Feedback = require("./feedback");
const UserCustomManifestationVideo = require("./userCustomManifestationVideo");

Category.hasMany(Video, {
  foreignKey: "categoryId",
  onDelete: "CASCADE",
});

User.hasMany(UserCustomManifestationVideo, { foreignKey: 'userId', as: 'customManifestationVideos' });
UserCustomManifestationVideo.belongsTo(User, { foreignKey: 'userId', as: 'user' });



Video.belongsTo(Category, {
  foreignKey: "categoryId",
  as: "category"
});


Plan.hasMany(User, {
  foreignKey: "planId",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

User.belongsTo(Plan, {
  foreignKey: "planId",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

User.hasMany(Likes, {
  foreignKey: "userId",
  as: "likes",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

User.hasMany(Feedback, {
  foreignKey: "userId",
  as: "feedback",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});


User.hasMany(Saves, {
  foreignKey: "userId",
  as: "saves",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Video.hasMany(Likes, {
  foreignKey: "videoId",
  as: "likes",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Video.hasMany(Saves, {
  foreignKey: "videoId",

  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Saves.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Saves.belongsTo(Video, {
  foreignKey: "videoId",
  as: "video",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Feedback.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Likes.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Likes.belongsTo(Video, {
  foreignKey: "videoId",
  as: "video",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Views.belongsTo(User, {
//   foreignKey: "userId",
//   as: "user",
//   onDelete: "CASCADE",
//   onUpdate: "CASCADE",
// });


// Views.belongsTo(Video, {
//   foreignKey: "videoId",
//   as: "video",
//   onDelete: "CASCADE",
//   onUpdate: "CASCADE",
// });    



// Video.hasMany(Views, {
//   foreignKey: "videoId",
//   as: "views",
//   onDelete: "CASCADE",
//   onUpdate: "CASCADE",
// });

User.hasMany(Reminders, {
  foreignKey: 'userId',
  as: 'reminders',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});


Reminders.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});


Notification.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Video.belongsTo(Plan, { foreignKey: 'planId' });
Plan.hasMany(Video, { foreignKey: 'planId' });

module.exports = { sequelize, Category, Video, User, Plan, Likes, Saves, Views, Reminders, Notification, Feedback, UserCustomManifestationVideo};
