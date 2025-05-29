import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Clock, Plus, CheckCircle, XCircle, AlertCircle, Shield, ArrowLeft, Edit, Trash2, FileText, ChevronDown, ChevronUp, ExternalLink, Video } from "lucide-react";
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
import { useCancellationPolicy } from "@/hooks/useCancellationPolicy";
import { Link } from "wouter";

const appointmentSchema = z.object({
  type: z.enum(["Initial", "Follow-up"], {
    required_error: "Please select a consultation type",
  }),
  goals: z.string().min(10, "Please describe your goals (minimum 10 characters)"),
  date: z.string().min(1, "Please select a preferred date"),
  timeslot: z.string().min(1, "Please select a time slot"),
});

// Pre-evaluation form schema
const preEvaluationSchema = z.object({
  // Basic Information
  age: z.number().min(16, "Must be at least 16 years old").max(120),
  gender: z.enum(["male", "female", "other", "prefer-not-to-say"]),
  height: z.number().min(100, "Height must be at least 100cm").max(250, "Height must be less than 250cm"),
  weight: z.number().min(30, "Weight must be at least 30kg").max(300, "Weight must be less than 300kg"),
  
  // Health Goals
  primaryGoal: z.enum([
    "weight-loss", 
    "weight-gain", 
    "muscle-building", 
    "general-health", 
    "sports-performance", 
    "medical-condition-support",
    "other"
  ]),
  specificGoals: z.string().min(20, "Please describe your specific goals (minimum 20 characters)"),
  
  // Current Health Status
  chronicConditions: z.array(z.string()).default([]),
  currentMedications: z.string().optional(),
  allergies: z.string().optional(),
  
  // Lifestyle
  activityLevel: z.enum(["sedentary", "lightly-active", "moderately-active", "very-active", "extremely-active"]),
  sleepHours: z.number().min(3).max(12),
  stressLevel: z.number().min(1).max(10),
  
  // Dietary Information
  currentDiet: z.enum(["omnivore", "vegetarian", "vegan", "keto", "paleo", "mediterranean", "other"]),
  foodRestrictions: z.string().optional(),
  waterIntake: z.number().min(0).max(10),
  alcoholConsumption: z.enum(["never", "rarely", "weekly", "daily"]),
  
  // Additional Information
  previousNutritionCoaching: z.boolean().default(false),
  additionalNotes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;
type PreEvaluationFormData = z.infer<typeof preEvaluationSchema>;

export default function DashboardAppointments() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [showAllAppointments, setShowAllAppointments] = useState(false);
  const [isPreEvaluationOpen, setIsPreEvaluationOpen] = useState(false);
  const [hasPreEvaluation, setHasPreEvaluation] = useState(false);
  const { effectiveUser: user, isAdminViewingClient } = useAuth();
  const { toast } = useToast();
  const { add: addAppointment, update: updateAppointment, loading: booking } = useFirestoreActions("appointments");
  const { add: addPreEvaluation, loading: submittingPreEval } = useFirestoreActions("preEvaluations");

  // Check if user has completed consent form from Firebase
  const { data: consentRecords } = useFirestoreCollection("consentRecords", [
    where("userId", "==", user?.uid || "")
  ]);

  // Check if user has completed pre-evaluation form
  const { data: preEvaluationRecords } = useFirestoreCollection("preEvaluations", [
    where("userId", "==", user?.uid || "")
  ]);

  useEffect(() => {
    if (user?.uid && consentRecords) {
      const hasValidConsent = consentRecords.some(record => 
        record.languageConfirmation === true && 
        record.privateServiceConsent === true &&
        record.status === "completed"
      );
      setHasConsent(hasValidConsent);
    }
  }, [consentRecords, user?.uid]);

  useEffect(() => {
    if (user?.uid && preEvaluationRecords) {
      const hasCompletedPreEval = preEvaluationRecords.some(record => 
        record.status === "completed"
      );
      setHasPreEvaluation(hasCompletedPreEval);
    }
  }, [preEvaluationRecords, user?.uid]);

  // Get available time slots for selected date
  const { availableSlots, loading: slotsLoading } = useAvailableSlots(selectedDate);
  const { availableSlots: rescheduleSlots, loading: rescheduleSlotsLoading } = useAvailableSlots(rescheduleDate);

  const parseAppointmentDate = (appointment: any) => {
    if (appointment.date?.seconds) {
      return new Date(appointment.date.seconds * 1000);
    }
    if (typeof appointment.date === 'string') {
      return new Date(appointment.date);
    }
    if (appointment.date instanceof Date) {
      return appointment.date;
    }
    return new Date();
  };

  const canModifyAppointment = (appointment: any) => {
    try {
      const appointmentDate = parseAppointmentDate(appointment);
      const appointmentDateTime = new Date(`${appointmentDate.toISOString().split('T')[0]}T${appointment.timeslot}`);
      const now = new Date();
      const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      // Allow modifications for appointments that are at least 30 minutes in the future
      // And not already completed or cancelled
      return hoursUntilAppointment > 0.5 && 
             appointment.status !== "done" && 
             appointment.status !== "cancelled" &&
             appointment.status !== "cancelled_client";
    } catch (error) {
      console.error('Error parsing appointment date:', error);
      return false;
    }
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

  const preEvaluationForm = useForm<PreEvaluationFormData>({
    resolver: zodResolver(preEvaluationSchema),
    defaultValues: {
      age: 25,
      gender: "prefer-not-to-say",
      height: 170,
      weight: 70,
      primaryGoal: "general-health",
      specificGoals: "",
      chronicConditions: [],
      currentMedications: "",
      allergies: "",
      activityLevel: "moderately-active",
      sleepHours: 8,
      stressLevel: 5,
      currentDiet: "omnivore",
      foodRestrictions: "",
      waterIntake: 2,
      alcoholConsumption: "rarely",
      previousNutritionCoaching: false,
      additionalNotes: "",
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
        phone: "",
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

  const onPreEvaluationSubmit = async (data: PreEvaluationFormData) => {
    if (!user) return;

    try {
      await addPreEvaluation({
        ...data,
        userId: user.uid,
        userEmail: user.email,
        userName: user.name || "Unknown",
        status: "completed",
        submittedAt: new Date().toISOString(),
      });

      setIsPreEvaluationOpen(false);
      setHasPreEvaluation(true);
      preEvaluationForm.reset();
      
      toast({
        title: "Pre-Evaluation Complete!",
        description: "Your health information has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleReschedule = async (newDate: string, newTimeslot: string) => {
    if (!selectedAppointment) return;

    try {
      await updateAppointment(selectedAppointment.id, {
        date: newDate,
        timeslot: newTimeslot,
        status: "pending"
      });

      setIsRescheduleOpen(false);
      setSelectedAppointment(null);
      toast({
        title: "Reschedule Requested",
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

  const handleCancel = async () => {
    if (!selectedAppointment) return;

    try {
      await updateAppointment(selectedAppointment.id, {
        status: "cancelled_client"
      });

      setIsCancelOpen(false);
      setSelectedAppointment(null);
      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been cancelled successfully.",
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

  // Sort appointments by date (newest first, oldest last)
  const sortedAppointments = effectiveAppointments?.sort((a, b) => {
    const dateA = parseAppointmentDate(a);
    const dateB = parseAppointmentDate(b);
    return dateB.getTime() - dateA.getTime(); // Reverse sort - newest first
  }) || [];

  // Get next upcoming appointment (future confirmed/pending appointments only)
  const upcomingAppointments = sortedAppointments.filter(apt => {
    const appointmentDate = parseAppointmentDate(apt);
    const appointmentDateTime = new Date(`${appointmentDate.toISOString().split('T')[0]}T${apt.timeslot}`);
    const now = new Date();
    return appointmentDateTime > now && 
           (apt.status === "confirmed" || apt.status === "pending") &&
           apt.status !== "cancelled" && 
           apt.status !== "cancelled_reschedule";
  });

  const nextAppointment = upcomingAppointments[0];

  // Generate Teams meeting URL helper
  const getTeamsUrl = (appointment: any) => {
    return appointment.teamsJoinUrl || `https://teams.microsoft.com/l/meetup-join/your-meeting-id`;
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

        {/* Consent Form Alert - Show only if not completed */}
        {!hasConsent && (
          <Card className="mb-6 border-red-200 dark:border-red-800">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                    Required: Complete Informed Consent Form
                  </h3>
                  <p className="text-red-700 dark:text-red-300 text-sm mb-4">
                    You must complete the informed consent form before booking any appointments. This is required for all nutrition consultations.
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/consent-form'}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Complete Consent Form
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pre-Evaluation Alert - Show only if not completed */}
        {!hasPreEvaluation && hasConsent && (
          <Card className="mb-6 border-orange-200 dark:border-orange-800">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-orange-500 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
                    Recommended: Complete Pre-Evaluation Form
                  </h3>
                  <p className="text-orange-700 dark:text-orange-300 text-sm mb-4">
                    Please complete your health assessment before your first appointment. This helps us provide you with personalized nutrition guidance.
                  </p>
                  <Button 
                    onClick={() => setIsPreEvaluationOpen(true)}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Complete Pre-Evaluation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Upcoming Appointment */}
        {nextAppointment && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Next Appointment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Pre-evaluation alert for this appointment */}
                {!hasPreEvaluation && (
                  <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    <div className="flex-1">
                      <p className="text-orange-800 dark:text-orange-200 text-sm font-medium">
                        Complete pre-evaluation form before this appointment
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => setIsPreEvaluationOpen(true)}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      Complete Now
                    </Button>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(nextAppointment.status)}
                    <div>
                      <p className="font-semibold">
                        {parseAppointmentDate(nextAppointment).toLocaleDateString('en-GB', {
                          weekday: 'long',
                          year: 'numeric', 
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {nextAppointment.timeslot} • {nextAppointment.type} Consultation
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(nextAppointment.status)}>
                      {nextAppointment.status}
                    </Badge>
                    {nextAppointment.status === "confirmed" && (
                      <Button size="sm" asChild>
                        <a href={getTeamsUrl(nextAppointment)} target="_blank" rel="noopener noreferrer">
                          <Video className="w-4 h-4 mr-2" />
                          Join Meeting
                        </a>
                      </Button>
                    )}
                    {/* Edit options for next appointment */}
                    {canModifyAppointment(nextAppointment) && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedAppointment(nextAppointment);
                            setIsRescheduleOpen(true);
                          }}
                          title="Reschedule appointment"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedAppointment(nextAppointment);
                            setIsCancelOpen(true);
                          }}
                          title="Cancel appointment"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-8 lg:items-stretch">
          {/* My Appointments Section */}
          <div className="flex flex-col h-full">
            <Card className="flex-1 flex flex-col h-full">
              <CardHeader className="flex flex-row items-center justify-between flex-shrink-0">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  My Appointments
                </CardTitle>
                <Button 
                  onClick={() => setIsBookingOpen(true)}
                  disabled={!hasConsent}
                  className={!hasConsent ? "opacity-50 cursor-not-allowed" : ""}
                  title={!hasConsent ? "Complete informed consent form to book appointments" : "Book a new appointment"}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Book New
                </Button>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {!effectiveAppointments?.length ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="font-semibold mb-2">No appointments yet</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Book your first consultation to get started
                    </p>
                    <Button 
                      onClick={() => setIsBookingOpen(true)}
                      disabled={!hasConsent}
                      className={!hasConsent ? "opacity-50 cursor-not-allowed" : ""}
                      title={!hasConsent ? "Complete informed consent form to book appointments" : "Book your first appointment"}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Book First Appointment
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 flex-1 overflow-y-auto">
                    {(showAllAppointments ? sortedAppointments : sortedAppointments.slice(0, 3)).map((appointment) => {
                      const appointmentDate = parseAppointmentDate(appointment);
                      const isFuture = appointmentDate > new Date();
                      
                      return (
                        <div key={appointment.id} className="border rounded-lg p-4">
                          {/* Pre-evaluation alert on individual appointments */}
                          {!hasPreEvaluation && isFuture && (
                            <div className="flex items-center gap-2 mb-3 text-orange-600 dark:text-orange-400">
                              <AlertCircle className="w-4 h-4" />
                              <span className="text-sm">Pre-evaluation form required</span>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(appointment.status)}
                              <div>
                                <p className="font-medium">
                                  {appointmentDate.toLocaleDateString('en-GB')}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {appointment.timeslot} • {appointment.type}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(appointment.status)}>
                                {appointment.status}
                              </Badge>
                              
                              {/* Teams Meeting Link for confirmed appointments */}
                              {appointment.status === 'confirmed' && appointment.teamsJoinUrl && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(appointment.teamsJoinUrl, '_blank')}
                                  title="Join Teams Meeting"
                                  className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
                                >
                                  <Video className="w-3 h-3 mr-1" />
                                  Join Meeting
                                </Button>
                              )}
                              
                              {/* Show edit options for appointments that can be modified */}
                              {canModifyAppointment(appointment) && (
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedAppointment(appointment);
                                      setIsRescheduleOpen(true);
                                    }}
                                    title="Reschedule appointment"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedAppointment(appointment);
                                      setIsCancelOpen(true);
                                    }}
                                    title="Cancel appointment"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Show action buttons for different appointment states */}
                        <div className="mt-3 pt-3 border-t space-y-2">
                          {appointment.status === "confirmed" && isFuture && (
                            <Button size="sm" variant="outline" className="w-full" asChild>
                              <a href={getTeamsUrl(appointment)} target="_blank" rel="noopener noreferrer">
                                <Video className="w-4 h-4 mr-2" />
                                Join Teams Meeting
                                <ExternalLink className="w-3 h-3 ml-2" />
                              </a>
                            </Button>
                          )}
                          
                          {appointment.status === "pending" && (
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">
                                Awaiting confirmation - you'll receive an email once confirmed
                              </p>
                            </div>
                          )}
                          
                          {!isFuture && (
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">
                                {appointment.status === "done" ? "Session completed" : "Past appointment"}
                              </p>
                            </div>
                          )}
                        </div>
                        </div>
                      );
                    })}
                    
                    {/* View All/Show Less Toggle */}
                    {sortedAppointments.length > 3 && (
                      <Button
                        variant="ghost"
                        onClick={() => setShowAllAppointments(!showAllAppointments)}
                        className="w-full mt-4"
                      >
                        {showAllAppointments ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-2" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-2" />
                            View All Appointments ({sortedAppointments.length})
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Appointment Calendar & Requirements */}
          <div className="flex flex-col space-y-6 h-full">
            <Card className="flex-1 flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Appointment Calendar
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                {upcomingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {/* Mini Calendar Grid */}
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {/* Day Headers */}
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                        <div key={index} className="text-center text-xs font-medium text-muted-foreground p-2">
                          {day}
                        </div>
                      ))}
                      
                      {/* Calendar Days for Current Month */}
                      {Array.from({ length: 35 }, (_, index) => {
                        const currentDate = new Date();
                        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                        const startDate = new Date(firstDayOfMonth);
                        startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());
                        
                        const cellDate = new Date(startDate);
                        cellDate.setDate(cellDate.getDate() + index);
                        
                        const isCurrentMonth = cellDate.getMonth() === currentDate.getMonth();
                        const isToday = cellDate.toDateString() === currentDate.toDateString();
                        
                        // Check if this date has an appointment
                        const hasAppointment = upcomingAppointments.some(apt => {
                          const aptDate = parseAppointmentDate(apt);
                          return aptDate.toDateString() === cellDate.toDateString();
                        });
                        
                        return (
                          <div
                            key={index}
                            className={`
                              relative h-8 w-8 flex items-center justify-center text-xs rounded
                              ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                              ${isToday ? 'bg-primary text-primary-foreground font-bold' : ''}
                              ${hasAppointment ? 'bg-mint-green/20 border border-mint-green' : ''}
                              ${!isCurrentMonth ? 'opacity-30' : ''}
                            `}
                          >
                            {cellDate.getDate()}
                            {hasAppointment && (
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-mint-green rounded-full"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Month/Year Header */}
                    <div className="text-center border-t pt-4">
                      <h3 className="font-semibold text-lg">
                        {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                      </h3>
                    </div>

                    {/* Upcoming Appointments List - Only Future Appointments */}
                    <div className="space-y-3 border-t pt-4">
                      <h4 className="font-medium text-sm text-muted-foreground">Upcoming Sessions</h4>
                      {upcomingAppointments.slice(0, 4).map((appointment) => {
                        const appointmentDate = parseAppointmentDate(appointment);
                        const appointmentDateTime = new Date(`${appointmentDate.toISOString().split('T')[0]}T${appointment.timeslot}`);
                        const now = new Date();
                        
                        // Only show if appointment is in the future
                        if (appointmentDateTime <= now) return null;
                        
                        return (
                          <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="flex flex-col items-center">
                                <span className="text-xs font-medium text-mint-green">
                                  {appointmentDate.toLocaleDateString('en-GB', { 
                                    month: 'short' 
                                  }).toUpperCase()}
                                </span>
                                <span className="text-lg font-bold">
                                  {appointmentDate.getDate()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  {appointment.timeslot}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {appointment.type} Session
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {appointment.status}
                              </Badge>
                              {appointment.status === "confirmed" && (
                                <Button size="sm" variant="ghost" asChild>
                                  <a href={getTeamsUrl(appointment)} target="_blank" rel="noopener noreferrer">
                                    <Video className="w-3 h-3" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {upcomingAppointments.length === 0 && (
                        <p className="text-center text-sm text-muted-foreground py-4">
                          No upcoming sessions scheduled
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-muted-foreground text-sm">
                      No upcoming appointments
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Booking Requirements Status */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Account verified</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {hasConsent ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm">Informed consent</span>
                    {!hasConsent && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.location.href = '/consent-form'}
                        className="ml-auto"
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {hasPreEvaluation ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                    )}
                    <span className="text-sm">Pre-evaluation form</span>
                    {!hasPreEvaluation && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsPreEvaluationOpen(true)}
                        className="ml-auto"
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pre-Evaluation Form Dialog */}
        <Dialog open={isPreEvaluationOpen} onOpenChange={setIsPreEvaluationOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Pre-Evaluation Health Assessment
              </DialogTitle>
              <DialogDescription>
                Help us provide you with personalized nutrition guidance by completing this comprehensive health assessment.
              </DialogDescription>
            </DialogHeader>

            <Form {...preEvaluationForm}>
              <form onSubmit={preEvaluationForm.handleSubmit(onPreEvaluationSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={preEvaluationForm.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={preEvaluationForm.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={preEvaluationForm.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Height (cm)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={preEvaluationForm.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (kg)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Health Goals */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Health Goals</h3>
                  <FormField
                    control={preEvaluationForm.control}
                    name="primaryGoal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Goal</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your primary goal" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="weight-loss">Weight Loss</SelectItem>
                            <SelectItem value="weight-gain">Weight Gain</SelectItem>
                            <SelectItem value="muscle-building">Muscle Building</SelectItem>
                            <SelectItem value="general-health">General Health</SelectItem>
                            <SelectItem value="sports-performance">Sports Performance</SelectItem>
                            <SelectItem value="medical-condition-support">Medical Condition Support</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={preEvaluationForm.control}
                    name="specificGoals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specific Goals & Expectations</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your specific nutrition and health goals..."
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Additional form sections would continue here... */}

                <div className="flex justify-end gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsPreEvaluationOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submittingPreEval}
                    className="bg-mint-green hover:bg-mint-green/90 text-white"
                  >
                    {submittingPreEval ? "Submitting..." : "Complete Assessment"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Existing appointment booking dialog */}
        <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Book New Appointment</DialogTitle>
              <DialogDescription>
                Schedule your nutrition consultation
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consultation Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select consultation type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Initial">Initial Consultation</SelectItem>
                          <SelectItem value="Follow-up">Follow-up Consultation</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="goals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goals & Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your goals or what you'd like to discuss..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
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
                      <FormLabel>Time Slot</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
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
                              >
                                {slot.time} {!slot.available && "(Booked)"}
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

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsBookingOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={booking}>
                    {booking ? "Booking..." : "Book Appointment"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Reschedule Dialog */}
        <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reschedule Appointment</DialogTitle>
              <DialogDescription>
                Select a new date and time for your appointment
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">New Date</label>
                <Input 
                  type="date" 
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsRescheduleOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleReschedule(rescheduleDate, "09:00")}>
                  Reschedule
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Cancel Dialog */}
        <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Appointment</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this appointment?
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsCancelOpen(false)}>
                Keep Appointment
              </Button>
              <Button variant="destructive" onClick={handleCancel}>
                Cancel Appointment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}