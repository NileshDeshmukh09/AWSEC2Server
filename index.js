const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = 8000;

// Middleware to parse JSON
app.use(express.json());

// MongoDB connection string
const uri =
  "mongodb+srv://nileshdeshmukh0908:Nilesh@cluster0.lyge7ft.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(uri)
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.log(err));

// Define a schema and a model
const itemSchema = new mongoose.Schema({
  name: String, 
  quantity: Number,
});

const Item = mongoose.model("Item", itemSchema);

// Basic CRUD routes

// Create
app.post("/items", async (req, res) => {
  const newItem = new Item(req.body);
  try {
    const savedItem = await newItem.save();
    res.status(201).send(savedItem);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Read
app.get("/items", async (req, res) => {
  try {
    const items = await Item.find();
    res.status(200).send({
      success: true,
      items,
    });
  } catch (err) {
    res.status(500).send({
        success : false,
        err});
  }
});

app.get("/", (req, res) => {
  res.send("Welcome to AWS EC2  Deploy Server By Nilesh Deshmukh !! ");
}); 

app.listen(port, () => {
  console.log(`AWS EC2 Server running at http://localhost:${port}`);
});
