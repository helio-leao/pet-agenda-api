import { Router } from "express";
import Pet from "../models/Pet";
import multer from "multer";
import Task from "../models/Task";
import { createPetSchema, updatePetSchema } from "../schemas/petSchema";
import transformPicture from "../utils/transformPicture";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

router.get("/:id/tasks", async (req, res) => {
  try {
    const tasks = await Task.find({ pet: req.params.id });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  const validation = createPetSchema.safeParse(req.body);
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

  const { name, type, breed, birthdate, user } = req.body;
  const newPet = new Pet({ name, type, breed, birthdate, user });

  try {
    await newPet.save();
    res.status(201).json(newPet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/:id", async (req, res) => {
  const validation = updatePetSchema.safeParse(req.body);
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
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      res.status(404).json({ error: "Pet not found" });
      return;
    }

    const { name, type, breed, birthdate } = req.body;
    if (name != undefined) pet.name = name;
    if (type != undefined) pet.type = type;
    if (breed != undefined) pet.breed = breed;
    if (birthdate != undefined) pet.birthdate = birthdate;

    const updated = await pet.save();
    res.json(transformPicture(updated));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      res.status(404).json({ error: "Pet not found" });
      return;
    }
    res.json(transformPicture(pet));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id/tasks", async (req, res) => {
  try {
    const tasks = await Task.find({ pet: req.params.id });
    res.json(tasks);
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
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      res.status(404).json({ error: "Pet not found" });
      return;
    }
    pet.picture.buffer = file.buffer;
    pet.picture.contentType = file.mimetype;
    const updated = await pet.save();

    res.json(transformPicture(updated));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
