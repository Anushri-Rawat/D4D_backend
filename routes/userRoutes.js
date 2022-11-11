const express = require("express");
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
  .post(signUp)
  .patch(protect, updateProfile)
  .get(protect, getProfile);
router.route("/login").post(login);
router.route("/:id").get(protect, getProfileById);

module.exports = router;
