import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "./firebase";
import { mailerLiteService } from "./email";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Email automation test routes
  app.post("/api/emails/appointment-confirmation", async (req, res) => {
    try {
      const { email, name, date, time, meetingUrl } = req.body;
      
      console.log("Attempting to write appointment-confirmation to Firebase:", { email, name, date, time });
      console.log("Firebase db object:", typeof db, !!db);
      
      // Queue email in Firebase with correct format
      const docRef = await db.collection("mail").add({
        to: email,
        toName: name,
        type: "appointment-confirmation",
        status: "pending",
        data: { name, date, time, meetingUrl },
        createdAt: new Date()
      });
      
      console.log("Successfully wrote appointment-confirmation to Firebase with doc ID:", docRef.id);

      res.json({ success: true, message: "Appointment confirmation email queued", docId: docRef.id });
    } catch (error: any) {
      console.error("Error queuing appointment confirmation email:", error);
      console.error("Full error details:", error.stack);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/emails/appointment-reminder", async (req, res) => {
    try {
      const { email, name, date, time, meetingUrl } = req.body;
      
      // Queue email in Firebase with correct format
      await db.collection("mail").add({
        to: email,
        toName: name,
        type: "appointment-reminder",
        status: "pending",
        data: { name, date, time, meetingUrl },
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
      
      // Queue email in Firebase with correct format
      await db.collection("mail").add({
        to: email,
        toName: name,
        type: "reschedule-request",
        status: "pending",
        data: { name, originalDate, originalTime, newDate, newTime },
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
      
      // Queue email in Firebase with correct format
      await db.collection("mail").add({
        to: email,
        toName: name,
        type: "appointment-cancelled",
        status: "pending",
        data: { name, date, time, reason },
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
      
      // Queue email in Firebase with correct format
      await db.collection("mail").add({
        to: email,
        toName: name,
        type: "late-reschedule",
        status: "pending",
        data: { name, date, time },
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
      
      console.log("=== NO-SHOW EMAIL DEBUG ===");
      console.log("Request body:", { email, name, date, time, penaltyAmount });
      console.log("Firebase db connection status:", !!db);
      console.log("Environment check - Project ID:", process.env.VITE_FIREBASE_PROJECT_ID);
      console.log("Environment check - Service Account exists:", !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      
      // Queue email in Firebase with correct format for processMailQueue function
      const docRef = await db.collection("mail").add({
        to: email,
        toName: name,
        type: "no-show",
        status: "pending",
        data: { name, date, time, penaltyAmount },
        createdAt: new Date()
      });
      
      console.log("✅ SUCCESS: Written to Firebase with doc ID:", docRef.id);
      console.log("Document path: mail/" + docRef.id);

      res.json({ success: true, message: "No-show notice email queued", docId: docRef.id });
    } catch (error: any) {
      console.error("❌ FIREBASE ERROR:", error.message);
      console.error("Error code:", error.code);
      console.error("Full error stack:", error.stack);
      res.status(500).json({ success: false, error: error.message, code: error.code });
    }
  });

  app.post("/api/emails/invoice-generated", async (req, res) => {
    try {
      const { email, name, amount, invoiceId } = req.body;
      
      // Queue email in Firebase with correct format
      await db.collection("mail").add({
        to: email,
        toName: name,
        type: "invoice-generated",
        status: "pending",
        data: { name, amount, invoiceId },
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
      
      console.log("Attempting to write payment reminder to Firebase:", { email, name, amount, invoiceNumber, paymentUrl });
      
      // Queue email in Firebase with correct format for processMailQueue function
      const docRef = await db.collection("mail").add({
        to: email,
        toName: name,
        type: "payment-reminder",
        status: "pending",
        amount: amount,
        invoiceNumber: invoiceNumber,
        paymentUrl: paymentUrl,
        createdAt: new Date()
      });
      
      console.log("Successfully wrote payment reminder to Firebase with doc ID:", docRef.id);

      res.json({ success: true, message: "Payment reminder email queued", docId: docRef.id });
    } catch (error: any) {
      console.error("Error queuing payment reminder email:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}