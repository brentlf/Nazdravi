// Email Service Integration for Vee Nutrition
import { getFunctions, httpsCallable } from 'firebase/functions';
import app from './firebase';

const functions = getFunctions(app);

// Callable functions for emails
const sendWelcomeEmailFunction = httpsCallable(functions, 'sendWelcomeEmail');
const sendAppointmentConfirmationFunction = httpsCallable(functions, 'sendAppointmentConfirmation');
const sendInvoiceEmailFunction = httpsCallable(functions, 'sendInvoiceEmail');

export class EmailService {
  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    try {
      const result = await sendWelcomeEmailFunction({ email, name });
      console.log('Welcome email sent:', result);
      return true;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
  }

  async sendAppointmentConfirmation(
    email: string, 
    name: string, 
    date: string, 
    time: string, 
    meetingUrl?: string,
    appointmentType?: string
  ): Promise<boolean> {
    try {
      const result = await sendAppointmentConfirmationFunction({ 
        email, 
        name, 
        date, 
        time, 
        meetingUrl, 
        appointmentType 
      });
      console.log('Appointment confirmation sent:', result);
      return true;
    } catch (error) {
      console.error('Error sending appointment confirmation:', error);
      return false;
    }
  }

  async sendInvoiceEmail(
    email: string,
    name: string,
    invoiceNumber: string,
    amount: number,
    dueDate?: string,
    pdfUrl?: string
  ): Promise<boolean> {
    try {
      const result = await sendInvoiceEmailFunction({
        email,
        name,
        invoiceNumber,
        amount,
        dueDate,
        pdfUrl
      });
      console.log('Invoice email sent:', result);
      return true;
    } catch (error) {
      console.error('Error sending invoice email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
