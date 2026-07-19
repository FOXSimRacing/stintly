import { z } from "zod";

export const createTeamSchema = z.discriminatedUnion("source", [
  z.object({
    source: z.literal("iracing"),
    iracingTeamId: z.number().int().positive(),
    name: z.string().min(2, "Escolha um time.").max(60),
  }),
  z.object({
    source: z.literal("manual"),
    name: z
      .string()
      .min(2, "O nome precisa ter pelo menos 2 caracteres.")
      .max(60, "O nome pode ter no máximo 60 caracteres."),
  }),
]);

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
