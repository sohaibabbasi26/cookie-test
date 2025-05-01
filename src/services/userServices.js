const { where, Op, Sequelize } = require("sequelize");
const {
  Video,
  Likes,
  Saves,
  Category,
  sequelize,
  Plan,
  User,
  Views,
  Reminders,
  Notification,
  Feedback,
} = require("../models/associations");
const Notes = require("../models/notes");
const CustomManifestationVideo = require("../models/userCustomManifestationVideo");
const bcrypt = require("bcrypt");
const { uploadImage } = require("../helpers/uploadImage");
const { messaging } = require("../configurations/firebaseConfig");
const { duration } = require("moment-timezone");
const moment = require("moment");

// const { sequelize } = require("../configurations/sequelizeConfig");

const getUserInfoService = async (userId) => {
  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return {
        status: 404,
        message: "Couldn't find the user.",
        data: null,
      };
    }

    return {
      status: 200,
      message: "Successfully fetched the user.",
      data: user,
    };
  } catch (err) {
    return {
      status: 500,
      message: "Some problem occured while fetching user info.",
      data: null,
    };
  }
};

const getAllCategoriesServices = async () => {
  try {
    const categories = await Category.findAll();

    if (categories.length === 0) {
      return {
        status: 404,
        message: "Couldn't find categories.",
        data: null,
      };
    }

    return {
      status: 200,
      message: "Successfully fetched all the categories.",
      data: categories,
    };
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message: "Some problem occured while fetching user info.",
      data: null,
    };
  }
};

// const getPopularVideosService = async (limit, offset, userId) => {
//   try {
//     const query = `
//       SELECT
//         "Video"."videoId",
//         "Video"."title",
//         "Video"."categoryId",
//         "Video"."planId",
//         "Video"."description",
//         "Video"."uri",
//         "Video"."duration",
//         "Video"."thumbnail",
//         "Video"."createdAt",
//         "Video"."updatedAt",
//         "Category"."title" AS "categoryName",
//         "Plan"."title" AS "plan",
//         COUNT("likes"."likeId") AS "totalLikes",
//         COUNT("views"."viewId") AS "totalViews",
//         COUNT("saves"."saveId") AS "totalSaves",
//         -- Calculate the insight value
//         (COUNT("likes"."likeId") + COUNT("views"."viewId") + COUNT("saves"."saveId")) AS "insightValue",
//         -- Check if liked, viewed, or saved
//         (CASE WHEN COUNT("likes"."likeId") > 0 THEN TRUE ELSE FALSE END) AS "isLiked",
//         (CASE WHEN COUNT("views"."viewId") > 0 THEN TRUE ELSE FALSE END) AS "isViewed",
//         (CASE WHEN COUNT("saves"."saveId") > 0 THEN TRUE ELSE FALSE END) AS "isSaved"
//       FROM "videos" AS "Video"
//       LEFT JOIN "plans" AS "Plan" ON "Video"."planId" = "Plan"."planId"
//       LEFT JOIN "categories" AS "Category" ON "Video"."categoryId" = "Category"."categoryId"
//       LEFT JOIN "likes" AS "likes" ON "Video"."videoId" = "likes"."videoId" AND "likes"."userId" = :userId
//       LEFT JOIN "views" AS "views" ON "Video"."videoId" = "views"."videoId" AND "views"."userId" = :userId
//       LEFT JOIN "saves" AS "saves" ON "Video"."videoId" = "saves"."videoId" AND "saves"."userId" = :userId
//       GROUP BY "Video"."videoId", "Category"."title", "Plan"."title"
//       ORDER BY "insightValue" DESC
//       LIMIT :limit OFFSET :offset;
//     `;

//     // Run the query

//     const [results, metadata] = await sequelize.query(query, {
//       replacements: {
//         userId: userId,
//         limit: limit,
//         offset: offset
//       },
//       type: sequelize.QueryTypes.SELECT,
//     });

//     console.log("[VIDEOS FETCHED]:", results);
//     // console.log("[META DATA]:",metadata);

//     const processedVideos = results?.map((video) => {
//       const totalLikes = video.likes.length;
//       const totalViews = video.views.length;
//       const totalSaves = video.Saves.length;

//       const isLiked = video.likes.length > 0;
//       const isViewed = video.views.length > 0;
//       const isSaved = video.Saves.length > 0;

//       const insightValue = totalLikes + totalViews + totalSaves;

