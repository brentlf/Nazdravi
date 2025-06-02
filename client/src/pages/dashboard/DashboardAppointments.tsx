import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Clock, Plus, CheckCircle, XCircle, AlertCircle, Shield, ArrowLeft, Edit, Trash2, FileText, ChevronDown, ChevronUp, ExternalLink, Video, Crown, CreditCard, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useFirestoreCollection, useFirestoreActions, useFirestoreDocument } from "@/hooks/useFirestore";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Appointment } from "@/types";
import { where, orderBy } from "firebase/firestore";
import { useAvailableSlots } from "@/hooks/useAvailableSlots";
import { useCancellationPolicy } from "@/hooks/useCancellationPolicy";
import { Link } from "wouter";
import { FloatingOrganic, DoodleConnector } from "@/components/ui/PageTransition";

const appointmentSchema = z.object({
  type: z.enum(["Initial", "Follow-up"], {
    required_error: "Please select a consultation type",
  }),
  goals: z.string().min(10, "Please describe your goals (minimum 10 characters)"),
  date: z.string().min(1, "Please select a preferred date"),
  timeslot: z.string().min(1, "Please select a time slot"),
  servicePlan: z.enum(["pay-as-you-go", "complete-program"], {
    required_error: "Please select a service plan",
  }),
});

