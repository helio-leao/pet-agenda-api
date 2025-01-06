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
  interval: z
    .object({
      unit: z.enum(["DAYS", "MONTHS", "YEARS"], {
        message: "Interval value must be one of 'DAYS', 'MONTHS' or 'YEARS'",
      }),
      value: z
        .number()
        .int({ message: "Interval value must be an integer" })
        .min(1, { message: "Interval value must be at least 1" }),
    })
    .nullable()
    .optional(),
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED "], {
    message: "Status must be one of 'SCHEDULED', 'COMPLETED' or 'CANCELLED'",
  }),
  user: z.string().nonempty({ message: "User is required" }),
  pet: z.string().nonempty({ message: "Pet is required" }),
});

export const updateTaskSchema = createTaskSchema.partial();
