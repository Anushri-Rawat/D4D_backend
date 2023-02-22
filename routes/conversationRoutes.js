const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createConversation,
  getConversationsById,
} = require("./../controllers/conversationController");
router
  .route("/")
  .post(protect, createConversation)
  .get(protect, getConversationsById);

module.exports = router;
