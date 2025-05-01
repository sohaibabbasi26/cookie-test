// const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  Video,
  Category,
  User,
  Plan,
  Notification,
  Feedback,
  Likes,
  Views,
  Saves,
  UserCustomManifestationVideo,
} = require("../models/associations");
const { uploadImage } = require("../helpers/uploadImage");
const { uploadVideo } = require("../helpers/uploadVideo");
const { where } = require("sequelize");
const { Op, Sequelize, QueryTypes } = require("sequelize");
const { sequelize } = require("../configurations/sequelizeConfig");
const e = require("express");
const CustomManifestationVideo = require("../models/userCustomManifestationVideo");
const { get } = require("../routes/adminRoutes");

// Adjust path if needed
// Sequelize?.q;

const signupService = async (body) => {
  try {
    const check = await User.findOne({
      where: {
        email: body?.email,
        user_type: "Admin",
      },
    });

    console.log("[CHECK]:", check);

    if (!check) {
      const hashedPassword = await bcrypt.hash(body.password, 10);
      const result = await User.create({
        ...body,
        password: hashedPassword,
        user_type: "Admin",
      });
      if (result) {
        return {
          status: 200,
          message: "Successfully signed up.",
        };
      } else {
        console.log("[RESULT]:", result);
        return {
          status: 500,
          message: "A problem occurred while signing-up.",
        };
      }
    } else {
      return {
        status: 409,
        message: "User with these credentials already exist",
      };
    }
  } catch (err) {
    console.log("[ERROR IN HANDLER]:", err);
    return {
      status: 500,
      message: "A problem occurred while signing-up.",
    };
  }
};

const loginService = async (body) => {
  try {
    const check = await User.findOne({
      where: {
        email: body?.email,
        user_type: "Admin",
      },
    });
    console.log("[CHECK]:", check);

    if (check) {
      const passwordMatch = await bcrypt.compare(
        body?.password,
        check?.password
      );
      console.log("[PASSWORDS MATCHED]:", passwordMatch);
      if (!passwordMatch) {
        return {
          status: 401,
          message: "Invalid Password",
          token: null,
        };
      } else if (passwordMatch) {
        const token = jwt.sign(
          {
            name: check?.name,
            user_dob: check?.dob,
            email: check?.email,
            user_type: check?.user_type,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "1d",
          }
        );

        const refreshToken = jwt.sign(
          {
            email: check?.email,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "15d",
          }
        );

        return {
          status: 200,
          message: "Successfully logged in.",
          token: token,
          refreshToken: refreshToken,
        };
      }
    } else {
      return {
        status: 404,
        message: "Account with these credentials doesn't exist",
        token: null,
      };
    }
  } catch (err) {
    console.log("[ERROR IN HANDLER]:", err);
    return {
      status: 500,
      message: "A problem occurred while logging in.",
      token: null,
    };
  }
};

const getOverAllInsightsService = async (page, limit) => {
  try {
    const users = await User.count({
      where: {
        user_type: "User",
      },
    });
    console.log("[USERS COUNT]:", users);

    const videos = await Video.count();

    console.log("[VIDEOS COUNT]:", videos);

    const likes = await Likes.count();

    console.log("[LIKES]:", likes);

    return {
      status: 200,
      message: "Successfully fetched the insights.",
      insights: {
        totalVideos: videos,
        totalLikes: likes,
        totalUsers: users,
      },
    };
  } catch (err) {
    console.log("[ERR]:", err);
    return {
      status: 500,
      message: "There was a problem fetching the overall insights",
      insights: null,
    };
  }
};