//       return {
//         videoId: video.videoId,
//         title: video.title,
//         categoryId: video.categoryId,
//         categoryName: video?.category?.title,
//         uri: video.uri,
//         thumbnail: video.thumbnail,
//         description: video?.description,
//         duration: video?.duration,
//         plan: video?.Plan?.title,
//         totalLikes,
//         totalViews,
//         totalSaves,
//         insightValue,
//         category: video?.category?.title,
//         createdAt: video.createdAt,
//         isLiked,
//         isViewed,
//         isSaved,
//       };
//     });

//     console.log("[PROCESSED VIDEOS]:", processedVideos);

//     const sortedVideos = processedVideos.sort(
//       (a, b) => b.insightValue - a.insightValue
//     );

//     console.log("[SORTED VIDEOS]:", sortedVideos);

//     const totalNoOfVideos = await Video.count();
//     const totalPages = Math.ceil(totalNoOfVideos / limit);
//     const currFetchedNoOfVid = sortedVideos?.length;

//     return {
//       status: 200,
//       message: "Successfully fetched the popular videos.",
//       data: sortedVideos,
//       pagination: {
//         totalVideos: totalNoOfVideos,
//         totalPages,
//         currentPage: Math.ceil(offset / limit) + 1,
//         numberOfVideosInRequest: currFetchedNoOfVid
//       }
//     };
//   } catch (err) {
//     console.log("[ERR]:", err);
//     return {
//       status: 500,
//       message: "Some problem occurred while getting popular videos.",
//       data: null,
//     };
//   }
// };

const getPopularVideosService = async (limit = 5, offset = 0, userId) => {
  try {
    // SQL Query with proper pagination
    const query = `
SELECT 
    "Video"."videoId", 
    "Video"."title", 
    "Video"."categoryId", 
    "Video"."planId", 
    "Video"."description", 
    "Video"."uri", 
    "Video"."duration", 
    "Video"."thumbnail", 
    "Video"."createdAt", 
    "Video"."updatedAt",
    "Video"."level",
    "Video"."views" AS "totalViews", -- Reference views as a column from the "Video" table
    "Category"."title" AS "categoryName", 
    "Plan"."title" AS "plan",
    COUNT("likes"."likeId") AS "totalLikes", 
    COUNT("saves"."saveId") AS "totalSaves",
    -- Calculate the insight value
    (COUNT("likes"."likeId") + "Video"."views" + COUNT("saves"."saveId")) AS "insightValue",
    -- Check if liked, viewed, or saved by user (with userId)
    (CASE WHEN COUNT(CASE WHEN "likes"."userId" = :userId THEN 1 END) > 0 THEN TRUE ELSE FALSE END) AS "isLiked",
    (CASE WHEN COUNT(CASE WHEN "views"."userId" = :userId THEN 1 END) > 0 THEN TRUE ELSE FALSE END) AS "isViewed",
    (CASE WHEN COUNT(CASE WHEN "saves"."userId" = :userId THEN 1 END) > 0 THEN TRUE ELSE FALSE END) AS "isSaved"
FROM "videos" AS "Video"
LEFT JOIN "plans" AS "Plan" ON "Video"."planId" = "Plan"."planId"
LEFT JOIN "categories" AS "Category" ON "Video"."categoryId" = "Category"."categoryId"
LEFT JOIN "likes" AS "likes" ON "Video"."videoId" = "likes"."videoId"
LEFT JOIN "saves" AS "saves" ON "Video"."videoId" = "saves"."videoId"
LEFT JOIN "views" AS "views" ON "Video"."videoId" = "views"."videoId"
GROUP BY "Video"."videoId", "Category"."title", "Plan"."title"
ORDER BY "insightValue" DESC
LIMIT :limit OFFSET :offset;

    `;

    console.log("[QUERY]:", query);

    console.log("[OFFSET]:", offset, "[LIMIT]:", limit);

    const results = await sequelize.query(query, {
      replacements: {
        userId: userId,
        limit: limit,
        offset: offset,
      },
      type: sequelize.QueryTypes.SELECT,
    });

    const totalVideos = await sequelize.query(`SELECT COUNT(*) FROM "videos"`, {
      type: sequelize.QueryTypes.SELECT,
    });
    const totalNoOfVideos = totalVideos[0].count;
    const totalPages = Math.ceil(totalNoOfVideos / limit);

    const parsedResults = results?.map((video) => {
      return {
        ...video,
        totalLikes: parseInt(video.totalLikes),
        totalSaves: parseInt(video.totalSaves),
        totalVideos: parseInt(video.totalVideos),
        totalViews: parseInt(video.totalViews),
        insightValue: parseInt(video.insightValue),
      };
    });

    return {
      status: 200,
      message: "Successfully fetched the popular videos.",
      data: parsedResults,
      pagination: {
        totalVideos: parseInt(totalNoOfVideos),
        totalPages,
        currentPage: Math.ceil(offset / limit) + 1,
        numberOfVideosInRequest: results.length,
      },
    };
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message: "An error occurred while fetching popular videos.",
      data: null,
    };
  }
};

