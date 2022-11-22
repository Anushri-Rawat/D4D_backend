const asyncHandler = require("express-async-handler");
const Comment = require("../models/CommentModal");
const Project = require("../models/projectModal");
const { Types } = require("mongoose");

const getAllProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ user_id: req.user._id })
    .populate("commentsCount")
    .populate("likesCount");
  if (projects.length <= 0) {
    res.status(400);
    throw new Error("No projects yet posted");
  } else {
    res.status(200).json(projects);
  }
});

const getProjectById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const project = await Project.findById(id).populate(
    "likesCount commentsCount"
  );
  if (!project) {
    res.status(400);
    throw new Error("Project not found");
  }
  res.status(200).json(project);
});

const createProject = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    required_skills,
    video_url,
    images_url,
    source_code_link,
    deployed_link,
    project_start_date,
    project_end_date,
  } = req.body;
  const projectExists = await Project.findOne({ name });

  if (projectExists) {
    res.status(400);
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
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const updateproject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    required_skills,
    video_url,
    images_url,
    source_code_link,
    deployed_link,
    project_start_date,
    project_end_date,
  } = req.body;
  const project = Project.findById(id);
  if (!project) {
    res.status(400);
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
    ).populate({ path: "user_id", select: "username,full_name" });
    res.status(200).send(updatedProject);
  }
});

const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const project = await Project.findById(id);
  if (!project) {
    res.status(400);
    throw new Error("Project not found");
  }
  if (req.user._id.toString() === project.user_id.toString()) {
    await Project.findByIdAndDelete(id);
    await Comment.deleteMany({ project_id: Types.ObjectId(id) });
  }
});
const likeProject = asyncHandler(async (req, res) => {
  const { project_id } = req.params;
  const project = await Project.findById(project_id);
  if (!project) {
    res.status(400);
    throw new Error("Project not found");
  }
  const isProjectLiked = project.isProjectLiked(req.user._id);
  let query = {};
  if (isProjectLiked) {
    query = { $pull: { likes: req.user._id } };
  } else {
    query = { $push: { likes: req.user._id } };
  }
  const updatedProject = await Project.findByIdAndUpdate(
    project_id,
    query
  ).populate("likesCount commentsCount");

  res.status(200).json(updatedProject);
});

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateproject,
  deleteProject,
  likeProject,
};
