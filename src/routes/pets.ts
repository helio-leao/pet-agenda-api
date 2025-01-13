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
import authToken from "../middlewares/authToken";
import PetWeightRecord from "../models/PetWeightRecord";
import cloudinary from "../config/cloudinary";

const storage = multer.diskStorage({
  filename: function (_req, file, cb) {
    cb(null, file.originalname);
  },
});
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

  if (req.user?._id !== user) {
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
  "/:petId/picture",
  authToken,
  checkPetOwnership,
  upload.single("picture"),
  async (req, res) => {
    const { file } = req;

    if (!file) {
      res.status(400).json({ error: "No file provided" });
      return;
    }
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        public_id: req.pet._id.toString(),
        overwrite: true,
        resource_type: "image",
        folder: "pet_agenda/pets_pictures",
      });
      req.pet.pictureUrl = result.secure_url;
      const updated = await req.pet.save();
      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.patch("/:petId", authToken, checkPetOwnership, async (req, res) => {
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
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:petId", authToken, checkPetOwnership, async (req, res) => {
  try {
    res.json(req.pet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// tasks
router.get("/:petId/tasks", authToken, checkPetOwnership, async (req, res) => {
  try {
    const tasks = await Task.find({ pet: req.params.petId }).sort({ date: 1 });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// pet weight records
router.get(
  "/:petId/weight-records/latest",
  authToken,
  checkPetOwnership,
  async (req, res) => {
    try {
      const weightRecord = await PetWeightRecord.findOne({
        pet: req.params.petId,
      }).sort({
        date: -1,
      });
      res.json(weightRecord);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.get(
  "/:petId/weight-records",
  authToken,
  checkPetOwnership,
  async (req, res) => {
    try {
      const weightRecords = await PetWeightRecord.find({
        pet: req.params.petId,
      }).sort({ date: -1 });

      res.json(weightRecords);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.post(
  "/:petId/weight-records",
  authToken,
  checkPetOwnership,
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
  "/:petId/weight-records/:recordId",
  authToken,
  checkPetOwnership,
  checkWeightRecordOwnership,
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

      if (value != undefined) req.petWeightRecord.value = value;
      if (date != undefined) req.petWeightRecord.date = date;

      const updated = await req.petWeightRecord.save();
      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.get(
  "/:petId/weight-records/:recordId",
  authToken,
  checkPetOwnership,
  checkWeightRecordOwnership,
  async (req, res) => {
    try {
      await req.petWeightRecord.populate({ path: "pet", select: "name" });
      res.json(req.petWeightRecord);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.delete(
  "/:petId/weight-records/:recordId",
  authToken,
  checkPetOwnership,
  checkWeightRecordOwnership,
  async (req, res) => {
    try {
      await req.petWeightRecord.deleteOne();
      res.sendStatus(204);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// middlewares
async function checkPetOwnership(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const pet = await Pet.findById(req.params.petId);

    if (!pet) {
      res.status(404).json({ error: "Pet not found" });
      return;
    }
    if (req.user?._id !== pet.user.toString()) {
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

async function checkWeightRecordOwnership(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const weightRecord = await PetWeightRecord.findById(req.params.recordId);

    if (!weightRecord) {
      res.status(404).json({ error: "Weight record not found" });
      return;
    }
    if (weightRecord.pet.toString() !== req.params.petId) {
      res.status(404).json({ error: "Weight record not found for this pet" });
      return;
    }
    req.petWeightRecord = weightRecord;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export default router;
