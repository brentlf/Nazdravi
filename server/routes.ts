import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "./firebase";
import { mailerLiteService } from "./email";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Email automation test routes
  app.post("/api/emails/appointment-confirmation", async (req, res) => {
    try {
      const { email, name, date, time, meetingUrl } = req.body;
      
      // Queue email in Firebase with correct format - ensure meetingUrl has default value
      const docRef = await db.collection("mail").add({
        to: email,
        toName: name,
        type: "appointment-confirmation",
        status: "pending",
        data: { 
          name, 
          date, 
          time, 
          meetingUrl: meetingUrl || '',
          type: 'Consultation'
        },
        createdAt: new Date()
      });

      res.json({ success: true, message: "Appointment confirmation email queued", docId: docRef.id });
    } catch (error: any) {
      console.error("Error queuing appointment confirmation email:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/emails/appointment-reminder", async (req, res) => {
    try {
      const { email, name, date, time, meetingUrl } = req.body;
      
      // Queue email in Firebase with correct format - ensure meetingUrl has default value
      const docRef = await db.collection("mail").add({
        to: email,
        toName: name,
        type: "appointment-reminder",
        status: "pending",
        data: { 
          name, 
          date, 
          time, 
          meetingUrl: meetingUrl || '',
          type: 'Consultation'
        },
        createdAt: new Date()
      });

      res.json({ success: true, message: "Appointment reminder email queued", docId: docRef.id });
    } catch (error: any) {
      console.error("Error queuing appointment reminder email:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/emails/reschedule-request", async (req, res) => {
    try {
      const { email, name, originalDate, originalTime, newDate, newTime } = req.body;
      
      // Queue reschedule confirmation email to client
      const docRef = await db.collection("mail").add({
        to: email, // Send to client
        toName: name,
        type: "reschedule-request",
        status: "pending",
        data: { 
          name, 
          originalDate, 
          originalTime, 
          newDate, 
          newTime 
        },
        createdAt: new Date()
      });

      res.json({ success: true, message: "Reschedule confirmation email queued", docId: docRef.id });
    } catch (error: any) {
      console.error("Error queuing reschedule confirmation email:", error);
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
      
      // Check if the document was processed within 10 seconds
      setTimeout(async () => {
        try {
          const doc = await db.collection("mail").doc(docRef.id).get();
          const data = doc.data();
          console.log("📧 Email status after 10 seconds:", data?.status);
          if (data?.status === "sent") {
            console.log("✅ Email successfully processed and sent!");
          } else if (data?.status === "failed") {
            console.log("❌ Email processing failed:", data?.error);
          } else {
            console.log("⏳ Email still pending - Firebase Functions may not be working");
          }
        } catch (error) {
          console.error("Error checking email status:", error);
        }
      }, 10000);

      res.json({ success: true, message: "No-show notice email queued", docId: docRef.id });
    } catch (error: any) {
      console.error("❌ FIREBASE ERROR:", error.message);
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