const getAllVideosServices = async (page = 1, limit = 5) => {
  try {
    const offset = (page - 1) * limit;

    console.log("[limit]:", limit);
    const videos = await Video.findAll({
      include: [
        {
          model: Plan,
        },
        {
          model: Likes,
          as: "likes",
        },
        {
          model: Category,
          as: "category",
        },
        // {
        //   model: Views,
        //   as: "views",
        // },
        {
          model: Saves,
          // as: "saves",
        },
      ],
      order: [["createdAt", "DESC"]], // or order by updatedAt if you want edited videos to come first

      offset: offset,
      limit: limit,
    });

    console.log("[result]:", videos);

    const flattenedVideos = videos.map((video) => {
      console.log("[PLAN IDS]:", video);
      return {
        videoId: video?.videoId,
        title: video?.title,
        categoryId: video?.categoryId,
        category: video?.category?.title,
        planId: video?.Plan?.planId,
        planTitle: video?.Plan?.title,
        description: video?.description,
        uri: video?.uri,
        createdAt: video?.createdAt,
        updatedAt: video?.updatedAt,
        countOfLikes: video?.likes?.length,
        countOfViews: video?.views,
        countOfSaves: video?.Saves?.length,
        duration: video?.duration,
        thumbnail: video?.thumbnail,
        level: video?.level
      };
    });

    if (videos?.length === 0) {
      return {
        status: 404,
        message: "You don't have any videos recorded yet.",
        videos: null,
      };
    }

    const totalVideos = await Video.count();
    const totalPages = Math.ceil(totalVideos / limit);
    const intPage = parseInt(page);
    return {
      status: 200,
      message: "Successfully fetched the videos",
      videos: flattenedVideos,
      pagination: {
        currentPage: intPage,
        totalPages,
        totalVideos,
      },
    };
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message: "There was a problem fetching the all videos",
      videos: null,
    };
  }
};

function formatDuration(duration) {
  // Calculate total seconds
  const totalSeconds = Math.floor(duration);

  // Calculate hours, minutes, and seconds
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // If the duration is less than an hour, return mm:ss
  if (hours === 0) {
    return `${padZero(minutes)}:${padZero(seconds)}`;
  }

  // Otherwise, return hh:mm:ss
  return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
}

// Helper function to pad single digits with leading zero
function padZero(value) {
  return value < 10 ? `0${value}` : `${value}`;
}

// Example usage

const uploadVideoService = async (body, videoFile, image) => {
  try {
    const categoryExists = await Category.findByPk(body.categoryId);

    if (categoryExists) {
      console.log("[video file]:", videoFile);
      const sanitizedTitle = body.title.trim();
      const uploadToCloudinaryResult = await uploadVideo(
        videoFile.path,
        sanitizedTitle
      );

      console.log("[upload result to cloudinary]:", uploadToCloudinaryResult);

      const duration = formatDuration(uploadToCloudinaryResult?.duration);

      const thumbnailUpload = await uploadImage(image, sanitizedTitle);

      if (uploadToCloudinaryResult) {
        const result = await Video.create({
          ...body,
          uri: uploadToCloudinaryResult?.url,
          thumbnail: thumbnailUpload?.url,
          duration: duration,
        });
        return {
          status: 200,
          message: "Successfully uploaded the video.",
          results: result,
        };
      }
    } else {
      return {
        status: 404,
        message: "Couldn't find the category to upload the video.",
        results: null,
      };
    }
  } catch (err) {
    console.log("[ERROR WHILE UPLOADING VIDEO]:", err);
    return {
      status: 500,
      message: "Some problem occurred while uploading a video.",
      results: null,
    };
  }
};

const createCategoryService = async (body, imageFile) => {
  console.log("[add category data to be created]:", body);

  try {
    const check = await Category.findOne({
      where: {
        title: body?.title,
      },
    });

    if (check) {
      return {
        status: 409,
        message: "Category already exists.",
        results: null,
      };
    } else {
      const resultOfCloudinary = await uploadImage(imageFile, body?.title);
      // console.log("[RESULT OF CLOUDINARY]:", resultOfCloudinary);

      const parsedColors =
        typeof body.colors === "string" ? JSON.parse(body.colors) : body.colors;

      const createCategory = await Category.create({
        ...body,
        banner: resultOfCloudinary?.url,
        colors: parsedColors,
      });
      return {
        status: 200,
        message: "Successfully created a category",
        results: createCategory,
      };
    }
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message: "Some problem occured while creating a category",
      results: null,
    };
  }
};

