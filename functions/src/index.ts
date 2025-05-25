import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as https from 'https';

// Initialize Firebase Admin
admin.initializeApp();

interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

class ResendEmailService {
  async sendEmail(to: string, toName: string, subject: string, html: string, text?: string): Promise<boolean> {
    const RESEND_API_KEY = functions.config().resend.apikey;
    
    if (!RESEND_API_KEY) {
      console.error('Resend API key not configured');
      return false;
    }

    return new Promise((resolve) => {
      const postData = JSON.stringify({
        from: 'Vee Nutrition <info@veenutrition.com>',
        to: [`${toName} <${to}>`],
        subject: subject,
        html: html,
        text: text || ''
      });

      const options = {
        hostname: 'api.resend.com',
        port: 443,
        path: '/emails',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          console.log('Resend response:', res.statusCode, responseData);
          
          if (res.statusCode === 200 || res.statusCode === 201) {
            console.log(`Email sent successfully to: ${to}`);
            resolve(true);
          } else {
            console.error('Resend API error:', res.statusCode, responseData);
            resolve(false);
          }
        });
      });

      req.on('error', (error) => {
        console.error('Email sending failed:', error);
        resolve(false);
      });

      req.write(postData);
      req.end();
    });
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
            
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h3 style="color: #856404; margin-top: 0; font-size: 16px;">📋 Cancellation & Reschedule Policy</h3>
              <ul style="color: #856404; margin: 10px 0; padding-left: 20px; line-height: 1.6;">
                <li><strong>Free Cancellation:</strong> Cancel or reschedule up to 4 working hours before your appointment</li>
                <li><strong>Late Reschedule Fee:</strong> €15 penalty applies for changes within 4 working hours</li>
                <li><strong>No-Show Fee:</strong> €25 penalty applies if you miss your appointment</li>
                <li><strong>Working Hours:</strong> Monday-Friday 9am-10pm, Saturday 9am-12pm (Sunday excluded)</li>
              </ul>
              <p style="color: #856404; margin: 10px 0; font-size: 14px; font-style: italic;">
                Please plan ahead to avoid penalty fees. We understand life happens - just give us enough notice when possible!
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

  getAdminNewAppointmentTemplate(appointment: any): EmailTemplate {
    return {
      subject: `New Appointment Booked - ${appointment.clientName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8faf8;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #A5CBA4; margin: 0;">🌿 Vee Nutrition</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">📅 New Appointment Booked</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              A new appointment has been booked by a client.
            </p>
            
            <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="color: #155724; margin-top: 0;">Client Information</h3>
              <p style="margin: 5px 0; color: #155724;"><strong>Name:</strong> ${appointment.clientName}</p>
              <p style="margin: 5px 0; color: #155724;"><strong>Email:</strong> ${appointment.clientEmail}</p>
              <p style="margin: 5px 0; color: #155724;"><strong>Phone:</strong> ${appointment.clientPhone || 'Not provided'}</p>
            </div>
            
            <div style="background-color: #A5CBA4; color: white; padding: 25px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; font-size: 18px;">📅 Appointment Details</h3>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Type:</strong> ${appointment.type}</p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Date:</strong> ${appointment.date}</p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Time:</strong> ${appointment.time}</p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Status:</strong> ${appointment.status}</p>
            </div>
            
            ${appointment.notes ? `
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6c757d;">
              <h3 style="color: #495057; margin-top: 0;">Notes</h3>
              <p style="margin: 0; color: #495057;">${appointment.notes}</p>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #666; margin-bottom: 15px;">Review and manage this appointment in your admin dashboard</p>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
              <p>Vee Nutrition Admin Dashboard</p>
              <p>New appointment notification</p>
            </div>
          </div>
        </div>
      `,
      text: `New appointment booked by ${appointment.clientName} (${appointment.clientEmail}) for ${appointment.date} at ${appointment.time}. Type: ${appointment.type}`
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
  .onUpdate(async (change, context) => {
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
  .onCreate(async (snap, context) => {
    const appointmentData = snap.data();
    
    console.log('New appointment created:', appointmentData.clientEmail);
    
    const template = emailService.getAdminNewAppointmentTemplate(appointmentData);
    
    // Send admin notification
    await admin.firestore().collection('mail').add({
      to: 'admin@veenutrition.com',
      toName: 'Vee Nutrition Admin',
      subject: template.subject,
      html: template.html,
      text: template.text,
      type: 'admin-new-appointment',
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    console.log('Admin notification queued for new appointment');
  });

// 4. Reschedule Request
export const onRescheduleRequest = functions.firestore
  .document('appointments/{appointmentId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    // Check if reschedule was requested
    if (!before.rescheduleRequested && after.rescheduleRequested) {
      console.log('Reschedule requested for:', after.clientEmail);
      
      const template = emailService.getRescheduleRequestTemplate(
        after.clientName,
        after.clientEmail,
        after.date,
        after.time,
        after.rescheduleReason
      );
      
      // Send to admin email
      await admin.firestore().collection('mail').add({
        to: 'admin@veenutrition.com',
        toName: 'Vee Nutrition Admin',
        subject: template.subject,
        html: template.html,
        text: template.text,
        type: 'reschedule-request',
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  });

// 4. Process Mail Queue
export const processMailQueue = functions.firestore
  .document('mail/{mailId}')
  .onCreate(async (snap, context) => {
    const mailData = snap.data();
    
    if (mailData.status !== 'pending') {
      return;
    }
    
    console.log('Processing email from queue:', mailData.to);
    
    try {
      const success = await emailService.sendEmail(
        mailData.to,
        mailData.toName || mailData.to,
        mailData.subject,
        mailData.html,
        mailData.text
      );
      
      if (success) {
        await snap.ref.update({
          status: 'sent',
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log('Email sent successfully to', mailData.to);
      } else {
        await snap.ref.update({
          status: 'failed',
          failedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log('Email failed to', mailData.to);
      }
    } catch (error: any) {
      console.error('Email sending failed:', error);
      await snap.ref.update({
        status: 'failed',
        error: error.message,
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