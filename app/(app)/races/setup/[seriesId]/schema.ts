import { z } from "zod";

export const createRaceFromCalendarEventSchema = z.object({
  seriesId: z.number(),
  teamId: z.string().uuid("Escolha um time."),
  carId: z.string().uuid("Escolha um carro."),
  driverIds: z.array(z.string().uuid()).min(1, "Selecione ao menos um piloto."),
});

export type CreateRaceFromCalendarEventInput = z.infer<
  typeof createRaceFromCalendarEventSchema
>;
