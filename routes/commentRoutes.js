const express = require("express");
const {
  createComment,
  getComment,
  deleteComment,
  updateComment,
  createReply,
} = require("../controllers/commentController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.route("/:project_id").post(protect, createComment).get(getComment);
router.route("/reply/:comment_id").post(protect, createReply);
router
  .route("/:comment_id")
  .delete(protect, deleteComment)
  .patch(protect, updateComment);

module.exports = router;
