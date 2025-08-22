import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertEnrollmentSchema, insertContentSchema, insertContentFileSchema, insertStudentUserSchema, insertOtpSchema } from "@shared/schema";
import { ObjectStorageService } from "./objectStorage";
import { z } from "zod";
import session from "express-session";

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware for admin authentication
  app.use(session({
    secret: 'pooja-academy-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // set to true if using https
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Admin authentication middleware
  const requireAdminAuth = (req: any, res: any, next: any) => {
    if (req.session.adminUser) {
      next();
    } else {
      res.status(401).json({ message: "Admin authentication required" });
    }
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

  // ========== ADMIN ROUTES ==========
  
  // Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const adminUser = await storage.validateAdminLogin(username, password);
      
      if (adminUser) {
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

  // ========== PUBLIC STUDENT ROUTES ==========
  
  // Get published content for students (public access)
  app.get("/api/content/:type", async (req, res) => {
    try {
      const { classId, subjectId } = req.query;
      const filters: any = {};
      if (classId && typeof classId === 'string') filters.classId = classId;
      if (subjectId && typeof subjectId === 'string') filters.subjectId = subjectId;
      
      const content = await storage.getContentByType(req.params.type, filters);
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });

  // ========== STUDENT LOGIN ROUTES ==========
  
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
      
      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
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
      
      // In a real implementation, you would send the OTP via email/SMS
      // For demo purposes, we'll just return success
      console.log(`OTP for ${identifier}: ${otpCode}`);
      
      res.json({ 
        message: `OTP sent to your ${type}`,
        // Remove this in production - only for testing
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
      req.session.studentUser = {
        id: student.id,
        name: student.name,
        email: student.email,
        phone: student.phone
      };
      
      res.json({ 
        message: "Login successful",
        user: {
          id: student.id,
          name: student.name,
          email: student.email,
          phone: student.phone
        }
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
  
  // Get current student user
  app.get("/api/student/me", (req: any, res) => {
    if (req.session.studentUser) {
      res.json(req.session.studentUser);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Download file (public access for published content)
  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectStorage = new ObjectStorageService();
      const objectFile = await objectStorage.getObjectEntityFile(`/objects/${req.params.objectPath}`);
      
      // Increment download count
      // Note: In a real implementation, you'd want to track which file this is
      // and increment its download count in the database
      
      objectStorage.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Download error:", error);
      res.status(404).json({ message: "File not found" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