// Pre-evaluation form schema - matches main dashboard comprehensive version
const preEvaluationSchema = z.object({
  healthGoals: z.array(z.string()).min(1, "Please select at least one health goal"),
  currentWeight: z.string().min(1, "Current weight is required"),
  targetWeight: z.string().optional(),
  heightCm: z.string().min(1, "Height is required"),
  activityLevel: z.string().min(1, "Please select your activity level"),
  dietaryRestrictions: z.array(z.string()).default([]),
  medicalConditions: z.array(z.string()).default([]),
  medications: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  previousDietExperience: z.string().min(1, "Please describe your diet experience"),
  motivationLevel: z.string().min(1, "Please select your motivation level"),
  availableTimeForCooking: z.string().min(1, "Please select time available for cooking"),
  preferredMealTimes: z.array(z.string()).default([]),
  budgetRange: z.string().min(1, "Please select your budget range"),
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
  const [showBillingConfirmation, setShowBillingConfirmation] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<AppointmentFormData | null>(null);
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

  // Fetch user data for service plan information
  const { data: userData } = useFirestoreDocument("users", user?.uid || "");

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      type: "Follow-up",
      goals: "",
      date: "",
      timeslot: "",
      servicePlan: userData?.servicePlan || "pay-as-you-go",
    },
  });

  // Update form values when user data loads
  useEffect(() => {
    if (userData) {
      // If user has complete program, always set it to complete-program
      if (userData.servicePlan === "complete-program") {
        form.setValue("servicePlan", "complete-program");
      } else {
        form.setValue("servicePlan", userData.servicePlan || "pay-as-you-go");
      }
    }
  }, [userData, form]);

  const preEvaluationForm = useForm<PreEvaluationFormData>({
    resolver: zodResolver(preEvaluationSchema),
    defaultValues: {
      healthGoals: [],
      currentWeight: "",
      targetWeight: "",
      heightCm: "",
      activityLevel: "",
      dietaryRestrictions: [],
      medicalConditions: [],
      medications: [],
      allergies: [],
      previousDietExperience: "",
      motivationLevel: "",
      availableTimeForCooking: "",
      preferredMealTimes: [],
      budgetRange: "",
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

    // Check if user is selecting Complete Program and doesn't already have it
    if (data.servicePlan === "complete-program" && userData?.servicePlan !== "complete-program") {
      setPendingFormData(data);
      setShowBillingConfirmation(true);
      return;
    }

    // Proceed with normal submission
    await submitAppointment(data);
  };

  const submitAppointment = async (data: AppointmentFormData) => {
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

      // Update user's service plan if it has changed
      if (userData && data.servicePlan !== userData.servicePlan) {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          servicePlan: data.servicePlan,
          ...(data.servicePlan === "complete-program" && {
            programStartDate: new Date().toISOString(),
            programEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
          })
        });
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

  const handleBillingConfirmation = async () => {
    if (pendingFormData) {
      setShowBillingConfirmation(false);
      await submitAppointment(pendingFormData);
      setPendingFormData(null);
    }
  };

  const handleBillingCancellation = () => {
    setShowBillingConfirmation(false);
    setPendingFormData(null);
    // Reset the service plan selection to pay-as-you-go
    form.setValue("servicePlan", "pay-as-you-go");
  };

  const onPreEvaluationSubmit = async (data: PreEvaluationFormData) => {
    if (!user) return;

    try {
      // Save to preEvaluationForms collection
      await addPreEvaluation({
        ...data,
        userId: user.uid,
        userEmail: user.email,
        userName: user.name || "Unknown",
        status: "completed",
        submittedAt: new Date(),
        completedAt: new Date(),
      });

      // Also update user's health profile in users collection
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      const userRef = doc(db, 'users', user.uid);
      
      await updateDoc(userRef, {
        // Basic health information
        healthGoals: data.healthGoals,
        currentWeight: data.currentWeight,
        targetWeight: data.targetWeight,
        height: data.heightCm,
        activityLevel: data.activityLevel,
        
        // Medical information
        medicalConditions: data.medicalConditions,
        medications: data.medications,
        allergies: data.allergies,
        
        // Dietary information
        dietaryRestrictions: data.dietaryRestrictions,
        previousDietExperience: data.previousDietExperience,
        
        // Lifestyle information
        motivationLevel: data.motivationLevel,
        availableTimeForCooking: data.availableTimeForCooking,
        preferredMealTimes: data.preferredMealTimes,
        budgetRange: data.budgetRange,
        
        // Additional notes
        additionalNotes: data.additionalNotes,
        
        // Metadata
        healthAssessmentCompleted: true,
        healthAssessmentCompletedAt: new Date(),
        updatedAt: new Date(),
      });

      setIsPreEvaluationOpen(false);
      setHasPreEvaluation(true);
      preEvaluationForm.reset();
      
      toast({
        title: "Pre-Evaluation Complete!",
        description: "Your health information has been saved and your profile updated.",
      });
    } catch (error) {
      console.error('Pre-evaluation submission error:', error);
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
        status: "clientRescheduleRequested",
        rescheduleReason: "Client requested new appointment time",
        requestedDate: newDate,
        requestedTime: newTimeslot
      });

      setIsRescheduleOpen(false);
      setSelectedAppointment(null);
      toast({
        title: "Reschedule Requested",
        description: "Your reschedule request has been sent to admin for approval.",
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
    <div className="min-h-screen py-20 bg-gradient-to-br from-background to-muted/30 country-texture relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Back to Dashboard Navigation with organic design */}
        <div className="mb-8 relative">
          <Link href="/dashboard">
            <Button variant="ghost" className="flex items-center gap-2 text-sm mediterranean-card floating-element">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
          
          {/* Page header with handwritten accent */}
          <div className="text-center mt-8 mb-6">
            <div className="doodle-arrow mb-4">
              <h1 className="font-display text-3xl md:text-4xl mb-4 text-foreground handwritten-accent">
                Your Appointments
              </h1>
            </div>
            <p className="serif-body text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Schedule consultations and manage your wellness journey
            </p>
            
            {/* Connecting doodle */}
            <DoodleConnector direction="down" className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24" />
          </div>
        </div>

        {/* Booking Requirements - Condensed */}
        {(!hasConsent || (!hasPreEvaluation && hasConsent)) && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Booking Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!hasConsent && (
                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="font-medium text-red-800 dark:text-red-200 text-sm">Informed Consent Required</p>
                      <p className="text-red-600 dark:text-red-400 text-xs">Complete before booking appointments</p>
                    </div>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => window.location.href = '/consent-form'}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Complete
                  </Button>
                </div>
              )}
              
              {!hasPreEvaluation && hasConsent && (
                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="font-medium text-orange-800 dark:text-orange-200 text-sm">Pre-Evaluation Recommended</p>
                      <p className="text-orange-600 dark:text-orange-400 text-xs">Health assessment for personalized guidance</p>
                    </div>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => setIsPreEvaluationOpen(true)}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    Complete
                  </Button>
                </div>
              )}
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
                
                {/* Health Goals Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-sage-dark">Health Goals</h3>
                  <FormField
                    control={preEvaluationForm.control}
                    name="healthGoals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What are your primary health goals? (Select all that apply)</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { value: "weight-loss", label: "Weight Loss" },
                            { value: "weight-gain", label: "Weight Gain" },
                            { value: "muscle-building", label: "Muscle Building" },
                            { value: "improve-energy", label: "Improve Energy" },
                            { value: "better-digestion", label: "Better Digestion" },
                            { value: "manage-condition", label: "Manage Medical Condition" },
                            { value: "sports-performance", label: "Sports Performance" },
                            { value: "general-wellness", label: "General Wellness" }
                          ].map((goal) => (
                            <div key={goal.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={goal.value}
                                checked={field.value?.includes(goal.value)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([...current, goal.value]);
                                  } else {
                                    field.onChange(current.filter((item) => item !== goal.value));
                                  }
                                }}
                              />
                              <label htmlFor={goal.value} className="text-sm">{goal.label}</label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Basic Measurements */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-sage-dark">Basic Measurements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={preEvaluationForm.control}
                      name="currentWeight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Weight (kg)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 70" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={preEvaluationForm.control}
                      name="targetWeight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Weight (kg)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 65 (optional)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={preEvaluationForm.control}
                      name="heightCm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Height (cm)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 170" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Activity Level */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-sage-dark">Activity Level</h3>
                  <FormField
                    control={preEvaluationForm.control}
                    name="activityLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How would you describe your current activity level?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your activity level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
                            <SelectItem value="lightly-active">Lightly Active (light exercise 1-3 days/week)</SelectItem>
                            <SelectItem value="moderately-active">Moderately Active (moderate exercise 3-5 days/week)</SelectItem>
                            <SelectItem value="very-active">Very Active (hard exercise 6-7 days/week)</SelectItem>
                            <SelectItem value="extremely-active">Extremely Active (very hard exercise, physical job)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Health Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-sage-dark">Health Information</h3>
                  
                  <FormField
                    control={preEvaluationForm.control}
                    name="medicalConditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Do you have any medical conditions? (Select all that apply)</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { value: "diabetes", label: "Diabetes" },
                            { value: "hypertension", label: "High Blood Pressure" },
                            { value: "heart-disease", label: "Heart Disease" },
                            { value: "thyroid", label: "Thyroid Issues" },
                            { value: "digestive", label: "Digestive Issues" },
                            { value: "kidney-disease", label: "Kidney Disease" },
                            { value: "other", label: "Other" },
                            { value: "none", label: "None" }
                          ].map((condition) => (
                            <div key={condition.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={condition.value}
                                checked={field.value?.includes(condition.value)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([...current, condition.value]);
                                  } else {
                                    field.onChange(current.filter((item) => item !== condition.value));
                                  }
                                }}
                              />
                              <label htmlFor={condition.value} className="text-sm">{condition.label}</label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={preEvaluationForm.control}
                    name="medications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Are you currently taking any medications? (Select all that apply)</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { value: "blood-pressure", label: "Blood Pressure Medication" },
                            { value: "diabetes", label: "Diabetes Medication" },
                            { value: "cholesterol", label: "Cholesterol Medication" },
                            { value: "thyroid", label: "Thyroid Medication" },
                            { value: "supplements", label: "Vitamins/Supplements" },
                            { value: "other", label: "Other Prescription Drugs" },
                            { value: "none", label: "None" }
                          ].map((medication) => (
                            <div key={medication.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={medication.value}
                                checked={field.value?.includes(medication.value)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([...current, medication.value]);
                                  } else {
                                    field.onChange(current.filter((item) => item !== medication.value));
                                  }
                                }}
                              />
                              <label htmlFor={medication.value} className="text-sm">{medication.label}</label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={preEvaluationForm.control}
                    name="allergies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Do you have any food allergies or intolerances? (Select all that apply)</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { value: "dairy", label: "Dairy/Lactose" },
                            { value: "gluten", label: "Gluten" },
                            { value: "nuts", label: "Nuts" },
                            { value: "shellfish", label: "Shellfish" },
                            { value: "eggs", label: "Eggs" },
                            { value: "soy", label: "Soy" },
                            { value: "other", label: "Other" },
                            { value: "none", label: "None" }
                          ].map((allergy) => (
                            <div key={allergy.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={allergy.value}
                                checked={field.value?.includes(allergy.value)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([...current, allergy.value]);
                                  } else {
                                    field.onChange(current.filter((item) => item !== allergy.value));
                                  }
                                }}
                              />
                              <label htmlFor={allergy.value} className="text-sm">{allergy.label}</label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Dietary Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-sage-dark">Dietary Information</h3>
                  
                  <FormField
                    control={preEvaluationForm.control}
                    name="dietaryRestrictions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Do you follow any specific dietary patterns? (Select all that apply)</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { value: "vegetarian", label: "Vegetarian" },
                            { value: "vegan", label: "Vegan" },
                            { value: "keto", label: "Ketogenic" },
                            { value: "paleo", label: "Paleo" },
                            { value: "mediterranean", label: "Mediterranean" },
                            { value: "intermittent-fasting", label: "Intermittent Fasting" },
                            { value: "low-carb", label: "Low Carb" },
                            { value: "none", label: "No specific diet" }
                          ].map((diet) => (
                            <div key={diet.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={diet.value}
                                checked={field.value?.includes(diet.value)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([...current, diet.value]);
                                  } else {
                                    field.onChange(current.filter((item) => item !== diet.value));
                                  }
                                }}
                              />
                              <label htmlFor={diet.value} className="text-sm">{diet.label}</label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={preEvaluationForm.control}
                    name="previousDietExperience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Describe your previous diet and nutrition experience</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about any previous diets you've tried, what worked, what didn't work, etc."
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Lifestyle Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-sage-dark">Lifestyle Information</h3>
                  
                  <FormField
                    control={preEvaluationForm.control}
                    name="motivationLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How motivated are you to make dietary changes?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your motivation level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="very-high">Very High - Ready to make significant changes</SelectItem>
                            <SelectItem value="high">High - Willing to make moderate changes</SelectItem>
                            <SelectItem value="moderate">Moderate - Open to some changes</SelectItem>
                            <SelectItem value="low">Low - Prefer minimal changes</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={preEvaluationForm.control}
                    name="availableTimeForCooking"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How much time do you typically have available for meal preparation?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your available time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="minimal">Minimal (15-30 minutes/day)</SelectItem>
                            <SelectItem value="moderate">Moderate (30-60 minutes/day)</SelectItem>
                            <SelectItem value="substantial">Substantial (1-2 hours/day)</SelectItem>
                            <SelectItem value="extensive">Extensive (2+ hours/day)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={preEvaluationForm.control}
                    name="preferredMealTimes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What are your preferred meal times? (Select all that apply)</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { value: "early-breakfast", label: "Early Breakfast (6-7 AM)" },
                            { value: "late-breakfast", label: "Late Breakfast (8-10 AM)" },
                            { value: "mid-morning-snack", label: "Mid-Morning Snack" },
                            { value: "early-lunch", label: "Early Lunch (11 AM-12 PM)" },
                            { value: "late-lunch", label: "Late Lunch (1-2 PM)" },
                            { value: "afternoon-snack", label: "Afternoon Snack" },
                            { value: "early-dinner", label: "Early Dinner (5-6 PM)" },
                            { value: "late-dinner", label: "Late Dinner (7-8 PM)" }
                          ].map((time) => (
                            <div key={time.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={time.value}
                                checked={field.value?.includes(time.value)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([...current, time.value]);
                                  } else {
                                    field.onChange(current.filter((item) => item !== time.value));
                                  }
                                }}
                              />
                              <label htmlFor={time.value} className="text-sm">{time.label}</label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={preEvaluationForm.control}
                    name="budgetRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What is your weekly grocery budget range?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your budget range" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="budget">Budget (€50-75/week)</SelectItem>
                            <SelectItem value="moderate">Moderate (€75-100/week)</SelectItem>
                            <SelectItem value="comfortable">Comfortable (€100-150/week)</SelectItem>
                            <SelectItem value="premium">Premium (€150+/week)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Additional Notes */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-sage-dark">Additional Information</h3>
                  <FormField
                    control={preEvaluationForm.control}
                    name="additionalNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Is there anything else you'd like us to know?</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Share any additional information that might help us create a personalized nutrition plan for you..."
                            {...field}
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                      <FormLabel>Consultation Type *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid md:grid-cols-2 gap-4 mt-3"
                        >
                          <div className="relative">
                            <RadioGroupItem value="Initial" id="dashboard-initial" className="peer sr-only" />
                            <Label
                              htmlFor="dashboard-initial"
                              className={`
                                flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                                ${field.value === "Initial" 
                                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500/20" 
                                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
                                }
                              `}
                            >
                              <div className="flex items-center space-x-3">
                                <Calendar className="h-5 w-5 text-primary-500" />
                                <div>
                                  <p className="font-medium">Initial Consultation</p>
                                  <p className="text-sm text-muted-foreground">60 minutes - €89</p>
                                </div>
                              </div>
                              {field.value === "Initial" && (
                                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                              )}
                            </Label>
                          </div>
                          <div className="relative">
                            <RadioGroupItem value="Follow-up" id="dashboard-followup" className="peer sr-only" />
                            <Label
                              htmlFor="dashboard-followup"
                              className={`
                                flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                                ${field.value === "Follow-up" 
                                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500/20" 
                                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
                                }
                              `}
                            >
                              <div className="flex items-center space-x-3">
                                <Clock className="h-5 w-5 text-primary-500" />
                                <div>
                                  <p className="font-medium">Follow-up Session</p>
                                  <p className="text-sm text-muted-foreground">30 minutes - €49</p>
                                </div>
                              </div>
                              {field.value === "Follow-up" && (
                                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                              )}
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Service Plan Selection */}
                <FormField
                  control={form.control}
                  name="servicePlan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Service Plan *
                      </FormLabel>
                      <div className="space-y-3">
                        {/* Complete Program Option */}
                        <div className="relative">
                          <div 
                            className={`
                              border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
                              ${userData?.servicePlan === "complete-program"
                                ? "border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500/20"
                                : field.value === "complete-program"
                                  ? "border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500/20"
                                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
                              }
                            `}
                            onClick={() => {
                              field.onChange("complete-program");
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Crown className={`h-5 w-5 ${userData?.servicePlan === "complete-program" || field.value === "complete-program" ? "text-green-600" : "text-purple-500"}`} />
                                <div>
                                  <p className={`font-medium ${userData?.servicePlan === "complete-program" || field.value === "complete-program" ? "text-green-800 dark:text-green-200" : "text-gray-900 dark:text-gray-100"}`}>
                                    Complete Program
                                    {userData?.servicePlan === "complete-program" && (
                                      <span className="ml-2 text-green-600 font-semibold">✓ ACTIVE</span>
                                    )}
                                  </p>
                                  <p className={`text-sm ${userData?.servicePlan === "complete-program" || field.value === "complete-program" ? "text-green-700 dark:text-green-300" : "text-gray-600 dark:text-gray-400"}`}>
                                    {userData?.servicePlan === "complete-program" 
                                      ? "Currently enrolled - unlimited consultations"
                                      : "Monthly billing - €299/month unlimited consultations"
                                    }
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {(field.value === "complete-program" || userData?.servicePlan === "complete-program") && (
                                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  </div>
                                )}
                                <Badge className={
                                  userData?.servicePlan === "complete-program" || field.value === "complete-program"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                    : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                                }>
                                  {userData?.servicePlan === "complete-program" ? "Active" : field.value === "complete-program" ? "Selected" : "Monthly"}
                                </Badge>
                              </div>
                            </div>
                            
                            {userData?.servicePlan !== "complete-program" && field.value === "complete-program" && (
                              <Alert className="mt-3 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                                <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                                  Upgrade to Complete Program for unlimited consultations, personalized meal plans, and priority support.
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        </div>

                        {/* Pay-as-you-go Option */}
                        <div className="relative">
                          <div 
                            className={`
                              border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
                              ${userData?.servicePlan === "complete-program" 
                                ? "border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60" 
                                : field.value === "pay-as-you-go"
                                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500/20"
                                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
                              }
                            `}
                            onClick={() => {
                              if (userData?.servicePlan !== "complete-program") {
                                field.onChange("pay-as-you-go");
                              }
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <DollarSign className={`h-5 w-5 ${userData?.servicePlan === "complete-program" ? "text-gray-400" : "text-blue-500"}`} />
                                <div>
                                  <p className={`font-medium ${userData?.servicePlan === "complete-program" ? "text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-gray-100"}`}>
                                    Pay-as-you-go
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {userData?.servicePlan === "complete-program" 
                                      ? "Not available with Complete Program"
                                      : "Individual session billing - €89/session"
                                    }
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {field.value === "pay-as-you-go" && userData?.servicePlan !== "complete-program" && (
                                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  </div>
                                )}
                                <Badge variant={userData?.servicePlan === "complete-program" ? "secondary" : "outline"}>
                                  {userData?.servicePlan === "complete-program" ? "Disabled" : field.value === "pay-as-you-go" ? "Selected" : "Per Session"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
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

        {/* Billing Confirmation Dialog */}
        <Dialog open={showBillingConfirmation} onOpenChange={setShowBillingConfirmation}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                Complete Program Billing Confirmation
              </DialogTitle>
              <DialogDescription>
                You are about to upgrade to our Complete Program
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Complete Program Benefits</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Unlimited nutrition consultations</li>
                  <li>• Personalized meal planning</li>
                  <li>• Priority support and booking</li>
                  <li>• Comprehensive health tracking</li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-yellow-600" />
                  <span className="font-semibold text-yellow-900 dark:text-yellow-100">Billing Information</span>
                </div>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  By confirming, you will be charged <strong>€299 for the first month</strong> of the Complete Program. 
                  Your subscription will automatically renew monthly unless cancelled.
                </p>
              </div>
              
              <p className="text-xs text-muted-foreground">
                You can cancel your subscription at any time through your account settings.
              </p>
            </div>

            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={handleBillingCancellation}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleBillingConfirmation}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={booking}
              >
                {booking ? "Processing..." : "Confirm & Pay €299"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Floating background elements */}
      <FloatingOrganic className="absolute top-20 -right-20 opacity-15" size="large" delay={1} />
      <FloatingOrganic className="absolute bottom-20 -left-20 opacity-15" size="large" delay={3} />
      <FloatingOrganic className="absolute top-1/2 right-10 opacity-10" size="medium" delay={2} />
    </div>
  );
}