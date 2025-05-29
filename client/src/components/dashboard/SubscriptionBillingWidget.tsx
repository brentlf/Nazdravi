import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Calendar, CreditCard, Clock, CheckCircle, AlertTriangle, Euro } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface BillingCycle {
  billingCycle: number;
  dueDate: Date;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  invoiceId?: string;
  paymentUrl?: string;
}

interface SubscriptionBillingWidgetProps {
  user: any;
}

export default function SubscriptionBillingWidget({ user }: SubscriptionBillingWidgetProps) {
  const [billingStatus, setBillingStatus] = useState<{
    upcomingInvoices: Array<{ dueDate: Date; amount: number; billingCycle: number }>;
    overdueInvoices: Array<{ invoiceId: string; dueDate: Date; amount: number; billingCycle: number }>;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isCompleteProgramUser = user?.servicePlan === 'complete-program';

  useEffect(() => {
    if (isCompleteProgramUser && user?.uid) {
      fetchBillingStatus();
    }
  }, [isCompleteProgramUser, user?.uid]);

  const fetchBillingStatus = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/subscriptions/billing-status/${user.uid}`);
      const data = await response.json();
      
      if (data.success) {
        setBillingStatus(data);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to load billing status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching billing status:', error);
      toast({
        title: "Error",
        description: "Failed to load billing status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCompleteProgram = async () => {
    if (!user?.uid || !user?.name || !user?.email) return;
    
    setLoading(true);
    try {
      const programStartDate = user.programStartDate?.toDate ? 
        user.programStartDate.toDate().toISOString() : 
        new Date().toISOString();

      const response = await fetch('/api/subscriptions/generate-complete-program', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          clientName: user.name,
          clientEmail: user.email,
          programStartDate,
          monthlyAmount: 150 // Default monthly amount
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Complete program invoices generated successfully",
        });
        fetchBillingStatus(); // Refresh the billing status
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to generate invoices",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error generating complete program:', error);
      toast({
        title: "Error",
        description: "Failed to generate complete program invoices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getBillingCycleLabel = (cycle: number) => {
    switch (cycle) {
      case 1: return "Month 1 (Day 1)";
      case 2: return "Month 2 (End of Month 1)";
      case 3: return "Month 3 (End of Month 2)";
      default: return `Month ${cycle}`;
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isCompleteProgramUser) {
    return null; // Don't show for pay-as-you-go users
  }

  if (loading && !billingStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Subscription Billing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading billing status...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Complete Program Billing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Program Overview */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-purple-800 dark:text-purple-200">3-Month Complete Program</h4>
              <p className="text-sm text-purple-600 dark:text-purple-300">
                Billed in advance: Day 1, End of Month 1, End of Month 2
              </p>
            </div>
            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              €150/month
            </Badge>
          </div>
        </div>

        {/* Billing Status */}
        {billingStatus ? (
          <div className="space-y-3">
            {/* Overdue Invoices */}
            {billingStatus.overdueInvoices.length > 0 && (
              <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium text-red-800 dark:text-red-200">
                      {billingStatus.overdueInvoices.length} overdue payment{billingStatus.overdueInvoices.length > 1 ? 's' : ''}
                    </p>
                    {billingStatus.overdueInvoices.map((invoice, index) => (
                      <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-medium">
                            {getBillingCycleLabel(invoice.billingCycle)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            Due: {formatDate(invoice.dueDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">€{invoice.amount}</span>
                          <Button size="sm" className="bg-red-600 hover:bg-red-700">
                            Pay Now
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Upcoming Invoices */}
            {billingStatus.upcomingInvoices.length > 0 && (
              <div className="space-y-2">
                <h5 className="font-medium text-sm">Upcoming Billing</h5>
                {billingStatus.upcomingInvoices.map((invoice, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">
                        {getBillingCycleLabel(invoice.billingCycle)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Due: {formatDate(invoice.dueDate)}
                      </span>
                    </div>
                    <span className="font-medium">€{invoice.amount}</span>
                  </div>
                ))}
              </div>
            )}

            {/* All Paid Status */}
            {billingStatus.overdueInvoices.length === 0 && billingStatus.upcomingInvoices.length === 0 && (
              <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <p className="font-medium text-green-800 dark:text-green-200">
                    All program payments are up to date
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    Your complete program subscription is active
                  </p>
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Complete program billing not yet set up
            </p>
            <Button 
              onClick={generateCompleteProgram}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? "Generating..." : "Set Up Billing"}
            </Button>
          </div>
        )}

        {/* Program Details */}
        <div className="pt-3 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Program Start</p>
              <p className="font-medium">
                {user.programStartDate ? formatDate(
                  user.programStartDate.toDate ? user.programStartDate.toDate() : user.programStartDate
                ) : 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Program End</p>
              <p className="font-medium">
                {user.programEndDate ? formatDate(
                  user.programEndDate.toDate ? user.programEndDate.toDate() : user.programEndDate
                ) : 'Not set'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}