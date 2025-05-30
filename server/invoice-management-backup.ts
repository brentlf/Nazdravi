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
    billingCycle?: number; // 1, 2, or 3 for the three billing cycles
  }): Promise<{ invoiceId: string; paymentUrl: string }> {
    
    const billingCycle = data.billingCycle || 1;
    
    // Check if invoice already exists for this month/year/cycle
    const existingInvoiceSnapshot = await db.collection("invoices")
      .where("userId", "==", data.userId)
      .where("subscriptionMonth", "==", data.month)
      .where("subscriptionYear", "==", data.year)
      .where("invoiceType", "==", "subscription")
      .where("billingCycle", "==", billingCycle)
      .get();
    
    if (!existingInvoiceSnapshot.empty) {
      const existingInvoice = existingInvoiceSnapshot.docs[0];
      return {
        invoiceId: existingInvoice.id,
        paymentUrl: existingInvoice.data().stripePaymentIntentId || ''
      };
    }

    const items: InvoiceItem[] = [{
      description: `Complete Program - Month ${billingCycle} of 3 (${this.getMonthName(data.month)} ${data.year})`,
      amount: data.subscriptionAmount,
      type: 'subscription',
      details: '3-month complete nutrition program with unlimited consultations'
    }];

    // Create Stripe payment intent
    const invoiceNumber = `SUB-${data.year}-${data.month.toString().padStart(2, '0')}-${billingCycle}-${Date.now()}`;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(data.subscriptionAmount * 100),
      currency: 'eur',
      payment_method_types: ['card', 'ideal'],
      metadata: {
        invoiceNumber,
        userId: data.userId,
        subscriptionMonth: data.month.toString(),
        subscriptionYear: data.year.toString(),
        billingCycle: billingCycle.toString(),
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
      billingCycle,
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

  // Generate initial subscription setup (only first invoice)
  async generateCompleteProgramInvoices(data: {
    userId: string;
    clientName: string;
    clientEmail: string;
    programStartDate: Date;
    monthlyAmount: number;
  }): Promise<{ invoices: Array<{ invoiceId: string; paymentUrl: string; billingCycle: number; month: number; year: number }> }> {
    
    const startDate = new Date(data.programStartDate);
    
    // Only generate the first month's invoice
    const invoice = await this.createSubscriptionInvoice({
      userId: data.userId,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      month: startDate.getMonth() + 1,
      year: startDate.getFullYear(),
      subscriptionAmount: data.monthlyAmount,
      billingCycle: 1
    });
    
    // Update user with subscription details
    await db.collection('users').doc(data.userId).update({
      subscriptionStatus: 'active',
      subscriptionStartDate: startDate,
      monthlyAmount: data.monthlyAmount,
      nextBillingDate: new Date(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate()),
      currentBillingCycle: 1,
      maxBillingCycles: 3,
      updatedAt: new Date()
    });
    
    return { 
      invoices: [{
        ...invoice,
        billingCycle: 1,
        month: startDate.getMonth() + 1,
        year: startDate.getFullYear()
      }]
    };
  }

  // Generate next month's invoice for active subscription
  async generateNextMonthlyInvoice(userId: string): Promise<{ invoiceId: string; paymentUrl: string } | null> {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) return null;
    
    const userData = userDoc.data();
    if (userData?.subscriptionStatus !== 'active' || !userData?.nextBillingDate) {
      return null;
    }
    
    const currentCycle = userData.currentBillingCycle || 1;
    const maxCycles = userData.maxBillingCycles || 3;
    
    // Check if subscription should continue
    if (currentCycle >= maxCycles) {
      // Mark subscription as completed
      await db.collection('users').doc(userId).update({
        subscriptionStatus: 'completed',
        updatedAt: new Date()
      });
      return null;
    }
    
    const nextCycle = currentCycle + 1;
    const nextBillingDate = userData.nextBillingDate.toDate();
    
    const invoice = await this.createSubscriptionInvoice({
      userId,
      clientName: userData.name,
      clientEmail: userData.email,
      month: nextBillingDate.getMonth() + 1,
      year: nextBillingDate.getFullYear(),
      subscriptionAmount: userData.monthlyAmount,
      billingCycle: nextCycle
    });
    
    // Update user's billing info
    const followingMonth = new Date(nextBillingDate.getFullYear(), nextBillingDate.getMonth() + 1, nextBillingDate.getDate());
    await db.collection('users').doc(userId).update({
      currentBillingCycle: nextCycle,
      nextBillingDate: followingMonth,
      updatedAt: new Date()
    });
    
    return invoice;
  }

  // Cancel subscription (prevents future invoices)
  async cancelSubscription(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        return { success: false, message: 'User not found' };
      }
      
      const userData = userDoc.data();
      if (userData?.subscriptionStatus !== 'active') {
        return { success: false, message: 'No active subscription to cancel' };
      }
      
      await db.collection('users').doc(userId).update({
        subscriptionStatus: 'cancelled',
        cancelledAt: new Date(),
        updatedAt: new Date()
      });
      
      // Send cancellation email
      await mailerLiteService.sendSubscriptionCancelled(
        userData.email,
        userData.name
      );
      
      return { success: true, message: 'Subscription cancelled successfully' };
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return { success: false, message: 'Failed to cancel subscription' };
    }
  }

  // Check subscription status and manage monthly billing
  async checkUpcomingSubscriptionBilling(userId: string): Promise<{ 
    upcomingInvoices: Array<{ dueDate: Date; amount: number; billingCycle: number }>;
    overdueInvoices: Array<{ invoiceId: string; dueDate: Date; amount: number; billingCycle: number }>;
    subscriptionStatus: string;
    nextBillingDate?: Date;
    currentCycle?: number;
    maxCycles?: number;
  }> {
    
    // Get user's subscription details
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists || userDoc.data()?.servicePlan !== 'complete-program') {
      return { 
        upcomingInvoices: [], 
        overdueInvoices: [],
        subscriptionStatus: 'none'
      };
    }
    
    const userData = userDoc.data();
    const subscriptionStatus = userData?.subscriptionStatus || 'none';
    const nextBillingDate = userData?.nextBillingDate?.toDate();
    const currentCycle = userData?.currentBillingCycle || 0;
    const maxCycles = userData?.maxBillingCycles || 3;
    
    // Get existing unpaid invoices
    const unpaidInvoices = await db.collection('invoices')
      .where('userId', '==', userId)
      .where('invoiceType', '==', 'subscription')
      .where('status', '==', 'unpaid')
      .get();
    
    const upcomingInvoices = [];
    const overdueInvoices = [];
    const now = new Date();
    
    // Check for overdue invoices
    unpaidInvoices.docs.forEach(doc => {
      const data = doc.data();
      const dueDate = data.dueDate.toDate();
      
      if (dueDate < now) {
        overdueInvoices.push({
          invoiceId: doc.id,
          dueDate,
          amount: data.totalAmount,
          billingCycle: data.billingCycle
        });
      } else {
        upcomingInvoices.push({
          dueDate,
          amount: data.totalAmount,
          billingCycle: data.billingCycle
        });
      }
    });
    
    // Check if it's time to generate next month's invoice
    if (subscriptionStatus === 'active' && nextBillingDate && nextBillingDate <= now && currentCycle < maxCycles) {
      await this.generateNextMonthlyInvoice(userId);
    }
    
    return { 
      upcomingInvoices, 
      overdueInvoices,
      subscriptionStatus,
      nextBillingDate,
      currentCycle,
      maxCycles
    };
  }

  // Mark invoice as paid when payment is completed
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
    if (invoiceDoc.exists) {
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