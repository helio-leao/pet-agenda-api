import { Router } from "express";
import { NextFunction, Request, Response } from "express";
import User from "../models/User";
import Pet from "../models/Pet";
import Task from "../models/Task";
import { updateUserSchema } from "../schemas/userSchema";
import bcrypt from "bcrypt";
import authToken from "../middlewares/authToken";
import cloudinary from "../config/cloudinary";
import upload from "../middlewares/upload";

const router = Router();

router.patch("/:userId", authToken, checkUserOwnership, async (req, res) => {
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
    const user = await User.findById(req.params.userId);

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
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// issue: verify the need for user find. compare it to POST pet/:id/picture
router.post(
  "/:userId/picture",
  authToken,
  checkUserOwnership,
  upload.single("picture"),
  async (req, res) => {
    const { file } = req;

    if (!file) {
      res.status(400).json({ error: "No file provided" });
      return;
    }
    try {
      const user = await User.findById(req.params.userId);

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const result = await cloudinary.uploader.upload(file.path, {
        public_id: user._id.toString(),
        overwrite: true,
        resource_type: "image",
        folder: `pet_agenda/users_pictures`,
      });

      user.pictureUrl = result.secure_url;

      await user.save();
      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.get("/:userId", authToken, checkUserOwnership, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// pets
router.get("/:userId/pets", authToken, checkUserOwnership, async (req, res) => {
  try {
    const pets = await Pet.find({ user: req.params.userId });
    res.json(pets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// tasks
router.get(
  "/:userId/tasks",
  authToken,
  checkUserOwnership,
  async (req, res) => {
    try {
      const tasks = await Task.find({ user: req.params.userId })
        .populate({
          path: "pet",
          select: "name",
        })
        .sort({ dueDate: 1 });
      res.json(tasks);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// middlewares
function checkUserOwnership(req: Request, res: Response, next: NextFunction) {
  if (req.user?._id !== req.params.userId) {
    res.status(403).json({ error: "You can only access your own data" });
    return;
  }
  next();
}

export default router;