const getAllCategoriesService = async (page = 1, limit = 3) => {
  try {
    const offset = (page - 1) * limit;
    const result = await Category.findAll({
      include: {
        model: Video,
        include: [
          {
            model: Likes,
            as: "likes",
          },
          {
            model: Views,
            as: "views",
          },
        ],
      },
      order: [["createdAt", "ASC"]],
      offset: offset,
      limit: limit,
    });

    if (result.length > 0) {
      console.log("[RESULT]", result);

      const flattenedResponse = result?.map((category) => {
        const countOfVideos = category?.Videos?.length;
        const countOfLikes = category?.Videos?.reduce(
          (acc, video) => acc + video.likes.length,
          0
        );
        const countOfViews = category?.Videos?.reduce(
          (acc, video) => acc + video.views.length,
          0
        );

        console.log("[countOfVideos]:", countOfVideos);
        console.log("[countOfLikes]:", countOfLikes);
        console.log("[countOfViews]:", countOfViews);
        return {
          categoryId: category?.categoryId,
          title: category?.title,
          banner: category?.banner,
          colors: category?.colors,
          tagline: category?.tagline,
          createdAt: category?.createdAt,
          updatedAt: category?.updatedAt,
          countOfViews,
          countOfLikes,
          countOfVideos,
        };
      });

      const totalCategories = await Category.count();
      const totalPages = Math.ceil(totalCategories / limit);
      const intPage = parseInt(page);

      return {
        status: 200,
        message: "Successfully fetched all the categories",
        data: flattenedResponse,
        pagination: {
          currentPage: intPage,
          totalPages,
          totalCategories,
        },
      };
    } else {
      return {
        status: 404,
        message: "There are no categories created yet.",
        data: null,
      };
    }
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message: "Some problem has occured.",
      data: null,
    };
  }
};

const updateVideoService = async (updateFields, videoId) => {
  try {
    console.log("update fields", updateFields);
    const check = await Video.findByPk(videoId);
    if (check) {
      const result = await Video.update(updateFields, {
        where: {
          videoId: videoId,
        },
      });

      console.log("[UPDATED THE VIDEO DETAILS]:", result);
      return {
        status: 200,
        message: "Successfully updated the video details",
      };
    } else {
      return {
        status: 404,
        message: "The video to be updated wasn't found.",
      };
    }
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message: "Some problem has occured.",
    };
  }
};

const deleteVideoService = async (videoId) => {
  try {
    const check = await Video.findByPk(videoId);
    if (check) {
      const result = await Video.destroy({
        where: {
          videoId: videoId,
        },
      });

      console.log("[DELETD THE VIDEO RESULT]:", result);
      return {
        status: 200,
        message: "Successfully deleted the video.",
      };
    } else {
      return {
        status: 404,
        message: "The video to be deleted wasn't found.",
      };
    }
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message: "Some problem has occured.",
    };
  }
};

// const getVideosByCategoryService = async (categoryId, page = 1, limit = 5) => {
//   console.log("[data in category]:", page, limit);
//   try {
//     const offset = (page - 1) * limit;
//     const categoryExists = await Category.findByPk(categoryId);
//     if (categoryExists) {
//       const result = await Video.findAll({
//         where: {
//           categoryId: categoryId,
//         },
//         include: [
//           {
//             model: Likes,
//             as: "likes",
//           },
//           {
//             model: Category,
//             as: "category",
//           },
//           {
//             model: Views,
//             as: "views",
//           },
//           {
//             model: Saves,
//           },
//           {
//             model: Plan,
//           },
//         ],
//         offset: offset,
//         limit: limit,
//       });

//       if (result?.length > 0) {
//         let CategoryTitle;

//         const flattenedResponse = result.map((video) => {
//           console.log("[VIDEO]:", video);
//           const countOfLikes = video.likes.length;
//           const countOfSaves = video.Saves.length;
//           const countOfViews = video.views.length;
//           CategoryTitle = video?.category?.title;

//           return {
//             // categoryTitle:
//             ...video.toJSON(),
//             categoryTitle: video?.category?.title,
//             countOfLikes: countOfLikes,
//             countOfSaves: countOfSaves,
//             countOfViews: countOfViews,
//             planId: video?.Plan.planId,
//             planTitle: video?.Plan?.title,
//           };
//         });

//         const totalVideos = await Video.count();
//         const totalPages = Math.ceil(totalVideos / limit);
//         const intPage = parseInt(page);

