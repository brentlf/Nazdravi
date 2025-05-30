import { db } from './firebase';
import Stripe from 'stripe';
import { mailerLiteService } from './email';
import { pdfService } from './pdf-service';

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
    if (data.servicePlan === 'pay-as-you-go') {
      const sessionAmount = 85; // Pay-as-you-go rate
      items.push({
        description: `Nutrition consultation session (${data.sessionType})`,
        amount: sessionAmount,
        type: 'session'
      });
      totalAmount += sessionAmount;
    }

    // Add penalty fees if applicable
    if (data.penalties?.lateReschedule) {
      const penaltyAmount = 25;
      items.push({
        description: 'Late reschedule fee (less than 24h notice)',
        amount: penaltyAmount,
        type: 'penalty'
      });
      totalAmount += penaltyAmount;
    }

    if (data.penalties?.noShow) {
      const penaltyAmount = 50;
      items.push({
        description: 'No-show fee',
        amount: penaltyAmount,
        type: 'penalty'
      });
      totalAmount += penaltyAmount;
    }

    // Create Stripe payment intent
    const invoiceNumber = `INV-${Date.now()}`;
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

    const paymentUrl = `https://${process.env.REPLIT_DEV_DOMAIN || 'your-domain.com'}/pay-invoice/${paymentIntent.id}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 14 days payment term

    // Save invoice to Firebase
    const invoiceRef = await db.collection('invoices').add({
      userId: data.userId,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      servicePlan: data.servicePlan,
      items,
      totalAmount,
      currency: 'eur',
      dueDate,
      invoiceType: 'session',
      appointmentId: data.appointmentId,
      invoiceNumber,
      status: 'unpaid',
      paymentUrl,
      stripePaymentIntentId: paymentIntent.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Generate and store PDF
    console.log('🚀 Attempting to generate PDF for invoice:', invoiceRef.id);
    try {
      console.log('📋 PDF data prepared:', {
        invoiceNumber,
        clientName: data.clientName,
        amount: totalAmount,
        currency: 'EUR'
      });
      
      const pdfUrl = await pdfService.generateAndStorePDF({
        invoiceNumber,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        amount: totalAmount,
        currency: 'EUR',
        description: items.map(item => item.description).join(', '),
        invoiceType: 'invoice',
        createdAt: new Date(),
        dueDate,
        status: 'unpaid',
        items: items.map(item => ({
          description: item.description,
          amount: item.amount
        }))
      });

      // Update invoice with PDF URL
      await invoiceRef.update({ pdfUrl });
      console.log(`✅ PDF generated and stored for invoice: ${invoiceRef.id}`);
      console.log(`🔗 PDF URL: ${pdfUrl}`);
    } catch (pdfError) {
      console.error('❌ Error generating PDF for session invoice:', pdfError);
      console.error('❌ PDF Error stack:', pdfError instanceof Error ? pdfError.stack : 'No stack trace');
      // Continue without PDF - don't fail the invoice creation
    }

    // Send email notification
    await mailerLiteService.sendInvoiceGenerated(
      data.clientEmail,
      data.clientName,
      totalAmount,
      invoiceRef.id
    );

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
    billingCycle: number;
  }): Promise<{ invoiceId: string; paymentUrl: string }> {
    
    const items: InvoiceItem[] = [{
      description: `Complete Nutrition Program - Month ${data.billingCycle}`,
      amount: data.subscriptionAmount,
      type: 'subscription',
      details: '3-month complete nutrition program with unlimited consultations'
    }];

    // Create Stripe payment intent
    const invoiceNumber = `SUB-${data.year}-${data.month.toString().padStart(2, '0')}-${data.billingCycle}-${Date.now()}`;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(data.subscriptionAmount * 100),
      currency: 'eur',
      payment_method_types: ['card', 'ideal'],
      metadata: {
        invoiceNumber,
        userId: data.userId,
        subscriptionMonth: data.month.toString(),
        subscriptionYear: data.year.toString(),
        billingCycle: data.billingCycle.toString(),
        servicePlan: 'complete-program'
      }
    });

    const paymentUrl = `https://${process.env.REPLIT_DEV_DOMAIN || 'your-domain.com'}/pay-invoice/${paymentIntent.id}`;
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
      amount: data.subscriptionAmount, // Add explicit amount field
      currency: 'eur',
      dueDate,
      invoiceType: 'subscription',
      subscriptionMonth: data.month,
      subscriptionYear: data.year,
      billingCycle: data.billingCycle,
      invoiceNumber,
      paymentUrl,
      description: `Complete Nutrition Program - Month ${data.billingCycle} of 3`, // Add description field
      status: 'unpaid',
      stripePaymentIntentId: paymentIntent.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Generate and store PDF
    try {
      const pdfUrl = await pdfService.generateAndStorePDF({
        invoiceNumber,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        amount: data.subscriptionAmount,
        currency: 'EUR',
        description: `Complete Nutrition Program - Month ${data.billingCycle} of 3`,
        invoiceType: 'invoice',
        createdAt: new Date(),
        dueDate,
        status: 'unpaid',
        items: items.map(item => ({
          description: item.description,
          amount: item.amount
        }))
      });

      // Update invoice with PDF URL
      await invoiceRef.update({ pdfUrl });
      console.log(`📄 PDF generated and stored for subscription invoice: ${invoiceRef.id}`);
    } catch (pdfError) {
      console.error('Error generating PDF for subscription invoice:', pdfError);
      // Continue without PDF - don't fail the invoice creation
    }

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
    const storedSubscriptionStatus = userData?.subscriptionStatus || 'none';
    const nextBillingDate = userData?.nextBillingDate?.toDate();
    const currentCycle = userData?.currentBillingCycle || 0;
    const maxCycles = userData?.maxBillingCycles || 3;
    
    // Get ALL subscription invoices (paid and unpaid) to validate actual subscription status
    const allSubscriptionInvoices = await db.collection('invoices')
      .where('userId', '==', userId)
      .where('invoiceType', '==', 'subscription')
      .get();
    
    // Get existing unpaid invoices
    const unpaidInvoices = await db.collection('invoices')
      .where('userId', '==', userId)
      .where('invoiceType', '==', 'subscription')
      .where('status', '==', 'unpaid')
      .get();
    
    const upcomingInvoices: Array<{ dueDate: Date; amount: number; billingCycle: number }> = [];
    const overdueInvoices: Array<{ invoiceId: string; dueDate: Date; amount: number; billingCycle: number }> = [];
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
    
    // Determine actual subscription status based on invoices and user data
    let actualSubscriptionStatus = 'none';
    
    if (allSubscriptionInvoices.docs.length > 0) {
      // User has subscription invoices - determine status based on data
      if (currentCycle >= maxCycles) {
        actualSubscriptionStatus = 'completed';
      } else if (storedSubscriptionStatus === 'cancelled') {
        actualSubscriptionStatus = 'cancelled';
      } else if (storedSubscriptionStatus === 'active' || unpaidInvoices.docs.length > 0) {
        actualSubscriptionStatus = 'active';
      }
    } else {
      // No invoices generated yet, but check if billing was set up
      actualSubscriptionStatus = storedSubscriptionStatus === 'active' ? 'none' : storedSubscriptionStatus;
    }
    
    // Check if it's time to generate next month's invoice
    if (actualSubscriptionStatus === 'active' && nextBillingDate && nextBillingDate <= now && currentCycle < maxCycles) {
      await this.generateNextMonthlyInvoice(userId);
    }
    
    return { 
      upcomingInvoices, 
      overdueInvoices,
      subscriptionStatus: actualSubscriptionStatus,
      nextBillingDate,
      currentCycle,
      maxCycles
    };
  }

  // Mark invoice as paid when payment is completed
  async markInvoiceAsPaid(invoiceId: string, paymentIntentId: string): Promise<void> {
    await db.collection('invoices').doc(invoiceId).update({
      status: 'paid',
      paidAt: new Date(),
      updatedAt: new Date(),
      stripePaymentIntentId: paymentIntentId
    });

    // Get invoice details for admin notification
    const invoiceDoc = await db.collection('invoices').doc(invoiceId).get();
    if (invoiceDoc.exists) {
      const data = invoiceDoc.data();
      // Send admin notification email (when email service method is available)
      console.log(`Payment received for invoice ${invoiceId} - ${data?.clientName} - €${data?.totalAmount}`);
    }
  }

  // Get all invoices for a specific user
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

  // Get all unpaid invoices
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

  // Create custom invoice for additional charges
  async createCustomInvoice(data: {
    userId: string;
    clientName: string;
    clientEmail: string;
    amount: number;
    description: string;
    invoiceType: string;
    appointmentId?: string;
  }): Promise<{ invoiceId: string; paymentUrl: string }> {
    
    const items: InvoiceItem[] = [{
      description: data.description,
      amount: data.amount,
      type: (data.invoiceType as 'session' | 'subscription' | 'penalty') || 'session',
      details: `Additional charge: ${data.description}`
    }];

    // Create Stripe payment intent
    const invoiceNumber = `CUSTOM-${Date.now()}`;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(data.amount * 100),
      currency: 'eur',
      payment_method_types: ['card', 'ideal'],
      metadata: {
        invoiceNumber,
        userId: data.userId,
        servicePlan: 'additional-charge'
      }
    });

    const paymentUrl = `https://${process.env.REPLIT_DEV_DOMAIN || 'your-domain.com'}/pay-invoice/${paymentIntent.id}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // 7 days to pay

    // Save to Firebase
    const invoiceRef = await db.collection('invoices').add({
      userId: data.userId,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      servicePlan: 'additional-charge',
      items,
      totalAmount: data.amount,
      amount: data.amount, // Add explicit amount field for compatibility
      currency: 'eur',
      dueDate,
      invoiceType: data.invoiceType,
      invoiceNumber,
      status: 'unpaid',
      paymentUrl,
      stripePaymentIntentId: paymentIntent.id,
      description: data.description,
      appointmentId: data.appointmentId || null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Generate and store PDF
    console.log('🚀 Attempting to generate PDF for custom invoice:', invoiceRef.id);
    try {
      console.log('📋 PDF data prepared:', {
        invoiceNumber,
        clientName: data.clientName,
        amount: data.amount,
        currency: 'EUR'
      });
      
      const pdfUrl = await pdfService.generateAndStorePDF({
        invoiceNumber,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        amount: data.amount,
        currency: 'EUR',
        description: data.description,
        invoiceType: 'invoice',
        createdAt: new Date(),
        dueDate,
        status: 'pending',
        items: items.map(item => ({
          description: item.description,
          amount: item.amount
        }))
      });

      // Update invoice with PDF URL
      await invoiceRef.update({ pdfUrl });
      console.log(`✅ PDF generated and stored for custom invoice: ${invoiceRef.id}`);
      console.log(`🔗 PDF URL: ${pdfUrl}`);
    } catch (pdfError) {
      console.error('❌ Error generating PDF for custom invoice:', pdfError);
      console.error('❌ PDF Error stack:', pdfError instanceof Error ? pdfError.stack : 'No stack trace');
      // Continue without PDF - don't fail the invoice creation
    }

    // Send email notification
    try {
      await mailerLiteService.sendInvoiceGenerated(
        data.clientEmail,
        data.clientName,
        data.amount,
        invoiceRef.id
      );
    } catch (emailError) {
      console.error('Failed to send custom invoice email notification:', emailError);
    }

    return {
      invoiceId: invoiceRef.id,
      paymentUrl
    };
  }
}

export const invoiceService = new InvoiceManagementService();