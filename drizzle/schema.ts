import { sql } from "drizzle-orm";
import {
  pgTable,
  pgSchema,
  uuid,
  text,
  integer,
  numeric,
  timestamp,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// Points FKs at Supabase's existing auth.users table. drizzle-kit would
// still try to CREATE this table/schema on `generate` since it doesn't know
// it already exists — the generated migration strips that statement out
// (see supabase/migrations, "auth.users already exists" note).
const authSchema = pgSchema("auth");
export const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey(),
});

export const teamMemberRole = pgEnum("team_member_role", [
  "owner",
  "strategist",
  "driver",
]);

export const raceStatus = pgEnum("race_status", [
  "draft",
  "planned",
  "completed",
]);

export const stintPlanStatus = pgEnum("stint_plan_status", [
  "draft",
  "published",
]);

export const stintStatus = pgEnum("stint_status", [
  "planned",
  "in_progress",
  "completed",
]);

export const inviteStatus = pgEnum("invite_status", [
  "pending",
  "accepted",
  "expired",
  "revoked",
]);

export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => authUsers.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}).enableRLS();

export const teamMembers = pgTable(
  "team_members",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    role: teamMemberRole("role").notNull().default("driver"),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("team_members_team_user_idx").on(table.teamId, table.userId)],
).enableRLS();

export const drivers = pgTable("drivers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  // Nullable: a driver can exist as a roster placeholder before they sign up.
  userId: uuid("user_id").references(() => authUsers.id, {
    onDelete: "set null",
  }),
  displayName: text("display_name").notNull(),
  iracingId: text("iracing_id"),
  timezone: text("timezone").notNull().default("UTC"),
  irating: integer("irating"),
  safetyRating: text("safety_rating"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}).enableRLS();

export const driverAvailability = pgTable("driver_availability", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  driverId: uuid("driver_id")
    .notNull()
    .references(() => drivers.id, { onDelete: "cascade" }),
  // Null raceId = general/recurring availability, not tied to one event.
  raceId: uuid("race_id").references(() => races.id, { onDelete: "cascade" }),
  availableFrom: timestamp("available_from", { withTimezone: true }).notNull(),
  availableTo: timestamp("available_to", { withTimezone: true }).notNull(),
  notes: text("notes"),
}).enableRLS();

export const tracks = pgTable("tracks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  configName: text("config_name"),
  country: text("country"),
  lengthKm: numeric("length_km", { precision: 6, scale: 3 }),
  iracingTrackId: integer("iracing_track_id"),
}).enableRLS();

export const cars = pgTable("cars", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  class: text("class"),
  iracingCarId: integer("iracing_car_id"),
}).enableRLS();

export const races = pgTable("races", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  trackId: uuid("track_id").references(() => tracks.id, {
    onDelete: "set null",
  }),
  carId: uuid("car_id").references(() => cars.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  eventClass: text("event_class"),
  startTimeUtc: timestamp("start_time_utc", { withTimezone: true }).notNull(),
  totalDurationMinutes: integer("total_duration_minutes").notNull(),
  status: raceStatus("status").notNull().default("draft"),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => authUsers.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}).enableRLS();

export const raceDrivers = pgTable(
  "race_drivers",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    raceId: uuid("race_id")
      .notNull()
      .references(() => races.id, { onDelete: "cascade" }),
    driverId: uuid("driver_id")
      .notNull()
      .references(() => drivers.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("race_drivers_race_driver_idx").on(table.raceId, table.driverId)],
).enableRLS();

export const stintPlans = pgTable("stint_plans", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  raceId: uuid("race_id")
    .notNull()
    .references(() => races.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  status: stintPlanStatus("status").notNull().default("draft"),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => authUsers.id, { onDelete: "restrict" }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}).enableRLS();

export const stints = pgTable("stints", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  stintPlanId: uuid("stint_plan_id")
    .notNull()
    .references(() => stintPlans.id, { onDelete: "cascade" }),
  driverId: uuid("driver_id").references(() => drivers.id, {
    onDelete: "set null",
  }),
  orderIndex: integer("order_index").notNull(),
  plannedStartTime: timestamp("planned_start_time", {
    withTimezone: true,
  }).notNull(),
  plannedEndTime: timestamp("planned_end_time", {
    withTimezone: true,
  }).notNull(),
  status: stintStatus("status").notNull().default("planned"),
  notes: text("notes"),
}).enableRLS();

// Platform-level role, separate from team_member_role — grants access to
// the /admin area (all-users listing, invite-to-test flow) independent of
// any team membership.
export const admins = pgTable("admins", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}).enableRLS();

export const invites = pgTable("invites", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: teamMemberRole("role").notNull().default("driver"),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  status: inviteStatus("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}).enableRLS();
