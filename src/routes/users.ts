import { Router } from "express";
import User, { IUser } from "../models/User";
import multer from "multer";
import { Document } from "mongoose";
import { Types } from "mongoose";
import Pet, { IPet } from "../models/Pet";
import Task from "../models/Task";
import { createUserSchema, updateUserSchema } from "../schemas/userSchema";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

router.patch("/:id", async (req, res) => {
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
    if (password != undefined) user.password = password;
    // if (username != undefined) user.username = username;
    // if (email != undefined) user.email = email;

    const updated = await user.save();
    res.json(transformUserPicture(updated));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id/pets", async (req, res) => {
  try {
    const pets = await Pet.find({ user: req.params.id });
    res.json(pets.map(transformPetPicture));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id/tasks", async (req, res) => {
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

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username }).select("+password").exec();

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (password !== user.password) {
      res.status(401).json({ error: "Wrong password" });
      return;
    }

    const userObj = transformUserPicture(user);
    delete (userObj as any).password;

    res.json(userObj);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  const validation = createUserSchema.safeParse(req.body);
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

  const { name, username, password, email } = req.body;
  const newUser = new User({ name, username, password, email });

  try {
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/:id/picture", upload.single("picture"), async (req, res) => {
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

    res.status(200).json(transformUserPicture(updated));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(transformUserPicture(user));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

function transformUserPicture(
  user: Document<unknown, {}, IUser> &
    IUser & { _id: Types.ObjectId } & { __v: number }
) {
  const userObj = user.toObject();

  if (userObj.picture) {
    return {
      ...userObj,
      picture: user.picture
        ? `data:${
            user.picture.contentType
          };base64,${user.picture.buffer.toString("base64")}`
        : null,
    };
  } else {
    return userObj;
  }
}

function transformPetPicture(
  pet: Document<unknown, {}, IPet> &
    IPet & { _id: Types.ObjectId } & { __v: number }
) {
  const petObj = pet.toObject();

  if (petObj.picture) {
    return {
      ...petObj,
      picture: pet.picture
        ? `data:${pet.picture.contentType};base64,${pet.picture.buffer.toString(
            "base64"
          )}`
        : null,
    };
  } else {
    return petObj;
  }
}

export default router;