const saveVideoService = async (videoId, userId) => {
  try {
    console.log("[Video id]:", videoId);

    const checkVideoExists = await Video.findByPk(videoId);

    if (!checkVideoExists) {
      return {
        status: 404,
        message: "The video is either removed or doesn't exist.",
        data: checkVideoExists,
      };
    }

    const checkIfAlreadySaved = await Saves.findOne({
      where: {
        videoId,
        userId,
      },
    });

    if (checkIfAlreadySaved) {
      const deleteLikeQuery = await Saves.destroy({
        where: {
          saveId: checkIfAlreadySaved?.saveId,
        },
      });

      return {
        status: 200,
        message: "Successfully unsaved a video.",
        result: deleteLikeQuery,
      };
    }

    const saveVideoEntry = await Saves.create({
      videoId: videoId,
      userId: userId,
    });

    return {
      status: 200,
      message: "Successfully saved a video.",
      result: saveVideoEntry,
    };
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message: "There was a problem while saving a video",
      result: null,
    };
  }
};

const likeVideoService = async (videoId, userId) => {
  console.log("[Video id]:", videoId);
  try {
    const checkVideoExists = await Video.findByPk(videoId);

    if (!checkVideoExists) {
      return {
        status: 404,
        message: "The video is either removed or doesn't exist.",
        data: checkVideoExists,
        liked: false,
      };
    }

    const checkIfUserExists = await User.findOne({
      where: {
        userId: userId,
      },
    });

    if (!checkIfUserExists) {
      return {
        status: 404,
        message: "Couldn't find the user.",
        data: null,
        liked: false,
      };
    }

    const checkIfAlreadyLiked = await Likes.findOne({
      where: {
        videoId,
        userId,
      },
    });

    if (checkIfAlreadyLiked) {
      const deleteLikeQuery = await Likes.destroy({
        where: {
          likeId: checkIfAlreadyLiked?.likeId,
        },
      });

      return {
        status: 200,
        message: "Successfully unliked a video.",
        result: deleteLikeQuery,
        liked: false,
      };
    }

    const saveVideoEntry = await Likes.create({
      videoId: videoId,
      userId: userId,
    });

    return {
      status: 200,
      message: "Successfully liked a video.",
      result: saveVideoEntry,
      liked: true,
    };
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message: "There was a problem while liking a video",
      result: null,
      liked: false,
    };
  }
};

const incrementViewService = async (videoId) => {
  try {
    const fetchedVideo = await Video.findByPk(videoId);
    if (!fetchedVideo) {
      return {
        status: 404,
        message: "Couldn't find the video anymore.",
        result: null,
      };
    }

    console.log("[VIEWS BEFORE UPDATING]:", fetchedVideo);

    const newViewCount = parseInt(fetchedVideo?.views) + 1;

    console.log("[VIEWS TO BE UPDATED]:", newViewCount);

    const queryToUpdateViews = await Video.update(
      { views: newViewCount },
      {
        where: {
          videoId: videoId,
        },
      }
    );

    console.log("[UPDATED]:", queryToUpdateViews);

    return {
      status: 200,
      message: "Successfully updated the views count of the video.",
      result: queryToUpdateViews,
    };
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message: "There was a problem while adding a view.",
      result: null,
    };
  }
};

const getSavedVideosService = async (userId) => {
  try {
    const fetchSavedVideosQuery = await Saves.findAll({
      where: {
        userId: userId,
      },
      include: {
        model: Video,
        as: "video",
        include: {
          model: Category,
          as: "category",
          attributes: ["categoryId", "title", "banner", "colors", "tagline"], 
        },
      },
    });

    const flattenedResult = fetchSavedVideosQuery?.map((result) => {
      return {
        saveId: result?.saveId,
        videoId: result?.videoId,
        userId: result?.userId,
        savedAt: result?.createdAt,
        videoId: result?.video?.videoId,
        title: result?.video?.title,
        videoStatus: result?.video?.videoStatus,
        description: result?.video?.description,
        videoUri: result?.video?.uri,
        level: result?.video?.level,
        categoryId: result?.video?.category?.categoryId,
        categoryTitle: result?.video?.category?.title,
        banner: result?.video?.category?.banner,
        colors: result?.video?.category?.colors,
        tagline: result?.video?.category?.tagline,
      };
    });

    return {
      status: 200,
      message: "Successfully fetched all the saved videos.",
      data: flattenedResult,
    };
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message: "Problem occurred while fetching the saved videos.",
      data: null,
    };
  }
};

