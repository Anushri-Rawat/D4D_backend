const { Types } = require("mongoose");
const User = require("../models/userModal");
const Collection = require("../models/collectionModal");
const asyncHandler = require("express-async-handler");
const Project = require("../models/projectModal");

const getCollection = asyncHandler(async (req, res) => {
  const { collection_id } = req.params;
  const collection = await Collection.findById(Types.ObjectId(collection_id))
    .populate("project_id")
    .populate({
      path: "project_id",
      populate: {
        path: "user_id",
      },
    })
    .populate("developer_id");
  if (!collection) {
    res.status(404);
    throw new Error("collection not found");
  }
  res.status(200).json(collection);
});

const getAllCollections = asyncHandler(async (req, res) => {
  const collections = await Collection.find({ user_id: req.user._id });

  res.status(200).json(collections);
});

const createCollection = asyncHandler(async (req, res) => {
  const { name, type, projectId } = req.body;
  const collectionExists = await Collection.findOne({
    name,
    user_id: Types.ObjectId(req.user._id),
  });
  if (collectionExists) {
    res.status(400);
    throw new Error("Cannot use same collection name that already exists.");
  }
  let collection = {};
  if (projectId) {
    collection = await Collection.create({
      project_id: projectId,
      user_id: req.user._id,
      name,
      type,
    });
  } else {
    collection = await Collection.create({
      user_id: req.user._id,
      name,
      type,
    });
  }
  res.status(200).json(collection);
});

const deleteCollection = asyncHandler(async (req, res) => {
  const { collection_id } = req.params;
  const collection = await Collection.findById(collection_id);
  if (!collection) {
    res.status(404);
    throw new Error("Collection not found");
  }

  await Collection.findByIdAndDelete(collection_id);
  res.status(200).json({ id: collection_id });
});

const updateCollection = asyncHandler(async (req, res) => {
  const { collection_id } = req.params;
  const { name } = req.body;
  const collection = await Collection.findById(collection_id);

  if (!collection) {
    res.status(404);
    throw new Error("Collection not found");
  }

  if (collection.user_id.toString() === req.user._id.toString()) {
    const updatedCollection = await Collection.findByIdAndUpdate(
      collection_id,
      {
        name,
      },
      { returnDocument: "after" }
    );
    res.status(200).json(updatedCollection);
  } else {
    res.status(401);
    throw new Error("Only the author can update his collection");
  }
});

const saveProjectById = asyncHandler(async (req, res) => {
  const { id, collection_id } = req.params;

  const projectExists = await Collection.find({
    _id: Types.ObjectId(collection_id),
    project_id: Types.ObjectId(id),
  });

  if (projectExists.length) {
    throw new Error(`This project already exists in the collection`);
  }

  const coll = await Collection.findById(collection_id);
  if (coll.project_id.length === 0) {
    const project = await Project.findById(id);
    coll.image = project.images_url[0];
    await coll.save();
  }

  const collection = await Collection.findByIdAndUpdate(
    collection_id,
    {
      $push: {
        project_id: Types.ObjectId(id),
      },
    },
    { returnDocument: "after" }
  );

  res.status(200).json(collection);
});

const saveUserById = asyncHandler(async (req, res) => {
  const { id, collection_id } = req.params;

  const developerExists = await Collection.find({
    _id: Types.ObjectId(collection_id),
    developer_id: Types.ObjectId(id),
  });

  if (developerExists.length) {
    throw new Error(`This project already exists in the collection`);
  }

  const coll = await Collection.findById(collection_id);
  if (coll.developer_id.length === 0) {
    const developer = await User.findById(id);
    console.log(developer.profile_image);
    coll.image =
      developer.profile_image && developer.profile_image !== "null"
        ? developer.profile_image
        : "https://yt3.ggpht.com/a/AATXAJzoxYmGmHH2J6Y_mlxostAWeBrsWOZ0LuRx9Q=s900-c-k-c0xffffffff-no-rj-mo";
    await coll.save();
  }

  const collection = await Collection.findByIdAndUpdate(
    collection_id,
    {
      $push: {
        developer_id: Types.ObjectId(id),
      },
    },
    { returnDocument: "after" }
  );

  res.status(200).json(collection);
});

module.exports = {
  createCollection,
  saveProjectById,
  getAllCollections,
  getCollection,
  deleteCollection,
  updateCollection,
  saveUserById,
};
