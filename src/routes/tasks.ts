import { Router } from "express";
import { NextFunction, Request, Response } from "express";
import Task from "../models/Task";
import { createTaskSchema, updateTaskSchema } from "../schemas/taskSchema";
import authToken from "../middlewares/authToken";
import nextDate from "../utils/nextDate";

const router = Router();

router.post("/", authToken, async (req, res) => {
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

  // note: compare this to pet weight records verification
  if (req.user._id !== req.body.user) {
    res.status(403).json({ error: "You can only create tasks for yourself" });
    return;
  }

  const { title, description, date, user, pet, interval, intervalUnit } =
    req.body;
  const newTask = new Task({
    title,
    description,
    date,
    user,
    pet,
    interval,
    intervalUnit,
  });

  try {
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/:id", authToken, checkOwnership, async (req, res) => {
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
    const { title, description, date, interval, intervalUnit } = req.body;
    if (title != undefined) req.task.title = title;
    if (description != undefined) req.task.description = description;
    if (date != undefined) req.task.date = date;
    if (interval !== undefined) req.task.interval = interval;
    if (intervalUnit !== undefined) req.task.intervalUnit = intervalUnit;

    const updated = await req.task.save();
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post(
  "/:id/pushDoneDate",
  authToken,
  checkOwnership,
  async (req, res) => {
    try {
      const { date } = req.body;

      if (!date || isNaN(Date.parse(date))) {
        res.status(400).json({ error: "Invalid date format" });
        return;
      }

      req.task.history.push(date);
      req.task.date = nextDate(
        req.task.interval,
        req.task.intervalUnit,
        new Date(date)
      );

      const updated = await req.task.save();
      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.get("/:id", authToken, checkOwnership, async (req, res) => {
  try {
    res.json(req.task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

async function checkOwnership(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    if (req.user._id !== task.user.toString()) {
      res.status(403).json({ error: "You can only access your own tasks" });
      return;
    }
    req.task = task;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export default router;
