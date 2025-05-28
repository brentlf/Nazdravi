import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// UPDATED: Switch from MailerLite to Resend
const RESEND_API_URL = 'https://api.resend.com/emails';
const RESEND_API_KEY = functions.config().resend?.apikey;

interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

// UPDATED: Changed class name and API calls to use Resend
class ResendEmailService {
  async sendEmail(to: string, toName: string, subject: string, html: string, text?: string): Promise<boolean> {
    if (!RESEND_API_KEY) {
      console.error('Resend API key not configured');
      return false;
    }

    try {
      const fetch = (await import('node-fetch')).default;
      
      // UPDATED: Use Resend API format instead of MailerLite
      const response = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'info@veenutrition.com',
          to: [to],
          subject: subject,
          html: html,
          text: text || '',
        }),
      });

      if (response.ok) {
        console.log(`Email sent successfully to ${to}`);
        return true;
      } else {
        const errorText = await response.text();
        console.error('Resend API error:', response.status, errorText);
        return false;
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  getAccountConfirmationTemplate(name: string): EmailTemplate {
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
              <a href="https://your-domain.replit.app/dashboard" style="background-color: #A5CBA4; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
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

  // ADDED: Payment reminder template that was missing
  getPaymentReminderTemplate(name: string, amount: number, invoiceNumber: string, paymentUrl: string): EmailTemplate {
    return {
      subject: `Payment Reminder - Invoice ${invoiceNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8faf8;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #A5CBA4; margin: 0;">🌿 Vee Nutrition</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">💰 Payment Reminder</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Dear ${name},
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              This is a friendly reminder that payment for your invoice is still pending.
            </p>
            
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h3 style="margin: 0 0 10px 0; color: #856404;">Invoice Details</h3>
              <p style="margin: 5px 0; color: #856404;"><strong>Invoice Number:</strong> ${invoiceNumber}</p>
              <p style="margin: 5px 0; color: #856404;"><strong>Amount Due:</strong> €${amount.toFixed(2)}</p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              You can complete your payment securely using the link below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${paymentUrl}" style="background-color: #A5CBA4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Pay Invoice</a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              If you have any questions about this invoice or need assistance with payment, please don't hesitate to contact us.
            </p>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
              <p>Vee Nutrition | Transforming Lives Through Nutrition</p>
              <p>Email: info@veenutrition.com</p>
            </div>
          </div>
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

  getAppointmentConfirmationTemplate(name: string, date: string, time: string, type: string): EmailTemplate {
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
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
              <p>Vee Nutrition | Your Health, Our Priority</p>
              <p>Questions? Reply to this email or message us through your dashboard</p>
            </div>
          </div>
        </div>
      `,
      text: `Appointment Confirmed! Hi ${name}, your ${type} appointment is confirmed for ${date} at ${time}. Please keep a food diary and prepare any questions.`
    };
  }

  getAppointmentReminderTemplate(name: string, date: string, time: string, type: string): EmailTemplate {
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
      text: `Appointment Reminder: Hi ${name}, your ${type} appointment is tomorrow (${date}) at ${time}. Please review your food diary and prepare any questions.`
    };
  }

  getRescheduleRequestTemplate(clientName: string, clientEmail: string, originalDate: string, originalTime: string, reason?: string): EmailTemplate {
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
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
              <p>Vee Nutrition Admin Dashboard</p>
              <p>Please respond to this request promptly</p>
            </div>
          </div>
        </div>
      `,
      text: `Reschedule request from ${clientName} (${clientEmail}) for appointment on ${originalDate} at ${originalTime}. ${reason ? `Reason: ${reason}` : ''}`
    };
  }
}

// UPDATED: Changed variable name from mailerLite to resendService
const resendService = new ResendEmailService();

// 1. New User Account Created
export const onUserCreated = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    const user = snap.data();
    
    if (user && user.email && user.name && user.role === 'client') {
      console.log(`Sending welcome email to new user: ${user.email}`);
      
      const template = resendService.getAccountConfirmationTemplate(user.name);
      await resendService.sendEmail(
        user.email,
        user.name,
        template.subject,
        template.html,
        template.text
      );
    }
  });

// 2. Appointment Status Changed to Confirmed
export const onAppointmentConfirmed = functions.firestore
  .document('appointments/{appointmentId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    // Check if status changed from pending to confirmed
    if (before.status === 'pending' && after.status === 'confirmed') {
      console.log(`Sending confirmation email for appointment: ${context.params.appointmentId}`);
      
      const template = resendService.getAppointmentConfirmationTemplate(
        after.name,
        after.date,
        after.timeslot,
        after.type
      );
      
      await resendService.sendEmail(
        after.email,
        after.name,
        template.subject,
        template.html,
        template.text
      );
    }
  });

// 3. Reschedule Request Created
export const onRescheduleRequest = functions.firestore
  .document('appointments/{appointmentId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    // Check if status changed to reschedule_requested
    if (before.status !== 'reschedule_requested' && after.status === 'reschedule_requested') {
      console.log(`Sending reschedule notification for appointment: ${context.params.appointmentId}`);
      
      // Send to admin email (you can configure this)
      const adminEmail = 'admin@veenutrition.com'; // Configure your admin email
      
      const template = resendService.getRescheduleRequestTemplate(
        after.name,
        after.email,
        after.date,
        after.timeslot,
        after.rescheduleReason
      );
      
      await resendService.sendEmail(
        adminEmail,
        'Vee Nutrition Admin',
        template.subject,
        template.html,
        template.text
      );
    }
  });

// 4. UPDATED: Enhanced Mail Queue Processor to handle missing email types
export const processMailQueue = functions.firestore
  .document('mail/{mailId}')
  .onCreate(async (snap, context) => {
    const mailData = snap.data();
    
    if (mailData.status !== 'pending') {
      return;
    }
    
    console.log(`Processing email from queue: ${mailData.to}, Type: ${mailData.type}`);
    
    try {
      let template;
      
      // ADDED: Handle specific email types including the missing ones
      switch (mailData.type) {
        case 'account-confirmation':
        case 'welcome':
          const welcomeName = mailData.data?.name || mailData.toName;
          template = resendService.getAccountConfirmationTemplate(welcomeName);
          break;
          
        case 'payment-reminder':
          template = resendService.getPaymentReminderTemplate(
            mailData.data.name,
            mailData.data.amount,
            mailData.data.invoiceNumber,
            mailData.data.paymentUrl
          );
          break;
          
        case 'appointment-confirmation':
          template = resendService.getAppointmentConfirmationTemplate(
            mailData.data.name,
            mailData.data.date,
            mailData.data.time,
            mailData.data.type
          );
          break;
          
        case 'appointment-reminder':
          template = resendService.getAppointmentReminderTemplate(
            mailData.data.name,
            mailData.data.date,
            mailData.data.time,
            mailData.data.type
          );
          break;
          
        default:
          // PRESERVED: Keep existing behavior for other email types
          if (mailData.subject && mailData.html) {
            template = {
              subject: mailData.subject,
              html: mailData.html,
              text: mailData.text
            };
          } else {
            console.log('Unknown email type or missing email content:', mailData.type);
            await snap.ref.update({
              status: 'failed',
              error: `Unknown email type: ${mailData.type}`,
              processedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            return;
          }
      }
      
      // UPDATED: Use Resend service instead of MailerLite
      const success = await resendService.sendEmail(
        mailData.to,
        mailData.toName || '',
        template.subject,
        template.html,
        template.text
      );
      
      // Update the document with the result
      await snap.ref.update({
        status: success ? 'sent' : 'failed',
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        success: success
      });
      
      console.log(`Email ${success ? 'sent successfully' : 'failed'} to ${mailData.to}`);
      
    } catch (error: any) {
      console.error('Email sending failed:', error);
      await snap.ref.update({
        status: 'failed',
        error: error?.message || 'Unknown error',
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  });

// 5. Daily Appointment Reminders (scheduled function)
export const sendDailyReminders = functions.pubsub
  .schedule('0 18 * * *') // Run every day at 6 PM
  .timeZone('Europe/Amsterdam') // Adjust to your timezone
  .onRun(async (context) => {
    console.log('Running daily appointment reminders...');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    try {
      // Get all confirmed appointments for tomorrow
      const appointmentsSnapshot = await admin.firestore()
        .collection('appointments')
        .where('date', '==', tomorrowStr)
        .where('status', '==', 'confirmed')
        .get();
      
      const reminderPromises = appointmentsSnapshot.docs.map(async (doc) => {
        const appointment = doc.data();
        
        console.log(`Sending reminder to ${appointment.email} for appointment tomorrow`);
        
        const template = resendService.getAppointmentReminderTemplate(
          appointment.name,
          appointment.date,
          appointment.timeslot,
          appointment.type
        );
        
        return resendService.sendEmail(
          appointment.email,
          appointment.name,
          template.subject,
          template.html,
          template.text
        );
      });
      
      await Promise.all(reminderPromises);
      console.log(`Sent ${reminderPromises.length} appointment reminders`);
      
    } catch (error) {
      console.error('Error sending daily reminders:', error);
    }
  });