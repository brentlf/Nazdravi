import { db } from './firebase';
import Stripe from 'stripe';
import { mailerLiteService } from './email';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-04-30.basil",
});

export interface InvoiceItem {
  description: string;
  amount: number;
  type: 'session' | 'penalty' | 'subscription';
  details?: string;
}

export interface InvoiceData {
  userId: string;
  clientName: string;
  clientEmail: string;
  servicePlan: 'pay-as-you-go' | 'complete-program';
  items: InvoiceItem[];
  totalAmount: number;
  currency: string;
  dueDate: Date;
  appointmentId?: string;
  invoiceType: 'session' | 'subscription' | 'penalty';
  subscriptionMonth?: number;
  subscriptionYear?: number;
}

export class InvoiceManagementService {
  
  async createSessionInvoice(data: {
    userId: string;
    clientName: string;
    clientEmail: string;
    servicePlan: 'pay-as-you-go' | 'complete-program';
    appointmentId: string;
    sessionType: string;
    penalties?: { lateReschedule?: boolean; noShow?: boolean };
  }): Promise<{ invoiceId: string; paymentUrl: string }> {
    
    const items: InvoiceItem[] = [];
    let totalAmount = 0;

    // Base session fee based on service plan
    const sessionFee = data.servicePlan === 'complete-program' ? 0 : 75; // €75 for pay-as-you-go
    
    if (sessionFee > 0) {
      items.push({
        description: `${data.sessionType} Consultation`,
        amount: sessionFee,
        type: 'session',
        details: 'Nutrition consultation session'
      });
      totalAmount += sessionFee;
    }

    // Add penalties if applicable
    if (data.penalties?.lateReschedule) {
      items.push({
        description: 'Late Reschedule Fee',
        amount: 5,
        type: 'penalty',
        details: 'Reschedule request made within 4 working hours of appointment'
      });
      totalAmount += 5;
    }

    if (data.penalties?.noShow) {
      const noShowPenalty = sessionFee * 0.5; // 50% of session fee
      items.push({
        description: 'No-Show Penalty',
        amount: noShowPenalty,
        type: 'penalty',
        details: '50% penalty for missed appointment'
      });
      totalAmount += noShowPenalty;
    }

    // Create invoice in Firebase
    const invoiceNumber = `INV-${Date.now()}-${data.userId.slice(-6)}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 14 days payment term

    const invoiceData: InvoiceData = {
      userId: data.userId,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      servicePlan: data.servicePlan,
      items,
      totalAmount,
      currency: 'eur',
      dueDate,
      appointmentId: data.appointmentId,
      invoiceType: 'session'
    };

    // Only create Stripe payment if amount > 0
    let paymentUrl = '';
    if (totalAmount > 0) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100), // Convert to cents
        currency: 'eur',
        payment_method_types: ['card', 'ideal'],
        metadata: {
          invoiceNumber,
          userId: data.userId,
          appointmentId: data.appointmentId,
          servicePlan: data.servicePlan
        }
      });

      paymentUrl = `${process.env.REPLIT_DEV_DOMAIN || 'https://your-domain.com'}/pay-invoice/${paymentIntent.id}`;
    }

    // Save to Firebase
    const invoiceRef = await db.collection('invoices').add({
      ...invoiceData,
      invoiceNumber,
      status: totalAmount > 0 ? 'unpaid' : 'not_applicable',
      stripePaymentIntentId: totalAmount > 0 ? paymentUrl : null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Send email notification to client (only if amount > 0)
    if (totalAmount > 0) {
      await mailerLiteService.sendInvoiceGenerated(
        data.clientEmail,
        data.clientName,
        totalAmount,
        invoiceRef.id
      );
    }

    return {
      invoiceId: invoiceRef.id,
      paymentUrl
    };
  }

  async createSubscriptionInvoice(data: {
    userId: string;
    clientName: string;
    clientEmail: string;
    month: number;
    year: number;
    subscriptionAmount: number;
  }): Promise<{ invoiceId: string; paymentUrl: string }> {
    
    // Check if invoice already exists for this month/year
    const existingInvoiceSnapshot = await db.collection("invoices")
      .where("userId", "==", data.userId)
      .where("subscriptionMonth", "==", data.month)
      .where("subscriptionYear", "==", data.year)
      .where("invoiceType", "==", "subscription")
      .get();
    
    if (!existingInvoiceSnapshot.empty) {
      const existingInvoice = existingInvoiceSnapshot.docs[0];
      return {
        invoiceId: existingInvoice.id,
        paymentUrl: existingInvoice.data().stripePaymentIntentId || ''
      };
    }

    const items: InvoiceItem[] = [{
      description: `Complete Program Subscription - ${this.getMonthName(data.month)} ${data.year}`,
      amount: data.subscriptionAmount,
      type: 'subscription',
      details: '3-month complete nutrition program'
    }];

    // Create Stripe payment intent
    const invoiceNumber = `SUB-${data.year}-${data.month.toString().padStart(2, '0')}-${Date.now()}`;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(data.subscriptionAmount * 100),
      currency: 'eur',
      payment_method_types: ['card', 'ideal'],
      metadata: {
        invoiceNumber,
        userId: data.userId,
        subscriptionMonth: data.month.toString(),
        subscriptionYear: data.year.toString(),
        servicePlan: 'complete-program'
      }
    });

    const paymentUrl = `${process.env.REPLIT_DEV_DOMAIN || 'https://your-domain.com'}/pay-invoice/${paymentIntent.id}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // 7 days for subscription payments

    // Save to Firebase
    const invoiceRef = await db.collection('invoices').add({
      userId: data.userId,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      servicePlan: 'complete-program',
      items,
      totalAmount: data.subscriptionAmount,
      currency: 'eur',
      dueDate,
      invoiceType: 'subscription',
      subscriptionMonth: data.month,
      subscriptionYear: data.year,
      invoiceNumber,
      status: 'unpaid',
      stripePaymentIntentId: paymentIntent.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Send email notification
    await mailerLiteService.sendInvoiceGenerated(
      data.clientEmail,
      data.clientName,
      data.subscriptionAmount,
      invoiceRef.id
    );

    return {
      invoiceId: invoiceRef.id,
      paymentUrl
    };
  }

  async markInvoiceAsPaid(invoiceId: string, paymentIntentId: string): Promise<void> {
    // Update invoice status
    await db.collection('invoices').doc(invoiceId).update({
      status: 'paid',
      paidAt: new Date(),
      updatedAt: new Date(),
      stripePaymentIntentId: paymentIntentId
    });

    // Get invoice details for admin notification
    const invoiceDoc = await db.collection('invoices').doc(invoiceId).get();
    if (invoiceDoc.exists()) {
      const invoiceData = invoiceDoc.data();
      
      // Send admin notification
      await mailerLiteService.sendAdminInvoicePaid(
        invoiceData?.clientName || 'Unknown Client',
        invoiceData?.totalAmount || 0,
        invoiceId
      );
    }
  }

  async getInvoicesByUser(userId: string): Promise<any[]> {
    const invoicesSnapshot = await db.collection('invoices')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    return invoicesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  async getUnpaidInvoices(): Promise<any[]> {
    const invoicesSnapshot = await db.collection('invoices')
      .where('status', '==', 'unpaid')
      .orderBy('dueDate', 'asc')
      .get();

    return invoicesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  private getMonthName(monthNumber: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1] || 'Unknown';
  }

  async applyPenaltyToUser(
    userId: string,
    clientName: string,
    clientEmail: string,
    penaltyType: 'late_reschedule' | 'no_show',
    appointmentId: string,
    sessionAmount: number
  ): Promise<string> {
    
    const items: InvoiceItem[] = [];
    let totalAmount = 0;

    if (penaltyType === 'late_reschedule') {
      items.push({
        description: 'Late Reschedule Administrative Fee',
        amount: 5,
        type: 'penalty',
        details: 'Fee applied for reschedule requests made within 4 working hours'
      });
      totalAmount = 5;
    } else if (penaltyType === 'no_show') {
      const penaltyAmount = sessionAmount * 0.5;
      items.push({
        description: 'No-Show Penalty Fee',
        amount: penaltyAmount,
        type: 'penalty',
        details: '50% penalty for missed appointment without notice'
      });
      totalAmount = penaltyAmount;
    }

    // Create penalty invoice
    const invoiceNumber = `PEN-${Date.now()}-${userId.slice(-6)}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // 7 days for penalty payments

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        invoiceNumber,
        userId,
        appointmentId,
        penaltyType
      }
    });

    // Save to Firebase
    const invoiceRef = await db.collection('invoices').add({
      userId,
      clientName,
      clientEmail,
      servicePlan: 'pay-as-you-go', // Penalties apply regardless of plan
      items,
      totalAmount,
      currency: 'eur',
      dueDate,
      appointmentId,
      invoiceType: 'penalty',
      invoiceNumber,
      status: 'unpaid',
      stripePaymentIntentId: paymentIntent.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Send appropriate email notification
    if (penaltyType === 'late_reschedule') {
      await mailerLiteService.sendLateRescheduleNotice(
        clientEmail,
        clientName,
        'appointment date',
        'appointment time'
      );
    } else if (penaltyType === 'no_show') {
      await mailerLiteService.sendNoShowNotice(
        clientEmail,
        clientName,
        'appointment date',
        'appointment time',
        totalAmount
      );
    }

    return invoiceRef.id;
  }
}

export const invoiceService = new InvoiceManagementService();