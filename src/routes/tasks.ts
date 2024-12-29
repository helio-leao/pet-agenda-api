import { Router } from "express";
import Task from "../models/Task";

const router = Router();

router.post("/", async (req, res) => {
  const { title, description, date, status, user, pet } = req.body;

  const newTask = new Task({
    title,
    description,
    date,
    status,
    user,
    pet,
  });

  try {
    await newTask.save();
    res.status(201).json(newTask);
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
