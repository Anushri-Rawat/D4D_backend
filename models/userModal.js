const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const validateUrl = (val) => {
  urlRegex =
    /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;
  return urlRegex.test(val);
};

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
    },
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    profile_image: {
      type: String,
      validate: validateUrl,
    },
    city: String,
    state: String,
    country: String,
    title: String,
    description: {
      type: String,
      maxLength: 300,
    },
    skills: [String],
    linkedin_profile_link: {
      type: String,
      unique: true,
      validate: validateUrl,
    },
    github_profile_link: {
      type: String,
      unique: true,
      validate: validateUrl,
    },
  },
  { timestamps: true }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.virtual("full_name").get(function () {
  return `${this.first_name} ${this.last_name}`;
});

const User = mongoose.model("User", userSchema);
module.exports = User;
