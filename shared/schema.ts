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
  type: text("type").notNull(), // "notes", "test", "pyq", "result", "announcement", "video"
  classId: varchar("class_id"), // optional - can be for all classes
  subjectId: varchar("subject_id"), // optional - can be for all subjects
  chapterId: varchar("chapter_id"), // optional - can be for all chapters
  isPublished: boolean("is_published").notNull().default(true),
  publishDate: text("publish_date").default(sql`CURRENT_TIMESTAMP`),
  expiryDate: text("expiry_date"), // optional expiry for announcements
  priority: integer("priority").notNull().default(0), // for ordering content
  createdBy: varchar("created_by").notNull(), // admin user who created it
  
  // Video-specific fields
  duration: integer("duration"), // video duration in seconds
  thumbnailUrl: text("thumbnail_url"), // video thumbnail image
  videoId: varchar("video_id"), // unique identifier for the video file
  
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

// Enhanced Student users table for comprehensive student management
export const studentUsers = pgTable("student_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // Basic Login Info
  email: text("email").unique(),
  phone: text("phone").unique(),
  name: text("name").notNull(),
  password: text("password"), // bcrypt hashed password for email login
  
  // Personal Information
  dateOfBirth: text("date_of_birth"),
  gender: text("gender"), // "male", "female", "other"
  address: text("address"),
  city: text("city"),
  state: text("state").default("Delhi"),
  pincode: text("pincode"),
  profilePhoto: text("profile_photo"), // path to photo
  
  // Academic Information
  classId: varchar("class_id"), // current class
  rollNumber: text("roll_number").unique(), // auto-generated
  stream: text("stream"), // "science", "commerce"
  admissionDate: text("admission_date"),
  currentSession: text("current_session"), // "2024-25"
  
  // Parent/Guardian Information
  fatherName: text("father_name"),
  motherName: text("mother_name"),
  guardianName: text("guardian_name"),
  parentPhone: text("parent_phone"),
  parentEmail: text("parent_email"),
  parentOccupation: text("parent_occupation"),
  emergencyContact: text("emergency_contact"),
  
  // Academic Performance
  totalAttendance: integer("total_attendance").default(0),
  presentDays: integer("present_days").default(0),
  currentGPA: text("current_gpa").default("0.0"),
  overallGrade: text("overall_grade").default("N/A"),
  
  // Financial Information
  feeStatus: text("fee_status").default("pending"), // "paid", "pending", "overdue"
  totalFeeDue: integer("total_fee_due").default(0),
  lastPaymentDate: text("last_payment_date"),
  
  // System Information
  studentId: text("student_id").unique(), // PA2025001 format
  profileCompleted: boolean("profile_completed").default(false),
  isActive: boolean("is_active").notNull().default(true),
  lastLogin: text("last_login"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
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

// Student login sessions for attendance tracking
export const studentSessions = pgTable("student_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull(),
  loginDate: text("login_date").notNull(), // YYYY-MM-DD format
  loginTime: text("login_time").notNull(),
  logoutTime: text("logout_time"),
  duration: integer("duration"), // in minutes
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
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
  duration: true,
  thumbnailUrl: true,
  videoId: true,
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
// Student Attendance Table
export const studentAttendance = pgTable("student_attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  status: text("status").notNull(), // "present", "absent", "late", "half_day"
  subjectId: varchar("subject_id"), // optional - for subject-wise attendance
  remarks: text("remarks"),
  markedBy: varchar("marked_by"), // admin who marked attendance
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Student Grades/Performance Table
export const studentGrades = pgTable("student_grades", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull(),
  subjectId: varchar("subject_id").notNull(),
  testType: text("test_type").notNull(), // "assignment", "quiz", "midterm", "final", "project"
  testName: text("test_name").notNull(),
  maxMarks: integer("max_marks").notNull(),
  obtainedMarks: integer("obtained_marks").notNull(),
  grade: text("grade"), // A+, A, B+, etc.
  percentage: text("percentage"),
  testDate: text("test_date").notNull(),
  remarks: text("remarks"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Fee Management Table
export const studentFees = pgTable("student_fees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull(),
  feeType: text("fee_type").notNull(), // "tuition", "admission", "exam", "library", "transport"
  amount: integer("amount").notNull(),
  dueDate: text("due_date").notNull(),
  paidDate: text("paid_date"),
  status: text("status").notNull().default("pending"), // "paid", "pending", "overdue", "waived"
  paymentMethod: text("payment_method"), // "cash", "online", "cheque", "upi"
  transactionId: text("transaction_id"),
  receiptNumber: text("receipt_number"),
  session: text("session").notNull(), // "2024-25"
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Student Notifications/Announcements
export const studentNotifications = pgTable("student_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id"), // null for all students
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // "announcement", "fee_reminder", "attendance_alert", "grade_update"
  priority: text("priority").default("medium"), // "high", "medium", "low"
  isRead: boolean("is_read").default(false),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export type StudentUser = typeof studentUsers.$inferSelect;
export type InsertStudentUser = z.infer<typeof insertStudentUserSchema>;
export type StudentAttendance = typeof studentAttendance.$inferSelect;
export type InsertStudentAttendance = typeof studentAttendance.$inferInsert;
export type StudentGrade = typeof studentGrades.$inferSelect;
export type InsertStudentGrade = typeof studentGrades.$inferInsert;
export type StudentFee = typeof studentFees.$inferSelect;
export type InsertStudentFee = typeof studentFees.$inferInsert;
export type StudentNotification = typeof studentNotifications.$inferSelect;
export type InsertStudentNotification = typeof studentNotifications.$inferInsert;
export type StudentSession = typeof studentSessions.$inferSelect;
export type InsertStudentSession = typeof studentSessions.$inferInsert;
export type Otp = typeof otps.$inferSelect;
export type InsertOtp = z.infer<typeof insertOtpSchema>;

// Achievement system for gamified learning
export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // "attendance", "academic", "engagement", "milestone"
  type: text("type").notNull(), // "bronze", "silver", "gold", "platinum", "special"
  icon: text("icon").notNull(), // icon name or emoji
  color: text("color").notNull(), // hex color for badge
  requirements: jsonb("requirements").notNull(), // criteria to earn this achievement
  points: integer("points").notNull().default(0), // points awarded
  isActive: boolean("is_active").notNull().default(true),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Student achievements earned
export const studentAchievements = pgTable("student_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull(),
  achievementId: varchar("achievement_id").notNull(),
  earnedAt: text("earned_at").default(sql`CURRENT_TIMESTAMP`),
  points: integer("points").notNull().default(0),
});

// Student progress tracking for gamification
export const studentProgress = pgTable("student_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull(),
  totalPoints: integer("total_points").notNull().default(0),
  level: integer("level").notNull().default(1),
  experiencePoints: integer("experience_points").notNull().default(0),
  streak: integer("streak").notNull().default(0), // consecutive days with activity
  lastActivityDate: text("last_activity_date"),
  
  // Progress metrics
  completedAssignments: integer("completed_assignments").default(0),
  perfectAttendanceDays: integer("perfect_attendance_days").default(0),
  testsPassed: integer("tests_passed").default(0),
  notesDownloaded: integer("notes_downloaded").default(0),
  loginStreak: integer("login_streak").default(0),
  
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertAchievementSchema = createInsertSchema(achievements).pick({
  title: true,
  description: true,
  category: true,
  type: true,
  icon: true,
  color: true,
  requirements: true,
  points: true,
});

export const insertStudentAchievementSchema = createInsertSchema(studentAchievements).pick({
  studentId: true,
  achievementId: true,
  points: true,
});

export const insertStudentProgressSchema = createInsertSchema(studentProgress).pick({
  studentId: true,
  totalPoints: true,
  level: true,
  experiencePoints: true,
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type StudentAchievement = typeof studentAchievements.$inferSelect;
export type InsertStudentAchievement = z.infer<typeof insertStudentAchievementSchema>;
export type StudentProgress = typeof studentProgress.$inferSelect;
export type InsertStudentProgress = z.infer<typeof insertStudentProgressSchema>;

// Video progress tracking for students
export const videoProgress = pgTable("video_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull(),
  contentId: varchar("content_id").notNull(), // video content ID
  currentTime: integer("current_time").notNull().default(0), // current watch position in seconds
  duration: integer("duration").notNull(), // total video duration in seconds
  completionPercentage: integer("completion_percentage").notNull().default(0), // 0-100%
  isCompleted: boolean("is_completed").notNull().default(false),
  lastWatchedAt: text("last_watched_at").default(sql`CURRENT_TIMESTAMP`),
  totalWatchTime: integer("total_watch_time").notNull().default(0), // total time watched in seconds
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertVideoProgressSchema = createInsertSchema(videoProgress).pick({
  studentId: true,
  contentId: true,
  currentTime: true,
  duration: true,
  completionPercentage: true,
  isCompleted: true,
  totalWatchTime: true,
});

export type VideoProgress = typeof videoProgress.$inferSelect;
export type InsertVideoProgress = z.infer<typeof insertVideoProgressSchema>;
