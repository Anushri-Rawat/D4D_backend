const asyncHandler = require("express-async-handler");
const Message = require("../models/MessageModel");

exports.createMessage = asyncHandler(async (req, res, next) => {
  const { conversationId, text } = req.body;
  const senderId = req.user._id;
  const newMessage = await Message.create({ conversationId, senderId, text });

  if (newMessage) {
    res.status(201).json(newMessage);
    return;
  } else {
    res.status(500).json("message couldn't be created.");
  }
});

exports.getAllMessages = asyncHandler(async (req, res, next) => {
  const conversationId = req.params.conversationId;

  const messages = await Message.find({ conversationId });

  res.status(200).json(messages);
});
