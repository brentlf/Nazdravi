// Email Service Integration for Vee Nutrition
import { apiRequest } from "./queryClient";

interface EmailNotificationService {
  sendWelcomeEmail: (email: string, name: string) => Promise<void>;
  sendAppointmentConfirmation: (email: string, name: string, date: string, time: string, type: string) => Promise<void>;
  sendRescheduleRequest: (adminEmail: string, clientName: string, clientEmail: string, originalDate: string, originalTime: string, reason?: string) => Promise<void>;
  sendAppointmentReminder: (email: string, name: string, date: string, time: string, type: string) => Promise<void>;
  sendHealthUpdateNotification: (adminEmail: string, clientName: string, clientEmail: string, chronicConditions: string, medications: string) => Promise<void>;
  sendPreferencesUpdateNotification: (adminEmail: string, clientName: string, clientEmail: string, language: string, location: string) => Promise<void>;
  sendInvoiceGenerated: (email: string, name: string, amount: number, invoiceId: string) => Promise<void>;
  sendPaymentReminder: (email: string, name: string, amount: number, invoiceNumber: string, paymentUrl: string) => Promise<void>;
  sendLateRescheduleNotice: (email: string, name: string, date: string, time: string) => Promise<void>;
  sendNoShowNotice: (email: string, name: string, date: string, time: string, penaltyAmount: number) => Promise<void>;
  sendAppointmentCancelled: (email: string, name: string, date: string, time: string, reason?: string) => Promise<void>;
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
    email: string,
    name: string,
    originalDate: string,
    originalTime: string,
    newDate: string,
    newTime: string
  ): Promise<void> {
    try {
      await apiRequest('POST', '/api/emails/reschedule-request', {
        email,
        name,
        originalDate,
        originalTime,
        newDate,
        newTime,
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

  async sendInvoiceGenerated(email: string, name: string, amount: number, invoiceId: string): Promise<void> {
    try {
      await apiRequest('POST', '/api/emails/invoice-generated', { email, name, amount, invoiceId });
      console.log('Invoice generated email sent successfully');
    } catch (error) {
      console.error('Failed to send invoice generated email:', error);
      throw error;
    }
  }

  async sendPaymentReminder(email: string, name: string, amount: number, invoiceNumber: string, paymentUrl: string): Promise<void> {
    try {
      await apiRequest('POST', '/api/emails/payment-reminder', { email, name, amount, invoiceNumber, paymentUrl });
      console.log('Payment reminder email sent successfully');
    } catch (error) {
      console.error('Failed to send payment reminder email:', error);
      throw error;
    }
  }

  async sendLateRescheduleNotice(email: string, name: string, date: string, time: string): Promise<void> {
    try {
      await apiRequest('POST', '/api/emails/late-reschedule', { email, name, date, time });
      console.log('Late reschedule notice email sent successfully');
    } catch (error) {
      console.error('Failed to send late reschedule notice email:', error);
      throw error;
    }
  }

  async sendNoShowNotice(email: string, name: string, date: string, time: string, penaltyAmount: number): Promise<void> {
    try {
      await apiRequest('POST', '/api/emails/no-show', { email, name, date, time, penaltyAmount });
      console.log('No-show notice email sent successfully');
    } catch (error) {
      console.error('Failed to send no-show notice email:', error);
      throw error;
    }
  }

  async sendAppointmentCancelled(email: string, name: string, date: string, time: string, reason?: string): Promise<void> {
    try {
      await apiRequest('POST', '/api/emails/appointment-cancelled', { email, name, date, time, reason });
      console.log('Appointment cancelled email sent successfully');
    } catch (error) {
      console.error('Failed to send appointment cancelled email:', error);
      throw error;
    }
  }

  // Admin notification methods
  async sendAdminNewAppointment(
    clientName: string,
    clientEmail: string,
    appointmentType: string,
    date: string,
    time: string
  ): Promise<void> {
    try {
      // Use the working appointment confirmation system with meetingUrl included
      await apiRequest('POST', '/api/emails/appointment-confirmation', {
        email: 'info@veenutrition.com',
        name: 'Admin Team',
        date: date,
        time: time,
        meetingUrl: '', // Include empty meetingUrl to avoid Firestore error
        type: `Admin Alert: New ${appointmentType} request from ${clientName} (${clientEmail})`
      });
      console.log('Admin new appointment notification sent successfully');
    } catch (error) {
      console.error('Failed to send admin new appointment notification:', error);
      throw error;
    }
  }

  async sendAdminHealthUpdate(
    clientName: string,
    clientEmail: string,
    updateType: string
  ): Promise<void> {
    try {
      // Use the working appointment confirmation system with all fields defined
      await apiRequest('POST', '/api/emails/appointment-confirmation', {
        email: 'info@veenutrition.com',
        name: 'Admin Team',
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        meetingUrl: '', // Keep as empty string to avoid undefined
        type: `Admin Alert: Health Info Update - ${updateType} from ${clientName} (${clientEmail})`
      });
      console.log('Admin health update notification sent successfully');
    } catch (error) {
      console.error('Failed to send admin health update notification:', error);
      throw error;
    }
  }

  async sendAdminPaymentReceived(
    clientName: string,
    amount: number,
    invoiceId: string,
    paymentMethod: string
  ): Promise<void> {
    try {
      // Use the working appointment confirmation system with all fields defined
      await apiRequest('POST', '/api/emails/appointment-confirmation', {
        email: 'info@veenutrition.com',
        name: 'Admin Team',
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        meetingUrl: '', // Keep as empty string to avoid undefined
        type: `Admin Alert: Payment Received - €${amount} from ${clientName} (Invoice: ${invoiceId}) via ${paymentMethod}`
      });
      console.log('Admin payment received notification sent successfully');
    } catch (error) {
      console.error('Failed to send admin payment received notification:', error);
      throw error;
    }
  }

  async sendAdminPlanUpgrade(
    clientName: string,
    planType: string,
    previousPlan: string
  ): Promise<void> {
    try {
      // Use the working appointment confirmation system with all fields defined
      await apiRequest('POST', '/api/emails/appointment-confirmation', {
        email: 'info@veenutrition.com',
        name: 'Admin Team',
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        meetingUrl: '', // Keep as empty string to avoid undefined
        type: `Admin Alert: Plan Upgrade - ${clientName} upgraded from ${previousPlan} to ${planType}`
      });
      console.log('Admin plan upgrade notification sent successfully');
    } catch (error) {
      console.error('Failed to send admin plan upgrade notification:', error);
      throw error;
    }
  }

  async sendAdminClientMessage(
    clientName: string,
    clientEmail: string,
    messageType: string,
    urgency: string
  ): Promise<void> {
    try {
      // Use the working appointment confirmation system with all fields defined
      await apiRequest('POST', '/api/emails/appointment-confirmation', {
        email: 'info@veenutrition.com',
        name: 'Admin Team',
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        meetingUrl: '', // Keep as empty string to avoid undefined
        type: `Admin Alert: New Client Message - ${messageType} from ${clientName} (${clientEmail}) - Priority: ${urgency}`
      });
      console.log('Admin client message notification sent successfully');
    } catch (error) {
      console.error('Failed to send admin client message notification:', error);
      throw error;
    }
  }

  async sendAdminRescheduleRequest(clientName: string, clientEmail: string, originalDate: string, originalTime: string, reason?: string): Promise<void> {
    // Use the working appointment confirmation system with all fields defined
    await apiRequest('POST', '/api/emails/appointment-confirmation', {
      email: 'info@veenutrition.com',
      name: 'Admin Team',
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      meetingUrl: '', // Keep as empty string to avoid undefined
      type: `Admin Alert: Reschedule Request - ${clientName} (${clientEmail}) wants to reschedule from ${originalDate} ${originalTime}. Reason: ${reason || 'Not specified'}`
    });
  }
}

export const emailService = new EmailService();