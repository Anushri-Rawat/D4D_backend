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

async function uploadToCloudinary(locaFilePath) {
  var mainFolderName = "main";

  var filePathOnCloudinary = mainFolderName + "/" + locaFilePath;

  return cloudinary.uploader
    .upload(locaFilePath, { public_id: filePathOnCloudinary })
    .then((result) => {
      fs.unlinkSync(locaFilePath);

      return {
        message: "Success",
        url: result.url,
      };
    })
    .catch((error) => {
      fs.unlinkSync(locaFilePath);
      return { message: "Fail" };
    });
}

exports.uploadMultipleImagesOnCloud = async (req, res, next) => {
  try {
    if (!req.files) return next();
    const files = req.files;
    const urls = [];
    const promises = [];

    var imageUrlList = [];

    for (var i = 0; i < req.files.length; i++) {
      var locaFilePath = req.files[i].path;

      var result = await uploadToCloudinary(locaFilePath);
      imageUrlList.push(result.url);
    }

    req.body["images_url"] = imageUrlList;

    next();
  } catch (err) {
    next(err);
  }
};
