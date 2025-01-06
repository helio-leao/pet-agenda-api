import mongoose, { Types } from "mongoose";

export interface ITask {
  title: string;
  description: string;
  date: Date;
  user: Types.ObjectId;
  pet: Types.ObjectId;

  nextDate: Date | null;
  interval: {
    unit: "HOURS" | "DAYS" | "MONTHS" | "YEARS";
    value: number;
  } | null;
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

    nextDate: {
      type: Date,
      default: null,
    },
    interval: {
      type: {
        unit: {
          type: String,
          enum: ["HOURS", "DAYS", "MONTHS", "YEARS"],
        },
        value: {
          type: Number,
        },
      },
      default: null,
      _id: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITask>("Task", taskSchema);
