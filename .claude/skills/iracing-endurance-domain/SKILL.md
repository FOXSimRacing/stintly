---
name: iracing-endurance-domain
description: Use when implementing or reviewing any feature touching race/stint/fuel/tire/weather domain logic in Stintly — e.g. stint duration rules, pit windows, driver rest requirements, race formats — to keep terminology and calculations accurate to real iRacing endurance racing.
---

# iRacing endurance racing domain knowledge

Stintly plans **team-based endurance races inside iRacing** (a sim, not real-world running/triathlon). Get the vocabulary and constraints right — users are sim racers and will notice sloppy domain modeling immediately.

## Glossary

- **Stint**: one continuous driving segment by a single driver, bounded by pit stops (fuel/tire service) or a driver change. The core unit Stintly schedules.
- **Driver change**: swapping drivers during a pit stop. Costs extra pit time vs. a fuel-only stop (driver has to physically get in/out in the sim's pit sequence).
- **Stint length**: usually **fuel-tank-limited**, not driver-fatigue-limited, in a well-optimized plan — a car can only run as long as its tank lasts (car/track dependent, commonly 40–70 min for GT3, longer for LMP2/hypercars with bigger tanks). Stintly does not model fuel math in v1, but stint durations entered by users should be plausible against this constraint, and any validation messaging should reference "tank window," not arbitrary caps.
- **Pit window**: the time range during which a stop is legal/optimal — mandatory in some series (BoP / class rules), advisory in others (fuel range). v1 does not enforce mandatory windows, but the data model (`Race`, `Stint`) should not preclude adding them later.
- **Full-course caution (FCY)**: iRacing's equivalent of a safety car — neutralizes the field, often used strategically to take a "free" pit stop. Not modeled in v1; do not build stint-timing logic that assumes green-flag-only racing (e.g. don't hard-fail a plan just because real-race timing will drift from it).
- **BoP (Balance of Performance)**: performance equalization across cars in a mixed-class field. Relevant to `Car`/`event_class` fields on `Race`, not to stint math directly.
- **iRating / Safety Rating (SR)**: iRacing's skill and clean-driving ratings. Stored per driver (`drivers.irating`, `drivers.safety_rating`) as informational context for strategists picking who drives the tricky night stints — not used in any current business logic.
- **Driver rest**: real endurance teams enforce a minimum rest gap between a driver's stints (fatigue, sim-rig time, real-life sleep in 24h races). Stintly's stint-plan builder should surface a warning (not a hard block — plans sometimes need to break this deliberately) when a driver is scheduled back-to-back or with too short a gap. There's no single official number; treat this as a configurable/soft rule, not a hardcoded constant.

## Race formats to design around

- **Sprint-length multi-class** (e.g. 2–4h): fewer stints, tight strategy, less need for driver-rest logic.
- **Classic endurance** (Spa 24h, Nürburgring 24h, Daytona 24h equivalents on iRacing's official calendar): 12–24h, many stints, multiple drivers rotating, day/night transitions, most demanding on the stint-plan builder's UX (this is the primary target scenario per the product plan).
- Race duration is entered in **minutes** (`races.total_duration_minutes`) to avoid fractional-hour ambiguity; always convert to/from hours only at the UI layer, never store hours.

## What's explicitly out of scope for v1 (don't build for it, don't block on it)

Fuel consumption calculators, tire wear/compound modeling, weather/time-of-day planning, live actuals-vs-plan tracking during a race, and iRacing Data API ingestion are all **future modules** — for the Data API specifically, a mockable service layer already exists in `lib/iracing/` (see the `stintly-iracing-data-api` skill) even though no consumer feature has been built on it yet. When these come up, attach new tables keyed by `stint_id`/`race_id` (see the supabase-data-modeling skill) rather than growing the `Stint`/`Race` tables — this skill exists partly to stop scope creep from those areas leaking into stint-plan work.
