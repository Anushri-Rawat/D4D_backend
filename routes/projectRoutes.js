const express = require("express");
const {
  createProject,
  getAllProjects,
  updateproject,
  deleteProject,
  getProjectById,
  likeProject,
  getMostLikedProjects,
  getMostViewedProjects,
} = require("../controllers/projectController");
const {
  upload,
  uploadVideoOnCloud,
  uploadMultipleImagesOnCloud,
} = require("../controllers/imageController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/most_liked", getMostLikedProjects);
router.get("/most_viewed", getMostViewedProjects);
router.use(protect);
router
  .route("/")
  .post(
    upload.array("images_url", 5),
    uploadMultipleImagesOnCloud,
    createProject
  )
  .get(getAllProjects);

router
  .route("/:id/upload_video")
  .post(upload.single("video_url"), uploadVideoOnCloud, updateproject);

router
  .route("/:id")
  .patch(
    upload.array("images_url", 5),
    uploadMultipleImagesOnCloud,
    updateproject
  )
  .delete(deleteProject)
  .get(getProjectById);
router.route("/like/:project_id").post(likeProject);

module.exports = router;
