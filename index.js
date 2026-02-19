import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import connectDatabase from "./config/database.js";
import registerationRoute from "./routes/register.js";
import loginRoute from "./routes/login.js";
import tasksRoute from "./routes/tasks.js";
import usersRoute from "./routes/users.js";
import profileRoute from "./routes/profile.js";
import tokenRoute from "./routes/token.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

//Middlewares
app.use(cors());
app.use(express.json());

//Routes
app.use("/api/register", registerationRoute);
app.use("/api/login", loginRoute);
app.use("/api/tasks", tasksRoute);
app.use("/api/users", usersRoute);
app.use("/api", profileRoute);
app.use("/api", tokenRoute);

app.get("/", (req, res) => {
  res.json({
    message: "Hello, World!",
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDatabase();

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
