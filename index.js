const express = require("express");
const mongoose = require("mongoose");
const app = express();
const multer = require("multer");
const multerS3 = require("multer-s3");
const AWS = require("aws-sdk");
require('dotenv').config();
const port = process.env.PORT || 8000;

// Middleware to parse JSON
app.use(express.json());
 
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// MongoDB connection string
const uri = process.env.MONGO_URI
  

mongoose
  .connect(uri)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// Define a schema and a model
const itemSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  images: String,
});

const Item = mongoose.model("Item", itemSchema);

// Basic CRUD routes

const s3 = new AWS.S3();

const upload = multer({
  storage: multerS3({
    s3,
    bucket: "awsecsamplebucket",
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + "-" + file.originalname);
    },
  }),
}).single("images");

// Create
app.post("/items", async (req, res) => {
  try {
    // Check if title is provided

    upload(req, res, async (err) => {
      // console.log("Loadbefore  :", req.file, req.body); 
      if (err) {
        console.log("Error uploading file:", err);
        return res.status(500).json({ message: "Error uploading file", err : err.message });
      }
      if (!req.file) {
        return res.status(400).json({ message: "No image file uploaded" });
      }

      const newItem = new Item({
        name: req.body.name,
        quantity: req.body.quantity,
        images: req.file.location,
      });
      console.log('newItem : ', newItem);
      const savedItem = await newItem.save();

      // Respond with success message and the created Proposal
      return res.status(201).json({
        success: true,
        message: "Item Created Successfully!",
        savedItem,
      });
    });
  } catch (error) {
    console.error("Error creating Item:", error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Read
app.get("/items", async (req, res) => {
  try {
    const items = await Item.find();
    res.status(200).send({
      success: true,
      totalItems : items.length,
      items,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      err,
    });
  }
});

app.get("/", (req, res) => {
  res.send("Welcome to AWS EC2  Deploy Server By Nilesh Deshmukh !! ");
});

app.listen(port, () => {
  console.log(`AWS EC2 Server running at http://localhost:${port}`);
});
