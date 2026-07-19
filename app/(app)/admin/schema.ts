import { z } from "zod";

export const inviteUserSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>;
