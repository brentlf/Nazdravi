import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import * as https from 'https';

// Initialize Firebase Admin
admin.initializeApp();

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

class ResendEmailService {
  async sendEmail(params: SendEmailParams): Promise<boolean> {
    console.log('🔧 DEBUG: ResendEmailService.sendEmail called');
    console.log('📧 Email params:', {
      to: params.to,
      toName: params.toName,
      subject: params.subject,
      hasHtml: !!params.html,
      hasText: !!params.text
    });
    
    const RESEND_API_KEY = functions.config().resend?.apikey;
    
    if (!RESEND_API_KEY) {
      console.error('❌ CRITICAL: Resend API key not configured in Firebase Functions config');
      console.error('💡 Fix: Run "firebase functions:config:set resend.apikey=YOUR_API_KEY"');
      return false;
    }
    
    console.log('✅ Resend API key found, proceeding with email send');

    return new Promise((resolve) => {
      const postData = JSON.stringify({
        from: 'Vee Nutrition <info@veenutrition.com>',
        to: [`${params.toName || ''} <${params.to}>`],
        subject: params.subject,
        html: params.html,
        text: params.text || ''
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
          console.log('📤 Resend API Response:', {
            statusCode: res.statusCode,
            responseData: responseData,
            emailTo: params.to,
            subject: params.subject
          });
          
          if (res.statusCode === 200 || res.statusCode === 201) {
            console.log(`✅ EMAIL SUCCESS: Sent to ${params.to} - Subject: ${params.subject}`);
            resolve(true);
          } else {
            console.error(`❌ EMAIL FAILED: Status ${res.statusCode} to ${params.to}`);
            console.error('📋 Full response:', responseData);
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
                <li><strong>Late Reschedule Fee:</strong> €5 penalty applies for changes within 4 working hours</li>
                <li><strong>No-Show Penalty:</strong> 50% of original appointment cost applies if you miss your appointment</li>
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

  getRescheduleRequestTemplate(clientName: string, clientEmail: string, originalDate: string, originalTime: string, reason?: string, isLateReschedule?: boolean, potentialLateFee?: number): EmailTemplate {
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



  getVeeRescheduleRequestTemplate(name: string, date: string, time: string, reason: string): EmailTemplate {
    return {
      subject: `Reschedule Request from Vee Nutrition`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8faf8;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #A5CBA4; margin: 0;">🌿 Vee Nutrition</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Reschedule Request</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Hi ${name}, we need to reschedule your upcoming appointment due to scheduling changes on our end.
            </p>
            
            <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
              <h3 style="color: #1565c0; margin-top: 0;">Current Appointment</h3>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${date}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
              <p style="margin: 5px 0;"><strong>Reason:</strong> ${reason}</p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              We sincerely apologize for any inconvenience this may cause. Please contact us to arrange a new appointment time that works for your schedule.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://your-domain.com/dashboard/appointments" 
                 style="background-color: #A5CBA4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Reschedule Appointment
              </a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
              <p>Vee Nutrition | Transforming Lives Through Nutrition</p>
              <p>Email: info@veenutrition.com</p>
            </div>
          </div>
        </div>
      `,
      text: `Hi ${name}, we need to reschedule your appointment on ${date} at ${time}. Reason: ${reason}. Please contact us to arrange a new time.`
    };
  }

  getRescheduleConfirmationTemplate(name: string, newDate: string, newTime: string, type: string): EmailTemplate {
    return {
      subject: 'Reschedule Confirmed - Vee Nutrition',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8faf8;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #A5CBA4; margin: 0;">🌿 Vee Nutrition</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">✅ Reschedule Confirmed</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Hi ${name}, your reschedule request has been approved! Here are your new appointment details:
            </p>
            
            <div style="background-color: #A5CBA4; color: white; padding: 25px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; font-size: 18px;">📅 New Appointment Details</h3>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Type:</strong> ${type}</p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>New Date:</strong> ${newDate}</p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>New Time:</strong> ${newTime}</p>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
              <p>Vee Nutrition | Your Health, Our Priority</p>
              <p>We look forward to seeing you at your new appointment time!</p>
            </div>
          </div>
        </div>
      `,
      text: `Reschedule confirmed! Your ${type} appointment has been moved to ${newDate} at ${newTime}.`
    };
  }

  getInvoiceGeneratedTemplate(name: string, amount: number, invoiceId: string): EmailTemplate {
    return {
      subject: 'Session Complete - Invoice Ready - Vee Nutrition',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8faf8;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #A5CBA4; margin: 0;">🌿 Vee Nutrition</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">💳 Invoice Ready</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Hi ${name}, thank you for your session! Your invoice is ready for payment.
            </p>
            
            <div style="background-color: #f0f8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #A5CBA4; margin-top: 0;">Invoice Details</h3>
              <p style="margin: 5px 0; color: #666;"><strong>Invoice ID:</strong> ${invoiceId}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Amount:</strong> €${amount}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Payment Methods:</strong> Credit Card, iDEAL</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://your-domain.replit.app/dashboard/invoices" style="background-color: #A5CBA4; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                View & Pay Invoice
              </a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
              <p>Vee Nutrition | Your Health, Our Priority</p>
              <p>Payment is typically due within 7 days of session completion</p>
            </div>
          </div>
        </div>
      `,
      text: `Session complete! Your invoice (${invoiceId}) for €${amount} is ready. View and pay at your dashboard.`
    };
  }

  getLateRescheduleTemplate(name: string, date: string, time: string): EmailTemplate {
    return {
      subject: 'Late Reschedule Notice - €5 Fee Applied - Vee Nutrition',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8faf8;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #A5CBA4; margin: 0;">🌿 Vee Nutrition</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">⏰ Late Reschedule Fee Applied</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Hi ${name}, your reschedule request for ${date} at ${time} has been processed.
            </p>
            
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h3 style="color: #856404; margin-top: 0;">Late Reschedule Fee</h3>
              <p style="color: #856404; margin: 10px 0;">
                Since your reschedule request was made within 4 working hours of your appointment, a €5 late reschedule fee has been applied according to our cancellation policy.
              </p>
              <p style="color: #856404; margin: 10px 0; font-size: 14px;">
                <strong>Fee Amount:</strong> €5.00
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              This fee will be added to your next invoice. We understand that sometimes urgent changes are necessary, and we appreciate your understanding of our policy.
            </p>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
              <p>Vee Nutrition | Your Health, Our Priority</p>
              <p>To avoid future fees, please reschedule at least 4 working hours in advance</p>
            </div>
          </div>
        </div>
      `,
      text: `Late reschedule notice: Your appointment on ${date} at ${time} has been rescheduled. A €5 late reschedule fee applies.`
    };
  }

  getNoShowPenaltyTemplate(name: string, date: string, time: string, penaltyAmount: number): EmailTemplate {
    return {
      subject: 'Missed Appointment - No-Show Penalty Applied - Vee Nutrition',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8faf8;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #A5CBA4; margin: 0;">🌿 Vee Nutrition</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">❌ Missed Appointment Notice</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Hi ${name}, we noticed you missed your scheduled appointment on ${date} at ${time}.
            </p>
            
            <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
              <h3 style="color: #721c24; margin-top: 0;">No-Show Penalty</h3>
              <p style="color: #721c24; margin: 10px 0;">
                According to our cancellation policy, a no-show penalty of 50% of the original appointment cost has been applied.
              </p>
              <p style="color: #721c24; margin: 10px 0; font-size: 16px;">
                <strong>Penalty Amount:</strong> €${penaltyAmount.toFixed(2)}
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              We understand that emergencies happen. If there were extenuating circumstances, please contact us to discuss your situation.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://your-domain.replit.app/dashboard/appointments" style="background-color: #A5CBA4; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Book New Appointment
              </a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
              <p>Vee Nutrition | Your Health, Our Priority</p>
              <p>Please contact us if you have questions about this penalty</p>
            </div>
          </div>
        </div>
      `,
      text: `Missed appointment notice: You missed your appointment on ${date} at ${time}. A no-show penalty of €${penaltyAmount.toFixed(2)} has been applied.`
    };
  }

  getAppointmentCancelledTemplate(name: string, date: string, time: string, reason?: string): EmailTemplate {
    return {
      subject: 'Appointment Cancelled - Vee Nutrition',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8faf8;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #A5CBA4; margin: 0;">🌿 Vee Nutrition</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">❌ Appointment Cancelled</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Hi ${name}, your appointment scheduled for ${date} at ${time} has been cancelled.
            </p>
            
            ${reason ? `
            <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #17a2b8;">
              <h3 style="color: #0c5460; margin-top: 0;">Cancellation Reason</h3>
              <p style="margin: 0; color: #0c5460;">${reason}</p>
            </div>
            ` : ''}
            
            <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="color: #155724; margin-top: 0;">Rebook Your Appointment</h3>
              <p style="color: #155724; margin: 0;">
                We'd love to see you soon! Please book a new appointment at your convenience through your dashboard.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://your-domain.replit.app/dashboard/appointments" style="background-color: #A5CBA4; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Book New Appointment
              </a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
              <p>Vee Nutrition | Your Health, Our Priority</p>
              <p>Questions? Reply to this email or contact us through your dashboard</p>
            </div>
          </div>
        </div>
      `,
      text: `Appointment cancelled: Your appointment on ${date} at ${time} has been cancelled. ${reason ? `Reason: ${reason}` : ''} Please book a new appointment when convenient.`
    };
  }

  // Admin notification templates
  getAdminNewAppointmentTemplate(appointmentData: {
    clientName: string;
    clientEmail: string;
    type: string;
    date: string;
    time: string;
  }): EmailTemplate {
    return {
      subject: `New Appointment Request - ${appointmentData.clientName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8faf8;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #A5CBA4; margin: 0;">🌿 Vee Nutrition Admin</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">📅 New Appointment Request</h2>
            
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h3 style="color: #856404; margin-top: 0;">Client Information</h3>
              <p style="margin: 5px 0; color: #856404;"><strong>Name:</strong> ${appointmentData.clientName}</p>
              <p style="margin: 5px 0; color: #856404;"><strong>Email:</strong> ${appointmentData.clientEmail}</p>
            </div>
            
            <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="color: #155724; margin-top: 0;">Appointment Details</h3>
              <p style="margin: 5px 0; color: #155724;"><strong>Type:</strong> ${appointmentData.type}</p>
              <p style="margin: 5px 0; color: #155724;"><strong>Date:</strong> ${appointmentData.date}</p>
              <p style="margin: 5px 0; color: #155724;"><strong>Time:</strong> ${appointmentData.time}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://your-domain.replit.app/admin/appointments" style="background-color: #A5CBA4; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Manage Appointments
              </a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
              <p>Vee Nutrition Admin Dashboard</p>
              <p>Please confirm or reschedule this appointment promptly</p>
            </div>
          </div>
        </div>
      `,
      text: `New appointment request from ${appointmentData.clientName} (${appointmentData.clientEmail}) for ${appointmentData.type} on ${appointmentData.date} at ${appointmentData.time}.`
    };
  }

  getAdminHealthUpdateTemplate(clientName: string, clientEmail: string, updateType: string): EmailTemplate {
    return {
      subject: `Health Information Update - ${clientName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8faf8;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #A5CBA4; margin: 0;">🌿 Vee Nutrition Admin</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">🏥 Health Information Update</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              ${clientName} has updated their health information.
            </p>
            
            <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #17a2b8;">
              <h3 style="color: #0c5460; margin-top: 0;">Update Details</h3>
              <p style="margin: 5px 0; color: #0c5460;"><strong>Client:</strong> ${clientName}</p>
              <p style="margin: 5px 0; color: #0c5460;"><strong>Email:</strong> ${clientEmail}</p>
              <p style="margin: 5px 0; color: #0c5460;"><strong>Update Type:</strong> ${updateType}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://your-domain.replit.app/admin/clients" style="background-color: #A5CBA4; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Review Client Profile
              </a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
              <p>Vee Nutrition Admin Dashboard</p>
              <p>Please review the updated health information</p>
            </div>
          </div>
        </div>
      `,
      text: `Health information update from ${clientName} (${clientEmail}). Update type: ${updateType}.`
    };
  }

  getAdminPaymentReceivedTemplate(clientName: string, amount: number, invoiceId: string, paymentMethod: string): EmailTemplate {
    return {
      subject: `Payment Received - ${clientName} - €${amount}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8faf8;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #A5CBA4; margin: 0;">🌿 Vee Nutrition Admin</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">💰 Payment Received</h2>
            
            <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="color: #155724; margin-top: 0;">Payment Details</h3>
              <p style="margin: 5px 0; color: #155724;"><strong>Client:</strong> ${clientName}</p>
              <p style="margin: 5px 0; color: #155724;"><strong>Amount:</strong> €${amount.toFixed(2)}</p>
              <p style="margin: 5px 0; color: #155724;"><strong>Invoice ID:</strong> ${invoiceId}</p>
              <p style="margin: 5px 0; color: #155724;"><strong>Payment Method:</strong> ${paymentMethod}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://your-domain.replit.app/admin/invoices" style="background-color: #A5CBA4; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                View Invoice Details
              </a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
              <p>Vee Nutrition Admin Dashboard</p>
              <p>Payment has been successfully processed</p>
            </div>
          </div>
        </div>
      `,
      text: `Payment received from ${clientName}: €${amount.toFixed(2)} for invoice ${invoiceId} via ${paymentMethod}.`
    };
  }

  getAdminPlanUpgradeTemplate(clientName: string, planType: string, previousPlan: string): EmailTemplate {
    return {
      subject: `Plan Upgrade - ${clientName} - ${planType}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8faf8;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #A5CBA4; margin: 0;">🌿 Vee Nutrition Admin</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">⬆️ Service Plan Upgrade</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              ${clientName} has upgraded their service plan.
            </p>
            
            <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="color: #155724; margin-top: 0;">Upgrade Details</h3>
              <p style="margin: 5px 0; color: #155724;"><strong>Client:</strong> ${clientName}</p>
              <p style="margin: 5px 0; color: #155724;"><strong>Previous Plan:</strong> ${previousPlan}</p>
              <p style="margin: 5px 0; color: #155724;"><strong>New Plan:</strong> ${planType}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://your-domain.replit.app/admin/clients" style="background-color: #A5CBA4; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                View Client Profile
              </a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
              <p>Vee Nutrition Admin Dashboard</p>
              <p>Client's service level has been updated</p>
            </div>
          </div>
        </div>
      `,
      text: `Service plan upgrade: ${clientName} upgraded from ${previousPlan} to ${planType}.`
    };
  }

  getAdminClientMessageTemplate(clientName: string, clientEmail: string, messageType: string, urgency: string): EmailTemplate {
    return {
      subject: `New Client Message - ${clientName} - ${urgency}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8faf8;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #A5CBA4; margin: 0;">🌿 Vee Nutrition Admin</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">💬 New Client Message</h2>
            
            <div style="background-color: ${urgency === 'High' ? '#f8d7da' : urgency === 'Medium' ? '#fff3cd' : '#d4edda'}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${urgency === 'High' ? '#dc3545' : urgency === 'Medium' ? '#ffc107' : '#28a745'};">
              <h3 style="color: ${urgency === 'High' ? '#721c24' : urgency === 'Medium' ? '#856404' : '#155724'}; margin-top: 0;">Message Details</h3>
              <p style="margin: 5px 0; color: ${urgency === 'High' ? '#721c24' : urgency === 'Medium' ? '#856404' : '#155724'};"><strong>Client:</strong> ${clientName}</p>
              <p style="margin: 5px 0; color: ${urgency === 'High' ? '#721c24' : urgency === 'Medium' ? '#856404' : '#155724'};"><strong>Email:</strong> ${clientEmail}</p>
              <p style="margin: 5px 0; color: ${urgency === 'High' ? '#721c24' : urgency === 'Medium' ? '#856404' : '#155724'};"><strong>Message Type:</strong> ${messageType}</p>
              <p style="margin: 5px 0; color: ${urgency === 'High' ? '#721c24' : urgency === 'Medium' ? '#856404' : '#155724'};"><strong>Urgency:</strong> ${urgency}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://your-domain.replit.app/admin/messages" style="background-color: #A5CBA4; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                View Message
              </a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
              <p>Vee Nutrition Admin Dashboard</p>
              <p>Please respond to this message promptly</p>
            </div>
          </div>
        </div>
      `,
      text: `New ${urgency.toLowerCase()} priority message from ${clientName} (${clientEmail}). Type: ${messageType}.`
    };
  }
}

const emailService = new ResendEmailService();

// 1. New User Account Created
export const onUserCreated = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap: any, context: any) => {
    const user = snap.data();
    const userId = context.params.userId;
    
    console.log('🔍 DEBUG: NEW USER CREATED TRIGGER');
    console.log('📧 User Email:', user.email);
    console.log('👤 User Name:', user.name);
    console.log('🆔 User ID:', userId);
    console.log('📋 User Role:', user.role);
    console.log('🕒 Timestamp:', new Date().toISOString());
    
    try {
      const template = emailService.getAccountConfirmationTemplate(user.name);
      console.log('📧 Email template generated successfully');
      console.log('📋 Subject:', template.subject);
      
      const mailDoc = await admin.firestore().collection('mail').add({
        to: [user.email],
        message: {
          subject: template.subject,
          html: template.html,
          text: template.text,
        },
        type: 'account-confirmation',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      console.log('✅ Welcome email queued successfully. Mail ID:', mailDoc.id);
      console.log('📬 Email will be sent to:', user.email);
      
    } catch (error) {
      console.error('❌ ERROR in onUserCreated:', error);
      console.error('📧 Failed to queue welcome email for:', user.email);
    }
  });

// 2. Appointment Status Changed to Confirmed
export const onAppointmentConfirmed = functions.firestore
  .document('appointments/{appointmentId}')
  .onUpdate(async (change: any, context: any) => {
    const before = change.before.data();
    const after = change.after.data();
    const appointmentId = context.params.appointmentId;
    
    console.log('🔍 DEBUG: APPOINTMENT STATUS CHANGE TRIGGER');
    console.log('🆔 Appointment ID:', appointmentId);
    console.log('📊 Status Before:', before.status);
    console.log('📊 Status After:', after.status);
    console.log('🕒 Timestamp:', new Date().toISOString());
    
    if (before.status !== 'confirmed' && after.status === 'confirmed') {
      console.log('✅ Appointment confirmation detected');
      
      // Extract client details - handle different field name variations
      const clientName = after.clientName || after.name || after.userName || 'Client';
      const clientEmail = after.clientEmail || after.email || after.userEmail;
      const appointmentTime = after.time || after.timeslot;
      const appointmentType = after.type || after.servicePlan || 'consultation';
      
      console.log('👤 Client Name (resolved):', clientName);
      console.log('📧 Client Email (resolved):', clientEmail);
      console.log('📅 Date:', after.date);
      console.log('🕐 Time (resolved):', appointmentTime);
      console.log('📋 Type (resolved):', appointmentType);
      
      if (!clientEmail) {
        console.error('❌ No client email found in appointment data');
        console.error('📋 Available fields:', Object.keys(after));
        return;
      }
      
      try {
        const template = emailService.getAppointmentConfirmationTemplate(
          clientName,
          after.date,
          appointmentTime,
          appointmentType
        );
        console.log('📧 Confirmation template generated');
        console.log('📋 Subject:', template.subject);
        
        // Send email directly using Resend instead of queuing for Firebase extension
        const emailSent = await emailService.sendEmail({
          to: clientEmail,
          toName: clientName,
          subject: template.subject,
          html: template.html,
          text: template.text,
        });
        
        if (emailSent) {
          console.log('✅ Confirmation email sent successfully via Resend');
        } else {
          console.log('❌ Failed to send confirmation email via Resend');
        }
        console.log('📬 Email attempted to:', clientEmail);
        
      } catch (error) {
        console.error('❌ ERROR in onAppointmentConfirmed:', error);
        console.error('📧 Failed to queue confirmation email for:', after.clientEmail);
      }
    } else {
      console.log('ℹ️ Status change detected but not a confirmation');
    }
  });

// 3. New Appointment Created - Admin Notification
export const onAppointmentCreated = functions.firestore
  .document('appointments/{appointmentId}')
  .onCreate(async (snap: any, context: any) => {
    const appointmentData = snap.data();
    const appointmentId = context.params.appointmentId;
    
    console.log('🔍 DEBUG: NEW APPOINTMENT CREATED TRIGGER');
    console.log('🆔 Appointment ID:', appointmentId);
    console.log('📋 RAW APPOINTMENT DATA:', JSON.stringify(appointmentData, null, 2));
    
    // Extract client details - handle different field name variations
    const clientName = appointmentData.clientName || appointmentData.name || appointmentData.userName || 'Client';
    const clientEmail = appointmentData.clientEmail || appointmentData.email || appointmentData.userEmail;
    const appointmentTime = appointmentData.time || appointmentData.timeslot;
    
    console.log('👤 Client Name (resolved):', clientName);
    console.log('📧 Client Email (resolved):', clientEmail);
    console.log('📅 Date:', appointmentData.date);
    console.log('🕐 Time (resolved):', appointmentTime);
    console.log('📋 Type:', appointmentData.type || appointmentData.servicePlan);
    console.log('📊 Status:', appointmentData.status);
    console.log('👤 User ID:', appointmentData.userId);
    console.log('🕒 Timestamp:', new Date().toISOString());
    
    if (!clientEmail) {
      console.error('❌ No client email found in appointment data');
      console.error('📋 Available fields:', Object.keys(appointmentData));
      return;
    }
    
    try {
      // Create a normalized appointment object for the template
      const normalizedAppointment = {
        clientName: clientName || 'Client',
        clientEmail: clientEmail,
        type: appointmentData.type || appointmentData.servicePlan || 'consultation',
        date: appointmentData.date || 'Unknown Date',
        time: appointmentTime || 'Unknown Time'
      };
      
      const template = emailService.getAdminNewAppointmentTemplate(normalizedAppointment);
      console.log('📧 Admin notification template generated');
      console.log('📋 Subject:', template.subject);
      console.log('📬 Sending to admin: admin@veenutrition.com');
      
      // Send email directly using Resend instead of queuing for Firebase extension
      const emailSent = await emailService.sendEmail({
        to: 'admin@veenutrition.com',
        toName: 'Admin Team',
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
      
      if (emailSent) {
        console.log('✅ Admin notification sent successfully via Resend');
      } else {
        console.log('❌ Failed to send admin notification via Resend');
      }
      console.log('📬 Admin notification attempted for appointment from:', clientEmail);
      
    } catch (error) {
      console.error('❌ ERROR in onAppointmentCreated:', error);
      console.error('📧 Failed to queue admin notification for appointment:', appointmentId);
    }
  });

// 4. Client Reschedule Request Trigger
export const onClientRescheduleRequest = functions.firestore
  .document('appointments/{appointmentId}')
  .onUpdate(async (change: any, context: any) => {
    const before = change.before.data();
    const after = change.after.data();
    const appointmentId = context.params.appointmentId;
    
    console.log('🔍 DEBUG: CLIENT RESCHEDULE REQUEST TRIGGER');
    console.log('🆔 Appointment ID:', appointmentId);
    console.log('📊 Status Before:', before.status);
    console.log('📊 Status After:', after.status);
    console.log('🕒 Timestamp:', new Date().toISOString());
    
    if (before.status !== 'clientRescheduleRequested' && after.status === 'clientRescheduleRequested') {
      console.log('✅ Client reschedule request detected');
      
      const clientName = after.clientName || after.name || after.userName || 'Client';
      const clientEmail = after.clientEmail || after.email || after.userEmail;
      const appointmentTime = after.time || after.timeslot;
      const rescheduleReason = after.rescheduleReason || 'Client requested schedule change';
      
      console.log('👤 Client Name (resolved):', clientName);
      console.log('📧 Client Email (resolved):', clientEmail);
      console.log('📅 Date:', after.date);
      console.log('🕐 Time (resolved):', appointmentTime);
      console.log('📝 Reschedule Reason:', rescheduleReason);
      
      if (!clientEmail) {
        console.error('❌ No client email found in client reschedule request');
        console.error('📋 Available fields:', Object.keys(after));
        return;
      }
      
      try {
        // Check if this is a late reschedule
        const isLateReschedule = after.lateReschedule || false;
        const potentialLateFee = after.potentialLateFee || 0;
        
        // Send admin notification about client reschedule request
        const adminTemplate = emailService.getRescheduleRequestTemplate(
          clientName,
          clientEmail,
          after.date,
          appointmentTime,
          rescheduleReason,
          isLateReschedule,
          potentialLateFee
        );
        console.log('📧 Admin reschedule notification template generated');
        
        const adminEmailSent = await emailService.sendEmail({
          to: 'admin@veenutrition.com',
          toName: 'Vee Nutrition Admin',
          subject: adminTemplate.subject,
          html: adminTemplate.html,
          text: adminTemplate.text
        });
        
        if (adminEmailSent) {
          console.log('✅ Admin reschedule notification sent');
        } else {
          console.error('❌ Failed to send admin reschedule notification');
        }
        
      } catch (error) {
        console.error('❌ ERROR in onClientRescheduleRequest:', error);
        console.error('📧 Failed to process client reschedule request emails for:', clientEmail);
      }
    }
  });

// 5. Vee Reschedule Request Trigger  
export const onVeeRescheduleRequest = functions.firestore
  .document('appointments/{appointmentId}')
  .onUpdate(async (change: any, context: any) => {
    const before = change.before.data();
    const after = change.after.data();
    const appointmentId = context.params.appointmentId;
    
    console.log('🔍 DEBUG: VEE RESCHEDULE REQUEST TRIGGER');
    console.log('🆔 Appointment ID:', appointmentId);
    console.log('📊 Status Before:', before.status);
    console.log('📊 Status After:', after.status);
    console.log('🕒 Timestamp:', new Date().toISOString());
    
    if (before.status !== 'veeRescheduleRequest' && after.status === 'veeRescheduleRequest') {
      console.log('✅ Vee reschedule request detected');
      
      const clientName = after.clientName || after.name || after.userName || 'Client';
      const clientEmail = after.clientEmail || after.email || after.userEmail;
      const appointmentTime = after.time || after.timeslot;
      const rescheduleReason = after.rescheduleReason || 'Schedule adjustment requested by Vee Nutrition';
      
      console.log('👤 Client Name (resolved):', clientName);
      console.log('📧 Client Email (resolved):', clientEmail);
      console.log('📅 Date:', after.date);
      console.log('🕐 Time (resolved):', appointmentTime);
      console.log('📝 Reschedule Reason:', rescheduleReason);
      
      if (!clientEmail) {
        console.error('❌ No client email found in Vee reschedule request');
        console.error('📋 Available fields:', Object.keys(after));
        return;
      }
      
      try {
        // Send client notification about Vee reschedule request
        const clientTemplate = emailService.getVeeRescheduleRequestTemplate(
          clientName,
          after.date,
          appointmentTime,
          rescheduleReason
        );
        console.log('📧 Client Vee reschedule notification template generated');
        
        const clientEmailSent = await emailService.sendEmail({
          to: clientEmail,
          toName: clientName,
          subject: clientTemplate.subject,
          html: clientTemplate.html,
          text: clientTemplate.text
        });
        
        if (clientEmailSent) {
          console.log('✅ Vee reschedule notification sent to client:', clientEmail);
        } else {
          console.error('❌ Failed to send Vee reschedule notification to client');
        }
        
      } catch (error) {
        console.error('❌ ERROR in onVeeRescheduleRequest:', error);
        console.error('📧 Failed to process Vee reschedule request emails for:', clientEmail);
      }
    }
  });

// 6. Confirm Reschedule Request Trigger
export const onConfirmRescheduleRequest = functions.firestore
  .document('appointments/{appointmentId}')
  .onUpdate(async (change: any, context: any) => {
    const before = change.before.data();
    const after = change.after.data();
    const appointmentId = context.params.appointmentId;
    
    console.log('🔍 DEBUG: CONFIRM RESCHEDULE REQUEST TRIGGER');
    console.log('🆔 Appointment ID:', appointmentId);
    console.log('📊 Status Before:', before.status);
    console.log('📊 Status After:', after.status);
    console.log('🕒 Timestamp:', new Date().toISOString());
    
    if (before.status !== 'confirmRescheduleRequest' && after.status === 'confirmRescheduleRequest') {
      console.log('✅ Confirm reschedule request detected');
      
      const clientName = after.clientName || after.name || after.userName || 'Client';
      const clientEmail = after.clientEmail || after.email || after.userEmail;
      const appointmentTime = after.time || after.timeslot;
      
      console.log('👤 Client Name (resolved):', clientName);
      console.log('📧 Client Email (resolved):', clientEmail);
      console.log('📅 Date:', after.date);
      console.log('🕐 Time (resolved):', appointmentTime);
      
      if (!clientEmail) {
        console.error('❌ No client email found in confirm reschedule request');
        console.error('📋 Available fields:', Object.keys(after));
        return;
      }
      
      try {
        // Send reschedule confirmation to client
        const clientTemplate = emailService.getRescheduleConfirmationTemplate(
          clientName,
          after.date,
          appointmentTime,
          after.type || 'consultation'
        );
        console.log('📧 Client reschedule confirmation template generated');
        
        const clientEmailSent = await emailService.sendEmail({
          to: clientEmail,
          toName: clientName,
          subject: clientTemplate.subject,
          html: clientTemplate.html,
          text: clientTemplate.text
        });
        
        if (clientEmailSent) {
          console.log('✅ Reschedule confirmation sent to client:', clientEmail);
        } else {
          console.error('❌ Failed to send reschedule confirmation to client');
        }
        
      } catch (error) {
        console.error('❌ ERROR in onConfirmRescheduleRequest:', error);
        console.error('📧 Failed to process confirm reschedule emails for:', clientEmail);
      }
    }
  });

// 5. Appointment Cancelled Trigger
export const onAppointmentCancelled = functions.firestore
  .document('appointments/{appointmentId}')
  .onUpdate(async (change: any, context: any) => {
    const before = change.before.data();
    const after = change.after.data();
    const appointmentId = context.params.appointmentId;
    
    console.log('🔍 DEBUG: APPOINTMENT CANCELLED TRIGGER');
    console.log('🆔 Appointment ID:', appointmentId);
    console.log('📊 Status Before:', before.status);
    console.log('📊 Status After:', after.status);
    console.log('🕒 Timestamp:', new Date().toISOString());
    
    if (before.status !== 'cancelled' && after.status === 'cancelled') {
      console.log('✅ Appointment cancellation detected');
      
      const clientName = after.clientName || after.name || after.userName || 'Client';
      const clientEmail = after.clientEmail || after.email || after.userEmail;
      const appointmentTime = after.time || after.timeslot;
      const cancelReason = after.cancelReason || 'Administrative cancellation';
      
      console.log('👤 Client Name (resolved):', clientName);
      console.log('📧 Client Email (resolved):', clientEmail);
      console.log('📅 Date:', after.date);
      console.log('🕐 Time (resolved):', appointmentTime);
      console.log('📝 Cancel Reason:', cancelReason);
      
      if (!clientEmail) {
        console.error('❌ No client email found in cancelled appointment');
        console.error('📋 Available fields:', Object.keys(after));
        return;
      }
      
      try {
        const template = emailService.getAppointmentCancelledTemplate(
          clientName,
          after.date,
          appointmentTime,
          cancelReason
        );
        console.log('📧 Cancellation template generated');
        
        const emailSent = await emailService.sendEmail({
          to: clientEmail,
          toName: clientName,
          subject: template.subject,
          html: template.html,
          text: template.text
        });
        
        if (emailSent) {
          console.log('✅ Cancellation email sent to client:', clientEmail);
        } else {
          console.error('❌ Failed to send cancellation email to client');
        }
        
      } catch (error) {
        console.error('❌ ERROR in onAppointmentCancelled:', error);
        console.error('📧 Failed to send cancellation email for:', clientEmail);
      }
    }
  });

// 6. No-Show Penalty Trigger
export const onAppointmentNoShow = functions.firestore
  .document('appointments/{appointmentId}')
  .onUpdate(async (change: any, context: any) => {
    const before = change.before.data();
    const after = change.after.data();
    const appointmentId = context.params.appointmentId;
    
    console.log('🔍 DEBUG: NO-SHOW PENALTY TRIGGER');
    console.log('🆔 Appointment ID:', appointmentId);
    console.log('📊 Status Before:', before.status);
    console.log('📊 Status After:', after.status);
    console.log('🕒 Timestamp:', new Date().toISOString());
    
    if (before.status !== 'no-show' && after.status === 'no-show') {
      console.log('✅ No-show penalty detected');
      
      const clientName = after.clientName || after.name || after.userName || 'Client';
      const clientEmail = after.clientEmail || after.email || after.userEmail;
      const appointmentTime = after.time || after.timeslot;
      const penaltyAmount = after.penaltyAmount || 25;
      
      console.log('👤 Client Name (resolved):', clientName);
      console.log('📧 Client Email (resolved):', clientEmail);
      console.log('📅 Date:', after.date);
      console.log('🕐 Time (resolved):', appointmentTime);
      console.log('💰 Penalty Amount:', penaltyAmount);
      
      if (!clientEmail) {
        console.error('❌ No client email found in no-show appointment');
        console.error('📋 Available fields:', Object.keys(after));
        return;
      }
      
      try {
        const template = emailService.getNoShowPenaltyTemplate(
          clientName,
          after.date,
          appointmentTime,
          penaltyAmount
        );
        console.log('📧 No-show penalty template generated');
        
        const emailSent = await emailService.sendEmail({
          to: clientEmail,
          toName: clientName,
          subject: template.subject,
          html: template.html,
          text: template.text
        });
        
        if (emailSent) {
          console.log('✅ No-show penalty email sent to client:', clientEmail);
        } else {
          console.error('❌ Failed to send no-show penalty email to client');
        }
        
      } catch (error) {
        console.error('❌ ERROR in onAppointmentNoShow:', error);
        console.error('📧 Failed to send no-show penalty email for:', clientEmail);
      }
    }
  });

// 7. Late Reschedule Fee Trigger
export const onLateReschedule = functions.firestore
  .document('appointments/{appointmentId}')
  .onUpdate(async (change: any, context: any) => {
    const before = change.before.data();
    const after = change.after.data();
    const appointmentId = context.params.appointmentId;
    
    console.log('🔍 DEBUG: LATE RESCHEDULE TRIGGER');
    console.log('🆔 Appointment ID:', appointmentId);
    console.log('📊 Late Reschedule Before:', before.lateReschedule);
    console.log('📊 Late Reschedule After:', after.lateReschedule);
    console.log('🕒 Timestamp:', new Date().toISOString());
    
    if (!before.lateReschedule && after.lateReschedule) {
      console.log('✅ Late reschedule fee detected');
      
      const clientName = after.clientName || after.name || after.userName || 'Client';
      const clientEmail = after.clientEmail || after.email || after.userEmail;
      const appointmentTime = after.time || after.timeslot;
      
      console.log('👤 Client Name (resolved):', clientName);
      console.log('📧 Client Email (resolved):', clientEmail);
      console.log('📅 Date:', after.date);
      console.log('🕐 Time (resolved):', appointmentTime);
      
      if (!clientEmail) {
        console.error('❌ No client email found in late reschedule');
        console.error('📋 Available fields:', Object.keys(after));
        return;
      }
      
      try {
        const template = emailService.getLateRescheduleTemplate(
          clientName,
          after.date,
          appointmentTime
        );
        console.log('📧 Late reschedule template generated');
        
        const emailSent = await emailService.sendEmail({
          to: clientEmail,
          toName: clientName,
          subject: template.subject,
          html: template.html,
          text: template.text
        });
        
        if (emailSent) {
          console.log('✅ Late reschedule email sent to client:', clientEmail);
        } else {
          console.error('❌ Failed to send late reschedule email to client');
        }
        
      } catch (error) {
        console.error('❌ ERROR in onLateReschedule:', error);
        console.error('📧 Failed to send late reschedule email for:', clientEmail);
      }
    }
  });

// 4. Enhanced Mail Queue Processor
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
        case 'welcome':
          template = emailService.getAccountConfirmationTemplate(
            mailData.data?.name || mailData.toName || 'Client'
          );
          break;
        case 'payment-reminder':
          template = emailService.getPaymentReminderTemplate(
            mailData.data?.name || mailData.toName || 'Client',
            mailData.data?.amount || 0,
            mailData.data?.invoiceNumber || 'Unknown',
            mailData.data?.paymentUrl || '#'
          );
          break;
        case 'reschedule-confirmation':
          template = emailService.getRescheduleConfirmationTemplate(
            mailData.data.name,
            mailData.data.newDate,
            mailData.data.newTime,
            mailData.data.type || 'Consultation'
          );
          break;
        case 'no-show-penalty':
          template = emailService.getNoShowPenaltyTemplate(
            mailData.data.name,
            mailData.data.date,
            mailData.data.time,
            mailData.data.penaltyAmount
          );
          break;
        case 'appointment-confirmation':
          template = emailService.getAppointmentConfirmationTemplate(
            mailData.data.name,
            mailData.data.date,
            mailData.data.time,
            mailData.data.type || 'Consultation'
          );
          break;
        case 'appointment-reminder':
          template = emailService.getAppointmentReminderTemplate(
            mailData.data.name,
            mailData.data.date,
            mailData.data.time,
            mailData.data.type || 'Consultation'
          );
          break;
        case 'reschedule-request':
          template = emailService.getRescheduleRequestTemplate(
            mailData.data.name,
            mailData.data.email || mailData.to,
            mailData.data.originalDate,
            mailData.data.originalTime,
            mailData.data.reason
          );
          break;
        case 'appointment-cancelled':
          template = emailService.getAppointmentCancelledTemplate(
            mailData.data.name,
            mailData.data.date,
            mailData.data.time,
            mailData.data.reason
          );
          break;
        case 'late-reschedule':
          template = emailService.getLateRescheduleTemplate(
            mailData.data.name,
            mailData.data.date,
            mailData.data.time
          );
          break;
        case 'invoice-generated':
          template = emailService.getInvoiceGeneratedTemplate(
            mailData.data.name,
            mailData.data.amount,
            mailData.data.invoiceId
          );
          break;
        case 'admin-new-appointment':
          template = emailService.getAdminNewAppointmentTemplate({
            clientName: mailData.data.clientName,
            clientEmail: mailData.data.clientEmail,
            type: mailData.data.appointmentType,
            date: mailData.data.date,
            time: mailData.data.time
          });
          break;
        case 'admin-health-update':
          template = emailService.getAdminHealthUpdateTemplate(
            mailData.data.clientName,
            mailData.data.clientEmail,
            mailData.data.updateType
          );
          break;
        case 'admin-payment-received':
          template = emailService.getAdminPaymentReceivedTemplate(
            mailData.data.clientName,
            mailData.data.amount,
            mailData.data.invoiceId,
            mailData.data.paymentMethod
          );
          break;
        case 'admin-plan-upgrade':
          template = emailService.getAdminPlanUpgradeTemplate(
            mailData.data.clientName,
            mailData.data.planType,
            mailData.data.previousPlan
          );
          break;
        case 'admin-client-message':
          template = emailService.getAdminClientMessageTemplate(
            mailData.data.clientName,
            mailData.data.clientEmail,
            mailData.data.messageType,
            mailData.data.urgency
          );
          break;
        case 'admin-reschedule-request':
          template = emailService.getRescheduleRequestTemplate(
            mailData.data.clientName,
            mailData.data.clientEmail,
            mailData.data.originalDate,
            mailData.data.originalTime,
            mailData.data.reason
          );
          break;
        default:
          // Use existing data if template type not found
          template = {
            subject: mailData.subject || 'Notification from Vee Nutrition',
            html: mailData.html || '',
            text: mailData.text || ''
          };
      }
      
      const success = await emailService.sendEmail({
        to: mailData.to,
        toName: mailData.toName || 'Client',
        subject: template.subject,
        html: template.html,
        text: template.text
      });
      
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
        error: error?.message || 'Unknown error',
        failedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  });

// 5. Daily Monthly Billing Processor
export const processMonthlyBilling = functions.pubsub
  .schedule('0 9 * * *') // 9 AM daily
  .timeZone('Europe/Amsterdam')
  .onRun(async (context: any) => {
    console.log('🔄 Running daily monthly billing processor...');
    
    try {
      // Get all users with Complete Program service plan
      const usersSnapshot = await admin.firestore()
        .collection('users')
        .where('servicePlan', '==', 'complete-program')
        .where('subscriptionStatus', '==', 'active')
        .get();

      const processedUsers = [];
      const now = new Date();

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        const userId = userDoc.id;
        
        try {
          const nextBillingDate = userData.nextBillingDate?.toDate();
          const currentCycle = userData.currentBillingCycle || 0;
          const maxCycles = userData.maxBillingCycles || 3;
          const plannedDowngrade = userData.plannedDowngrade;

          // Skip if user has planned downgrade or billing cycle is complete
          if (plannedDowngrade || currentCycle >= maxCycles || !nextBillingDate) {
            continue;
          }

          // Check if it's time to generate next month's invoice
          if (nextBillingDate <= now) {
            console.log(`📅 Processing billing for ${userData.name} (${userData.email})`);
            
            // Check if invoice already exists for this billing cycle
            const existingInvoices = await admin.firestore()
              .collection('invoices')
              .where('userId', '==', userId)
              .where('invoiceType', '==', 'subscription')
              .where('billingCycle', '==', currentCycle + 1)
              .get();

            if (existingInvoices.empty) {
              // Generate next month's invoice directly
              const nextCycle = currentCycle + 1;
              const billingDate = new Date(nextBillingDate);
              
              // Create subscription invoice
              const invoiceData = {
                userId,
                clientName: userData.name,
                clientEmail: userData.email,
                month: billingDate.getMonth() + 1,
                year: billingDate.getFullYear(),
                subscriptionAmount: userData.monthlyAmount || 150,
                billingCycle: nextCycle
              };

              // Add invoice to Firestore
              await admin.firestore().collection('invoices').add({
                ...invoiceData,
                invoiceType: 'subscription',
                status: 'unpaid',
                totalAmount: invoiceData.subscriptionAmount,
                subscriptionMonth: invoiceData.month,
                subscriptionYear: invoiceData.year,
                dueDate: billingDate,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                items: [{
                  description: `Complete Program - Month ${nextCycle} of 3`,
                  amount: invoiceData.subscriptionAmount,
                  type: 'subscription'
                }]
              });

              // Update user's billing cycle and next billing date
              const followingMonth = new Date(billingDate.getFullYear(), billingDate.getMonth() + 1, billingDate.getDate());
              await admin.firestore().collection('users').doc(userId).update({
                currentBillingCycle: nextCycle,
                nextBillingDate: followingMonth,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
              });

              processedUsers.push({
                userId,
                email: userData.email,
                name: userData.name,
                billingCycle: currentCycle + 1,
                status: 'invoice_generated'
              });
              
              console.log(`✅ Invoice generated for ${userData.name} - Cycle ${currentCycle + 1}`);
            } else {
              console.log(`⏭️ Invoice already exists for ${userData.name} - Cycle ${currentCycle + 1}`);
            }
          }
        } catch (error) {
          console.error(`❌ Error processing user ${userId}:`, error);
          processedUsers.push({
            userId,
            email: userData.email,
            name: userData.name,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Log summary
      console.log(`📊 Monthly billing processing complete:`, {
        totalUsers: usersSnapshot.docs.length,
        processedUsers: processedUsers.length,
        successful: processedUsers.filter(u => u.status === 'invoice_generated').length,
        errors: processedUsers.filter(u => u.status === 'error').length
      });

      return { success: true, processedUsers };
    } catch (error) {
      console.error('❌ Error in monthly billing processor:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

// 6. Invoice Created - Email Notification
export const onInvoiceCreated = functions.firestore
  .document('invoices/{invoiceId}')
  .onCreate(async (snap: any, context: any) => {
    const invoiceData = snap.data();
    const invoiceId = context.params.invoiceId;
    
    console.log('🔍 DEBUG: NEW INVOICE CREATED TRIGGER');
    console.log('🆔 Invoice ID:', invoiceId);
    console.log('📄 Invoice Number:', invoiceData.invoiceNumber);
    console.log('📧 Client Email:', invoiceData.clientEmail);
    console.log('👤 Client Name:', invoiceData.clientName);
    console.log('💰 Amount:', invoiceData.totalAmount || invoiceData.amount);
    console.log('💱 Currency:', invoiceData.currency || 'EUR');
    console.log('📋 Invoice Type:', invoiceData.invoiceType);
    console.log('📊 Status:', invoiceData.status);
    console.log('📅 Due Date:', invoiceData.dueDate);
    console.log('🕒 Timestamp:', new Date().toISOString());
    
    // Send emails for all invoice types (session, subscription, and custom invoices)
    if (invoiceData.invoiceType === 'subscription' || invoiceData.invoiceType === 'invoice' || invoiceData.invoiceType === 'session') {
      console.log('✅ Invoice type qualifies for email notification');
      
      try {
        const template = emailService.getInvoiceGeneratedTemplate(
          invoiceData.clientName || 'Client',
          invoiceData.totalAmount || invoiceData.amount || 0,
          snap.id
        );
        console.log('📧 Invoice notification template generated');
        console.log('📋 Subject:', template.subject);
        
        // Send email directly using Resend instead of queuing for Firebase extension
        const emailSent = await emailService.sendEmail({
          to: invoiceData.clientEmail,
          toName: invoiceData.clientName || 'Client',
          subject: template.subject,
          html: template.html,
          text: template.text,
        });
        
        if (emailSent) {
          console.log('✅ Invoice email sent successfully via Resend');
        } else {
          console.log('❌ Failed to send invoice email via Resend');
        }
        console.log('📬 Email attempted to:', invoiceData.clientEmail);
        
      } catch (error) {
        console.error('❌ ERROR in onInvoiceCreated:', error);
        console.error('📧 Failed to queue invoice email for:', invoiceData.clientEmail);
      }
    } else {
      console.log('ℹ️ Invoice type does not qualify for email notification:', invoiceData.invoiceType);
    }
  });

// 7. Daily Reminder Scheduler
export const sendDailyReminders = functions.pubsub
  .schedule('0 18 * * *') // 6 PM daily
  .timeZone('Europe/Amsterdam')
  .onRun(async (context: any) => {
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
      
      // Send email directly using Resend
      return emailService.sendAppointmentReminder(
        appointment.clientEmail || appointment.email,
        appointment.clientName || appointment.name || 'Client',
        appointment.date,
        appointment.time,
        appointment.type
      );
    });
    
    await Promise.all(promises);
    console.log(`Queued ${promises.length} reminder emails`);
  });

// 6. Scheduled Downgrade Processor
export const processScheduledDowngrades = functions.pubsub
  .schedule('0 2 * * *') // 2 AM daily
  .timeZone('Europe/Amsterdam')
  .onRun(async (context: any) => {
    console.log('🔄 Processing scheduled downgrades...');
    
    try {
      // Get all users with planned downgrades
      const usersWithDowngrades = await admin.firestore()
        .collection('users')
        .where('plannedDowngrade', '==', true)
        .get();
      
      const processedDowngrades = [];
      const now = new Date();
      
      for (const userDoc of usersWithDowngrades.docs) {
        const userData = userDoc.data();
        const downgradeEffectiveDate = userData.downgradeEffectiveDate?.toDate();
        
        if (downgradeEffectiveDate && downgradeEffectiveDate <= now) {
          console.log(`⏰ Processing downgrade for user ${userDoc.id}, effective date: ${downgradeEffectiveDate}`);
          
          try {
            // Execute downgrade - update user to Pay-as-you-go
            await userDoc.ref.update({
              servicePlan: 'pay-as-you-go',
              subscriptionStatus: 'downgraded',
              plannedDowngrade: false,
              downgradeExecutedAt: admin.firestore.FieldValue.serverTimestamp(),
              // Clear Complete Program related fields
              programStartDate: null,
              programEndDate: null,
              currentBillingCycle: null,
              nextBillingDate: null,
              maxBillingCycles: null,
              monthlyAmount: null,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            processedDowngrades.push({
              userId: userDoc.id,
              email: userData.email,
              effectiveDate: downgradeEffectiveDate,
              status: 'success'
            });
            
            console.log(`✓ User ${userDoc.id} successfully downgraded to Pay-as-you-go`);
            
            // Optionally send notification email about successful downgrade
            const emailTemplate = {
              subject: 'Service Plan Updated - Now Pay-As-You-Go',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h2>Service Plan Updated</h2>
                  <p>Hi ${userData.name || 'there'},</p>
                  <p>Your service plan has been successfully updated to Pay-As-You-Go as scheduled.</p>
                  <p>You can continue booking individual sessions through your dashboard.</p>
                  <p>Thank you for choosing Vee Nutrition!</p>
                </div>
              `,
              text: `Your service plan has been updated to Pay-As-You-Go. Continue booking sessions through your dashboard.`
            };
            
            await admin.firestore().collection('mail').add({
              to: userData.email,
              toName: userData.name || 'Client',
              subject: emailTemplate.subject,
              html: emailTemplate.html,
              text: emailTemplate.text,
              type: 'plan-downgrade-notification',
              status: 'pending',
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            
          } catch (error) {
            console.error(`Error processing downgrade for user ${userDoc.id}:`, error);
            processedDowngrades.push({
              userId: userDoc.id,
              email: userData.email,
              effectiveDate: downgradeEffectiveDate,
              status: 'error',
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }
      }
      
      console.log(`✓ Processed ${processedDowngrades.length} scheduled downgrades`);
      
      // Log summary for monitoring
      if (processedDowngrades.length > 0) {
        console.log('Downgrade processing summary:', processedDowngrades);
      }
      
    } catch (error) {
      console.error('Error in scheduled downgrade processor:', error);
    }
  });