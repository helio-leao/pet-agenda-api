import { Router } from "express";
import User from "../models/User";

const router = Router();

router.post("/", async (req, res) => {
  const { name, username, email } = req.body;

  const newUser = new User({
    name,
    username,
    email,
  });

  try {
    await newUser.save();
    res.status(201).json(newUser);
  } catch {
    res.sendStatus(400);
  }
});

router.post("/:id/picture", async (req, res) => {
  res.json({ message: "todo picture post" });
});

export default router;
