import { useState } from "react";
import { Calendar, Clock, Mail, Send, Users, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  const handleTestEmail = async () => {
    setSending(true);
    try {
      await emailService.sendAppointmentReminder(
        "test@example.com",
        "Test User",
        tomorrow.toLocaleDateString(),
        "10:00",
        "Initial Consultation"
      );
      
      toast({
        title: "Test email sent!",
        description: "Check your test email inbox to verify the reminder format.",
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

        <div className="grid gap-6">
          {/* Daily Reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Daily Appointment Reminders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div>
                  <h3 className="font-semibold">Tomorrow's Appointments</h3>
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
                  <div className="grid gap-2">
                    {tomorrowAppointments.map((apt) => (
                      <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <div>
                          <p className="font-medium">{apt.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {apt.type} at {apt.timeslot}
                          </p>
                        </div>
                        <Badge>{apt.email}</Badge>
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
                  {sending ? "Sending..." : "Send Daily Reminders"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleTestEmail}
                  disabled={sending}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Test Email
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Email Automation Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Automated Email Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Welcome Emails</h4>
                    <p className="text-sm text-muted-foreground">
                      Sent automatically when new accounts are created
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Appointment Confirmations</h4>
                    <p className="text-sm text-muted-foreground">
                      Sent when admin confirms pending appointments
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Reschedule Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Admin notified when clients request reschedules
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Daily Reminders</h4>
                    <p className="text-sm text-muted-foreground">
                      Manual trigger for day-before appointment reminders
                    </p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Manual</Badge>
                </div>
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