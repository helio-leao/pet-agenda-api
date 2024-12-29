import mongoose, { Types } from "mongoose";

export interface ITask {
  title: string;
  description: string;
  date: Date;
  status: String;
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
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled"],
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