const getLikedVideosService = async (userId) => {
  try {
    const fetchSavedVideosQuery = await Likes.findAll({
      where: {
        userId: userId,
      },
      include: {
        model: Video,
        as: "video",
        include: {
          model: Category,
          as: "category",
          attributes: ["categoryId", "title", "banner", "colors", "tagline"],
        },
      },
    });

    const flattenedResult = fetchSavedVideosQuery?.map((result) => {
      return {
        likeId: result?.likeId,
        videoId: result?.videoId,
        userId: result?.userId,
        likedAt: result?.createdAt,
        videoId: result?.video?.videoId,
        title: result?.video?.title,
        videoStatus: result?.video?.videoStatus,
        description: result?.video?.description,
        videoUri: result?.video?.uri,
        level: result?.video?.level,
        views: result?.video?.views,
        categoryId: result?.video?.category?.categoryId,
        categoryTitle: result?.video?.category?.title,
        banner: result?.video?.category?.banner,
        colors: result?.video?.category?.colors,
        tagline: result?.video?.category?.tagline,
      };
    });

    return {
      status: 200,
      message: "Successfully fetched all the liked videos.",
      data: flattenedResult,
    };
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message: "Problem occured while fetching the liked videos.",
      data: null,
    };
  }
};

const getCustomManifestationVideoService = async (userId) => {
  try {
    const queryCustomManifestationVideo =
      await CustomManifestationVideo.findOne({
        where: {
          userId: userId,
        },
      });

    if (!queryCustomManifestationVideo) {
      return {
        status: 404,
        message: "You haven't been assigned a custom manifestation video yet.",
        data: null,
      };
    }

    return {
      status: 200,
      message: "Successfully fetched the custom manifestation video.",
      data: queryCustomManifestationVideo,
    };
  } catch (err) {
    return {
      status: 500,
      message: "Couldn't get custom manifestation video for the user.",
      data: null,
    };
  }
};

const createNoteService = async (title, description, userId) => {
  try {
    const result = await Notes.create({
      userId,
      description,
      title,
    });

    return {
      status: 200,
      message: "Successfully created a note",
      data: result,
    };
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message: "Couldn't create a note.",
      data: null,
    };
  }
};

const editNoteService = async (body) => {
  try {
    const check = await Notes.findOne({
      notesId: body?.notesId,
    });

    if (!check) {
      return {
        status: 404,
        message: "The note has either been removed or doesn't exist.",
        data: null,
      };
    }

    let updateData = {};

    if (body?.title) updateData.title = body.title;
    if (body?.description) updateData.description = body.description;

    const queryResult = await Notes.update(updateData, {
      where: {
        notesId: body?.notesId,
      },
    });

    console.log("[RESULT]:", queryResult);

    return {
      status: 200,
      message: "Successfully edited your notes.",
      result: queryResult,
    };
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message: "Couldn't update a note.",
      data: null,
    };
  }
};

const deleteNoteService = async (notesId, userId) => {
  try {
    const check = await Notes.findOne({
      notesId: notesId,
    });

    if (!check) {
      return {
        status: 404,
        message: "The note has either been removed already or doesn't exist.",
        data: null,
      };
    }

    const queryResult = await Notes.destroy({
      where: {
        notesId: notesId,
      },
    });

    return {
      status: 200,
      message: "Successfully deleted your note.",
      data: queryResult,
    };
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message: "Couldn't deleted a note.",
      data: null,
    };
  }
};

const searchNoteService = async (search) => {
  try {
    const check = await Notes.findOne({
      where: whereClause,
    });

    if (!check) {
      return {
        status: 404,
        message: "The note has either been removed already or doesn't exist.",
        data: null,
      };
    }

    return {
      status: 200,
      message: "Successfully deleted your note.",
      data: queryResult,
    };
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message: "Couldn't deleted a note.",
      data: null,
    };
  }
};

const getAllNotesServices = async (userId, search) => {
  try {
    let whereClause = {
      userId: userId, // Ensure we always filter by userId
    };

    if (search) {
      whereClause[Op.or] = [
        {
          title: {
            [Op.iLike]: `%${search}%`,
          },
        },
        {
          description: {
            [Op.iLike]: `%${search}%`,
          },
        },
      ];
    }

    const queryNotes = await Notes.findAll({
      where: whereClause,
    });

    return {
      status: 200,
      message: "Successfully fetched all the notes.",
      data: queryNotes,
    };
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message: "Couldn't fetch the notes",
      data: null,
    };
  }
};

