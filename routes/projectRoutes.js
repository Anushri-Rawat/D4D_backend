const express = require("express");
const {
  createProject,
  getAllProjects,
  updateproject,
  deleteProject,
  getProjectById,
  likeProject,
} = require("../controllers/projectController");
const {
  uploadImage,
  uploadImageOnCloud,
} = require("../controllers/imageController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.use(protect);
router
  .route("/")
  .post(uploadImage, uploadImageOnCloud, createProject)
  .get(getAllProjects);
router
  .route("/:id")
  .patch(uploadImage, uploadImageOnCloud, updateproject)
  .delete(deleteProject)
  .get(getProjectById);
router.route("/like/:project_id").post(likeProject);

module.exports = router;
