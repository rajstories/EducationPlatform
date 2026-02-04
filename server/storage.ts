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
  getLatestResults(): Promise<any[]>;
  
  // Announcements
  createAnnouncement(announcement: any): Promise<any>;
  getAnnouncements(): Promise<any[]>;
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
  private studentAttendance: Map<string, StudentAttendance>;
  private studentGrades: Map<string, StudentGrade>;
  private studentSessions: Map<string, StudentSession>;
  private achievements: Map<string, Achievement>;
  private studentAchievements: Map<string, StudentAchievement>;
  private studentProgress: Map<string, StudentProgress>;
  private videoProgress: Map<string, VideoProgress>;

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
    this.attendanceRecords = new Map();
    this.studentGrades = new Map();
    this.studentSessions = new Map();
    this.achievements = new Map();
    this.studentAchievements = new Map();
    this.studentProgress = new Map();
    this.videoProgress = new Map();
    
    // Initialize classes
    const classes: Class[] = [
      { id: "class-9", name: "Class 9", description: "9th Standard" },
      { id: "class-10", name: "Class 10", description: "10th Standard" },
      { id: "class-11", name: "Class 11", description: "11th Standard" },
      { id: "class-12", name: "Class 12", description: "12th Standard" }
    ];
    classes.forEach(cls => this.classes.set(cls.id, cls));

    // Initialize sample students
    const sampleStudents = [
      { id: "student-1", name: "Aarav Sharma", email: "aarav@example.com", phone: "9876543210", classId: "class-10", rollNumber: "101", stream: "science", profilePhoto: null, password: "password123", isActive: true, profileCompleted: true },
      { id: "student-2", name: "Priya Patel", email: "priya@example.com", phone: "9876543211", classId: "class-10", rollNumber: "102", stream: "science", profilePhoto: null, password: "password123", isActive: true, profileCompleted: true },
      { id: "student-3", name: "Rohan Gupta", email: "rohan@example.com", phone: "9876543212", classId: "class-10", rollNumber: "103", stream: "science", profilePhoto: null, password: "password123", isActive: true, profileCompleted: true },
      { id: "student-4", name: "Ananya Singh", email: "ananya@example.com", phone: "9876543213", classId: "class-10", rollNumber: "104", stream: "science", profilePhoto: null, password: "password123", isActive: true, profileCompleted: true },
      { id: "student-5", name: "Arjun Kumar", email: "arjun@example.com", phone: "9876543214", classId: "class-10", rollNumber: "105", stream: "science", profilePhoto: null, password: "password123", isActive: true, profileCompleted: true },
      { id: "student-6", name: "Kavya Reddy", email: "kavya@example.com", phone: "9876543215", classId: "class-10", rollNumber: "106", stream: "science", profilePhoto: null, password: "password123", isActive: true, profileCompleted: true }
    ];

    sampleStudents.forEach(student => {
      const studentUser: StudentUser = {
        ...student,
        dateOfBirth: null,
        gender: null,
        address: null,
        city: null,
        state: "Delhi",
        pincode: null,
        admissionDate: new Date().toISOString(),
        currentSession: "2024-25",
        fatherName: null,
        motherName: null,
        guardianName: null,
        parentPhone: null,
        parentEmail: null,
        parentOccupation: null,
        emergencyContact: null,
        totalAttendance: 0,
        presentDays: 0,
        currentGPA: null,
        overallGrade: null,
        feeStatus: "pending",
        totalFeeDue: 0,
        lastPaymentDate: null,
        studentId: student.rollNumber,
        lastLogin: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.studentUsers.set(student.id, studentUser);
    });
    
    // Initialize subjects for each class
    const subjects: Subject[] = [
      { id: "sub-physics-9", name: "Physics", classId: "class-9", stream: "science", description: "Physics for Class 9", chapterCount: 10 },
      { id: "sub-chemistry-9", name: "Chemistry", classId: "class-9", stream: "science", description: "Chemistry for Class 9", chapterCount: 10 },
      { id: "sub-maths-9", name: "Mathematics", classId: "class-9", stream: "both", description: "Mathematics for Class 9", chapterCount: 12 },
      { id: "sub-physics-10", name: "Physics", classId: "class-10", stream: "science", description: "Physics for Class 10", chapterCount: 10 },
      { id: "sub-chemistry-10", name: "Chemistry", classId: "class-10", stream: "science", description: "Chemistry for Class 10", chapterCount: 10 },
      { id: "sub-maths-10", name: "Mathematics", classId: "class-10", stream: "both", description: "Mathematics for Class 10", chapterCount: 12 },
      { id: "sub-physics-11", name: "Physics", classId: "class-11", stream: "science", description: "Physics for Class 11", chapterCount: 15 },
      { id: "sub-chemistry-11", name: "Chemistry", classId: "class-11", stream: "science", description: "Chemistry for Class 11", chapterCount: 14 },
      { id: "sub-maths-11", name: "Mathematics", classId: "class-11", stream: "both", description: "Mathematics for Class 11", chapterCount: 16 },
      { id: "sub-physics-12", name: "Physics", classId: "class-12", stream: "science", description: "Physics for Class 12", chapterCount: 15 },
      { id: "sub-chemistry-12", name: "Chemistry", classId: "class-12", stream: "science", description: "Chemistry for Class 12", chapterCount: 16 },
      { id: "sub-maths-12", name: "Mathematics", classId: "class-12", stream: "both", description: "Mathematics for Class 12", chapterCount: 13 },
      { id: "sub-accounts-11", name: "Accountancy", classId: "class-11", stream: "commerce", description: "Accountancy for Class 11", chapterCount: 15 },
      { id: "sub-business-11", name: "Business Studies", classId: "class-11", stream: "commerce", description: "Business Studies for Class 11", chapterCount: 11 },
      { id: "sub-economics-11", name: "Economics", classId: "class-11", stream: "commerce", description: "Economics for Class 11", chapterCount: 10 },
      { id: "sub-accounts-12", name: "Accountancy", classId: "class-12", stream: "commerce", description: "Accountancy for Class 12", chapterCount: 13 },
      { id: "sub-business-12", name: "Business Studies", classId: "class-12", stream: "commerce", description: "Business Studies for Class 12", chapterCount: 12 },
      { id: "sub-economics-12", name: "Economics", classId: "class-12", stream: "commerce", description: "Economics for Class 12", chapterCount: 9 }
    ];
    subjects.forEach(subject => this.subjects.set(subject.id, subject));
  }

  private initializeData() {
    console.log('Starting data initialization...');
    this.initializeClasses();
    this.initializeSubjects();
    this.initializeSampleStudents();
    this.initializeAchievements();
    console.log('Data initialization completed.');
  }

  private initializeClasses() {
    // Initialize classes
    const classes: Class[] = [
      { id: "class-9", name: "Class 9", description: "9th Standard" },
      { id: "class-10", name: "Class 10", description: "10th Standard" },
      { id: "class-11", name: "Class 11", description: "11th Standard" },
      { id: "class-12", name: "Class 12", description: "12th Standard" }
    ];
    classes.forEach(cls => this.classes.set(cls.id, cls));
  }

  private initializeSubjects() {
    // Initialize subjects for each class
    const subjects: Subject[] = [
      { id: "sub-physics-9", name: "Physics", classId: "class-9", stream: "science", description: "Physics for Class 9", chapterCount: 10 },
      { id: "sub-chemistry-9", name: "Chemistry", classId: "class-9", stream: "science", description: "Chemistry for Class 9", chapterCount: 10 },
      { id: "sub-maths-9", name: "Mathematics", classId: "class-9", stream: "both", description: "Mathematics for Class 9", chapterCount: 12 },
      { id: "sub-physics-10", name: "Physics", classId: "class-10", stream: "science", description: "Physics for Class 10", chapterCount: 10 },
      { id: "sub-chemistry-10", name: "Chemistry", classId: "class-10", stream: "science", description: "Chemistry for Class 10", chapterCount: 10 },
      { id: "sub-maths-10", name: "Mathematics", classId: "class-10", stream: "both", description: "Mathematics for Class 10", chapterCount: 12 },
      { id: "sub-physics-11", name: "Physics", classId: "class-11", stream: "science", description: "Physics for Class 11", chapterCount: 15 },
      { id: "sub-chemistry-11", name: "Chemistry", classId: "class-11", stream: "science", description: "Chemistry for Class 11", chapterCount: 14 },
      { id: "sub-maths-11", name: "Mathematics", classId: "class-11", stream: "both", description: "Mathematics for Class 11", chapterCount: 16 },
      { id: "sub-physics-12", name: "Physics", classId: "class-12", stream: "science", description: "Physics for Class 12", chapterCount: 15 },
      { id: "sub-chemistry-12", name: "Chemistry", classId: "class-12", stream: "science", description: "Chemistry for Class 12", chapterCount: 16 },
      { id: "sub-maths-12", name: "Mathematics", classId: "class-12", stream: "both", description: "Mathematics for Class 12", chapterCount: 13 },
      { id: "sub-accounts-11", name: "Accountancy", classId: "class-11", stream: "commerce", description: "Accountancy for Class 11", chapterCount: 15 },
      { id: "sub-business-11", name: "Business Studies", classId: "class-11", stream: "commerce", description: "Business Studies for Class 11", chapterCount: 11 },
      { id: "sub-economics-11", name: "Economics", classId: "class-11", stream: "commerce", description: "Economics for Class 11", chapterCount: 10 },
      { id: "sub-accounts-12", name: "Accountancy", classId: "class-12", stream: "commerce", description: "Accountancy for Class 12", chapterCount: 13 },
      { id: "sub-business-12", name: "Business Studies", classId: "class-12", stream: "commerce", description: "Business Studies for Class 12", chapterCount: 12 },
      { id: "sub-economics-12", name: "Economics", classId: "class-12", stream: "commerce", description: "Economics for Class 12", chapterCount: 9 }
    ];
    subjects.forEach(subject => this.subjects.set(subject.id, subject));
  }

  private initializeSampleStudents() {
    // Initialize sample students for testing
    const sampleStudents = [
      { id: "student-1", name: "Aarav Sharma", email: "aarav@example.com", phone: "9876543210", classId: "class-10", rollNumber: "101", stream: "science", profilePhoto: null, password: "password123", isActive: true, profileCompleted: true },
      { id: "student-2", name: "Priya Patel", email: "priya@example.com", phone: "9876543211", classId: "class-10", rollNumber: "102", stream: "science", profilePhoto: null, password: "password123", isActive: true, profileCompleted: true },
      { id: "student-3", name: "Rohan Gupta", email: "rohan@example.com", phone: "9876543212", classId: "class-10", rollNumber: "103", stream: "science", profilePhoto: null, password: "password123", isActive: true, profileCompleted: true },
      { id: "student-4", name: "Ananya Singh", email: "ananya@example.com", phone: "9876543213", classId: "class-10", rollNumber: "104", stream: "science", profilePhoto: null, password: "password123", isActive: true, profileCompleted: true },
      { id: "student-5", name: "Arjun Kumar", email: "arjun@example.com", phone: "9876543214", classId: "class-10", rollNumber: "105", stream: "science", profilePhoto: null, password: "password123", isActive: true, profileCompleted: true },
      { id: "student-6", name: "Kavya Reddy", email: "kavya@example.com", phone: "9876543215", classId: "class-10", rollNumber: "106", stream: "science", profilePhoto: null, password: "password123", isActive: true, profileCompleted: true },
      { id: "student-7", name: "Vikram Mehta", email: "vikram@example.com", phone: "9876543216", classId: "class-9", rollNumber: "201", stream: "science", profilePhoto: null, password: "password123", isActive: true, profileCompleted: true },
      { id: "student-8", name: "Sneha Verma", email: "sneha@example.com", phone: "9876543217", classId: "class-9", rollNumber: "202", stream: "science", profilePhoto: null, password: "password123", isActive: true, profileCompleted: true },
      { id: "student-9", name: "Aditya Joshi", email: "aditya@example.com", phone: "9876543218", classId: "class-11", rollNumber: "301", stream: "science", profilePhoto: null, password: "password123", isActive: true, profileCompleted: true },
      { id: "student-10", name: "Ishita Rao", email: "ishita@example.com", phone: "9876543219", classId: "class-11", rollNumber: "302", stream: "commerce", profilePhoto: null, password: "password123", isActive: true, profileCompleted: true },
      { id: "student-11", name: "Karan Malhotra", email: "karan@example.com", phone: "9876543220", classId: "class-12", rollNumber: "401", stream: "science", profilePhoto: null, password: "password123", isActive: true, profileCompleted: true },
      { id: "student-12", name: "Meera Nair", email: "meera@example.com", phone: "9876543221", classId: "class-12", rollNumber: "402", stream: "commerce", profilePhoto: null, password: "password123", isActive: true, profileCompleted: true }
    ];

    console.log('Initializing sample students...');
    sampleStudents.forEach(student => {
      const studentUser: StudentUser = {
        ...student,
        dateOfBirth: null,
        gender: null,
        address: null,
        city: null,
        state: "Delhi",
        pincode: null,
        admissionDate: new Date().toISOString(),
        currentSession: "2024-25",
        fatherName: null,
        motherName: null,
        guardianName: null,
        parentPhone: null,
        parentEmail: null,
        parentOccupation: null,
        emergencyContact: null,
        totalAttendance: 0,
        presentDays: 0,
        currentGPA: null,
        overallGrade: null,
        feeStatus: "pending",
        totalFeeDue: 0,
        lastPaymentDate: null,
        studentId: student.rollNumber,
        lastLogin: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      console.log(`Adding student: ${student.name} with ID: ${student.id} to class: ${student.classId}`);
      this.studentUsers.set(student.id, studentUser);
    });
    console.log(`Total students after initialization: ${this.studentUsers.size}`);
  }

  private initializeAchievements() {
    // Initialize default achievements
    const defaultAchievements: Achievement[] = [
      // Attendance Achievements
      {
        id: "ach-perfect-week",
        title: "Perfect Week",
        description: "Maintain 100% attendance for 7 consecutive days",
        category: "attendance",
        type: "bronze",
        icon: "📅",
        color: "#CD7F32",
        requirements: { perfectDays: 7 },
        points: 100,
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "ach-attendance-master",
        title: "Attendance Master",
        description: "Achieve 95% attendance rate",
        category: "attendance", 
        type: "gold",
        icon: "🏆",
        color: "#FFD700",
        requirements: { attendancePercentage: 95 },
        points: 500,
        isActive: true,
        createdAt: new Date().toISOString()
      },

      // Academic Achievements
      {
        id: "ach-honor-roll",
        title: "Honor Roll",
        description: "Maintain GPA above 3.5",
        category: "academic",
        type: "silver",
        icon: "🌟",
        color: "#C0C0C0", 
        requirements: { gpa: 3.5 },
        points: 300,
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "ach-scholar",
        title: "Scholar",
        description: "Pass 10 tests with good grades",
        category: "academic",
        type: "gold",
        icon: "🎓",
        color: "#FFD700",
        requirements: { testsPassedCount: 10 },
        points: 400,
        isActive: true,
        createdAt: new Date().toISOString()
      },

      // Engagement Achievements
      {
        id: "ach-bookworm", 
        title: "Bookworm",
        description: "Download 20 study notes",
        category: "engagement",
        type: "bronze",
        icon: "📚",
        color: "#CD7F32",
        requirements: { notesDownloaded: 20 },
        points: 150,
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "ach-dedicated-learner",
        title: "Dedicated Learner", 
        description: "Login for 30 consecutive days",
        category: "engagement",
        type: "platinum",
        icon: "💎",
        color: "#E5E4E2",
        requirements: { loginStreak: 30 },
        points: 1000,
        isActive: true,
        createdAt: new Date().toISOString()
      },

      // Milestone Achievements
      {
        id: "ach-level-5",
        title: "Rising Star",
        description: "Reach Level 5",
        category: "milestone",
        type: "silver",
        icon: "⭐",
        color: "#C0C0C0",
        requirements: { level: 5 },
        points: 250,
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "ach-point-master",
        title: "Point Master",
        description: "Earn 5000 total points",
        category: "milestone",
        type: "gold",
        icon: "💰",
        color: "#FFD700",
        requirements: { totalPoints: 5000 },
        points: 500,
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];

    defaultAchievements.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });
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

  async getChapter(id: string): Promise<Chapter | undefined> {
    return this.chapters.get(id);
  }

  async createChapter(chapter: { name: string; subjectId: string; order: number }): Promise<Chapter> {
    const id = randomUUID();
    const newChapter: Chapter = {
      id,
      name: chapter.name,
      subjectId: chapter.subjectId,
      order: chapter.order,
      hasNotes: false,
      hasPyqs: false,
      hasVideos: false
    };
    this.chapters.set(id, newChapter);
    
    // Update subject chapter count
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
    if (deleted) {
      // Update subject chapter count
      await this.updateChapterCounts(chapter.subjectId);
    }
    return deleted;
  }

  async reorderChapters(subjectId: string, chapterIds: string[]): Promise<void> {
    chapterIds.forEach((chapterId, index) => {
      const chapter = this.chapters.get(chapterId);
      if (chapter && chapter.subjectId === subjectId) {
        chapter.order = index + 1;
        this.chapters.set(chapterId, chapter);
      }
    });
  }

  async updateChapterCounts(subjectId: string): Promise<void> {
    const subject = this.subjects.get(subjectId);
    if (subject) {
      const chapters = await this.getChaptersBySubject(subjectId);
      subject.chapterCount = chapters.length;
      this.subjects.set(subjectId, subject);
    }
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
      isPublished: contentData.isPublished ?? true,
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
      id,
      name: insertStudentUser.name,
      email: insertStudentUser.email || null,
      phone: insertStudentUser.phone || null,
      dateOfBirth: null,
      gender: null,
      address: null,
      city: null,
      state: "Delhi",
      pincode: null,
      profilePhoto: null,
      classId: insertStudentUser.classId || null,
      rollNumber: null,
      stream: null,
      admissionDate: null,
      currentSession: null,
      fatherName: null,
      motherName: null,
      guardianName: null,
      parentPhone: null,
      parentEmail: null,
      parentOccupation: null,
      emergencyContact: null,
      totalAttendance: 0,
      presentDays: 0,
      currentGPA: "0.0",
      overallGrade: "N/A",
      feeStatus: "pending",
      totalFeeDue: 0,
      lastPaymentDate: null,
      studentId: null,
      profileCompleted: false,
      isActive: true,
      lastLogin: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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

  async updateStudentUser(id: string, updates: Partial<StudentUser>): Promise<StudentUser | undefined> {
    const student = this.studentUsers.get(id);
    if (student) {
      Object.assign(student, updates, { updatedAt: new Date().toISOString() });
      this.studentUsers.set(id, student);
      return student;
    }
    return undefined;
  }

  async completeStudentProfile(id: string, profileData: any): Promise<StudentUser | undefined> {
    const student = this.studentUsers.get(id);
    if (student) {
      // Generate student ID if not exists
      if (!student.studentId) {
        student.studentId = `PA${new Date().getFullYear()}${String(this.studentUsers.size + 1).padStart(3, '0')}`;
      }
      
      // Generate roll number if not exists  
      if (!student.rollNumber) {
        student.rollNumber = `${profileData.classId?.replace('class-', '')}-${String(this.studentUsers.size + 1).padStart(3, '0')}`;
      }
      
      // Update profile data
      Object.assign(student, profileData, {
        profileCompleted: true,
        admissionDate: new Date().toISOString(),
        currentSession: '2024-25',
        updatedAt: new Date().toISOString()
      });
      
      this.studentUsers.set(id, student);
      return student;
    }
    return undefined;
  }

  async getAllStudents(): Promise<StudentUser[]> {
    return Array.from(this.studentUsers.values())
      .filter(student => student.profileCompleted)
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }

  // Password-based authentication methods
  async validateStudentEmailLogin(email: string, password: string): Promise<StudentUser | null> {
    const user = await this.getStudentUserByEmail(email);
    
    if (!user || !user.password) {
      return null;
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  async createStudentUserWithPassword(userWithPassword: InsertStudentUser & { password: string }): Promise<StudentUser> {
    const { password, ...userData } = userWithPassword;
    
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create user with hashed password
    const id = randomUUID();
    const studentUser: StudentUser = {
      ...userData,
      id,
      password: hashedPassword,
      dateOfBirth: userData.dateOfBirth || null,
      gender: userData.gender || null,
      address: userData.address || null,
      city: userData.city || null,
      state: userData.state || "Delhi",
      pincode: userData.pincode || null,
      profilePhoto: userData.profilePhoto || null,
      classId: userData.classId || null,
      rollNumber: userData.rollNumber || null,
      stream: userData.stream || null,
      admissionDate: userData.admissionDate || null,
      currentSession: userData.currentSession || null,
      fatherName: userData.fatherName || null,
      motherName: userData.motherName || null,
      guardianName: userData.guardianName || null,
      parentPhone: userData.parentPhone || null,
      parentEmail: userData.parentEmail || null,
      parentOccupation: userData.parentOccupation || null,
      emergencyContact: userData.emergencyContact || null,
      totalAttendance: userData.totalAttendance || 0,
      presentDays: userData.presentDays || 0,
      currentGPA: userData.currentGPA || "0.0",
      overallGrade: userData.overallGrade || "N/A",
      feeStatus: userData.feeStatus || "pending",
      totalFeeDue: userData.totalFeeDue || 0,
      lastPaymentDate: userData.lastPaymentDate || null,
      studentId: userData.studentId || null,
      profileCompleted: userData.profileCompleted || false,
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      lastLogin: userData.lastLogin || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.studentUsers.set(id, studentUser);
    return studentUser;
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
    const expiredIds: string[] = [];
    this.otps.forEach((otp, id) => {
      if (new Date(otp.expiresAt) <= now) {
        expiredIds.push(id);
      }
    });
    expiredIds.forEach(id => this.otps.delete(id));
  }

  // Attendance methods implementation
  async markAttendance(attendance: InsertStudentAttendance): Promise<StudentAttendance> {
    const id = randomUUID();
    const record: StudentAttendance = {
      ...attendance,
      id,
      createdAt: new Date().toISOString(),
      subjectId: attendance.subjectId || null,
      remarks: attendance.remarks || null,
      markedBy: attendance.markedBy || null
    };
    this.studentAttendance.set(id, record);
    
    // Update student attendance stats
    await this.updateAttendanceStats(attendance.studentId);
    return record;
  }

  async getStudentAttendance(studentId: string, startDate?: string, endDate?: string): Promise<StudentAttendance[]> {
    const records = Array.from(this.studentAttendance.values())
      .filter(record => record.studentId === studentId);
    
    if (startDate && endDate) {
      return records.filter(record => 
        record.date >= startDate && record.date <= endDate
      ).sort((a, b) => b.date.localeCompare(a.date));
    }
    
    return records.sort((a, b) => b.date.localeCompare(a.date));
  }

  async getClassAttendanceForDate(classId: string, date: string): Promise<StudentAttendance[]> {
    const classStudents = Array.from(this.studentUsers.values())
      .filter(student => student.classId === classId);
    
    return Array.from(this.studentAttendance.values())
      .filter(record => 
        record.date === date && 
        classStudents.some(student => student.id === record.studentId)
      );
  }

  async updateAttendanceStats(studentId: string): Promise<void> {
    const student = this.studentUsers.get(studentId);
    if (!student) return;

    const attendanceRecords = await this.getStudentAttendance(studentId);
    const presentDays = attendanceRecords.filter(record => record.status === 'present').length;
    const totalDays = attendanceRecords.length;

    const updatedStudent = {
      ...student,
      presentDays,
      totalAttendance: totalDays,
      updatedAt: new Date().toISOString()
    };

    this.studentUsers.set(studentId, updatedStudent);
  }

  // Student results methods implementation
  async addStudentResult(result: InsertStudentGrade): Promise<StudentGrade> {
    const id = randomUUID();
    const grade: StudentGrade = {
      ...result,
      id,
      createdAt: new Date().toISOString(),
      grade: result.grade || null,
      percentage: result.percentage || null,
      remarks: result.remarks || null
    };
    this.studentGrades.set(id, grade);
    
    // Update student GPA
    await this.updateStudentGPA(result.studentId);
    return grade;
  }

  async getStudentResults(studentId: string, subjectId?: string): Promise<StudentGrade[]> {
    const results = Array.from(this.studentGrades.values())
      .filter(result => result.studentId === studentId);
    
    if (subjectId) {
      return results.filter(result => result.subjectId === subjectId)
        .sort((a, b) => b.testDate.localeCompare(a.testDate));
    }
    
    return results.sort((a, b) => b.testDate.localeCompare(a.testDate));
  }

  async updateStudentGPA(studentId: string): Promise<void> {
    const student = this.studentUsers.get(studentId);
    if (!student) return;

    const results = await this.getStudentResults(studentId);
    if (results.length === 0) return;

    // Calculate GPA (simple average of percentages converted to 4.0 scale)
    const totalPercentage = results.reduce((sum, result) => {
      const percentage = parseFloat(result.percentage || '0');
      return sum + percentage;
    }, 0);
    
    const averagePercentage = totalPercentage / results.length;
    const gpa = (averagePercentage / 100) * 4; // Convert to 4.0 scale
    
    // Determine overall grade
    let overallGrade = 'F';
    if (averagePercentage >= 90) overallGrade = 'A+';
    else if (averagePercentage >= 85) overallGrade = 'A';
    else if (averagePercentage >= 80) overallGrade = 'B+';
    else if (averagePercentage >= 75) overallGrade = 'B';
    else if (averagePercentage >= 70) overallGrade = 'C+';
    else if (averagePercentage >= 65) overallGrade = 'C';
    else if (averagePercentage >= 60) overallGrade = 'D';

    const updatedStudent = {
      ...student,
      currentGPA: gpa.toFixed(2),
      overallGrade,
      updatedAt: new Date().toISOString()
    };

    this.studentUsers.set(studentId, updatedStudent);
  }

  // Student session methods implementation
  async createStudentSession(session: InsertStudentSession): Promise<StudentSession> {
    const id = randomUUID();
    const sessionRecord: StudentSession = {
      ...session,
      id,
      logoutTime: session.logoutTime || null,
      duration: session.duration || null,
      ipAddress: session.ipAddress || null,
      userAgent: session.userAgent || null
    };
    this.studentSessions.set(id, sessionRecord);
    
    // Update login streak and award XP
    await this.updateLoginStreak(session.studentId);
    
    return sessionRecord;
  }

  async updateStudentSession(sessionId: string, updates: Partial<StudentSession>): Promise<void> {
    const session = this.studentSessions.get(sessionId);
    if (session) {
      const updatedSession = { ...session, ...updates };
      this.studentSessions.set(sessionId, updatedSession);
    }
  }

  async getActiveStudentsForDate(date: string): Promise<string[]> {
    return Array.from(this.studentSessions.values())
      .filter(session => session.loginDate === date)
      .map(session => session.studentId);
  }

  // Achievement system methods implementation
  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const id = randomUUID();
    const newAchievement: Achievement = {
      ...achievement,
      id,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    this.achievements.set(id, newAchievement);
    return newAchievement;
  }

  async getAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values())
      .filter(achievement => achievement.isActive)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async getAchievementsByCategory(category: string): Promise<Achievement[]> {
    return Array.from(this.achievements.values())
      .filter(achievement => achievement.category === category && achievement.isActive)
      .sort((a, b) => a.points - b.points);
  }

  async updateAchievement(id: string, updates: Partial<Achievement>): Promise<Achievement | undefined> {
    const achievement = this.achievements.get(id);
    if (!achievement) return undefined;
    
    const updated = { ...achievement, ...updates };
    this.achievements.set(id, updated);
    return updated;
  }

  async deleteAchievement(id: string): Promise<boolean> {
    return this.achievements.delete(id);
  }

  // Student achievement methods implementation
  async awardAchievement(studentId: string, achievementId: string): Promise<StudentAchievement | null> {
    const achievement = this.achievements.get(achievementId);
    const student = this.studentUsers.get(studentId);
    
    if (!achievement || !student) return null;

    // Check if student already has this achievement
    const existingAward = Array.from(this.studentAchievements.values())
      .find(award => award.studentId === studentId && award.achievementId === achievementId);
    
    if (existingAward) return null;

    // Award the achievement
    const id = randomUUID();
    const studentAchievement: StudentAchievement = {
      id,
      studentId,
      achievementId,
      points: achievement.points,
      earnedAt: new Date().toISOString()
    };
    
    this.studentAchievements.set(id, studentAchievement);
    
    // Update student progress
    await this.addExperiencePoints(studentId, achievement.points, `Achievement: ${achievement.title}`);
    
    return studentAchievement;
  }

  async getStudentAchievements(studentId: string): Promise<StudentAchievement[]> {
    return Array.from(this.studentAchievements.values())
      .filter(award => award.studentId === studentId)
      .sort((a, b) => b.earnedAt.localeCompare(a.earnedAt));
  }

  async checkAndAwardAchievements(studentId: string): Promise<StudentAchievement[]> {
    const student = this.studentUsers.get(studentId);
    const progress = await this.getStudentProgress(studentId);
    
    if (!student || !progress) return [];

    const newAchievements: StudentAchievement[] = [];
    const allAchievements = await this.getAchievements();
    const existingAwards = await this.getStudentAchievements(studentId);
    const existingAchievementIds = new Set(existingAwards.map(award => award.achievementId));

    for (const achievement of allAchievements) {
      if (existingAchievementIds.has(achievement.id)) continue;

      const requirements = achievement.requirements as any;
      let shouldAward = false;

      // Check different achievement criteria
      switch (achievement.category) {
        case 'attendance':
          if (requirements.attendancePercentage && student.presentDays > 0) {
            const attendanceRate = (student.presentDays / student.totalAttendance) * 100;
            shouldAward = attendanceRate >= requirements.attendancePercentage;
          }
          if (requirements.perfectDays) {
            shouldAward = progress.perfectAttendanceDays >= requirements.perfectDays;
          }
          break;

        case 'academic':
          if (requirements.gpa && parseFloat(student.currentGPA) >= requirements.gpa) {
            shouldAward = true;
          }
          if (requirements.testsPassedCount && progress.testsPassed >= requirements.testsPassedCount) {
            shouldAward = true;
          }
          break;

        case 'engagement':
          if (requirements.loginStreak && progress.loginStreak >= requirements.loginStreak) {
            shouldAward = true;
          }
          if (requirements.notesDownloaded && progress.notesDownloaded >= requirements.notesDownloaded) {
            shouldAward = true;
          }
          break;

        case 'milestone':
          if (requirements.level && progress.level >= requirements.level) {
            shouldAward = true;
          }
          if (requirements.totalPoints && progress.totalPoints >= requirements.totalPoints) {
            shouldAward = true;
          }
          break;
      }

      if (shouldAward) {
        const award = await this.awardAchievement(studentId, achievement.id);
        if (award) newAchievements.push(award);
      }
    }

    return newAchievements;
  }

  // Student progress methods implementation
  async getStudentProgress(studentId: string): Promise<StudentProgress | null> {
    let progress = this.studentProgress.get(studentId);
    
    if (!progress) {
      // Create initial progress record
      const id = randomUUID();
      progress = {
        id,
        studentId,
        totalPoints: 0,
        level: 1,
        experiencePoints: 0,
        streak: 0,
        lastActivityDate: null,
        completedAssignments: 0,
        perfectAttendanceDays: 0,
        testsPassed: 0,
        notesDownloaded: 0,
        loginStreak: 0,
        updatedAt: new Date().toISOString()
      };
      this.studentProgress.set(studentId, progress);
    }
    
    return progress;
  }

  async updateStudentProgress(studentId: string, updates: Partial<StudentProgress>): Promise<void> {
    const progress = await this.getStudentProgress(studentId);
    if (progress) {
      Object.assign(progress, updates, { updatedAt: new Date().toISOString() });
      this.studentProgress.set(studentId, progress);
    }
  }

  async addExperiencePoints(studentId: string, points: number, activity: string): Promise<void> {
    const progress = await this.getStudentProgress(studentId);
    if (!progress) return;

    const newXP = progress.experiencePoints + points;
    const newTotalPoints = progress.totalPoints + points;
    
    // Calculate level based on XP (every 1000 XP = 1 level)
    const newLevel = Math.floor(newXP / 1000) + 1;
    
    await this.updateStudentProgress(studentId, {
      experiencePoints: newXP,
      totalPoints: newTotalPoints,
      level: newLevel,
      lastActivityDate: new Date().toISOString()
    });

    // Check for new achievements after gaining XP
    await this.checkAndAwardAchievements(studentId);
  }

  async updateLoginStreak(studentId: string): Promise<void> {
    const progress = await this.getStudentProgress(studentId);
    if (!progress) return;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    let newStreak = 1;
    
    if (progress.lastActivityDate) {
      const lastActivityDate = progress.lastActivityDate.split('T')[0];
      
      if (lastActivityDate === yesterday) {
        // Consecutive day login
        newStreak = progress.loginStreak + 1;
      } else if (lastActivityDate === today) {
        // Already logged in today
        newStreak = progress.loginStreak;
      } else {
        // Streak broken
        newStreak = 1;
      }
    }

    await this.updateStudentProgress(studentId, {
      loginStreak: newStreak,
      lastActivityDate: new Date().toISOString()
    });

    // Award XP for daily login
    await this.addExperiencePoints(studentId, 10, 'Daily Login');
  }

  async getLeaderboard(limit: number = 10): Promise<{student: StudentUser, progress: StudentProgress}[]> {
    const leaderboard: {student: StudentUser, progress: StudentProgress}[] = [];
    
    for (const [studentId, progress] of this.studentProgress.entries()) {
      const student = this.studentUsers.get(studentId);
      if (student && student.isActive) {
        leaderboard.push({ student, progress });
      }
    }
    
    return leaderboard
      .sort((a, b) => b.progress.totalPoints - a.progress.totalPoints)
      .slice(0, limit);
  }

  // Video progress methods
  async createOrUpdateVideoProgress(progress: InsertVideoProgress): Promise<VideoProgress> {
    const key = `${progress.studentId}-${progress.contentId}`;
    const existing = this.videoProgress.get(key);
    
    const videoProgress: VideoProgress = {
      id: existing?.id || randomUUID(),
      studentId: progress.studentId,
      contentId: progress.contentId,
      currentTime: progress.currentTime,
      duration: progress.duration,
      completionPercentage: progress.completionPercentage,
      isCompleted: progress.isCompleted,
      lastWatchedAt: new Date().toISOString(),
      totalWatchTime: progress.totalWatchTime,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.videoProgress.set(key, videoProgress);
    return videoProgress;
  }

  async getVideoProgress(studentId: string, contentId: string): Promise<VideoProgress | undefined> {
    const key = `${studentId}-${contentId}`;
    return this.videoProgress.get(key);
  }

  async getStudentVideoProgress(studentId: string): Promise<VideoProgress[]> {
    return Array.from(this.videoProgress.values()).filter(
      progress => progress.studentId === studentId
    );
  }

  async updateVideoProgress(
    studentId: string, 
    contentId: string, 
    currentTime: number, 
    completionPercentage: number
  ): Promise<void> {
    const key = `${studentId}-${contentId}`;
    const existing = this.videoProgress.get(key);
    
    if (existing) {
      const isCompleted = completionPercentage >= 80; // Consider 80% as completed
      const progress: VideoProgress = {
        ...existing,
        currentTime,
        completionPercentage,
        isCompleted,
        lastWatchedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      this.videoProgress.set(key, progress);
      
      // Award XP when video is completed for the first time
      if (isCompleted && !existing.isCompleted) {
        await this.addExperiencePoints(studentId, 20, 'Video Completed');
      }
    }
  }

  // Results Management
  private results: Map<string, any> = new Map();
  
  async createResult(result: any): Promise<any> {
    const resultWithId = {
      ...result,
      id: result.id || randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.results.set(resultWithId.id, resultWithId);
    return resultWithId;
  }

  async getResults(): Promise<any[]> {
    return Array.from(this.results.values()).sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }

  async getLatestResults(): Promise<any> {
    const results = Array.from(this.results.values()).sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    return results.length > 0 ? results[0] : null;
  }

  async getStudentsByClass(classId: string): Promise<StudentUser[]> {
    console.log(`Getting students for classId: ${classId}`);
    console.log(`Total students in storage: ${this.studentUsers.size}`);
    
    const allStudents = Array.from(this.studentUsers.values());
    console.log(`All students:`, allStudents.map(s => ({ id: s.id, name: s.name, classId: s.classId, profileCompleted: s.profileCompleted })));
    
    const filteredStudents = allStudents
      .filter(student => student.classId === classId && student.profileCompleted);
    
    console.log(`Filtered students for ${classId}:`, filteredStudents.map(s => ({ id: s.id, name: s.name, classId: s.classId })));
    
    return filteredStudents.sort((a, b) => (a.rollNumber || '').localeCompare(b.rollNumber || ''));
  }

  // Announcements
  private announcements: Map<string, any> = new Map();
  
  async createAnnouncement(announcement: any): Promise<any> {
    const announcementWithId = {
      ...announcement,
      id: announcement.id || randomUUID(),
      createdAt: announcement.createdAt || new Date().toISOString(),
    };
    this.announcements.set(announcementWithId.id, announcementWithId);
    return announcementWithId;
  }

  async getAnnouncements(): Promise<any[]> {
    return Array.from(this.announcements.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}

export const storage = new MemStorage();
