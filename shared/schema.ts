import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Base user table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["manager", "influencer"] }).notNull(),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Influencer profile table with additional details
export const influencers = pgTable("influencers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  nickname: text("nickname").notNull(),
  bio: text("bio"),
  instagramHandle: text("instagram_handle"),
  instagramFollowers: integer("instagram_followers"),
  tiktokHandle: text("tiktok_handle"),
  tiktokFollowers: integer("tiktok_followers"),
  youtubeHandle: text("youtube_handle"),
  youtubeFollowers: integer("youtube_followers"),
  telegramHandle: text("telegram_handle"),
  telegramFollowers: integer("telegram_followers"),
  vkHandle: text("vk_handle"),
  vkFollowers: integer("vk_followers"),
});

export const insertInfluencerSchema = createInsertSchema(influencers).omit({ id: true });
export type InsertInfluencer = z.infer<typeof insertInfluencerSchema>;
export type Influencer = typeof influencers.$inferSelect;

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  client: text("client").notNull(),
  description: text("description"),
  keyRequirements: json("key_requirements").$type<string[]>(),
  startDate: timestamp("start_date").defaultNow().notNull(),
  deadline: timestamp("deadline"),
  status: text("status", { enum: ["draft", "active", "completed"] }).default("draft").notNull(),
  workflowStage: text("workflow_stage", { enum: ["scenario", "material", "publication"] }).default("scenario").notNull(),
  budget: integer("budget"),
  erid: text("erid"),
  managerId: integer("manager_id").references(() => users.id),
  technicalLinks: json("technical_links").$type<{ title: string, url: string }[]>(),
  platforms: json("platforms").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true });
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Project-Influencer assignments
export const projectInfluencers = pgTable("project_influencers", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  influencerId: integer("influencer_id").references(() => influencers.id).notNull(),
  scenarioStatus: text("scenario_status", { enum: ["pending", "added", "under_approval", "approved", "rejected"] }).default("pending").notNull(),
  materialStatus: text("material_status", { enum: ["pending", "in_review", "approved", "rejected"] }).default("pending").notNull(),
  publicationStatus: text("publication_status", { enum: ["pending", "published", "verified"] }).default("pending").notNull(),
  scenarioCompletedAt: timestamp("scenario_completed_at"),
  materialCompletedAt: timestamp("material_completed_at"),
  publicationCompletedAt: timestamp("publication_completed_at"),
});

export const insertProjectInfluencerSchema = createInsertSchema(projectInfluencers).omit({ id: true });
export type InsertProjectInfluencer = z.infer<typeof insertProjectInfluencerSchema>;
export type ProjectInfluencer = typeof projectInfluencers.$inferSelect;

// Project scenarios
export const scenarios = pgTable("scenarios", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  influencerId: integer("influencer_id").references(() => influencers.id).notNull(),
  content: text("content").notNull(),
  googleDocUrl: text("google_doc_url"),
  status: text("status", { enum: ["added", "under_approval", "approved", "rejected"] }).default("added").notNull(),
  submittedAt: timestamp("submitted_at"),
  approvedAt: timestamp("approved_at"),
  version: integer("version").default(1).notNull(),
});

export const insertScenarioSchema = createInsertSchema(scenarios).omit({ id: true });
export type InsertScenario = z.infer<typeof insertScenarioSchema>;
export type Scenario = typeof scenarios.$inferSelect;

// Project materials
export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  influencerId: integer("influencer_id").references(() => influencers.id).notNull(),
  materialUrl: text("material_url").notNull(),
  description: text("description"),
  status: text("status", { enum: ["draft", "submitted", "approved", "rejected"] }).default("draft").notNull(),
  submittedAt: timestamp("submitted_at"),
  approvedAt: timestamp("approved_at"),
});

export const insertMaterialSchema = createInsertSchema(materials).omit({ id: true });
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type Material = typeof materials.$inferSelect;

// Project publications
export const publications = pgTable("publications", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  influencerId: integer("influencer_id").references(() => influencers.id).notNull(),
  platform: text("platform", { enum: ["instagram", "tiktok", "youtube", "telegram", "vk"] }).notNull(),
  publicationUrl: text("publication_url").notNull(),
  publishedAt: timestamp("published_at").notNull(),
  status: text("status", { enum: ["published", "verified"] }).default("published").notNull(),
  verifiedAt: timestamp("verified_at"),
});

export const insertPublicationSchema = createInsertSchema(publications).omit({ id: true });
export type InsertPublication = z.infer<typeof insertPublicationSchema>;
export type Publication = typeof publications.$inferSelect;

// Project comments
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true });
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

// Project activities
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  activityType: text("activity_type").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, createdAt: true });
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;
