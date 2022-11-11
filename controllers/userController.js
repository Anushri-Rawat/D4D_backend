const asyncHandler = require("express-async-handler");
const User = require("../models/userModal");
const generateToken = require("../utils/generateToken");

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid email or password");
  }
});

const signUp = asyncHandler(async (req, res, next) => {
  const { first_name, last_name, email, password } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists! Please login");
  }
  const user = await User.create({ first_name, last_name, email, password });
  if (user) {
    res.json({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const updateProfile = asyncHandler(async (req, res) => {
  const userExists = await User.findById(req.user._id);
  if (userExists) {
    const {
      city,
      country,
      state,
      profile_image,
      linked_profile_link,
      github_profile_link,
      description,
      skills,
      title,
    } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        city,
        country,
        state,
        profile_image,
        linked_profile_link,
        github_profile_link,
        description,
        skills,
        title,
      },
      { returnDocument: "after" }
    );
    if (user) {
      res.status(200).json({
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        city: user.city,
        state: user.state,
        country: user.country,
        skills: user.skills,
        title: user.title,
        description: user.description,
        linked_profile_link: user.linked_profile_link,
        github_profile_link: user.github_profile_link,
        profile_image: user.profile_image,
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.status(200).json({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      city: user.city,
      state: user.state,
      country: user.country,
      skills: user.skills,
      title: user.title,
      description: user.description,
      linked_profile_link: user.linked_profile_link,
      github_profile_link: user.github_profile_link,
      profile_image: user.profile_image,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const getProfileById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const user = await User.findById(id);
  if (user) {
    res.status(200).json({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      city: user.city,
      state: user.state,
      country: user.country,
      skills: user.skills,
      title: user.title,
      description: user.description,
      linked_profile_link: user.linked_profile_link,
      github_profile_link: user.github_profile_link,
      profile_image: user.profile_image,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

module.exports = { login, signUp, updateProfile, getProfile, getProfileById };
