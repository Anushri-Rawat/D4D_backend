const asyncHandler = require("express-async-handler");
const Comment = require("../models/CommentModal");
const Project = require("../models/projectModal");
const User = require("../models/userModal");
const { Types } = require("mongoose");

const getAllProjects = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const projects = await Project.find({ user_id: id })
    .populate("likesCount")
    .populate({ path: "user_id", select: "username full_name profile_image" });
  if (projects.length <= 0) {
    res.status(400);
    throw new Error("No projects yet posted");
  } else {
    res.status(200).json(projects);
  }
});

const getMostLikedProjects = asyncHandler(async (req, res) => {
  const projects = await Project.aggregate([
    {
      $match: {},
    },
    {
      $lookup: {
        from: "users",
        localField: "user_id",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $group: {
        _id: "$_id",
        doc: { $first: "$$ROOT" },
        totalLikes: {
          $sum: {
            $size: "$likes",
          },
        },
      },
    },

    {
      $sort: {
        totalLikes: -1,
      },
    },

    {
      $limit: 4,
    },
    { $replaceRoot: { newRoot: "$doc" } },
  ]);

  res.status(200).json(projects);
});

const getMostViewedProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({})
    .sort({ viewsCount: -1 })
    .limit(4)
    .populate({
      path: "user_id",
      select: "username first_name last_name profile_image",
    })
    .populate("likesCount");
  res.status(200).json(projects);
});

const getProjectById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const project = await Project.findById(id)
    .populate("likesCount")
    .populate("user_id");
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  // if (!(project.user_id._id.toString() === req.user._id.toString())) {
  //   project.viewsCount += 1;
  //   project.save();
  // }
  res.status(200).json(project);
});

const createProject = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    video_url,
    images_url,
    required_skills,
    source_code_link,
    deployed_link,
    project_start_date,
    project_end_date,
  } = req.body;
  const projectExists = await Project.findOne({ name });

  if (projectExists) {
    res.status(404);
    throw new Error(
      "Project already exists! Please edit the same project or try different project name"
    );
  }
  const project = await Project.create({
    user_id: req.user._id,
    name,
    description,
    required_skills,
    video_url,
    images_url,
    source_code_link,
    deployed_link,
    project_start_date,
    project_end_date,
  });
  if (project) {
    res.status(201).json(project);
  } else {
    res.status(404);
    throw new Error("Invalid user data");
  }
});

const updateproject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    video_url,
    images_url,
    required_skills,
    source_code_link,
    deployed_link,
    project_start_date,
    project_end_date,
  } = req.body;
  console.log(req.body);
  const project = await Project.findById(id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  if (req.user._id.toString() == project.user_id.toString()) {
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      {
        user_id: req.user._id,
        name,
        description,
        required_skills,
        video_url,
        images_url,
        source_code_link,
        deployed_link,
        project_start_date,
        project_end_date,
      },
      { returnDocument: "after" }
    ).populate({
      path: "user_id",
      select: "username first_name last_name profile_image",
    });
    res.status(200).send(updatedProject);
  }
});

const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const project = await Project.findById(id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  if (req.user._id.toString() === project.user_id.toString()) {
    await Project.findByIdAndDelete(id);
    await Comment.deleteMany({ project_id: Types.ObjectId(id) });
    res.status(200).json({ id });
  } else {
    res.status(401);
    throw new Error(`Only the author of projects can delete the project`);
  }
});

const likeProject = asyncHandler(async (req, res) => {
  const { project_id } = req.params;
  console.log(project_id);

  const project = await Project.findById(project_id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  const isProjectLiked = project.isProjectLiked(req.user._id);
  let query = {};
  if (isProjectLiked) {
    query = { $pull: { likes: req.user._id } };
  } else {
    query = { $push: { likes: req.user._id } };
  }
  const updatedProject = await Project.findByIdAndUpdate(project_id, query)
    .populate("likesCount")
    .populate({
      path: "user_id",
      select: "username first_name last_name profile_image",
    });

  res.status(200).json(updatedProject);
});

module.exports = {
  getAllProjects,
  getMostLikedProjects,
  getMostViewedProjects,
  getProjectById,
  createProject,
  updateproject,
  deleteProject,
  likeProject,
};
