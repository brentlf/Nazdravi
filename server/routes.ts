import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { mailerLiteService } from "./email";
import { teamsService } from "./microsoft-teams";
import Stripe from "stripe";
import { db } from "./firebase";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-04-30.basil",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Email notification endpoints
  app.post("/api/emails/welcome", async (req, res) => {
    try {
      const { email, name } = req.body;
      
      if (!email || !name) {
        return res.status(400).json({ error: "Email and name are required" });
      }

      const success = await mailerLiteService.sendAccountConfirmation(email, name);
      
      if (success) {
        res.json({ message: "Welcome email sent successfully" });
      } else {
        res.status(500).json({ error: "Failed to send welcome email" });
      }
    } catch (error) {
      console.error("Welcome email error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/emails/appointment-confirmation", async (req, res) => {
    try {
      const { email, name, date, time, type } = req.body;
      
      if (!email || !name || !date || !time || !type) {
        return res.status(400).json({ error: "All appointment details are required" });
      }

      const success = await mailerLiteService.sendAppointmentConfirmation(email, name, date, time, type);
      
      if (success) {
        res.json({ message: "Appointment confirmation email sent successfully" });
      } else {
        res.status(500).json({ error: "Failed to send appointment confirmation email" });
      }
    } catch (error) {
      console.error("Appointment confirmation email error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/emails/reschedule-request", async (req, res) => {
    try {
      const { adminEmail, clientName, clientEmail, originalDate, originalTime, reason } = req.body;
      
      if (!adminEmail || !clientName || !clientEmail || !originalDate || !originalTime) {
        return res.status(400).json({ error: "All reschedule details are required" });
      }

      const success = await mailerLiteService.sendRescheduleRequest(
        adminEmail, clientName, clientEmail, originalDate, originalTime, reason
      );
      
      if (success) {
        res.json({ message: "Reschedule request email sent successfully" });
      } else {
        res.status(500).json({ error: "Failed to send reschedule request email" });
      }
    } catch (error) {
      console.error("Reschedule request email error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/emails/appointment-reminder", async (req, res) => {
    try {
      const { email, name, date, time, type } = req.body;
      
      if (!email || !name || !date || !time || !type) {
        return res.status(400).json({ error: "All appointment details are required" });
      }

      const success = await mailerLiteService.sendAppointmentReminder(email, name, date, time, type);
      
      if (success) {
        res.json({ message: "Appointment reminder email sent successfully" });
      } else {
        res.status(500).json({ error: "Failed to send appointment reminder email" });
      }
    } catch (error) {
      console.error("Appointment reminder email error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Batch reminder endpoint for daily reminders
  app.post("/api/emails/daily-reminders", async (req, res) => {
    try {
      const { appointments } = req.body;
      
      if (!Array.isArray(appointments)) {
        return res.status(400).json({ error: "Appointments array is required" });
      }

      const results = await Promise.allSettled(
        appointments.map(apt => 
          mailerLiteService.sendAppointmentReminder(apt.email, apt.name, apt.date, apt.timeslot, apt.type)
        )
      );

      const successful = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
      const failed = results.length - successful;

      res.json({ 
        message: `Daily reminders processed: ${successful} sent, ${failed} failed`,
        successful,
        failed
      });
    } catch (error) {
      console.error("Daily reminders error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Microsoft Teams Meeting Creation
  app.post("/api/teams/create-meeting", async (req, res) => {
    try {
      const { subject, startDateTime, endDateTime, attendeeEmail, attendeeName } = req.body;
      
      if (!subject || !startDateTime || !endDateTime || !attendeeEmail || !attendeeName) {
        return res.status(400).json({ error: "Missing required meeting details" });
      }

      // Create Teams meeting using Microsoft Graph API
      const meeting = await teamsService.createTeamsMeeting(
        subject,
        startDateTime,
        endDateTime,
        attendeeEmail,
        attendeeName
      );
      
      res.json({
        teamsJoinUrl: meeting.joinWebUrl,
        teamsMeetingId: meeting.id,
        subject: meeting.subject,
        startDateTime: meeting.startDateTime,
        endDateTime: meeting.endDateTime
      });
    } catch (error) {
      console.error("Teams meeting creation error:", error);
      res.status(500).json({ error: "Failed to create Teams meeting" });
    }
  });

  // Invoice Creation
  app.post("/api/invoices/create", async (req, res) => {
    try {
      const { 
        appointmentId, 
        userId, 
        clientName, 
        clientEmail, 
        amount, 
        description, 
        sessionDate, 
        sessionType 
      } = req.body;

      if (!appointmentId || !userId || !clientName || !clientEmail || !amount) {
        return res.status(400).json({ error: "Missing required invoice fields" });
      }

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}`;
      
      // Create Stripe payment intent with currency-appropriate payment methods
      const currency = "eur";
      const paymentMethodTypes = ['card']; // Always support cards
      
      // Only add iDEAL for EUR currency (iDEAL doesn't support GBP)
      if (currency === "eur") {
        paymentMethodTypes.push('ideal');
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to pence
        currency: currency,
        payment_method_types: paymentMethodTypes,
        metadata: {
          invoiceNumber,
          appointmentId,
          userId,
          clientEmail
        }
      });

      const invoiceData = {
        invoiceNumber,
        appointmentId,
        userId,
        clientName,
        clientEmail,
        amount,
        currency: "EUR",
        description,
        sessionDate,
        sessionType,
        status: "pending",
        createdAt: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        stripePaymentIntentId: paymentIntent.id,
        paymentUrl: `${req.protocol}://${req.get('host')}/pay-invoice/${invoiceNumber}`
      };

      // Save invoice to Firebase
      const docRef = await db.collection("invoices").add(invoiceData);
      console.log("Invoice saved to Firebase with ID:", docRef.id);

      res.json({
        invoice: { ...invoiceData, id: docRef.id },
        clientSecret: paymentIntent.client_secret
      });
    } catch (error) {
      console.error("Invoice creation error:", error);
      res.status(500).json({ error: "Failed to create invoice" });
    }
  });

  // Payment processing for invoices
  app.post("/api/invoices/pay", async (req, res) => {
    try {
      const { paymentIntentId, invoiceNumber } = req.body;

      if (!paymentIntentId || !invoiceNumber) {
        return res.status(400).json({ error: "Missing payment details" });
      }

      // Confirm payment with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        res.json({
          success: true,
          message: "Payment successful",
          invoiceNumber,
          paidAt: new Date()
        });
      } else {
        res.status(400).json({ error: "Payment not completed" });
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      res.status(500).json({ error: "Failed to process payment" });
    }
  });

  // Get invoice details
  app.get("/api/invoices/:invoiceNumber", async (req, res) => {
    try {
      const { invoiceNumber } = req.params;
      
      // In a real implementation, you'd fetch from your database
      // For now, return a placeholder response
      res.json({
        invoiceNumber,
        status: "pending",
        message: "Invoice details would be fetched from database"
      });
    } catch (error) {
      console.error("Get invoice error:", error);
      res.status(500).json({ error: "Failed to get invoice details" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
