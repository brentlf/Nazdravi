import React from "react";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download, Eye, Calendar, User, Euro } from "lucide-react";
import { Link } from "wouter";
import { useFirestoreDocument } from "@/hooks/useFirestore";
import { doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const InvoiceView: React.FC = () => {
  const [, params] = useRoute("/invoice/:id");
  const invoiceId = params?.id;

  const { data: invoice, loading, error } = useFirestoreDocument(
    invoiceId ? `invoices/${invoiceId}` : "",
    {}
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Invoice Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p>The requested invoice could not be found.</p>
            <Link href="/admin/invoices">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Invoices
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `€${amount.toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'pending': return 'secondary';
      case 'overdue': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/invoices">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Invoices
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Invoice {invoice.invoiceNumber}</h1>
            <p className="text-muted-foreground">
              Created on {formatDate(invoice.createdAt)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={getStatusColor(invoice.status)} className="text-sm">
            {invoice.status.toUpperCase()}
          </Badge>
          {invoice.pdfUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(invoice.pdfUrl, '_blank')}
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          )}
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Invoice Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium">Name:</span>
                <span className="ml-2">{invoice.clientName}</span>
              </div>
              <div>
                <span className="font-medium">Email:</span>
                <span className="ml-2">{invoice.clientEmail}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Invoice Number:</span>
                  <div className="text-lg">{invoice.invoiceNumber}</div>
                </div>
                <div>
                  <span className="font-medium">Invoice Type:</span>
                  <div className="capitalize">{invoice.invoiceType || 'Invoice'}</div>
                </div>
                <div>
                  <span className="font-medium">Service Plan:</span>
                  <div className="capitalize">{invoice.servicePlan || 'Standard'}</div>
                </div>
                <div>
                  <span className="font-medium">Currency:</span>
                  <div className="uppercase">{invoice.currency || 'EUR'}</div>
                </div>
              </div>
              
              {invoice.description && (
                <div>
                  <span className="font-medium">Description:</span>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">{invoice.description}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Line Items */}
          {invoice.items && invoice.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Line Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {invoice.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                      <span>{item.description}</span>
                      <span className="font-medium">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="w-5 h-5" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(invoice.amount || invoice.totalAmount || 0)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>{formatCurrency(invoice.amount || invoice.totalAmount || 0)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Important Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium">Created:</span>
                <div>{formatDate(invoice.createdAt)}</div>
              </div>
              {invoice.dueDate && (
                <div>
                  <span className="font-medium">Due Date:</span>
                  <div>{formatDate(invoice.dueDate)}</div>
                </div>
              )}
              {invoice.updatedAt && (
                <div>
                  <span className="font-medium">Last Updated:</span>
                  <div>{formatDate(invoice.updatedAt)}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reissue Information */}
          {invoice.isReissued && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-800 text-sm">Reissued Invoice</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {invoice.reissueReason && (
                  <div>
                    <span className="font-medium">Reason:</span>
                    <div className="text-sm">{invoice.reissueReason}</div>
                  </div>
                )}
                {invoice.originalAmount && (
                  <div>
                    <span className="font-medium">Original Amount:</span>
                    <div className="text-sm">{formatCurrency(invoice.originalAmount)}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;