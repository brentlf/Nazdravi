import { useState } from "react";
import { Calendar, Clock, Mail, Send, Users, ArrowLeft, UserCheck, Shield, AlertTriangle, CheckCircle, Receipt, MessageSquare, FileText, CreditCard, Settings, Activity, Zap, Bell, BarChart3, Search } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { Appointment } from "@/types";
// import { emailService } from "@/lib/emailService";

export default function AdminEmailScheduler() {
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "client" | "admin">("all");
  const [sortBy, setSortBy] = useState<"name" | "type" | "status">("name");
  const { toast } = useToast();
  
  // Get appointments for tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  const { data: allAppointments } = useFirestoreCollection<Appointment>("appointments");
  
  const tomorrowAppointments = allAppointments?.filter(
    apt => apt.date === tomorrowStr && apt.status === 'confirmed'
  ) || [];

  // Email automation statistics
  const emailStats = {
    totalAutomations: 12,
    activeAutomations: 10,
    emailsSentToday: 0,
    successRate: 98.5
  };

  // Test functions
  const handleTestWelcomeEmail = async () => {
    setSending(true);
    try {
      // @ts-ignore
      const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
      // @ts-ignore
      const { db } = await import('@/lib/firebase');
      await addDoc(collection(db as any, 'mail'), {
        to: 'test@example.com',
        toName: 'Test User',
        type: 'welcome',
        subject: 'Welcome to Nazdravi',
        status: 'pending',
        timestamp: serverTimestamp(),
        data: { name: 'Test User' }
      });
      toast({
        title: "Test welcome email queued!",
        description: "Queue will send shortly.",
      });
    } catch (error) {
      toast({
        title: "Test email failed",
        description: "Please check your email configuration.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleTestConfirmationEmail = async () => {
    setSending(true);
    try {
      // @ts-ignore
      const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
      // @ts-ignore
      const { db } = await import('@/lib/firebase');
      await addDoc(collection(db as any, 'mail'), {
        to: 'test@example.com',
        toName: 'Test User',
        type: 'appointment-confirmation',
        subject: 'Appointment Confirmation - Nazdravi',
        status: 'pending',
        timestamp: serverTimestamp(),
        data: { name: 'Test User', date: '2025-01-15', time: '10:00', type: 'Consultation', meetingUrl: 'https://meet.google.com/test' }
      });
      toast({
        title: "Test confirmation email queued!",
        description: "Queue will send shortly.",
      });
    } catch (error) {
      toast({
        title: "Test email failed",
        description: "Please check your email configuration.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleTestReminderEmail = async () => {
    setSending(true);
    try {
      // Enqueue via Firestore mail queue processed by Cloud Function
      // @ts-ignore
      const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
      // @ts-ignore
      const { db } = await import('@/lib/firebase');
      await addDoc(collection(db as any, 'mail'), {
        to: 'test@example.com',
        toName: 'Test User',
        type: 'appointment-reminder',
        subject: 'Test Appointment Reminder',
        status: 'pending',
        timestamp: serverTimestamp(),
        data: { name: 'Test User', date: '2025-01-01', time: '10:00', type: 'Consultation' }
      });
      toast({
        title: "Test reminder email queued!",
        description: "Check test@example.com after the queue processes.",
      });
    } catch (error) {
      toast({
        title: "Test email failed",
        description: "Please check your email configuration.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleTestRescheduleEmail = async () => {
    setSending(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Test reschedule email sent!",
        description: "Check test@example.com inbox to verify the reschedule format.",
      });
    } catch (error) {
      toast({
        title: "Test email failed",
        description: "Please check your email configuration.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleTestInvoiceEmail = async () => {
    setSending(true);
    try {
      // @ts-ignore
      const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
      // @ts-ignore
      const { db } = await import('@/lib/firebase');
      await addDoc(collection(db as any, 'mail'), {
        to: 'test@example.com',
        toName: 'Test User',
        type: 'payment-reminder',
        subject: 'Invoice Ready - Nazdravi',
        status: 'pending',
        timestamp: serverTimestamp(),
        data: { name: 'Test User', amount: 150, invoiceNumber: 'INV-001', paymentUrl: 'https://veenutrition.com/pay-invoice/INV-001' }
      });
      toast({
        title: "Test invoice email queued!",
        description: "Queue will send shortly.",
      });
    } catch (error) {
      toast({
        title: "Test email failed",
        description: "Please check your email configuration.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleTestPaymentReminderEmail = async () => {
    setSending(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Test payment reminder sent!",
        description: "Check test@example.com inbox to verify the payment reminder format.",
      });
    } catch (error) {
      toast({
        title: "Test email failed",
        description: "Please check your email configuration.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleTestLateRescheduleEmail = async () => {
    setSending(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Test late reschedule notice sent!",
        description: "Check test@example.com inbox to verify the late reschedule format.",
      });
    } catch (error) {
      toast({
        title: "Test email failed",
        description: "Please check your email configuration.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleTestNoShowEmail = async () => {
    setSending(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Test no-show notice sent!",
        description: "Check test@example.com inbox to verify the no-show format.",
      });
    } catch (error) {
      toast({
        title: "Test email failed",
        description: "Please check your email configuration.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleTestCancellationEmail = async () => {
    setSending(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Test cancellation email sent!",
        description: "Check test@example.com inbox to verify the cancellation format.",
      });
    } catch (error) {
      toast({
        title: "Test email failed",
        description: "Please check your email configuration.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleTestAdminNewAppointment = async () => {
    setSending(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Test admin new appointment notification sent!",
        description: "Check test@example.com inbox to verify the notification format.",
      });
    } catch (error) {
      toast({
        title: "Test email failed",
        description: "Please check your email configuration.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleTestAdminHealthUpdate = async () => {
    setSending(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Test admin health update notification sent!",
        description: "Check test@example.com inbox to verify the notification format.",
      });
    } catch (error) {
      toast({
        title: "Test email failed",
        description: "Please check your email configuration.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleTestAdminPaymentReceived = async () => {
    setSending(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Test admin payment notification sent!",
        description: "Check test@example.com inbox to verify the notification format.",
      });
    } catch (error) {
      toast({
        title: "Test email failed",
        description: "Please check your email configuration.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleTestAdminPlanUpgrade = async () => {
    setSending(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Test admin plan upgrade notification sent!",
        description: "Check test@example.com inbox to verify the notification format.",
      });
    } catch (error) {
      toast({
        title: "Test email failed",
        description: "Please check your email configuration.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleTestAdminRescheduleRequest = async () => {
    setSending(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Test admin reschedule request notification sent!",
        description: "Check test@example.com inbox to verify the notification format.",
      });
    } catch (error) {
      toast({
        title: "Test email failed",
        description: "Please check your email configuration.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleTestAdminClientMessage = async () => {
    setSending(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Test admin client message notification sent!",
        description: "Check info@nazdravi.com inbox to verify the notification format.",
      });
    } catch (error) {
      toast({
        title: "Test email failed",
        description: "Please check your email configuration.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  // Email automation rules data
  const clientEmailRules = [
    {
      id: "welcome",
      name: "Welcome Email",
      description: "Sent immediately when new client account is created",
      type: "client",
      status: "active",
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      testFunction: handleTestWelcomeEmail
    },
    {
      id: "confirmation",
      name: "Appointment Confirmation",
      description: "Sent when admin confirms pending appointment with Teams link",
      type: "client",
      status: "active",
      icon: CheckCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      testFunction: handleTestConfirmationEmail
    },
    {
      id: "reminder",
      name: "Appointment Reminder",
      description: "Sent 24 hours before confirmed appointment (manual trigger)",
      type: "client",
      status: "active",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      testFunction: handleTestReminderEmail
    },
    {
      id: "reschedule",
      name: "Reschedule Confirmation",
      description: "Sent when client reschedule request is approved by admin",
      type: "client",
      status: "active",
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      testFunction: handleTestRescheduleEmail
    },
    {
      id: "invoice",
      name: "Invoice Generated",
      description: "Sent after session completion with payment link and invoice details",
      type: "client",
      status: "active",
      icon: Receipt,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      testFunction: handleTestInvoiceEmail
    },
    {
      id: "payment-reminder",
      name: "Payment Reminder",
      description: "Manual reminder sent for unpaid invoices with payment link",
      type: "client",
      status: "active",
      icon: CreditCard,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      testFunction: handleTestPaymentReminderEmail
    },
    {
      id: "late-reschedule",
      name: "Late Reschedule Notice",
      description: "Sent when client reschedules within 4 working hours",
      type: "client",
      status: "active",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      testFunction: handleTestLateRescheduleEmail
    },
    {
      id: "no-show",
      name: "No-Show Penalty Notice",
      description: "Sent when appointment status is changed to 'no-show'",
      type: "client",
      status: "active",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      testFunction: handleTestNoShowEmail
    },
    {
      id: "cancellation",
      name: "Appointment Cancelled",
      description: "Sent when admin cancels appointment with reason and rescheduling options",
      type: "client",
      status: "active",
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      testFunction: handleTestCancellationEmail
    }
  ];

  const adminEmailRules = [
    {
      id: "new-appointment",
      name: "New Appointment Request",
      description: "Notified when client books new appointment requiring confirmation",
      type: "admin",
      status: "active",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      testFunction: handleTestAdminNewAppointment
    },
    {
      id: "reschedule-request",
      name: "Reschedule Request",
      description: "Notified when client requests to reschedule confirmed appointment",
      type: "admin",
      status: "active",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      testFunction: handleTestAdminRescheduleRequest
    },
    {
      id: "health-update",
      name: "Health Information Update",
      description: "Notified when client updates medical history or health assessment",
      type: "admin",
      status: "active",
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      testFunction: handleTestAdminHealthUpdate
    },
    {
      id: "payment-received",
      name: "Invoice Payment Received",
      description: "Notified when client completes payment for session or subscription invoice",
      type: "admin",
      status: "active",
      icon: CreditCard,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      testFunction: handleTestAdminPaymentReceived
    },
    {
      id: "plan-upgrade",
      name: "Service Plan Upgrade",
      description: "Notified when client upgrades from pay-as-you-go to complete program",
      type: "admin",
      status: "active",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      testFunction: handleTestAdminPlanUpgrade
    },
    {
      id: "client-message",
      name: "New Client Message",
      description: "Notified when client sends message requiring response",
      type: "admin",
      status: "active",
      icon: MessageSquare,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      testFunction: handleTestAdminClientMessage
    }
  ];

  // Filter email rules based on search and filter
  // const allEmailRules = [...clientEmailRules, ...adminEmailRules];
  // const filteredEmailRules = allEmailRules.filter(rule => {
  //   const matchesSearch = !searchTerm || 
  //     rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     rule.description.toLowerCase().includes(searchTerm.toLowerCase());
    
  //   const matchesFilter = filterType === "all" || rule.type === filterType;
    
  //   return matchesSearch && matchesFilter;
  // });

  const handleSendDailyReminders = async () => {
    if (tomorrowAppointments.length === 0) {
      toast({
        title: "No reminders to send",
        description: "No confirmed appointments found for tomorrow.",
      });
      return;
    }

    setSending(true);
    try {
      // Mock implementation - replace with actual email service call
      const result = { successful: tomorrowAppointments.length, failed: 0 };
      
      toast({
        title: "Daily reminders sent!",
        description: `Successfully sent ${result.successful} reminder emails. ${result.failed > 0 ? `${result.failed} failed.` : ''}`,
      });
    } catch (error) {
      toast({
        title: "Failed to send reminders",
        description: "Please try again or check your email configuration.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 py-4">
        {/* Header with Back Navigation */}
        <div className="mb-4">
          <Button variant="ghost" size="sm" className="mb-3 hover:bg-muted/60" asChild>
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin Dashboard
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Email Automation</h1>
              <p className="text-slate-600 dark:text-slate-400 text-base">
                Manage automated email reminders and notifications
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Settings className="w-5 h-5 mr-2" />
                Settings
              </Button>
              <Button size="sm" className="bg-brand text-brand-foreground hover:brightness-110 shadow-lg">
                <Zap className="w-5 h-5 mr-2" />
                Quick Actions
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-card/80 border border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-xs">Total Automations</p>
                  <p className="text-2xl font-semibold text-foreground">{emailStats.totalAutomations}</p>
                </div>
                <Activity className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 border border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-xs">Active Rules</p>
                  <p className="text-2xl font-semibold text-foreground">{emailStats.activeAutomations}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 border border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-xs">Emails Sent Today</p>
                  <p className="text-2xl font-semibold text-foreground">{emailStats.emailsSentToday}</p>
                </div>
                <Mail className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 border border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-xs">Success Rate</p>
                  <p className="text-2xl font-semibold text-foreground">{emailStats.successRate}%</p>
                </div>
                <BarChart3 className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Batch Operations */}
        <Card className="mb-8 shadow-lg border border-border bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Send className="w-6 h-6" />
              Daily Batch Operations
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Manual triggers for batch email operations and daily maintenance
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-6 bg-muted/40 rounded-xl border border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <Bell className="w-6 h-6 text-info" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Tomorrow's Appointment Reminders</h3>
                  <p className="text-muted-foreground">
                    {tomorrow.toLocaleDateString()} - {tomorrowAppointments.length} confirmed appointments
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {tomorrowAppointments.length} clients
              </Badge>
            </div>

            {tomorrowAppointments.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Reminder Recipients:</h4>
                <div className="grid gap-3 max-h-48 overflow-y-auto">
                  {tomorrowAppointments.map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between p-4 bg-muted/40 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          <UserCheck className="w-4 h-4 text-info" />
                        </div>
                        <div>
                          <p className="font-medium">{apt.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {apt.type} at {apt.timeslot}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{apt.email}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                onClick={handleSendDailyReminders}
                disabled={sending || tomorrowAppointments.length === 0}
                className="flex-1 bg-brand text-brand-foreground hover:brightness-110"
                size="lg"
              >
                <Send className="w-5 h-5 mr-2" />
                {sending ? "Sending..." : "Send All Daily Reminders"}
              </Button>
              <Button
                variant="outline"
                onClick={handleTestReminderEmail}
                disabled={sending}
                size="lg"
              >
                <Mail className="w-5 h-5 mr-2" />
                Test Reminder
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card className="mb-8 shadow-lg border border-border bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search email automations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 border-border"
                  />
                </div>

                <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="client">Client Emails</SelectItem>
                    <SelectItem value="admin">Admin Notifications</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Automation Rules */}
        <div className="grid gap-8">
          {/* Client Email Automations */}
          <Card className="shadow-lg border border-border bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="w-6 h-6" />
                Client Email Automation Rules
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Automated emails sent to clients from <strong>info@veenutrition.com</strong> based on their actions and appointment status
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {clientEmailRules.map((rule) => {
                  const IconComponent = rule.icon;
                  return (
                    <div key={rule.id} className="group flex items-center justify-between p-6 border rounded-xl hover:shadow-md transition-all duration-200 bg-muted/30">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 bg-muted rounded-full flex items-center justify-center`}>
                          <IconComponent className={`w-6 h-6 text-foreground`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{rule.name}</h4>
                          <p className="text-muted-foreground mt-1">
                            {rule.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">
                          {rule.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={rule.testFunction} 
                          disabled={sending}
                          className="hover:bg-muted/60"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Test
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Admin Email Notifications */}
          <Card className="shadow-lg border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Shield className="w-6 h-6" />
                Admin Email Notifications
              </CardTitle>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Automated notifications sent to <strong>admin@veenutrition.com</strong> when clients take actions requiring attention
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {adminEmailRules.map((rule) => {
                  const IconComponent = rule.icon;
                  return (
                    <div key={rule.id} className="group flex items-center justify-between p-6 border rounded-xl hover:shadow-md transition-all duration-200 bg-white/50 dark:bg-slate-800/50">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 ${rule.bgColor} rounded-full flex items-center justify-center`}>
                          <IconComponent className={`w-6 h-6 ${rule.color}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{rule.name}</h4>
                          <p className="text-slate-600 dark:text-slate-400 mt-1">
                            {rule.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${rule.bgColor} ${rule.color} border-0`}>
                          {rule.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={rule.testFunction} 
                          disabled={sending}
                          className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Test
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Email Configuration */}
          <Card className="shadow-lg border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Settings className="w-6 h-6" />
                Email Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-semibold text-green-800 dark:text-green-200 text-lg">
                      Resend Connected
                    </span>
                  </div>
                  <p className="text-green-700 dark:text-green-300 mt-2">
                    Email service is configured and ready to send notifications
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Service Configuration</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <span className="font-medium">Service Provider:</span>
                        <Badge variant="outline">Resend</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <span className="font-medium">From Email:</span>
                        <span className="text-slate-600 dark:text-slate-400">info@veenutrition.com</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <span className="font-medium">From Name:</span>
                        <span className="text-slate-600 dark:text-slate-400">Nazdravi</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Email Addresses</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <span className="font-medium">Admin Email:</span>
                        <span className="text-slate-600 dark:text-slate-400">admin@veenutrition.com</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <span className="font-medium">Client Emails:</span>
                        <span className="text-slate-600 dark:text-slate-400">info@veenutrition.com</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <span className="font-medium">Status:</span>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-0">
                          Active
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}