//         return {
//           status: 200,
//           message:
//             "Successfully fetched all the videos relevant to the category.",
//           data: flattenedResponse,
//           categoryTitle: CategoryTitle,
//           pagination: {
//             currentPage: intPage,
//             totalPages,
//             totalVideos,
//           },
//         };
//       } else if (result?.length === 0) {
//         return {
//           status: 404,
//           message: "This category doesn't have any videos yet.",
//           data: null,
//         };
//       }
//     } else {
//       return {
//         status: 404,
//         message: "Category wasn't found.",
//         data: null,
//       };
//     }
//   } catch (err) {
//     console.log("[ERROR]:", err);
//     return {
//       status: 500,
//       message: "Some problem has occured.",
//       data: null,
//     };
//   }
// };
const getVideosByCategoryService = async (categoryId, page = 1, limit = 5) => {
  console.log("[data in category]:", page, limit);
  try {
    const offset = (page - 1) * limit;
    const categoryExists = await Category.findByPk(categoryId);
    if (categoryExists) {
      // First get the count of videos in this category
      const totalVideosInCategory = await Video.count({
        where: {
          categoryId: categoryId,
        },
      });

      const result = await Video.findAll({
        where: {
          categoryId: categoryId,
        },
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: Likes,
            as: "likes",
          },
          {
            model: Category,
            as: "category",
          },
          {
            model: Views,
            as: "views",
          },
          {
            model: Saves,
          },
          {
            model: Plan,
          },
        ],
        offset: offset,
        limit: limit,
      });

      if (result?.length > 0) {
        let CategoryTitle;

        const flattenedResponse = result.map((video) => {
          console.log("[VIDEO]:", video);
          const countOfLikes = video.likes.length;
          const countOfSaves = video.Saves.length;
          const countOfViews = video.views.length;
          CategoryTitle = video?.category?.title;

          return {
            ...video.toJSON(),
            categoryTitle: video?.category?.title,
            countOfLikes: countOfLikes,
            countOfSaves: countOfSaves,
            countOfViews: countOfViews,
            planId: video?.Plan.planId,
            planTitle: video?.Plan?.title,
          };
        });

        const totalPages = Math.ceil(totalVideosInCategory / limit);
        const intPage = parseInt(page);

        return {
          status: 200,
          message:
            "Successfully fetched all the videos relevant to the category.",
          data: flattenedResponse,
          categoryTitle: CategoryTitle,
          pagination: {
            currentPage: intPage,
            totalPages,
            totalVideos: totalVideosInCategory, // Now showing count for this category only
          },
        };
      } else if (result?.length === 0) {
        return {
          status: 404,
          message: "This category doesn't have any videos yet.",
          data: null,
        };
      }
    } else {
      return {
        status: 404,
        message: "Category wasn't found.",
        data: null,
      };
    }
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message: "Some problem has occured.",
      data: null,
    };
  }
};

const updateCategoryService = async (updateFields, file) => {
  console.log("[updated category data to be updated]:", updateFields);
  try {
    const check = await Category.findByPk(updateFields.categoryId);
    console.log("[check]:", check);

    console.log("[FILE]:", file);

    if (check) {
      if (updateFields.title) {
        const existingCategory = await Category.findOne({
          where: {
            title: updateFields.title,
            categoryId: { [Op.ne]: updateFields.categoryId },
          },
        });

        if (existingCategory) {
          return {
            status: 409,
            message: `A category with the title "${updateFields.title}" already exists.`,
          };
        }
      }

      if (file) {
        const cloudinaryResponse = await uploadImage(
          file,
          updateFields.title || check.title
        );
        updateFields.banner = cloudinaryResponse.url;
        console.log("[IMAGE UPLOADED]:", cloudinaryResponse.url);
      }

      if (updateFields?.colors) {
        const parsedColors =
          typeof updateFields.colors === "string"
            ? JSON.parse(updateFields.colors)
            : updateFields.colors;
        updateFields.colors = parsedColors;

        console.log("[PARSED COLORS]:", parsedColors); 
      }

      console.log("[UPDATED FIELDS]:", updateFields);

      const result = await Category.update(updateFields, {
        where: {
          categoryId: updateFields.categoryId,
        },
      });

      console.log("[UPDATED THE CATEGORY DETAILS]:", result);
      return {
        status: 200,
        message: "Successfully updated the category details",
      };
    } else {
      return {
        status: 404,
        message: "The category to be updated wasn't found.",
      };
    }
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message: "Some problem has occured.",
    };
  }
};

