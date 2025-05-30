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

export default function AdminInvoicesNew() {
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
  
  // Subscription management state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [programStartDate, setProgramStartDate] = useState("");
  const [isGeneratingSubscription, setIsGeneratingSubscription] = useState(false);
  const [billingStatuses, setBillingStatuses] = useState<Record<string, any>>({});
  
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

  // Generate subscription billing function
  const handleGenerateSubscription = async () => {
    if (!selectedUser || !programStartDate) {
      toast({
        title: "Missing Information",
        description: "Please select a user and program start date",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingSubscription(true);
    try {
      const response = await apiRequest("POST", "/api/subscriptions/generate-complete-program", {
        userId: selectedUser.uid,
        programStartDate,
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
          <TabsTrigger value="invoices">Pay-as-you-go ({allInvoices?.filter(inv => !inv.description?.includes('Complete Program')).length || 0})</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="all">All Invoices ({allInvoices?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Generate New Subscription */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
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
                  onClick={handleGenerateSubscription}
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
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Subscription Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {completeProgramUsers?.length || 0}
                    </div>
                    <div className="text-sm text-green-600">Active Programs</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">€450</div>
                    <div className="text-sm text-blue-600">Monthly Revenue</div>
                  </div>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">Monthly Billing Cycle</span>
                  </div>
                  <p className="text-sm text-purple-700">
                    Automatic billing monthly for 3 months
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Subscription Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Monthly Subscription Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {completeProgramUsers?.map((user) => {
                  const billingStatus = billingStatuses[user.uid];
                  const subscriptionStatus = billingStatus?.subscriptionStatus || 'none';
                  const needsBillingSetup = subscriptionStatus === 'none';
                  
                  return (
                    <div key={user.uid} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{user.name}</h4>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {needsBillingSetup ? (
                              <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                                Setup Required
                              </Badge>
                            ) : (
                              <Badge 
                                variant={
                                  subscriptionStatus === 'active' ? 'default' :
                                  subscriptionStatus === 'cancelled' ? 'destructive' :
                                  subscriptionStatus === 'completed' ? 'secondary' : 'outline'
                                }
                                className="text-xs"
                              >
                                {subscriptionStatus}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {needsBillingSetup && (
                            <Badge variant="destructive" className="text-xs">
                              Action Required
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                        <div>
                          <span>Start Date:</span>
                          <p className="font-medium text-foreground">
                            {formatDate(user.programStartDate)}
                          </p>
                        </div>
                        <div>
                          <span>End Date:</span>
                          <p className="font-medium text-foreground">
                            {formatDate(user.programEndDate)}
                          </p>
                        </div>
                      </div>

                      {needsBillingSetup && (
                        <Alert className="mt-3 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                          <AlertDescription className="text-sm flex items-center justify-between">
                            <span>Monthly subscription billing needs to be initiated for this user.</span>
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setProgramStartDate(user.programStartDate?.toDate ? 
                                  user.programStartDate.toDate().toISOString().split('T')[0] : 
                                  new Date().toISOString().split('T')[0]
                                );
                              }}
                              className="ml-2"
                            >
                              Start Billing
                            </Button>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  );
                })}
                
                {!completeProgramUsers?.length && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No complete program users found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Subscription Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Subscription Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {completeProgramUsers?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Object.values(billingStatuses).filter(status => status?.subscriptionStatus === 'active').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Subscriptions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {Object.values(billingStatuses).filter(status => status?.subscriptionStatus === 'none').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Need Setup</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Object.values(billingStatuses).filter(status => status?.subscriptionStatus === 'completed').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed Programs</div>
                </div>
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
              <div className="text-center py-8">
                <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pay-as-you-go invoices found</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Loading all invoices...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}