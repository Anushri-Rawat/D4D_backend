const asyncHandler = require("express-async-handler");
const User = require("../models/userModal");
const generateToken = require("../utils/generateToken");
const url = require("url");

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.status(201).json({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      full_name: user.full_name,
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
  console.log(user);
  if (user) {
    res.status(201).json({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      full_name: user.full_name,
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
      username,
      city,
      country,
      state,
      profile_image,
      linkedin_profile_link,
      github_profile_link,
      description,
      skills,
      title,
    } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        username,
        city,
        country,
        state,
        profile_image,
        linkedin_profile_link,
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
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        full_name: user.full_name,
        email: user.email,
        city: user.city,
        state: user.state,
        country: user.country,
        skills: user.skills,
        title: user.title,
        description: user.description,
        linkedin_profile_link: user.linkedin_profile_link,
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

//GET MY PROFILE (BY ID OF LOGGED IN USER)
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.status(200).json({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      full_name: user.full_name,
      username: user.username,
      email: user.email,
      city: user.city,
      state: user.state,
      country: user.country,
      skills: user.skills,
      title: user.title,
      description: user.description,
      linkedin_profile_link: user.linkedin_profile_link,
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
      full_name: user.full_name,
      email: user.email,
      city: user.city,
      state: user.state,
      country: user.country,
      username: user.username,
      skills: user.skills,
      title: user.title,
      description: user.description,
      linkedin_profile_link: user.linkedin_profile_link,
      github_profile_link: user.github_profile_link,
      profile_image: user.profile_image,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});
//FIND PROFILE BY TITLE/NAME/SKILLS
const getProfiles = asyncHandler(async (req, res) => {
  const { query } = url.parse(req.url, true);
  const fields = ["full_name", "title", "skills", "page_number"];

  for (let key in query) {
    if (!fields.includes(key)) {
      res.status(400);
      throw new Error(`The parameter ${key} is not supported for searching.`);
    }
  }
  const profiles = await User.aggregate([
    {
      $addFields: {
        nameFilter: {
          $concat: ["$first_name", " ", "$last_name"],
        },
      },
    },
    {
      $match: {
        nameFilter: {
          $regex: query.full_name ? query.full_name : "",
          $options: "i",
        },
        title: {
          $regex: query.title ? query.title : "",
          $options: "i",
        },
        skills: {
          $regex: query.skills ? query.skills : "",
          $options: "i",
        },
      },
    },
    {
      $project: {
        __v: 0,
        password: 0,
        nameFilter: 0,
      },
    },
  ]);

  const total = profiles.length;
  const result = profiles.slice(
    12 * (query.page_number - 1),
    Math.min(query.page_number * 12, total)
  );

  res.status(200).json({
    total,
    profiles: result,
  });
});

module.exports = {
  login,
  signUp,
  updateProfile,
  getProfile,
  getProfileById,
  getProfiles,
};
