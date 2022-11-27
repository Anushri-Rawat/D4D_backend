const express = require("express");
const {
  createComment,
  getComment,
  deleteComment,
  updateComment,
} = require("../controllers/commentController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.use(protect);
router.route("/:project_id").post(createComment).get(getComment);
router.route("/:comment_id").delete(deleteComment).patch(updateComment);

module.exports = router;
