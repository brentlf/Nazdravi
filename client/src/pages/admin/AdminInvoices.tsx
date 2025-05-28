import React, { useState, useMemo } from "react";
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
  const [showReissueDialog, setShowReissueDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all invoices including credit notes for proper accounting flow
  const { data: allInvoices, loading: loadingInvoices } = useFirestoreCollection<Invoice>("invoices", [
    orderBy("createdAt", "desc"),
    limit(100)
  ]);

  // Group invoices by accounting flow - main invoices and their related credit notes/reissues
  const invoiceGroups = useMemo(() => {
    if (!allInvoices) return [];
    
    const groups = new Map();
    
    allInvoices.forEach(invoice => {
      if (invoice.originalInvoiceId) {
        // This is a credit note or reissued invoice
        const originalId = invoice.originalInvoiceId;
        if (!groups.has(originalId)) {
          groups.set(originalId, { original: null, creditNotes: [], reissued: [] });
        }
        if (invoice.type === 'credit') {
          groups.get(originalId).creditNotes.push(invoice);
        } else {
          groups.get(originalId).reissued.push(invoice);
        }
      } else {
        // This is an original invoice
        if (!groups.has(invoice.id)) {
          groups.set(invoice.id, { original: null, creditNotes: [], reissued: [] });
        }
        groups.get(invoice.id).original = invoice;
      }
    });
    
    return Array.from(groups.values()).filter(group => group.original);
  }, [allInvoices]);

  // For display purposes, show the main invoices with smart indicators
  const invoices = invoiceGroups.map((group: any) => ({
    ...group.original,
    _hasAccountingFlow: group.creditNotes.length > 0 || group.reissued.length > 0,
    _creditNotes: group.creditNotes,
    _reissued: group.reissued,
    _netAmount: group.original.amount - group.creditNotes.reduce((sum: number, cn: any) => sum + cn.amount, 0)
  }));

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

  // Smart invoice type detection with accounting flow awareness and tooltips
  const getInvoiceTypeIcon = (invoice: any) => {
    const desc = invoice.description?.toLowerCase() || '';
    const isReissued = invoice.isReissued === true;
    const hasAccountingFlow = invoice._hasAccountingFlow;
    const isNoShow = desc.includes('no-show') || desc.includes('penalty');
    const isLateReschedule = desc.includes('late') && desc.includes('reschedule');
    const isCustom = desc.includes('custom') && !isReissued;
    
    if (hasAccountingFlow) {
      return (
        <div className="flex items-center gap-1 cursor-help" title="Has accounting adjustments (credit notes/reissues)">
          <RefreshCw className="w-4 h-4 text-blue-500" />
          <span className="text-xs text-blue-600">•</span>
        </div>
      );
    }
    if (isReissued) return <div className="cursor-help" title="Reissued Invoice"><RefreshCw className="w-4 h-4 text-blue-500" /></div>;
    if (isNoShow) return <div className="cursor-help" title="No-Show Penalty"><Ban className="w-4 h-4 text-red-500" /></div>;
    if (isLateReschedule) return <div className="cursor-help" title="Late Reschedule Fee"><Clock className="w-4 h-4 text-orange-500" /></div>;
    if (isCustom) return <div className="cursor-help" title="Custom Amount"><Edit className="w-4 h-4 text-purple-500" /></div>;
    return <div className="cursor-help" title="Standard Session Rate"><CheckCircle className="w-4 h-4 text-green-500" /></div>;
  };

  // Smart amount display considering net amounts after credits
  const getDisplayAmount = (invoice: any) => {
    if (invoice._hasAccountingFlow && invoice._netAmount !== invoice.amount) {
      return (
        <div className="text-right">
          <div className="text-sm font-medium">€{invoice._netAmount.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground line-through">€{invoice.amount.toFixed(2)}</div>
        </div>
      );
    }
    return <div className="text-right font-medium">€{invoice.amount.toFixed(2)}</div>;
  };

  // Enhanced status badge showing payment requirements
  const getSmartStatusBadge = (invoice: any) => {
    const hasCredits = invoice._creditNotes?.length > 0;
    const isFullyCredited = invoice._netAmount === 0;
    
    if (isFullyCredited) {
      return <Badge variant="outline" className="text-green-600 border-green-600">No Payment Due</Badge>;
    }
    
    if (hasCredits && invoice.status === 'pending') {
      return <Badge variant="outline" className="text-orange-600 border-orange-600">Adjusted - Pending</Badge>;
    }
    
    const statusColors = {
      pending: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
      paid: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      overdue: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
      cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    };
    
    return <Badge className={statusColors[invoice.status as keyof typeof statusColors]}>{invoice.status}</Badge>;
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
      console.log('Reissue invoice data:', { 
        invoiceId: invoice.id, 
        newAmount, 
        originalAmount: invoice.amount,
        requestBody: {
          originalInvoiceId: invoice.id,
          newAmount: newAmount,
          reason: newAmount !== invoice.amount ? 'Amount adjustment' : 'Invoice correction'
        }
      });
      
      // Direct Firebase update since API routing is broken
      const { db } = await import('@/lib/firebase');
      const { doc, updateDoc, getDoc } = await import('firebase/firestore');
      
      const invoiceRef = doc(db, 'invoices', invoice.id);
      const invoiceSnap = await getDoc(invoiceRef);
      
      if (!invoiceSnap.exists()) {
        throw new Error('Invoice not found');
      }
      
      const originalInvoice = invoiceSnap.data();
      const originalAmount = originalInvoice.amount;
      
      // Update the invoice directly in Firebase
      await updateDoc(invoiceRef, {
        amount: newAmount,
        originalAmount: originalAmount,
        isReissued: true,
        reissueReason: newAmount !== originalAmount ? 'Amount adjustment' : 'Invoice correction',
        description: `${originalInvoice.description} (Reissued: ${newAmount !== originalAmount ? 'Amount adjustment' : 'Invoice correction'})`,
        updatedAt: new Date()
      });

      toast({
        title: "Invoice Reissued Successfully!",
        description: `Invoice amount updated from €${originalAmount} to €${newAmount}`,
      });
      
      // Invalidate queries to refresh the data from Firestore
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      
      setReissueInvoice(null);
      setReissueAmount("");
      setIsReissuing(false);
    } catch (error) {
      console.error('Reissue error details:', error);
      toast({
        title: "Failed to Reissue Invoice",
        description: error instanceof Error ? error.message : "Please try again later.",
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
                            <div className="flex justify-center items-center">
                              {getInvoiceTypeIcon(invoice)}
                            </div>
                          </TableCell>
                          <TableCell className="p-2">
                            <div className="font-mono text-xs">{invoice.invoiceNumber}</div>
                            {invoice.isReissued && (
                              <div className="text-xs mt-1 space-y-1">
                                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                                  Reissued Invoice
                                </Badge>
                                <div className="text-gray-600">
                                  Original: €{invoice.originalAmount?.toFixed(2)} → Current: €{invoice.amount.toFixed(2)}
                                </div>
                                <div className="text-gray-500 italic">
                                  {invoice.reissueReason}
                                </div>
                              </div>
                            )}
                            {invoice._hasAccountingFlow && !invoice.isReissued && (
                              <div className="text-xs text-blue-600 mt-1">
                                {invoice._creditNotes?.length > 0 && `${invoice._creditNotes.length} credit note(s)`}
                                {invoice._reissued?.length > 0 && ` • ${invoice._reissued.length} reissue(s)`}
                              </div>
                            )}
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
                          <TableCell className="p-2">
                            {getDisplayAmount(invoice)}
                          </TableCell>
                          <TableCell className="p-2 text-center">
                            {getSmartStatusBadge(invoice)}
                          </TableCell>
                          <TableCell className="p-2">
                            <div className="flex gap-1 justify-center">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    title="View Invoice Details"
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Invoice Details - {invoice.invoiceNumber}</DialogTitle>
                                  </DialogHeader>
                                  
                                  <div className="space-y-4">
                                    {/* Client Information */}
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="font-medium text-sm text-gray-700">Client</h4>
                                        <p className="text-sm">{invoice.clientName}</p>
                                        <p className="text-xs text-gray-500">{invoice.clientEmail}</p>
                                      </div>
                                      <div>
                                        <h4 className="font-medium text-sm text-gray-700">Status</h4>
                                        <div className="mt-1">{getSmartStatusBadge(invoice)}</div>
                                      </div>
                                    </div>

                                    {/* Invoice Details */}
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="font-medium text-sm text-gray-700">Amount</h4>
                                        <p className="text-lg font-bold">€{invoice.amount.toFixed(2)}</p>
                                      </div>
                                      <div>
                                        <h4 className="font-medium text-sm text-gray-700">Date</h4>
                                        <p className="text-sm">{new Date(invoice.sessionDate || invoice.createdAt).toLocaleDateString()}</p>
                                      </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                      <h4 className="font-medium text-sm text-gray-700">Description</h4>
                                      <p className="text-sm">{invoice.description}</p>
                                    </div>

                                    {/* Reissue Information */}
                                    {invoice.isReissued && (
                                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <h4 className="font-medium text-sm text-yellow-800 mb-2">Reissue Information</h4>
                                        <div className="space-y-1 text-sm">
                                          <p><strong>Original Amount:</strong> €{invoice.originalAmount?.toFixed(2)}</p>
                                          <p><strong>Current Amount:</strong> €{invoice.amount.toFixed(2)}</p>
                                          <p><strong>Reason:</strong> {invoice.reissueReason}</p>
                                          <p><strong>Difference:</strong> €{(invoice.amount - (invoice.originalAmount || 0)).toFixed(2)}</p>
                                        </div>
                                      </div>
                                    )}

                                    {/* Payment Link */}
                                    {invoice.paymentUrl && (
                                      <div>
                                        <h4 className="font-medium text-sm text-gray-700">Payment Link</h4>
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          onClick={() => window.open(invoice.paymentUrl, '_blank')}
                                          className="mt-1"
                                        >
                                          Open Payment Page
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                              {invoice.status === 'pending' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={async () => {
                                    try {
                                      const response = await fetch('/api/invoices/send-reminder', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ invoiceId: invoice.id })
                                      });

                                      if (response.ok) {
                                        toast({
                                          title: "Reminder Sent",
                                          description: `Payment reminder sent to ${invoice.clientEmail}`,
                                        });
                                      } else {
                                        const error = await response.json();
                                        toast({
                                          title: "Failed to Send Reminder",
                                          description: error.error || "Please try again",
                                          variant: "destructive",
                                        });
                                      }
                                    } catch (error) {
                                      toast({
                                        title: "Failed to Send Reminder",
                                        description: "Please try again",
                                        variant: "destructive",
                                      });
                                    }
                                  }}
                                  title="Send Payment Reminder"
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