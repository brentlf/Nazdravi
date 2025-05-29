import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with role-based access
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(), // Firebase UID
  role: text("role").notNull().default("client"), // "client" | "admin"
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  photoURL: text("photo_url"),
  preferredLanguage: text("preferred_language").notNull().default("en"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Appointments table
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: text("date").notNull(),
  timeslot: text("timeslot").notNull(),
  type: text("type").notNull(), // "Initial" | "Follow-up"
  goals: text("goals").notNull(),
  status: text("status").notNull().default("pending"), // "pending" | "confirmed" | "done"
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  teamsJoinUrl: text("teams_join_url"), // Microsoft Teams meeting URL
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Messages table for real-time messaging
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  fromUser: text("from_user").notNull(),
  toUser: text("to_user").notNull(),
  text: text("text").notNull(),
  chatRoom: text("chat_room").notNull(), // Format: "user1_user2"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Nutrition plans table
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  storagePath: text("storage_path").notNull(), // Firebase Storage path
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Progress tracking table
export const progress = pgTable("progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: text("date").notNull(),
  weightKg: integer("weight_kg"),
  waterLitres: integer("water_litres"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Resources table
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  url: text("url").notNull(),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  lang: text("lang").notNull().default("en"),
  type: text("type").notNull().default("pdf"), // "pdf" | "video" | "link"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Translations table for i18n
export const translations = pgTable("translations", {
  id: serial("id").primaryKey(),
  lang: text("lang").notNull(),
  namespace: text("namespace").notNull(),
  key: text("key").notNull(),
  value: text("value").notNull(),
});

// Blog posts table
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  featuredImage: text("featured_image"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  lang: text("lang").notNull().default("en"),
  published: boolean("published").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Newsletter subscribers
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertPlanSchema = createInsertSchema(plans).omit({
  id: true,
  createdAt: true,
});

export const insertProgressSchema = createInsertSchema(progress).omit({
  id: true,
  createdAt: true,
});

export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
  createdAt: true,
});

export const insertTranslationSchema = createInsertSchema(translations).omit({
  id: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).omit({
  id: true,
  subscribedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Plan = typeof plans.$inferSelect;
export type InsertPlan = z.infer<typeof insertPlanSchema>;

export type Progress = typeof progress.$inferSelect;
export type InsertProgress = z.infer<typeof insertProgressSchema>;

export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;

export type Translation = typeof translations.$inferSelect;
export type InsertTranslation = z.infer<typeof insertTranslationSchema>;

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;
