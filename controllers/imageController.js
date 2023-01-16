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
  if (file.mimetype.startsWith("image") || file.mimetype.startsWith("video")) {
    cb(null, true);
  } else cb(new Error("Please upload image/video type file", 400), false);
};

exports.upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

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

exports.uploadVideoOnCloud = async (req, res, next) => {
  if (!req.file) return next();
  if (req.file.fieldname === "video_url") {
    const file = req.file;
    await cloudinary.v2.uploader.upload(
      file.path,
      {
        resource_type: "video",
        public_id: `${fileName}`,
      },
      function (error, result) {
        if (error) {
          console.log(error);
          return next(error);
        }
        req.body["video_url"] = result.url;
      }
    );
    fs.unlink(`images/userImages/${fileName}`, (error) => {
      if (error) return;
    });
    next();
  } else next();
};

exports.uploadMultipleImagesOnCloud = async (req, res, next) => {
  try {
    if (!req.files) return next();
    const files = req.files;
    const urls = [];
    for (const file of files) {
      const { path } = file;
      await cloudinary.v2.uploader.upload(
        path,
        { public_id: `${fileName}` },
        function (error, result) {
          if (error) {
            console.log(error);
            return next(error);
          }
          urls.push(result.url);
        }
      );
    }
    req.body["images_url"] = urls;
    for (const file of req.files) {
      fs.unlink(`images/userImages/${file.fileName}`, (error) => {
        if (error) return;
      });
    }
    next();
  } catch (err) {
    console.log(err);
    next(err);
  }
};