const deleteCategoryService = async (categoryId) => {
  try {
    const check = await Category.findByPk(categoryId);
    if (check) {
      const result = await Category.destroy({
        where: {
          categoryId: categoryId,
        },
      });

      console.log("[DELETD THE CATEGORY RESULT]:", result);
      return {
        status: 200,
        message: "Successfully deleted the category.",
      };
    } else {
      return {
        status: 404,
        message: "The category to be deleted wasn't found.",
      };
    }
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message: "Some problem has occured.",
    };
  }
};

const getTopPerformanceInsightsService = async (page = 1, limit = 10) => {
  try {
    const videos = await Video.findAll({
      // distinct: true,
      include: [
        { model: Plan },
        { model: Likes, as: "likes" },
        { model: Category, as: "category" },
        { model: Views, as: "views" },
        { model: Saves },
      ],
    });

    console.log("[VIDEOS FETCHED]:", videos);

    // Step 2: Process and calculate total counts for likes, views, and saves
    const processedVideos = videos
      .filter((video) => video && video.likes && video.views && video.Saves)
      .map((video) => {
        const totalLikes = video.likes?.length || 0;
        const totalViews = video.views?.length || 0;
        const totalSaves = video.Saves?.length || 0;
        const insightValue = totalLikes + totalViews + totalSaves;

        return {
          videoId: video.videoId,
          title: video.title,
          categoryId: video.categoryId,
          uri: video.uri,
          thumbnail: video.thumbnail,
          totalLikes,
          totalViews,
          totalSaves,
          insightValue,
          category: video?.category?.title,
          createdAt: video.createdAt,
        };
      });

    const sortedVideos = processedVideos.sort(
      (a, b) => b.insightValue - a.insightValue
    );

    const totalVideos = sortedVideos.length;

    const totalPages = Math.ceil(totalVideos / limit);
    const offset = (page - 1) * limit;

    const actualLimit = parseInt(limit, 10);

    const paginatedVideos = sortedVideos.slice(offset, offset + actualLimit);

    const categories = await Category.findAll({
      include: [
        {
          model: Video,
          include: [
            {
              model: Views,
              as: "views",
            },
            {
              model: Saves,
            },
            {
              model: Likes,
              as: "likes",
            },
          ],
        },
      ],
    });

    const flattenedCategories = categories.map((category) => {
      const totalVideos = category.Videos.length;
      // console.log("[TOTAL VIDEOS]:", totalVideos);
      const videos = category.Videos;

      const totalLikes = videos.reduce(
        (acc, video) => acc + video?.likes?.length,
        0
      );
      const totalViews = videos.reduce(
        (acc, video) => acc + video?.views?.length,
        0
      );
      const totalSaves = videos.reduce(
        (acc, video) => acc + video?.Saves?.length,
        0
      );
      // const totalVideos = videos.reduce((acc, video) => acc + video?.length, 0);

      return {
        categoryId: category.categoryId,
        title: category.title,
        banner: category.banner,
        totalLikes,
        totalViews,
        totalSaves,
        numberOfVideos: videos.length,
        totalVideos: totalVideos,
        // videos: videos.map((video) => ({
        //   videoId: video.videoId,
        //   title: video.title,
        //   uri: video.uri,
        //   thumbnail: video.thumbnail,
        //   totalLikes: video.likes.length,
        //   totalViews: video.views.length,
        //   totalSaves: video.Saves.length,
        // })),
        createdAt: category.createdAt,
      };
    });

    const sortedCategories = flattenedCategories
      .sort((a, b) => {
        if (b.totalLikes !== a.totalLikes) return b.totalLikes - a.totalLikes;
        if (b.totalViews !== a.totalViews) return b.totalViews - a.totalViews;
        return b.numberOfVideos - a.numberOfVideos;
      })
      .slice(0, 5);

    return {
      status: 200,
      message: "Top performance videos fetched successfully",
      insights: {
        topVideos: paginatedVideos,
        topCategories: sortedCategories,
        pagination: {
          currentPage: page,
          totalPages,
          totalVideos,
        },
      },
    };
  } catch (err) {
    console.log("[ERR]:", err);
    return {
      status: 500,
      message: "There was a problem while fetching the insights",
      insights: null,
    };
  }
};

