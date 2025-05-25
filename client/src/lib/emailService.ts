// Email Service Integration for Vee Nutrition
import { apiRequest } from "./queryClient";

interface EmailNotificationService {
  sendWelcomeEmail: (email: string, name: string) => Promise<void>;
  sendAppointmentConfirmation: (email: string, name: string, date: string, time: string, type: string) => Promise<void>;
  sendRescheduleRequest: (adminEmail: string, clientName: string, clientEmail: string, originalDate: string, originalTime: string, reason?: string) => Promise<void>;
  sendAppointmentReminder: (email: string, name: string, date: string, time: string, type: string) => Promise<void>;
  sendHealthUpdateNotification: (adminEmail: string, clientName: string, clientEmail: string, chronicConditions: string, medications: string) => Promise<void>;
  sendPreferencesUpdateNotification: (adminEmail: string, clientName: string, clientEmail: string, language: string, location: string) => Promise<void>;
}

class EmailService implements EmailNotificationService {
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    try {
      await apiRequest('POST', '/api/emails/welcome', { email, name });
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
      await apiRequest('POST', '/api/emails/appointment-confirmation', { email, name, date, time, type });
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
      await apiRequest('POST', '/api/emails/reschedule-request', {
        adminEmail,
        clientName,
        clientEmail,
        originalDate,
        originalTime,
        reason,
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
      await apiRequest('POST', '/api/emails/appointment-reminder', { email, name, date, time, type });
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
      const response = await apiRequest('POST', '/api/emails/daily-reminders', { appointments });
      const data = await response.json();
      console.log('Daily reminders sent successfully');
      return data;
    } catch (error) {
      console.error('Failed to send daily reminders:', error);
      throw error;
    }
  }

  async sendHealthUpdateNotification(
    adminEmail: string,
    clientName: string,
    clientEmail: string,
    chronicConditions: string,
    medications: string
  ): Promise<void> {
    try {
      await apiRequest('POST', '/api/emails/health-update', {
        adminEmail,
        clientName,
        clientEmail,
        chronicConditions,
        medications,
      });
      console.log('Health update notification sent successfully');
    } catch (error) {
      console.error('Failed to send health update notification:', error);
      throw error;
    }
  }

  async sendPreferencesUpdateNotification(
    adminEmail: string,
    clientName: string,
    clientEmail: string,
    language: string,
    location: string
  ): Promise<void> {
    try {
      await apiRequest('POST', '/api/emails/preferences-update', {
        adminEmail,
        clientName,
        clientEmail,
        language,
        location,
      });
      console.log('Preferences update notification sent successfully');
    } catch (error) {
      console.error('Failed to send preferences update notification:', error);
      throw error;
    }
  }
}

export const emailService = new EmailService();