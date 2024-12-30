import { z } from "zod";

export const createPetSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name cannot exceed 50 characters" }),
  type: z
    .string()
    .min(2, { message: "Type must be at least 2 characters" })
    .max(50, { message: "Type cannot exceed 50 characters" }),
  breed: z
    .string()
    .min(2, { message: "Type must be at least 2 characters" })
    .max(50, { message: "Type cannot exceed 50 characters" }),
  birthdate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Birthdate must be a valid ISO date string",
  }),
  user: z.string().nonempty({ message: "User is required" }),
});

export const updatePetSchema = createPetSchema.partial();