const getAllUsersService = async (page = 1, limit = 5) => {
  try {
    const offset = (page - 1) * limit;
    const result = await User.findAll({
      where: {
        user_type: "User",
      },
      include: [
        {
          model: Plan,
        },
        {
          model: Likes,
          as: "likes",
        },
        {
          model: Saves,
          as: "saves",
        },
        {
          model: UserCustomManifestationVideo,
          as: "customManifestationVideos",
        },
      ],
      offset: offset,
      limit: limit,
    });

    const flattenedResponse = result.map((user) => {
      const plan = user.Plan;

      const countOfLikes = user.likes.length;
      const countOfSaves = user.saves.length;
      let isCustomVideoAssigned = false;

      if (user?.customManifestationVideos[0]?.userId === user?.userId) {
        isCustomVideoAssigned = true;
      }

      return {
        userId: user.userId,
        name: user.name,
        email: user.email,
        dob: user.dob,
        password: user.password,
        otp: user.otp,
        provider: user.provider,
        user_type: user.user_type,
        planId: plan?.planId,
        planTitle: plan?.title,
        planPrice: plan?.price,
        liked_videos: countOfLikes,
        saved_videos: countOfSaves,
        subscribed: user.subscribed,
        notificationEnability: user.notificationEnability,
        profile_picture: user.profile_picture,
        phone_number: user.phone_number,
        timezone: user.timezone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isCustomVideoAssigned,
        customVideo: user?.customManifestationVideos[0]?.url || null,
        customVideoTitle: user?.customManifestationVideos[0]?.title || null,
        customVideoDescription:
          user?.customManifestationVideos[0]?.description || null,
        customVideoId:
          user?.customManifestationVideos[0]?.custom_manifestation_id || null,
        customVideoUploaded:
          user?.customManifestationVideos[0]?.createdAt || null,
        customVideoThumbnail:
          user?.customManifestationVideos[0]?.thumbnail || null,
      };
    });

    const totalUsers = await User.count();
    const totalPages = Math.ceil(totalUsers / limit);
    const intPage = parseInt(page);

    return {
      status: 200,
      message: "Successfully fetched all the users.",
      data: flattenedResponse,
      pagination: {
        currentPage: intPage,
        totalPages,
        totalUsers,
      },
    };
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message: "A problem occured while fetching the users",
      data: null,
    };
  }
};

const getUserDetailsService = async (userId) => {
  try {
    const result = await User.findOne({
      where: {
        user_type: "User",
        userId: userId,
      },
    });

    return {
      status: 200,
      message: "Successfully fetched the user details.",
      data: {
        userId: result?.userId,
        name: result?.name,
        email: result?.email,
        dob: result?.dob,
        user_type: result?.user_type,
        subscription: result?.subscription,
        liked_videos: result?.liked_videos,
        saved_videos: result?.saved_videos,
        created_at: result?.createdAt,
      },
    };
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message: "A problem occured while fetching the user details",
      data: null,
    };
  }
};

