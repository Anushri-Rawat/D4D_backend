const express = require("express");
const {
  uploadImage,
  uploadImageOnCloud,
} = require("../controllers/imageController");
const {
  signUp,
  login,
  updateProfile,
  getProfile,
  getProfileById,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router
  .route("/")
  .post(uploadImage, uploadImageOnCloud, signUp)
  .patch(protect, uploadImage, uploadImageOnCloud, updateProfile)
  .get(protect, getProfile);
router.route("/login").post(login);
router.route("/:id").get(protect, getProfileById);

module.exports = router;
