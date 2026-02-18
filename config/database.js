import mongoose from "mongoose";

export default async function connectDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database Connected");
  } catch (error) {
    console.log("Database Connection failed:", error.message);
    process.exit(1);
  }
}
