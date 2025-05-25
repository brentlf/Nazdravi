import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Euro, Users, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { where, orderBy } from "firebase/firestore";
import type { User, Invoice } from "@/shared/firebase-schema";

export default function AdminSubscriptions() {
  const { toast } = useToast();
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [invoiceAmount, setInvoiceAmount] = useState<string>("300"); // Default monthly amount
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Fetch complete program users
  const { data: completeProgramUsers } = useFirestoreCollection<User>("users", [
    where("servicePlan", "==", "complete-program"),
    orderBy("name", "asc")
  ]);

  // Fetch subscription invoices
  const { data: subscriptionInvoices } = useFirestoreCollection<Invoice>("invoices", [
    where("invoiceType", "==", "subscription"),
    orderBy("createdAt", "desc")
  ]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleCreateSubscriptionInvoice = async () => {
    if (!selectedUser || !invoiceAmount) {
      toast({
        title: "Missing Information",
        description: "Please select a user and enter an amount.",
        variant: "destructive",
      });
      return;
    }

    const user = completeProgramUsers?.find(u => u.uid === selectedUser);
    if (!user) {
      toast({
        title: "User Not Found",
        description: "Selected user not found.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingInvoice(true);

    try {
      const invoiceData = {
        userId: user.uid,
        clientName: user.name,
        clientEmail: user.email,
        amount: parseFloat(invoiceAmount),
        month: selectedMonth,
        year: selectedYear,
      };

      const response = await fetch('/api/subscription-invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Subscription Invoice Created",
          description: `Monthly invoice for ${monthNames[selectedMonth - 1]} ${selectedYear} has been created successfully.`,
        });
        setSelectedUser("");
        setInvoiceAmount("300");
      } else if (response.status === 409) {
        toast({
          title: "Invoice Already Exists",
          description: "A subscription invoice already exists for this month/year.",
          variant: "destructive",
        });
      } else {
        throw new Error('Failed to create subscription invoice');
      }
    } catch (error) {
      toast({
        title: "Failed to Create Invoice",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-orange-600">Pending</Badge>;
      case "paid":
        return <Badge variant="default" className="bg-green-600">Paid</Badge>;
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCurrentMonthStats = () => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    const currentMonthInvoices = subscriptionInvoices?.filter(
      invoice => invoice.subscriptionMonth === currentMonth && invoice.subscriptionYear === currentYear
    ) || [];

    const totalAmount = currentMonthInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
    const paidAmount = currentMonthInvoices
      .filter(invoice => invoice.status === 'paid')
      .reduce((sum, invoice) => sum + invoice.amount, 0);

    return {
      total: currentMonthInvoices.length,
      totalAmount,
      paidAmount,
      pendingAmount: totalAmount - paidAmount,
    };
  };

  const stats = getCurrentMonthStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Subscription Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage monthly billing for Complete Program clients
          </p>
        </div>
      </div>

      {/* Current Month Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  This Month's Invoices
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.total}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Amount
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  €{stats.totalAmount.toFixed(2)}
                </p>
              </div>
              <Euro className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Paid Amount
                </p>
                <p className="text-2xl font-bold text-green-600">
                  €{stats.paidAmount.toFixed(2)}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm font-bold">✓</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pending Amount
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  €{stats.pendingAmount.toFixed(2)}
                </p>
              </div>
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-sm font-bold">⏳</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create New Subscription Invoice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Monthly Subscription Invoice
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="user-select">Select Client</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a complete program client" />
                </SelectTrigger>
                <SelectContent>
                  {completeProgramUsers?.map((user) => (
                    <SelectItem key={user.uid} value={user.uid}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="month-select">Month</Label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((month, index) => (
                    <SelectItem key={index} value={(index + 1).toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="year-select">Year</Label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Amount (EUR)</Label>
              <Input
                id="amount"
                type="number"
                value={invoiceAmount}
                onChange={(e) => setInvoiceAmount(e.target.value)}
                placeholder="300.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <Button 
            onClick={handleCreateSubscriptionInvoice}
            disabled={isCreatingInvoice || !selectedUser || !invoiceAmount}
            className="w-full md:w-auto"
          >
            {isCreatingInvoice ? "Creating Invoice..." : "Create Subscription Invoice"}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Subscription Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Subscription Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subscriptionInvoices && subscriptionInvoices.length > 0 ? (
              <div className="grid gap-4">
                {subscriptionInvoices.slice(0, 10).map((invoice) => (
                  <div 
                    key={invoice.id} 
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {invoice.clientName}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {invoice.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Invoice: {invoice.invoiceNumber}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        €{invoice.amount.toFixed(2)}
                      </p>
                      {getStatusBadge(invoice.status)}
                    </div>

                    {invoice.status === 'pending' && invoice.paymentUrl && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(invoice.paymentUrl, '_blank')}
                        className="ml-4"
                      >
                        View Payment
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No subscription invoices yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Create your first monthly subscription invoice above.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}