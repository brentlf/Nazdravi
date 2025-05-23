export interface User {
  uid: string;
  role: "client" | "admin";
  name: string;
  email: string;
  photoURL?: string;
  preferredLanguage: string;
  createdAt: Date;
}

export interface Appointment {
  id: string;
  userId: string;
  date: string;
  timeslot: string;
  type: "Initial" | "Follow-up";
  goals: string;
  status: "pending" | "confirmed" | "done";
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  fromUser: string;
  toUser: string;
  text: string;
  chatRoom: string;
  createdAt: Date;
}

export interface Plan {
  id: string;
  userId: string;
  title: string;
  storagePath: string;
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

export type Language = "en" | "nl";
export type Theme = "light" | "dark" | "system";
