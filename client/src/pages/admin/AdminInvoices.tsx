import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { where, orderBy, limit } from "firebase/firestore";
import { Receipt, Plus, Eye, Send, DollarSign, ArrowLeft, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";
import type { Invoice, Appointment } from "@shared/firebase-schema";

export default function AdminInvoices() {
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [includeNoShowPenalty, setIncludeNoShowPenalty] = useState(false);
  const [includeLateRescheduleFee, setIncludeLateRescheduleFee] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch invoices
  const { data: invoices, loading: loadingInvoices } = useFirestoreCollection<Invoice>("invoices", [
    orderBy("createdAt", "desc"),
    limit(50)
  ]);

  // Fetch appointments that can be invoiced (completed or no-show)
  const { data: allAppointments } = useFirestoreCollection<Appointment>("appointments", [
    orderBy("date", "desc"),
    limit(20)
  ]);

  // Filter appointments that can be invoiced (completed or no-show)
  const completedAppointments = allAppointments?.filter(apt => 
    apt.status === "done" || apt.status === "no-show"
  ) || [];

  // Check if an appointment already has an invoice
  const hasExistingInvoice = (appointmentId: string | undefined) => {
    if (!appointmentId) return false;
    return invoices?.some(invoice => invoice.appointmentId === appointmentId);
  };

  // Intelligent penalty detection based on appointment data and business policy
  const detectApplicablePenalties = (appointment: Appointment) => {
    let shouldIncludeNoShow = false;
    let shouldIncludeLateReschedule = false;

    // Check for no-show penalty (if appointment is marked as no-show)
    if (appointment.status === 'no-show') {
      shouldIncludeNoShow = true;
    }

    // Check for late reschedule fee based on appointment status or comments
    if (appointment.status === 'reschedule_requested' || 
        appointment.status === 'cancelled_reschedule' ||
        appointment.comments?.toLowerCase().includes('late reschedule') ||
        appointment.comments?.toLowerCase().includes('short notice')) {
      shouldIncludeLateReschedule = true;
    }

    return { shouldIncludeNoShow, shouldIncludeLateReschedule };
  };

  // Calculate invoice totals including penalties
  const calculateInvoiceTotal = () => {
    if (!selectedAppointment) return 0;
    
    const sessionCost = selectedAppointment.type === "Initial" ? 95 : 75;
    let total = sessionCost;
    
    if (includeNoShowPenalty) {
      // No-show penalty is 50% of session cost
      total += sessionCost * 0.5;
    }
    
    if (includeLateRescheduleFee) {
      // Late reschedule fee is €5
      total += 5;
    }
    
    return total;
  };

  const handleCreateInvoice = async (appointmentData: Appointment) => {
    try {
      const sessionCost = appointmentData.type === "Initial" ? 95 : 75;
      let totalAmount = sessionCost;
      let description = `Nutrition Consultation - ${appointmentData.type}`;
      
      // Add penalty amounts if selected
      if (includeNoShowPenalty) {
        const penaltyAmount = sessionCost * 0.5;
        totalAmount += penaltyAmount;
        description += ` + No-Show Penalty (€${penaltyAmount.toFixed(2)})`;
      }
      
      if (includeLateRescheduleFee) {
        totalAmount += 5;
        description += ` + Late Reschedule Fee (€5.00)`;
      }

      const invoiceData = {
        appointmentId: appointmentData.id,
        userId: appointmentData.userId,
        clientName: appointmentData.name,
        clientEmail: appointmentData.email,
        amount: totalAmount,
        description: description,
        sessionDate: appointmentData.date,
        sessionType: appointmentData.type,
        includeNoShowPenalty,
        includeLateRescheduleFee,
      };

      const response = await fetch('/api/invoices/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Invoice Created Successfully",
          description: `Invoice ${result.invoice.invoiceNumber} has been created and payment link generated.`,
        });
        // Reset all states
        setIsCreatingInvoice(false);
        setSelectedAppointment(null);
        setIncludeNoShowPenalty(false);
        setIncludeLateRescheduleFee(false);
      } else if (response.status === 409) {
        const errorData = await response.json();
        toast({
          title: "Invoice Already Exists",
          description: "An invoice has already been created for this appointment.",
          variant: "destructive",
        });
        // Reset all states
        setIsCreatingInvoice(false);
        setSelectedAppointment(null);
        setIncludeNoShowPenalty(false);
        setIncludeLateRescheduleFee(false);
      } else {
        throw new Error('Failed to create invoice');
      }
    } catch (error) {
      toast({
        title: "Failed to Create Invoice",
        description: "Please try again later.",
        variant: "destructive",
      });
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

  if (loadingInvoices) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back to Dashboard */}
      <div className="mb-6">
        <Link href="/admin">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Dashboard
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Invoice Management</h1>
          <p className="text-muted-foreground">Create and manage client invoices</p>
        </div>
        
        <Dialog open={isCreatingInvoice} onOpenChange={setIsCreatingInvoice}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div>
                <Label>Select Completed Session</Label>
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                  {completedAppointments?.map((appointment) => {
                    const alreadyInvoiced = hasExistingInvoice(appointment.id);
                    return (
                      <div 
                        key={appointment.id}
                        className={`p-3 border rounded-lg transition-colors ${
                          alreadyInvoiced 
                            ? 'border-gray-200 bg-gray-50 opacity-60' 
                            : selectedAppointment?.id === appointment.id 
                              ? 'border-primary bg-primary-50 cursor-pointer' 
                              : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                        }`}
                        onClick={() => {
                          if (!alreadyInvoiced) {
                            setSelectedAppointment(appointment);
                            // Automatically detect and set applicable penalties
                            const { shouldIncludeNoShow, shouldIncludeLateReschedule } = detectApplicablePenalties(appointment);
                            setIncludeNoShowPenalty(shouldIncludeNoShow);
                            setIncludeLateRescheduleFee(shouldIncludeLateReschedule);
                          }
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{appointment.name}</p>
                              {alreadyInvoiced && (
                                <Badge variant="secondary" className="text-xs">
                                  Already Invoiced
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{appointment.email}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(appointment.date).toLocaleDateString()} - {appointment.type}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge 
                                variant={appointment.status === 'no-show' ? 'destructive' : 'secondary'}
                                className="text-xs"
                              >
                                {appointment.status === 'no-show' ? 'No-Show' : 'Completed'}
                              </Badge>
                              {appointment.status === 'no-show' && (
                                <span className="text-xs text-red-600">Penalty Applied</span>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline">
                            {appointment.type === "Initial" ? "€95" : "€75"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedAppointment && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium flex items-center gap-2">
                    <Receipt className="w-4 h-4" />
                    Invoice Preview & Penalty Controls
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Client:</span>
                      <p className="font-medium">{selectedAppointment.name}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <p className="font-medium">{selectedAppointment.email}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Session Type:</span>
                      <p className="font-medium">{selectedAppointment.type}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Session Date:</span>
                      <p className="font-medium">{new Date(selectedAppointment.date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Invoice Breakdown */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Invoice Breakdown</h4>
                    <div className="space-y-2">
                      {/* Base Session Cost */}
                      <div className="flex justify-between items-center">
                        <span>{selectedAppointment.type} Session</span>
                        <Badge variant="outline">€{selectedAppointment.type === "Initial" ? "95" : "75"}</Badge>
                      </div>

                      {/* No-Show Penalty Control */}
                      <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
                        <div className="flex items-center space-x-3">
                          <Checkbox 
                            id="no-show-penalty" 
                            checked={includeNoShowPenalty}
                            onCheckedChange={(checked) => setIncludeNoShowPenalty(checked === true)}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <label 
                              htmlFor="no-show-penalty" 
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              No-Show Penalty (50%)
                            </label>
                            <p className="text-xs text-muted-foreground">
                              Auto-detected from appointment status
                            </p>
                          </div>
                        </div>
                        {includeNoShowPenalty && (
                          <Badge variant="destructive">
                            €{selectedAppointment.type === "Initial" ? "47.50" : "37.50"}
                          </Badge>
                        )}
                      </div>

                      {/* Late Reschedule Fee Control */}
                      <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
                        <div className="flex items-center space-x-3">
                          <Checkbox 
                            id="late-reschedule-fee" 
                            checked={includeLateRescheduleFee}
                            onCheckedChange={(checked) => setIncludeLateRescheduleFee(checked === true)}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <label 
                              htmlFor="late-reschedule-fee" 
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Late Reschedule Fee
                            </label>
                            <p className="text-xs text-muted-foreground">
                              Within 4 working hours policy
                            </p>
                          </div>
                        </div>
                        {includeLateRescheduleFee && (
                          <Badge variant="destructive">€5.00</Badge>
                        )}
                      </div>

                      {/* Total Amount */}
                      <div className="flex justify-between items-center pt-3 border-t font-semibold">
                        <span>Total Amount</span>
                        <Badge variant="default" className="text-base px-3 py-1">
                          €{calculateInvoiceTotal().toFixed(2)}
                        </Badge>
                      </div>

                      {/* Smart Detection Notice */}
                      {(includeNoShowPenalty || includeLateRescheduleFee) && (
                        <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-orange-800">
                            <p className="font-medium">Penalties Auto-Detected</p>
                            <p className="text-xs mt-1">
                              Based on appointment data and policy rules. You can adjust before creating the invoice.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleCreateInvoice(selectedAppointment)}
                    disabled={isCreatingInvoice}
                    className="w-full"
                  >
                    {isCreatingInvoice ? "Creating Invoice..." : `Create Invoice - €${calculateInvoiceTotal().toFixed(2)}`}
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Penalty Policy Overview */}
      <Card className="mb-8 border-orange-200 bg-orange-50 dark:bg-orange-950/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
            <Receipt className="w-5 h-5" />
            Penalty & Fee Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-orange-900 dark:text-orange-100">Session Rates</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Initial Consultation:</span>
                  <Badge variant="outline" className="bg-white">€95</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Follow-up Session:</span>
                  <Badge variant="outline" className="bg-white">€75</Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-orange-900 dark:text-orange-100">No-Show Penalties</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Initial (50% penalty):</span>
                  <Badge variant="destructive" className="bg-red-100 text-red-800">€47.50</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Follow-up (50% penalty):</span>
                  <Badge variant="destructive" className="bg-red-100 text-red-800">€37.50</Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-orange-900 dark:text-orange-100">Late Reschedule Fee</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Within 4 working hours:</span>
                  <Badge variant="destructive" className="bg-red-100 text-red-800">€5</Badge>
                </div>
                <p className="text-xs text-orange-700 dark:text-orange-300 mt-2">
                  Auto-generated from Admin → Appointments → "Mark No-Show"
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold">{invoices?.length || 0}</p>
              </div>
              <Receipt className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Payment</p>
                <p className="text-2xl font-bold">
                  {invoices?.filter(inv => inv.status === 'pending').length || 0}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Paid This Month</p>
                <p className="text-2xl font-bold">
                  {invoices?.filter(inv => 
                    inv.status === 'paid' && 
                    new Date(inv.createdAt).getMonth() === new Date().getMonth()
                  ).length || 0}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue This Month</p>
                <p className="text-2xl font-bold">
                  €{invoices?.filter(inv => 
                    inv.status === 'paid' && 
                    new Date(inv.createdAt).getMonth() === new Date().getMonth()
                  ).reduce((sum, inv) => sum + inv.amount, 0)?.toFixed(2) || '0.00'}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices && invoices.length > 0 ? (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-muted-foreground">{invoice.clientName}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>{invoice.description}</p>
                        <p>{new Date(invoice.sessionDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">€{invoice.amount.toFixed(2)}</p>
                      {getStatusBadge(invoice.status)}
                    </div>
                    
                    <div className="flex gap-2">
                      {invoice.paymentUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/pay-invoice/${invoice.invoiceNumber}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Link>
                        </Button>
                      )}
                      {invoice.status === 'pending' && (
                        <Button variant="outline" size="sm">
                          <Send className="w-4 h-4 mr-1" />
                          Send Reminder
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No invoices created yet</p>
              <p className="text-sm text-muted-foreground">Create your first invoice from a completed session</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}