// Firebase Functions Email Service for Vee Nutrition
import { db } from './firebase';

// Test Firebase connection immediately
(async () => {
  try {
    console.log('Testing Firebase Firestore connection...');
    const testDoc = await db.collection('test').add({ timestamp: new Date() });
    console.log('✓ Firebase connection successful! Test doc ID:', testDoc.id);
    await db.collection('test').doc(testDoc.id).delete();
    console.log('✓ Firebase write/delete operations working');
  } catch (error) {
    console.error('✗ Firebase connection failed:', error);
  }
})();

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

      console.log('Attempting to write to Firebase mail collection...');
      const docRef = await db.collection('mail').add(emailDoc);
      console.log(`✓ Email successfully queued in Firebase with ID: ${docRef.id}`);
      console.log(`Firebase Functions should now process email to ${params.to}`);
      return true;
    } catch (error) {
      console.error('✗ Failed to write to Firebase mail collection:', error);
      console.error('Check Firebase credentials and project configuration');
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

  // Enhanced email automation for client notifications
  async sendInvoiceGenerated(email: string, name: string, amount: number, invoiceId: string): Promise<boolean> {
    const template = this.getInvoiceGeneratedTemplate(name, amount, invoiceId);
    return this.sendEmail({
      to: email,
      toName: name,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  async sendAppointmentCancelled(email: string, name: string, date: string, time: string, reason?: string): Promise<boolean> {
    const template = this.getAppointmentCancelledTemplate(name, date, time, reason);
    return this.sendEmail({
      to: email,
      toName: name,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  async sendLateRescheduleNotice(email: string, name: string, date: string, time: string): Promise<boolean> {
    const template = this.getLateRescheduleTemplate(name, date, time);
    return this.sendEmail({
      to: email,
      toName: name,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  async sendNoShowNotice(email: string, name: string, date: string, time: string, penaltyAmount: number): Promise<boolean> {
    const template = this.getNoShowTemplate(name, date, time, penaltyAmount);
    return this.sendEmail({
      to: email,
      toName: name,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  // Admin notification emails
  async sendAdminNewAppointment(appointmentData: any): Promise<boolean> {
    const template = this.getAdminNewAppointmentTemplate(appointmentData);
    return this.sendEmail({
      to: 'admin@veenutrition.com',
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  async sendAdminInvoicePaid(clientName: string, amount: number, invoiceId: string): Promise<boolean> {
    const template = this.getAdminInvoicePaidTemplate(clientName, amount, invoiceId);
    return this.sendEmail({
      to: 'admin@veenutrition.com',
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  async sendAdminMedicalUpdate(clientName: string, clientEmail: string): Promise<boolean> {
    const template = this.getAdminMedicalUpdateTemplate(clientName, clientEmail);
    return this.sendEmail({
      to: 'admin@veenutrition.com',
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  async sendAdminPlanUpgrade(clientName: string, planType: string): Promise<boolean> {
    const template = this.getAdminPlanUpgradeTemplate(clientName, planType);
    return this.sendEmail({
      to: 'admin@veenutrition.com',
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  async sendPaymentReminder(email: string, name: string, amount: number, invoiceNumber: string, paymentUrl: string): Promise<boolean> {
    const template = this.getPaymentReminderTemplate(name, amount, invoiceNumber, paymentUrl);
    return this.sendEmail({
      to: email,
      toName: name,
      subject: template.subject,
      html: template.html,
      text: template.text
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

  // New email templates for enhanced automation
  private getInvoiceGeneratedTemplate(name: string, amount: number, invoiceId: string): EmailTemplate {
    return {
      subject: `New Invoice Generated - €${amount.toFixed(2)} | Vee Nutrition`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 20px;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #A5CBA4; margin: 0;">🌿 Vee Nutrition</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">New Invoice Generated</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Hi ${name}, a new invoice has been generated for your recent session.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #A5CBA4;">
              <h3 style="color: #333; margin-top: 0;">Invoice Details</h3>
              <p style="margin: 5px 0;"><strong>Invoice ID:</strong> ${invoiceId}</p>
              <p style="margin: 5px 0;"><strong>Amount:</strong> €${amount.toFixed(2)}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.REPLIT_DEV_DOMAIN || 'https://your-domain.com'}/dashboard/invoices" 
                 style="background-color: #A5CBA4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                View in Dashboard
              </a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
              <p>Vee Nutrition | Transforming Lives Through Nutrition</p>
              <p>Email: info@veenutrition.com</p>
            </div>
          </div>
        </div>
      `,
      text: `Hi ${name}, a new invoice for €${amount.toFixed(2)} has been generated. Invoice ID: ${invoiceId}. View in your dashboard.`
    };
  }

  private getAppointmentCancelledTemplate(name: string, date: string, time: string, reason?: string): EmailTemplate {
    return {
      subject: `Appointment Cancelled - ${date} | Vee Nutrition`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 20px;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #A5CBA4; margin: 0;">🌿 Vee Nutrition</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Appointment Cancelled</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Hi ${name}, we're writing to inform you that your appointment has been cancelled.
            </p>
            
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h3 style="color: #856404; margin-top: 0;">Cancelled Appointment</h3>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${date}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
              ${reason ? `<p style="margin: 5px 0;"><strong>Reason:</strong> ${reason}</p>` : ''}
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              We apologize for any inconvenience. Please review our cancellation policy in your dashboard for more details.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.REPLIT_DEV_DOMAIN || 'https://your-domain.com'}/dashboard/appointments" 
                 style="background-color: #A5CBA4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Book New Appointment
              </a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
              <p>Vee Nutrition | Transforming Lives Through Nutrition</p>
              <p>Email: info@veenutrition.com</p>
            </div>
          </div>
        </div>
      `,
      text: `Hi ${name}, your appointment on ${date} at ${time} has been cancelled. ${reason ? 'Reason: ' + reason : ''} Please book a new appointment in your dashboard.`
    };
  }

  private getLateRescheduleTemplate(name: string, date: string, time: string): EmailTemplate {
    return {
      subject: `Late Reschedule Notice - €5 Fee Applied | Vee Nutrition`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 20px;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #A5CBA4; margin: 0;">🌿 Vee Nutrition</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Late Reschedule Notice</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Hi ${name}, we've received your reschedule request for your appointment on ${date} at ${time}.
            </p>
            
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h3 style="color: #856404; margin-top: 0;">Late Reschedule Fee</h3>
              <p style="margin: 5px 0;">Since this reschedule request was made within 4 working hours of your appointment, a €5 administrative fee has been applied.</p>
              <p style="margin: 15px 0 5px 0;"><strong>If emergency circumstances arose, please contact us and we will happily accommodate where possible.</strong></p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.REPLIT_DEV_DOMAIN || 'https://your-domain.com'}/dashboard/appointments" 
                 style="background-color: #A5CBA4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                View Dashboard
              </a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
              <p>Vee Nutrition | Transforming Lives Through Nutrition</p>
              <p>Email: info@veenutrition.com</p>
            </div>
          </div>
        </div>
      `,
      text: `Hi ${name}, your late reschedule request for ${date} at ${time} has been processed. A €5 fee has been applied. For emergencies, please contact us.`
    };
  }

  private getNoShowTemplate(name: string, date: string, time: string, penaltyAmount: number): EmailTemplate {
    return {
      subject: `No-Show Notice - 50% Penalty Fee Applied | Vee Nutrition`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 20px;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #A5CBA4; margin: 0;">🌿 Vee Nutrition</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">No-Show Notice</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Hi ${name}, we noticed you didn't attend your scheduled appointment on ${date} at ${time}.
            </p>
            
            <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
              <h3 style="color: #721c24; margin-top: 0;">No-Show Penalty</h3>
              <p style="margin: 5px 0;">According to our cancellation policy, a 50% penalty fee of €${penaltyAmount.toFixed(2)} has been applied to your account.</p>
              <p style="margin: 15px 0 5px 0;"><strong>This helps us maintain availability for all our clients.</strong></p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Please review our full cancellation policy in your dashboard. If you have any questions or concerns, please don't hesitate to contact us.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.REPLIT_DEV_DOMAIN || 'https://your-domain.com'}/dashboard" 
                 style="background-color: #A5CBA4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                View Dashboard
              </a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
              <p>Vee Nutrition | Transforming Lives Through Nutrition</p>
              <p>Email: info@veenutrition.com</p>
            </div>
          </div>
        </div>
      `,
      text: `Hi ${name}, you missed your appointment on ${date} at ${time}. A 50% penalty fee of €${penaltyAmount.toFixed(2)} has been applied per our policy.`
    };
  }

  // Admin notification templates
  private getAdminNewAppointmentTemplate(appointment: any): EmailTemplate {
    return {
      subject: `New Appointment Request - ${appointment.name} | Admin Notification`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 20px;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #A5CBA4; margin: 0;">🌿 Vee Nutrition Admin</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">New Appointment Request</h2>
            
            <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
              <h3 style="color: #1565c0; margin-top: 0;">Appointment Details</h3>
              <p style="margin: 5px 0;"><strong>Client:</strong> ${appointment.name}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${appointment.email}</p>
              <p style="margin: 5px 0;"><strong>Type:</strong> ${appointment.type}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${appointment.date}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${appointment.timeslot}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> Pending Confirmation</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.REPLIT_DEV_DOMAIN || 'https://your-domain.com'}/admin/appointments" 
                 style="background-color: #A5CBA4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Review in Admin Dashboard
              </a>
            </div>
          </div>
        </div>
      `,
      text: `New appointment request from ${appointment.name} (${appointment.email}) for ${appointment.type} on ${appointment.date} at ${appointment.timeslot}.`
    };
  }

  private getAdminInvoicePaidTemplate(clientName: string, amount: number, invoiceId: string): EmailTemplate {
    return {
      subject: `Invoice Paid - €${amount.toFixed(2)} from ${clientName} | Admin Notification`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 20px;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #A5CBA4; margin: 0;">🌿 Vee Nutrition Admin</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Payment Received</h2>
            
            <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="color: #155724; margin-top: 0;">Payment Details</h3>
              <p style="margin: 5px 0;"><strong>Client:</strong> ${clientName}</p>
              <p style="margin: 5px 0;"><strong>Amount:</strong> €${amount.toFixed(2)}</p>
              <p style="margin: 5px 0;"><strong>Invoice ID:</strong> ${invoiceId}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> Paid</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.REPLIT_DEV_DOMAIN || 'https://your-domain.com'}/admin/invoices" 
                 style="background-color: #A5CBA4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                View in Admin Dashboard
              </a>
            </div>
          </div>
        </div>
      `,
      text: `Payment received: €${amount.toFixed(2)} from ${clientName} for invoice ${invoiceId}.`
    };
  }

  private getAdminMedicalUpdateTemplate(clientName: string, clientEmail: string): EmailTemplate {
    return {
      subject: `Medical History Updated - ${clientName} | Admin Notification`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 20px;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #A5CBA4; margin: 0;">🌿 Vee Nutrition Admin</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Medical History Updated</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              ${clientName} has updated their medical history, including chronic conditions, medications, or GP contact information.
            </p>
            
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h3 style="color: #856404; margin-top: 0;">Client Information</h3>
              <p style="margin: 5px 0;"><strong>Name:</strong> ${clientName}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${clientEmail}</p>
              <p style="margin: 5px 0;"><strong>Action Required:</strong> Review updated medical information</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.REPLIT_DEV_DOMAIN || 'https://your-domain.com'}/admin/users" 
                 style="background-color: #A5CBA4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Review Client Profile
              </a>
            </div>
          </div>
        </div>
      `,
      text: `${clientName} (${clientEmail}) has updated their medical history. Please review the changes in the admin dashboard.`
    };
  }

  private getAdminPlanUpgradeTemplate(clientName: string, planType: string): EmailTemplate {
    return {
      subject: `Plan ${planType === 'complete-program' ? 'Upgrade' : 'Renewal'} - ${clientName} | Admin Notification`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 20px;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #A5CBA4; margin: 0;">🌿 Vee Nutrition Admin</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Service Plan ${planType === 'complete-program' ? 'Upgrade' : 'Renewal'}</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              ${clientName} has ${planType === 'complete-program' ? 'upgraded to' : 'renewed'} the Complete Program.
            </p>
            
            <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="color: #155724; margin-top: 0;">${planType === 'complete-program' ? 'Upgrade' : 'Renewal'} Details</h3>
              <p style="margin: 5px 0;"><strong>Client:</strong> ${clientName}</p>
              <p style="margin: 5px 0;"><strong>Plan:</strong> Complete Program (3 months)</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> Active</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.REPLIT_DEV_DOMAIN || 'https://your-domain.com'}/admin/subscriptions" 
                 style="background-color: #A5CBA4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                View Subscriptions
              </a>
            </div>
          </div>
        </div>
      `,
      text: `${clientName} has ${planType === 'complete-program' ? 'upgraded to' : 'renewed'} the Complete Program.`
    };
  }

  private getPaymentReminderTemplate(name: string, amount: number, invoiceNumber: string, paymentUrl: string): EmailTemplate {
    return {
      subject: `Payment Reminder - Invoice ${invoiceNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #A5CBA4;">Payment Reminder</h2>
          <p>Dear ${name},</p>
          <p>This is a friendly reminder that payment for your invoice is still pending.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #333;">Invoice Details</h3>
            <p style="margin: 5px 0;"><strong>Invoice Number:</strong> ${invoiceNumber}</p>
            <p style="margin: 5px 0;"><strong>Amount Due:</strong> €${amount.toFixed(2)}</p>
          </div>

          <p>You can complete your payment securely using the link below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${paymentUrl}" style="background-color: #A5CBA4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Pay Invoice</a>
          </div>

          <p>If you have any questions about this invoice or need assistance with payment, please don't hesitate to contact us.</p>
          
          <p>Best regards,<br/>
          Vee Nutrition Team</p>
        </div>
      `,
      text: `Payment Reminder - Invoice ${invoiceNumber}

Dear ${name},

This is a friendly reminder that payment for invoice ${invoiceNumber} (€${amount.toFixed(2)}) is still pending.

You can pay online at: ${paymentUrl}

If you have any questions, please contact us.

Best regards,
Vee Nutrition Team`
    };
  }
}

export const mailerLiteService = new MailerLiteService();