const updateUserPlanService = async (userId, planId) => {
  try {
    const checkIfAlreadyPlanUpdated = await User.findByPk(userId);

    if (checkIfAlreadyPlanUpdated?.planId === planId) {
      return {
        status: 409,
        message: "You have already subscribed to this plan.",
        data: null,
      };
    }

    const queryPlanUpdate = await User.update(
      {
        planId: planId,
      },
      {
        where: {
          userId: userId,
        },
      }
    );

    return {
      status: 200,
      message: "Successfully updated the your subscription plan.",
      data: queryPlanUpdate,
    };
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message: "Couldn't update the user plan.",
      data: null,
    };
  }
};

const changePasswordService = async (password, newPassword, userId) => {
  console.log({ password, newPassword });
  try {
    const checkIfUserExists = await User.findByPk(userId);
    if (!checkIfUserExists) {
      return {
        status: 404,
        message: "User doesn't exist.",
        result: null,
      };
    }

    if (
      checkIfUserExists?.provider === "Apple" &&
      checkIfUserExists?.provider === "Google"
    ) {
      return {
        status: 409,
        message: "Can't change passwords for SSO authenticated users.",
        result: null,
      };
    }
    console.log({ password, oldPass: checkIfUserExists?.password });
    const checkIfOldPasswordsMatch = await bcrypt.compare(
      password,
      checkIfUserExists?.password
    );

    console.log("[PASSWORDS MATCH???]:", checkIfOldPasswordsMatch);

    if (!checkIfOldPasswordsMatch) {
      return {
        status: 403,
        message: "You have entered a wrong current password.",
        result: null,
      };
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const queryToUpdatePassword = await User.update(
      {
        password: hashedNewPassword,
      },
      {
        where: {
          userId: userId,
        },
      }
    );

    const notificationCreationQuery = await Notification.create({
      userId: checkIfUserExists?.userId,
      title: "Password Updated",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus mollis, libero sed fermentum bibendum.",
      type: "new",
    });

    console.log("[NOTIFICATION CREATED FOR USER]:", notificationCreationQuery);

    return {
      status: 200,
      message: "Successfully changed password.",
      result: queryToUpdatePassword,
    };
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message: "Couldn't update the password",
      result: null,
    };
  }
};

const deleteAccountService = async (userId) => {
  try {
    const checkIfUserExist = await User.findByPk(userId);

    if (!checkIfUserExist) {
      return {
        status: 404,
        message: "Your account has already been removed or doesn't exists.",
        result: null,
      };
    }

    const queryForDelete = await User.destroy({
      where: {
        userId: userId,
      },
    });
    return {
      status: 200,
      message: "The user has been deleted successfully.",
      result: queryForDelete,
    };
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message: "Couldn't delete the acoount",
      result: null,
    };
  }
};

const userUpdateInfoService = async (userId, body, imageFile) => {
  try {
    const checkIfUserExists = await User.findByPk(userId);

    if (!checkIfUserExists) {
      return {
        status: 404,
        message: "Couldn't find the user you want to update.",
        result: null,
      };
    }

    const dataToBeUpdated = {};

    if (imageFile) {
      console.log("[IMAGE FILE IN IF CONDITION]:", imageFile);

      const resultOfUploadedImageToCloudinary = await uploadImage(
        imageFile,
        `${checkIfUserExists?.name}'s profile picture.`
      );

      dataToBeUpdated.profile_picture = resultOfUploadedImageToCloudinary?.url;
    }

    if (body?.name) dataToBeUpdated.name = body?.name;
    if (body?.dob) dataToBeUpdated.dob = body?.dob;
    if (typeof body?.notificationEnability !== "undefined") {
      console.log(
        "[Updating notificationEnability]",
        body?.notificationEnability
      );
      dataToBeUpdated.notificationEnability = body?.notificationEnability;
    }

    console.log("[data to be updated in the db]:", dataToBeUpdated);

    const queryToUpdate = await User.update(dataToBeUpdated, {
      where: {
        userId: userId,
      },
    });

    return {
      status: 200,
      message: "Successfully updated your account's information.",
      result: queryToUpdate,
    };
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message: "Failed to update your account's information.",
      result: null,
    };
  }
};

