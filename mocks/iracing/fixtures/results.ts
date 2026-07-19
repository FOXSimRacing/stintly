// A single fictitious subsession referencing member fixtures' cust_ids, so a
// future results-import feature can join against consistent mock data.
// Field names/shape are best-effort from public community docs of the real
// Data API (/data/results/get) — see stintly-iracing-data-api skill.
export const subsessionResultFixtures: Record<
  string,
  {
    subsession_id: number;
    series_name: string;
    track: { track_id: number; track_name: string };
    results: Array<{
      cust_id: number;
      display_name: string;
      finish_position: number;
      laps_complete: number;
      average_lap: number;
    }>;
  }
> = {
  "90001": {
    subsession_id: 90001,
    series_name: "IMSA Endurance Series",
    track: { track_id: 50001, track_name: "Road Atlanta" },
    results: [
      {
        cust_id: 100001,
        display_name: "Ana Torres",
        finish_position: 1,
        laps_complete: 142,
        average_lap: 87.312,
      },
      {
        cust_id: 100003,
        display_name: "Sofia Nakamura",
        finish_position: 2,
        laps_complete: 141,
        average_lap: 87.601,
      },
      {
        cust_id: 100002,
        display_name: "Marco Belli",
        finish_position: 3,
        laps_complete: 139,
        average_lap: 88.045,
      },
    ],
  },
};
