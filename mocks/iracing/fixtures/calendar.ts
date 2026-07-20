// Fictitious series_ids, deliberately outside any real iRacing series ID
// range. A curated slate of official-style endurance special events —
// field names/shape are best-effort from public community docs of the real
// Data API (/data/season/race_guide) — see stintly-iracing-data-api skill.
// track_ids reference mocks/iracing/fixtures/tracks.ts for consistency.
export const enduranceRaceGuideFixture = [
  {
    series_id: 80001,
    series_name: "Spa 24 Hours",
    track: { track_id: 50002, track_name: "Spa-Francorchamps" },
    start_time: "2026-08-15T13:00:00Z",
    duration_minutes: 1440,
  },
  {
    series_id: 80002,
    series_name: "Petit Le Mans",
    track: { track_id: 50001, track_name: "Road Atlanta" },
    start_time: "2026-09-12T18:00:00Z",
    duration_minutes: 600,
  },
  {
    series_id: 80003,
    series_name: "Nürburgring 24 Hours",
    track: { track_id: 50005, track_name: "Nürburgring Combined" },
    start_time: "2026-10-03T14:00:00Z",
    duration_minutes: 1440,
  },
  {
    series_id: 80004,
    series_name: "Sebring 12 Hours",
    track: { track_id: 50006, track_name: "Sebring International Raceway" },
    start_time: "2026-11-07T15:00:00Z",
    duration_minutes: 720,
  },
  {
    series_id: 80005,
    series_name: "Daytona 24 Hours",
    track: { track_id: 50004, track_name: "Daytona International Speedway" },
    start_time: "2027-01-24T18:00:00Z",
    duration_minutes: 1440,
  },
];
