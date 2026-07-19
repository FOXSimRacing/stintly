// Fictitious track_ids, deliberately outside any real iRacing track ID range.
// Field names/shape are best-effort from public community docs of the real
// Data API (/data/track/get) — see stintly-iracing-data-api skill.
export const trackFixtures: Record<
  string,
  {
    track_id: number;
    track_name: string;
    config_name: string;
    category: "road" | "oval" | "dirt_road" | "dirt_oval";
  }
> = {
  "50001": {
    track_id: 50001,
    track_name: "Road Atlanta",
    config_name: "Full Course",
    category: "road",
  },
  "50002": {
    track_id: 50002,
    track_name: "Spa-Francorchamps",
    config_name: "Grand Prix",
    category: "road",
  },
  "50003": {
    track_id: 50003,
    track_name: "Watkins Glen",
    config_name: "Boot",
    category: "road",
  },
  "50004": {
    track_id: 50004,
    track_name: "Daytona International Speedway",
    config_name: "Road Course",
    category: "road",
  },
  "50005": {
    track_id: 50005,
    track_name: "Nürburgring Combined",
    config_name: "Grand-Prix/24h",
    category: "road",
  },
  "50006": {
    track_id: 50006,
    track_name: "Sebring International Raceway",
    config_name: "International",
    category: "road",
  },
};
