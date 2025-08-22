import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const classes = pgTable("classes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  streams: jsonb("streams").notNull(), // Array of stream names
});

export const subjects = pgTable("subjects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  classId: varchar("class_id").notNull(),
  stream: text("stream").notNull(), // "science", "commerce", "both"
  price: integer("price").notNull(),
  icon: text("icon").notNull(),
  chapterCount: integer("chapter_count").notNull().default(0),
  isAvailable: boolean("is_available").notNull().default(true),
});

export const chapters = pgTable("chapters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  subjectId: varchar("subject_id").notNull(),
  order: integer("order").notNull(),
  hasNotes: boolean("has_notes").notNull().default(false),
  hasPyqs: boolean("has_pyqs").notNull().default(false),
  hasVideos: boolean("has_videos").notNull().default(false),
});

export const contactSubmissions = pgTable("contact_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  selectedClass: text("selected_class"),
  message: text("message").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const enrollments = pgTable("enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentName: text("student_name").notNull(),
  studentEmail: text("student_email").notNull(),
  subjectId: varchar("subject_id").notNull(),
  amount: integer("amount").notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Admin users table for secure admin access
export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("admin"), // admin, super_admin
  isActive: boolean("is_active").notNull().default(true),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Content management table for notes, tests, PYQs, results, announcements
export const content = pgTable("content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // "notes", "test", "pyq", "result", "announcement"
  classId: varchar("class_id"), // optional - can be for all classes
  subjectId: varchar("subject_id"), // optional - can be for all subjects
  chapterId: varchar("chapter_id"), // optional - can be for all chapters
  isPublished: boolean("is_published").notNull().default(true),
  publishDate: text("publish_date").default(sql`CURRENT_TIMESTAMP`),
  expiryDate: text("expiry_date"), // optional expiry for announcements
  priority: integer("priority").notNull().default(0), // for ordering content
  createdBy: varchar("created_by").notNull(), // admin user who created it
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Content files table for storing file attachments
export const contentFiles = pgTable("content_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentId: varchar("content_id").notNull(),
  fileName: text("file_name").notNull(),
  originalFileName: text("original_file_name").notNull(),
  fileSize: integer("file_size").notNull(), // in bytes
  mimeType: text("mime_type").notNull(),
  filePath: text("file_path").notNull(), // path in object storage
  downloadCount: integer("download_count").notNull().default(0),
  uploadedAt: text("uploaded_at").default(sql`CURRENT_TIMESTAMP`),
});

// Student users table for student portal access
export const studentUsers = pgTable("student_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").unique(),
  phone: text("phone").unique(),
  name: text("name").notNull(),
  classId: varchar("class_id"), // optional class association
  isActive: boolean("is_active").notNull().default(true),
  lastLogin: text("last_login"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// OTP table for phone/email verification
export const otps = pgTable("otps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  identifier: text("identifier").notNull(), // email or phone
  otp: text("otp").notNull(),
  type: text("type").notNull(), // "email" or "phone"
  expiresAt: text("expires_at").notNull(),
  isUsed: boolean("is_used").notNull().default(false),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertContactSchema = createInsertSchema(contactSubmissions).pick({
  name: true,
  email: true,
  phone: true,
  selectedClass: true,
  message: true,
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).pick({
  studentName: true,
  studentEmail: true,
  subjectId: true,
  amount: true,
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).pick({
  username: true,
  password: true,
  fullName: true,
  role: true,
});

export const insertContentSchema = createInsertSchema(content).pick({
  title: true,
  description: true,
  type: true,
  classId: true,
  subjectId: true,
  chapterId: true,
  isPublished: true,
  publishDate: true,
  expiryDate: true,
  priority: true,
});

export const insertContentFileSchema = createInsertSchema(contentFiles).pick({
  contentId: true,
  fileName: true,
  originalFileName: true,
  fileSize: true,
  mimeType: true,
  filePath: true,
});

export const insertStudentUserSchema = createInsertSchema(studentUsers).pick({
  email: true,
  phone: true,
  name: true,
  classId: true,
});

export const insertOtpSchema = createInsertSchema(otps).pick({
  identifier: true,
  otp: true,
  type: true,
  expiresAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Class = typeof classes.$inferSelect;
export type Subject = typeof subjects.$inferSelect;
export type Chapter = typeof chapters.$inferSelect;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;

export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type Content = typeof content.$inferSelect;
export type InsertContent = z.infer<typeof insertContentSchema>;
export type ContentFile = typeof contentFiles.$inferSelect;
export type InsertContentFile = z.infer<typeof insertContentFileSchema>;
export type StudentUser = typeof studentUsers.$inferSelect;
export type InsertStudentUser = z.infer<typeof insertStudentUserSchema>;
export type Otp = typeof otps.$inferSelect;
export type InsertOtp = z.infer<typeof insertOtpSchema>;
