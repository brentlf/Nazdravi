import { useState } from "react";
import { Calendar, Clock, Mail, Send, Users, ArrowLeft, UserCheck, Shield, AlertTriangle, CheckCircle, Receipt, MessageSquare, FileText, CreditCard } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { Appointment } from "@/types";
import { emailService } from "@/lib/emailService";

export default function AdminEmailScheduler() {
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  
  // Get appointments for tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  const { data: allAppointments, loading } = useFirestoreCollection<Appointment>("appointments");
  
  const tomorrowAppointments = allAppointments?.filter(
    apt => apt.date === tomorrowStr && apt.status === 'confirmed'
  ) || [];

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
      const result = await emailService.sendDailyReminders(tomorrowAppointments);
      
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

  const handleTestWelcomeEmail = async () => {
    setSending(true);
    try {
      await emailService.sendWelcomeEmail(
        "info@veenutrition.com",
        "Vee Nutrition Team"
      );
      
      toast({
        title: "Test welcome email sent!",
        description: "Check info@veenutrition.com inbox to verify the welcome format.",
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
      await emailService.sendAppointmentConfirmation(
        "info@veenutrition.com",
        "Vee Nutrition Team",
        tomorrow.toLocaleDateString(),
        "10:00",
        "Initial Consultation"
      );
      
      toast({
        title: "Test confirmation email sent!",
        description: "Check info@veenutrition.com inbox to verify the confirmation format.",
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
      await emailService.sendAppointmentReminder(
        "info@veenutrition.com",
        "Vee Nutrition Team",
        tomorrow.toLocaleDateString(),
        "10:00",
        "Initial Consultation"
      );
      
      toast({
        title: "Test reminder email sent!",
        description: "Check info@veenutrition.com inbox to verify the reminder format.",
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
      await emailService.sendRescheduleRequest(
        "info@veenutrition.com",
        "Vee Nutrition Team",
        tomorrow.toLocaleDateString(),
        "10:00",
        "28/05/2025",
        "11:00"
      );
      
      toast({
        title: "Test reschedule email sent!",
        description: "Check info@veenutrition.com inbox to verify the reschedule format.",
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
      await emailService.sendInvoiceGenerated(
        "info@veenutrition.com",
        "Vee Nutrition Team",
        95.00,
        "INV-TEST123"
      );
      
      toast({
        title: "Test invoice email sent!",
        description: "Check info@veenutrition.com inbox to verify the invoice format.",
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
      await emailService.sendPaymentReminder(
        "info@veenutrition.com",
        "Vee Nutrition Team",
        95.00,
        "INV-TEST123",
        "https://payment.veenutrition.com/test"
      );
      
      toast({
        title: "Test payment reminder sent!",
        description: "Check info@veenutrition.com inbox to verify the payment reminder format.",
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
      await emailService.sendLateRescheduleNotice(
        "info@veenutrition.com",
        "Vee Nutrition Team",
        tomorrow.toLocaleDateString(),
        "10:00"
      );
      
      toast({
        title: "Test late reschedule notice sent!",
        description: "Check info@veenutrition.com inbox to verify the late reschedule format.",
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
      await emailService.sendNoShowNotice(
        "info@veenutrition.com",
        "Vee Nutrition Team",
        tomorrow.toLocaleDateString(),
        "10:00",
        47.50
      );
      
      toast({
        title: "Test no-show notice sent!",
        description: "Check info@veenutrition.com inbox to verify the no-show format.",
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
      await emailService.sendAppointmentCancelled(
        "info@veenutrition.com",
        "Vee Nutrition Team",
        tomorrow.toLocaleDateString(),
        "10:00",
        "Schedule conflict - please reschedule"
      );
      
      toast({
        title: "Test cancellation email sent!",
        description: "Check info@veenutrition.com inbox to verify the cancellation format.",
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

  return (
    <div className="min-h-screen py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header with Back Navigation */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" className="mb-4" asChild>
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold mb-2">Email Automation</h1>
          <p className="text-muted-foreground">
            Manage automated email reminders and notifications
          </p>
        </div>

        <div className="grid gap-8">
          {/* Daily Batch Operations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Daily Batch Operations
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Manual triggers for batch email operations and daily maintenance
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div>
                  <h3 className="font-semibold">Tomorrow's Appointment Reminders</h3>
                  <p className="text-sm text-muted-foreground">
                    {tomorrow.toLocaleDateString()} - {tomorrowAppointments.length} confirmed appointments
                  </p>
                </div>
                <Badge variant="secondary">
                  {tomorrowAppointments.length} clients
                </Badge>
              </div>

              {tomorrowAppointments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Reminder Recipients:</h4>
                  <div className="grid gap-2 max-h-40 overflow-y-auto">
                    {tomorrowAppointments.map((apt) => (
                      <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <div>
                          <p className="font-medium">{apt.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {apt.type} at {apt.timeslot}
                          </p>
                        </div>
                        <Badge variant="outline">{apt.email}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleSendDailyReminders}
                  disabled={sending || tomorrowAppointments.length === 0}
                  className="flex-1"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {sending ? "Sending..." : "Send All Daily Reminders"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleTestReminderEmail}
                  disabled={sending}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Test Reminder
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Client Email Automations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Client Email Automation Rules
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Automated emails sent to clients from <strong>info@veenutrition.com</strong> based on their actions and appointment status
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {/* Account & Welcome */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-5 h-5 text-green-600" />
                    <div>
                      <h4 className="font-medium">Welcome Email</h4>
                      <p className="text-sm text-muted-foreground">
                        Sent immediately when new client account is created
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Auto</Badge>
                    <Button variant="outline" size="sm" onClick={handleTestWelcomeEmail} disabled={sending}>
                      Test
                    </Button>
                  </div>
                </div>

                {/* Appointment Flow */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium">Appointment Confirmation</h4>
                      <p className="text-sm text-muted-foreground">
                        Sent when admin confirms pending appointment with Teams link
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Auto</Badge>
                    <Button variant="outline" size="sm" onClick={handleTestConfirmationEmail} disabled={sending}>
                      Test
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <div>
                      <h4 className="font-medium">Appointment Reminder</h4>
                      <p className="text-sm text-muted-foreground">
                        Sent 24 hours before confirmed appointment (manual trigger)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Manual</Badge>
                    <Button variant="outline" size="sm" onClick={handleTestReminderEmail} disabled={sending}>
                      Test
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <div>
                      <h4 className="font-medium">Reschedule Confirmation</h4>
                      <p className="text-sm text-muted-foreground">
                        Sent when client reschedule request is approved by admin
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Auto</Badge>
                    <Button variant="outline" size="sm" onClick={handleTestRescheduleEmail} disabled={sending}>
                      Test
                    </Button>
                  </div>
                </div>

                {/* Billing & Payments */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Receipt className="w-5 h-5 text-green-600" />
                    <div>
                      <h4 className="font-medium">Invoice Generated</h4>
                      <p className="text-sm text-muted-foreground">
                        Sent after session completion with payment link and invoice details
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Auto</Badge>
                    <Button variant="outline" size="sm" onClick={handleTestInvoiceEmail} disabled={sending}>
                      Test
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium">Payment Reminder</h4>
                      <p className="text-sm text-muted-foreground">
                        Manual reminder sent for unpaid invoices with payment link
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Manual</Badge>
                    <Button variant="outline" size="sm" onClick={handleTestPaymentReminderEmail} disabled={sending}>
                      Test
                    </Button>
                  </div>
                </div>

                {/* Policy Notifications */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <div>
                      <h4 className="font-medium">Late Reschedule Notice</h4>
                      <p className="text-sm text-muted-foreground">
                        Sent when client reschedules within 4 working hours (excludes after 10pm weekdays, after 12pm Saturdays, all day Sunday)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Auto</Badge>
                    <Button variant="outline" size="sm" onClick={handleTestLateRescheduleEmail} disabled={sending}>
                      Test
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <div>
                      <h4 className="font-medium">No-Show Penalty Notice</h4>
                      <p className="text-sm text-muted-foreground">
                        Sent when appointment status is changed to "no-show" in Admin → Appointments (triggers penalty invoice)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Auto</Badge>
                    <Button variant="outline" size="sm" onClick={handleTestNoShowEmail} disabled={sending}>
                      Test
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <div>
                      <h4 className="font-medium">Appointment Cancelled</h4>
                      <p className="text-sm text-muted-foreground">
                        Sent when admin cancels appointment with reason and rescheduling options
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Auto</Badge>
                    <Button variant="outline" size="sm" onClick={handleTestCancellationEmail} disabled={sending}>
                      Test
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Email Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Admin Email Notifications
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Automated notifications sent to <strong>admin@veenutrition.com</strong> when clients take actions requiring attention
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {/* Client Actions */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium">New Appointment Request</h4>
                      <p className="text-sm text-muted-foreground">
                        Notified when client books new appointment requiring confirmation
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Auto</Badge>
                    <Button variant="outline" size="sm" disabled={sending}>
                      Test
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <div>
                      <h4 className="font-medium">Reschedule Request</h4>
                      <p className="text-sm text-muted-foreground">
                        Notified when client requests to reschedule confirmed appointment
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Auto</Badge>
                    <Button variant="outline" size="sm" disabled={sending}>
                      Test
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <div>
                      <h4 className="font-medium">Health Information Update</h4>
                      <p className="text-sm text-muted-foreground">
                        Notified when client updates medical history or health assessment
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Auto</Badge>
                    <Button variant="outline" size="sm" disabled={sending}>
                      Test
                    </Button>
                  </div>
                </div>

                {/* Financial Notifications */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    <div>
                      <h4 className="font-medium">Invoice Payment Received</h4>
                      <p className="text-sm text-muted-foreground">
                        Notified when client completes payment for session or subscription invoice
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Auto</Badge>
                    <Button variant="outline" size="sm" disabled={sending}>
                      Test
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium">Service Plan Upgrade</h4>
                      <p className="text-sm text-muted-foreground">
                        Notified when client upgrades from pay-as-you-go to complete program
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Auto</Badge>
                    <Button variant="outline" size="sm" disabled={sending}>
                      Test
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                    <div>
                      <h4 className="font-medium">New Client Message</h4>
                      <p className="text-sm text-muted-foreground">
                        Notified when client sends message requiring response
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Auto</Badge>
                    <Button variant="outline" size="sm" disabled={sending}>
                      Test
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Batch Operations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Daily Batch Operations
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Manual triggers for batch email operations and daily maintenance
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div>
                  <h3 className="font-semibold">Tomorrow's Appointment Reminders</h3>
                  <p className="text-sm text-muted-foreground">
                    {tomorrow.toLocaleDateString()} - {tomorrowAppointments.length} confirmed appointments
                  </p>
                </div>
                <Badge variant="secondary">
                  {tomorrowAppointments.length} clients
                </Badge>
              </div>

              {tomorrowAppointments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Reminder Recipients:</h4>
                  <div className="grid gap-2 max-h-40 overflow-y-auto">
                    {tomorrowAppointments.map((apt) => (
                      <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <div>
                          <p className="font-medium">{apt.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {apt.type} at {apt.timeslot}
                          </p>
                        </div>
                        <Badge variant="outline">{apt.email}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleSendDailyReminders}
                  disabled={sending || tomorrowAppointments.length === 0}
                  className="flex-1"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {sending ? "Sending..." : "Send All Daily Reminders"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleTestReminderEmail}
                  disabled={sending}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Test Reminder
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Email Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-green-800 dark:text-green-200">
                      MailerLite Connected
                    </span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Email service is configured and ready to send notifications
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Service:</span> MailerLite
                  </div>
                  <div>
                    <span className="font-medium">From Email:</span> info@veenutrition.com
                  </div>
                  <div>
                    <span className="font-medium">From Name:</span> Vee Nutrition
                  </div>
                  <div>
                    <span className="font-medium">Admin Email:</span> admin@veenutrition.com
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