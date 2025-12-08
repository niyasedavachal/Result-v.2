
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  PUBLIC = 'PUBLIC',
  GUEST = 'GUEST'
}

export interface Student {
  id: string;
  regNo: string;
  rollNo?: number; // Class Roll Number
  name: string;
  classId: string;
  dob: string; // YYYY-MM-DD
  gender?: 'Male' | 'Female' | 'Other';
  fatherName: string;
  motherName: string;
  photoUrl?: string;
  password?: string;
  isVerified?: boolean;
  
  // Contact Info
  phone?: string;
  address?: string;
  bloodGroup?: string;

  // Auditing Fields
  addedBy?: string;
  verifiedBy?: string;
  
  // Student Premium Features
  isPremium?: boolean; // If true, student paid ₹10/20
  premiumExpiry?: string;
  
  // Socials
  socialLinks?: {
      instagram?: string;
      linkedin?: string;
  };
  
  // Optional for UI rendering
  className?: string;
  schoolName?: string;
}

export interface SubjectConfig {
  name: string;
  maxMarks: number;
  passMarks: number;
}

export interface ClassData {
  id: string;
  name: string;
  teacherId: string;
  teacherName?: string;
  teacherPhoto?: string;
  password?: string;
  subjects: SubjectConfig[];
  studentCount?: number;
  submissionStatus?: 'DRAFT' | 'SUBMITTED';
  
  schoolName?: string;
  schoolPlace?: string;
  schoolId?: string;
  
  // Added for sorting context
  boysCount?: number;
  girlsCount?: number;
}

export interface Marks {
  studentId: string;
  subjects: Record<string, number | string>;
  total: number;
  grade: string;
  term: string;
  resultStatus?: 'PASS' | 'FAILED';
}

export interface ProfileRequest {
  id: string;
  studentId: string;
  studentName?: string;
  regNo?: string;
  field: string;
  oldValue?: string;
  newValue: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt?: string;
}

export type PaymentStatus = 'FREE' | 'PENDING' | 'PAID';

export interface AdmissionConfig {
    askPhoto: boolean;
    askBloodGroup: boolean;
}

export interface SchoolConfig {
  id?: string;
  schoolName: string;
  slug?: string;
  sheetUrl: string;
  licenseKey: string;
  isPro: boolean;
  themeColor: string;
  logoUrl?: string;
  adminEmail?: string;
  phone?: string;
  place?: string;
  
  // Address Fields
  pincode?: string;
  district?: string;
  state?: string;
  region?: string;

  createdAt?: string;
  expiryDate?: string; // PLAN VALIDITY
  planType?: 'STARTER' | 'SMART' | 'PRO'; // New Field
  
  paymentStatus?: PaymentStatus;
  transactionRef?: string;
  allowTeacherSubjectEdit?: boolean;
  allowPublicAdmission?: boolean; 
  admissionToken?: string;
  admissionConfig?: AdmissionConfig;
  
  // Approval Workflow
  admissionApprover?: 'ADMIN' | 'TEACHER' | 'BOTH';

  // Fee Management Config
  feeManagerRole?: 'ADMIN' | 'TEACHER' | 'HYBRID'; // HYBRID means BOTH

  resultPublishDate?: string;
  scheduledPublishDate?: string;
  
  examName?: string;
  lastActiveAt?: string;
  isPaused?: boolean;
  
  // Result Display Settings
  academicYear?: string;
  showPassFailStatus?: boolean;
  showRank?: boolean;
  resultDisplayType?: 'PASS_FAIL' | 'CLASS_DISTINCTION' | 'GRADE_ONLY' | 'PERCENTAGE';
  
  // Sorting Preference
  sortingMethod?: 'BOYS_FIRST' | 'GIRLS_FIRST' | 'ROLL_ONLY' | 'NAME_ONLY';
  
  showGrades?: boolean;
  
  // Profile Features
  coverPhoto?: string;
  coverTheme?: string;
  description?: string;
  allowStudentSocials?: boolean;
  layoutTemplate?: 'STANDARD' | 'MODERN' | 'MINIMAL';

  // Experimental AI Features (Client-Side)
  enableAiRemarks?: boolean;
  enableAiVoice?: boolean;
  enableAiPrediction?: boolean;
}

