import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "./firebase";
import { mailerLiteService } from "./email";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Debug middleware to log all email-related requests
  app.use('/api/emails', (req, res, next) => {
    console.log(`🔍 MIDDLEWARE DEBUG: ${req.method} ${req.path} - ${req.url}`);
    next();
  });

  // Test route to verify our server is handling these requests
  app.get('/api/emails/test', (req, res) => {
    console.log('🚨 TEST ROUTE HIT - Server is working!');
    res.json({ success: true, message: 'Server routes are working' });
  });

  // Welcome email route
  app.post("/api/emails/welcome", async (req, res) => {
    try {
      const { email, name } = req.body;
      
      if (!email || !name) {
        return res.status(400).json({ success: false, error: "Missing required fields: email and name" });
      }
      
      // Queue email in Firebase using same format as working automated emails
      const docRef = await db.collection("mail").add({
        to: email,
        toName: name,
        subject: `Welcome to Vee Nutrition - Account Confirmation`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8faf8;"><div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);"><div style="text-align: center; margin-bottom: 30px;"><h1 style="color: #A5CBA4; margin: 0;">🌿 Vee Nutrition</h1></div><h2 style="color: #333; margin-bottom: 20px;">Welcome to Your Health Journey!</h2><p style="color: #666; line-height: 1.6; margin-bottom: 20px;">Dear ${name},</p><p style="color: #666; line-height: 1.6; margin-bottom: 20px;">Welcome to Vee Nutrition! Your account has been successfully created and we're excited to support you on your wellness journey.</p><div style="background-color: #A5CBA4; color: white; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center;"><h3 style="margin: 0 0 15px 0; font-size: 18px;">🎯 Your Next Steps</h3><p style="margin: 5px 0; font-size: 16px;">✓ Complete your health profile</p><p style="margin: 5px 0; font-size: 16px;">✓ Schedule your first consultation</p><p style="margin: 5px 0; font-size: 16px;">✓ Start your personalized nutrition plan</p></div><div style="text-align: center; margin: 30px 0;"><a href="https://your-domain.replit.app/dashboard" style="background-color: #A5CBA4; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Access Your Dashboard</a></div><div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;"><p>Vee Nutrition | Transforming Lives Through Nutrition</p><p>Email: info@veenutrition.com</p></div></div></div>`,
        text: `Welcome to Vee Nutrition! Dear ${name}, your account has been successfully created. Access your dashboard to get started with your personalized nutrition journey.`,
        type: 'account-confirmation',
        status: "pending",
        createdAt: new Date()
      });

      res.json({ success: true, message: "Welcome email queued", docId: docRef.id });

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
      
      // Queue email in Firebase with correct format matching Firebase Functions expectations
      const docRef = await db.collection("mail").add({
        to: email,
        toName: name,
        subject: `Payment Reminder - Invoice ${invoiceNumber || 'N/A'}`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8faf8;"><div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);"><div style="text-align: center; margin-bottom: 30px;"><h1 style="color: #A5CBA4; margin: 0;">🌿 Vee Nutrition</h1></div><h2 style="color: #333; margin-bottom: 20px;">💰 Payment Reminder</h2><p style="color: #666; line-height: 1.6; margin-bottom: 20px;">Dear ${name},</p><p style="color: #666; line-height: 1.6; margin-bottom: 20px;">This is a friendly reminder that payment for your invoice is still pending.</p><div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;"><h3 style="margin: 0 0 10px 0; color: #856404;">Invoice Details</h3><p style="margin: 5px 0; color: #856404;"><strong>Invoice Number:</strong> ${invoiceNumber || 'N/A'}</p><p style="margin: 5px 0; color: #856404;"><strong>Amount Due:</strong> €${(amount || 0).toFixed(2)}</p></div><div style="text-align: center; margin: 30px 0;"><a href="${paymentUrl || '#'}" style="background-color: #A5CBA4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Pay Invoice</a></div><p style="color: #666; line-height: 1.6;">Best regards,<br/>Vee Nutrition Team</p></div></div>`,
        text: `Payment Reminder - Dear ${name}, payment for €${(amount || 0).toFixed(2)} is still pending. Invoice: ${invoiceNumber || 'N/A'}. Pay online at: ${paymentUrl || 'Contact us for payment link'}`,
        type: 'payment-reminder',
        status: "pending",
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

  const httpServer = createServer(app);
  return httpServer;
}