// MailerLite Email Service for Vee Nutrition

const MAILERLITE_API_URL = 'https://connect.mailerlite.com/api';
const API_KEY = process.env.MAILERLITE_API_KEY;

if (!API_KEY) {
  console.warn('MAILERLITE_API_KEY not found in environment variables');
}

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
  private apiKey: string;

  constructor() {
    this.apiKey = API_KEY || '';
  }

  async sendEmail(params: SendEmailParams): Promise<boolean> {
    if (!this.apiKey) {
      console.error('MailerLite API key not configured');
      return false;
    }

    try {
      // Use MailerLite's newer API for sending emails
      const response = await fetch(`${MAILERLITE_API_URL}/emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          to: [{
            email: params.to,
            name: params.toName || params.to,
          }],
          from: {
            email: 'info@veenutrition.com',
            name: 'Vee Nutrition',
          },
          subject: params.subject,
          html: params.html,
          text: params.text || '',
        }),
      });

      if (response.ok) {
        console.log(`Email sent successfully to ${params.to}`);
        return true;
      } else {
        const errorText = await response.text();
        console.error('MailerLite API error:', response.status, errorText);
        return false;
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  private async sendViaCampaign(params: SendEmailParams): Promise<boolean> {
    try {
      // Create a simple campaign and send immediately
      const campaignResponse = await fetch(`${MAILERLITE_API_URL}/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-MailerLite-ApiKey': this.apiKey,
        },
        body: JSON.stringify({
          type: 'regular',
          subject: params.subject,
          from: 'info@veenutrition.com',
          from_name: 'Vee Nutrition',
          content: params.html,
        }),
      });

      if (campaignResponse.ok) {
        const campaign = await campaignResponse.json();
        console.log('Alternative email method successful');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Alternative email method failed:', error);
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
    appointmentDate: string,
    appointmentTime: string,
    appointmentType: string
  ): Promise<boolean> {
    const template = this.getAppointmentConfirmationTemplate(name, appointmentDate, appointmentTime, appointmentType);
    return this.sendEmail({
      to: email,
      toName: name,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Reschedule request notification (to admin)
  async sendRescheduleRequest(
    adminEmail: string,
    clientName: string,
    clientEmail: string,
    originalDate: string,
    originalTime: string,
    reason?: string
  ): Promise<boolean> {
    const template = this.getRescheduleRequestTemplate(clientName, clientEmail, originalDate, originalTime, reason);
    return this.sendEmail({
      to: adminEmail,
      toName: 'Vee Nutrition Admin',
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Appointment reminder (day before)
  async sendAppointmentReminder(
    email: string,
    name: string,
    appointmentDate: string,
    appointmentTime: string,
    appointmentType: string
  ): Promise<boolean> {
    const template = this.getAppointmentReminderTemplate(name, appointmentDate, appointmentTime, appointmentType);
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
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://your-domain.com/dashboard" style="background-color: #A5CBA4; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Access Your Dashboard
              </a>
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
      subject: 'Appointment Confirmed - Vee Nutrition',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8faf8;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #A5CBA4; margin: 0;">🌿 Vee Nutrition</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Appointment Confirmed</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Hi ${name}, your appointment has been confirmed! We're looking forward to meeting with you.
            </p>
            
            <div style="background-color: #A5CBA4; color: white; padding: 25px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; font-size: 18px;">📅 Appointment Details</h3>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Type:</strong> ${type}</p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Date:</strong> ${date}</p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Time:</strong> ${time}</p>
            </div>
            
            <div style="background-color: #f0f8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #A5CBA4; margin-top: 0;">Preparation Tips</h3>
              <ul style="color: #666; padding-left: 20px;">
                <li>Keep a food diary for 3 days before your appointment</li>
                <li>Prepare a list of questions you'd like to discuss</li>
                <li>Bring any relevant medical reports or test results</li>
                <li>Have your current medications and supplements list ready</li>
              </ul>
            </div>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p style="margin: 0; color: #856404;">
                <strong>Cancellation Policy:</strong> Please provide at least 24 hours notice if you need to reschedule.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://your-domain.com/dashboard/appointments" style="background-color: #A5CBA4; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">
                View Appointment
              </a>
              <a href="https://your-domain.com/dashboard/messages" style="background-color: #6c757d; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Contact Us
              </a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
              <p>Vee Nutrition | Your Health, Our Priority</p>
              <p>Questions? Reply to this email or message us through your dashboard</p>
            </div>
          </div>
        </div>
      `,
      text: `Appointment Confirmed! Hi ${name}, your ${type} appointment is confirmed for ${date} at ${time}. Please keep a food diary and prepare any questions. Contact us if you need to reschedule.`
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
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #A5CBA4; margin: 0;">🌿 Vee Nutrition</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">🔄 Reschedule Request</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              A client has requested to reschedule their appointment.
            </p>
            
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h3 style="color: #856404; margin-top: 0;">Client Information</h3>
              <p style="margin: 5px 0; color: #856404;"><strong>Name:</strong> ${clientName}</p>
              <p style="margin: 5px 0; color: #856404;"><strong>Email:</strong> ${clientEmail}</p>
            </div>
            
            <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
              <h3 style="color: #721c24; margin-top: 0;">Original Appointment</h3>
              <p style="margin: 5px 0; color: #721c24;"><strong>Date:</strong> ${originalDate}</p>
              <p style="margin: 5px 0; color: #721c24;"><strong>Time:</strong> ${originalTime}</p>
            </div>
            
            ${reason ? `
            <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #17a2b8;">
              <h3 style="color: #0c5460; margin-top: 0;">Reason for Reschedule</h3>
              <p style="margin: 0; color: #0c5460;">${reason}</p>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://your-domain.com/admin/appointments" style="background-color: #A5CBA4; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">
                Manage Appointments
              </a>
              <a href="mailto:${clientEmail}" style="background-color: #6c757d; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Contact Client
              </a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
              <p>Vee Nutrition Admin Dashboard</p>
              <p>Please respond to this request promptly</p>
            </div>
          </div>
        </div>
      `,
      text: `Reschedule request from ${clientName} (${clientEmail}) for appointment on ${originalDate} at ${originalTime}. ${reason ? `Reason: ${reason}` : ''} Please check the admin dashboard to respond.`
    };
  }

  private getAppointmentReminderTemplate(
    name: string,
    date: string,
    time: string,
    type: string
  ): EmailTemplate {
    return {
      subject: 'Appointment Reminder - Tomorrow at Vee Nutrition',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8faf8;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #A5CBA4; margin: 0;">🌿 Vee Nutrition</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">⏰ Appointment Reminder</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Hi ${name}, this is a friendly reminder about your upcoming appointment tomorrow.
            </p>
            
            <div style="background-color: #A5CBA4; color: white; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h3 style="margin: 0 0 15px 0; font-size: 20px;">📅 Tomorrow's Appointment</h3>
              <p style="margin: 5px 0; font-size: 18px; font-weight: bold;">${type}</p>
              <p style="margin: 5px 0; font-size: 16px;">${date} at ${time}</p>
            </div>
            
            <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="color: #155724; margin-top: 0;">📝 Last-Minute Checklist</h3>
              <ul style="color: #155724; padding-left: 20px; margin: 0;">
                <li>Review your food diary</li>
                <li>Prepare any questions</li>
                <li>Gather relevant documents</li>
                <li>Check your calendar for conflicts</li>
              </ul>
            </div>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p style="margin: 0; color: #856404;">
                <strong>Need to reschedule?</strong> Please contact us as soon as possible if you can't make it.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://your-domain.com/dashboard/appointments" style="background-color: #A5CBA4; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">
                View Details
              </a>
              <a href="https://your-domain.com/dashboard/messages" style="background-color: #6c757d; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Contact Us
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; text-align: center; margin: 20px 0;">
              We're excited to see you tomorrow and continue your nutrition journey!
            </p>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
              <p>Vee Nutrition | Your Wellness Partner</p>
              <p>Looking forward to seeing you tomorrow!</p>
            </div>
          </div>
        </div>
      `,
      text: `Appointment Reminder: Hi ${name}, your ${type} appointment is tomorrow (${date}) at ${time}. Please review your food diary and prepare any questions. Contact us if you need to reschedule.`
    };
  }
}

export const mailerLiteService = new MailerLiteService();