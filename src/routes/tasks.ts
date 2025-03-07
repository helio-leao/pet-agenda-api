import { Router } from "express";
import { NextFunction, Request, Response } from "express";
import Task from "../models/Task";
import { createTaskSchema, updateTaskSchema } from "../schemas/taskSchema";
import authToken from "../middlewares/authToken";
import nextDate from "../utils/nextDate";
import Pet from "../models/Pet";
import {
  createTaskDoneRecordSchema,
  updateTaskDoneRecordSchema,
} from "../schemas/taskDoneRecordSchema";
import TaskDoneRecord from "../models/TaskDoneRecord";
import mongoose from "mongoose";

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

  try {
    // verify user ownership
    if (req.user?._id !== req.body.user) {
      res.status(403).json({ error: "You can only create tasks for yourself" });
      return;
    }

    // verify pet ownership
    const searchedPet = await Pet.findById(req.body.pet);

    if (!searchedPet) {
      res.status(404).json({ error: "Pet not found" });
      return;
    }
    if (req.user?._id !== searchedPet.user.toString()) {
      res
        .status(403)
        .json({ error: "You can only create tasks for your own pets" });
      return;
    }

    // creates new task
    const { title, description, dueDate, user, pet, interval } = req.body;
    const newTask = new Task({
      title,
      description,
      dueDate,
      user,
      pet,
      interval,
    });

    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/:taskId", authToken, checkTaskOwnership, async (req, res) => {
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

  const { title, description, dueDate, interval } = req.body;
  if (title != undefined) req.task.title = title;
  if (description != undefined) req.task.description = description;
  if (dueDate != undefined) req.task.dueDate = dueDate;
  if (interval !== undefined) req.task.interval = interval;

  try {
    const updated = await req.task.save();
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:taskId", authToken, checkTaskOwnership, async (req, res) => {
  try {
    await req.task.populate("pet");
    res.json(req.task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:taskId", authToken, checkTaskOwnership, async (req, res) => {
  const { task } = req;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    await task.deleteOne({ session });
    await TaskDoneRecord.deleteMany({ task: task._id }, { session });
    await session.commitTransaction();
    res.sendStatus(204);
  } catch (error) {
    session.abortTransaction();
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    session.endSession();
  }
});

// task done records
router.post(
  "/:taskId/done-records",
  authToken,
  checkTaskOwnership,
  async (req, res) => {
    const validation = createTaskDoneRecordSchema.safeParse(req.body);
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

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const { date, task } = req.body;
      const newTaskDoneRecord = new TaskDoneRecord({
        date,
        task,
      });
      await newTaskDoneRecord.save({ session });

      // update dueDate on task document
      req.task.dueDate = nextDate(
        req.task.interval.value,
        req.task.interval.unit,
        date
      );
      await req.task.save({ session });

      await session.commitTransaction();
      res.json(newTaskDoneRecord);
    } catch (error) {
      console.error(error);
      await session.abortTransaction();
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      session.endSession();
    }
  }
);

// note: update done record does not update task dueDate
router.patch(
  "/:taskId/done-records/:doneRecordId",
  authToken,
  checkTaskOwnership,
  checkTaskDoneRecordOwnership,
  async (req, res) => {
    const validation = updateTaskDoneRecordSchema.safeParse(req.body);
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
      const { date } = req.body;

      if (date) req.taskDoneRecord.date = date;

      const updated = await req.taskDoneRecord.save();
      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.delete(
  "/:taskId/done-records/:doneRecordId",
  authToken,
  checkTaskOwnership,
  checkTaskDoneRecordOwnership,
  async (req, res) => {
    try {
      await req.taskDoneRecord.deleteOne();
      res.sendStatus(204);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.get(
  "/:taskId/done-records",
  authToken,
  checkTaskOwnership,
  async (req, res) => {
    try {
      const doneRecords = await TaskDoneRecord.find({
        task: req.params.taskId,
      }).sort({ dueDate: -1 });
      res.json(doneRecords);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.get(
  "/:taskId/done-records/:doneRecordId",
  authToken,
  checkTaskOwnership,
  checkTaskDoneRecordOwnership,
  async (req, res) => {
    try {
      // issue: req already has a task on it. populate is redundant...
      await req.taskDoneRecord.populate("task");
      res.json(req.taskDoneRecord);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// middlewares
async function checkTaskOwnership(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    if (req.user?._id !== task.user.toString()) {
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

async function checkTaskDoneRecordOwnership(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const doneRecord = await TaskDoneRecord.findById(req.params.doneRecordId);

    if (!doneRecord) {
      res.status(404).json({ error: "Record not found" });
      return;
    }
    if (req.params.taskId !== doneRecord.task.toString()) {
      res.status(403).json({ error: "You can only access your own records" });
      return;
    }
    req.taskDoneRecord = doneRecord;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export default router;
