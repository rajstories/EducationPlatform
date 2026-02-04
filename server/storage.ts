import { 
  type User, type InsertUser, 
  type Class, type Subject, type Chapter, 
  type ContactSubmission, type InsertContact, 
  type Enrollment, type InsertEnrollment,
  type AdminUser, type InsertAdminUser,
  type Content, type InsertContent,
  type ContentFile, type InsertContentFile,
  type StudentUser, type InsertStudentUser,
  type Otp, type InsertOtp,
  type StudentAttendance, type InsertStudentAttendance,
  type StudentGrade, type InsertStudentGrade,
  type StudentSession, type InsertStudentSession,
  type Achievement, type InsertAchievement,
  type StudentAchievement, type InsertStudentAchievement,
  type StudentProgress, type InsertStudentProgress,
  type VideoProgress, type InsertVideoProgress
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

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
  getChapter(id: string): Promise<Chapter | undefined>;
  createChapter(chapter: { name: string; subjectId: string; order: number }): Promise<Chapter>;
  updateChapter(id: string, updates: Partial<Chapter>): Promise<Chapter | undefined>;
  deleteChapter(id: string): Promise<boolean>;
  reorderChapters(subjectId: string, chapterIds: string[]): Promise<void>;
  updateChapterCounts(subjectId: string): Promise<void>;
  
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
  updateStudentUser(id: string, updates: Partial<StudentUser>): Promise<StudentUser | undefined>;
  updateStudentLastLogin(id: string): Promise<void>;
  completeStudentProfile(id: string, profileData: any): Promise<StudentUser | undefined>;
  getAllStudents(): Promise<StudentUser[]>;
  getStudentsByClass(classId: string): Promise<StudentUser[]>;
  
  // Password-based authentication
  validateStudentEmailLogin(email: string, password: string): Promise<StudentUser | null>;
  createStudentUserWithPassword(user: InsertStudentUser & { password: string }): Promise<StudentUser>;
  
  // Attendance methods
  markAttendance(attendance: InsertStudentAttendance): Promise<StudentAttendance>;
  getStudentAttendance(studentId: string, startDate?: string, endDate?: string): Promise<StudentAttendance[]>;
  getClassAttendanceForDate(classId: string, date: string): Promise<StudentAttendance[]>;
  updateAttendanceStats(studentId: string): Promise<void>;
  
  // Student results/grades methods
  addStudentResult(result: InsertStudentGrade): Promise<StudentGrade>;
  getStudentResults(studentId: string, subjectId?: string): Promise<StudentGrade[]>;
  updateStudentGPA(studentId: string): Promise<void>;
  
  // Student session tracking
  createStudentSession(session: InsertStudentSession): Promise<StudentSession>;
  updateStudentSession(sessionId: string, updates: Partial<StudentSession>): Promise<void>;
  getActiveStudentsForDate(date: string): Promise<string[]>; // returns student IDs
  
  // OTP methods
  createOtp(otp: InsertOtp): Promise<Otp>;
  getValidOtp(identifier: string, otpCode: string, type: string): Promise<Otp | undefined>;
  markOtpAsUsed(id: string): Promise<void>;
  cleanupExpiredOtps(): Promise<void>;
  
  // Achievement system methods
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  getAchievements(): Promise<Achievement[]>;
  getAchievementsByCategory(category: string): Promise<Achievement[]>;
  updateAchievement(id: string, updates: Partial<Achievement>): Promise<Achievement | undefined>;
  deleteAchievement(id: string): Promise<boolean>;
  
  // Student achievement methods
  awardAchievement(studentId: string, achievementId: string): Promise<StudentAchievement | null>;
  getStudentAchievements(studentId: string): Promise<StudentAchievement[]>;
  checkAndAwardAchievements(studentId: string): Promise<StudentAchievement[]>;
  
  // Student progress methods
  getStudentProgress(studentId: string): Promise<StudentProgress | null>;
  updateStudentProgress(studentId: string, updates: Partial<StudentProgress>): Promise<void>;
  addExperiencePoints(studentId: string, points: number, activity: string): Promise<void>;
  updateLoginStreak(studentId: string): Promise<void>;
  getLeaderboard(limit?: number): Promise<{student: StudentUser, progress: StudentProgress}[]>;
  
  // Video progress methods
  createOrUpdateVideoProgress(progress: InsertVideoProgress): Promise<VideoProgress>;
  getVideoProgress(studentId: string, contentId: string): Promise<VideoProgress | undefined>;
  getStudentVideoProgress(studentId: string): Promise<VideoProgress[]>;
  updateVideoProgress(studentId: string, contentId: string, currentTime: number, completionPercentage: number): Promise<void>;
  
  // Results Management
  createResult(result: any): Promise<any>;
  getResults(): Promise<any[]>;
  getLatestResults(): Promise<any>;
  
  // Announcements
  createAnnouncement(announcement: any): Promise<any>;
  getAnnouncements(): Promise<any[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private classes: Map<string, Class> = new Map();
  private subjects: Map<string, Subject> = new Map();
  private chapters: Map<string, Chapter> = new Map();
  private contactSubmissions: Map<string, ContactSubmission> = new Map();
  private enrollments: Map<string, Enrollment> = new Map();
  private adminUsers: Map<string, AdminUser> = new Map();
  private content: Map<string, Content> = new Map();
  private contentFiles: Map<string, ContentFile> = new Map();
  private studentUsers: Map<string, StudentUser> = new Map();
  private otps: Map<string, Otp> = new Map();
  private studentAttendance: Map<string, StudentAttendance> = new Map();
  private studentGrades: Map<string, StudentGrade> = new Map();
  private studentSessions: Map<string, StudentSession> = new Map();
  private achievements: Map<string, Achievement> = new Map();
  private studentAchievements: Map<string, StudentAchievement> = new Map();
  private studentProgress: Map<string, StudentProgress> = new Map();
  private videoProgress: Map<string, VideoProgress> = new Map();
  private results: Map<string, any> = new Map();
  private announcements: Map<string, any> = new Map();

  constructor() {
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
    const classData = [
      { id: "class-9", name: "Class 9", description: "Science & Mathematics", price: 2999, streams: ["both"] },
      { id: "class-10", name: "Class 10", description: "Science & Mathematics", price: 3499, streams: ["both"] },
      { id: "class-11", name: "Class 11", description: "Science & Commerce", price: 4999, streams: ["science", "commerce"] },
      { id: "class-12", name: "Class 12", description: "Science & Commerce", price: 5999, streams: ["science", "commerce"] }
    ];
    classData.forEach(cls => this.classes.set(cls.id, cls as Class));

    // Initialize subjects
    const subjectsData = [
      { id: "science-9", name: "Science", classId: "class-9", stream: "both", price: 1199, icon: "fas fa-atom", chapterCount: 22, isAvailable: true },
      { id: "mathematics-9", name: "Mathematics", classId: "class-9", stream: "both", price: 899, icon: "fas fa-calculator", chapterCount: 12, isAvailable: true },
      { id: "science-10", name: "Science", classId: "class-10", stream: "both", price: 1299, icon: "fas fa-atom", chapterCount: 25, isAvailable: true },
      { id: "mathematics-10", name: "Mathematics", classId: "class-10", stream: "both", price: 899, icon: "fas fa-calculator", chapterCount: 12, isAvailable: true },
      { id: "physics-11", name: "Physics", classId: "class-11", stream: "science", price: 1299, icon: "fas fa-atom", chapterCount: 16, isAvailable: true }
    ];
    subjectsData.forEach(subj => this.subjects.set(subj.id, subj as Subject));
  }

  async getUser(id: string): Promise<User | undefined> { return this.users.get(id); }
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  async getClasses(): Promise<Class[]> { return Array.from(this.classes.values()); }
  async getClass(id: string): Promise<Class | undefined> { return this.classes.get(id); }
  async getSubjects(): Promise<Subject[]> { return Array.from(this.subjects.values()); }
  async getSubjectsByClass(classId: string): Promise<Subject[]> {
    return Array.from(this.subjects.values()).filter(s => s.classId === classId);
  }
  async getSubjectsByClassAndStream(classId: string, stream: string): Promise<Subject[]> {
    return Array.from(this.subjects.values()).filter(s => s.classId === classId && (s.stream === stream || s.stream === "both"));
  }
  async getSubject(id: string): Promise<Subject | undefined> { return this.subjects.get(id); }
  async getChaptersBySubject(subjectId: string): Promise<Chapter[]> {
    return Array.from(this.chapters.values()).filter(c => c.subjectId === subjectId).sort((a, b) => a.order - b.order);
  }
  async getChapter(id: string): Promise<Chapter | undefined> { return this.chapters.get(id); }
  async createChapter(chapter: { name: string; subjectId: string; order: number }): Promise<Chapter> {
    const id = randomUUID();
    const newChapter: Chapter = { id, name: chapter.name, subjectId: chapter.subjectId, order: chapter.order, hasNotes: false, hasPyqs: false, hasVideos: false };
    this.chapters.set(id, newChapter);
    await this.updateChapterCounts(chapter.subjectId);
    return newChapter;
  }
  async updateChapter(id: string, updates: Partial<Chapter>): Promise<Chapter | undefined> {
    const chapter = this.chapters.get(id);
    if (!chapter) return undefined;
    const updated = { ...chapter, ...updates };
    this.chapters.set(id, updated);
    return updated;
  }
  async deleteChapter(id: string): Promise<boolean> {
    const chapter = this.chapters.get(id);
    if (!chapter) return false;
    const deleted = this.chapters.delete(id);
    if (deleted) await this.updateChapterCounts(chapter.subjectId);
    return deleted;
  }
  async reorderChapters(subjectId: string, chapterIds: string[]): Promise<void> {
    chapterIds.forEach((id, idx) => {
      const c = this.chapters.get(id);
      if (c && c.subjectId === subjectId) {
        c.order = idx + 1;
        this.chapters.set(id, c);
      }
    });
  }
  async updateChapterCounts(subjectId: string): Promise<void> {
    const s = this.subjects.get(subjectId);
    if (s) {
      const chs = await this.getChaptersBySubject(subjectId);
      s.chapterCount = chs.length;
      this.subjects.set(subjectId, s);
    }
  }
  async createContactSubmission(contact: InsertContact): Promise<ContactSubmission> {
    const id = randomUUID();
    const sub = { ...contact, id, selectedClass: contact.selectedClass || null, createdAt: new Date().toISOString() };
    this.contactSubmissions.set(id, sub);
    return sub;
  }
  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const id = randomUUID();
    const enr = { ...enrollment, id, paymentStatus: "completed", createdAt: new Date().toISOString() };
    this.enrollments.set(id, enr);
    return enr;
  }
  async getAdminUser(id: string): Promise<AdminUser | undefined> { return this.adminUsers.get(id); }
  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    return Array.from(this.adminUsers.values()).find(u => u.username === username);
  }
  async createAdminUser(admin: InsertAdminUser): Promise<AdminUser> {
    const id = randomUUID();
    const a = { ...admin, id, role: admin.role || "admin", isActive: true, createdAt: new Date().toISOString() };
    this.adminUsers.set(id, a);
    return a as AdminUser;
  }
  async validateAdminLogin(username: string, pass: string): Promise<AdminUser | undefined> {
    const u = await this.getAdminUserByUsername(username);
    return (u && u.password === pass && u.isActive) ? u : undefined;
  }
  async createContent(content: InsertContent & { createdBy: string }): Promise<Content> {
    const id = randomUUID();
    const c = { ...content, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isPublished: content.isPublished ?? true, priority: content.priority ?? 0 } as Content;
    this.content.set(id, c);
    return c;
  }
  async getContent(id: string): Promise<Content | undefined> { return this.content.get(id); }
  async getContentByType(type: string, filters?: { classId?: string; subjectId?: string }): Promise<Content[]> {
    return Array.from(this.content.values())
      .filter(c => c.type === type && (!filters?.classId || c.classId === filters.classId) && (!filters?.subjectId || c.subjectId === filters.subjectId) && c.isPublished)
      .sort((a, b) => b.priority - a.priority);
  }
  async updateContent(id: string, updates: Partial<InsertContent>): Promise<Content | undefined> {
    const c = this.content.get(id);
    if (!c) return undefined;
    const upd = { ...c, ...updates, updatedAt: new Date().toISOString() } as Content;
    this.content.set(id, upd);
    return upd;
  }
  async deleteContent(id: string): Promise<boolean> { return this.content.delete(id); }
  async createContentFile(file: InsertContentFile): Promise<ContentFile> {
    const id = randomUUID();
    const f = { ...file, id, downloadCount: 0, uploadedAt: new Date().toISOString() };
    this.contentFiles.set(id, f);
    return f;
  }
  async getContentFiles(contentId: string): Promise<ContentFile[]> {
    return Array.from(this.contentFiles.values()).filter(f => f.contentId === contentId);
  }
  async deleteContentFile(id: string): Promise<boolean> { return this.contentFiles.delete(id); }
  async incrementDownloadCount(fileId: string): Promise<void> {
    const f = this.contentFiles.get(fileId);
    if (f) { f.downloadCount++; this.contentFiles.set(fileId, f); }
  }
  async getStudentUser(id: string): Promise<StudentUser | undefined> { return this.studentUsers.get(id); }
  async getStudentUserByEmail(email: string): Promise<StudentUser | undefined> {
    return Array.from(this.studentUsers.values()).find(u => u.email === email);
  }
  async getStudentUserByPhone(phone: string): Promise<StudentUser | undefined> {
    return Array.from(this.studentUsers.values()).find(u => u.phone === phone);
  }
  async createStudentUser(student: InsertStudentUser): Promise<StudentUser> {
    const id = randomUUID();
    const s = { ...student, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), profileCompleted: false, isActive: true, currentGPA: "0.0", overallGrade: "N/A", totalAttendance: 0, presentDays: 0, totalFeeDue: 0 } as StudentUser;
    this.studentUsers.set(id, s);
    return s;
  }
  async updateStudentUser(id: string, updates: Partial<StudentUser>): Promise<StudentUser | undefined> {
    const s = this.studentUsers.get(id);
    if (!s) return undefined;
    const upd = { ...s, ...updates, updatedAt: new Date().toISOString() };
    this.studentUsers.set(id, upd);
    return upd;
  }
  async updateStudentLastLogin(id: string): Promise<void> {
    const s = this.studentUsers.get(id);
    if (s) { s.lastLogin = new Date().toISOString(); this.studentUsers.set(id, s); }
  }
  async completeStudentProfile(id: string, data: any): Promise<StudentUser | undefined> {
    const s = this.studentUsers.get(id);
    if (!s) return undefined;
    const upd = { ...s, ...data, profileCompleted: true, updatedAt: new Date().toISOString() };
    this.studentUsers.set(id, upd);
    return upd;
  }
  async getAllStudents(): Promise<StudentUser[]> { return Array.from(this.studentUsers.values()).filter(u => u.profileCompleted); }
  async getStudentsByClass(classId: string): Promise<StudentUser[]> {
    return Array.from(this.studentUsers.values()).filter(u => u.classId === classId && u.profileCompleted);
  }
  async validateStudentEmailLogin(email: string, pass: string): Promise<StudentUser | null> {
    const u = await this.getStudentUserByEmail(email);
    if (u && u.password && await bcrypt.compare(pass, u.password)) return u;
    return null;
  }
  async createStudentUserWithPassword(user: InsertStudentUser & { password: string }): Promise<StudentUser> {
    const id = randomUUID();
    const hash = await bcrypt.hash(user.password, 10);
    const s = { ...user, id, password: hash, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), profileCompleted: true, isActive: true } as StudentUser;
    this.studentUsers.set(id, s);
    return s;
  }
  async markAttendance(att: InsertStudentAttendance): Promise<StudentAttendance> {
    const id = randomUUID();
    const res = { ...att, id, createdAt: new Date().toISOString() } as StudentAttendance;
    this.studentAttendance.set(id, res);
    return res;
  }
  async getStudentAttendance(studentId: string, start?: string, end?: string): Promise<StudentAttendance[]> {
    return Array.from(this.studentAttendance.values()).filter(a => a.studentId === studentId);
  }
  async getClassAttendanceForDate(classId: string, date: string): Promise<StudentAttendance[]> {
    return Array.from(this.studentAttendance.values()).filter(a => a.date === date);
  }
  async updateAttendanceStats(id: string): Promise<void> {}
  async addStudentResult(res: InsertStudentGrade): Promise<StudentGrade> {
    const id = randomUUID();
    const g = { ...res, id, createdAt: new Date().toISOString() } as StudentGrade;
    this.studentGrades.set(id, g);
    return g;
  }
  async getStudentResults(sid: string, sub?: string): Promise<StudentGrade[]> {
    return Array.from(this.studentGrades.values()).filter(g => g.studentId === sid);
  }
  async updateStudentGPA(sid: string): Promise<void> {}
  async createStudentSession(sess: InsertStudentSession): Promise<StudentSession> {
    const id = randomUUID();
    const s = { ...sess, id } as StudentSession;
    this.studentSessions.set(id, s);
    return s;
  }
  async updateStudentSession(id: string, upd: Partial<StudentSession>): Promise<void> {
    const s = this.studentSessions.get(id);
    if (s) this.studentSessions.set(id, { ...s, ...upd });
  }
  async getActiveStudentsForDate(d: string): Promise<string[]> {
    return Array.from(this.studentSessions.values()).filter(s => s.loginDate === d).map(s => s.studentId);
  }
  async createOtp(otp: InsertOtp): Promise<Otp> {
    const id = randomUUID();
    const res = { ...otp, id, isUsed: false, createdAt: new Date().toISOString() };
    this.otps.set(id, res);
    return res;
  }
  async getValidOtp(id: string, code: string, type: string): Promise<Otp | undefined> {
    return Array.from(this.otps.values()).find(o => o.identifier === id && o.otp === code && o.type === type && !o.isUsed);
  }
  async markOtpAsUsed(id: string): Promise<void> {
    const o = this.otps.get(id);
    if (o) { o.isUsed = true; this.otps.set(id, o); }
  }
  async cleanupExpiredOtps(): Promise<void> {}
  async createAchievement(ach: InsertAchievement): Promise<Achievement> {
    const id = randomUUID();
    const a = { ...ach, id, isActive: true, createdAt: new Date().toISOString() } as Achievement;
    this.achievements.set(id, a);
    return a;
  }
  async getAchievements(): Promise<Achievement[]> { return Array.from(this.achievements.values()); }
  async getAchievementsByCategory(cat: string): Promise<Achievement[]> {
    return Array.from(this.achievements.values()).filter(a => a.category === cat);
  }
  async updateAchievement(id: string, upd: Partial<Achievement>): Promise<Achievement | undefined> {
    const a = this.achievements.get(id);
    if (!a) return undefined;
    const res = { ...a, ...upd };
    this.achievements.set(id, res);
    return res;
  }
  async deleteAchievement(id: string): Promise<boolean> { return this.achievements.delete(id); }
  async awardAchievement(sid: string, aid: string): Promise<StudentAchievement | null> {
    const id = randomUUID();
    const res = { id, studentId: sid, achievementId: aid, earnedAt: new Date().toISOString(), points: 0 };
    this.studentAchievements.set(id, res);
    return res;
  }
  async getStudentAchievements(sid: string): Promise<StudentAchievement[]> {
    return Array.from(this.studentAchievements.values()).filter(a => a.studentId === sid);
  }
  async checkAndAwardAchievements(sid: string): Promise<StudentAchievement[]> { return []; }
  async getStudentProgress(sid: string): Promise<StudentProgress | null> {
    return this.studentProgress.get(sid) || null;
  }
  async updateStudentProgress(sid: string, upd: Partial<StudentProgress>): Promise<void> {
    const p = this.studentProgress.get(sid);
    if (p) this.studentProgress.set(sid, { ...p, ...upd });
  }
  async addExperiencePoints(sid: string, pts: number, act: string): Promise<void> {}
  async updateLoginStreak(sid: string): Promise<void> {}
  async getLeaderboard(limit = 10): Promise<{student: StudentUser, progress: StudentProgress}[]> { return []; }
  async createOrUpdateVideoProgress(prog: InsertVideoProgress): Promise<VideoProgress> {
    const id = randomUUID();
    const res = { ...prog, id, lastWatchedAt: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as VideoProgress;
    this.videoProgress.set(id, res);
    return res;
  }
  async getVideoProgress(sid: string, cid: string): Promise<VideoProgress | undefined> {
    return Array.from(this.videoProgress.values()).find(p => p.studentId === sid && p.contentId === cid);
  }
  async getStudentVideoProgress(sid: string): Promise<VideoProgress[]> {
    return Array.from(this.videoProgress.values()).filter(p => p.studentId === sid);
  }
  async updateVideoProgress(sid: string, cid: string, time: number, pct: number): Promise<void> {}
  async createResult(res: any): Promise<any> {
    const id = randomUUID();
    const data = { ...res, id };
    this.results.set(id, data);
    return data;
  }
  async getResults(): Promise<any[]> { return Array.from(this.results.values()); }
  async getLatestResults(): Promise<any> { return Array.from(this.results.values())[0]; }
  async createAnnouncement(ann: any): Promise<any> {
    const id = randomUUID();
    const data = { ...ann, id };
    this.announcements.set(id, data);
    return data;
  }
  async getAnnouncements(): Promise<any[]> { return Array.from(this.announcements.values()); }
}

export const storage = new MemStorage();
