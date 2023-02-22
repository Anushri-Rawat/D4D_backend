const express = require("express");
const {
  createMessage,
  getAllMessages,
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.route("/").post(protect, createMessage);
router.route("/:conversationId").get(getAllMessages);

module.exports = router;
