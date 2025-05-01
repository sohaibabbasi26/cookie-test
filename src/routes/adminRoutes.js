const express = require("express");
const router = express.Router();
const handlers = require("../handlers/adminAuthHandlers");
const validators = require("../middlewares/formValidators");
const { isAdmin } = require("../middlewares/adminVerificator");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post(
  "/sign-up",
  validators.signUpValidator,
  handlers.adminSignupHandler
);
router.post("/log-in", validators.loginValidator, handlers.adminLoginHandler);
router.get("/get-overall-insights", isAdmin, handlers.getOverallInsights);
router.get("/get-all-videos", isAdmin, handlers.getAllVideos);
router.post(
  "/upload-video",
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  validators.uploadVideoValidator,
  isAdmin,
  handlers.uploadVideoHandler
);
router.post(
  "/create-category",
  upload.single("file"),
  validators.createCategoryValidator,
  isAdmin,
  handlers.createCategory
);
router.get("/get-all-categories", isAdmin, handlers.getAllCategories);
router.put(
  "/update-video/:videoId",
  validators.updateVideoInfoValidator,
  isAdmin,
  handlers.updateVideoHandler
);
router.delete("/delete-video/:videoId", isAdmin, handlers.deleteVideoHandler);
router.get(
  "/get-videos-by-category",
  isAdmin,
  handlers.getVideosByCategory
);
router.put(
  "/update-category",
  upload.single("file"),
  validators.updateCategoryValidator,
  isAdmin,
  handlers.updateCategoryHandler
);
router.delete(
  "/delete-category/:categoryId",
  isAdmin,
  handlers.deleteCategoryHandler
);
router.get(
  "/get-top-performance-insights",
  isAdmin,
  handlers.getTopPerformanceInsights
);
router.get("/get-all-users", isAdmin, handlers?.getAllUsers);
router.get("/get-user-detail/:userId", isAdmin, handlers?.getUserDetails);
router.get(
  "/get-users-by-plan",
  isAdmin,
  handlers.getUsersByPlan
);
router.post(
  "/assign-custom-video",
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  validators.assignCustomVideoValidator,
  isAdmin,
  handlers.assignCustomVideo
);
router.put(
  "/edit-custom-video",
  validators.editCustomVideoInfoValidator,
  isAdmin,
  handlers.editCustomManifestationVideo
);
router.delete(
  "/delete-custom-video",
  isAdmin,
  handlers.deleteCustomManifestationVideo
);
router.get("/get-all-feedback", isAdmin, handlers.getAllFeedbackHandler);

module.exports = router;
