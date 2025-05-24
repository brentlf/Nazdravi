// Firebase Functions Email Service for Vee Nutrition
import { db } from './firebase';

interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

interface SendEmailParams {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;
}

export class MailerLiteService {
  async sendEmail(params: SendEmailParams): Promise<boolean> {
    try {
      // Trigger Firebase Functions by writing to Firestore
      // This will automatically trigger your Firebase Functions for email sending
      const emailDoc = {
        to: params.to,
        toName: params.toName || '',
        subject: params.subject,
        html: params.html,
        text: params.text || '',
        status: 'pending',
        timestamp: new Date(),
        from: 'info@veenutrition.com'
      };

      await db.collection('mail').add(emailDoc);
      console.log(`Email queued for Firebase Functions delivery to ${params.to}`);
      return true;
    } catch (error) {
      console.error('Email queueing failed:', error);
      return false;
    }
  }

  // Account confirmation email
  async sendAccountConfirmation(email: string, name: string): Promise<boolean> {
    const template = this.getAccountConfirmationTemplate(name);
    return this.sendEmail({
      to: email,
      toName: name,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Appointment confirmation email
  async sendAppointmentConfirmation(
    email: string,
    name: string,
    date: string,
    time: string,
    type: string
  ): Promise<boolean> {
    const template = this.getAppointmentConfirmationTemplate(name, date, time, type);
    return this.sendEmail({
      to: email,
      toName: name,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Reschedule request email
  async sendRescheduleRequest(
    adminEmail: string,
    clientName: string,
    clientEmail: string,
    originalDate: string,
    originalTime: string,
    reason?: string
  ): Promise<boolean> {
    const template = this.getRescheduleRequestTemplate(
      clientName,
      clientEmail,
      originalDate,
      originalTime,
      reason
    );
    return this.sendEmail({
      to: adminEmail,
      toName: 'Admin',
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Appointment reminder email
  async sendAppointmentReminder(
    email: string,
    name: string,
    date: string,
    time: string,
    type: string
  ): Promise<boolean> {
    const template = this.getAppointmentReminderTemplate(name, date, time, type);
    return this.sendEmail({
      to: email,
      toName: name,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  private getAccountConfirmationTemplate(name: string): EmailTemplate {
    return {
      subject: 'Welcome to Vee Nutrition - Account Created Successfully',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8faf8;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #A5CBA4; margin: 0;">🌿 Vee Nutrition</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Welcome ${name}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Thank you for creating your account with Vee Nutrition. Your journey to better health and nutrition starts here!
            </p>
            
            <div style="background-color: #f0f8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #A5CBA4; margin-top: 0;">What's Next?</h3>
              <ul style="color: #666; padding-left: 20px;">
                <li>Complete your health assessment</li>
                <li>Book your initial consultation</li>
                <li>Set your nutrition goals</li>
                <li>Start your personalized plan</li>
              </ul>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              If you have any questions, feel free to reach out to us. We're here to support you every step of the way.
            </p>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
              <p>Vee Nutrition | Transforming Lives Through Nutrition</p>
              <p>Email: info@veenutrition.com</p>
            </div>
          </div>
        </div>
      `,
      text: `Welcome to Vee Nutrition, ${name}! Your account has been created successfully. Visit your dashboard to get started with your nutrition journey.`
    };
  }

  private getAppointmentConfirmationTemplate(
    name: string,
    date: string,
    time: string,
    type: string
  ): EmailTemplate {
    return {
      subject: `Appointment Confirmed - ${type} on ${date}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8faf8;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #A5CBA4; margin: 0;">🌿 Vee Nutrition</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Appointment Confirmed!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Hi ${name}, your appointment has been confirmed. Here are the details:
            </p>
            
            <div style="background-color: #f0f8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #A5CBA4; margin-top: 0;">Appointment Details</h3>
              <p style="margin: 5px 0;"><strong>Type:</strong> ${type}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${date}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              We'll send you a reminder 24 hours before your appointment. If you need to reschedule, please contact us as soon as possible.
            </p>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
              <p>Vee Nutrition | Transforming Lives Through Nutrition</p>
              <p>Email: info@veenutrition.com</p>
            </div>
          </div>
        </div>
      `,
      text: `Hi ${name}, your ${type} appointment has been confirmed for ${date} at ${time}. We'll send you a reminder 24 hours before your appointment.`
    };
  }

  private getRescheduleRequestTemplate(
    clientName: string,
    clientEmail: string,
    originalDate: string,
    originalTime: string,
    reason?: string
  ): EmailTemplate {
    return {
      subject: `Reschedule Request from ${clientName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8faf8;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Reschedule Request</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              ${clientName} has requested to reschedule their appointment.
            </p>
            
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h3 style="color: #856404; margin-top: 0;">Original Appointment</h3>
              <p style="margin: 5px 0;"><strong>Client:</strong> ${clientName}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${clientEmail}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${originalDate}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${originalTime}</p>
              ${reason ? `<p style="margin: 5px 0;"><strong>Reason:</strong> ${reason}</p>` : ''}
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Please contact the client to arrange a new appointment time.
            </p>
          </div>
        </div>
      `,
      text: `Reschedule request from ${clientName} (${clientEmail}) for appointment on ${originalDate} at ${originalTime}. ${reason ? `Reason: ${reason}` : ''}`
    };
  }

  private getAppointmentReminderTemplate(
    name: string,
    date: string,
    time: string,
    type: string
  ): EmailTemplate {
    return {
      subject: `Reminder: Your ${type} Tomorrow at ${time}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8faf8;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #A5CBA4; margin: 0;">🌿 Vee Nutrition</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Appointment Reminder</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Hi ${name}, this is a friendly reminder about your upcoming appointment tomorrow.
            </p>
            
            <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
              <h3 style="color: #1565c0; margin-top: 0;">Appointment Details</h3>
              <p style="margin: 5px 0;"><strong>Type:</strong> ${type}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${date}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Please arrive a few minutes early and bring any questions you might have. We're looking forward to seeing you!
            </p>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
              <p>Vee Nutrition | Transforming Lives Through Nutrition</p>
              <p>Email: info@veenutrition.com</p>
            </div>
          </div>
        </div>
      `,
      text: `Hi ${name}, reminder: Your ${type} is tomorrow, ${date} at ${time}. We're looking forward to seeing you!`
    };
  }
}

export const mailerLiteService = new MailerLiteService();