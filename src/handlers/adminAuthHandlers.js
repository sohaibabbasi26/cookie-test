const service = require("../services/adminAuthServices");

const adminSignupHandler = async (request, response) => {
  try {
    const body = request?.body;
    const provider = body.provider;
    console.log("[BODY DATA]:", body);

    const result = await service.signupService(body);
    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
    });
  } catch (err) {
    console.log("[ERROR IN HANDLER]:", err);
    response.status(500).send({
      status: 500,
      message: "A problem occurred while signing-up.",
    });
  }
};

const adminLoginHandler = async (request, response) => {
  try {
    const body = request?.body;
    console.log("[BODY DATA]:", body);

    const result = await service.loginService(body);

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 15);

    response.cookie("accessToken", result?.token, {
      httpOnly: true,
      secure: false,
      maxAge: 900 * 1000,
      sameSite: "Lax",
      domain: 'localhost',
      path: "/",
    });

    response.cookie("refreshToken", result?.refreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "Lax",  
      domain: 'localhost',
      path: "/",
    });

    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
      token: result?.token,
    });
  } catch (err) {
    console.log("[ERROR IN HANDLER]:", err);
    response.status(500).send({
      status: 500,
      message: "A problem occurred while logging-in.",
    });
  }
};

const getOverallInsights = async (request, response) => {
  try {
    const result = await service.getOverAllInsightsService();
    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
      insights: result?.insights,
    });
  } catch (err) {
    console.log("[ERROR WHILE GETTING INSIGHTS]:", err);
    response.status(500).send({
      status: 500,
      message: "There was a problem fetching the overall insights",
      insights: null,
    });
  }
};

const getAllVideos = async (request, response) => {
  try {
    const { limit, page } = request?.query;
    const result = await service.getAllVideosServices(page, limit);
    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
      videos: result?.videos,
      pagination: result?.pagination,
    });
  } catch (err) {
    console.log("[ERROR]:", err);
    response.status(500).send({
      status: 500,
      message: "There was a problem fetching the all videos",
      videos: null,
    });
  }
};

const uploadVideoHandler = async (request, response) => {
  try {
    const body = request?.body;
    const video = request.files["video"][0];
    const image = request.files["image"][0];

    console.log("Uploaded Video:", video);
    console.log("Uploaded Image:", image);

    if (!video) {
      response.status(404).send({
        status: 404,
        message: "No video file was uploaded",
        results: null,
      });
    }

    const result = await service.uploadVideoService(body, video, image);

    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
      result: result?.results,
    });
  } catch (err) {
    console.log("[ERR]:", err);
    response.status(500).send({
      status: 500,
      message: "Some problem occurred while uploading the video.",
      results: null,
    });
  }
};

const createCategory = async (request, response) => {
  try {
    console.log("Request Body:", request.body);
    console.log("Request File:", request.file);

    if (!request.file) {
      return response.status(400).send({
        status: 400,
        message: "No image file uploaded.",
        result: null,
      });
    }

    const result = await service.createCategoryService(
      request.body,
      request.file
    );
    response.status(result.status).send({
      status: result.status,
      message: result.message,
      results: result.results,
    });
  } catch (err) {
    console.log("[ERROR]:", err);
    response.status(500).send({
      status: 500,
      message: "Some problem occurred while creating a category",
      result: null,
    });
  }
};

