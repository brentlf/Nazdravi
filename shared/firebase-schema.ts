import { z } from "zod";

// Firebase Collections Schema for Vee Nutrition

// User Schema
export const userSchema = z.object({
  uid: z.string(),
  role: z.enum(["client", "admin"]),
  name: z.string(),
  email: z.string().email(),
  photoURL: z.string().optional(),
  preferredLanguage: z.enum(["en", "cs"]),
  createdAt: z.date(),
  // Additional nutrition-specific fields
  dateOfBirth: z.date().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  gpContact: z.string().optional(),
  servicePlan: z.enum(["pay-as-you-go", "complete-program"]).default("pay-as-you-go"),
  programStartDate: z.string().optional(), // When complete program started (ISO string)
  programEndDate: z.string().optional(), // When complete program expires (ISO string)
});

// Appointment Schema
export const appointmentSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  date: z.string(),
  timeslot: z.string(),
  type: z.enum(["Initial", "Follow-up"]),
  goals: z.string(),
  status: z.enum(["pending", "confirmed", "done", "cancelled", "reschedule_requested", "cancelled_reschedule", "no-show"]),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  createdAt: z.date(),
  // Additional consultation fields
  consultationNotes: z.string().optional(),
  followUpRequired: z.boolean().optional(),
  consultationLanguage: z.enum(["english", "czech"]),
  // Video consultation fields
  teamsJoinUrl: z.string().optional(),
  teamsMeetingId: z.string().optional(),
  price: z.number().optional(),
});

// Message Schema
export const messageSchema = z.object({
  id: z.string().optional(),
  fromUser: z.string(),
  toUser: z.string(),
  text: z.string(),
  chatRoom: z.string(),
  createdAt: z.date(),
  read: z.boolean().default(false),
  messageType: z.enum(["text", "file", "system"]).default("text"),
});

// Nutrition Plan Schema
export const planSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  storagePath: z.string(),
  planType: z.enum(["meal-plan", "supplement-plan", "lifestyle-plan"]),
  createdAt: z.date(),
  lastUpdated: z.date(),
  isActive: z.boolean().default(true),
});

// Progress Tracking Schema
export const progressSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  date: z.string(),
  weightKg: z.number().optional(),
  waterLitres: z.number().optional(),
  notes: z.string().optional(),
  createdAt: z.date(),
  // Additional health metrics
  energyLevel: z.number().min(1).max(10).optional(),
  sleepHours: z.number().optional(),
  exerciseMinutes: z.number().optional(),
  moodRating: z.number().min(1).max(10).optional(),
});

// Resource Schema
export const resourceSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string(),
  url: z.string(),
  tags: z.array(z.string()),
  lang: z.enum(["en", "cs"]),
  type: z.enum(["pdf", "video", "link", "recipe"]),
  createdAt: z.date(),
  isPublic: z.boolean().default(true),
  targetAudience: z.enum(["all", "clients-only", "specific-conditions"]).default("all"),
});

// Blog Post Schema
export const blogPostSchema = z.object({
  id: z.string().optional(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  content: z.string(),
  featuredImage: z.string().optional(),
  tags: z.array(z.string()),
  lang: z.enum(["en", "cs"]),
  published: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
  author: z.string(),
  readingTime: z.number().optional(),
});

// Translation Schema
export const translationSchema = z.object({
  id: z.string().optional(),
  lang: z.enum(["en", "cs"]),
  namespace: z.string(),
  key: z.string(),
  value: z.string(),
});

// Newsletter Subscriber Schema
export const newsletterSchema = z.object({
  id: z.string().optional(),
  email: z.string().email(),
  name: z.string().optional(),
  subscribedAt: z.date(),
  isActive: z.boolean().default(true),
  preferences: z.object({
    weeklyTips: z.boolean().default(true),
    recipeUpdates: z.boolean().default(true),
    blogNotifications: z.boolean().default(false),
  }).optional(),
});

// Consent Record Schema - Important for compliance
export const consentRecordSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  consentType: z.enum(["initial-consultation", "data-processing", "marketing", "language-confirmation"]),
  consentGiven: z.boolean(),
  consentDate: z.date(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  consentVersion: z.string(), // Track which version of consent was agreed to
  withdrawnDate: z.date().optional(),
});

// Health Assessment Schema
export const healthAssessmentSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  assessmentDate: z.date(),
  age: z.number(),
  height: z.string(),
  weight: z.string(),
  chronicConditions: z.string(),
  currentMedication: z.string(),
  recentBloodTests: z.boolean(),
  gpContact: z.string(),
  preferredLanguage: z.enum(["english", "czech"]),
  currentLocation: z.enum(["uk", "south-africa", "czech-republic", "netherlands"]),
  emergencyContact: z.string().optional(),
  createdAt: z.date(),
});

