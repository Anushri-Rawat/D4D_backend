const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    project_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Project",
      required: true,
    },
    body: String,
    user_id: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    createdAt: Date,
    updatedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

commentSchema.virtual("user", {
  ref: "User",
  localField: "user_id",
  foreignField: "_id",
  justOne: true,
});

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
