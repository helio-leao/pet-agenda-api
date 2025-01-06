import { z } from "zod";

export const createPetWeightRecordSchema = z.object({
  value: z.number().min(0, { message: "Interval value must at least 0" }),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Date must be a valid ISO date string",
  }),
  pet: z.string().nonempty({ message: "Pet is required" }),
});

export const updatePetWeightRecordSchema =
  createPetWeightRecordSchema.partial();
