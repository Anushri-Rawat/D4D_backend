const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema(
  {
    project_id: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Project",
      },
    ],
    developer_id: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    name: String,
    type: String,
    image: {
      type: String,
      default:
        "https://yt3.ggpht.com/a/AATXAJzoxYmGmHH2J6Y_mlxostAWeBrsWOZ0LuRx9Q=s900-c-k-c0xffffffff-no-rj-mo",
    },
    user_id: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

const Collection = mongoose.model("Collection", collectionSchema);
module.exports = Collection;
