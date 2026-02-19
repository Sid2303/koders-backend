import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import registerationRoute from "./routes/register.js";
import loginRoute from "./routes/login.js";
import tasksRoute from "./routes/tasks.js";
import usersRoute from "./routes/users.js";
import profileRoute from "./routes/profile.js";
import tokenRoute from "./routes/token.js";
import forgotPasswordRoute from "./routes/forgotPassword.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: ["http://localhost:5173", process.env.FRONTEND_URL],
    credentials: true,
  }),
);
app.use(express.json());

const isTest = process.env.NODE_ENV === "test";

if (!isTest) {
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: { message: "Too many requests, please try again later" },
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: "Too many login attempts, please try again later" },
  });

  app.use("/api", generalLimiter);
  app.use("/api/register", authLimiter);
  app.use("/api/login", authLimiter);
  app.use("/api/forgot-password", authLimiter);
}

app.use("/api/register", registerationRoute);
app.use("/api/login", loginRoute);
app.use("/api/forgot-password", forgotPasswordRoute);
app.use("/api/tasks", tasksRoute);
app.use("/api/users", usersRoute);
app.use("/api", profileRoute);
app.use("/api", tokenRoute);

app.get("/", (req, res) => {
  res.json({ message: "Hello, World!" });
});

app.use(errorHandler);

export default app;
