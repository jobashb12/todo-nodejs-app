const express = require("express");
const cors = require("cors");
const user = require("./routes/user");
const task = require("./routes/task");
const connection = require("./utils/db");
const cloudinary = require("cloudinary").v2;
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const app = express();
require("dotenv").config();

connection();
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    useTempFiles: true,
  }),
);
app.use("/api/v1/user", user);
app.use("/api/v1/task", task);

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
