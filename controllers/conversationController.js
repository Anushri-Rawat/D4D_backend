const asyncHandler = require("express-async-handler");
const Conversation = require("../models/ConversationModel");

exports.createConversation = asyncHandler(async (req, res, next) => {
  let conversation = await Conversation.findOne({
    $or: [
      { member1_id: req.user._id, member2_id: req.body.member2_id },
      { member2_id: req.user._id, member1_id: req.body.member2_id },
    ],
  });
  if (conversation) {
    res.status(200).json(conversation);
    return;
  }
  conversation = await Conversation.create({
    member1_id: req.user._id,
    member2_id: req.body.member2_id,
  });
  if (conversation) {
    res.status(201).json(conversation);
    return;
  } else {
    res.status(500).json("Conversation couldn't be created");
  }
});

exports.getConversationsById = asyncHandler(async (req, res, next) => {
  const id = req.user._id;
  const conversations = await Conversation.find({
    $or: [{ member1_id: id }, { member2_id: id }],
  })
    .populate({
      path: "member1_id",
      select: "first_name last_name profile_image",
    })
    .populate({
      path: "member2_id",
      select: "first_name last_name profile_image",
    });
  res.status(200).json(conversations);
});
