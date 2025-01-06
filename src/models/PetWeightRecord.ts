import mongoose, { Types } from "mongoose";

export interface IPetWeightRecord {
  value: number;
  date: Date;
  pet: Types.ObjectId;
}

const petWeightRecordSchema = new mongoose.Schema<IPetWeightRecord>(
  {
    value: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    pet: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Pet",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPetWeightRecord>(
  "PetWeightRecord",
  petWeightRecordSchema
);
