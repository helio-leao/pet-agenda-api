import { Router } from "express";
import { NextFunction, Request, Response } from "express";
import User from "../models/User";
import multer from "multer";
import Pet from "../models/Pet";
import Task from "../models/Task";
import { updateUserSchema } from "../schemas/userSchema";
import transformPicture from "../utils/transformPicture";
import bcrypt from "bcrypt";
import authToken from "../middlewares/authToken";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

router.patch("/:id", authToken, checkOwnership, async (req, res) => {
  const validation = updateUserSchema.safeParse(req.body);
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
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const { name, password, username, email } = req.body;
    if (name != undefined) user.name = name;
    if (password != undefined) user.password = await bcrypt.hash(password, 10);
    // if (username != undefined) user.username = username;
    // if (email != undefined) user.email = email;

    const updated = await user.save();
    res.json(transformPicture(updated));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id/pets", authToken, checkOwnership, async (req, res) => {
  try {
    const pets = await Pet.find({ user: req.params.id });
    res.json(pets.map(transformPicture));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id/tasks", authToken, checkOwnership, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.params.id }).populate({
      path: "pet",
      select: "name",
    });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post(
  "/:id/picture",
  authToken,
  checkOwnership,
  upload.single("picture"),
  async (req, res) => {
    const { file } = req;

    if (!file) {
      res.status(400).json({ error: "No file provided" });
      return;
    }
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      user.picture.buffer = file.buffer;
      user.picture.contentType = file.mimetype;
      const updated = await user.save();

      res.json(transformPicture(updated));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.get("/:id", authToken, checkOwnership, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(transformPicture(user));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

function checkOwnership(req: Request, res: Response, next: NextFunction) {
  if (req.user?._id !== req.params.id) {
    res.status(403).json({ error: "You can only access your own data" });
    return;
  }
  next();
}

export default router;