// Unavailable Slots Schema (Admin availability management)
export const unavailableSlotSchema = z.object({
  id: z.string().optional(),
  date: z.string(), // Date in YYYY-MM-DD format
  timeslots: z.array(z.string()), // Array of time slots like ["09:00", "10:00"]
  reason: z.string().optional(), // Optional reason for unavailability
  createdAt: z.date(),
});

// Invoice Schema
export const invoiceSchema = z.object({
  id: z.string().optional(),
  appointmentId: z.string().optional(), // Optional for subscription invoices
  userId: z.string(),
  clientName: z.string(),
  clientEmail: z.string(),
  invoiceNumber: z.string(),
  amount: z.number(),
  currency: z.string().default("EUR"),
  description: z.string(),
  sessionDate: z.string().optional(), // Optional for subscription invoices
  sessionType: z.enum(["Initial", "Follow-up"]).optional(), // Optional for subscription invoices
  invoiceType: z.enum(["session", "subscription", "penalty"]).default("session"),
  subscriptionMonth: z.number().optional(), // For subscription invoices
  subscriptionYear: z.number().optional(), // For subscription invoices
  status: z.enum(["unpaid", "pending", "paid", "overdue", "cancelled"]),
  createdAt: z.date(),
  dueDate: z.date(),
  paidAt: z.date().optional(),
  stripePaymentIntentId: z.string().optional(),
  paymentUrl: z.string().optional(),
  
  // Enhanced accounting flow fields for reissued invoices
  type: z.enum(["invoice", "credit"]).default("invoice"), // Regular invoice or credit note
  originalInvoiceId: z.string().optional(), // Reference to original invoice for credit notes/reissues
  creditNoteNumber: z.string().optional(), // Credit note number when credited
  isReissued: z.boolean().optional(), // Indicates if this is a reissued invoice
  originalAmount: z.number().optional(), // Original amount before reissue
  reissueReason: z.string().optional(), // Reason for reissue
  isActive: z.boolean().default(true), // Whether this invoice is active (not superseded)
  replacedByInvoiceId: z.string().optional(), // ID of the new invoice that replaced this one
});

// Firebase Collection Names
export const COLLECTIONS = {
  USERS: 'users',
  APPOINTMENTS: 'appointments',
  MESSAGES: 'messages',
  PLANS: 'plans',
  PROGRESS: 'progress',
  RESOURCES: 'resources',
  BLOG_POSTS: 'blogPosts',
  TRANSLATIONS: 'translations',
  NEWSLETTER: 'newsletter',
  CONSENT_RECORDS: 'consentRecords',
  HEALTH_ASSESSMENTS: 'healthAssessments',
  UNAVAILABLE_SLOTS: 'unavailableSlots',
  INVOICES: 'invoices',
} as const;

// Type exports
export type User = z.infer<typeof userSchema>;
export type Appointment = z.infer<typeof appointmentSchema>;
export type Message = z.infer<typeof messageSchema>;
export type Plan = z.infer<typeof planSchema>;
export type Progress = z.infer<typeof progressSchema>;
export type Resource = z.infer<typeof resourceSchema>;
export type BlogPost = z.infer<typeof blogPostSchema>;
export type Translation = z.infer<typeof translationSchema>;
export type NewsletterSubscriber = z.infer<typeof newsletterSchema>;
export type ConsentRecord = z.infer<typeof consentRecordSchema>;
export type HealthAssessment = z.infer<typeof healthAssessmentSchema>;
export type UnavailableSlot = z.infer<typeof unavailableSlotSchema>;
export type Invoice = z.infer<typeof invoiceSchema>;

// Form validation schemas (for frontend forms)
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const appointmentFormSchema = z.object({
  date: z.string().min(1, "Please select a date"),
  timeslot: z.string().min(1, "Please select a time slot"),
  type: z.enum(["Initial", "Follow-up"]),
  goals: z.string().min(10, "Please provide more details about your goals"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  consultationLanguage: z.enum(["english", "czech"]),
});

export const messageFormSchema = z.object({
  text: z.string().min(1, "Message cannot be empty"),
});

export const progressFormSchema = z.object({
  date: z.string().min(1, "Please select a date"),
  weightKg: z.number().positive().optional(),
  waterLitres: z.number().positive().optional(),
  notes: z.string().optional(),
  energyLevel: z.number().min(1).max(10).optional(),
  sleepHours: z.number().min(0).max(24).optional(),
  exerciseMinutes: z.number().min(0).optional(),
  moodRating: z.number().min(1).max(10).optional(),
});

export const newsletterFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().optional(),
});