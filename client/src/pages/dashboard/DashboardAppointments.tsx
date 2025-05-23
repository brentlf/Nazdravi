import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Clock, Plus, CheckCircle, XCircle, AlertCircle, Shield, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useFirestoreCollection, useFirestoreActions } from "@/hooks/useFirestore";
import { Appointment } from "@/types";
import { where, orderBy } from "firebase/firestore";
import { useAvailableSlots } from "@/hooks/useAvailableSlots";
import { Link } from "wouter";

const appointmentSchema = z.object({
  type: z.enum(["Initial", "Follow-up"], {
    required_error: "Please select a consultation type",
  }),
  goals: z.string().min(10, "Please describe your goals (minimum 10 characters)"),
  date: z.string().min(1, "Please select a preferred date"),
  timeslot: z.string().min(1, "Please select a time slot"),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

export default function DashboardAppointments() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const { add: addAppointment, loading: booking } = useFirestoreActions("appointments");

  // Check if user has completed consent form
  useEffect(() => {
    const consentCompleted = localStorage.getItem('consentFormCompleted');
    setHasConsent(consentCompleted === 'true');
  }, []);

  // Get available time slots for selected date
  const { availableSlots, loading: slotsLoading } = useAvailableSlots(selectedDate);

  // Fetch user's appointments by email to ensure data consistency
  const { data: appointments, loading } = useFirestoreCollection<Appointment>("appointments", [
    where("email", "==", user?.email || ""),
    orderBy("date", "desc")
  ]);

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      type: "Follow-up",
      goals: "",
      date: "",
      timeslot: "",
    },
  });

  // Watch the selected date to update available slots
  const watchedDate = form.watch("date");
  useEffect(() => {
    if (watchedDate) {
      setSelectedDate(watchedDate);
    }
  }, [watchedDate]);

  const onSubmit = async (data: AppointmentFormData) => {
    if (!user) return;

    // Check consent requirement
    if (!hasConsent) {
      toast({
        title: "Consent Required",
        description: "Please complete the informed consent form before booking appointments.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check for duplicate bookings (same date/time)
      const duplicateCheck = appointments?.find(
        (apt) => apt.date === data.date && apt.timeslot === data.timeslot && apt.status !== "cancelled"
      );

      if (duplicateCheck) {
        toast({
          title: "Time slot unavailable",
          description: "You already have an appointment booked for this date and time.",
          variant: "destructive",
        });
        return;
      }

      await addAppointment({
        ...data,
        userId: user.uid,
        name: user.name,
        email: user.email,
        phone: "", // Client can update this in their profile
        status: "pending",
      });

      setIsBookingOpen(false);
      form.reset();
      toast({
        title: "Appointment Requested!",
        description: "We'll confirm your appointment within 24 hours.",
      });
    } catch (error) {
      toast({
        title: "Booking failed",
        description: "Please try again later or contact us directly.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "done":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "done":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      default:
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Back to Dashboard Navigation */}
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="flex items-center gap-2 text-sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Booking Requirements Status Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Booking Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Account Status */}
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <h4 className="font-medium text-green-800 dark:text-green-200">Account Verified</h4>
                    <p className="text-sm text-green-600 dark:text-green-300">Signed in as {user?.name}</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
                  Complete
                </Badge>
              </div>

              {/* Consent Status */}
              {hasConsent ? (
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <h4 className="font-medium text-green-800 dark:text-green-200">Informed Consent</h4>
                      <p className="text-sm text-green-600 dark:text-green-300">Consent form completed and recorded</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
                    Complete
                  </Badge>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    <div>
                      <h4 className="font-medium text-amber-800 dark:text-amber-200">Informed Consent Required</h4>
                      <p className="text-sm text-amber-600 dark:text-amber-300">Complete the informed consent form to enable booking</p>
                    </div>
                  </div>
                  <Button size="sm" asChild className="bg-amber-600 hover:bg-amber-700 text-white">
                    <a href="/consent-form">Complete Form</a>
                  </Button>
                </div>
              )}

              {/* Booking Status Summary */}
              {hasConsent ? (
                <div className="flex items-center justify-center p-4 bg-[#A5CBA4]/10 rounded-lg border border-[#A5CBA4]/30">
                  <div className="text-center">
                    <CheckCircle className="w-8 h-8 text-[#A5CBA4] mx-auto mb-2" />
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">Ready to Book</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">All requirements completed - you can now schedule appointments</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <XCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <h4 className="font-semibold text-gray-600 dark:text-gray-400">Booking Disabled</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Complete all requirements above to enable appointment booking</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Appointments</h1>
            <p className="text-muted-foreground">
              View and manage your nutrition consultations
            </p>
          </div>
          
          <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
            <DialogTrigger asChild>
              <Button 
                className={hasConsent ? "bg-[#A5CBA4] hover:bg-[#95bb94] text-white" : "bg-gray-400 hover:bg-gray-400 text-gray-600 cursor-not-allowed"}
                disabled={!hasConsent}
                title={!hasConsent ? "Complete consent form to enable booking" : "Book new appointment"}
              >
                <Plus className="w-4 h-4 mr-2" />
                Book Appointment
                {!hasConsent && <Shield className="w-4 h-4 ml-2" />}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Book New Appointment</DialogTitle>
                <DialogDescription>
                  Schedule your next nutrition consultation
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Consultation Type */}
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Consultation Type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                          >
                            <div>
                              <RadioGroupItem value="Initial" id="initial" className="peer sr-only" />
                              <Label
                                htmlFor="initial"
                                className="flex items-center space-x-3 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer peer-checked:border-primary-500 peer-checked:bg-primary-50 dark:peer-checked:bg-primary-900/20"
                              >
                                <Calendar className="h-5 w-5 text-primary-500" />
                                <div>
                                  <p className="font-medium">Initial Consultation</p>
                                  <p className="text-sm text-muted-foreground">60 minutes - €89</p>
                                </div>
                              </Label>
                            </div>
                            <div>
                              <RadioGroupItem value="Follow-up" id="followup" className="peer sr-only" />
                              <Label
                                htmlFor="followup"
                                className="flex items-center space-x-3 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer peer-checked:border-primary-500 peer-checked:bg-primary-50 dark:peer-checked:bg-primary-900/20"
                              >
                                <Clock className="h-5 w-5 text-primary-500" />
                                <div>
                                  <p className="font-medium">Follow-up Session</p>
                                  <p className="text-sm text-muted-foreground">30 minutes - €49</p>
                                </div>
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Goals */}
                  <FormField
                    control={form.control}
                    name="goals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What would you like to discuss?</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            placeholder="Tell us what you'd like to focus on in this session..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Date & Time */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Date</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" min={new Date().toISOString().split('T')[0]} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="timeslot"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Time</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select time slot" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {slotsLoading ? (
                                <div className="p-2 text-sm text-muted-foreground">Loading availability...</div>
                              ) : selectedDate ? (
                                availableSlots.map((slot) => (
                                  <SelectItem 
                                    key={slot.time} 
                                    value={slot.time}
                                    disabled={!slot.available}
                                    className={!slot.available ? "opacity-50" : ""}
                                  >
                                    <div className="flex items-center justify-between w-full">
                                      <span>{slot.time}</span>
                                      {!slot.available && (
                                        <span className="text-xs text-red-500 ml-2">Booked</span>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))
                              ) : (
                                <div className="p-2 text-sm text-muted-foreground">Select a date first</div>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsBookingOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={booking}
                      className="flex-1 bg-primary-500 hover:bg-primary-600"
                    >
                      {booking ? "Booking..." : "Book Appointment"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Appointments List */}
        <div className="space-y-6">
          {appointments && appointments.length > 0 ? (
            appointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(appointment.status)}
                      <div>
                        <h3 className="font-semibold text-lg">{appointment.type} Consultation</h3>
                        <p className="text-muted-foreground">
                          {new Date(appointment.date).toLocaleDateString()} at {appointment.timeslot}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">Discussion Topics</h4>
                      <p className="text-sm">{appointment.goals}</p>
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Booked on {new Date(appointment.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {appointment.status === "confirmed" && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-green-800 dark:text-green-400">
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        Your appointment is confirmed. You'll receive a reminder email 24 hours before.
                      </p>
                    </div>
                  )}

                  {appointment.status === "pending" && (
                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-400">
                        <AlertCircle className="w-4 h-4 inline mr-1" />
                        We'll confirm your appointment within 24 hours and send you a confirmation email.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No appointments yet</h3>
                <p className="text-muted-foreground mb-6">
                  Book your first consultation to start your nutrition journey
                </p>
                <Button onClick={() => setIsBookingOpen(true)} className="bg-primary-500 hover:bg-primary-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Book Your First Appointment
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
