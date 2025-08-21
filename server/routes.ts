import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertEnrollmentSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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

  const httpServer = createServer(app);
  return httpServer;
}
