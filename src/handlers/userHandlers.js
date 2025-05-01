const services = require("../services/userServices");


const getUserInfo = async (request, response) => {
  try {
    const userId = request?.userId;
    const result = await services.getUserInfoService(userId);
    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
      data: result?.data,
    });
  } catch (err) {
    console.log("[ERROR]:", err);
    response.status(500).send({
      status: 500,
      message: "Some problem occured while getting user info.",
      data: null,
    });
  }
}

const getAllCategories = async (request, response) => {
  try {
    const result = await services.getAllCategoriesServices();
    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
      data: result?.data,
    });
  } catch (err) {
    console.log("[ERROR]:",err);
    response.status(500).send({
      status: 500,
      message: "Some problem occured while getting all categories.",
      data: null,
    });
  }
}


const getPopularVideos = async (request, response) => {
  try {
    const { limit, offset } = request?.query;
    const userId = request?.userId;
    const result = await services.getPopularVideosService(limit, offset, userId);
    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
      data: result?.data,
      pagination: result?.pagination
    });
  } catch (err) {
    console.log("[ERROR]:", err);
    response.status(500).send({
      status: 500,
      message: "Some problem occured while getting popular videos.",
      data: null,
    });
  }
};

const likeVideoHandler = async (request, response) => {
  try {
    const userId = request?.userId;
    const { videoId } = request?.body;
    const result = await services.likeVideoService(videoId, userId);
    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
      data: result?.data,
      liked: result?.liked
    });
  } catch (err) {
    console.log("[ERROR]:", err);
    response.status(500).send({
      status: 500,
      message: "Some problem occured while liking the video ",
      data: null,
      liked: null
    });
  }
};

const saveVideoHandler = async (request, response) => {
  try {
    const userId = request?.userId;
    const { videoId } = request?.body;
    const result = await services.saveVideoService(videoId, userId);
    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
      data: result?.data,
    });
  } catch (err) {
    console.log("[ERROR]:", err);
    response.status(500).send({
      status: 500,
      message: "Some problem occured while liking the video ",
      data: null,
    });
  }
};

const incrementAView = async (request, response) => {
  try {
    const {videoId} = request?.body;
    const result = await services.incrementViewService(videoId);
    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
      result: result?.result,
    });
  } catch (err) {
    console.log("[ERROR]:", err);
    response.status(500).send({
      status: 500,
      message: "Problem occured while incrementing the views of a video.",
      data: null,
    });
  }
}

const getSavedVideos = async (request, response) => {
  try {
    const userId = request?.userId;
    const result = await services.getSavedVideosService(userId);
    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
      data: result?.data,
    });
  } catch (err) {
    console.log("[ERROR]:", err);
    response.status(500).send({
      status: 500,
      message: "Problem occured while fetching the saved videos.",
      data: null,
    });
  }
};

const getLikedVideos = async (request, response) => {
  try {
    const userId = request?.userId;
    const result = await services.getLikedVideosService(userId);
    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
      data: result?.data,
    });
  } catch (err) {
    console.log("[ERROR]:", err);
    response.status(500).send({
      status: 500,
      message: "Problem occured while fetching the liked videos.",
      data: null,
    });
  }
};

const getCustomManifestationVideo = async (request, response) => {
  try {
    const userId = request?.userId;
    const result = await services.getCustomManifestationVideoService(userId);
    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
      data: result?.data,
    });
  } catch (err) {
    console.log("[ERROR]:", err);
    response.status(500).send({
      status: 500,
      message: "Couldn't get custom manifestation video for the user.",
      data: null,
    });
  }
};

const createNoteHandler = async (request, response) => {
  try {
    const userId = request?.userId;
    const { title, description } = request?.body;
    const result = await services.createNoteService(title, description, userId);
    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
      data: result?.data,
    });
  } catch (err) {
    console.log("[ERROR]:", err);
    response.status(500).send({
      status: 500,
      message: "Couldn't create a note.",
      data: null,
    });
  }
};

