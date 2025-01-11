import mongoose, { Types } from "mongoose";

export interface ITaskDoneRecord {
  date: Date;
  task: Types.ObjectId;
}

const taskDoneRecordSchema = new mongoose.Schema<ITaskDoneRecord>(
  {
    date: {
      type: Date,
      required: true,
    },
    task: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Task",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITaskDoneRecord>(
  "TaskDoneRecord",
  taskDoneRecordSchema
);
