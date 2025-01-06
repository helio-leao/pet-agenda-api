import mongoose, { Types } from "mongoose";

export interface ITask {
  user: Types.ObjectId;
  pet: Types.ObjectId;

  title: string;
  description: string;
  date: Date;

  nextDate: Date | null;
  interval: {
    unit: "HOURS" | "DAYS" | "MONTHS" | "YEARS";
    value: number;
  } | null;
  // history: Date[];
}

const taskSchema = new mongoose.Schema<ITask>(
  {
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
    // history: [{ type: Date }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITask>("Task", taskSchema);
