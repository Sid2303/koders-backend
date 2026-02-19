import express from "express";
import Task from "../models/Task.js";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const { status, priority, assignedTo, deleted, sortBy, order } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (deleted !== undefined) filter.deleted = deleted === "true";

    if (user.role !== "admin" && user.role !== "manager") {
      filter.$or = [{ createdBy: req.user.id }, { assignedTo: req.user.id }];
    }

    const sortOrder = order === "desc" ? -1 : 1;
    const sortField = sortBy || "createdAt";

    const tasks = await Task.find(filter).sort({ [sortField]: sortOrder });

    res.status(200).json({
      tasks,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", auth, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json({ task });
  } catch (err) {
    next(err);
  }
});

router.post("/", auth, async (req, res, next) => {
  try {
    const { title, description, status, priority, assignedTo, dueDate, tags } =
      req.body;

    if (!title) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      assignedTo,
      createdBy: req.user.id,
      dueDate,
      tags,
    });

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", auth, async (req, res, next) => {
  try {
    const { title, description, status, priority, assignedTo, dueDate, tags } =
      req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (tags) task.tags = tags;

    await task.save();

    res.status(200).json({
      message: "Task updated successfully",
      task,
    });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.role !== "admin" && user.role !== "manager") {
      return res.status(403).json({
        message: "Access denied. Only admin or manager can delete tasks",
      });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { deleted: true },
      { new: true },
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json({
      message: "Task deleted successfully",
      task,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
