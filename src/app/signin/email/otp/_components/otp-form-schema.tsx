import {object, string} from "zod";

export const otpFormSchema = object({
  code: 
    string({
      required_error: "Enter login code",
    })
    .min(6, {
      message: "Your login code must be 6 characters.",
    }),
  sessionRequestHash: string({
    required_error: "Session request hash is required",
  }),
  privateKey: string({
    required_error: "Private key is required",
  }),
});
