import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { where, orderBy, limit } from "firebase/firestore";
import { Receipt, Plus, Eye, Send, DollarSign, ArrowLeft, AlertTriangle, RefreshCw, Clock, Ban, CheckCircle, Euro } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";
import type { Invoice, Appointment } from "@shared/firebase-schema";

export default function AdminInvoices() {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [includeNoShowPenalty, setIncludeNoShowPenalty] = useState(false);
  const [includeLateRescheduleFee, setIncludeLateRescheduleFee] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch invoices
  const { data: invoices, loading: loadingInvoices } = useFirestoreCollection<Invoice>("invoices", [
    orderBy("createdAt", "desc"),
    limit(100) // Increased limit for hundreds of invoices
  ]);

  // Fetch appointments that can be invoiced
  const { data: allAppointments } = useFirestoreCollection<Appointment>("appointments", [
    orderBy("date", "desc"),
    limit(50)
  ]);

  // Check if an appointment already has an invoice
  const hasExistingInvoice = (appointmentId: string | undefined) => {
    if (!appointmentId) return false;
    return invoices?.some(invoice => invoice.appointmentId === appointmentId);
  };

  // Detect invoice type based on description and amount patterns
  const getInvoiceTypeIcon = (invoice: Invoice) => {
    const desc = invoice.description?.toLowerCase() || '';
    const isNoShow = desc.includes('no-show') || desc.includes('penalty');
    const isLateReschedule = desc.includes('late') && desc.includes('reschedule');
    const isCustom = desc.includes('reissued') || desc.includes('custom');
    
    if (isNoShow) return <Ban className="w-4 h-4 text-red-500" />;
    if (isLateReschedule) return <Clock className="w-4 h-4 text-orange-500" />;
    if (isCustom) return <RefreshCw className="w-4 h-4 text-purple-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-orange-600 text-xs px-1 py-0">Pending</Badge>;
      case "paid":
        return <Badge variant="default" className="text-green-600 text-xs px-1 py-0">Paid</Badge>;
      case "overdue":
        return <Badge variant="destructive" className="text-xs px-1 py-0">Overdue</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs px-1 py-0">{status}</Badge>;
    }
  };

  // Filter appointments that could potentially need invoicing
  const invoiceableAppointments = allAppointments?.filter(apt => 
    apt.status === 'done' || apt.status === 'no-show' || apt.status === 'cancelled' || apt.status === 'confirmed'
  ) || [];

  // Detect applicable penalties for an appointment
  const detectApplicablePenalties = (appointment: Appointment) => {
    const shouldIncludeNoShow = appointment.status === 'no-show';
    const shouldIncludeLateReschedule = appointment.status === 'cancelled'; // Simplified logic
    return { shouldIncludeNoShow, shouldIncludeLateReschedule };
  };

  // Calculate invoice total
  const calculateInvoiceTotal = () => {
    if (!selectedAppointment) return 0;
    
    let total = 0;
    
    // Session cost (€0 for no-show, full price for others)
    if (selectedAppointment.status !== 'no-show') {
      total += selectedAppointment.type === "Initial" ? 95 : 75;
    }
    
    // Add penalties
    if (includeNoShowPenalty) {
      total += selectedAppointment.type === "Initial" ? 47.50 : 37.50; // 50% penalty
    }
    
    if (includeLateRescheduleFee) {
      total += 5; // €5 late reschedule fee
    }
    
    return total;
  };

  // Handle invoice creation
  const handleCreateInvoice = async (appointmentData: Appointment) => {
    if (!appointmentData || !user) return;
    
    setIsCreatingInvoice(true);
    
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId: appointmentData.id,
          userId: appointmentData.userId,
          clientName: appointmentData.name,
          clientEmail: appointmentData.email,
          sessionType: appointmentData.type,
          sessionDate: appointmentData.date,
          sessionTime: appointmentData.timeslot,
          amount: calculateInvoiceTotal(),
          includeNoShowPenalty,
          includeLateRescheduleFee,
          appointmentStatus: appointmentData.status
        }),
      });

      if (response.ok) {
        toast({
          title: "Invoice Created",
          description: `Invoice for €${calculateInvoiceTotal().toFixed(2)} has been created successfully.`,
        });
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
      setIsCreatingInvoice(false);
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

      {/* Header with Create Invoice */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Invoice Management</h1>
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
                <Label>Select Appointment for Invoice</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose any appointment that requires billing (completed sessions, penalties, fees, etc.)
                </p>
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                  {invoiceableAppointments?.map((appointment) => {
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
                                variant={
                                  appointment.status === 'no-show' ? 'destructive' : 
                                  appointment.status === 'done' ? 'default' :
                                  appointment.status === 'cancelled' ? 'outline' : 'secondary'
                                }
                                className="text-xs"
                              >
                                {appointment.status === 'no-show' ? 'No-Show' : 
                                 appointment.status === 'done' ? 'Completed' :
                                 appointment.status === 'cancelled' ? 'Cancelled' :
                                 appointment.status === 'confirmed' ? 'Confirmed' :
                                 appointment.status}
                              </Badge>
                              
                              {/* Show billing type indicator */}
                              {appointment.status === 'no-show' && (
                                <span className="text-xs text-red-600 font-medium">50% Penalty Fee</span>
                              )}
                              {appointment.status === 'done' && (
                                <span className="text-xs text-green-600 font-medium">Session Payment</span>
                              )}
                              {appointment.status === 'cancelled' && (
                                <span className="text-xs text-orange-600 font-medium">Potential Reschedule Fee</span>
                              )}
                              {appointment.status === 'confirmed' && (
                                <span className="text-xs text-blue-600 font-medium">Advance Billing</span>
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
                      <span className="text-muted-foreground">Session Type:</span>
                      <p className="font-medium">{selectedAppointment.type}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Date:</span>
                      <p className="font-medium">{new Date(selectedAppointment.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <p className="font-medium">{selectedAppointment.status}</p>
                    </div>
                  </div>

                  {/* Session Cost */}
                  <div className="flex justify-between items-center py-2 border-b">
                    <span>Session Cost</span>
                    <Badge variant="outline">
                      {selectedAppointment.status === 'no-show' 
                        ? "€0.00 (No-Show)" 
                        : `€${selectedAppointment.type === "Initial" ? "95.00" : "75.00"}`}
                    </Badge>
                  </div>

                  {/* No-Show Penalty Control */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
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
                          Applied when client doesn't attend
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
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
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
              )}
              
              {selectedAppointment && (
                <Button 
                  onClick={() => handleCreateInvoice(selectedAppointment)}
                  disabled={isCreatingInvoice}
                  className="w-full"
                >
                  {isCreatingInvoice ? "Creating Invoice..." : `Create Invoice - €${calculateInvoiceTotal().toFixed(2)}`}
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

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

      {/* Ultra-Compact Invoice Table - Optimized for hundreds of invoices */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">All Invoices ({invoices?.length || 0})</CardTitle>
          <p className="text-sm text-muted-foreground">Ultra-compact view optimized for managing hundreds of invoices efficiently</p>
        </CardHeader>
        <CardContent className="p-0">
          {invoices && invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-12 text-center">Type</TableHead>
                    <TableHead className="w-24">Invoice #</TableHead>
                    <TableHead className="w-48">Client</TableHead>
                    <TableHead className="w-32">Date</TableHead>
                    <TableHead className="w-16 text-right">Amount</TableHead>
                    <TableHead className="w-20 text-center">Status</TableHead>
                    <TableHead className="w-32 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-muted/50 h-12">
                      <TableCell className="text-center p-2">
                        {getInvoiceTypeIcon(invoice)}
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="font-mono text-xs">{invoice.invoiceNumber}</div>
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="font-medium text-sm truncate">{invoice.clientName}</div>
                        <div className="text-xs text-muted-foreground truncate">{invoice.clientEmail}</div>
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="text-xs">
                          {new Date(invoice.sessionDate || invoice.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit'
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="p-2 text-right">
                        <div className="font-semibold text-sm">€{invoice.amount.toFixed(2)}</div>
                      </TableCell>
                      <TableCell className="p-2 text-center">
                        {getStatusBadge(invoice.status)}
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="flex gap-1 justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => window.open(invoice.stripePaymentUrl, '_blank')}
                            title="View Invoice"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          {invoice.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => window.open(invoice.stripePaymentUrl, '_blank')}
                              title="Send Reminder"
                            >
                              <Send className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No invoices found. Create your first invoice to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}