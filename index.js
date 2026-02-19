import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import connectDatabase from "./config/database.js";
import app from "./app.js";

dotenv.config();

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
connectDatabase();

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
