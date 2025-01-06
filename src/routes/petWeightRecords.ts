import { Router } from "express";
import { NextFunction, Request, Response } from "express";
import { IPet } from "../models/Pet";
import authToken from "../middlewares/authToken";
import PetWeightRecord from "../models/PetWeightRecord";
import transformPicture from "../utils/transformPicture";

const router = Router();

router.get("/:id", authToken, checkOwnership, async (req, res) => {
  try {
    const petWeightRecords = req.petWeightRecord.toObject();
    petWeightRecords.pet = transformPicture(petWeightRecords.pet);
    res.json(petWeightRecords);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:id", authToken, checkOwnership, async (req, res) => {
  try {
    await req.petWeightRecord.deleteOne();
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

async function checkOwnership(req: Request, res: Response, next: NextFunction) {
  try {
    const petWeightRecord = await PetWeightRecord.findById(req.params.id)
      .populate<{ pet: IPet }>("pet")
      .exec();

    if (!petWeightRecord) {
      res.status(404).json({ error: "Weight record not found" });
      return;
    }
    if (req.user._id !== petWeightRecord.pet.user.toString()) {
      res
        .status(403)
        .json({ error: "You can only access data from your own pets" });
      return;
    }
    req.petWeightRecord = petWeightRecord;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export default router;
