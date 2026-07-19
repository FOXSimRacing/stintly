import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email("Informe um email válido."),
  password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
});

export type SignupInput = z.infer<typeof signupSchema>;
