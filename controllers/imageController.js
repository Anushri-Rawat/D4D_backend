const fs = require("fs");
const multer = require("multer");
const cloudinary = require("cloudinary");

let fileName = "";
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images/userImages");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    fileName = `user-${Date.now()}.${ext}`;
    cb(null, fileName);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else cb(new Error("Please upload image type file", 400), false);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadImage = upload.array("image");
exports.uploadImageOnCloud = async (req, res, next) => {
  try {
    if (!req.file) return next();
    await cloudinary.v2.uploader.upload(
      `images/userImages/${fileName}`,
      { public_id: `${fileName}` },
      function (error, result) {
        if (error) {
          console.log(error);
          return next(error);
        }
        req.body.profile_image = result.url;
      }
    );
    fs.unlink(`images/userImages/${fileName}`, (error) => {
      if (error) return;
    });
    next();
  } catch (err) {
    console.log(err);
    next(err);
  }
};
