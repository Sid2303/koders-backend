import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDatabase from "./config/database.js";
import registerationRoute from "./routes/register.js";
import loginRoute from "./routes/login.js";
import tasksRoute from "./routes/tasks.js";
import usersRoute from "./routes/users.js";
import profileRoute from "./routes/profile.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

//Middlewares
app.use(cors());
app.use(express.json());
app.use(errorHandler);

//Routes
app.use("/api/register", registerationRoute);
app.use("/api/login", loginRoute);
app.use("/api/tasks", tasksRoute);
app.use("/api/users", usersRoute);
app.use("/api", profileRoute);

app.get("/", (req, res) => {
  res.json({
    message: "Hello, World!",
  });
});

const PORT = process.env.PORT || 5000;
connectDatabase();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