const getAllCategories = async (request, response) => {
  try {
    const { page, limit } = request?.query;
    const result = await service.getAllCategoriesService(page, limit);
    response.status(200).send({
      status: result?.status,
      message: result?.message,
      data: result?.data,
      pagination: result?.pagination
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

const updateVideoHandler = async (request, response) => {
  try {
    const updateFields = request?.body;
    const { videoId } = request?.params;

    const result = await service.updateVideoService(updateFields, videoId);

    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
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

const deleteVideoHandler = async (request, response) => {
  try {
    const { videoId } = request?.params;
    const result = await service.deleteVideoService(videoId);

    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
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

const getVideosByCategory = async (request, response) => {
  try {
    // const { categoryId } = request?.params;
    const { categoryId, page, limit } = request?.query;
    console.log(categoryId, page, limit, "printinggg")
    const result = await service.getVideosByCategoryService(categoryId, page, limit);
    console.log("[response]:", result);
    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
      data: result?.data,
      categoryTitle: result?.categoryTitle,
      pagination: result.pagination
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

const updateCategoryHandler = async (request, response) => {
  try {
    // const { categoryId } = request?.params;
    const updateFields = request?.body;
    const file = request?.file;

    const result = await service.updateCategoryService(
      updateFields,
      //   categoryId,
      file
    );

    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
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

const deleteCategoryHandler = async (request, response) => {
  try {
    const { categoryId } = request?.params;
    const result = await service.deleteCategoryService(categoryId);

    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
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

const getTopPerformanceInsights = async (request, response) => {
  try {
    const {page, limit} = request.query
    console.log("data from frontend", limit)
    const result = await service.getTopPerformanceInsightsService(page, limit);
    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
      insights: result?.insights,
    });
  } catch (err) {
    console.log("[ERROR]:", err);
    response.status(500).send({
      status: 500,
      message: "There was a problem while fetching the insights",
      insights: null,
    });
  }
};

const getAllUsers = async (request, response) => {
  try {
    const { page, limit } = request?.query;
    const result = await service.getAllUsersService( page, limit );
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
      message: "A problem occured while fetching the users",
      data: null,
    });
  }
};

const getUserDetails = async (request, response) => {
  try {
    const { userId } = request?.params;
    const result = await service.getUserDetailsService(userId);
    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
      data: result?.data,
    });
  } catch (err) {
    console.log("[ERROR]:", err);
    response.status(500).send({
      status: 500,
      message: "A problem occured while fetching the users",
      data: null,
    });
  }
};

const getUsersByPlan = async (request, response) => {
  try {
    const { page, limit, plan } = request?.query;
    // const { subscription_plan } = request?.params;
    const result = await service.getUsersByPlanService(page, limit, plan);
    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
      data: result?.data,
      pagination: result?.pagination
    });
  } catch (err) {
    console.log("[ERR]:", err);
    response.status(500).send({
      status: 500,
      message: "A problem occured while fetching the users",
      data: null,
    });
  }
};

const assignCustomVideo = async (request, response) => {
  try {
    const body = request?.body;
    const video = request.files["video"][0];
    const image = request.files["image"][0];

    console.log("Uploaded Video:", video);
    console.log("Uploaded Image:", image);

    if (!video) {
      response.status(404).send({
        status: 404,
        message: "No video file was uploaded",
        result: null,
      });
    }
    const result = await service.assignCustomVideoService(body, video, image);
    response.send({
      status: result?.status,
      message: result?.message,
      result: result?.result,
    });
  } catch (err) {
    console.log("[ERROR]:", err);
    response.status(500).send({
      status: 500,
      message: "A problem occured while assigning a custom video.",
      result: null,
    });
  }
};

const editCustomManifestationVideo = async (request, response) => {
  try {
    const body = request?.body;
    const result = await service.editCustomVideoService(body);
    response.status(result.status).send({
      status: result?.status,
      message: result?.message,
      result: result?.result,
    });
  } catch (err) {
    console.log("[ERROR]:", err);
    response.status(500).send({
      status: 500,
      message:
        "There was some error while editing the custom manifestation video",
      result: null,
    });
  }
};

const deleteCustomManifestationVideo = async (request, response) => {
  try {
    const body = request?.body;
    console.log("CUSTOM BODY", body)
    const result = await service.deleteCustomVideoService(body);
    response.status(result.status).send({
      status: result?.status,
      message: result?.message,
      result: result?.result,
    });
  } catch (err) {
    console.log("[ERROR]:", err);
    response.status(500).send({
      status: 500,
      message:
        "There was some error while deleting the custom manifestation video",
      result: null,
    });
  }
};

const getAllFeedbackHandler = async (request, response) => {
  try {
    const result = await service.getUsersFeedbackService();
    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
      data: result?.data,
    });
  } catch (err) {
    console.log("[ERROR]:", err);
    response.status(500).send({
      status: 500,
      message: "Couldn't get users feedback.",
      data: null,
    });
  }
};

module.exports = {
  adminSignupHandler,
  adminLoginHandler,
  getOverallInsights,
  getAllVideos,
  uploadVideoHandler,
  createCategory,
  getAllCategories,
  updateVideoHandler,
  deleteVideoHandler,
  getVideosByCategory,
  updateCategoryHandler,
  deleteCategoryHandler,
  getTopPerformanceInsights,
  getAllUsers,
  getUserDetails,
  getUsersByPlan,
  assignCustomVideo,
  editCustomManifestationVideo,
  deleteCustomManifestationVideo,
  getAllFeedbackHandler,
};