const getUsersByPlanService = async (page, limit, subscription_plan) => {
  try {
    const offset = (page - 1) * limit;

    if (subscription_plan === null) {
      const allUsers = await User.findAll(
        {
          include: [
            {
              model: Plan,
            },
          ],
        },
        { where: { user_type: "User" } }
      );
      return {
        status: 200,
        message: "Fetched all users",
        data: allUsers,
      };
    }

    const plan = await Plan.findOne({ where: { title: subscription_plan } });

    if (!plan) {
      return {
        status: 404,
        message: `Plan "${subscription_plan}" not found.`,
        data: null,
      };
    }

    const users = await User.findAll({
      where: { planId: plan.planId },
      include: [
        { model: Plan, attributes: ["title", "price"] },
        {
          model: Likes,
          as: "likes",
        },
        {
          model: Saves,
          as: "saves",
        },
        {
          model: UserCustomManifestationVideo,
          as: "customManifestationVideos",
        },
      ],
    });

    const flattenedResponse = users.map((user) => {
      const plan = user.Plan;
      const countOfLikes = user.likes.length; // Calculate the number of likes
      const countOfSaves = user.saves.length; // Calculate the number of saves
      const countOfCustomVideos = user.customManifestationVideos.length; // Calculate the number of custom manifestation videos
      let isCustomVideoAssigned = false;

      if (user?.customManifestationVideos[0]?.userId === user?.userId) {
        isCustomVideoAssigned = true;
      }

      return {
        userId: user.userId,
        name: user.name,
        email: user.email,
        dob: user.dob,
        password: user.password,
        otp: user.otp,
        provider: user.provider,
        user_type: user.user_type,
        planId: plan?.planId,
        planTitle: plan?.title,
        planPrice: plan?.price,
        liked_videos: countOfLikes,
        saved_videos: countOfSaves,
        isCustomVideoAssigned,
        customVideoThumbnail:
          user?.customManifestationVideos[0]?.thumbnail || null,
        customVideo: user?.customManifestationVideos[0]?.url || null,
        customVideoTitle: user?.customManifestationVideos[0]?.title || null,
        customVideoDescription:
          user?.customManifestationVideos[0]?.description || null,
        customVideoId:
          user?.customManifestationVideos[0]?.custom_manifestation_id || null,
        customVideoUploaded:
          user?.customManifestationVideos[0]?.createdAt || null,
        subscribed: user.subscribed,
        notificationEnability: user.notificationEnability,
        profile_picture: user.profile_picture,
        phone_number: user.phone_number,
        timezone: user.timezone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    });

    if (users.length === 0) {
      return {
        status: 404,
        message: `No users found for the "${subscription_plan}" plan.`,
        data: [],
      };
    }
    console.log("[DATA]:", users);
    const totalUsers = subscription_plan
      ? await User.count({ where: { planId: plan.planId } })
      : await User.count({ where: { user_type: "User" } });

    const totalPages = Math.ceil(totalUsers / limit);
    const intPage = parseInt(page);

    return {
      status: 200,
      message: `Fetched users subscribed to the "${subscription_plan}" plan.`,
      data: flattenedResponse,
      pagination: {
        currentPage: intPage,
        totalPages,
        totalUsers,
      },
    };
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message: "A problem occured while fetching the users",
      data: null,
    };
  }
};

const assignCustomVideoService = async (body, file, image) => {
  try {
    const checkIfCustomVideoExists = await CustomManifestationVideo.findOne({
      where: {
        userId: body?.userId,
      },
    });

    if (checkIfCustomVideoExists) {
      return {
        status: 409,
        message: "The custom manifestation video for this user already exists.",
        result: null,
      };
    }

    const checkUserPlan = await User.findOne({
      where: {
        userId: body?.userId,
      },
      include: {
        model: Plan,
      },
    });

    console.log("[check user plan]:", checkUserPlan);

    if (!checkUserPlan) {
      return {
        status: 404,
        message: "User not found",
        results: null,
      };
    }
    const planData = checkUserPlan?.Plan?.dataValues;

    if (planData?.title === "Premium") {
      const sanitizedTitle = body.title.trim();
      const uploadToCloudinaryResult = await uploadVideo(
        file.path,
        sanitizedTitle
      );
      const thumbnailUpload = await uploadImage(image, sanitizedTitle);
      const result = await CustomManifestationVideo.create({
        ...body,
        url: uploadToCloudinaryResult?.url,
        thumbnail: thumbnailUpload?.url,
      });

      const notificationCreationQuery = await Notification.create({
        userId: checkUserPlan?.userId,
        title: "Custom Manifestation Movie",
        description:
          "Your Custom Manifestation Movie has been uploaded! Check now in the category of the same name.",
        type: "new",
      });

      console.log(
        "[NOTIFICATION CREATED FOR USER]:",
        notificationCreationQuery
      );

      return {
        status: 200,
        message: "Successfully uploaded the video for the premium user.",
        result: result,
      };
    } else {
      return {
        status: 403,
        message: "This user isn't authorized to use this plan.",
        result: null,
      };
    }
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message: "A problem occured while assigning a custom video.",
      results: null,
    };
  }
};

