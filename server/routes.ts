import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { mailerLiteService } from "./email";

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

  const httpServer = createServer(app);

  return httpServer;
}
