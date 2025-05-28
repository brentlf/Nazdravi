import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "./firebase";
import { mailerLiteService } from "./email";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Debug middleware to log all email-related requests
  app.use('/api/emails', (req, res, next) => {
    console.log(`🔍 MIDDLEWARE DEBUG: ${req.method} ${req.path} - ${req.url}`);
    if (req.path === '/welcome') {
      console.log('🚨 MIDDLEWARE: Welcome request detected!');
    }
    next();
  });

  // Test route to verify our server is handling these requests
  app.get('/api/emails/test', (req, res) => {
    console.log('🚨 TEST ROUTE HIT - Server is working!');
    res.json({ success: true, message: 'Server routes are working' });
  });

  // Welcome email route
  app.post("/api/emails/welcome", async (req, res) => {
    console.log("🚨 WELCOME EMAIL ROUTE HIT!");
    try {
      const { email, name } = req.body;
      
      console.log("🚨 WELCOME EMAIL DEBUG - Request received:", { email, name });
      
      if (!email || !name) {
        console.log("🚨 WELCOME EMAIL DEBUG - Missing fields!");
        return res.status(400).json({ success: false, error: "Missing required fields: email and name" });
      }
      
      // Queue email in Firebase using exact same format as working appointment emails
      const docData = {
        to: email,
        toName: name,
        type: "account-confirmation",
        status: "pending",
        data: { 
          name: name || ''
        },
        createdAt: new Date()
      };
      
      console.log("🚨 WELCOME EMAIL DEBUG - About to write to Firebase:", docData);
      
      const docRef = await db.collection("mail").add(docData);
      
      console.log("🚨 WELCOME EMAIL DEBUG - Firebase doc created with ID:", docRef.id);

      // Add status checking for debugging
      setTimeout(async () => {
        try {
          const doc = await db.collection("mail").doc(docRef.id).get();
          const data = doc.data();
          console.log("📧 Welcome email status after 10 seconds:", data?.status);
          if (data?.status === "sent") {
            console.log("✅ Welcome email successfully processed and sent!");
          } else if (data?.status === "failed") {
            console.log("❌ Welcome email processing failed:", data?.error);
          } else {
            console.log("⏳ Welcome email still pending - check Firebase Functions logs");
          }
        } catch (error) {
          console.error("Error checking welcome email status:", error);
        }
      }, 10000);

      res.json({ success: true, message: "Welcome email queued", docId: docRef.id });
    } catch (error: any) {
      console.error("Error queuing welcome email:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
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
      
      // Validate required fields
      if (!email || !name) {
        return res.status(400).json({ success: false, error: "Missing required fields: email and name" });
      }
      
      // Queue reschedule confirmation email to client
      const docRef = await db.collection("mail").add({
        to: email, // Send to client
        toName: name,
        type: "reschedule-request",
        status: "pending",
        data: { 
          name, 
          originalDate: originalDate || '', 
          originalTime: originalTime || '', 
          newDate: newDate || '', 
          newTime: newTime || '' 
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
      
      // Validate required fields
      if (!email || !name) {
        return res.status(400).json({ success: false, error: "Missing required fields: email and name" });
      }
      
      // Queue email in Firebase with correct format
      const docRef = await db.collection("mail").add({
        to: email,
        toName: name,
        type: "invoice-generated",
        status: "pending",
        data: { 
          name, 
          amount: amount || 0, 
          invoiceId: invoiceId || '' 
        },
        createdAt: new Date()
      });

      res.json({ success: true, message: "Invoice generated email queued", docId: docRef.id });
    } catch (error: any) {
      console.error("Error queuing invoice generated email:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/emails/payment-reminder", async (req, res) => {
    try {
      const { email, name, amount, invoiceNumber, paymentUrl } = req.body;
      
      // Validate required fields
      if (!email || !name) {
        return res.status(400).json({ success: false, error: "Missing required fields: email and name" });
      }
      
      // Queue email in Firebase using exact same format as working appointment emails
      const docRef = await db.collection("mail").add({
        to: email,
        toName: name,
        type: "payment-reminder",
        status: "pending",
        data: { 
          name: name || '',
          amount: amount || 0,
          invoiceNumber: invoiceNumber || '',
          paymentUrl: paymentUrl || ''
        },
        createdAt: new Date()
      });

      res.json({ success: true, message: "Payment reminder email queued", docId: docRef.id });
    } catch (error: any) {
      console.error("Error queuing payment reminder email:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Admin notification email routes
  app.post("/api/emails/admin/new-appointment", async (req, res) => {
    try {
      const { name, email, type, date, timeslot, isTest } = req.body;
      
      if (!name || !email) {
        return res.status(400).json({ success: false, error: "Missing required fields: name and email" });
      }
      
      // Use test email for test buttons, production email for real notifications
      const adminEmail = isTest ? 'info@veenutrition.com' : 'admin@veenutrition.com';
      
      // Queue email in Firebase with correct format
      const docRef = await db.collection("mail").add({
        to: adminEmail,
        toName: 'Admin Team',
        type: "admin-new-appointment",
        status: "pending",
        data: { 
          name: name || '',
          email: email || '',
          appointmentType: type || 'Consultation',
          date: date || '',
          time: timeslot || ''
        },
        createdAt: new Date()
      });

      res.json({ success: true, message: "Admin new appointment notification queued", docId: docRef.id });
    } catch (error: any) {
      console.error("Error queuing admin new appointment notification:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/emails/admin/health-update", async (req, res) => {
    try {
      const { clientName, clientEmail, updateType, isTest } = req.body;
      
      if (!clientName || !clientEmail) {
        return res.status(400).json({ success: false, error: "Missing required fields: clientName and clientEmail" });
      }
      
      // Use test email for test buttons, production email for real notifications
      const adminEmail = isTest ? 'info@veenutrition.com' : 'admin@veenutrition.com';
      
      // Queue email in Firebase with correct format
      const docRef = await db.collection("mail").add({
        to: adminEmail,
        toName: 'Admin Team',
        type: "admin-health-update",
        status: "pending",
        data: { 
          clientName: clientName || '',
          clientEmail: clientEmail || '',
          updateType: updateType || 'Health Info Update'
        },
        createdAt: new Date()
      });

      res.json({ success: true, message: "Admin health update notification queued", docId: docRef.id });
    } catch (error: any) {
      console.error("Error queuing admin health update notification:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/emails/admin/payment-received", async (req, res) => {
    try {
      const { clientName, amount, invoiceId, paymentMethod, isTest } = req.body;
      
      if (!clientName) {
        return res.status(400).json({ success: false, error: "Missing required field: clientName" });
      }
      
      // Use test email for test buttons, production email for real notifications
      const adminEmail = isTest ? 'info@veenutrition.com' : 'admin@veenutrition.com';
      
      // Queue email in Firebase with correct format
      const docRef = await db.collection("mail").add({
        to: adminEmail,
        toName: 'Admin Team',
        type: "admin-payment-received",
        status: "pending",
        data: { 
          clientName: clientName || '',
          amount: amount || 0,
          invoiceId: invoiceId || '',
          paymentMethod: paymentMethod || 'Unknown'
        },
        createdAt: new Date()
      });

      res.json({ success: true, message: "Admin payment received notification queued", docId: docRef.id });
    } catch (error: any) {
      console.error("Error queuing admin payment received notification:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/emails/admin/plan-upgrade", async (req, res) => {
    try {
      const { clientName, planType, previousPlan } = req.body;
      
      if (!clientName || !planType) {
        return res.status(400).json({ success: false, error: "Missing required fields: clientName and planType" });
      }
      
      // Queue email in Firebase with correct format
      const docRef = await db.collection("mail").add({
        to: 'info@veenutrition.com',
        toName: 'Admin Team',
        type: "admin-plan-upgrade",
        status: "pending",
        data: { 
          clientName: clientName || '',
          planType: planType || '',
          previousPlan: previousPlan || 'Unknown'
        },
        createdAt: new Date()
      });

      res.json({ success: true, message: "Admin plan upgrade notification queued", docId: docRef.id });
    } catch (error: any) {
      console.error("Error queuing admin plan upgrade notification:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/emails/admin/client-message", async (req, res) => {
    try {
      const { clientName, clientEmail, messageType, urgency } = req.body;
      
      if (!clientName || !clientEmail) {
        return res.status(400).json({ success: false, error: "Missing required fields: clientName and clientEmail" });
      }
      
      // Queue email in Firebase with correct format
      const docRef = await db.collection("mail").add({
        to: 'info@veenutrition.com',
        toName: 'Admin Team',
        type: "admin-client-message",
        status: "pending",
        data: { 
          clientName: clientName || '',
          clientEmail: clientEmail || '',
          messageType: messageType || 'General',
          urgency: urgency || 'Medium'
        },
        createdAt: new Date()
      });

      res.json({ success: true, message: "Admin client message notification queued", docId: docRef.id });
    } catch (error: any) {
      console.error("Error queuing admin client message notification:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/emails/admin/reschedule-request", async (req, res) => {
    try {
      const { clientName, clientEmail, originalDate, originalTime, reason } = req.body;
      
      if (!clientName) {
        return res.status(400).json({ success: false, error: "Missing required field: clientName" });
      }
      
      // Queue email in Firebase with correct format
      const docRef = await db.collection("mail").add({
        to: 'info@veenutrition.com',
        toName: 'Admin Team',
        type: "admin-reschedule-request",
        status: "pending",
        data: { 
          clientName: clientName || '',
          clientEmail: clientEmail || '',
          originalDate: originalDate || '',
          originalTime: originalTime || '',
          reason: reason || 'No reason provided'
        },
        createdAt: new Date()
      });

      res.json({ success: true, message: "Admin reschedule request notification queued", docId: docRef.id });
    } catch (error: any) {
      console.error("Error queuing admin reschedule request notification:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/emails/admin/plan-upgrade", async (req, res) => {
    try {
      const { clientName, planType, previousPlan } = req.body;
      
      if (!clientName || !planType) {
        return res.status(400).json({ success: false, error: "Missing required fields: clientName and planType" });
      }
      
      // Queue email in Firebase with correct format
      const docRef = await db.collection("mail").add({
        to: 'info@veenutrition.com',
        toName: 'Admin Team',
        type: "admin-plan-upgrade",
        status: "pending",
        data: { 
          clientName: clientName || '',
          planType: planType || '',
          previousPlan: previousPlan || 'Unknown'
        },
        createdAt: new Date()
      });

      res.json({ success: true, message: "Admin plan upgrade notification queued", docId: docRef.id });
    } catch (error: any) {
      console.error("Error queuing admin plan upgrade notification:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/emails/admin/client-message", async (req, res) => {
    try {
      const { clientName, clientEmail, messageType, urgency } = req.body;
      
      if (!clientName || !clientEmail) {
        return res.status(400).json({ success: false, error: "Missing required fields: clientName and clientEmail" });
      }
      
      // Queue email in Firebase with correct format
      const docRef = await db.collection("mail").add({
        to: 'info@veenutrition.com',
        toName: 'Admin Team',
        type: "admin-client-message",
        status: "pending",
        data: { 
          clientName: clientName || '',
          clientEmail: clientEmail || '',
          messageType: messageType || 'General',
          urgency: urgency || 'normal'
        },
        createdAt: new Date()
      });

      res.json({ success: true, message: "Admin client message notification queued", docId: docRef.id });
    } catch (error: any) {
      console.error("Error queuing admin client message notification:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Enhanced invoice reissue with proper accounting flow
  app.post("/api/invoices/reissue-with-accounting", async (req, res) => {
    try {
      const { originalInvoiceId, newAmount, reason } = req.body;
      
      if (!originalInvoiceId || !newAmount) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields: originalInvoiceId and newAmount" 
        });
      }

      // Get the original invoice
      const originalInvoiceDoc = await db.collection("invoices").doc(originalInvoiceId).get();
      
      if (!originalInvoiceDoc.exists) {
        return res.status(404).json({ 
          success: false, 
          error: "Original invoice not found" 
        });
      }

      const originalInvoice = originalInvoiceDoc.data();
      const originalAmount = originalInvoice?.amount || 0;

      // Generate unique invoice and credit note numbers
      const timestamp = Date.now();
      const creditNoteNumber = `CN-${timestamp}`;
      const newInvoiceNumber = `INV-${timestamp + 1}`;

      // Step 1: Create credit note for the original invoice amount
      const creditNoteData = {
        type: "credit",
        originalInvoiceId: originalInvoiceId,
        creditNoteNumber: creditNoteNumber,
        userId: originalInvoice?.userId,
        clientName: originalInvoice?.clientName,
        clientEmail: originalInvoice?.clientEmail,
        invoiceNumber: creditNoteNumber,
        amount: originalAmount,
        currency: originalInvoice?.currency || "EUR",
        description: `Credit note for invoice ${originalInvoice?.invoiceNumber} - ${reason || 'Invoice correction'}`,
        status: "paid", // Credit notes are automatically "applied"
        createdAt: new Date(),
        dueDate: new Date(),
        paidAt: new Date(),
        invoiceType: "session",
        isActive: true
      };

      const creditNoteRef = await db.collection("invoices").add(creditNoteData);

      // Step 2: Create new invoice with the new amount
      const newInvoiceData = {
        type: "invoice",
        originalInvoiceId: originalInvoiceId,
        isReissued: true,
        originalAmount: originalAmount,
        reissueReason: reason || 'Invoice correction',
        appointmentId: originalInvoice?.appointmentId,
        userId: originalInvoice?.userId,
        clientName: originalInvoice?.clientName,
        clientEmail: originalInvoice?.clientEmail,
        invoiceNumber: newInvoiceNumber,
        amount: newAmount,
        currency: originalInvoice?.currency || "EUR",
        description: `Reissued invoice (was ${originalInvoice?.invoiceNumber}) - ${reason || 'Amount correction'}`,
        sessionDate: originalInvoice?.sessionDate,
        sessionType: originalInvoice?.sessionType,
        invoiceType: originalInvoice?.invoiceType || "session",
        status: "pending",
        createdAt: new Date(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        isActive: true
      };

      const newInvoiceRef = await db.collection("invoices").add(newInvoiceData);

      // Step 3: Mark the original invoice as superseded (but keep it for audit trail)
      await db.collection("invoices").doc(originalInvoiceId).update({
        isActive: false,
        replacedByInvoiceId: newInvoiceRef.id,
        creditedAt: new Date(),
        creditNoteId: creditNoteRef.id
      });

      res.json({ 
        success: true, 
        message: "Invoice reissued with proper accounting flow",
        creditNote: { 
          id: creditNoteRef.id, 
          creditNoteNumber: creditNoteNumber,
          amount: originalAmount 
        },
        newInvoice: { 
          id: newInvoiceRef.id, 
          invoiceNumber: newInvoiceNumber,
          amount: newAmount 
        }
      });

    } catch (error: any) {
      console.error("Error in invoice reissue with accounting:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to reissue invoice" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}