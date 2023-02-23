const express = require("express");
const {
  createCollection,
  getAllCollections,
  getCollection,
  updateCollection,
  deleteCollection,
  saveProjectById,
  saveUserById,
} = require("../controllers/collectionController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.use(protect);
router.route("/").post(createCollection).get(getAllCollections);

router
  .route("/:collection_id")
  .get(getCollection)
  .patch(updateCollection)
  .delete(deleteCollection);

router.route("/:id/:collection_id").post(saveProjectById);
router.route("/user/:id/:collection_id").post(saveUserById);

module.exports = router;
