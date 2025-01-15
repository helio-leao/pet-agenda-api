import { z } from "zod";

export const createTaskSchema = z.object({
  user: z.string().nonempty({ message: "User is required" }),
  pet: z.string().nonempty({ message: "Pet is required" }),

  title: z
    .string()
    .min(2, { message: "Title must be at least 2 characters" })
    .max(100, { message: "Title cannot exceed 50 characters" }),
  description: z
    .string()
    .max(500, { message: "Description cannot exceed 50 characters" })
    .optional()
    .or(z.literal("")),
  dueDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Date must be a valid ISO date string",
  }),

  interval: z.object({
    value: z
      .number()
      .int({ message: "Interval value must be an integer" })
      .min(1, { message: "Interval value must be at least 1" }),
    unit: z.enum(["HOURS", "WEEKS", "DAYS", "MONTHS", "YEARS"], {
      message:
        "Interval unit must be one of 'HOURS', 'WEEKS', 'DAYS', 'MONTHS' or 'YEARS'",
    }),
  }),
});

export const updateTaskSchema = createTaskSchema.partial();
