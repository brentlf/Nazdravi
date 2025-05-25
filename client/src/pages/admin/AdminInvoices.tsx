import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { orderBy, limit } from "firebase/firestore";
import { useQueryClient } from "@tanstack/react-query";
import { Receipt, Plus, Eye, Send, DollarSign, ArrowLeft, AlertTriangle, RefreshCw, Clock, Ban, CheckCircle, FileText, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";
import type { Invoice, Appointment } from "@shared/firebase-schema";

export default function AdminInvoices() {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [includeSessionRate, setIncludeSessionRate] = useState(false);
  const [includeNoShowPenalty, setIncludeNoShowPenalty] = useState(false);
  const [includeLateRescheduleFee, setIncludeLateRescheduleFee] = useState(false);
  const [useCustomAmount, setUseCustomAmount] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [reissueInvoice, setReissueInvoice] = useState<Invoice | null>(null);
  const [reissueAmount, setReissueAmount] = useState("");
  const [isReissuing, setIsReissuing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch invoices (only active ones)
  const { data: allInvoices, loading: loadingInvoices } = useFirestoreCollection<Invoice>("invoices", [
    orderBy("createdAt", "desc"),
    limit(100)
  ]);

  // Filter to show only active invoices (hide credited/superseded ones)
  const invoices = allInvoices?.filter(invoice => invoice.isActive !== false) || [];

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

  // Filter appointments that need invoicing (not yet invoiced)
  const toInvoiceAppointments = allAppointments?.filter(apt => 
    (apt.status === 'done' || apt.status === 'no-show' || apt.status === 'cancelled') && 
    !hasExistingInvoice(apt.id)
  ) || [];

  // Detect invoice type based on description and amount patterns
  const getInvoiceTypeIcon = (invoice: Invoice) => {
    const desc = invoice.description?.toLowerCase() || '';
    const isReissued = invoice.isReissued === true;
    const isNoShow = desc.includes('no-show') || desc.includes('penalty');
    const isLateReschedule = desc.includes('late') && desc.includes('reschedule');
    const isCustom = desc.includes('custom') && !isReissued;
    
    if (isReissued) return <RefreshCw className="w-4 h-4 text-blue-500" title="Reissued Invoice" />;
    if (isNoShow) return <Ban className="w-4 h-4 text-red-500" title="No-Show Penalty" />;
    if (isLateReschedule) return <Clock className="w-4 h-4 text-orange-500" title="Late Reschedule Fee" />;
    if (isCustom) return <Edit className="w-4 h-4 text-purple-500" title="Custom Amount" />;
    return <CheckCircle className="w-4 h-4 text-green-500" title="Standard Session Rate" />;
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

  const getAppointmentStatusBadge = (status: string) => {
    switch (status) {
      case "done":
        return <Badge variant="default" className="text-xs">Completed</Badge>;
      case "no-show":
        return <Badge variant="destructive" className="text-xs">No-Show</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="text-xs">Cancelled</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{status}</Badge>;
    }
  };

  // Detect applicable charges for an appointment
  const detectApplicableCharges = (appointment: Appointment) => {
    const shouldIncludeSessionRate = appointment.status === 'done'; // Default ON for completed appointments
    const shouldIncludeNoShow = appointment.status === 'no-show';
    const shouldIncludeLateReschedule = appointment.status === 'cancelled';
    return { shouldIncludeSessionRate, shouldIncludeNoShow, shouldIncludeLateReschedule };
  };

  // Calculate invoice total
  const calculateInvoiceTotal = () => {
    if (!selectedAppointment) return 0;
    
    // Use custom amount if specified
    if (useCustomAmount && customAmount) {
      return parseFloat(customAmount) || 0;
    }
    
    let total = 0;
    
    // Session cost (only if explicitly included)
    if (includeSessionRate) {
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
      const response = await fetch('/api/invoices/create', {
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
          amount: calculateInvoiceTotal(),
          description: `${appointmentData.type} consultation - ${appointmentData.date}${includeNoShowPenalty ? ' (No-show penalty)' : ''}${includeLateRescheduleFee ? ' (Late reschedule fee)' : ''}${useCustomAmount ? ' (Custom amount)' : ''}`
        }),
      });

      if (response.ok) {
        toast({
          title: "Invoice Created",
          description: `Invoice for €${calculateInvoiceTotal().toFixed(2)} has been created successfully.`,
        });
        
        // Note: Firebase should update automatically via real-time listeners
        
        setIsCreatingInvoice(false);
        setSelectedAppointment(null);
        setIncludeSessionRate(false);
        setIncludeNoShowPenalty(false);
        setIncludeLateRescheduleFee(false);
        setUseCustomAmount(false);
        setCustomAmount("");
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

  // Handle invoice reissue
  const handleReissueInvoice = async (invoice: Invoice, newAmount: number) => {
    if (!user) return;
    
    setIsReissuing(true);
    
    try {
      const response = await fetch('/api/invoices/reissue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalInvoiceId: invoice.id,
          newAmount: newAmount,
          reason: newAmount !== invoice.amount ? 'Amount adjustment' : 'Invoice correction'
        }),
      });

      if (response.ok) {
        toast({
          title: "Invoice Reissued",
          description: `New invoice for €${newAmount.toFixed(2)} has been created successfully.`,
        });
        
        // Invalidate and refetch data to show updated lists
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
        
        setReissueInvoice(null);
        setReissueAmount("");
        setIsReissuing(false);
      } else {
        throw new Error('Failed to reissue invoice');
      }
    } catch (error) {
      toast({
        title: "Failed to Reissue Invoice",
        description: "Please try again later.",
        variant: "destructive",
      });
      setIsReissuing(false);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Invoice Management</h1>
      </div>

      {/* Invoice Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">To Invoice</p>
                <p className="text-2xl font-bold">{toInvoiceAppointments?.length || 0}</p>
              </div>
              <FileText className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

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
                <p className="text-sm font-medium text-muted-foreground">Revenue This Month</p>
                <p className="text-2xl font-bold">
                  €{invoices?.filter(inv => 
                    inv.status === 'paid' && 
                    new Date(inv.createdAt).getMonth() === new Date().getMonth()
                  ).reduce((sum, inv) => sum + inv.amount, 0)?.toFixed(2) || '0.00'}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Interface */}
      <Tabs defaultValue="to-invoice" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="to-invoice" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            To Invoice ({toInvoiceAppointments?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="invoiced" className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Invoiced ({invoices?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* To Invoice Tab */}
        <TabsContent value="to-invoice">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Appointments Ready for Invoicing</CardTitle>
              <p className="text-sm text-muted-foreground">Click the invoice button to create and publish invoices for completed appointments</p>
            </CardHeader>
            <CardContent className="p-0">
              {toInvoiceAppointments && toInvoiceAppointments.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-48">Client</TableHead>
                        <TableHead className="w-32">Date</TableHead>
                        <TableHead className="w-24">Type</TableHead>
                        <TableHead className="w-20 text-center">Status</TableHead>
                        <TableHead className="w-24">Billing Info</TableHead>
                        <TableHead className="w-16 text-right">Amount</TableHead>
                        <TableHead className="w-24 text-center">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {toInvoiceAppointments.map((appointment) => {
                        const { shouldIncludeSessionRate, shouldIncludeNoShow, shouldIncludeLateReschedule } = detectApplicableCharges(appointment);
                        let expectedAmount = 0;
                        
                        // Calculate expected amount
                        if (appointment.status !== 'no-show') {
                          expectedAmount += appointment.type === "Initial" ? 95 : 75;
                        }
                        if (shouldIncludeNoShow) {
                          expectedAmount += appointment.type === "Initial" ? 47.50 : 37.50;
                        }
                        if (shouldIncludeLateReschedule) {
                          expectedAmount += 5;
                        }

                        return (
                          <TableRow key={appointment.id} className="hover:bg-muted/50 h-12">
                            <TableCell className="p-2">
                              <div className="font-medium text-sm truncate">{appointment.name}</div>
                              <div className="text-xs text-muted-foreground truncate">{appointment.email}</div>
                            </TableCell>
                            <TableCell className="p-2">
                              <div className="text-xs">
                                {new Date(appointment.date).toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: '2-digit'
                                })}
                              </div>
                            </TableCell>
                            <TableCell className="p-2">
                              <Badge variant="outline" className="text-xs">
                                {appointment.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="p-2 text-center">
                              {getAppointmentStatusBadge(appointment.status)}
                            </TableCell>
                            <TableCell className="p-2">
                              <div className="text-xs">
                                {appointment.status === 'done' && (
                                  <span className="text-green-600 font-medium">Session Fee</span>
                                )}
                                {appointment.status === 'no-show' && (
                                  <span className="text-red-600 font-medium">50% Penalty</span>
                                )}
                                {appointment.status === 'cancelled' && (
                                  <span className="text-orange-600 font-medium">Reschedule Fee</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="p-2 text-right">
                              <div className="font-semibold text-sm">€{expectedAmount.toFixed(2)}</div>
                            </TableCell>
                            <TableCell className="p-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    className="h-8 w-full text-xs"
                                    onClick={() => {
                                      setSelectedAppointment(appointment);
                                      setIncludeSessionRate(shouldIncludeSessionRate);
                                      setIncludeNoShowPenalty(shouldIncludeNoShow);
                                      setIncludeLateRescheduleFee(shouldIncludeLateReschedule);
                                    }}
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Invoice
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Create Invoice</DialogTitle>
                                  </DialogHeader>
                                  
                                  {selectedAppointment && (
                                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                                      <h3 className="font-medium flex items-center gap-2">
                                        <Receipt className="w-4 h-4" />
                                        Invoice Preview & Controls
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

                                      {/* Session Rate Control */}
                                      <div className="flex justify-between items-center">
                                        <div className="flex items-center space-x-2">
                                          <Checkbox
                                            id="session-rate"
                                            checked={includeSessionRate}
                                            onCheckedChange={(checked) => setIncludeSessionRate(checked === true)}
                                          />
                                          <div className="grid gap-1.5 leading-none">
                                            <label 
                                              htmlFor="session-rate" 
                                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                              Session Rate
                                            </label>
                                            <p className="text-xs text-muted-foreground">
                                              Standard consultation fee
                                            </p>
                                          </div>
                                        </div>
                                        {includeSessionRate && (
                                          <Badge variant="default">
                                            €{selectedAppointment.type === "Initial" ? "95.00" : "75.00"}
                                          </Badge>
                                        )}
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

                                      {/* Custom Amount Control */}
                                      <div className="flex justify-between items-center">
                                        <div className="flex items-center space-x-2">
                                          <Checkbox
                                            id="custom-amount"
                                            checked={useCustomAmount}
                                            onCheckedChange={(checked) => {
                                              setUseCustomAmount(checked === true);
                                              if (!checked) setCustomAmount("");
                                            }}
                                          />
                                          <div className="grid gap-1.5 leading-none">
                                            <label 
                                              htmlFor="custom-amount" 
                                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                              Use Custom Amount
                                            </label>
                                            <p className="text-xs text-muted-foreground">
                                              Override calculated amount with custom value
                                            </p>
                                          </div>
                                        </div>
                                        {useCustomAmount && (
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm">€</span>
                                            <Input
                                              type="number"
                                              step="0.01"
                                              placeholder="0.00"
                                              value={customAmount}
                                              onChange={(e) => setCustomAmount(e.target.value)}
                                              className="w-20 h-8 text-sm"
                                            />
                                          </div>
                                        )}
                                      </div>

                                      {/* Total Amount */}
                                      <div className="flex justify-between items-center pt-3 border-t font-semibold">
                                        <span>Total Amount</span>
                                        <Badge variant={useCustomAmount ? "secondary" : "default"} className="text-base px-3 py-1">
                                          €{calculateInvoiceTotal().toFixed(2)}
                                          {useCustomAmount && <span className="ml-1 text-xs">(Custom)</span>}
                                        </Badge>
                                      </div>

                                      {/* Smart Detection Notice */}
                                      {(includeNoShowPenalty || includeLateRescheduleFee) && (
                                        <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                          <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                          <div className="text-sm text-orange-800">
                                            <p className="font-medium">Penalties Auto-Detected</p>
                                            <p className="text-xs mt-1">
                                              Based on appointment status and policy rules. You can adjust before creating the invoice.
                                            </p>
                                          </div>
                                        </div>
                                      )}

                                      <Button 
                                        onClick={() => handleCreateInvoice(selectedAppointment)}
                                        disabled={isCreatingInvoice}
                                        className="w-full"
                                      >
                                        {isCreatingInvoice ? "Creating Invoice..." : `Create & Publish Invoice - €${calculateInvoiceTotal().toFixed(2)}`}
                                      </Button>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No appointments ready for invoicing.</p>
                  <p className="text-sm mt-1">Completed appointments will appear here automatically.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoiced Tab */}
        <TabsContent value="invoiced">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Published Invoices ({invoices?.length || 0})</CardTitle>
              <p className="text-sm text-muted-foreground">Ultra-compact view of all created invoices with quick status identification</p>
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
                                onClick={() => window.open(invoice.paymentUrl || '#', '_blank')}
                                title="View Invoice"
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                              {invoice.status === 'pending' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => window.open(invoice.paymentUrl || '#', '_blank')}
                                  title="Send Reminder"
                                >
                                  <Send className="w-3 h-3" />
                                </Button>
                              )}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => {
                                      setReissueInvoice(invoice);
                                      setReissueAmount(invoice.amount.toString());
                                    }}
                                    title="Reissue Invoice"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>Reissue Invoice</DialogTitle>
                                  </DialogHeader>
                                  
                                  {reissueInvoice && (
                                    <div className="space-y-4">
                                      <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm"><strong>Client:</strong> {reissueInvoice.clientName}</p>
                                        <p className="text-sm"><strong>Invoice #:</strong> {reissueInvoice.invoiceNumber}</p>
                                        <p className="text-sm"><strong>Current Amount:</strong> €{reissueInvoice.amount.toFixed(2)}</p>
                                        <p className="text-sm"><strong>Status:</strong> {reissueInvoice.status}</p>
                                        {reissueInvoice.isReissued && (
                                          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                                            <p className="text-xs text-blue-800">
                                              <strong>This is a reissued invoice</strong><br/>
                                              Credit Note: {reissueInvoice.creditNoteNumber}<br/>
                                              Original Amount: €{reissueInvoice.originalAmount?.toFixed(2)}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                      
                                      <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                        <p className="text-sm text-orange-800">
                                          <strong>Reissue Process:</strong><br/>
                                          • Current invoice will be credited<br/>
                                          • New invoice will be created with updated amount<br/>
                                          • Credit note will reference the original invoice
                                        </p>
                                      </div>
                                      
                                      <div>
                                        <Label htmlFor="reissue-amount">New Amount (EUR)</Label>
                                        <Input
                                          id="reissue-amount"
                                          type="number"
                                          step="0.01"
                                          placeholder="0.00"
                                          value={reissueAmount}
                                          onChange={(e) => setReissueAmount(e.target.value)}
                                          className="mt-1"
                                        />
                                      </div>

                                      <div className="flex gap-2">
                                        <Button 
                                          onClick={() => {
                                            setReissueInvoice(null);
                                            setReissueAmount("");
                                          }}
                                          variant="outline"
                                          className="flex-1"
                                        >
                                          Cancel
                                        </Button>
                                        <Button 
                                          onClick={() => handleReissueInvoice(reissueInvoice, parseFloat(reissueAmount))}
                                          disabled={isReissuing || !reissueAmount || parseFloat(reissueAmount) <= 0}
                                          className="flex-1"
                                        >
                                          {isReissuing ? "Reissuing..." : `Reissue €${parseFloat(reissueAmount || "0").toFixed(2)}`}
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}