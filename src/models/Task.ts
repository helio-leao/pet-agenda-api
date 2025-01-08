import mongoose, { Types } from "mongoose";

export interface ITask {
  user: Types.ObjectId;
  pet: Types.ObjectId;

  title: string;
  description: string;
  date: Date;

  intervalUnit: "HOURS" | "DAYS" | "WEEKS" | "MONTHS" | "YEARS";
  interval: number;

  history: Date[];
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

    intervalUnit: {
      type: String,
      enum: ["HOURS", "DAYS", "WEEKS", "MONTHS", "YEARS"],
    },
    interval: {
      type: Number,
    },

    history: {
      type: [Date],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITask>("Task", taskSchema);
