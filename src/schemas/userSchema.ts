import { z } from "zod";

export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name can't exceed 100 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(30, "Username can't exceed 30 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[\W_]/, "Password must contain at least one special character"),
  email: z.string().email("Invalid email format"),
});

export const updateUserSchema = createUserSchema.partial();
