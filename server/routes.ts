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

  // Monthly subscription invoice creation for complete program users
  app.post("/api/subscription-invoices", async (req: Request, res: Response) => {
    try {
      const { userId, clientName, clientEmail, amount, month, year } = req.body;

      if (!userId || !clientName || !clientEmail || !amount || !month || !year) {
        return res.status(400).json({ error: "Missing required fields for subscription invoice" });
      }

      // Check if invoice already exists for this month/year
      const existingInvoiceSnapshot = await db.collection("invoices")
        .where("userId", "==", userId)
        .where("subscriptionMonth", "==", month)
        .where("subscriptionYear", "==", year)
        .where("invoiceType", "==", "subscription")
        .get();
      
      if (!existingInvoiceSnapshot.empty) {
        return res.status(409).json({ 
          error: "Subscription invoice already exists for this month",
          invoiceId: existingInvoiceSnapshot.docs[0].id
        });
      }

      // Generate subscription invoice number
      const invoiceNumber = `SUB-${year}-${month.toString().padStart(2, '0')}-${Date.now()}`;
      
      // Create Stripe payment intent for subscription
      const currency = "eur";
      const paymentMethodTypes = ['card', 'ideal'];

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency,
        payment_method_types: paymentMethodTypes,
        metadata: {
          invoiceNumber,
          userId,
          clientEmail,
          subscriptionMonth: month.toString(),
          subscriptionYear: year.toString(),
          invoiceType: "subscription"
        }
      });

      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];

      const invoiceData = {
        invoiceNumber,
        userId,
        clientName,
        clientEmail,
        amount,
        currency: currency.toUpperCase(),
        description: `Complete Program - ${monthNames[month - 1]} ${year} Subscription`,
        invoiceType: "subscription",
        subscriptionMonth: month,
        subscriptionYear: year,
        status: "pending",
        stripePaymentIntentId: paymentIntent.id,
        paymentUrl: `${req.protocol}://${req.get('host')}/payment/${paymentIntent.id}`,
        createdAt: new Date().toISOString(),
        dueDate: new Date(year, month, 15).toISOString(), // 15th of the month
      };

      const docRef = await db.collection("invoices").add(invoiceData);
      
      res.json({ 
        success: true, 
        invoiceId: docRef.id,
        invoice: { id: docRef.id, ...invoiceData },
        paymentUrl: invoiceData.paymentUrl,
        clientSecret: paymentIntent.client_secret
      });

    } catch (error) {
      console.error("Error creating subscription invoice:", error);
      res.status(500).json({ error: "Failed to create subscription invoice" });
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

      // Check if invoice already exists for this appointment using Firebase Admin SDK
      const existingInvoiceSnapshot = await db.collection("invoices")
        .where("appointmentId", "==", appointmentId)
        .get();
      
      if (!existingInvoiceSnapshot.empty) {
        return res.status(409).json({ 
          error: "Invoice already exists for this appointment",
          invoiceId: existingInvoiceSnapshot.docs[0].id
        });
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
        amount: Math.round(amount * 100), // Convert to cents
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

  // No-show penalty notification email
  app.post("/api/emails/no-show-notice", async (req, res) => {
    try {
      const { email, name, date, time, penaltyAmount } = req.body;

      if (!email || !name || !date || !time || !penaltyAmount) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      console.log("Attempting to write to Firebase mail collection...");
      
      const mailData = {
        to: email,
        message: {
          subject: 'Missed Appointment - No-Show Fee Applied - Vee Nutrition',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8faf8;">
              <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #A5CBA4; margin: 0;">🌿 Vee Nutrition</h1>
                </div>
                
                <h2 style="color: #333; margin-bottom: 20px;">❌ Missed Appointment Notice</h2>
                
                <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                  Hi ${name}, we missed you at your appointment on ${date} at ${time}.
                </p>
                
                <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
                  <h3 style="color: #721c24; margin-top: 0;">No-Show Penalty</h3>
                  <p style="margin: 5px 0; color: #721c24;"><strong>Fee Applied:</strong> €${penaltyAmount}</p>
                  <p style="margin: 5px 0; color: #721c24;"><strong>Rate:</strong> 50% of original appointment cost</p>
                </div>
                
                <p style="color: #666; line-height: 1.6; margin: 20px 0;">
                  We understand that unexpected situations arise. To avoid future no-show fees, please cancel or reschedule at least 4 working hours in advance.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://your-domain.replit.app/book" style="background-color: #A5CBA4; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Book New Appointment
                  </a>
                </div>
                
                <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
                  <p>Vee Nutrition | We're Here When You're Ready</p>
                  <p>Let's get back on track with your nutrition journey</p>
                </div>
              </div>
            </div>
          `,
          text: `Missed appointment notice: A €${penaltyAmount} no-show fee (50% of appointment cost) has been applied for your missed ${date} ${time} appointment.`
        }
      };

      const docRef = await db.collection("mail").add(mailData);
      console.log("✓ Email successfully queued in Firebase with ID:", docRef.id);
      console.log("Firebase Functions should now process email to", email);

      res.json({ 
        message: "No-show notice email queued successfully",
        emailId: docRef.id 
      });
    } catch (error) {
      console.error("No-show notice email error:", error);
      res.status(500).json({ error: "Failed to send no-show notice email" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