const editNoteHandler = async (request, response) => {
  try {
    const userId = request?.userId;
    const body = request?.body;
    const result = await services.editNoteService({ ...body, userId });
    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
      data: result?.data,
    });
  } catch (err) {
    console.log("[ERROR]:", err);
    response.status(500).send({
      status: 500,
      message: "Couldn't create a note.",
      data: null,
    });
  }
};

const getAllNotes = async (request, response) => {
  try {
    const userId = request.userId;
    const { search } = request.query;
    const result = await services.getAllNotesServices(userId, search);
    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
      data: result?.data,
    });
  } catch (err) {
    console.log("[ERROR]:", err);
    response.status(500).send({
      status: 500,
      message: "Couldn't fetch all notes",
      data: null,
    });
  }
};

const deleteNotes = async (request, response) => {
  try {
    const userId = request?.userId;
    const { notesId } = request.body;
    const result = await services.deleteNoteService(notesId, userId);
    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
      result: result?.data,
    });
  } catch (err) {
    console.log("[ERROR]:", err);
    response.status(500).send({
      status: 500,
      message: "Couldn't delete notes.",
      data: null,
    });
  }
};

const searchNotes = async (request, response) => {
  try {
    const userId = request?.userId;
    const { search } = request.query;
    console.log("WUERY RESULY",JSON.stringify(request.query));
    const result = await services.searchNoteService(search);
    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
      result: result?.data,
    });
  } catch (err) {
    console.log("[ERROR]:", err);
    response.status(500).send({
      status: 500,
      message: "Couldn't delete notes.",
      data: null,
    });
  }
};

const updateUserPlan = async (request, response) => {
  try {
    const userId = request?.userId;
    const { planId } = request?.body;
    console.log("[body]:", planId);
    const result = await services.updateUserPlanService(userId, planId);
    console.log("[data to be returned]:", {
      status: result?.status,
      message: result?.message,
      data: result?.data,
    })
    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
      data: result?.data,
    });
  } catch (err) {
    console.log("[ERROR]:", err);
    response.status(500).send({
      status: 500,
      message: "Failed to update the user plan.",
      data: null,
    });
  }
};

const handlePasswordChange = async (request, response) => {
  try {
    const { password, newPassword } = request?.body;
    const userId = request?.userId;

    const result = await services.changePasswordService(
      password,
      newPassword,
      userId
    );
    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
      result: result?.result,
    });
  } catch (err) {
    console.log("[ERROR]:", err);
    response.status(500).send({
      status: 500,
      message: "Failed to update the password.",
      data: null,
    });
  }
};

const handleAccountDeletion = async (request, response) => {
  try {
    const userId = request?.userId;

    const result = await services.deleteAccountService(userId);
    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
      result: result?.result,
    });
  } catch (err) {
    console.log("[ERROR]:", err);
    response.status(500).send({
      status: 500,
      message: "Failed to update the password.",
      data: null,
    });
  }
};

const userUpdateInfo = async (request, response) => {
  try {
    const userId = request.userId;
    const body = request?.body;

    console.log("[body data]:", body);
    const imageFile = request?.file;
    console.log("[IMAGE FILE]:", imageFile);
    const result = await services.userUpdateInfoService(
      userId,
      body,
      imageFile
    );
    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
      result: result?.result,
    });
  } catch (err) {
    console.log("[ERROR]:", err);
    response.status(500).send({
      status: 500,
      message: "Couldn't update user information.",
      result: null,
    });
  }
};

const getVideosByCategory = async (request, response) => {
  try {
    const userId = request?.userId;
    const { categoryId, filter, search, page } = request?.query;
    const result = await services.getVideosByCategoryService(
      categoryId,
      userId,
      filter,
      search,
      page
    );

    console.log("[RESULT]:", result);
    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
      data: result?.data,
    });
  } catch (err) {
    console.log("[ERROR]:", err);
    response.status(500).send({
      status: 500,
      message: "Some problem has occured.",
      data: null,
    });
  }
};