const getVideosByCategoryService = async (
  categoryId,
  userId,
  filter = "recent",
  search,
  page = 1,
  limit = 10
) => {
  try {
    const offset = (page - 1) * limit;
    const categoryExists = await Category.findByPk(categoryId);
    if (!categoryExists) {
      return {
        status: 404,
        message: "Category wasn't found.",
        data: null,
      };
    }

    let whereClause = {
      categoryId: categoryId,
    };

    if (search) {
      whereClause[Op.or] = [
        {
          title: {
            [Op.iLike]: `%${search}%`,
          },
        },
        {
          "$category.title$": {
            [Op.iLike]: `%${search}%`,
          },
        },
      ];
    }

    let orderClause = [["createdAt", "DESC"]];

    switch (filter) {
      case "recent":
        orderClause = [["createdAt", "DESC"]];
        break;

      case "popular":
        const topVideosQuery = `
SELECT 
    v."videoId", 
    v."title", 
    v."categoryId", 
    v."thumbnail",  
    v."description", 
    v."uri",
    v."duration", 
    v."createdAt",
    v."level",
    v."views" AS "totalViews",
    cat."title" AS "categoryName",
    plan."title" AS "planTitle",  -- Plan title nested here
    plan."price" AS "planPrice",  -- Plan price nested here
    COUNT(l."likeId") AS "totalLikes", 
    COUNT(s."saveId") AS "totalSaves"
FROM "videos" v
LEFT JOIN "likes" l ON v."videoId" = l."videoId"
LEFT JOIN "views" view ON v."videoId" = view."videoId"
LEFT JOIN "saves" s ON v."videoId" = s."videoId"
LEFT JOIN "categories" cat ON v."categoryId" = cat."categoryId"
LEFT JOIN "plans" plan ON v."planId" = plan."planId"
WHERE v."categoryId" = :categoryId
GROUP BY v."videoId", cat."title", plan."title", plan."price"
ORDER BY "totalLikes" DESC, "totalViews" DESC, "totalSaves" DESC
LIMIT :limit OFFSET :offset;

`;

        const topVideos = await sequelize.query(topVideosQuery, {
          replacements: {
            categoryId: categoryId,
            limit: limit,
            offset: offset,
          },
          type: sequelize.QueryTypes.SELECT,
        });

        const formattedTopVideos = topVideos.map((video) => {
          return {
            ...video,
            totalLikes: parseInt(video.totalLikes) || 0,
            totalSaves: parseInt(video.totalSaves) || 0,
            totalViews: parseInt(video.totalViews) || 0,
            plan: {
              title: video.planTitle,
              price: video.planPrice,
            },
          };
        });

        console.log("[TOP VIDEOS]:", formattedTopVideos);

        if (topVideos?.length > 0) {
          return {
            status: 200,
            message:
              "Successfully fetched all the videos relevant to the category.",
            data: formattedTopVideos,
          };
        } else {
          return {
            status: 404,
            message: "This category doesn't have any videos yet.",
            data: null,
          };
        }

        break;

      case "saved":
        const savedVideoIds = await Saves.findAll({
          where: { userId: userId },
          attributes: ["videoId"],
          raw: true,
        });

        const savedVideoIdsList = savedVideoIds.map((entry) => entry.videoId);
        whereClause.videoId = {
          [Op.in]: savedVideoIdsList,
        };
        break;

      case "liked":
        const likedVideoIds = await Likes.findAll({
          where: { userId: userId },
          attributes: ["videoId"],
          raw: true,
        });

        const likedVideoIdsList = likedVideoIds.map((entry) => entry.videoId);
        whereClause.videoId = {
          [Op.in]: likedVideoIdsList,
        };
        break;

      default:
        orderClause = [["createdAt", "DESC"]];
    }

    console.log("[WHERE CLAUSE]:", whereClause);
    console.log("[ORDER CLAUSE]:", orderClause);

    const result = await Video.findAll({
      where: whereClause,
      attributes: {
        include: [
          [sequelize.fn("COUNT", sequelize.col("likes.likeId")), "likeCount"],
          [sequelize.fn("COUNT", sequelize.col("Saves.saveId")), "saveCount"],
          // [sequelize.fn("COUNT", sequelize.col("views.viewId")), "viewCount"],
        ],
      },
      include: [
        {
          model: Likes,
          as: "likes",
          attributes: [],
          required: false,
        },
        {
          model: Saves,
          // as: "saves",
          attributes: [],
          required: false,
        },
        {
          model: Category,
          as: "category",
        },
        // {
        //   model: Views,
        //   as: "views",
        //   attributes: [],
        //   required: false,
        // },
        {
          model: Plan,
        },
      ],
      group: ["Video.videoId", "category.categoryId", "Plan.planId"],
      order: orderClause,
      // offset: offset,
      // limit: 10
    });

    // console.log("[plan]:", vi);

    // Reforming the response
    const transformedResult = result.map((video) => {
      console.log("[VIDEO]:", video?.Plan);
      return {
        videoId: video.videoId,
        title: video.title,
        categoryName: video?.category?.title,
        categoryId: video.categoryId,
        status: video.status,
        thumbnail: video?.thumbnail,
        duration: video?.duration,
        description: video.description,
        uri: video.uri,
        createdAt: video.createdAt,
        updatedAt: video.updatedAt,
        plan: video?.Plan,
        level: video?.level,
        totalLikes: parseInt(video.dataValues.likeCount) || 0,
        totalSaves: parseInt(video.dataValues.saveCount) || 0,
        totalViews: parseInt(video.views) || 0,
      };
    });

    if (transformedResult?.length > 0) {
      return {
        status: 200,
        message:
          "Successfully fetched all the videos relevant to the category.",
        data: transformedResult,
      };
    } else {
      return {
        status: 404,
        message: "This category doesn't have any videos yet.",
        data: null,
      };
    }
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message: "Some problem has occurred.",
      data: null,
    };
  }
};

