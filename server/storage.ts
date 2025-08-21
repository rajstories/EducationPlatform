import { type User, type InsertUser, type Class, type Subject, type Chapter, type ContactSubmission, type InsertContact, type Enrollment, type InsertEnrollment } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getClasses(): Promise<Class[]>;
  getClass(id: string): Promise<Class | undefined>;
  
  getSubjects(): Promise<Subject[]>;
  getSubjectsByClass(classId: string): Promise<Subject[]>;
  getSubjectsByClassAndStream(classId: string, stream: string): Promise<Subject[]>;
  getSubject(id: string): Promise<Subject | undefined>;
  
  getChaptersBySubject(subjectId: string): Promise<Chapter[]>;
  
  createContactSubmission(contact: InsertContact): Promise<ContactSubmission>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private classes: Map<string, Class>;
  private subjects: Map<string, Subject>;
  private chapters: Map<string, Chapter>;
  private contactSubmissions: Map<string, ContactSubmission>;
  private enrollments: Map<string, Enrollment>;

  constructor() {
    this.users = new Map();
    this.classes = new Map();
    this.subjects = new Map();
    this.chapters = new Map();
    this.contactSubmissions = new Map();
    this.enrollments = new Map();
    
    this.initializeData();
  }

  private initializeData() {
    // Initialize classes
    const classes = [
      {
        id: "class-9",
        name: "Class 9",
        description: "Science & Mathematics",
        price: 2999,
        streams: ["both"]
      },
      {
        id: "class-10",
        name: "Class 10",
        description: "Science & Mathematics", 
        price: 3499,
        streams: ["both"]
      },
      {
        id: "class-11",
        name: "Class 11",
        description: "Science & Commerce",
        price: 4999,
        streams: ["science", "commerce"]
      },
      {
        id: "class-12",
        name: "Class 12",
        description: "Science & Commerce",
        price: 5999,
        streams: ["science", "commerce"]
      }
    ];
    
    classes.forEach(cls => this.classes.set(cls.id, cls));

    // Initialize subjects
    const subjects = [
      // Class 9 & 10 subjects
      { id: "physics-9", name: "Physics", classId: "class-9", stream: "both", price: 999, icon: "fas fa-atom", chapterCount: 15, isAvailable: true },
      { id: "chemistry-9", name: "Chemistry", classId: "class-9", stream: "both", price: 999, icon: "fas fa-flask", chapterCount: 14, isAvailable: false },
      { id: "mathematics-9", name: "Mathematics", classId: "class-9", stream: "both", price: 899, icon: "fas fa-calculator", chapterCount: 12, isAvailable: true },
      
      { id: "physics-10", name: "Physics", classId: "class-10", stream: "both", price: 999, icon: "fas fa-atom", chapterCount: 15, isAvailable: true },
      { id: "chemistry-10", name: "Chemistry", classId: "class-10", stream: "both", price: 999, icon: "fas fa-flask", chapterCount: 14, isAvailable: false },
      { id: "mathematics-10", name: "Mathematics", classId: "class-10", stream: "both", price: 899, icon: "fas fa-calculator", chapterCount: 12, isAvailable: true },
      
      // Class 11 Science
      { id: "physics-11", name: "Physics", classId: "class-11", stream: "science", price: 1299, icon: "fas fa-atom", chapterCount: 16, isAvailable: true },
      { id: "chemistry-11", name: "Chemistry", classId: "class-11", stream: "science", price: 1299, icon: "fas fa-flask", chapterCount: 15, isAvailable: true },
      { id: "mathematics-11", name: "Mathematics", classId: "class-11", stream: "science", price: 1199, icon: "fas fa-calculator", chapterCount: 14, isAvailable: true },
      { id: "biology-11", name: "Biology", classId: "class-11", stream: "science", price: 1199, icon: "fas fa-dna", chapterCount: 18, isAvailable: false },
      
      // Class 11 Commerce
      { id: "economics-11", name: "Economics", classId: "class-11", stream: "commerce", price: 1099, icon: "fas fa-chart-line", chapterCount: 12, isAvailable: true },
      { id: "accounts-11", name: "Accounts", classId: "class-11", stream: "commerce", price: 1099, icon: "fas fa-file-invoice-dollar", chapterCount: 14, isAvailable: true },
      { id: "business-11", name: "Business Studies", classId: "class-11", stream: "commerce", price: 999, icon: "fas fa-briefcase", chapterCount: 10, isAvailable: false },
      
      // Class 12 Science  
      { id: "physics-12", name: "Physics", classId: "class-12", stream: "science", price: 1399, icon: "fas fa-atom", chapterCount: 17, isAvailable: true },
      { id: "chemistry-12", name: "Chemistry", classId: "class-12", stream: "science", price: 1399, icon: "fas fa-flask", chapterCount: 16, isAvailable: true },
      { id: "mathematics-12", name: "Mathematics", classId: "class-12", stream: "science", price: 1299, icon: "fas fa-calculator", chapterCount: 15, isAvailable: true },
      { id: "biology-12", name: "Biology", classId: "class-12", stream: "science", price: 1299, icon: "fas fa-dna", chapterCount: 19, isAvailable: false },
      
      // Class 12 Commerce
      { id: "economics-12", name: "Economics", classId: "class-12", stream: "commerce", price: 1199, icon: "fas fa-chart-line", chapterCount: 13, isAvailable: true },
      { id: "accounts-12", name: "Accounts", classId: "class-12", stream: "commerce", price: 1199, icon: "fas fa-file-invoice-dollar", chapterCount: 15, isAvailable: true },
      { id: "business-12", name: "Business Studies", classId: "class-12", stream: "commerce", price: 1099, icon: "fas fa-briefcase", chapterCount: 11, isAvailable: false },
    ];
    
    subjects.forEach(subj => this.subjects.set(subj.id, subj));

    // Initialize sample chapters for Physics-10
    const chapters = [
      { id: "ch-1", name: "Motion in a Straight Line", subjectId: "physics-10", order: 1, hasNotes: true, hasPyqs: true, hasVideos: true },
      { id: "ch-2", name: "Motion in a Plane", subjectId: "physics-10", order: 2, hasNotes: true, hasPyqs: true, hasVideos: false },
      { id: "ch-3", name: "Laws of Motion", subjectId: "physics-10", order: 3, hasNotes: false, hasPyqs: true, hasVideos: false },
    ];
    
    chapters.forEach(ch => this.chapters.set(ch.id, ch));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getClasses(): Promise<Class[]> {
    return Array.from(this.classes.values());
  }

  async getClass(id: string): Promise<Class | undefined> {
    return this.classes.get(id);
  }

  async getSubjects(): Promise<Subject[]> {
    return Array.from(this.subjects.values());
  }

  async getSubjectsByClass(classId: string): Promise<Subject[]> {
    return Array.from(this.subjects.values()).filter(
      subject => subject.classId === classId
    );
  }

  async getSubjectsByClassAndStream(classId: string, stream: string): Promise<Subject[]> {
    return Array.from(this.subjects.values()).filter(
      subject => subject.classId === classId && (subject.stream === stream || subject.stream === "both")
    );
  }

  async getSubject(id: string): Promise<Subject | undefined> {
    return this.subjects.get(id);
  }

  async getChaptersBySubject(subjectId: string): Promise<Chapter[]> {
    return Array.from(this.chapters.values())
      .filter(chapter => chapter.subjectId === subjectId)
      .sort((a, b) => a.order - b.order);
  }

  async createContactSubmission(insertContact: InsertContact): Promise<ContactSubmission> {
    const id = randomUUID();
    const contact: ContactSubmission = { 
      ...insertContact, 
      id, 
      createdAt: new Date().toISOString() 
    };
    this.contactSubmissions.set(id, contact);
    return contact;
  }

  async createEnrollment(insertEnrollment: InsertEnrollment): Promise<Enrollment> {
    const id = randomUUID();
    const enrollment: Enrollment = { 
      ...insertEnrollment, 
      id, 
      paymentStatus: "completed",
      createdAt: new Date().toISOString() 
    };
    this.enrollments.set(id, enrollment);
    return enrollment;
  }
}

export const storage = new MemStorage();
