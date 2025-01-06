import { Router } from "express";
import { NextFunction, Request, Response } from "express";
import Pet from "../models/Pet";
import multer from "multer";
import Task from "../models/Task";
import { createPetSchema, updatePetSchema } from "../schemas/petSchema";
import {
  createPetWeightRecordSchema,
  updatePetWeightRecordSchema,
} from "../schemas/petWeightRecordSchema";
import transformPicture from "../utils/transformPicture";
import authToken from "../middlewares/authToken";
import PetWeightRecord from "../models/PetWeightRecord";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

router.post("/", authToken, async (req, res) => {
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

  if (req.user._id !== user) {
    res.status(403).json({ error: "You can only create pets for yourself" });
    return;
  }

  try {
    await newPet.save();
    res.status(201).json(newPet);
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
      req.pet.picture.buffer = file.buffer;
      req.pet.picture.contentType = file.mimetype;
      const updated = await req.pet.save();
      res.json(transformPicture(updated));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.patch("/:id", authToken, checkOwnership, async (req, res) => {
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
    const { name, type, breed, birthdate } = req.body;
    if (name != undefined) req.pet.name = name;
    if (type != undefined) req.pet.type = type;
    if (breed != undefined) req.pet.breed = breed;
    if (birthdate != undefined) req.pet.birthdate = birthdate;

    const updated = await req.pet.save();
    res.json(transformPicture(updated));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", authToken, checkOwnership, async (req, res) => {
  try {
    res.json(transformPicture(req.pet));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// tasks
router.get("/:id/tasks", authToken, checkOwnership, async (req, res) => {
  try {
    const tasks = await Task.find({ pet: req.params.id });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// pet weight records
router.get(
  "/:id/petWeightRecords/latest",
  authToken,
  checkOwnership,
  async (req, res) => {
    try {
      const petWeightRecord = await PetWeightRecord.findOne().sort({
        date: -1,
      });
      res.json(petWeightRecord);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.get(
  "/:id/petWeightRecords",
  authToken,
  checkOwnership,
  async (req, res) => {
    try {
      const petWeightRecords = await PetWeightRecord.find({
        pet: req.params.id,
      }).sort({ date: -1 });
      res.json(petWeightRecords);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.post(
  "/:id/petWeightRecords",
  authToken,
  checkOwnership,
  async (req, res) => {
    const validation = createPetWeightRecordSchema.safeParse(req.body);
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

    const { value, date, pet } = req.body;
    const newPetWeightRecord = new PetWeightRecord({ value, date, pet });

    try {
      await newPetWeightRecord.save();
      res.status(201).json(newPetWeightRecord);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.patch(
  "/:id/petWeightRecords/:recordId",
  authToken,
  checkOwnership,
  async (req, res) => {
    const validation = updatePetWeightRecordSchema.safeParse(req.body);
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
      const { value, date } = req.body;

      const petWeightRecord = await PetWeightRecord.findById(
        req.params.recordId
      );
      if (!petWeightRecord) {
        res.status(404).json({ error: "Weight record not found" });
        return;
      }
      if (value != undefined) petWeightRecord.value = value;
      if (date != undefined) petWeightRecord.date = date;

      const updated = await petWeightRecord.save();
      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// middlewares
async function checkOwnership(req: Request, res: Response, next: NextFunction) {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      res.status(404).json({ error: "Pet not found" });
      return;
    }
    if (req.user._id !== pet.user.toString()) {
      res.status(403).json({ error: "You can only access your own pets" });
      return;
    }
    req.pet = pet;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export default router;
