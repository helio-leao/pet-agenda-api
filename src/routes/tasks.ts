import { Router } from "express";
import Task from "../models/Task";
import { createTaskSchema, updateTaskSchema } from "../schemas/taskSchema";

const router = Router();

router.post("/", async (req, res) => {
  const validation = createTaskSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({
      error: "Validation Error",
      details: validation.error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      })),
    });
    return;
  }

  const { title, description, date, status, user, pet } = req.body;
  const newTask = new Task({ title, description, date, status, user, pet });

  try {
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/:id", async (req, res) => {
  const validation = updateTaskSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({
      error: "Validation Error",
      details: validation.error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      })),
    });
    return;
  }

  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    const { title, description, date, status, pet } = req.body;
    if (title != undefined) task.title = title;
    if (description != undefined) task.description = description;
    if (date != undefined) task.date = date;
    if (status != undefined) task.status = status;
    if (pet != undefined) task.pet = pet;

    const updated = await task.save();
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
