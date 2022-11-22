const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const cloudinary = require("cloudinary");
const multer = require("multer");
const upload = multer();
const {
  notFoundHandler,
  errorHandler,
} = require("./middleware/errorMiddleware");
const userRouter = require("./routes/userRoutes");
const projectRouter = require("./routes/projectRoutes");
const commentRouter = require("./routes/commentRoutes");
require("dotenv").config();
const morgan = require("morgan");

connectDB();
const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "Content-Type",
    "Authorization"
  );
  next();
});
app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

app.use("/api/users", userRouter);
app.use("/api/project", projectRouter);
app.use("/api/comment", commentRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on prt ${port}`);
});
