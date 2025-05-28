import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useStripe, useElements, PaymentElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface Invoice {
  invoiceNumber: string;
  clientName: string;
  amount: number;
  currency: string;
  description: string;
  sessionDate: string;
  sessionType: string;
  status: string;
  dueDate: string;
  stripePaymentIntentId: string;
}

const PaymentForm = ({ invoice, clientSecret }: { invoice: Invoice; clientSecret: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required'
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setPaymentComplete(true);
        toast({
          title: "Payment Successful",
          description: "Thank you for your payment! You'll receive a confirmation email shortly.",
        });
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentComplete) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
        <p className="text-muted-foreground mb-4">
          Your payment has been processed successfully.
        </p>
        <p className="text-sm text-muted-foreground">
          Invoice {invoice.invoiceNumber} has been marked as paid.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Pay €{invoice.amount.toFixed(2)}
          </>
        )}
      </Button>
    </form>
  );
};

export default function PayInvoice() {
  const { invoiceNumber } = useParams<{ invoiceNumber: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        if (!invoiceNumber) {
          setError("Invalid invoice number");
          setLoading(false);
          return;
        }

        // Fetch invoice data from API endpoint
        const invoiceResponse = await fetch(`/api/invoices/${invoiceNumber}`);
        
        if (!invoiceResponse.ok) {
          if (invoiceResponse.status === 404) {
            setError("Invoice not found");
          } else {
            setError("Failed to load invoice details");
          }
          setLoading(false);
          return;
        }

        const invoiceResult = await invoiceResponse.json();
        
        if (!invoiceResult.success) {
          setError(invoiceResult.error || "Failed to load invoice");
          setLoading(false);
          return;
        }

        const realInvoice: Invoice = {
          invoiceNumber: invoiceResult.invoice.invoiceNumber,
          clientName: invoiceResult.invoice.clientName,
          amount: invoiceResult.invoice.amount,
          currency: invoiceResult.invoice.currency,
          description: invoiceResult.invoice.description,
          sessionDate: invoiceResult.invoice.sessionDate || new Date().toISOString().split('T')[0],
          sessionType: invoiceResult.invoice.sessionType,
          status: invoiceResult.invoice.status,
          dueDate: invoiceResult.invoice.dueDate || new Date().toISOString().split('T')[0],
          stripePaymentIntentId: invoiceResult.invoice.stripePaymentIntentId
        };

        setInvoice(realInvoice);

        // Create Stripe payment intent for this invoice
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: realInvoice.amount,
            currency: realInvoice.currency,
            metadata: {
              invoiceNumber: realInvoice.invoiceNumber,
              clientName: realInvoice.clientName
            }
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setClientSecret(data.clientSecret);
        } else {
          throw new Error('Failed to create payment intent');
        }
      } catch (err) {
        console.error('Error fetching invoice:', err);
        setError("Failed to load invoice details");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceNumber]);

  if (loading) {
    return (
      <div className="min-h-screen py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading invoice details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Invoice Not Found</h1>
            <p className="text-muted-foreground">{error || "The requested invoice could not be found."}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Invoice Header */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl mb-2">Invoice Payment</CardTitle>
                  <p className="text-muted-foreground">Vee Nutrition Services</p>
                </div>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {invoice.invoiceNumber}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Client</p>
                  <p className="font-medium">{invoice.clientName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Session Date</p>
                  <p className="font-medium">{new Date(invoice.sessionDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Service</p>
                  <p className="font-medium">{invoice.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                  <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount</span>
                  <span>€{invoice.amount.toFixed(2)} {invoice.currency}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <p className="text-muted-foreground">
                Please enter your payment information below to complete the transaction.
              </p>
            </CardHeader>
            <CardContent>
              {clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaymentForm invoice={invoice} clientSecret={clientSecret} />
                </Elements>
              ) : (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">Setting up payment...</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Payments are processed securely by Stripe. Your card details are never stored on our servers.</p>
          </div>
        </div>
      </div>
    </div>
  );
}