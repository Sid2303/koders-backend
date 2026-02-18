import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

async function connectDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database Connected");
  } catch (error) {
    console.log("Database Connection failed:", error.message);
    process.exit(1);
  }
}

app.get("/", (req, res) => {
  res.json({
    message: "Hello, World!",
  });
});

app.post("/login", (req, res) => {
  const { username } = req.body;
  res.json({
    message: username,
  });
});

const PORT = process.env.PORT || 5000;
connectDatabase();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
