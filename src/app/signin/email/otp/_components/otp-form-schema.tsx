import * as z from "zod";

export const otpFormSchema = z.object({
  code: z
    .string({
      required_error: "Enter login code",
    })
    .min(6, {
      message: "Your login code must be 6 characters.",
    }),
});
