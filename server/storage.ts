import { 
  type User, type InsertUser, 
  type Class, type Subject, type Chapter, 
  type ContactSubmission, type InsertContact, 
  type Enrollment, type InsertEnrollment,
  type AdminUser, type InsertAdminUser,
  type Content, type InsertContent,
  type ContentFile, type InsertContentFile,
  type StudentUser, type InsertStudentUser,
  type Otp, type InsertOtp
} from "@shared/schema";
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
  
  // Admin user methods
  getAdminUser(id: string): Promise<AdminUser | undefined>;
  getAdminUserByUsername(username: string): Promise<AdminUser | undefined>;
  createAdminUser(adminUser: InsertAdminUser): Promise<AdminUser>;
  validateAdminLogin(username: string, password: string): Promise<AdminUser | undefined>;
  
  // Content management methods
  createContent(content: InsertContent & { createdBy: string }): Promise<Content>;
  getContent(id: string): Promise<Content | undefined>;
  getContentByType(type: string, filters?: { classId?: string; subjectId?: string }): Promise<Content[]>;
  updateContent(id: string, updates: Partial<InsertContent>): Promise<Content | undefined>;
  deleteContent(id: string): Promise<boolean>;
  
  // Content files methods
  createContentFile(file: InsertContentFile): Promise<ContentFile>;
  getContentFiles(contentId: string): Promise<ContentFile[]>;
  deleteContentFile(id: string): Promise<boolean>;
  incrementDownloadCount(fileId: string): Promise<void>;
  
  // Student user methods
  getStudentUser(id: string): Promise<StudentUser | undefined>;
  getStudentUserByEmail(email: string): Promise<StudentUser | undefined>;
  getStudentUserByPhone(phone: string): Promise<StudentUser | undefined>;
  createStudentUser(studentUser: InsertStudentUser): Promise<StudentUser>;
  updateStudentLastLogin(id: string): Promise<void>;
  
  // OTP methods
  createOtp(otp: InsertOtp): Promise<Otp>;
  getValidOtp(identifier: string, otpCode: string, type: string): Promise<Otp | undefined>;
  markOtpAsUsed(id: string): Promise<void>;
  cleanupExpiredOtps(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private classes: Map<string, Class>;
  private subjects: Map<string, Subject>;
  private chapters: Map<string, Chapter>;
  private contactSubmissions: Map<string, ContactSubmission>;
  private enrollments: Map<string, Enrollment>;
  private adminUsers: Map<string, AdminUser>;
  private content: Map<string, Content>;
  private contentFiles: Map<string, ContentFile>;
  private studentUsers: Map<string, StudentUser>;
  private otps: Map<string, Otp>;

  constructor() {
    this.users = new Map();
    this.classes = new Map();
    this.subjects = new Map();
    this.chapters = new Map();
    this.contactSubmissions = new Map();
    this.enrollments = new Map();
    this.adminUsers = new Map();
    this.content = new Map();
    this.contentFiles = new Map();
    this.studentUsers = new Map();
    this.otps = new Map();
    
    this.initializeData();
  }

  private initializeData() {
    // Initialize default admin user (Ram Sir)
    const defaultAdmin: AdminUser = {
      id: "admin-1",
      username: "rajshrivastav283815@gmail.com",
      password: "Rambhaiya@9958",
      fullName: "Ram Sir",
      role: "super_admin",
      isActive: true,
      createdAt: new Date().toISOString()
    };
    this.adminUsers.set(defaultAdmin.id, defaultAdmin);
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
      { id: "science-9", name: "Science", classId: "class-9", stream: "both", price: 1199, icon: "fas fa-atom", chapterCount: 22, isAvailable: true },
      { id: "mathematics-9", name: "Mathematics", classId: "class-9", stream: "both", price: 899, icon: "fas fa-calculator", chapterCount: 12, isAvailable: true },
      
      { id: "science-10", name: "Science", classId: "class-10", stream: "both", price: 1299, icon: "fas fa-atom", chapterCount: 25, isAvailable: true },
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

    // Initialize chapters for Science subjects
    const chapters = [
      // Class 9 Science chapters
      { id: "ch-9-1", name: "Matter in Our Surroundings", subjectId: "science-9", order: 1, hasNotes: true, hasPyqs: true, hasVideos: true },
      { id: "ch-9-2", name: "Is Matter Around Us Pure", subjectId: "science-9", order: 2, hasNotes: true, hasPyqs: true, hasVideos: false },
      { id: "ch-9-3", name: "Atoms and Molecules", subjectId: "science-9", order: 3, hasNotes: true, hasPyqs: false, hasVideos: true },
      { id: "ch-9-4", name: "Structure of Atom", subjectId: "science-9", order: 4, hasNotes: false, hasPyqs: true, hasVideos: false },
      { id: "ch-9-5", name: "The Fundamental Unit of Life", subjectId: "science-9", order: 5, hasNotes: true, hasPyqs: true, hasVideos: true },
      { id: "ch-9-6", name: "Tissues", subjectId: "science-9", order: 6, hasNotes: true, hasPyqs: false, hasVideos: false },
      
      // Class 9 Mathematics chapters
      { id: "ch-9m-1", name: "Number Systems", subjectId: "mathematics-9", order: 1, hasNotes: true, hasPyqs: true, hasVideos: true },
      { id: "ch-9m-2", name: "Polynomials", subjectId: "mathematics-9", order: 2, hasNotes: true, hasPyqs: true, hasVideos: false },
      { id: "ch-9m-3", name: "Coordinate Geometry", subjectId: "mathematics-9", order: 3, hasNotes: false, hasPyqs: true, hasVideos: true },
      
      // Class 10 Science chapters
      { id: "ch-10-1", name: "Chemical Reactions and Equations", subjectId: "science-10", order: 1, hasNotes: true, hasPyqs: true, hasVideos: true },
      { id: "ch-10-2", name: "Acids, Bases and Salts", subjectId: "science-10", order: 2, hasNotes: true, hasPyqs: true, hasVideos: false },
      { id: "ch-10-3", name: "Metals and Non-metals", subjectId: "science-10", order: 3, hasNotes: true, hasPyqs: false, hasVideos: true },
      { id: "ch-10-4", name: "Carbon and its Compounds", subjectId: "science-10", order: 4, hasNotes: false, hasPyqs: true, hasVideos: false },
      { id: "ch-10-5", name: "Life Processes", subjectId: "science-10", order: 5, hasNotes: true, hasPyqs: true, hasVideos: true },
      { id: "ch-10-6", name: "Control and Coordination", subjectId: "science-10", order: 6, hasNotes: true, hasPyqs: false, hasVideos: false },
      
      // Class 10 Mathematics chapters
      { id: "ch-10m-1", name: "Real Numbers", subjectId: "mathematics-10", order: 1, hasNotes: true, hasPyqs: true, hasVideos: true },
      { id: "ch-10m-2", name: "Polynomials", subjectId: "mathematics-10", order: 2, hasNotes: true, hasPyqs: true, hasVideos: false },
      { id: "ch-10m-3", name: "Pair of Linear Equations", subjectId: "mathematics-10", order: 3, hasNotes: false, hasPyqs: true, hasVideos: true },
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
      selectedClass: insertContact.selectedClass || null,
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

  // Admin user methods
  async getAdminUser(id: string): Promise<AdminUser | undefined> {
    return this.adminUsers.get(id);
  }

  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    return Array.from(this.adminUsers.values()).find(
      (user) => user.username === username,
    );
  }

  async createAdminUser(insertAdminUser: InsertAdminUser): Promise<AdminUser> {
    const id = randomUUID();
    const adminUser: AdminUser = { 
      ...insertAdminUser, 
      id,
      role: insertAdminUser.role || "admin",
      isActive: true,
      createdAt: new Date().toISOString()
    };
    this.adminUsers.set(id, adminUser);
    return adminUser;
  }

  async validateAdminLogin(username: string, password: string): Promise<AdminUser | undefined> {
    const user = await this.getAdminUserByUsername(username);
    if (user && user.password === password && user.isActive) {
      return user;
    }
    return undefined;
  }

  // Content management methods
  async createContent(contentData: InsertContent & { createdBy: string }): Promise<Content> {
    const id = randomUUID();
    const content: Content = { 
      ...contentData, 
      id,
      description: contentData.description || null,
      classId: contentData.classId || null,
      subjectId: contentData.subjectId || null,
      chapterId: contentData.chapterId || null,
      publishDate: contentData.publishDate || new Date().toISOString(),
      expiryDate: contentData.expiryDate || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.content.set(id, content);
    return content;
  }

  async getContent(id: string): Promise<Content | undefined> {
    return this.content.get(id);
  }

  async getContentByType(type: string, filters?: { classId?: string; subjectId?: string }): Promise<Content[]> {
    return Array.from(this.content.values()).filter(content => {
      if (content.type !== type) return false;
      if (filters?.classId && content.classId !== filters.classId) return false;
      if (filters?.subjectId && content.subjectId !== filters.subjectId) return false;
      return content.isPublished;
    }).sort((a, b) => b.priority - a.priority || new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async updateContent(id: string, updates: Partial<InsertContent>): Promise<Content | undefined> {
    const existing = this.content.get(id);
    if (!existing) return undefined;
    
    const updated: Content = { 
      ...existing, 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    this.content.set(id, updated);
    return updated;
  }

  async deleteContent(id: string): Promise<boolean> {
    return this.content.delete(id);
  }

  // Content files methods
  async createContentFile(insertFile: InsertContentFile): Promise<ContentFile> {
    const id = randomUUID();
    const file: ContentFile = { 
      ...insertFile, 
      id,
      downloadCount: 0,
      uploadedAt: new Date().toISOString()
    };
    this.contentFiles.set(id, file);
    return file;
  }

  async getContentFiles(contentId: string): Promise<ContentFile[]> {
    return Array.from(this.contentFiles.values()).filter(
      file => file.contentId === contentId
    );
  }

  async deleteContentFile(id: string): Promise<boolean> {
    return this.contentFiles.delete(id);
  }

  async incrementDownloadCount(fileId: string): Promise<void> {
    const file = this.contentFiles.get(fileId);
    if (file) {
      file.downloadCount += 1;
      this.contentFiles.set(fileId, file);
    }
  }

  // Student user methods
  async getStudentUser(id: string): Promise<StudentUser | undefined> {
    return this.studentUsers.get(id);
  }

  async getStudentUserByEmail(email: string): Promise<StudentUser | undefined> {
    return Array.from(this.studentUsers.values()).find(user => user.email === email);
  }

  async getStudentUserByPhone(phone: string): Promise<StudentUser | undefined> {
    return Array.from(this.studentUsers.values()).find(user => user.phone === phone);
  }

  async createStudentUser(insertStudentUser: InsertStudentUser): Promise<StudentUser> {
    const id = randomUUID();
    const studentUser: StudentUser = {
      ...insertStudentUser,
      id,
      email: insertStudentUser.email || null,
      phone: insertStudentUser.phone || null,
      classId: insertStudentUser.classId || null,
      isActive: true,
      lastLogin: null,
      createdAt: new Date().toISOString()
    };
    this.studentUsers.set(id, studentUser);
    return studentUser;
  }

  async updateStudentLastLogin(id: string): Promise<void> {
    const user = this.studentUsers.get(id);
    if (user) {
      user.lastLogin = new Date().toISOString();
      this.studentUsers.set(id, user);
    }
  }

  // OTP methods
  async createOtp(insertOtp: InsertOtp): Promise<Otp> {
    const id = randomUUID();
    const otp: Otp = {
      ...insertOtp,
      id,
      isUsed: false,
      createdAt: new Date().toISOString()
    };
    this.otps.set(id, otp);
    return otp;
  }

  async getValidOtp(identifier: string, otpCode: string, type: string): Promise<Otp | undefined> {
    const now = new Date();
    return Array.from(this.otps.values()).find(otp => 
      otp.identifier === identifier &&
      otp.otp === otpCode &&
      otp.type === type &&
      !otp.isUsed &&
      new Date(otp.expiresAt) > now
    );
  }

  async markOtpAsUsed(id: string): Promise<void> {
    const otp = this.otps.get(id);
    if (otp) {
      otp.isUsed = true;
      this.otps.set(id, otp);
    }
  }

  async cleanupExpiredOtps(): Promise<void> {
    const now = new Date();
    for (const [id, otp] of this.otps.entries()) {
      if (new Date(otp.expiresAt) <= now) {
        this.otps.delete(id);
      }
    }
  }
}

export const storage = new MemStorage();
