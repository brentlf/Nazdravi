import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Resend } from 'resend';

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Database and storage exports for other functions
export const db = admin.firestore();
export const storage = admin.storage();

// Email service functions
export const sendWelcomeEmail = functions.https.onCall(async (data, context) => {
  try {
    const { email, name } = data;
    
    if (!email || !name) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields: email and name');
    }

    // Send email via Resend
    const result = await resend.emails.send({
      from: 'Nazdravi <noreply@nazdravi.com>',
      to: [email],
      subject: 'Welcome to Nazdravi!',
      html: `
        <h1>Welcome to Nazdravi, ${name}!</h1>
        <p>Thank you for joining our nutrition consulting platform.</p>
        <p>We're excited to help you on your health journey!</p>
      `
    });

    // Log success
    await db.collection('emailLogs').add({
      type: 'welcome',
      to: email,
      status: 'sent',
      messageId: result.data?.id,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, messageId: result.data?.id };
  } catch (error: any) {
    console.error('Error sending welcome email:', error);
    
    // Log failure
    await db.collection('emailLogs').add({
      type: 'welcome',
      to: data.email,
      status: 'failed',
      error: error.message,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    throw new functions.https.HttpsError('internal', 'Failed to send welcome email');
  }
});

export const sendAppointmentConfirmation = functions.https.onCall(async (data, context) => {
  try {
    const { email, name, date, time, meetingUrl, appointmentType } = data;
    
    if (!email || !name || !date || !time) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }

    const result = await resend.emails.send({
      from: 'Nazdravi <noreply@nazdravi.com>',
      to: [email],
      subject: 'Appointment Confirmation - Nazdravi',
      html: `
        <h1>Appointment Confirmed!</h1>
        <p>Hi ${name},</p>
        <p>Your ${appointmentType || 'consultation'} appointment has been confirmed for:</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        ${meetingUrl ? `<p><strong>Meeting Link:</strong> <a href="${meetingUrl}">${meetingUrl}</a></p>` : ''}
        <p>We look forward to seeing you!</p>
      `
    });

    // Log success
    await db.collection('emailLogs').add({
      type: 'appointment-confirmation',
      to: email,
      status: 'sent',
      messageId: result.data?.id,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, messageId: result.data?.id };
  } catch (error: any) {
    console.error('Error sending appointment confirmation:', error);
    
    // Log failure
    await db.collection('emailLogs').add({
      type: 'appointment-confirmation',
      to: data.email,
      status: 'failed',
      error: error.message,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    throw new functions.https.HttpsError('internal', 'Failed to send appointment confirmation');
  }
});

export const sendInvoiceEmail = functions.https.onCall(async (data, context) => {
  try {
    const { email, name, invoiceNumber, amount, dueDate, pdfUrl } = data;
    
    if (!email || !name || !invoiceNumber || !amount) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }

    const result = await resend.emails.send({
      from: 'Nazdravi <noreply@nazdravi.com>',
      to: [email],
      subject: `Invoice #${invoiceNumber} - Nazdravi`,
      html: `
        <h1>Invoice #${invoiceNumber}</h1>
        <p>Hi ${name},</p>
        <p>Your invoice is ready:</p>
        <p><strong>Amount:</strong> €${amount}</p>
        <p><strong>Due Date:</strong> ${dueDate || 'Due upon receipt'}</p>
        ${pdfUrl ? `<p><a href="${pdfUrl}" target="_blank">Download Invoice PDF</a></p>` : ''}
        <p>Thank you for choosing Nazdravi!</p>
      `
    });

    // Log success
    await db.collection('emailLogs').add({
      type: 'invoice',
      to: email,
      status: 'sent',
      messageId: result.data?.id,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, messageId: result.data?.id };
  } catch (error: any) {
    console.error('Error sending invoice email:', error);
    
    // Log failure
    await db.collection('emailLogs').add({
      type: 'invoice',
      to: data.email,
      status: 'failed',
      error: error.message,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    throw new functions.https.HttpsError('internal', 'Failed to send invoice email');
  }
});

// HTTP endpoints for webhooks and direct calls
export const api = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  const { path } = req;

  // Health check
  if (path === '/api/health') {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: 'production'
    });
    return;
  }

  // Test endpoint
  if (path === '/api/test') {
    res.json({
      success: true,
      message: 'Nazdravi API is working!',
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Default response
  res.json({
    message: 'Nazdravi API',
    endpoints: ['/api/health', '/api/test'],
    functions: ['sendWelcomeEmail', 'sendAppointmentConfirmation', 'sendInvoiceEmail'],
    timestamp: new Date().toISOString()
  });
});

// Internal email functions for triggers (not exposed as callable)
async function sendAppointmentEmailInternal(data: {
  email: string;
  name: string;
  date: string;
  time: string;
  meetingUrl?: string;
  appointmentType?: string;
}) {
  try {
    const result = await resend.emails.send({
      from: 'Nazdravi <noreply@nazdravi.com>',
      to: [data.email],
      subject: 'Appointment Confirmation - Nazdravi',
      html: `
        <h1>Appointment Confirmed!</h1>
        <p>Hi ${data.name},</p>
        <p>Your ${data.appointmentType || 'consultation'} appointment has been confirmed for:</p>
        <p><strong>Date:</strong> ${data.date}</p>
        <p><strong>Time:</strong> ${data.time}</p>
        ${data.meetingUrl ? `<p><strong>Meeting Link:</strong> <a href="${data.meetingUrl}">${data.meetingUrl}</a></p>` : ''}
        <p>We look forward to seeing you!</p>
      `
    });

    // Log success
    await db.collection('emailLogs').add({
      type: 'appointment-confirmation',
      to: data.email,
      status: 'sent',
      messageId: result.data?.id,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, messageId: result.data?.id };
  } catch (error: any) {
    console.error('Error sending appointment confirmation:', error);
    
    // Log failure
    await db.collection('emailLogs').add({
      type: 'appointment-confirmation',
      to: data.email,
      status: 'failed',
      error: error.message,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    throw error;
  }
}

async function sendInvoiceEmailInternal(data: {
  email: string;
  name: string;
  invoiceNumber: string;
  amount: number;
  dueDate?: string;
  pdfUrl?: string;
}) {
  try {
    const result = await resend.emails.send({
      from: 'Nazdravi <noreply@nazdravi.com>',
      to: [data.email],
      subject: `Invoice #${data.invoiceNumber} - Nazdravi`,
      html: `
        <h1>Invoice #${data.invoiceNumber}</h1>
        <p>Hi ${data.name},</p>
        <p>Your invoice is ready:</p>
        <p><strong>Amount:</strong> €${data.amount}</p>
        <p><strong>Due Date:</strong> ${data.dueDate || 'Due upon receipt'}</p>
        ${data.pdfUrl ? `<p><a href="${data.pdfUrl}" target="_blank">Download Invoice PDF</a></p>` : ''}
        <p>Thank you for choosing Nazdravi!</p>
      `
    });

    // Log success
    await db.collection('emailLogs').add({
      type: 'invoice',
      to: data.email,
      status: 'sent',
      messageId: result.data?.id,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, messageId: result.data?.id };
  } catch (error: any) {
    console.error('Error sending invoice email:', error);
    
    // Log failure
    await db.collection('emailLogs').add({
      type: 'invoice',
      to: data.email,
      status: 'failed',
      error: error.message,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    throw error;
  }
}

// Firestore triggers for automated emails
export const onAppointmentCreated = functions.firestore
  .document('appointments/{appointmentId}')
  .onCreate(async (snap, context) => {
    const appointment = snap.data();
    
    if (appointment && appointment.email && appointment.name) {
      try {
        // Send confirmation email
        await sendAppointmentEmailInternal({
          email: appointment.email,
          name: appointment.name,
          date: appointment.date,
          time: appointment.time,
          meetingUrl: appointment.meetingUrl,
          appointmentType: appointment.type
        });
        
        console.log(`Appointment confirmation sent for ${appointment.email}`);
      } catch (error) {
        console.error('Error sending appointment confirmation:', error);
      }
    }
  });

export const onInvoiceCreated = functions.firestore
  .document('invoices/{invoiceId}')
  .onCreate(async (snap, context) => {
    const invoice = snap.data();
    
    if (invoice && invoice.clientEmail && invoice.clientName) {
      try {
        // Send invoice email
        await sendInvoiceEmailInternal({
          email: invoice.clientEmail,
          name: invoice.clientName,
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.amount,
          dueDate: invoice.dueDate,
          pdfUrl: invoice.pdfUrl
        });
        
        console.log(`Invoice email sent for ${invoice.clientName}`);
      } catch (error) {
        console.error('Error sending invoice email:', error);
      }
    }
  });
