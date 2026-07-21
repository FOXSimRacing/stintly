-- Seeds the shared reference tables (tracks/cars) needed for the
-- calendar-driven race setup flow (issue #7). track_id/car_id values match
-- mocks/iracing/fixtures/tracks.ts and mocks/iracing/fixtures/cars.ts so the
-- mocked calendar events (mocks/iracing/fixtures/calendar.ts) resolve to a
-- real local row via iracing_track_id.

insert into tracks (name, config_name, iracing_track_id) values
  ('Road Atlanta', 'Full Course', 50001),
  ('Spa-Francorchamps', 'Grand Prix', 50002),
  ('Daytona International Speedway', 'Road Course', 50004),
  ('Nürburgring Combined', 'Grand-Prix/24h', 50005),
  ('Sebring International Raceway', 'International', 50006);

insert into cars (name, class, iracing_car_id) values
  ('Ferrari 296 GT3', 'GT3', 70001),
  ('BMW M4 GT3', 'GT3', 70002),
  ('Porsche 992 GT3 R', 'GT3', 70003),
  ('Audi R8 LMS GT3 EVO II', 'GT3', 70004),
  ('Ligier JS P320', 'LMP3', 70005),
  ('Oreca LMP2', 'LMP2', 70006);