const createRemindersService = async (userId, body) => {
  try {
    const checkIfReminderExists = await Reminders.findOne({
      where: {
        userId: userId,
      },
    });

    console.log("[REMINDERS]:", checkIfReminderExists);

    if (checkIfReminderExists) {
      return {
        status: 409,
        message:
          "Reminder already exists, you can customize the existing reminder.",
        result: null,
      };
    }

    const queryToCreateReminder = await Reminders.create({
      ...body,
      userId: userId,
    });
    return {
      status: 200,
      message: "Successfully created a reminder.",
      result: queryToCreateReminder,
    };
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message: "Some problem occured while creating a reminder.",
      result: null,
    };
  }
};

const getRemindersService = async (userId) => {
  try {
    const result = await Reminders.findAll({
      where: {
        userId: userId,
      },
    });

    return {
      status: 200,
      message: "Successfully fetched all the reminders.",
      data: result,
    };
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message: "Problem occured while fetching the reminders.",
      data: null,
    };
  }
};


const customizeReminderService = async (userId, body) => {
  try {
    console.log("body:", body);

    if (!body?.time || body?.time.trim() === "") {
      return {
        status: 400,
        message: "Time is required and cannot be empty.",
        result: null,
      };
    }

    if (body?.specificDate) {
      const [year, month, day] = body.specificDate.split("-");

      if (!day || !month || !year) {
        return {
          status: 400,
          message:
            "Invalid date format. Please ensure it's in 'YYYY-MM-DD' format.",
          result: null,
        };
      }

      const dateString = `${year}-${month.padStart(2, "0")}-${day.padStart(
        2,
        "0"
      )}`;
      const formattedDate = moment
        .utc(dateString, "DD-MM-YYYY HH:mm:ss")
        .toISOString();

      const postgreDate = `${dateString} 00:00:00+00`;

      const checkIfReminderExists = await Reminders.findOne({
        where: { userId: userId },
      });

      console.log("[POSTGRE DATE]:", postgreDate);

      if (!checkIfReminderExists) {
        const queryToCreateReminder = await Reminders.create({
          ...body,
          userId: userId,
          specificDate: postgreDate,
          repeatType: "specific_date",
        });

        return {
          status: 200,
          message: "Successfully created a reminder with specific date.",
          result: queryToCreateReminder,
        };
      } else {
        const updateReminder = await Reminders.update(
          {
            ...body,
          },
          {
            where: {
              reminderId: checkIfReminderExists?.reminderId,
            },
          }
        );

        return {
          status: 200,
          message: "Successfully created a reminder with specific date.",
          result: updateReminder,
        };
      }
    } else {
      if (!body.repeatDays || body.repeatDays.length === 0) {
        return {
          status: 400,
          message: "Repeat days must be provided when no specific date is set.",
          result: null,
        };
      }

      const queryToCustomizeReminder = await Reminders.update(
        { ...body, repeatType: "weekly" },
        { where: { userId: userId } }
      );

      return {
        status: 200,
        message: "Successfully updated your weekly reminder.",
        result: queryToCustomizeReminder,
        navigateToCreate: false,
      };
    }
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message: "Problem occurred while customizing the reminders.",
      result: null,
      navigateToCreate: false,
    };
  }
};

const deleteReminderService = async (userId) => {
  try {
    const checkIfReminderExists = await Reminders.findOne({
      where: {
        userId: userId,
      },
    });

    if (!checkIfReminderExists) {
      return {
        status: 404,
        message: "Your reminder is either already deleted, or doesn't exist.",
        result: null,
      };
    }

    const queryToDeleteReminder = await Reminders.destroy({
      where: {
        userId: userId,
      },
    });

    return {
      status: 200,
      message: "Successfully deleted your reminder.",
      result: queryToDeleteReminder,
    };
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message: "Problem occured while deleting the reminders.",
      result: null,
    };
  }
};

