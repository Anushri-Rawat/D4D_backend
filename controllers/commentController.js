const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const { Types } = require("mongoose");
const Project = require("../models/projectModal");
const Comment = require("../models/CommentModal");

const createComment = asyncHandler(async (req, res) => {
  const { project_id } = req.params;
  const { body } = req.body;
  const project = await Project.findById(project_id);
  if (!project) {
    res.status(400);
    throw new Error("Project not found");
    return;
  }
  const commentExists = await Comment.findOne({
    project_id,
    user_id: Types.ObjectId(req.user._id),
  });
  if (commentExists) {
    res.status(400);
    throw new Error(
      "User Comment already exists.Please upldate your comment only."
    );
    return;
  }
  const comment = await Comment.create({
    project_id,
    user_id: req.user._id,
    body,
    createdAt: Date.now(),
  });
  await comment.populate({
    path: "user_id",
    select: "username first_name last_name profile_image",
  });
  await Project.findByIdAndUpdate(project_id, {
    $push: { comments: comment._id },
  });
  res.status(200).json(comment);
});

const getComment = asyncHandler(async (req, res) => {
  const project_id = req.params.project_id.trim();
  const project = await Project.findById(Types.ObjectId(project_id));
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
    return;
  }
  const comments = await Comment.find({ project_id })
    .populate({
      path: "user_id",
      select: "username first_name last_name profile_image title",
    })
    .populate({
      path: "replies",
      populate: {
        path: "user_id",
        select: "username first_name last_name profile_image",
      },
    })
    .sort({ createdAt: -1 });
  await Project.findByIdAndUpdate(
    project_id,
    {
      $push: {
        comments: comments._id,
      },
    },
    { returnDocument: "after" }
  );
  const commentAgg = await Comment.aggregate([
    {
      $match: {
        project_id: Types.ObjectId(project_id),
      },
    },
    {
      $group: {
        _id: "$project_id",
        count: { $sum: 1 },
      },
    },
  ]);
  if (commentAgg.length == 0) {
    res.status(200).json({ comments: [] });
    return;
  } else {
    res.status(200).json({ comments, commentsCount: commentAgg[0].count });
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  const { comment_id } = req.params;
  const comment = await Comment.findById(comment_id);
  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
    return;
  }
  const project = await Project.findById(comment.project_id);
  const projectAuthorId = project.user_id;
  const commentAuthorId = comment.user_id;

  if (
    req.user._id.toString() === commentAuthorId.toString() ||
    req.user._id.toString() === projectAuthorId.toString()
  ) {
    await Comment.findByIdAndDelete(comment_id);
    await Project.updateOne(
      { comments: comment_id },
      {
        $pull: {
          comments: Types.ObjectId(comment_id),
        },
      },
      { returnDocument: "after" }
    );
    res.status(200).json({ id: comment_id });
    return;
  } else {
    res.status(401);
    throw new Error(
      `Only the author of the comment or owner can delete comments`
    );
    return;
  }
});

const updateComment = asyncHandler(async (req, res) => {
  const { comment_id } = req.params;
  const { body } = req.body;
  const comment = await Comment.findById(comment_id);
  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
    return;
  }
  if (req.user._id.toString() === comment.user_id.toString()) {
    const updatedComment = await Comment.findByIdAndUpdate(
      comment_id,
      {
        body,
        updatedAt: Date.now(),
        isEdited: true,
      },
      { returnDocument: "after" }
    ).populate({
      path: "user_id",
      select: "username first_name last_name profile_image",
    });
    res.status(200).json(updatedComment);
    return;
  } else {
    res.status(401);
    throw new Error("Only the author can update his comment");
    return;
  }
});

const createReply = asyncHandler(async (req, res) => {
  const { comment_id } = req.params;
  const { body } = req.body;
  const comment = await Comment.findById(comment_id);
  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
    return;
  }

  const createdComment = await Comment.findByIdAndUpdate(
    comment_id,
    {
      $push: {
        replies: { user_id: req.user._id, body },
      },
    },
    { returnDocument: "after" }
  );

  await createdComment.populate({
    path: "user_id",
    select: "username first_name last_name profile_image",
  });

  await createdComment.populate({
    path: "replies",
    populate: {
      path: "user_id",
      select: "username first_name last_name profile_image",
    },
  });

  res.status(200).json(createdComment);
  return;
});

module.exports = {
  createComment,
  getComment,
  updateComment,
  deleteComment,
  createReply,
};
