import { z } from "zod";

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(2, { message: "Title must be at least 2 characters" })
    .max(100, { message: "Title cannot exceed 50 characters" }),
  description: z
    .string()
    .max(500, { message: "Description cannot exceed 50 characters" })
    .optional()
    .or(z.literal("")),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Date must be a valid ISO date string",
  }),
  status: z.enum(["Scheduled", "Completed", "Cancelled"], {
    message: "Status must be one of 'Scheduled', 'Completed' or 'Cancelled'",
  }),
  user: z.string().nonempty({ message: "User is required" }),
  pet: z.string().nonempty({ message: "Pet is required" }),
});

export const updateTaskSchema = createTaskSchema.partial();