export interface SchoolProfile {
  id: string;
  name: string;
  slug?: string;
  place?: string;
  logoUrl?: string;
  coverPhoto?: string;
  coverTheme?: string;
  description?: string;
  themeColor?: string;
  isPro?: boolean;
  layoutTemplate?: 'STANDARD' | 'MODERN' | 'MINIMAL';
  stats: {
    students: number;
    teachers: number;
  };
  teachers: { id: string; name: string; photo?: string; className: string }[];
  students: { id: string; name: string; photo?: string; isPremium: boolean; className?: string; socialLinks?: any }[];
}

export interface Affiliate {
    id: string;
    name: string;
    email: string;
    phone: string;
    code: string;
    earnings: number;
    schoolsReferred: number;
    bankDetails?: string;
    createdAt: string;
}

// FEE MANAGEMENT TYPES
export interface FeeStructure {
    id: string;
    name: string; // e.g., "Term 1 Fee", "Bus Fee"
    amount: number;
    dueDate?: string;
    targetClassIds?: string[]; // Empty = All Classes
    collectedBy?: 'ADMIN' | 'TEACHER' | 'BOTH'; // New Permission Field
    createdAt: string;
}

export interface FeePayment {
    id: string;
    feeId: string;
    studentId: string;
    status: 'PAID' | 'PENDING';
    paidDate?: string;
    amountPaid?: number;
    collectedBy?: string; // "Admin" or Teacher Name
    transactionId?: string; // Unique Receipt ID
}

// ASSESSMENT FEATURE TYPES
export interface AssessmentSchedule {
    name: string; // "Session 1", "Term 1", etc.
    startDate: string;
    startTime?: string;
    endDate: string;
    endTime?: string;
}

export interface AssessmentProgram {
    id: string;
    schoolId: string;
    name: string;
    type: 'STAR' | 'EMOJI' | 'YESNO' | 'MARK';
    frequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'ONETIME';
    
    // Legacy single date support (optional)
    startDate?: string; 
    endDate?: string;
    
    // New Multiple Schedule Support
    schedules?: AssessmentSchedule[];

    targetClassIds?: string[]; // Empty means all classes
    questions: { 
        id: string; 
        text: string; 
        maxVal: number; 
        assignee?: 'TEACHER' | 'PARENT';
    }[]; 
    assignee: 'PARENT' | 'TEACHER' | 'BOTH';
    createdAt?: string;
}

export interface AssessmentLog {
    id: string;
    programId: string;
    studentId: string;
    date: string; // YYYY-MM-DD
    data: Record<string, number>; // QuestionID -> Score
    totalScore: number;
    maxPossibleScore?: number;
}

export interface LeaderboardEntry {
    studentId: string;
    name: string;
    className: string;
    photoUrl?: string;
    totalScore: number;
    rank: number;
    trend?: 'UP' | 'DOWN' | 'SAME';
}

// EXAM FEATURE TYPES (NEW)
export interface Question {
    id: string;
    text: string;
    options: string[]; // ["Option A", "Option B", "Option C", "Option D"]
    correctOptionIndex: number; // 0, 1, 2, or 3
    marks: number;
}

export interface ExamSettings {
    shuffleQuestions: boolean;
    showResultImmediately: boolean; // If true, student sees result after submit. If false, teacher must publish.
    allowRetake?: boolean;
}

export interface Exam {
    id: string;
    schoolId: string;
    classId: string; // One exam per class for simplicity in v1
    title: string;
    description?: string;
    startTime: string; // ISO string
    endTime: string; // ISO string
    durationMinutes: number;
    questions: Question[];
    isPublished: boolean;
    settings?: ExamSettings;
    createdAt: string;
}

export interface ExamSubmission {
    id: string;
    examId: string;
    studentId: string;
    studentName?: string; // For UI
    rollNo?: number; // For UI
    answers: Record<string, number>; // QuestionID -> Selected Option Index
    score: number;
    totalMarks: number;
    submittedAt: string;
}

// SUPER ADMIN TYPES
export interface SystemStats {
    totalSchools: number;
    totalStudents: number;
    proSchools: number;
    premiumStudents: number;
    totalRevenue: number;
    inactiveSchools: number;
    authUsersUsed: number; // For 50k limit
    dbSizeMB: number;
    
