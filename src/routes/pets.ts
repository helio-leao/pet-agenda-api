import { Router } from "express";
import Pet, { IPet } from "../models/Pet";
import multer from "multer";
import { Document, Types } from "mongoose";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

router.post("/", async (req, res) => {
  const { name, species, race, birthdate, user } = req.body;

  const newPet = new Pet({
    name,
    species,
    race,
    birthdate,
    user,
  });

  try {
    await newPet.save();
    res.status(201).json(newPet);
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

    res.status(200).json(transformPetPicture(updated));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

function transformPetPicture(
  pet: Document<unknown, {}, IPet> &
    IPet & { _id: Types.ObjectId } & { __v: number }
) {
  return {
    ...pet.toObject(),
    picture: pet.picture
      ? `data:${pet.picture.contentType};base64,${pet.picture.buffer.toString(
          "base64"
        )}`
      : null,
  };
}

export default router;
