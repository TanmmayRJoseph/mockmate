import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";

// ================= USERS TABLE =================
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 150 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ================= JOB PROFILES =================
export const jobProfiles = pgTable("job_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  jobRole: varchar("job_role", { length: 150 }).notNull(),
  skills: text("skills").notNull(), // comma-separated or JSON array
  createdAt: timestamp("created_at").defaultNow(),
});

// ================= QUESTIONS =================
export const questions = pgTable("questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .references(() => jobProfiles.id)
    .notNull(),
  questionText: text("question_text").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ================= ANSWERS =================
export const answers = pgTable("answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  questionId: uuid("question_id")
    .references(() => questions.id)
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  answerText: text("answer_text"), // text version (either typed or transcribed)
  audioUrl: varchar("audio_url", { length: 255 }), // if audio is uploaded
  createdAt: timestamp("created_at").defaultNow(),
});

  // ================= FEEDBACK =================
  export const feedback = pgTable("feedback", {
    id: uuid("id").primaryKey().defaultRandom(),
    answerId: uuid("answer_id")
      .references(() => answers.id)
      .notNull(),
    toneScore: integer("tone_score"), // 0-100
    clarityScore: integer("clarity_score"), // 0-100
    keywordMatchScore: integer("keyword_match_score"), // 0-100
    suggestions: text("suggestions"), // AI suggestions for improvement
    createdAt: timestamp("created_at").defaultNow(),
  });

  // ================= PERFORMANCE =================
  export const performance = pgTable("performance", {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .references(() => jobProfiles.id)
      .notNull(),
    averageTone: integer("average_tone"),
    averageClarity: integer("average_clarity"),
    averageKeywordMatch: integer("average_keyword_match"),
    improvementNotes: text("improvement_notes"),
    updatedAt: timestamp("updated_at").defaultNow(),
  });
