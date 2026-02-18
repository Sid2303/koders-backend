import express from "express";
import User from "../models/User.js";
import Task from "../models/Task.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, async (req, res, next) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      users,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", auth, async (req, res, next) => {
  try {
    const { username, email, role } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;

    await user.save();

    res.status(200).json({
      message: "User updated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", auth, async (req, res, next) => {
  try {
    const requestingUser = await User.findById(req.user.id);

    if (!requestingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (requestingUser.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Only admin can delete users",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await Task.deleteMany({ assignedTo: req.params.id });

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (err) {
    next(err);
  }
});

export default router;
