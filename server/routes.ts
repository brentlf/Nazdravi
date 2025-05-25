import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "./firebase";
import { mailerLiteService } from "./email";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Email automation test routes
  app.post("/api/emails/appointment-confirmation", async (req, res) => {
    try {
      const { email, name, date, time, meetingUrl } = req.body;
      
      // Queue email in Firebase
      await db.collection("mail").add({
        to: email,
        template: {
          name: "appointment-confirmation",
          data: { name, date, time, meetingUrl }
        },
        createdAt: new Date()
      });

      res.json({ success: true, message: "Appointment confirmation email queued" });
    } catch (error: any) {
      console.error("Error queuing appointment confirmation email:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/emails/appointment-reminder", async (req, res) => {
    try {
      const { email, name, date, time, meetingUrl } = req.body;
      
      // Queue email in Firebase
      await db.collection("mail").add({
        to: email,
        template: {
          name: "appointment-reminder",
          data: { name, date, time, meetingUrl }
        },
        createdAt: new Date()
      });

      res.json({ success: true, message: "Appointment reminder email queued" });
    } catch (error: any) {
      console.error("Error queuing appointment reminder email:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/emails/reschedule-request", async (req, res) => {
    try {
      const { email, name, originalDate, originalTime, newDate, newTime } = req.body;
      
      // Queue email in Firebase
      await db.collection("mail").add({
        to: email,
        template: {
          name: "reschedule-request",
          data: { name, originalDate, originalTime, newDate, newTime }
        },
        createdAt: new Date()
      });

      res.json({ success: true, message: "Reschedule request email queued" });
    } catch (error: any) {
      console.error("Error queuing reschedule request email:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/emails/appointment-cancelled", async (req, res) => {
    try {
      const { email, name, date, time, reason } = req.body;
      
      // Queue email in Firebase
      await db.collection("mail").add({
        to: email,
        template: {
          name: "appointment-cancelled",
          data: { name, date, time, reason }
        },
        createdAt: new Date()
      });

      res.json({ success: true, message: "Appointment cancellation email queued" });
    } catch (error: any) {
      console.error("Error queuing appointment cancellation email:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/emails/late-reschedule", async (req, res) => {
    try {
      const { email, name, date, time } = req.body;
      
      // Queue email in Firebase
      await db.collection("mail").add({
        to: email,
        template: {
          name: "late-reschedule",
          data: { name, date, time }
        },
        createdAt: new Date()
      });

      res.json({ success: true, message: "Late reschedule notice email queued" });
    } catch (error: any) {
      console.error("Error queuing late reschedule email:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/emails/no-show", async (req, res) => {
    try {
      const { email, name, date, time, penaltyAmount } = req.body;
      
      // Queue email in Firebase
      await db.collection("mail").add({
        to: email,
        template: {
          name: "no-show",
          data: { name, date, time, penaltyAmount }
        },
        createdAt: new Date()
      });

      res.json({ success: true, message: "No-show notice email queued" });
    } catch (error: any) {
      console.error("Error queuing no-show email:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/emails/invoice-generated", async (req, res) => {
    try {
      const { email, name, amount, invoiceId } = req.body;
      
      // Queue email in Firebase
      await db.collection("mail").add({
        to: email,
        template: {
          name: "invoice-generated",
          data: { name, amount, invoiceId }
        },
        createdAt: new Date()
      });

      res.json({ success: true, message: "Invoice generated email queued" });
    } catch (error: any) {
      console.error("Error queuing invoice generated email:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/emails/payment-reminder", async (req, res) => {
    try {
      const { email, name, amount, invoiceNumber, paymentUrl } = req.body;
      
      // Queue email in Firebase
      await db.collection("mail").add({
        to: email,
        template: {
          name: "payment-reminder",
          data: { name, amount, invoiceNumber, paymentUrl }
        },
        createdAt: new Date()
      });

      res.json({ success: true, message: "Payment reminder email queued" });
    } catch (error: any) {
      console.error("Error queuing payment reminder email:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}