const getAllNotificationsService = async (userId) => {
  try {
    const checkIfNotificationsExist = await Notification.findAll({
      where: {
        userId: userId,
      },
    });

    if (checkIfNotificationsExist?.length === 0) {
      return {
        status: 404,
        message: "There are no notifications yet.",
        data: [],
      };
    }

    return {
      status: 200,
      message: "Successfully fetched all the notifications.",
      data: checkIfNotificationsExist,
    };
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message: "Some problem occured while getting notifications.",
      data: null,
    };
  }
};

const submitFeedbackServices = async (userId, body) => {
  try {
    const result = await Feedback.create({ ...body, userId });
    return {
      status: 200,
      message: "Successfully submitted a feedback",
      result: result,
    };
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message: "Couldn't submit a feedback.",
      result: null,
    };
  }
};

const getVideosByPopularityService = async () => {
  try {
    const topVideosQuery = `
      SELECT 
        v."videoId", 
        v."title", 
        v."categoryId", 
        v."status", 
        v."description", 
        v."uri", 
        COUNT(l."likeId") AS "totalLikes", 
        COUNT(view."viewId") AS "totalViews", 
        COUNT(s."saveId") AS "totalSaves"
      FROM "videos" v
      LEFT JOIN "likes" l ON v."videoId" = l."videoId"
      LEFT JOIN "views" view ON v."videoId" = view."videoId"
      LEFT JOIN "saves" s ON v."videoId" = s."videoId"
      GROUP BY v."videoId"
      ORDER BY "totalLikes" DESC, "totalViews" DESC, "totalSaves" DESC
      LIMIT 10;
    `;

    const topVideos = await sequelize.query(topVideosQuery, {
      type: sequelize.QueryTypes.SELECT,
    });

    console.log("[TOP VIDEOS]:", topVideos);
    return {
      status: 200,
      message: "Successfully fetched the popular videos.",
      data: topVideos,
    };
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message: "Couldn't fetch the popular videos.",
      data: null,
    };
  }
};

const getUserSavedLikedVideosService = async (userId, filter) => {
  try {
    if (filter === "likes") {
      const likedVideos = await Video.findAll({
        include: [
          {
            model: Likes,
            as: "likes",
            where: { userId },
            required: true,
          },
          {
            model: Category,
            as: "category",
            attributes: ["title"],
          },
        ],
      });

      const flattenedLikedVideos = likedVideos.map((video) => ({
        // ...video,
        videoId: video.videoId,
        title: video.title,
        categoryId: video.categoryId,
        categoryName: video.category?.title,
        description: video.description,
        uri: video.uri,
        level: video.level,
        totalViews: video.views,
        duration: video.duration,
        thumbnail: video.thumbnail,
        createdAt: video.createdAt,
        updatedAt: video.updatedAt,
        isLiked: true,
        isSaved: false,
      }));

      return {
        status: 200,
        message: "Successfully fetched user's liked videos",
        data: {
          likedVideos: flattenedLikedVideos,
        },
      };
    }

    if (filter === "saves") {
      const savedVideos = await Video.findAll({
        include: [
          {
            model: Saves,
            where: { userId },
            required: true,
          },
          {
            model: Category,
            as: "category",
            attributes: ["title"],
          },
        ],
      });

      const flattenedSavedVideos = savedVideos.map((video) => ({
        // ...video,
        videoId: video.videoId,
        title: video.title,
        categoryId: video.categoryId,
        categoryName: video.category?.title,
        description: video.description,
        uri: video.uri,
        level: video.level,
        totalViews: video.views,
        duration: video.duration,
        thumbnail: video.thumbnail,
        createdAt: video.createdAt,
        updatedAt: video.updatedAt,
        isLiked: false,
        isSaved: true,
      }));

      return {
        status: 200,
        message: "Successfully fetched user's saved videos",
        data: {
          savedVideos: flattenedSavedVideos,
        },
      };
    }
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message: "Failed to fetch liked videos",
      data: null,
    };
  }
};

module.exports = {
  getPopularVideosService,
  saveVideoService,
  likeVideoService,
  getSavedVideosService,
  getLikedVideosService,
  getCustomManifestationVideoService,
  createNoteService,
  getAllNotesServices,
  editNoteService,
  deleteNoteService,
  updateUserPlanService,
  changePasswordService,
  deleteAccountService,
  userUpdateInfoService,
  getVideosByCategoryService,
  createRemindersService,
  getRemindersService,
  customizeReminderService,
  deleteReminderService,
  getAllNotificationsService,
  submitFeedbackServices,
  getVideosByPopularityService,
  getUserInfoService,
  getAllCategoriesServices,
  getUserSavedLikedVideosService,
  searchNoteService,
  incrementViewService,
};
