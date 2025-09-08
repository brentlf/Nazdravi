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
      <div className="dashboard-viewport bg-background">
        <div className="container mx-auto px-3 sm:px-4 px-safe py-2">
          <div className="animate-pulse space-y-2">
            <div className="h-6 bg-muted rounded w-1/4"></div>
            <div className="h-48 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const pendingInvoices = invoices?.filter(invoice => invoice.status === "unpaid" || invoice.status === "pending") || [];
  const totalPending = pendingInvoices.reduce((sum, invoice) => sum + (invoice.amount || 0), 0);

  return (
    <div className="dashboard-viewport bg-background">
      <div className="container mx-auto px-3 sm:px-4 px-safe py-2 flex flex-col h-full">
        {/* Compact Header with Back Navigation */}
        <div className="flex items-center justify-between mb-2 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="flex items-center gap-1 text-xs px-2 py-1">
                <ArrowLeft className="w-3 h-3" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-foreground">My Invoices</h1>
              <p className="text-xs text-muted-foreground">View and pay your consultation invoices</p>
            </div>
          </div>
        </div>

        {/* Compact Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-2 flex-shrink-0">
          <Card>
            <CardContent className="p-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Total</p>
                  <p className="text-sm font-bold">{invoices?.length || 0}</p>
                </div>
                <Receipt className="w-4 h-4 text-info" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Pending</p>
                  <p className="text-sm font-bold">{pendingInvoices.length}</p>
                </div>
                <CreditCard className="w-4 h-4 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Amount Due</p>
                  <p className="text-sm font-bold">€{totalPending.toFixed(2)}</p>
                </div>
                <CreditCard className="w-4 h-4 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Invoice List */}
        <Card className="flex-1 min-h-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Invoice History</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-2">
            {!invoices || invoices.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <Receipt className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <h3 className="text-sm font-medium text-foreground mb-1">
                    No invoices yet
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Your consultation invoices will appear here
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full overflow-y-auto space-y-1">
                {invoices.map((invoice) => (
                  <div 
                    key={invoice.id}
                    className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-xs font-medium text-foreground">
                            {invoice.invoiceNumber}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {invoice.description}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {invoice.sessionDate ? new Date(invoice.sessionDate).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold text-sm">€{(invoice.amount || 0).toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">
                          Due: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {getStatusBadge(invoice.status)}
                        
                        {(invoice.status === "unpaid" || invoice.status === "pending") && (
                          <Button 
                            onClick={() => handlePayInvoice(invoice)}
                            size="sm"
                            className="bg-success hover:brightness-110 text-primary-foreground font-medium shadow-sm text-xs px-2 py-1"
                            disabled={!invoice.paymentUrl}
                          >
                            <CreditCard className="w-3 h-3 mr-1" />
                            {invoice.paymentUrl ? 'Pay' : 'Unavailable'}
                          </Button>
                        )}
                        
                        {invoice.status === "paid" && (
                          <Link href={`/invoice/${invoice.id}`}>
                            <Button variant="outline" size="sm" className="text-xs px-2 py-1">
                              <Eye className="w-3 h-3 mr-1" />
                              View
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