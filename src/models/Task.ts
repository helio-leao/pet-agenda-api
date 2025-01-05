import mongoose, { Types } from "mongoose";

export interface ITask {
  title: string;
  description: string;
  date: Date;
  interval: {
    unit: "DAYS" | "MONTHS" | "YEARS";
    value: number;
  } | null;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED ";
  user: Types.ObjectId;
  pet: Types.ObjectId;
}

const taskSchema = new mongoose.Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    date: {
      type: Date,
      required: true,
    },
    interval: {
      type: {
        unit: {
          type: String,
          enum: ["DAYS", "MONTHS", "YEARS"],
        },
        value: {
          type: Number,
        },
      },
      default: null,
    },
    status: {
      type: String,
      enum: ["SCHEDULED", "COMPLETED", "CANCELLED "],
      required: true,
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
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

export default mongoose.model<ITask>("Task", taskSchema);
