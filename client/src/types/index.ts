export interface User {
  uid: string;
  role: "client" | "admin";
  name: string;
  email: string;
  photoURL?: string;
  preferredLanguage: "en" | "cs";
  createdAt: Date;
  updatedAt?: Date;
  // Additional nutrition-specific fields
  dateOfBirth?: Date;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  gpContact?: string;
  servicePlan?: "pay-as-you-go" | "complete-program";
  programStartDate?: Date;
  programEndDate?: Date;
}

// Standardized appointment status types
export type AppointmentStatus = 
  | "pending" 
  | "confirmed" 
  | "completed" 
  | "cancelled" 
  | "reschedule_requested" 
  | "no_show"
  | "late_reschedule";

export interface Appointment {
  id: string;
  userId: string;
  date: string;
  timeslot: string;
  type: "Initial" | "Follow-up";
  goals: string;
  status: AppointmentStatus;
  name: string;
  email: string;
  phone: string;
  teamsJoinUrl?: string;
  teamsMeetingId?: string;
  createdAt: Date;
  updatedAt?: Date;
  // Additional fields for better tracking
  requestId?: string;
  invoiceGenerated?: boolean;
  consentFormSubmitted?: boolean;
  preEvaluationCompleted?: boolean;
  rescheduleHistory?: Array<{
    timestamp: Date;
    reason: string;
    requestedDate?: string;
    requestedTime?: string;
  }>;
  lateReschedule?: boolean;
  potentialLateFee?: number;
  noShowPenalty?: number;
  noShowDate?: Date;
}

export interface Message {
  id: string;
  fromUser: string;
  toUser: string;
  text: string;
  chatRoom: string;
  createdAt: Date;
  read: boolean;
  messageType?: "text" | "file" | "system";
}

export interface Plan {
  id: string;
  userId: string;
  title: string;
  description?: string;
  storagePath: string;
  downloadURL?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  createdAt: Date;
}

export interface Progress {
  id: string;
  userId: string;
  date: string;
  weightKg?: number;
  waterLitres?: number;
  notes?: string;
  createdAt: Date;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  tags: string[];
  lang: string;
  type: "pdf" | "video" | "link";
  createdAt: Date;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  mediumUrl?: string;
  featuredImage?: string;
  tags: string[];
  lang: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Translation {
  id: string;
  lang: string;
  namespace: string;
  key: string;
  value: string;
}

export type Language = "en" | "cs";
export type Theme = "light" | "dark" | "system";

// Invoice types
export interface InvoiceItem {
  description: string;
  amount: number;
  type: "consultation" | "penalty" | "subscription" | "other";
  details?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  userId: string;
  clientName: string;
  clientEmail: string;
  servicePlan: string;
  items: InvoiceItem[];
  totalAmount: number;
  currency: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  dueDate: Date;
  paidDate?: Date;
  appointmentId?: string;
  invoiceType: "regular" | "penalty" | "subscription";
  createdAt: Date;
  updatedAt?: Date;
}
