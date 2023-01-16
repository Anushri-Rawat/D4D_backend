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
    });
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
  const { name, projectId } = req.body;
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
    });
  } else {
    collection = await Collection.create({
      user_id: req.user._id,
      name,
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

  const colExists = await Collection.find({
    _id: Types.ObjectId(collection_id),
    project_id: Types.ObjectId(id),
  });

  if (colExists.length) {
    throw new Error(`This project already exists in the collection`);
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

module.exports = {
  createCollection,
  saveProjectById,
  getAllCollections,
  getCollection,
  deleteCollection,
  updateCollection,
};
