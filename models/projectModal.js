const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      maxLength: 300,
    },
    required_skills: [String],
    video_url: String,
    images_url: [String],
    source_code_link: [String],
    deployed_link: String,
    project_start_date: Date,
    project_end_date: Date,
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    viewsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

projectSchema.virtual("likesCount", {
  ref: "User",
  localField: "likes",
  foreignField: "_id",
  count: true,
});

projectSchema.methods.isProjectLiked = function (userId) {
  return this.likes.some((user) => {
    return user._id.toString() === userId.toString();
  });
};

const Project = mongoose.model("Project", projectSchema);
module.exports = Project;
