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
    const RESEND_API_KEY = functions.config().resend?.apikey;
    
    if (!RESEND_API_KEY) {
      console.error('Resend API key not configured');
      return false;
    }

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
          console.log('Resend response:', res.statusCode, responseData);
          
          if (res.statusCode === 200 || res.statusCode === 201) {
            console.log(`Email sent successfully to: ${params.to}`);
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
                Pay Invoice Now
              </a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
              <p>Vee Nutrition | Professional Nutrition Services</p>
              <p>Thank you for choosing us for your nutrition journey!</p>
            </div>
          </div>
        </div>
      `,
      text: `Session complete! Your invoice (${invoiceId}) for €${amount} is ready for payment. Visit your dashboard to pay online.`
    };
  }

  getLateRescheduleTemplate(name: string, date: string, time: string): EmailTemplate {
    return {
      subject: 'Late Reschedule Fee Applied - Vee Nutrition',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8faf8;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #A5CBA4; margin: 0;">🌿 Vee Nutrition</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">⚠️ Late Reschedule Notice</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Hi ${name}, your reschedule request for ${date} at ${time} was within our 4 working hour policy window.
            </p>
            
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h3 style="color: #856404; margin-top: 0;">Late Reschedule Fee</h3>
              <p style="margin: 5px 0; color: #856404;"><strong>Fee Applied:</strong> €5</p>
              <p style="margin: 5px 0; color: #856404;"><strong>Reason:</strong> Reschedule within 4 working hours</p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin: 20px 0;">
              This fee helps us manage our scheduling efficiently. We understand emergencies happen - for future appointments, please provide more notice when possible.
            </p>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
              <p>Vee Nutrition | Professional Scheduling Policy</p>
              <p>Working Hours: Mon-Fri 9am-10pm, Sat 9am-12pm</p>
            </div>
          </div>
        </div>
      `,
      text: `Late reschedule notice: A €5 fee has been applied for rescheduling your ${date} ${time} appointment within 4 working hours.`
    };
  }

  getNoShowTemplate(name: string, date: string, time: string, penaltyAmount: number): EmailTemplate {
    return {
      subject: 'Missed Appointment - No-Show Fee Applied - Vee Nutrition',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8faf8;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #A5CBA4; margin: 0;">🌿 Vee Nutrition</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">❌ Missed Appointment Notice</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Hi ${name}, we missed you at your appointment on ${date} at ${time}.
            </p>
            
            <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
              <h3 style="color: #721c24; margin-top: 0;">No-Show Penalty</h3>
              <p style="margin: 5px 0; color: #721c24;"><strong>Fee Applied:</strong> €${penaltyAmount}</p>
              <p style="margin: 5px 0; color: #721c24;"><strong>Rate:</strong> 50% of original appointment cost</p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin: 20px 0;">
              We understand that unexpected situations arise. To avoid future no-show fees, please cancel or reschedule at least 4 working hours in advance.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://your-domain.replit.app/book" style="background-color: #A5CBA4; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Book New Appointment
              </a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
              <p>Vee Nutrition | We're Here When You're Ready</p>
              <p>Let's get back on track with your nutrition journey</p>
            </div>
          </div>
        </div>
      `,
      text: `Missed appointment notice: A €${penaltyAmount} no-show fee (50% of appointment cost) has been applied for your missed ${date} ${time} appointment.`
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
              Hi ${name}, we need to cancel your upcoming appointment scheduled for ${date} at ${time}.
            </p>
            
            ${reason ? `
            <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
              <h3 style="color: #721c24; margin-top: 0;">Cancellation Reason</h3>
              <p style="margin: 0; color: #721c24;">${reason}</p>
            </div>
            ` : ''}
            
            <p style="color: #666; line-height: 1.6; margin: 20px 0;">
              We sincerely apologize for any inconvenience. Please reschedule at your earliest convenience so we can continue supporting your nutrition journey.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://your-domain.replit.app/book" style="background-color: #A5CBA4; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Reschedule Appointment
              </a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
              <p>Vee Nutrition | Your Health, Our Priority</p>
              <p>We're here when you're ready to continue</p>
            </div>
          </div>
        </div>
      `,
      text: `Appointment cancelled: Your ${date} ${time} appointment has been cancelled. ${reason ? `Reason: ${reason}` : ''} Please reschedule at your convenience.`
    };
  }

  // Admin notification email templates
  getAdminNewAppointmentTemplate(appointment: any): EmailTemplate {
    return {
      subject: `New Appointment Request - ${appointment.clientName || appointment.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8faf8;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #A5CBA4; margin: 0;">🌿 Vee Nutrition Admin</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">📅 New Appointment Request</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              A new appointment has been requested and needs your confirmation.
            </p>
            
            <div style="background-color: #A5CBA4; color: white; padding: 25px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; font-size: 18px;">Client Details</h3>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Name:</strong> ${appointment.clientName || appointment.name}</p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Email:</strong> ${appointment.clientEmail || appointment.email}</p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Type:</strong> ${appointment.appointmentType || appointment.type}</p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Date:</strong> ${appointment.date}</p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Time:</strong> ${appointment.time}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://your-domain.replit.app/admin/appointments" style="background-color: #A5CBA4; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Review & Confirm
              </a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
              <p>Vee Nutrition Admin Panel</p>
              <p>Client awaiting confirmation</p>
            </div>
          </div>
        </div>
      `,
      text: `New appointment request from ${appointment.clientName || appointment.name} for ${appointment.appointmentType || appointment.type} on ${appointment.date} at ${appointment.time}.`
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
              A client has updated their health information and it may require your review.
            </p>
            
            <div style="background-color: #f0f8f0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #A5CBA4;">
              <h3 style="color: #A5CBA4; margin-top: 0;">Update Details</h3>
              <p style="margin: 5px 0; color: #666;"><strong>Client:</strong> ${clientName}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Email:</strong> ${clientEmail}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Update Type:</strong> ${updateType}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://your-domain.replit.app/admin/users" style="background-color: #A5CBA4; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Review Update
              </a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
              <p>Vee Nutrition Admin Panel</p>
              <p>Health information updated</p>
            </div>
          </div>
        </div>
      `,
      text: `${clientName} (${clientEmail}) has updated their health information: ${updateType}. Please review the changes.`
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
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              A payment has been successfully processed for one of your clients.
            </p>
            
            <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="color: #155724; margin-top: 0;">Payment Details</h3>
              <p style="margin: 5px 0; color: #155724;"><strong>Client:</strong> ${clientName}</p>
              <p style="margin: 5px 0; color: #155724;"><strong>Amount:</strong> €${amount}</p>
              <p style="margin: 5px 0; color: #155724;"><strong>Invoice:</strong> ${invoiceId}</p>
              <p style="margin: 5px 0; color: #155724;"><strong>Method:</strong> ${paymentMethod}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://your-domain.replit.app/admin/invoices" style="background-color: #A5CBA4; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                View Invoice Details
              </a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
              <p>Vee Nutrition Admin Panel</p>
              <p>Payment successfully processed</p>
            </div>
          </div>
        </div>
      `,
      text: `Payment received: ${clientName} paid €${amount} for invoice ${invoiceId} via ${paymentMethod}.`
    };
  }

  getAdminPlanUpgradeTemplate(clientName: string, planType: string, previousPlan: string): EmailTemplate {
    return {
      subject: `Plan Upgrade - ${clientName} upgraded to ${planType}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8faf8;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #A5CBA4; margin: 0;">🌿 Vee Nutrition Admin</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">⬆️ Service Plan Upgrade</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Great news! A client has upgraded their service plan.
            </p>
            
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h3 style="color: #856404; margin-top: 0;">Upgrade Details</h3>
              <p style="margin: 5px 0; color: #856404;"><strong>Client:</strong> ${clientName}</p>
              <p style="margin: 5px 0; color: #856404;"><strong>Previous Plan:</strong> ${previousPlan}</p>
              <p style="margin: 5px 0; color: #856404;"><strong>New Plan:</strong> ${planType}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://your-domain.replit.app/admin/users" style="background-color: #A5CBA4; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                View Client Details
              </a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
              <p>Vee Nutrition Admin Panel</p>
              <p>Client successfully upgraded</p>
            </div>
          </div>
        </div>
      `,
      text: `Plan upgrade: ${clientName} upgraded from ${previousPlan} to ${planType}.`
    };
  }

  getAdminClientMessageTemplate(clientName: string, clientEmail: string, messageType: string, urgency: string): EmailTemplate {
    return {
      subject: `Client Message - ${clientName} (${urgency} Priority)`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8faf8;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #A5CBA4; margin: 0;">🌿 Vee Nutrition Admin</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">💬 New Client Message</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              You have received a new message from a client that requires your attention.
            </p>
            
            <div style="background-color: ${urgency === 'High' ? '#f8d7da' : urgency === 'Medium' ? '#fff3cd' : '#d1ecf1'}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${urgency === 'High' ? '#dc3545' : urgency === 'Medium' ? '#ffc107' : '#17a2b8'};">
              <h3 style="color: ${urgency === 'High' ? '#721c24' : urgency === 'Medium' ? '#856404' : '#0c5460'}; margin-top: 0;">Message Details</h3>
              <p style="margin: 5px 0; color: ${urgency === 'High' ? '#721c24' : urgency === 'Medium' ? '#856404' : '#0c5460'};"><strong>Client:</strong> ${clientName}</p>
              <p style="margin: 5px 0; color: ${urgency === 'High' ? '#721c24' : urgency === 'Medium' ? '#856404' : '#0c5460'};"><strong>Email:</strong> ${clientEmail}</p>
              <p style="margin: 5px 0; color: ${urgency === 'High' ? '#721c24' : urgency === 'Medium' ? '#856404' : '#0c5460'};"><strong>Type:</strong> ${messageType}</p>
              <p style="margin: 5px 0; color: ${urgency === 'High' ? '#721c24' : urgency === 'Medium' ? '#856404' : '#0c5460'};"><strong>Priority:</strong> ${urgency}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://your-domain.replit.app/admin/messages" style="background-color: #A5CBA4; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                View Message
              </a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
              <p>Vee Nutrition Admin Panel</p>
              <p>Client awaiting response</p>
            </div>
          </div>
        </div>
      `,
      text: `New ${urgency.toLowerCase()} priority message from ${clientName} (${clientEmail}) - Type: ${messageType}. Please respond promptly.`
    };
  }
}

const emailService = new ResendEmailService();

// 1. New User Account Created
export const onUserCreated = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap: any, context: any) => {
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
  .onUpdate(async (change: any, context: any) => {
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

// 4. Process Mail Queue - Updated for admin email support
export const processMailQueue = functions.firestore
  .document('mail/{mailId}')
  .onCreate(async (snap: any, context: any) => {
    const mailData = snap.data();
    
    if (mailData.status !== 'pending') {
      return;
    }
    
    console.log('Processing email from queue:', mailData.to, 'Type:', mailData.type, 'Updated trigger');
    
    try {
      let template;
      
      switch (mailData.type) {
        case 'payment-reminder':
          template = emailService.getPaymentReminderTemplate(
            mailData.toName,
            mailData.amount,
            mailData.invoiceNumber,
            mailData.paymentUrl
          );
          break;
        case 'account-confirmation':
          template = emailService.getAccountConfirmationTemplate(mailData.toName);
          break;
        case 'no-show':
          template = emailService.getNoShowTemplate(
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

// 5. Daily Reminder Scheduler
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

