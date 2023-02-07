const express = require("express");
const {
  upload,
  uploadImageOnCloud,
} = require("../controllers/imageController");
const {
  signUp,
  login,
  updateProfile,
  getProfile,
  getProfileById,
  getProfiles,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router
  .route("/")
  .post(upload.single("profile_image"), uploadImageOnCloud, signUp)
  .patch(
    protect,
    upload.single("profile_image"),
    uploadImageOnCloud,
    updateProfile
  )
  .get(protect, getProfile);
router.route("/login").post(login);
router.route("/search").get(getProfiles);
router.route("/:id").get(protect, getProfileById);

module.exports = router;