    // New Advanced Metrics
    serverLatency?: number; // ms
    activeUsersNow?: number;
    ticketsPending?: number;
    dailyGrowthRate?: number; // Percentage
}

export interface SupportTicket {
    id: string;
    schoolId?: string;
    schoolName?: string;
    userEmail: string;
    subject: string;
    message: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    category: 'BILLING' | 'BUG' | 'FEATURE' | 'GENERAL';
    aiSuggestedReply?: string; // Generated by AI
    createdAt: string;
}

export interface Feedback {
    id: string;
    schoolId?: string;
    schoolName?: string;
    message: string;
    type: 'BUG' | 'FEATURE' | 'SUPPORT';
    status: 'OPEN' | 'RESOLVED';
    createdAt: string;
}

export interface InactiveSchool {
    id: string;
    name: string;
    email: string;
    lastActive: string;
    daysInactive: number;
    isPaused: boolean;
}

export interface PricingPlan {
    id: string; // FREE, PLUS, ELITE
    name: string;
    originalPrice: number;
    sellingPrice: number;
    discountPercent: number;
    features: string[]; // Stored as JSON string or array
    isPopular: boolean;
    seatsLeft: number;
    offerEndsAt?: string;
    // New Strategy Fields
    target?: string; // e.g., "For Madrassas"
    cta?: string; // e.g., "Start Free"
    period?: string; // "Forever" or "per year"
}

// NEW: Marketing Configuration for Super Admin
export interface MarketingConfig {
    flashSaleActive: boolean;
    flashSaleEndTime?: string; // ISO String
    flashSaleText?: string;
    
    smartPlanPrice: number;
    smartPlanOriginal: number;
    smartPlanSeatsLeft: number;
    
    proPlanPrice: number;
    proPlanOriginal: number;
    proPlanSeatsLeft: number;
    
    showUrgencyBanner: boolean;
    
    // Strategy Fields
    billingCycle?: string; // e.g., "/year", "/term", "/lifetime"
    globalTrialMode?: boolean; // "Golden Hour" feature
    
    // Dynamic Plan Feature Assignment
    planFeatures?: {
        starter: string[];
        smart: string[];
        pro: string[];
    };
}

// NEW: School Management
export interface SchoolSummary {
    id: string;
    name: string;
    adminEmail: string;
    place: string;
    isPro: boolean;
    expiryDate?: string;
    studentCount: number;
    classCount: number;
    lastActive: string;
}

export interface AdCampaign {
    id: string;
    imageUrl: string;
    targetUrl: string;
    isActive: boolean;
    views: number;
    clicks: number;
    createdAt: string;
    status?: 'PENDING' | 'ACTIVE' | 'REJECTED';
    contactInfo?: string; // Email or Phone of Advertiser
}

export interface CampusPost {
    id: string;
    schoolId: string;
    authorName: string;
    title?: string;
    message: string;
    type: 'STUDENT' | 'TEACHER' | 'ADMIN';
    category: 'NOTICE' | 'BUZZ';
    likes: number;
    createdAt: string;
}

// Support & Ticketing
export interface TicketMessage {
    id: string;
    ticketId: string;
    sender: 'USER' | 'ADMIN' | 'AI';
    message: string;
    createdAt: string;
}

export interface Ticket {
    id: string;
    userId: string; // SchoolID or UserID
    userName: string;
    userRole: string; // 'ADMIN' | 'TEACHER' | 'STUDENT'
    subject: string;
    status: 'OPEN' | 'ANSWERED' | 'CLOSED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    createdAt: string;
    lastUpdated: string;
    
    // AI Helpers
    aiSummary?: string;
    aiSuggestedSolution?: string;
}

// NEW: Staff & Infra Types
export interface StaffProfile {
    id: string;
    name: string;
    role: string;
    email: string;
    status: 'ONLINE' | 'OFFLINE' | 'BUSY';
    performance: number;
    ticketsResolved: number;
    lastActive: string;
}

export interface InfraNode {
    id: string;
    name: string;
    type: 'DB' | 'STORAGE' | 'CACHE';
    region: string;
    status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
    load: number;
    capacity: number;
}
