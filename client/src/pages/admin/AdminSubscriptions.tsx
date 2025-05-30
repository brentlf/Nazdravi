import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Calendar, CreditCard, Users, Euro, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import { where } from 'firebase/firestore';
import { Link } from 'wouter';

interface User {
  uid: string;
  name: string;
  email: string;
  servicePlan?: string;
  programStartDate?: any;
  programEndDate?: any;
}

export default function AdminSubscriptions() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [monthlyAmount, setMonthlyAmount] = useState('150');
  const [programStartDate, setProgramStartDate] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch all complete program users
  const { data: completeProgramUsers } = useFirestoreCollection<User>("users", [
    where("servicePlan", "==", "complete-program")
  ]);

  const formatDate = (date: any) => {
    if (!date) return 'Not set';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const generateSubscriptionInvoices = async () => {
    if (!selectedUser) {
      toast({
        title: "Error",
        description: "Please select a user first",
        variant: "destructive",
      });
      return;
    }

    if (!programStartDate) {
      toast({
        title: "Error",
        description: "Please set a program start date",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/subscriptions/generate-complete-program', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.uid,
          clientName: selectedUser.name,
          clientEmail: selectedUser.email,
          programStartDate,
          monthlyAmount: parseFloat(monthlyAmount)
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: `Generated ${data.invoices?.length || 3} invoices for ${selectedUser.name}`,
        });
        setSelectedUser(null);
        setProgramStartDate('');
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to generate invoices",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error generating subscription invoices:', error);
      toast({
        title: "Error",
        description: "Failed to generate subscription invoices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkBillingStatus = async (userId: string) => {
    try {
      const response = await fetch(`/api/subscriptions/billing-status/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        return {
          upcomingInvoices: data.upcomingInvoices || [],
          overdueInvoices: data.overdueInvoices || []
        };
      }
    } catch (error) {
      console.error('Error checking billing status:', error);
    }
    return { upcomingInvoices: [], overdueInvoices: [] };
  };

  const [billingStatuses, setBillingStatuses] = useState<{[key: string]: any}>({});

  useEffect(() => {
    if (completeProgramUsers) {
      // Check billing status for all users
      completeProgramUsers.forEach(async (user) => {
        const status = await checkBillingStatus(user.uid);
        setBillingStatuses(prev => ({
          ...prev,
          [user.uid]: status
        }));
      });
    }
  }, [completeProgramUsers]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Subscription Management</h1>
          <p className="text-muted-foreground">
            Manage complete program subscriptions and billing cycles
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard className="w-4 h-4" />
            3-Invoice Billing System
          </div>
          <Button variant="outline" asChild size="sm">
            <Link href="/admin/invoices">
              View Pay-as-you-go Invoices
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Generate New Subscription */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Generate Complete Program Billing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select User</Label>
              <Select 
                value={selectedUser?.uid || ""} 
                onValueChange={(value) => {
                  const user = completeProgramUsers?.find(u => u.uid === value);
                  setSelectedUser(user || null);
                  if (user?.programStartDate) {
                    const startDate = user.programStartDate.toDate ? 
                      user.programStartDate.toDate() : 
                      new Date(user.programStartDate);
                    setProgramStartDate(startDate.toISOString().split('T')[0]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a complete program user" />
                </SelectTrigger>
                <SelectContent>
                  {completeProgramUsers?.map((user) => (
                    <SelectItem key={user.uid} value={user.uid}>
                      <div className="flex items-center justify-between w-full">
                        <span>{user.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {user.email}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Monthly Amount (€)</Label>
                <Input
                  type="number"
                  value={monthlyAmount}
                  onChange={(e) => setMonthlyAmount(e.target.value)}
                  placeholder="150"
                />
              </div>
              <div className="space-y-2">
                <Label>Program Start Date</Label>
                <Input
                  type="date"
                  value={programStartDate}
                  onChange={(e) => setProgramStartDate(e.target.value)}
                />
              </div>
            </div>

            {selectedUser && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium mb-2">Monthly Billing Preview</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Month 1 (Start Date):</span>
                    <span className="font-medium">€{monthlyAmount}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Month 2:</span>
                    <span>€{monthlyAmount} (auto-generated)</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Month 3:</span>
                    <span>€{monthlyAmount} (auto-generated)</span>
                  </div>
                  <div className="border-t pt-2 space-y-1">
                    <div className="flex justify-between font-medium">
                      <span>Total Program Cost:</span>
                      <span>€{(parseFloat(monthlyAmount) * 3).toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Invoices generated monthly. Customer can cancel anytime.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button 
              onClick={generateSubscriptionInvoices}
              disabled={loading || !selectedUser || !programStartDate}
              className="w-full"
            >
              {loading ? "Starting Subscription..." : "Start Monthly Subscription"}
            </Button>
          </CardContent>
        </Card>

        {/* Billing Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Complete Program Users Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {completeProgramUsers?.map((user) => {
                const billingStatus = billingStatuses[user.uid];
                const hasOverdue = billingStatus?.overdueInvoices?.length > 0;
                const hasUpcoming = billingStatus?.upcomingInvoices?.length > 0;
                
                return (
                  <div key={user.uid} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{user.name}</h4>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {hasOverdue && (
                          <Badge variant="destructive" className="text-xs">
                            {billingStatus.overdueInvoices.length} Overdue
                          </Badge>
                        )}
                        {hasUpcoming && (
                          <Badge variant="secondary" className="text-xs">
                            {billingStatus.upcomingInvoices.length} Upcoming
                          </Badge>
                        )}
                        {!hasOverdue && !hasUpcoming && (
                          <Badge variant="outline" className="text-xs">
                            Up to Date
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                      <div>
                        <span>Start Date:</span>
                        <p className="font-medium text-foreground">
                          {formatDate(user.programStartDate)}
                        </p>
                      </div>
                      <div>
                        <span>End Date:</span>
                        <p className="font-medium text-foreground">
                          {formatDate(user.programEndDate)}
                        </p>
                      </div>
                    </div>

                    {hasOverdue && (
                      <Alert className="mt-3 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-sm">
                          This user has overdue payments that require attention.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                );
              })}
              
              {!completeProgramUsers?.length && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No complete program users found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Billing Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {completeProgramUsers?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(billingStatuses).filter(status => 
                  status?.overdueInvoices?.length === 0 && status?.upcomingInvoices?.length === 0
                ).length}
              </div>
              <div className="text-sm text-muted-foreground">Up to Date</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {Object.values(billingStatuses).filter(status => 
                  status?.upcomingInvoices?.length > 0
                ).length}
              </div>
              <div className="text-sm text-muted-foreground">Upcoming Bills</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {Object.values(billingStatuses).filter(status => 
                  status?.overdueInvoices?.length > 0
                ).length}
              </div>
              <div className="text-sm text-muted-foreground">Overdue</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}