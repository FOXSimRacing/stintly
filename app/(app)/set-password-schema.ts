import { z } from "zod";
import { signupSchema } from "@/app/(auth)/signup/schema";

export const setPasswordSchema = z
  .object({
    password: signupSchema.shape.password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export type SetPasswordInput = z.infer<typeof setPasswordSchema>;
