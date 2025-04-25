import { z } from "zod";

export const emailFormSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  type: z.enum(["email"]),
});