const editCustomVideoService = async (body) => {
  try {
    const checkIfCustomVideoExists = await CustomManifestationVideo.findOne({
      where: {
        custom_manifestation_id: body?.custom_manifestation_id,
      },
    });

    if (body?.userId !== checkIfCustomVideoExists?.userId) {
      return {
        status: 401,
        message: "The video you're trying to edit doesn't belong to this user",
        result: null,
      };
    }

    if (checkIfCustomVideoExists) {
      const checkUserPlan = await User.findOne({
        where: {
          userId: body?.userId,
        },
        include: {
          model: Plan,
        },
      });

      console.log("[check user plan]:", checkUserPlan);

      if (!checkUserPlan) {
        return {
          status: 404,
          message: "User not found",
          result: null,
        };
      }
      const planData = checkUserPlan?.Plan?.dataValues;

      if (planData?.title === "Premium") {
        let updateData = {};
        if (body?.title) updateData.title = body.title;
        if (body?.description) updateData.description = body.description;

        console.log("[PARSED COLORS]:", body); 



        const result = await CustomManifestationVideo.update(updateData, {
          where: {
            custom_manifestation_id: body?.custom_manifestation_id,
            userId: body?.userId,
          },
        });

        return {
          status: 200,
          message:
            "Successfully updated the video information for this premium user.",
          result: result,
        };
      } else {
        return {
          status: 403,
          message: "This user isn't authorized to use this plan.",
          result: null,
        };
      }
    } else {
      return {
        status: 404,
        message: "The video you want to edit is not found",
        result: null,
      };
    }
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message:
        "There was some error while editing the custom manifestation video",
      result: null,
    };
  }
};

const deleteCustomVideoService = async (body) => {
  console.log("USER ID", body?.userId);
  try {
    const checkIfCustomVideoExists = await CustomManifestationVideo.findOne({
      where: {
        custom_manifestation_id: body?.custom_manifestation_id,
      },
    });

    if (!checkIfCustomVideoExists) {
      return {
        status: 404,
        message: "The video you want to delete is not found",
        result: null,
      };
    }

    if (body?.userId !== checkIfCustomVideoExists?.userId) {
      return {
        status: 401,
        message:
          "The video you're trying to delete doesn't belong to this user",
        result: null,
      };
    }

    if (checkIfCustomVideoExists) {
      const checkUserPlan = await User.findOne({
        where: {
          userId: body?.userId,
        },
        include: {
          model: Plan,
        },
      });

      console.log("[check user plan]:", checkUserPlan);

      if (!checkUserPlan) {
        return {
          status: 404,
          message: "User not found",
          result: null,
        };
      }
      const planData = checkUserPlan?.Plan?.dataValues;

      if (planData?.title === "Premium") {
        const result = await CustomManifestationVideo.destroy({
          where: {
            custom_manifestation_id: body?.custom_manifestation_id,
          },
        });

        return {
          status: 200,
          message: "Successfully deleted the video for this premium user.",
          result: result,
        };
      } else {
        return {
          status: 403,
          message: "This user isn't authorized to use this plan.",
          result: null,
        };
      }
    } else {
      return {
        status: 404,
        message: "The video you want to delete is not found",
        result: null,
      };
    }
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message:
        "There was some error while deleting the custom manifestation video",
      result: null,
    };
  }
};

const getUsersFeedbackService = async () => {
  try {
    const result = await Feedback.findAll();
    return {
      status: 200,
      message: "Successfully fetched all users feedback.",
      data: result,
    };
  } catch (err) {
    console.log("[ERROR]:", err);
    return {
      status: 500,
      message: "Couldn't get users feedback.",
      data: null,
    };
  }
};

module.exports = {
  signupService,
  loginService,
  getOverAllInsightsService,
  getAllVideosServices,
  uploadVideoService,
  createCategoryService,
  getAllCategoriesService,
  updateVideoService,
  deleteVideoService,
  getVideosByCategoryService,
  updateCategoryService,
  deleteCategoryService,
  getTopPerformanceInsightsService,
  getAllUsersService,
  getUserDetailsService,
  getUsersByPlanService,
  assignCustomVideoService,
  editCustomVideoService,
  deleteCustomVideoService,
  getUsersFeedbackService,
};
