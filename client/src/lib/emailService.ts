// Email Service Integration for Vee Nutrition
import { apiRequest } from "./queryClient";

interface EmailNotificationService {
  sendWelcomeEmail: (email: string, name: string) => Promise<void>;
  sendAppointmentConfirmation: (email: string, name: string, date: string, time: string, type: string) => Promise<void>;
  sendRescheduleRequest: (adminEmail: string, clientName: string, clientEmail: string, originalDate: string, originalTime: string, reason?: string) => Promise<void>;
  sendAppointmentReminder: (email: string, name: string, date: string, time: string, type: string) => Promise<void>;
}

class EmailService implements EmailNotificationService {
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    try {
      await apiRequest('/api/emails/welcome', {
        method: 'POST',
        body: JSON.stringify({ email, name }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Welcome email sent successfully');
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      throw error;
    }
  }

  async sendAppointmentConfirmation(
    email: string, 
    name: string, 
    date: string, 
    time: string, 
    type: string
  ): Promise<void> {
    try {
      await apiRequest('/api/emails/appointment-confirmation', {
        method: 'POST',
        body: JSON.stringify({ email, name, date, time, type }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Appointment confirmation email sent successfully');
    } catch (error) {
      console.error('Failed to send appointment confirmation email:', error);
      throw error;
    }
  }

  async sendRescheduleRequest(
    adminEmail: string,
    clientName: string,
    clientEmail: string,
    originalDate: string,
    originalTime: string,
    reason?: string
  ): Promise<void> {
    try {
      await apiRequest('/api/emails/reschedule-request', {
        method: 'POST',
        body: JSON.stringify({
          adminEmail,
          clientName,
          clientEmail,
          originalDate,
          originalTime,
          reason,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Reschedule request email sent successfully');
    } catch (error) {
      console.error('Failed to send reschedule request email:', error);
      throw error;
    }
  }

  async sendAppointmentReminder(
    email: string,
    name: string,
    date: string,
    time: string,
    type: string
  ): Promise<void> {
    try {
      await apiRequest('/api/emails/appointment-reminder', {
        method: 'POST',
        body: JSON.stringify({ email, name, date, time, type }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Appointment reminder email sent successfully');
    } catch (error) {
      console.error('Failed to send appointment reminder email:', error);
      throw error;
    }
  }

  async sendDailyReminders(appointments: Array<{
    email: string;
    name: string;
    date: string;
    timeslot: string;
    type: string;
  }>): Promise<{ successful: number; failed: number }> {
    try {
      const response = await apiRequest('/api/emails/daily-reminders', {
        method: 'POST',
        body: JSON.stringify({ appointments }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Daily reminders sent successfully');
      return response;
    } catch (error) {
      console.error('Failed to send daily reminders:', error);
      throw error;
    }
  }
}

export const emailService = new EmailService();