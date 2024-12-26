import { Router } from "express";
import User from "../models/User";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

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

    user.picture.data = file.buffer;
    user.picture.contentType = file.mimetype;
    const updated = await user.save();
    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
