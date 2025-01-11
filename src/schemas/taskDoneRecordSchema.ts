import { z } from "zod";

export const createTaskDoneRecordSchema = z.object({
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Date must be a valid ISO date string",
  }),
  task: z.string().nonempty({ message: "Task is required" }),
});

export const updateTaskDoneRecordSchema = createTaskDoneRecordSchema.partial();
