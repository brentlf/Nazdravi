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
    subscriptionStatus?: string;
    nextBillingDate?: Date;
    currentCycle?: number;
    maxCycles?: number;
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
          description: "Monthly subscription started successfully",
        });
        fetchBillingStatus(); // Refresh the billing status
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to start subscription",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error starting subscription:', error);
      toast({
        title: "Error",
        description: "Failed to start monthly subscription",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Subscription cancelled successfully",
        });
        fetchBillingStatus(); // Refresh the billing status
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to cancel subscription",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
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
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard className="w-4 h-4" />
          Complete Program Billing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {/* Compact Program Overview */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-purple-800 dark:text-purple-200 text-sm">3-Month Complete Program</h4>
              <p className="text-xs text-purple-600 dark:text-purple-300">
                Billed in advance: Day 1, Month 1, Month 2
              </p>
            </div>
            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs">
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
                    <p className="font-medium text-red-800 dark:text-red-200 text-sm">
                      {billingStatus.overdueInvoices.length} overdue payment{billingStatus.overdueInvoices.length > 1 ? 's' : ''}
                    </p>
                    {billingStatus.overdueInvoices.map((invoice, index) => (
                      <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-red-500" />
                          <span className="text-xs font-medium">
                            {getBillingCycleLabel(invoice.billingCycle)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">€{invoice.amount}</span>
                          <Button size="sm" className="bg-red-600 hover:bg-red-700 text-xs">
                            Pay
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
                <h5 className="font-medium text-xs">Upcoming Billing</h5>
                {billingStatus.upcomingInvoices.map((invoice, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-blue-500" />
                      <span className="text-xs font-medium">
                        {getBillingCycleLabel(invoice.billingCycle)}
                      </span>
                    </div>
                    <span className="font-medium text-sm">€{invoice.amount}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Subscription Status Display */}
            {billingStatus.subscriptionStatus === 'active' && billingStatus.overdueInvoices.length === 0 && (
              <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium text-green-800 dark:text-green-200 text-sm">
                      Monthly subscription active
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-300">
                      Month {billingStatus.currentCycle || 1} of {billingStatus.maxCycles || 3}
                    </p>
                    {billingStatus.nextBillingDate && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Next: {new Date(billingStatus.nextBillingDate).toLocaleDateString()}
                      </p>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cancelSubscription}
                      disabled={loading}
                      className="mt-2 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Cancelled Status */}
            {billingStatus.subscriptionStatus === 'cancelled' && (
              <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription>
                  <p className="font-medium text-orange-800 dark:text-orange-200">
                    Subscription cancelled
                  </p>
                  <p className="text-sm text-orange-600 dark:text-orange-300">
                    No future invoices will be generated
                  </p>
                </AlertDescription>
              </Alert>
            )}

            {/* Completed Status */}
            {billingStatus.subscriptionStatus === 'completed' && (
              <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription>
                  <p className="font-medium text-blue-800 dark:text-blue-200">
                    Program completed
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    3-month nutrition program successfully finished
                  </p>
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="text-center space-y-1">
            <p className="text-xs text-muted-foreground">
              Subscription not set up
            </p>
            <Button 
              onClick={generateCompleteProgram}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-xs h-6"
              size="sm"
            >
              {loading ? "Starting..." : "Start Billing"}
            </Button>
          </div>
        )}

        {/* Compact Program Details */}
        <div className="pt-2 border-t">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-muted-foreground">Start</p>
              <p className="font-medium">
                {user.programStartDate ? formatDate(
                  user.programStartDate.toDate ? user.programStartDate.toDate() : user.programStartDate
                ) : 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">End</p>
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