const createReminders = async (request, response) => {
  try {
    const userId = request?.userId;
    const body = request?.body;
    const result = await services.createRemindersService(userId, body);
    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
      result: result?.result,
    });
  } catch (err) {
    response.status(500).send({
      status: 409,
      message:
        "Reminder already exists, you can customize the existing reminder.",
      result: null,
    });
  }
};

const getReminders = async (request, response) => {
  try {
    const userId = request?.userId;
    const result = await services.getRemindersService(userId);
    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
      data: result?.data,
    });
  } catch (err) {
    console.log("[ERROR]:", err);
    response.status(500).send({
      status: 500,
      message: "Problem occured while fetching the reminders.",
      data: null,
    });
  }
};

const customizeReminderHandler = async (request, response) => {
  try {
    const userId = request?.userId;
    const body = request?.body;   
    const result = await services.customizeReminderService(userId, body);
    console.log("[RESULT]:",result);
    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
      result: result?.result,
      navigateToCreate: result?.navigateToCreate,
    });
  } catch (err) {
    console.log("[ERROR]:", err);
    response.status(500).send({
      status: 500,
      message: "Problem occured while customizing the reminders.",
      result: null,
      navigateToCreate: false,
    });
  }
};

const deleteReminderHandler = async (request, response) => {
  try {
    const userId = request.userId;
    const result = await services.deleteReminderService(userId);
    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
      result: result?.result,
    });
  } catch (err) {
    response.status(500).send({
      status: 500,
      message: "Problem occured while deleting the reminders.",
      result: null,
    });
  }
};

const getAllNotificationsHandler = async (request, response) => {
  try {
    const userId = request?.userId;
    const result = await services.getAllNotificationsService(userId);
    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
      data: result?.data,
    });
  } catch (err) {
    console.log("[ERROR]:", err);
    response.status(500).send({
      status: 500,
      message: "Some problem occured while getting notifications.",
      data: null,
    });
  }
};

const submitFeedback = async (request, response) => {
  try {
    const userId = request.userId;
    const body = request?.body;
    const result = await services.submitFeedbackServices(userId, body);
    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
      result: result?.result,
    });
  } catch (err) {
    console.log("{ERROR}:", err);
    response.status(500).send({
      status: 500,
      message: "Couldn't submit a feedback.",
      result: null,
    });
  }
};

const getVideosByPopularityHandler = async (request, response) => {
  try {
    const result = await services.getVideosByPopularityService();
    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
      data: result?.data
    });
  } catch (err) {
    console.log("[ERROR]:", err);
    response.status(500).send({
      status: 500,
      message: "Couldn't fetch the popular videos.",
      data: null,
    });
  }
};

const getUserSavedLikedVideos = async (request, response) => {
  try {
    const userId = request.userId;
    const { filter } = request?.query;
    const result = await services.getUserSavedLikedVideosService(userId, filter);
    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
      data: result?.data
    });
  } catch (err) {
    console.log("[ERROR]:",err);
    response.status(500).send({
      status: 500,
      message: "Couldn't fetch the popular videos.",
      data: null,
    });
  }
}

module.exports = {
  incrementAView,
  getPopularVideos,
  likeVideoHandler,
  saveVideoHandler,
  getSavedVideos,
  getLikedVideos,
  getCustomManifestationVideo,
  createNoteHandler,
  getAllNotes,
  editNoteHandler,
  deleteNotes,
  updateUserPlan,
  handlePasswordChange,
  handleAccountDeletion,
  userUpdateInfo,
  getVideosByCategory,
  createReminders,
  getReminders,
  customizeReminderHandler,
  deleteReminderHandler,
  getAllNotificationsHandler,
  submitFeedback,
  getVideosByPopularityHandler,
  getUserInfo,
  getAllCategories,
  getUserSavedLikedVideos,
  searchNotes
};
