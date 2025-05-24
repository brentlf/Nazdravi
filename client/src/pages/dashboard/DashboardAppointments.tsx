import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Clock, Plus, CheckCircle, XCircle, AlertCircle, Shield, ArrowLeft, Edit, Trash2 } from "lucide-react";
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
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const { effectiveUser: user, isAdminViewingClient } = useAuth();
  const { toast } = useToast();
  const { add: addAppointment, update: updateAppointment, loading: booking } = useFirestoreActions("appointments");

  // Check if user has completed consent form from Firebase
  const { data: consentRecords } = useFirestoreCollection("consentRecords", [
    where("userId", "==", user?.uid || "")
  ]);

  useEffect(() => {
    if (user?.uid && consentRecords) {
      // Check if any consent record has the required consents (based on your Firebase structure)
      const hasValidConsent = consentRecords.some(record => 
        record.languageConfirmation === true && 
        record.privateServiceConsent === true &&
        record.status === "completed"
      );
      setHasConsent(hasValidConsent);
    }
  }, [consentRecords, user?.uid]);

  // Get available time slots for selected date
  const { availableSlots, loading: slotsLoading } = useAvailableSlots(selectedDate);
  const { availableSlots: rescheduleSlots, loading: rescheduleSlotsLoading } = useAvailableSlots(rescheduleDate);

  // Helper function to safely parse dates from Firebase
  const parseAppointmentDate = (appointment: any) => {
    // Handle Firebase Timestamp objects
    if (appointment.date?.seconds) {
      return new Date(appointment.date.seconds * 1000);
    }
    // Handle date strings
    if (typeof appointment.date === 'string') {
      return new Date(appointment.date);
    }
    // Handle Date objects
    if (appointment.date instanceof Date) {
      return appointment.date;
    }
    return new Date(); // Fallback to current date
  };

  const parseCreatedAt = (appointment: any) => {
    if (appointment.createdAt?.seconds) {
      return new Date(appointment.createdAt.seconds * 1000);
    }
    if (typeof appointment.createdAt === 'string') {
      return new Date(appointment.createdAt);
    }
    if (appointment.createdAt instanceof Date) {
      return appointment.createdAt;
    }
    return new Date();
  };

  // Helper function to check if appointment can be modified
  const canModifyAppointment = (appointment: any) => {
    try {
      const appointmentDate = parseAppointmentDate(appointment);
      const appointmentDateTime = new Date(`${appointmentDate.toISOString().split('T')[0]}T${appointment.timeslot}`);
      const now = new Date();
      const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      console.log('Appointment modification check:', {
        appointmentDate: appointmentDate.toISOString(),
        appointmentTime: appointment.timeslot,
        appointmentDateTime: appointmentDateTime.toISOString(),
        currentTime: now.toISOString(),
        hoursUntil: hoursUntilAppointment,
        canModify: hoursUntilAppointment > 0.5
      });
      
      // Allow modifications up to 30 minutes before for testing
      return hoursUntilAppointment > 0.5;
    } catch (error) {
      console.error('Error parsing appointment date:', error);
      return false;
    }
  };

  // Helper function to get late cancellation fee info
  const isLateCancellation = (appointment: any) => {
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.timeslot}`);
    const now = new Date();
    const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilAppointment <= 2 && hoursUntilAppointment > 0;
  };

  // Fetch user's appointments using consistent userId field
  const { data: appointments, loading } = useFirestoreCollection<Appointment>("appointments", [
    where("userId", "==", user?.uid || ""),
    orderBy("date", "desc")
  ]);

  // Temporary fallback: Also fetch by email for backwards compatibility
  const { data: appointmentsByEmail } = useFirestoreCollection<Appointment>("appointments", [
    where("email", "==", user?.email || ""),
    orderBy("date", "desc")
  ]);

  // Use userId data if available, otherwise fall back to email data
  const effectiveAppointments = appointments?.length ? appointments : appointmentsByEmail;

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
      const duplicateCheck = effectiveAppointments?.find(
        (apt) => apt.date === data.date && apt.timeslot === data.timeslot && apt.status !== "cancelled" && apt.status !== "cancelled_reschedule"
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

  // Handle appointment reschedule
  const handleReschedule = async (newDate: string, newTimeslot: string) => {
    if (!selectedAppointment) return;

    try {
      await updateAppointment(selectedAppointment.id, {
        date: newDate,
        timeslot: newTimeslot,
        status: "pending" // Reset to pending for admin confirmation
      });

      setIsRescheduleOpen(false);
      setSelectedAppointment(null);
      setRescheduleDate("");
      toast({
        title: "Appointment Rescheduled!",
        description: "We'll confirm your new appointment time within 24 hours.",
      });
    } catch (error) {
      toast({
        title: "Reschedule failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    }
  };

  // Handle appointment cancellation
  const handleCancel = async () => {
    if (!selectedAppointment) return;

    try {
      await updateAppointment(selectedAppointment.id, {
        status: "cancelled"
      });

      setIsCancelOpen(false);
      setSelectedAppointment(null);
      
      const isLate = isLateCancellation(selectedAppointment);
      toast({
        title: "Appointment Cancelled",
        description: isLate 
          ? "Late cancellation fee may apply. We'll contact you regarding any charges."
          : "Your appointment has been cancelled successfully.",
        variant: isLate ? "destructive" : "default",
      });
    } catch (error) {
      toast({
        title: "Cancellation failed",
        description: "Please try again or contact us directly.",
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
          {effectiveAppointments && effectiveAppointments.length > 0 ? (
            effectiveAppointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(appointment.status)}
                      <div>
                        <h3 className="font-semibold text-lg">{appointment.type} Consultation</h3>
                        <p className="text-muted-foreground">
                          {parseAppointmentDate(appointment).toLocaleDateString()} at {appointment.timeslot}
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
                      <span>Booked on {parseCreatedAt(appointment).toLocaleDateString()}</span>
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

                  {/* Appointment Management Buttons - Always show for testing */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setIsRescheduleOpen(true);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Reschedule
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setIsCancelOpen(true);
                      }}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                      Cancel
                    </Button>
                  </div>
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

        {/* Reschedule Dialog */}
        <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Reschedule Appointment</DialogTitle>
              <DialogDescription>
                Choose a new date and time for your {selectedAppointment?.type} consultation
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="reschedule-date">New Date</Label>
                <Input
                  id="reschedule-date"
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {rescheduleDate && (
                <div>
                  <Label>Available Time Slots</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {rescheduleSlotsLoading ? (
                      <p className="text-sm text-muted-foreground col-span-2">Loading available times...</p>
                    ) : rescheduleSlots.length > 0 ? (
                      rescheduleSlots.map((slot) => (
                        <Button
                          key={slot.time}
                          variant="outline"
                          size="sm"
                          disabled={!slot.available}
                          onClick={() => handleReschedule(rescheduleDate, slot.time)}
                          className="text-sm"
                        >
                          {slot.time}
                        </Button>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground col-span-2">No available slots for this date</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Cancel Dialog */}
        <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Cancel Appointment</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel your {selectedAppointment?.type} consultation on{' '}
                {selectedAppointment && new Date(selectedAppointment.date).toLocaleDateString()} at {selectedAppointment?.timeslot}?
              </DialogDescription>
            </DialogHeader>
            
            {selectedAppointment && isLateCancellation(selectedAppointment) && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-orange-800 dark:text-orange-200">Late Cancellation Notice</p>
                    <p className="text-orange-700 dark:text-orange-300 mt-1">
                      Cancelling with less than 2 hours notice may result in a late cancellation fee. 
                      We'll contact you regarding any applicable charges.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsCancelOpen(false)}
                className="flex-1"
              >
                Keep Appointment
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancel}
                className="flex-1"
              >
                Cancel Appointment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
