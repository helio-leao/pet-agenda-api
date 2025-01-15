import mongoose, { Types } from "mongoose";

export interface ITask {
  user: Types.ObjectId;
  pet: Types.ObjectId;

  title: string;
  description: string;
  dueDate: Date;

  interval: {
    unit: "HOURS" | "DAYS" | "WEEKS" | "MONTHS" | "YEARS";
    value: number;
  };
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
    dueDate: {
      type: Date,
      required: true,
    },

    interval: {
      type: {
        unit: {
          type: String,
          enum: ["HOURS", "DAYS", "WEEKS", "MONTHS", "YEARS"],
        },
        value: {
          type: Number,
        },
      },
      _id: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITask>("Task", taskSchema);
