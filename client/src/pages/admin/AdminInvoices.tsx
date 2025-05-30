import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { orderBy, limit, where } from "firebase/firestore";
import { useQueryClient } from "@tanstack/react-query";
import { Receipt, Plus, Eye, Send, DollarSign, ArrowLeft, AlertTriangle, RefreshCw, Clock, Ban, CheckCircle, FileText, Edit, CreditCard, Calendar, Users, Euro } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import type { Invoice, Appointment } from "@shared/firebase-schema";

interface User {
  uid: string;
  name: string;
  email: string;
  servicePlan?: string;
  programStartDate?: any;
  programEndDate?: any;
  role?: string;
}

export default function AdminInvoices() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [programStartDate, setProgramStartDate] = useState("");
  const [isGeneratingSubscription, setIsGeneratingSubscription] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Additional invoice creation state
  const [showAdditionalInvoiceDialog, setShowAdditionalInvoiceDialog] = useState(false);
  const [additionalInvoiceUser, setAdditionalInvoiceUser] = useState<User | null>(null);
  const [additionalInvoiceAmount, setAdditionalInvoiceAmount] = useState("");
  const [additionalInvoiceReason, setAdditionalInvoiceReason] = useState("");
  const [isCreatingAdditionalInvoice, setIsCreatingAdditionalInvoice] = useState(false);
  
  // Billing status tracking
  const [billingStatuses, setBillingStatuses] = useState<{[key: string]: any}>({});
  
  // Invoice creation state
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  
  // Reissue invoice state
  const [selectedInvoiceForReissue, setSelectedInvoiceForReissue] = useState<Invoice | null>(null);
  const [showReissueDialog, setShowReissueDialog] = useState(false);
  const [reissueAmount, setReissueAmount] = useState("");
  const [reissueReason, setReissueReason] = useState("");
  const [isReissuingInvoice, setIsReissuingInvoice] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all invoices
  const { data: allInvoices, loading: loadingInvoices } = useFirestoreCollection<Invoice>("invoices", [
    orderBy("createdAt", "desc"),
    limit(100)
  ]);



  // Fetch all appointments for pay-as-you-go invoicing
  const { data: allAppointments } = useFirestoreCollection<Appointment>("appointments", [
    orderBy("startTime", "desc"),
    limit(100)
  ]);

  // Fetch all complete program users (excluding admin users)
  const { data: allCompleteProgramUsers } = useFirestoreCollection<User>("users", [
    where("servicePlan", "==", "complete-program")
  ]);

  // Filter out admin users and get only client users
  const completeProgramUsers = React.useMemo(() => {
    if (!allCompleteProgramUsers) return [];
    
    return allCompleteProgramUsers.filter(user => {
      return user.role === 'client';
    });
  }, [allCompleteProgramUsers]);

  // Fetch billing statuses for all users when component loads
  React.useEffect(() => {
    const fetchBillingStatuses = async () => {
      if (!completeProgramUsers?.length) return;
      
      const statuses: {[key: string]: any} = {};
      
      for (const user of completeProgramUsers) {
        try {
          const response = await fetch(`/api/subscriptions/billing-status/${user.uid}`);
          const data = await response.json();
          if (data.success) {
            statuses[user.uid] = data;
          }
        } catch (error) {
          console.error(`Error fetching billing status for ${user.uid}:`, error);
        }
      }
      
      setBillingStatuses(statuses);
    };

    fetchBillingStatuses();
  }, [completeProgramUsers]);

  // Get proper billing status from API data
  const getUserBillingStatus = (userId: string) => {
    const billingStatus = billingStatuses[userId];
    if (!billingStatus) return 'none';
    
    return billingStatus.subscriptionStatus || 'none';
  };

  // Get billing status details for display
  const getBillingStatusDetails = (userId: string) => {
    return billingStatuses[userId] || null;
  };

  const formatDate = (date: any) => {
    if (!date) return 'Not set';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  // Show confirmation dialog
  const handleStartBilling = () => {
    if (!selectedUser || !programStartDate) {
      toast({
        title: "Missing Information",
        description: "Please select a user and program start date",
        variant: "destructive",
      });
      return;
    }
    setShowConfirmDialog(true);
  };

  // Generate subscription billing function
  const handleGenerateSubscription = async () => {
    setShowConfirmDialog(false);
    setIsGeneratingSubscription(true);
    try {
      const response = await apiRequest("POST", "/api/subscriptions/generate-complete-program", {
        userId: selectedUser!.uid,
        clientName: selectedUser!.name,
        clientEmail: selectedUser!.email,
        programStartDate,
        monthlyAmount: 150
      });

      toast({
        title: "Success",
        description: "Monthly subscription created successfully",
      });
      setSelectedUser(null);
      setProgramStartDate("");
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      // Refresh the page data
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSubscription(false);
    }
  };

  // Handle creating additional invoice
  const handleCreateAdditionalInvoice = async () => {
    if (!additionalInvoiceUser || !additionalInvoiceAmount || !additionalInvoiceReason) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingAdditionalInvoice(true);
    try {
      const response = await apiRequest("POST", "/api/invoices/create-custom", {
        userId: additionalInvoiceUser.uid,
        clientName: additionalInvoiceUser.name,
        clientEmail: additionalInvoiceUser.email,
        amount: parseFloat(additionalInvoiceAmount),
        description: `Additional charge: ${additionalInvoiceReason}`,
        invoiceType: 'session'
      });

      toast({
        title: "Success",
        description: "Additional invoice created successfully",
      });
      
      setShowAdditionalInvoiceDialog(false);
      setAdditionalInvoiceUser(null);
      setAdditionalInvoiceAmount("");
      setAdditionalInvoiceReason("");
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create additional invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingAdditionalInvoice(false);
    }
  };

  // Handle creating invoice from appointment
  const handleCreateAppointmentInvoice = async () => {
    if (!selectedAppointment) return;

    setIsCreatingInvoice(true);
    try {
      const response = await apiRequest("POST", "/api/invoices/create-from-appointment", {
        appointmentId: selectedAppointment.id,
        userId: selectedAppointment.userId,
        clientName: selectedAppointment.name,
        clientEmail: selectedAppointment.email,
        amount: 75, // Default session rate
        description: `Consultation - ${selectedAppointment.date}`
      });

      toast({
        title: "Success",
        description: "Invoice created successfully",
      });
      
      setShowInvoiceDialog(false);
      setSelectedAppointment(null);
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  // Check if appointment already has an invoice
  const hasInvoice = (appointmentId: string | undefined) => {
    if (!appointmentId) return false;
    return allInvoices?.some(invoice => 
      invoice.appointmentId === appointmentId
    ) || false;
  };

  // Handle viewing invoice
  const handleViewInvoice = (invoice: Invoice) => {
    // Open invoice in new tab/window
    window.open(`/invoice/${invoice.id}`, '_blank');
  };

  // Handle payment reminder
  const handleSendPaymentReminder = async (invoice: Invoice) => {
    try {
      await apiRequest("POST", "/api/invoices/send-reminder", {
        invoiceId: invoice.id
      });
      toast({
        title: "Success",
        description: "Payment reminder sent successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send payment reminder",
        variant: "destructive",
      });
    }
  };

  // Handle reissue invoice with dialog
  const handleReissueInvoice = (invoice: Invoice) => {
    setSelectedInvoiceForReissue(invoice);
    setReissueAmount(invoice.amount?.toString() || "0");
    setReissueReason("");
    setShowReissueDialog(true);
  };

  // Process reissue with new amount
  const processReissueInvoice = async () => {
    if (!selectedInvoiceForReissue || !reissueAmount || !reissueReason) {
      toast({
        title: "Error",
        description: "Please provide both new amount and reason for reissue",
        variant: "destructive",
      });
      return;
    }

    setIsReissuingInvoice(true);
    try {
      await apiRequest("PUT", `/api/invoices/${selectedInvoiceForReissue.id}/reissue`, {
        newAmount: parseFloat(reissueAmount),
        reason: reissueReason
      });
      
      toast({
        title: "Success",
        description: "Invoice reissued successfully with new amount",
      });
      
      setShowReissueDialog(false);
      setSelectedInvoiceForReissue(null);
      setReissueAmount("");
      setReissueReason("");
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reissue invoice",
        variant: "destructive",
      });
    } finally {
      setIsReissuingInvoice(false);
    }
  };

  const subscriptionInvoices = allInvoices?.filter(inv => 
    inv.invoiceType === 'subscription' || 
    inv.description?.includes('Complete Program') || 
    inv.description?.includes('Month ')
  ) || [];

  const payAsYouGoInvoices = allInvoices?.filter(inv => 
    inv.invoiceType !== 'subscription' &&
    !inv.description?.includes('Complete Program') && 
    !inv.description?.includes('Month ')
  ) || [];

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Invoice Management</h1>
          <p className="text-muted-foreground">
            Manage invoices and monthly subscription billing
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard className="w-4 h-4" />
            Monthly Subscription Billing
          </div>
          <Button variant="outline" asChild size="sm">
            <Link href="/admin">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin Dashboard
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="subscriptions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="invoices">Pay-as-you-go ({payAsYouGoInvoices.length})</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="all">All Invoices ({allInvoices?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Generate New Subscription */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5" />
                  Start Monthly Subscription
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

                <div className="space-y-2">
                  <Label>Program Start Date</Label>
                  <Input
                    type="date"
                    value={programStartDate}
                    onChange={(e) => setProgramStartDate(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={handleStartBilling}
                  disabled={isGeneratingSubscription || !selectedUser || !programStartDate}
                  className="w-full"
                >
                  {isGeneratingSubscription ? "Starting Subscription..." : "Start Monthly Subscription"}
                </Button>
              </CardContent>
            </Card>

            {/* Subscription Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5" />
                  Subscription Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">
                      {completeProgramUsers?.length || 0}
                    </div>
                    <div className="text-sm text-green-600">Total Programs</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">€{completeProgramUsers?.length * 150 || 0}</div>
                    <div className="text-sm text-blue-600">Monthly Revenue</div>
                  </div>
                </div>
                
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-sm">Monthly Billing Cycle</span>
                  </div>
                  <p className="text-xs text-purple-700">
                    Automatic billing monthly for 3 months
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Create Additional Invoice */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create Additional Invoice
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Create extra charges for no-shows, late reschedules, or custom amounts
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Client</Label>
                <Select 
                  value={additionalInvoiceUser?.uid || ""} 
                  onValueChange={(value) => {
                    const user = completeProgramUsers?.find(u => u.uid === value);
                    setAdditionalInvoiceUser(user || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a subscription client" />
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount (€)</Label>
                  <Input
                    type="number"
                    placeholder="75.00"
                    value={additionalInvoiceAmount}
                    onChange={(e) => setAdditionalInvoiceAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Select value={additionalInvoiceReason} onValueChange={setAdditionalInvoiceReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="No-show penalty">No-show penalty</SelectItem>
                      <SelectItem value="Late reschedule fee">Late reschedule fee</SelectItem>
                      <SelectItem value="Extra session">Extra session</SelectItem>
                      <SelectItem value="Custom charge">Custom charge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={() => setShowAdditionalInvoiceDialog(true)}
                disabled={!additionalInvoiceUser || !additionalInvoiceAmount || !additionalInvoiceReason || isCreatingAdditionalInvoice}
                className="w-full"
              >
                {isCreatingAdditionalInvoice ? "Creating Invoice..." : "Create Additional Invoice"}
              </Button>
            </CardContent>
          </Card>

          {/* Subscription Management List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monthly Subscription Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {completeProgramUsers?.map((user) => {
                  const billingStatus = getUserBillingStatus(user.uid);
                  const statusDetails = getBillingStatusDetails(user.uid);
                  const needsBillingSetup = billingStatus === 'none';
                  
                  return (
                    <div key={user.uid} className="p-3 border rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div>
                              <h4 className="font-medium text-sm">{user.name}</h4>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {billingStatus === 'none' && (
                                <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                                  Setup Required
                                </Badge>
                              )}
                              {billingStatus === 'active' && (
                                <Badge variant="default" className="text-xs bg-green-100 text-green-700 border-green-300">
                                  Active - Month {statusDetails?.currentCycle || 1}/3
                                </Badge>
                              )}
                              {billingStatus === 'completed' && (
                                <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">
                                  Program Completed
                                </Badge>
                              )}
                              {billingStatus === 'cancelled' && (
                                <Badge variant="outline" className="text-xs text-red-600 border-red-300">
                                  Cancelled
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-muted-foreground text-right">
                            <div>Start: {formatDate(user.programStartDate)}</div>
                            <div>End: {formatDate(user.programEndDate)}</div>
                            {statusDetails?.nextBillingDate && billingStatus === 'active' && (
                              <div>Next billing: {formatDate(statusDetails.nextBillingDate)}</div>
                            )}
                          </div>
                          
                          {billingStatus === 'none' && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setProgramStartDate(user.programStartDate?.toDate ? 
                                  user.programStartDate.toDate().toISOString().split('T')[0] : 
                                  new Date().toISOString().split('T')[0]
                                );
                                setShowConfirmDialog(true);
                              }}
                              className="text-xs"
                            >
                              Start Billing
                            </Button>
                          )}
                          {billingStatus === 'completed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedUser(user);
                                setProgramStartDate(new Date().toISOString().split('T')[0]);
                                setShowConfirmDialog(true);
                              }}
                              className="text-xs"
                            >
                              Renew Program
                            </Button>
                          )}
                          {billingStatus === 'active' && (
                            <Badge variant="secondary" className="text-xs">
                              Billing Active
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {!completeProgramUsers?.length && (
                  <div className="text-center py-6">
                    <Users className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No complete program users found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pay-as-you-go Appointments</CardTitle>
              <p className="text-sm text-muted-foreground">
                All appointments that can be invoiced (excluding subscription users)
              </p>
            </CardHeader>
            <CardContent>
              {React.useMemo(() => {
                // Filter appointments that can be invoiced (not pending, not cancelled, and not already invoiced)
                const invoiceableAppointments = allAppointments?.filter(appointment => 
                  appointment.status !== 'pending' && 
                  appointment.status !== 'cancelled' &&
                  appointment.status !== 'cancelled_reschedule'
                ) || [];

                if (invoiceableAppointments.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No appointments available for invoicing</p>
                    </div>
                  );
                }

                return (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Invoice Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoiceableAppointments.map((appointment) => {
                        const isInvoiced = hasInvoice(appointment.id);
                        return (
                          <TableRow key={appointment.id}>
                            <TableCell>
                              <div className="text-sm">
                                <div>{appointment.date}</div>
                                <div className="text-muted-foreground">{appointment.timeslot}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{appointment.name}</div>
                                <div className="text-sm text-muted-foreground">{appointment.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                appointment.status === 'done' ? 'default' :
                                appointment.status === 'confirmed' ? 'outline' :
                                appointment.status === 'no-show' ? 'secondary' : 'outline'
                              }>
                                {appointment.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{appointment.type || 'Consultation'}</TableCell>
                            <TableCell>
                              {isInvoiced ? (
                                <Badge variant="default" className="bg-green-100 text-green-700">
                                  Invoiced
                                </Badge>
                              ) : (
                                <Badge variant="outline">
                                  Not Invoiced
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {!isInvoiced && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedAppointment(appointment);
                                      setShowInvoiceDialog(true);
                                    }}
                                    title="Create Invoice"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                )}
                                {isInvoiced && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    title="Invoice Already Created"
                                    disabled
                                  >
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                );
              }, [allAppointments, allInvoices])}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingInvoices ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 mx-auto text-muted-foreground mb-4 animate-spin" />
                  <p className="text-muted-foreground">Loading invoices...</p>
                </div>
              ) : allInvoices && allInvoices.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-mono text-sm">{invoice.invoiceNumber}</TableCell>
                        <TableCell>{invoice.clientName}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          <div className="space-y-1">
                            <div>
                              {invoice.description || 
                               (invoice.invoiceType === 'subscription' ? `Complete Nutrition Program - Month ${invoice.billingCycle || 1} of 3` : 'Consultation')}
                            </div>
                            {invoice.isReissued && (
                              <div className="flex items-center gap-1">
                                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                                  <RefreshCw className="w-3 h-3 mr-1" />
                                  Reissued
                                </Badge>
                                {invoice.reissueReason && (
                                  <span className="text-xs text-muted-foreground">
                                    • {invoice.reissueReason}
                                  </span>
                                )}
                              </div>
                            )}
                            {invoice.originalAmount && invoice.originalAmount !== invoice.amount && (
                              <div className="text-xs text-muted-foreground">
                                Original: €{invoice.originalAmount.toFixed(2)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(invoice.amount || invoice.totalAmount || 0)}</TableCell>
                        <TableCell>
                          <Badge variant={
                            invoice.status === 'paid' ? 'default' :
                            invoice.status === 'pending' ? 'secondary' :
                            invoice.status === 'overdue' ? 'destructive' : 'outline'
                          }>
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewInvoice(invoice)}
                              title="View Invoice"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {invoice.status !== 'paid' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSendPaymentReminder(invoice)}
                                  title="Send Payment Reminder"
                                >
                                  <Send className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReissueInvoice(invoice)}
                                  title="Reissue Invoice"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No invoices found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Monthly Billing Start</DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <h4 className="font-medium">Billing Details</h4>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Client:</span> {selectedUser.name}</p>
                  <p><span className="font-medium">Email:</span> {selectedUser.email}</p>
                  <p><span className="font-medium">Program Start:</span> {formatDate(programStartDate)}</p>
                  <p><span className="font-medium">Monthly Amount:</span> €150.00</p>
                  <p><span className="font-medium">Billing Cycle:</span> 3 months</p>
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  This will generate 3 monthly invoices of €150 each, starting from the program start date.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmDialog(false)}
                  disabled={isGeneratingSubscription}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerateSubscription}
                  disabled={isGeneratingSubscription}
                >
                  {isGeneratingSubscription ? "Starting..." : "Confirm & Start Billing"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Additional Invoice Confirmation Dialog */}
      <Dialog open={showAdditionalInvoiceDialog} onOpenChange={setShowAdditionalInvoiceDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Additional Invoice</DialogTitle>
          </DialogHeader>
          
          {additionalInvoiceUser && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <h4 className="font-medium">Invoice Details</h4>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Client:</span> {additionalInvoiceUser.name}</p>
                  <p><span className="font-medium">Email:</span> {additionalInvoiceUser.email}</p>
                  <p><span className="font-medium">Amount:</span> €{parseFloat(additionalInvoiceAmount || '0').toFixed(2)}</p>
                  <p><span className="font-medium">Reason:</span> {additionalInvoiceReason}</p>
                </div>
              </div>
              
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-800">
                  This will create an additional invoice on top of their monthly subscription.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAdditionalInvoiceDialog(false)}
                  disabled={isCreatingAdditionalInvoice}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateAdditionalInvoice}
                  disabled={isCreatingAdditionalInvoice}
                >
                  {isCreatingAdditionalInvoice ? "Creating..." : "Create Invoice"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Invoice from Appointment Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Invoice from Appointment</DialogTitle>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <h4 className="font-medium">Appointment Details</h4>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Client:</span> {selectedAppointment.name}</p>
                  <p><span className="font-medium">Email:</span> {selectedAppointment.email}</p>
                  <p><span className="font-medium">Date:</span> {selectedAppointment.date}</p>
                  <p><span className="font-medium">Time:</span> {selectedAppointment.timeslot}</p>
                  <p><span className="font-medium">Status:</span> {selectedAppointment.status}</p>
                  <p><span className="font-medium">Amount:</span> €75.00</p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowInvoiceDialog(false)}
                  disabled={isCreatingInvoice}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateAppointmentInvoice}
                  disabled={isCreatingInvoice}
                >
                  {isCreatingInvoice ? "Creating..." : "Create Invoice"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reissue Invoice Dialog */}
      <Dialog open={showReissueDialog} onOpenChange={setShowReissueDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reissue Invoice</DialogTitle>
          </DialogHeader>
          
          {selectedInvoiceForReissue && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <h4 className="font-medium">Invoice Details</h4>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Invoice #:</span> {selectedInvoiceForReissue.invoiceNumber}</p>
                  <p><span className="font-medium">Client:</span> {selectedInvoiceForReissue.clientName}</p>
                  <p><span className="font-medium">Original Amount:</span> €{selectedInvoiceForReissue.amount?.toFixed(2) || '0.00'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="reissue-amount">New Amount (€)</Label>
                  <Input
                    id="reissue-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={reissueAmount}
                    onChange={(e) => setReissueAmount(e.target.value)}
                    placeholder="Enter new amount"
                  />
                </div>

                <div>
                  <Label htmlFor="reissue-reason">Reason for Reissue</Label>
                  <Input
                    id="reissue-reason"
                    value={reissueReason}
                    onChange={(e) => setReissueReason(e.target.value)}
                    placeholder="e.g., Pricing adjustment, Discount applied"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  This will create a credit note for the difference and issue a new invoice for the adjusted amount.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowReissueDialog(false)}
                  disabled={isReissuingInvoice}
                >
                  Cancel
                </Button>
                <Button
                  onClick={processReissueInvoice}
                  disabled={isReissuingInvoice || !reissueAmount || !reissueReason}
                >
                  {isReissuingInvoice ? "Processing..." : "Reissue Invoice"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}