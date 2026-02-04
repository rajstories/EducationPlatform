import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertEnrollmentSchema, insertContentSchema, insertContentFileSchema, insertStudentUserSchema, insertOtpSchema } from "@shared/schema";
import { ObjectStorageService } from "./objectStorage";
import { z } from "zod";
import session from "express-session";
import twilio from "twilio";

// Extend session data type
declare module 'express-session' {
  interface SessionData {
    adminUser?: {
      id: string;
      username: string;
      fullName: string;
      role: string;
    };
    admin?: {
      id: string;
      username: string;
      fullName: string;
      role: string;
    };
    student?: {
      id: string;
      name: string;
      email: string | null;
      phone: string | null;
    };
    otpData?: { [key: string]: { name: string; type: string } };
  }
}

import { OtpService } from "./otpService";

//Initialize Twilio client only if credentials are provided (optional for simplified version)
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);



export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware for authentication
  app.use(session({
    store: new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
      tableName: 'student_sessions' // Using existing table name from schema
    }),
    secret: process.env.SESSION_SECRET || 'pooja-academy-secret-key-for-sessions-CHANGE-IN-PRODUCTION',
    resave: false,
    saveUninitialized: false,
    name: 'pooja.session.id',
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    }
  }));

  // Admin authentication middleware - Properly protects routes
  const requireAdminAuth = (req: any, res: any, next: any) => {
    if (!req.session.adminUser) {
      return res.status(401).json({
        message: "Unauthorized. Please login as admin.",
        redirectTo: "/admin/login"
      });
    }
    // Set admin for backward compatibility
    req.session.admin = req.session.adminUser;
    next();
  };

  // Student authentication middleware - Properly protects routes
  const requireStudentAuth = (req: any, res: any, next: any) => {
    if (!req.session.student?.id) {
      return res.status(401).json({
        message: "Unauthorized. Please login to continue.",
        redirectTo: "/login"
      });
    }
    // Set studentId for backward compatibility
    req.session.studentId = req.session.student.id;
    next();
  };
  // Get all classes
  app.get("/api/classes", async (_req, res) => {
    try {
      const classes = await storage.getClasses();
      res.json(classes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch classes" });
    }
  });

  // Get class by ID
  app.get("/api/classes/:id", async (req, res) => {
    try {
      const classData = await storage.getClass(req.params.id);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }
      res.json(classData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch class" });
    }
  });

  // Get subjects by class
  app.get("/api/classes/:id/subjects", async (req, res) => {
    try {
      const { stream } = req.query;
      let subjects;

      if (stream && typeof stream === 'string') {
        subjects = await storage.getSubjectsByClassAndStream(req.params.id, stream);
      } else {
        subjects = await storage.getSubjectsByClass(req.params.id);
      }

      res.json(subjects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  // Get subjects by class
  app.get("/api/subjects/by-class/:classId", async (req, res) => {
    try {
      const subjects = await storage.getSubjects();
      const filteredSubjects = subjects.filter(subject => subject.classId === req.params.classId);
      res.json(filteredSubjects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  // Get subject by ID
  app.get("/api/subjects/:id", async (req, res) => {
    try {
      const subject = await storage.getSubject(req.params.id);
      if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
      }
      res.json(subject);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subject" });
    }
  });

  // Get chapters by subject
  app.get("/api/subjects/:id/chapters", async (req, res) => {
    try {
      const chapters = await storage.getChaptersBySubject(req.params.id);
      res.json(chapters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chapters" });
    }
  });

  // Submit contact form
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const submission = await storage.createContactSubmission(validatedData);

      // Send SMS to Diwakar Sir
      try {
        const smsMessage = `New Student Inquiry from Pooja Academy:

Name: ${validatedData.name}
Phone: ${validatedData.phone}
Email: ${validatedData.email}
Class: ${validatedData.selectedClass || 'Not specified'}
Message: ${validatedData.message}

Please contact the student for further assistance.`;

        if (twilioClient) {
          await twilioClient.messages.create({
            body: smsMessage,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: process.env.ADMIN_NOTIFICATION_PHONE || "+918800345115" // Admin notification number
          });

          console.log("SMS sent successfully to admin");
        }
      } catch (smsError) {
        console.error("Failed to send SMS to Diwakar Sir:", smsError);
        // Don't fail the main request if SMS fails
      }

      res.status(201).json({
        message: "Contact form submitted successfully",
        id: submission.id
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to submit contact form" });
    }
  });

  // Create enrollment
  app.post("/api/enrollments", async (req, res) => {
    try {
      const validatedData = insertEnrollmentSchema.parse(req.body);
      const enrollment = await storage.createEnrollment(validatedData);
      res.status(201).json({
        message: "Enrollment created successfully",
        enrollment
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to create enrollment" });
    }
  });

  // Student attendance endpoints
  app.get('/api/student/attendance', async (req: any, res) => {
    try {
      if (!req.session.student?.id) {
        return res.status(401).json({ message: "Student not authenticated" });
      }

      const studentId = req.session.student.id;
      const { startDate, endDate } = req.query;
      const attendance = await storage.getStudentAttendance(studentId, startDate as string, endDate as string);
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching student attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  // Student results endpoints
  app.get('/api/student/results', async (req: any, res) => {
    try {
      if (!req.session.student?.id) {
        return res.status(401).json({ message: "Student not authenticated" });
      }

      const studentId = req.session.student.id;
      const { subjectId } = req.query;
      const results = await storage.getStudentResults(studentId, subjectId as string);
      res.json(results);
    } catch (error) {
      console.error("Error fetching student results:", error);
      res.status(500).json({ message: "Failed to fetch results" });
    }
  });

  // ========== ADMIN ROUTES ==========

  // Get all students for admin
  app.get('/api/admin/students', requireAdminAuth, async (req, res) => {
    try {
      const students = await storage.getAllStudents();
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  // Get students by class ID
  app.get('/api/admin/students/:classId', requireAdminAuth, async (req, res) => {
    try {
      const { classId } = req.params;
      console.log(`Getting students for classId: ${classId}`);
      const students = await storage.getStudentsByClass(classId);
      console.log(`Found ${students.length} students for class ${classId}`);
      res.json(students);
    } catch (error) {
      console.error("Error fetching students by class:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  // Attendance management endpoints
  app.post('/api/admin/attendance/mark', requireAdminAuth, async (req: any, res) => {
    try {
      const { studentId, date, status, remarks } = req.body;
      const attendance = await storage.markAttendance({
        studentId,
        date,
        status,
        markedBy: req.session.adminUser.id,
        remarks
      });
      res.json(attendance);
    } catch (error) {
      console.error("Error marking attendance:", error);
      res.status(500).json({ message: "Failed to mark attendance" });
    }
  });

  app.get('/api/admin/attendance/class/:classId/date/:date', requireAdminAuth, async (req, res) => {
    try {
      const { classId, date } = req.params;
      const attendance = await storage.getClassAttendanceForDate(classId, date);
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching class attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.get('/api/admin/students/active/:date', requireAdminAuth, async (req, res) => {
    try {
      const { date } = req.params;
      const activeStudentIds = await storage.getActiveStudentsForDate(date);
      res.json(activeStudentIds);
    } catch (error) {
      console.error("Error fetching active students:", error);
      res.status(500).json({ message: "Failed to fetch active students" });
    }
  });

  // Student results management
  app.post('/api/admin/results/add', requireAdminAuth, async (req: any, res) => {
    try {
      const resultData = {
        ...req.body,
        enteredBy: req.session.adminUser.id
      };
      const result = await storage.addStudentResult(resultData);
      res.json(result);
    } catch (error) {
      console.error("Error adding student result:", error);
      res.status(500).json({ message: "Failed to add result" });
    }
  });

  app.get('/api/admin/results/student/:studentId', requireAdminAuth, async (req, res) => {
    try {
      const { studentId } = req.params;
      const { subjectId } = req.query;
      const results = await storage.getStudentResults(studentId, subjectId as string);
      res.json(results);
    } catch (error) {
      console.error("Error fetching student results:", error);
      res.status(500).json({ message: "Failed to fetch results" });
    }
  });

  // Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const adminUser = await storage.validateAdminLogin(username, password);

      if (adminUser) {
        // Set both admin and adminUser for middleware compatibility
        req.session.admin = adminUser;
        req.session.adminUser = adminUser;
        res.json({
          message: "Login successful",
          user: {
            id: adminUser.id,
            username: adminUser.username,
            fullName: adminUser.fullName,
            role: adminUser.role
          }
        });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Admin logout
  app.post("/api/admin/logout", requireAdminAuth, (req, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // Get current admin user
  app.get("/api/admin/me", requireAdminAuth, (req: any, res) => {
    res.json(req.session.adminUser);
  });

  // Upload file endpoint
  app.post("/api/admin/upload", requireAdminAuth, async (req, res) => {
    try {
      const objectStorage = new ObjectStorageService();
      const uploadURL = await objectStorage.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Upload URL generation failed:", error);
      res.status(500).json({ message: "Failed to generate upload URL" });
    }
  });

  // Content management routes

  // Get content by type
  app.get("/api/admin/content", requireAdminAuth, async (req, res) => {
    try {
      const { type, classId, subjectId } = req.query;

      if (!type || typeof type !== 'string') {
        return res.status(400).json({ message: "Content type is required" });
      }

      const filters: any = {};
      if (classId && typeof classId === 'string') filters.classId = classId;
      if (subjectId && typeof subjectId === 'string') filters.subjectId = subjectId;

      const content = await storage.getContentByType(type, filters);
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });

  // Admin Results Management Endpoints
  app.post("/api/admin/results/publish", requireAdminAuth, async (req, res) => {
    try {
      const resultData = req.body;

      // Store results in the database/storage
      const result = await storage.createResult({
        ...resultData,
        id: `result-${Date.now()}`,
        publishedAt: new Date().toISOString(),
      });

      res.json(result);
    } catch (error) {
      console.error("Failed to publish results:", error);
      res.status(500).json({ message: "Failed to publish results" });
    }
  });

  app.get("/api/admin/results", requireAdminAuth, async (req, res) => {
    try {
      const results = await storage.getResults();
      res.json(results);
    } catch (error) {
      console.error("Failed to fetch results:", error);
      res.status(500).json({ message: "Failed to fetch results" });
    }
  });

  app.post("/api/admin/notifications/broadcast", requireAdminAuth, async (req, res) => {
    try {
      const notification = req.body;

      // In a real app, this would send notifications via WebSocket or push notifications
      // For now, store it as an announcement
      const announcement = await storage.createAnnouncement({
        title: notification.title,
        content: notification.message,
        type: notification.type,
        priority: notification.priority,
        data: notification.data,
        createdAt: new Date().toISOString(),
      });

      res.json({ success: true, announcement });
    } catch (error) {
      console.error("Failed to broadcast notification:", error);
      res.status(500).json({ message: "Failed to send notification" });
    }
  });

  // Create new content
  app.post("/api/admin/content", requireAdminAuth, async (req: any, res) => {
    try {
      const validatedData = insertContentSchema.parse(req.body);
      const content = await storage.createContent({
        ...validatedData,
        createdBy: req.session.adminUser.id
      });
      res.status(201).json(content);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to create content" });
    }
  });

  // Update content
  app.put("/api/admin/content/:id", requireAdminAuth, async (req, res) => {
    try {
      const validatedData = insertContentSchema.partial().parse(req.body);
      const content = await storage.updateContent(req.params.id, validatedData);

      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }

      res.json(content);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to update content" });
    }
  });

  // Delete content
  app.delete("/api/admin/content/:id", requireAdminAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteContent(req.params.id);

      if (!deleted) {
        return res.status(404).json({ message: "Content not found" });
      }

      res.json({ message: "Content deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete content" });
    }
  });

  // Create content file
  app.post("/api/admin/content-files", requireAdminAuth, async (req, res) => {
    try {
      const objectStorage = new ObjectStorageService();
      const validatedData = insertContentFileSchema.parse(req.body);

      // Normalize the file path from upload URL to proper object path
      const normalizedPath = objectStorage.normalizeObjectEntityPath(validatedData.filePath);

      const file = await storage.createContentFile({
        ...validatedData,
        filePath: normalizedPath
      });

      res.status(201).json(file);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to create content file" });
    }
  });

  // Get content files
  app.get("/api/admin/content/:contentId/files", requireAdminAuth, async (req, res) => {
    try {
      const files = await storage.getContentFiles(req.params.contentId);
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch content files" });
    }
  });

  // Delete content file
  app.delete("/api/admin/content-files/:id", requireAdminAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteContentFile(req.params.id);

      if (!deleted) {
        return res.status(404).json({ message: "File not found" });
      }

      res.json({ message: "File deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete file" });
    }
  });

  // Chapter management routes

  // Get chapters by subject
  app.get("/api/admin/subjects/:subjectId/chapters", requireAdminAuth, async (req, res) => {
    try {
      const chapters = await storage.getChaptersBySubject(req.params.subjectId);
      res.json(chapters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chapters" });
    }
  });

  // Create new chapter
  app.post("/api/admin/chapters", requireAdminAuth, async (req, res) => {
    try {
      const { name, subjectId } = req.body;

      if (!name || !subjectId) {
        return res.status(400).json({ message: "Name and subjectId are required" });
      }

      // Get existing chapters to determine order
      const existingChapters = await storage.getChaptersBySubject(subjectId);
      const order = existingChapters.length + 1;

      const chapter = await storage.createChapter({ name, subjectId, order });
      res.status(201).json(chapter);
    } catch (error) {
      res.status(500).json({ message: "Failed to create chapter" });
    }
  });

  // Update chapter
  app.put("/api/admin/chapters/:id", requireAdminAuth, async (req, res) => {
    try {
      const updates = req.body;
      const chapter = await storage.updateChapter(req.params.id, updates);

      if (!chapter) {
        return res.status(404).json({ message: "Chapter not found" });
      }

      res.json(chapter);
    } catch (error) {
      res.status(500).json({ message: "Failed to update chapter" });
    }
  });

  // Delete chapter
  app.delete("/api/admin/chapters/:id", requireAdminAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteChapter(req.params.id);

      if (!deleted) {
        return res.status(404).json({ message: "Chapter not found" });
      }

      res.json({ message: "Chapter deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete chapter" });
    }
  });

  // Reorder chapters
  app.put("/api/admin/subjects/:subjectId/chapters/reorder", requireAdminAuth, async (req, res) => {
    try {
      const { chapterIds } = req.body;

      if (!Array.isArray(chapterIds)) {
        return res.status(400).json({ message: "chapterIds must be an array" });
      }

      await storage.reorderChapters(req.params.subjectId, chapterIds);
      res.json({ message: "Chapters reordered successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to reorder chapters" });
    }
  });

  // Achievement and Progress routes

  // Get all achievements
  app.get("/api/achievements", async (req, res) => {
    try {
      const achievements = await storage.getAchievements();
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  // Get student progress
  app.get("/api/student/progress", requireStudentAuth, async (req: any, res) => {
    try {
      const progress = await storage.getStudentProgress(req.session.studentId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  // Get student achievements
  app.get("/api/student/achievements", requireStudentAuth, async (req: any, res) => {
    try {
      const achievements = await storage.getStudentAchievements(req.session.studentId);
      const allAchievements = await storage.getAchievements();

      // Combine earned achievements with achievement details
      const detailedAchievements = achievements.map(earned => {
        const achievement = allAchievements.find(a => a.id === earned.achievementId);
        return { ...earned, achievement };
      }).filter(a => a.achievement);

      res.json(detailedAchievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch student achievements" });
    }
  });

  // Get leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const leaderboard = await storage.getLeaderboard(limit);
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Award achievement manually (admin only)
  app.post("/api/admin/award-achievement", requireAdminAuth, async (req, res) => {
    try {
      const { studentId, achievementId } = req.body;

      if (!studentId || !achievementId) {
        return res.status(400).json({ message: "Student ID and Achievement ID are required" });
      }

      const award = await storage.awardAchievement(studentId, achievementId);

      if (!award) {
        return res.status(400).json({ message: "Achievement already earned or invalid data" });
      }

      res.json(award);
    } catch (error) {
      res.status(500).json({ message: "Failed to award achievement" });
    }
  });

  // ========== PUBLIC STUDENT ROUTES ==========

  // Get published content for students (public access)
  app.get("/api/content/:type", async (req, res) => {
    try {
      const { classId, subjectId } = req.query;
      const filters: any = { isPublished: true }; // Only show published content to students
      if (classId && typeof classId === 'string') filters.classId = classId;
      if (subjectId && typeof subjectId === 'string') filters.subjectId = subjectId;

      const content = await storage.getContentByType(req.params.type, filters);
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });

  // Alternative route for query-based content access (used by student portal)
  app.get("/api/content", async (req, res) => {
    try {
      const { type, classId, subjectId, chapterId } = req.query;

      if (!type || typeof type !== 'string') {
        return res.status(400).json({ message: "Content type is required" });
      }

      const filters: any = { isPublished: true }; // Only show published content to students
      if (classId && typeof classId === 'string') filters.classId = classId;
      if (subjectId && typeof subjectId === 'string') filters.subjectId = subjectId;
      if (chapterId && typeof chapterId === 'string') filters.chapterId = chapterId;

      const content = await storage.getContentByType(type, filters);
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });

  // ========== STUDENT LOGIN ROUTES ==========

  // Student profile completion endpoint
  app.post('/api/student/complete-profile', async (req, res) => {
    try {
      console.log("Profile completion request:", req.session.student);

      if (!req.session.student?.id) {
        return res.status(401).json({ message: "Student not authenticated" });
      }

      // Generate unique student ID in format PA2025001
      const currentYear = new Date().getFullYear();
      const existingStudents = await storage.getAllStudents();
      const yearStudents = existingStudents.filter(s => s.studentId?.includes(currentYear.toString()));
      const nextNumber = yearStudents.length + 1;
      const generatedStudentId = `PA${currentYear}${nextNumber.toString().padStart(3, '0')}`;

      // Add generated student ID and other defaults to profile data
      const profileWithDefaults = {
        ...req.body,
        studentId: generatedStudentId,
        admissionDate: new Date().toISOString(),
        currentSession: `${currentYear}-${(currentYear + 1).toString().slice(-2)}`,
        isActive: true,
        feeStatus: "pending",
        totalFeeDue: 5000, // Default fee amount
        currentGPA: "0.0",
        overallGrade: "N/A"
      };

      const updatedStudent = await storage.completeStudentProfile(req.session.student.id, profileWithDefaults);

      if (!updatedStudent) {
        return res.status(404).json({ message: "Student not found" });
      }

      // Update session with completed profile
      req.session.student = {
        id: updatedStudent.id,
        name: updatedStudent.name!,
        email: updatedStudent.email,
        phone: updatedStudent.phone
      };

      // Save session to ensure persistence
      req.session.save((saveErr: any) => {
        if (saveErr) {
          console.error("Session save error:", saveErr);
        }

        res.json({
          message: "Profile completed successfully",
          user: {
            id: updatedStudent.id,
            name: updatedStudent.name,
            email: updatedStudent.email,
            phone: updatedStudent.phone,
            studentId: updatedStudent.studentId,
            profileCompleted: true
          }
        });
      });

    } catch (error) {
      console.error("Profile completion failed:", error);
      res.status(500).json({ message: "Profile completion failed" });
    }
  });

  // Student logout endpoint
  app.post('/api/student/logout', async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err);
          return res.status(500).json({ message: "Logout failed" });
        }
        res.clearCookie('connect.sid');
        res.json({ message: "Logout successful" });
      });
    } catch (error) {
      console.error("Logout failed:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // Student profile update endpoint
  app.put('/api/student/profile', async (req, res) => {
    try {
      if (!req.session.student?.id) {
        return res.status(401).json({ message: "Student not authenticated" });
      }

      const updatedStudent = await storage.updateStudentUser(req.session.student.id, req.body);

      if (!updatedStudent) {
        return res.status(404).json({ message: "Student not found" });
      }

      res.json({
        message: "Profile updated successfully",
        user: updatedStudent
      });

    } catch (error) {
      console.error("Profile update failed:", error);
      res.status(500).json({ message: "Profile update failed" });
    }
  });

  // Student dashboard data endpoints
  app.get('/api/student/profile', async (req, res) => {
    try {
      if (!req.session.student?.id) {
        return res.status(401).json({ message: "Student not authenticated" });
      }

      const student = await storage.getStudentUser(req.session.student.id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      res.json(student);
    } catch (error) {
      console.error("Error fetching student profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.get('/api/student/attendance', async (req, res) => {
    try {
      if (!req.session.student?.id) {
        return res.status(401).json({ message: "Student not authenticated" });
      }

      const attendanceData = {
        totalDays: 150,
        presentDays: 135,
        percentage: Math.round((135 / 150) * 100)
      };

      res.json(attendanceData);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.get('/api/student/grades', async (req, res) => {
    try {
      if (!req.session.student?.id) {
        return res.status(401).json({ message: "Student not authenticated" });
      }

      const gradesData = [
        {
          testName: "Physics Unit Test 1",
          subjectName: "Physics",
          testType: "unit_test",
          maxMarks: 50,
          obtainedMarks: 42,
          percentage: 84,
          grade: "B+",
          testDate: "2024-01-15"
        },
        {
          testName: "Chemistry Quiz",
          subjectName: "Chemistry",
          testType: "quiz",
          maxMarks: 30,
          obtainedMarks: 28,
          percentage: 93,
          grade: "A",
          testDate: "2024-01-20"
        }
      ];

      res.json(gradesData);
    } catch (error) {
      console.error("Error fetching grades:", error);
      res.status(500).json({ message: "Failed to fetch grades" });
    }
  });

  app.get('/api/student/fees', async (req, res) => {
    try {
      if (!req.session.student?.id) {
        return res.status(401).json({ message: "Student not authenticated" });
      }

      const feesData = [
        {
          feeType: "Tuition Fee",
          amount: 3500,
          dueDate: "2024-02-15",
          status: "paid",
          paidDate: "2024-02-10"
        },
        {
          feeType: "Exam Fee",
          amount: 500,
          dueDate: "2024-03-15",
          status: "pending"
        }
      ];

      res.json(feesData);
    } catch (error) {
      console.error("Error fetching fees:", error);
      res.status(500).json({ message: "Failed to fetch fees" });
    }
  });

  app.get('/api/student/notifications', async (req, res) => {
    try {
      if (!req.session.student?.id) {
        return res.status(401).json({ message: "Student not authenticated" });
      }

      const notificationsData = [
        {
          title: "New Physics Notes Available",
          message: "Chapter 12: Electromagnetic Induction notes have been uploaded.",
          type: "announcement",
          priority: "medium",
          isRead: false,
          createdAt: "2024-01-25T10:00:00Z"
        },
        {
          title: "Fee Reminder",
          message: "Your exam fee of ₹500 is due on March 15th.",
          type: "fee_reminder",
          priority: "high",
          isRead: false,
          createdAt: "2024-01-24T09:00:00Z"
        }
      ];

      res.json(notificationsData);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post('/api/student/logout', async (req, res) => {
    try {
      req.session.destroy((err: any) => {
        if (err) {
          console.error("Session destruction error:", err);
          return res.status(500).json({ message: "Logout failed" });
        }
        res.clearCookie('connect.sid');
        res.json({ message: "Logout successful" });
      });
    } catch (error) {
      console.error("Logout failed:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // Student OTP request
  app.post("/api/student/request-otp", async (req, res) => {
    try {
      const { identifier, name, type } = req.body;

      if (!identifier || !name || !type) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      if (!["email", "phone"].includes(type)) {
        return res.status(400).json({ message: "Invalid type. Must be email or phone" });
      }

      // Generate unique 6-digit OTP using crypto
      const otpCode = OtpService.generateOtp();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

      // Store the name in the session for later use
      if (!req.session.otpData) {
        req.session.otpData = {};
      }
      req.session.otpData[identifier] = { name, type };

      // Create OTP record
      await storage.createOtp({
        identifier,
        otp: otpCode,
        type,
        expiresAt
      });

      // Send real-time OTP via SMS or Email
      const otpSent = await OtpService.sendOtp(identifier, otpCode, type, name);

      if (!otpSent) {
        return res.status(500).json({ message: "Failed to send OTP. Please try again." });
      }

      res.json({
        message: `OTP sent to your ${type} successfully!`,
        // Show OTP in development mode only for email testing
        debug: process.env.NODE_ENV === 'development' ? { otp: otpCode } : undefined
      });

    } catch (error) {
      console.error("OTP request failed:", error);
      res.status(500).json({ message: "Failed to send OTP" });
    }
  });

  // Student OTP verification and login
  app.post("/api/student/verify-otp", async (req: any, res) => {
    try {
      const { identifier, otp, type } = req.body;

      if (!identifier || !otp || !type) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Verify OTP
      const validOtp = await storage.getValidOtp(identifier, otp, type);

      if (!validOtp) {
        return res.status(401).json({ message: "Invalid or expired OTP" });
      }

      // Mark OTP as used
      await storage.markOtpAsUsed(validOtp.id);

      // Get or create student user
      let student;
      if (type === "email") {
        student = await storage.getStudentUserByEmail(identifier);
      } else {
        student = await storage.getStudentUserByPhone(identifier);
      }

      if (!student) {
        // Get the name from the session
        const storedData = req.session.otpData?.[identifier];
        const studentData: any = {
          name: storedData?.name || "Student",
        };

        if (type === "email") {
          studentData.email = identifier;
        } else {
          studentData.phone = identifier;
        }

        student = await storage.createStudentUser(studentData);
      }

      // Update last login
      await storage.updateStudentLastLogin(student.id);

      // Create session
      req.session.student = {
        id: student.id,
        name: student.name,
        email: student.email,
        phone: student.phone
      };

      // Save session explicitly to ensure persistence
      req.session.save((saveErr: any) => {
        if (saveErr) {
          console.error("Session save error during OTP verification:", saveErr);
        }

        console.log("OTP verification successful, session created for:", student.id);

        // Create student session for attendance tracking
        const today = new Date().toISOString().split('T')[0];
        const loginTime = new Date().toISOString();

        storage.createStudentSession({
          studentId: student.id,
          loginDate: today,
          loginTime,
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown'
        }).catch(error => {
          console.error("Failed to create student session:", error);
        });

        res.json({
          message: "Login successful",
          user: {
            id: student.id,
            name: student.name,
            email: student.email,
            phone: student.phone
          },
          profileCompleted: student.profileCompleted || false
        });
      });

    } catch (error) {
      console.error("OTP verification failed:", error);
      res.status(500).json({ message: "Verification failed" });
    }
  });

  // Student logout
  app.post("/api/student/logout", (req, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // Check if email exists
  app.post("/api/student/check-email", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Check for admin email
      if (email === "rajshrivastav283815@gmail.com") {
        return res.json({ exists: true, isAdmin: true });
      }

      const user = await storage.getStudentUserByEmail(email);
      res.json({ exists: !!user, isAdmin: false });

    } catch (error) {
      console.error("Email check failed:", error);
      res.status(500).json({ message: "Failed to check email" });
    }
  });

  // Email login
  app.post("/api/student/email-login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Check for admin credentials
      if (email === "rajshrivastav283815@gmail.com" && password === "Rambhaiya@9958") {
        // Create admin session - set both admin and adminUser for middleware compatibility
        const adminData = {
          id: "admin-1",
          email: email,
          name: "Ram Sir",
          role: "admin"
        };

        (req.session as any).admin = adminData;
        (req.session as any).adminUser = adminData;

        return res.json({
          message: "Admin login successful",
          user: adminData,
          isAdmin: true,
          profileCompleted: true
        });
      }

      const user = await storage.validateStudentEmailLogin(email, password);

      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Update last login
      await storage.updateStudentLastLogin(user.id);

      // Create session
      req.session.student = {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone
      };

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone
        },
        isAdmin: false,
        profileCompleted: user.profileCompleted || false
      });

    } catch (error) {
      console.error("Email login failed:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Email registration
  app.post("/api/student/email-register", async (req, res) => {
    try {
      const { email, name, password } = req.body;

      if (!email || !name || !password) {
        return res.status(400).json({ message: "Email, name, and password are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getStudentUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "User with this email already exists" });
      }

      // Create new user with password
      const newUser = await storage.createStudentUserWithPassword({
        email,
        name,
        password
      });

      // Update last login
      await storage.updateStudentLastLogin(newUser.id);

      // Create session
      req.session.student = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        phone: newUser.phone
      };

      res.json({
        message: "Registration successful",
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          phone: newUser.phone
        },
        profileCompleted: newUser.profileCompleted || false
      });

    } catch (error) {
      console.error("Email registration failed:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Get current user (student or admin)
  app.get("/api/student/me", (req: any, res) => {
    const session = req.session as any;
    if (session.admin) {
      res.json({ ...session.admin, isAdmin: true });
    } else if (session.student) {
      res.json({ ...session.student, isAdmin: false });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Download file (public access for published content) with video streaming support
  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectStorage = new ObjectStorageService();
      const objectFile = await objectStorage.getObjectEntityFile(`/objects/${req.params.objectPath}`);

      // Get file metadata
      const [metadata] = await objectFile.getMetadata();
      const contentType = metadata.contentType || "application/octet-stream";

      // Handle video streaming with range requests
      if (contentType.startsWith('video/')) {
        const range = req.headers.range;
        const fileSize = parseInt(String(metadata.size || '0'));

        if (range) {
          const parts = range.replace(/bytes=/, "").split("-");
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
          const chunksize = (end - start) + 1;

          res.status(206).set({
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunksize.toString(),
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=3600",
          });

          const stream = objectFile.createReadStream({ start, end });
          stream.on("error", (err) => {
            console.error("Video stream error:", err);
            if (!res.headersSent) {
              res.status(500).end();
            }
          });
          stream.pipe(res);
        } else {
          // Full video file request
          res.set({
            "Content-Type": contentType,
            "Content-Length": metadata.size,
            "Accept-Ranges": "bytes",
            "Cache-Control": "public, max-age=3600",
          });
          objectStorage.downloadObject(objectFile, res);
        }
      } else {
        // Regular file download
        objectStorage.downloadObject(objectFile, res);
      }
    } catch (error) {
      console.error("Download error:", error);
      res.status(404).json({ message: "File not found" });
    }
  });

  // Video-related endpoints

  // Get video progress for a student
  app.get("/api/videos/:contentId/progress", requireStudentAuth, async (req: any, res) => {
    try {
      const { contentId } = req.params;
      const studentId = req.session.student.id;

      const progress = await storage.getVideoProgress(studentId, contentId);
      res.json(progress || {
        currentTime: 0,
        completionPercentage: 0,
        isCompleted: false
      });
    } catch (error) {
      console.error("Error getting video progress:", error);
      res.status(500).json({ message: "Failed to get video progress" });
    }
  });

  // Update video progress
  app.put("/api/videos/:contentId/progress", requireStudentAuth, async (req: any, res) => {
    try {
      const { contentId } = req.params;
      const { currentTime, completionPercentage } = req.body;
      const studentId = req.session.student.id;

      await storage.updateVideoProgress(studentId, contentId, currentTime, completionPercentage);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating video progress:", error);
      res.status(500).json({ message: "Failed to update video progress" });
    }
  });

  // Get all video progress for a student
  app.get("/api/student/video-progress", requireStudentAuth, async (req: any, res) => {
    try {
      const studentId = req.session.student.id;
      const progress = await storage.getStudentVideoProgress(studentId);
      res.json(progress);
    } catch (error) {
      console.error("Error getting student video progress:", error);
      res.status(500).json({ message: "Failed to get video progress" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
