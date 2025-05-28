import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

const RESEND_API_KEY = functions.config().resend?.apikey;
const RESEND_API_URL = 'https://api.resend.com/emails';

interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

class ResendEmailService {
  async sendEmail(to: string, toName: string, subject: string, html: string, text?: string): Promise<boolean> {
    if (!RESEND_API_KEY) {
      console.error('Resend API key not configured');
      return false;
    }

    try {
      const fetch = (await import('node-fetch')).default;
      
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
}

const emailService = new ResendEmailService();

// 1. New User Account Created
export const onUserCreated = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    const userData = snap.data();
    const name = userData.name || userData.displayName || userData.email;
    
    console.log('New user created:', userData.email);
    
    const template = emailService.getAccountConfirmationTemplate(name);
    
    // Add to email queue
    await admin.firestore().collection('mail').add({
      to: userData.email,
      toName: name,
      subject: template.subject,
      html: template.html,
      text: template.text,
      type: 'account-confirmation',
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

// 2. Appointment Confirmed
export const onAppointmentConfirmed = functions.firestore
  .document('appointments/{appointmentId}')
  .onUpdate(async (change: any, context: any) => {
    const before = change.before.data();
    const after = change.after.data();
    
    // Check if status changed to confirmed
    if (before.status !== 'confirmed' && after.status === 'confirmed') {
      console.log('Appointment confirmed:', after.clientEmail);
      
      const template = emailService.getAppointmentConfirmationTemplate(
        after.clientName,
        after.date,
        after.time,
        after.type
      );
      
      // Add to email queue
      await admin.firestore().collection('mail').add({
        to: after.clientEmail,
        toName: after.clientName,
        subject: template.subject,
        html: template.html,
        text: template.text,
        type: 'appointment-confirmation',
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  });

// 3. New Appointment Created - Admin Notification
export const onAppointmentCreated = functions.firestore
  .document('appointments/{appointmentId}')
  .onCreate(async (snap: any, context: any) => {
    const appointmentData = snap.data();
    
    console.log('New appointment created:', appointmentData.clientEmail);
    
    // Send admin notification (you can customize this template)
    await admin.firestore().collection('mail').add({
      to: 'admin@veenutrition.com',
      toName: 'Vee Nutrition Admin',
      subject: `New Appointment Request - ${appointmentData.clientName}`,
      html: `<p>New appointment request from ${appointmentData.clientName} (${appointmentData.clientEmail}) for ${appointmentData.date} at ${appointmentData.time}</p>`,
      text: `New appointment request from ${appointmentData.clientName}`,
      type: 'admin-new-appointment',
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    console.log('Admin notification queued for new appointment');
  });

// 4. Process Mail Queue - Updated to handle all email types
export const processMailQueue = functions.firestore
  .document('mail/{mailId}')
  .onCreate(async (snap: any, context: any) => {
    const mailData = snap.data();
    
    if (mailData.status !== 'pending') {
      return;
    }
    
    console.log('Processing email from queue:', mailData.to, 'Type:', mailData.type);
    
    try {
      let template;
      
      switch (mailData.type) {
        case 'account-confirmation':
          // For welcome emails, use the name from data or toName
          const welcomeName = mailData.data?.name || mailData.toName;
          template = emailService.getAccountConfirmationTemplate(welcomeName);
          break;
          
        case 'payment-reminder':
          // For payment reminders, get data from the data object
          template = emailService.getPaymentReminderTemplate(
            mailData.data.name,
            mailData.data.amount,
            mailData.data.invoiceNumber,
            mailData.data.paymentUrl
          );
          break;
          
        case 'appointment-confirmation':
          template = emailService.getAppointmentConfirmationTemplate(
            mailData.data.name,
            mailData.data.date,
            mailData.data.time,
            mailData.data.type
          );
          break;
          
        case 'appointment-reminder':
          template = emailService.getAppointmentReminderTemplate(
            mailData.data.name,
            mailData.data.date,
            mailData.data.time,
            mailData.data.type
          );
          break;
          
        default:
          // If email already has subject/html (from Firebase Functions), use them directly
          if (mailData.subject && mailData.html) {
            template = {
              subject: mailData.subject,
              html: mailData.html,
              text: mailData.text
            };
          } else {
            console.log('Unknown email type:', mailData.type);
            return;
          }
      }
      
      // Send email using Resend
      const success = await emailService.sendEmail(
        mailData.to,
        mailData.toName,
        template.subject,
        template.html,
        template.text
      );
      
      // Update status
      await snap.ref.update({
        status: success ? 'sent' : 'failed',
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
    } catch (error: any) {
      console.error('Email sending failed:', error);
      await snap.ref.update({
        status: 'failed',
        error: error?.message || 'Unknown error',
        failedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  });

// 5. Daily Reminder Scheduler
export const sendDailyReminders = functions.pubsub
  .schedule('0 18 * * *') // 6 PM daily
  .timeZone('Europe/Amsterdam')
  .onRun(async (context) => {
    console.log('Running daily appointment reminders...');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().split('T')[0];
    
    const appointmentsSnapshot = await admin.firestore()
      .collection('appointments')
      .where('date', '==', tomorrowString)
      .where('status', '==', 'confirmed')
      .get();
    
    const promises = appointmentsSnapshot.docs.map(async (doc) => {
      const appointment = doc.data();
      const template = emailService.getAppointmentReminderTemplate(
        appointment.clientName,
        appointment.date,
        appointment.time,
        appointment.type
      );
      
      return admin.firestore().collection('mail').add({
        to: appointment.clientEmail,
        toName: appointment.clientName,
        subject: template.subject,
        html: template.html,
        text: template.text,
        type: 'appointment-reminder',
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
    
    await Promise.all(promises);
    console.log(`Queued ${promises.length} reminder emails`);
  });