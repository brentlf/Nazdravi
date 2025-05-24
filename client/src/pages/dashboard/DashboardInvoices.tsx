import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { where, orderBy } from "firebase/firestore";
import { Receipt, CreditCard, Calendar, Eye, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";
import type { Invoice } from "@shared/firebase-schema";

export default function DashboardInvoices() {
  const { effectiveUser: user } = useAuth();

  // Fetch client's invoices by multiple possible user identifiers
  const { data: invoicesByUserId, loading: loadingById } = useFirestoreCollection<Invoice>("invoices", 
    user?.uid ? [where("userId", "==", user.uid)] : []
  );
  
  const { data: invoicesByEmail, loading: loadingByEmail } = useFirestoreCollection<Invoice>("invoices", 
    user?.email ? [where("clientEmail", "==", user.email)] : []
  );

  // Combine and deduplicate invoices
  const allInvoices = [
    ...(invoicesByUserId || []),
    ...(invoicesByEmail || [])
  ];
  
  const invoices = allInvoices.filter((invoice, index, self) => 
    index === self.findIndex(i => i.invoiceNumber === invoice.invoiceNumber)
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const loading = loadingById || loadingByEmail;

  const handlePayInvoice = (invoice: Invoice) => {
    if (invoice.paymentUrl) {
      window.open(invoice.paymentUrl, '_blank');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-orange-600">Pending Payment</Badge>;
      case "paid":
        return <Badge variant="default" className="bg-green-600">Paid</Badge>;
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const pendingInvoices = invoices?.filter(invoice => invoice.status === "pending") || [];
  const totalPending = pendingInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);

  return (
    <div className="min-h-screen py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Back to Dashboard */}
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Invoices</h1>
          <p className="text-gray-600 dark:text-gray-400">View and pay your consultation invoices</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Invoices</p>
                  <p className="text-2xl font-bold">{invoices?.length || 0}</p>
                </div>
                <Receipt className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Payment</p>
                  <p className="text-2xl font-bold">{pendingInvoices.length}</p>
                </div>
                <CreditCard className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amount Due</p>
                  <p className="text-2xl font-bold">€{totalPending.toFixed(2)}</p>
                </div>
                <CreditCard className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices List */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice History</CardTitle>
          </CardHeader>
          <CardContent>
            {!invoices || invoices.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No invoices yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your consultation invoices will appear here after your sessions
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div 
                    key={invoice.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {invoice.invoiceNumber}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {invoice.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-500">
                              Session: {new Date(invoice.sessionDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-lg">€{invoice.amount.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">
                          Due: {new Date(invoice.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getStatusBadge(invoice.status)}
                        
                        {invoice.status === "pending" && invoice.paymentUrl && (
                          <Button 
                            onClick={() => handlePayInvoice(invoice)}
                            size="sm"
                            className="bg-primary-600 hover:bg-primary-700"
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Pay Now
                          </Button>
                        )}
                        
                        {invoice.status === "paid" && (
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View Receipt
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}