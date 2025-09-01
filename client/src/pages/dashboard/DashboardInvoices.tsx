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
      case "unpaid":
      case "pending":
        return <Badge variant="outline" className="text-orange-600">Pending Payment</Badge>;
      case "paid":
        return <Badge variant="default" className="bg-green-600">Paid</Badge>;
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      case "cancelled":
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status || 'Unknown'}</Badge>;
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

  const pendingInvoices = invoices?.filter(invoice => invoice.status === "unpaid" || invoice.status === "pending") || [];
  const totalPending = pendingInvoices.reduce((sum, invoice) => sum + (invoice.amount || 0), 0);

  return (
    <div className="h-[calc(100vh-8rem)] bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6 py-4 h-full flex flex-col">
        {/* Compact Header with Back Navigation */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">My Invoices</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">View and pay your consultation invoices</p>
            </div>
          </div>
        </div>

        {/* Compact Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-4 flex-shrink-0">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Total</p>
                  <p className="text-lg font-bold">{invoices?.length || 0}</p>
                </div>
                <Receipt className="w-5 h-5 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Pending</p>
                  <p className="text-lg font-bold">{pendingInvoices.length}</p>
                </div>
                <CreditCard className="w-5 h-5 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Amount Due</p>
                  <p className="text-lg font-bold">€{totalPending.toFixed(2)}</p>
                </div>
                <CreditCard className="w-5 h-5 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Invoice List */}
        <Card className="flex-1 min-h-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Invoice History</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-3">
            {!invoices || invoices.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <Receipt className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No invoices yet
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your consultation invoices will appear here
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full overflow-y-auto space-y-2">
                {invoices.map((invoice) => (
                  <div 
                    key={invoice.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {invoice.invoiceNumber}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {invoice.description}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {invoice.sessionDate ? new Date(invoice.sessionDate).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-base">€{(invoice.amount || 0).toFixed(2)}</p>
                        <p className="text-xs text-gray-500">
                          Due: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getStatusBadge(invoice.status)}
                        
                        {(invoice.status === "unpaid" || invoice.status === "pending") && (
                          <Button 
                            onClick={() => handlePayInvoice(invoice)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm"
                            disabled={!invoice.paymentUrl}
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            {invoice.paymentUrl ? 'Pay Now' : 'Payment Link Unavailable'}
                          </Button>
                        )}
                        
                        {invoice.status === "paid" && (
                          <Link href={`/invoice/${invoice.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View Receipt
                            </Button>
                          </Link>
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