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
  
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all invoices
  const { data: allInvoices, loading: loadingInvoices } = useFirestoreCollection<Invoice>("invoices", [
    orderBy("createdAt", "desc"),
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

  // Check if user has existing subscription invoices
  const getUserBillingStatus = (userId: string, userEmail: string) => {
    if (!allInvoices) return 'none';
    
    const userInvoices = allInvoices.filter(invoice => 
      invoice.userId === userId || 
      invoice.clientEmail === userEmail
    );
    
    if (userInvoices.length > 0) {
      const hasSubscriptionInvoices = userInvoices.some(inv => 
        inv.description?.includes('Complete Program') ||
        inv.description?.includes('Month ')
      );
      
      if (hasSubscriptionInvoices) {
        return 'active';
      }
    }
    
    return 'none';
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

  const subscriptionInvoices = allInvoices?.filter(inv => 
    inv.description?.includes('Complete Program') || inv.description?.includes('Month ')
  ) || [];

  const payAsYouGoInvoices = allInvoices?.filter(inv => 
    !inv.description?.includes('Complete Program') && !inv.description?.includes('Month ')
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

          {/* Subscription Management List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monthly Subscription Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {completeProgramUsers?.map((user) => {
                  const billingStatus = getUserBillingStatus(user.uid, user.email);
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
                              {needsBillingSetup ? (
                                <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                                  Setup Required
                                </Badge>
                              ) : (
                                <Badge variant="default" className="text-xs">
                                  Active
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-muted-foreground text-right">
                            <div>Start: {formatDate(user.programStartDate)}</div>
                            <div>End: {formatDate(user.programEndDate)}</div>
                          </div>
                          
                          {needsBillingSetup && (
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
              <CardTitle>Pay-as-you-go Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {payAsYouGoInvoices.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payAsYouGoInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-mono text-sm">{invoice.invoiceNumber}</TableCell>
                        <TableCell>{invoice.clientName}</TableCell>
                        <TableCell>{formatCurrency(invoice.amount)}</TableCell>
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
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No pay-as-you-go invoices found</p>
                </div>
              )}
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
                        <TableCell className="max-w-xs truncate">{invoice.description}</TableCell>
                        <TableCell>{formatCurrency(invoice.amount)}</TableCell>
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
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
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
    </div>
  );
}