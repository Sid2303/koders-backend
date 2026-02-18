import express from "express";
import Task from "../models/Task.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const tasks = await Task.find();

    res.status(200).json({
      tasks,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
    });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json({ task });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
    });
  }
});

router.post("/", auth, async (req, res) => {
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
    console.error(err);
    res.status(500).json({
      message: "Server error",
    });
  }
});

router.put("/:id", auth, async (req, res) => {
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
    console.error(err);
    res.status(500).json({
      message: "Server error",
    });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
    });
  }
});

export default router;
