import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Clock, User, Mail, Phone, Target, AlertCircle, Crown, CreditCard, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import { useFirestoreActions, useFirestoreCollection, useFirestoreDocument } from "@/hooks/useFirestore";
import { useAvailableSlots } from "@/hooks/useAvailableSlots";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const appointmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
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

type AppointmentFormData = z.infer<typeof appointmentSchema>;

export function AppointmentForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [showBillingConfirmation, setShowBillingConfirmation] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<AppointmentFormData | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: userData } = useFirestoreDocument("users", user?.uid || "");
  
  // Get URL parameters to check if service plan was pre-selected
  const urlParams = new URLSearchParams(window.location.search);
  const preSelectedPlan = urlParams.get('plan') as "pay-as-you-go" | "complete-program" | null;
  const { add, loading } = useFirestoreActions("appointments");
  
  // Get available time slots for selected date
  const { availableSlots, loading: slotsLoading } = useAvailableSlots(selectedDate);

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: "",
      type: "Initial",
      goals: "",
      date: "",
      timeslot: "",
      servicePlan: preSelectedPlan || userData?.servicePlan || "pay-as-you-go",
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
    // Only allow preSelectedPlan if user doesn't have complete program active
    if (preSelectedPlan && userData?.servicePlan !== "complete-program") {
      form.setValue("servicePlan", preSelectedPlan);
    }
  }, [userData, preSelectedPlan, form]);

  const timeSlots = [
    "09:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "14:00 - 15:00",
    "15:00 - 16:00",
    "16:00 - 17:00",
  ];

  const onSubmit = async (data: AppointmentFormData) => {
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
    try {
      // Double-check availability before booking to prevent conflicts
      const appointmentsRef = collection(db, "appointments");
      const conflictQuery = query(
        appointmentsRef,
        where("date", "==", data.date),
        where("timeslot", "==", data.timeslot),
        where("status", "in", ["pending", "confirmed"])
      );
      
      const conflictSnapshot = await getDocs(conflictQuery);
      
      if (!conflictSnapshot.empty) {
        toast({
          title: "Time slot unavailable",
          description: "This time slot was just booked by someone else. Please select a different time.",
          variant: "destructive",
        });
        return;
      }

      // Also check admin unavailable slots
      const unavailableRef = collection(db, "unavailableSlots");
      const unavailableQuery = query(
        unavailableRef,
        where("date", "==", data.date)
      );
      
      const unavailableSnapshot = await getDocs(unavailableQuery);
      const unavailableSlots = unavailableSnapshot.docs.flatMap(doc => doc.data().timeslots || []);
      
      if (unavailableSlots.includes(data.timeslot)) {
        toast({
          title: "Time slot unavailable",
          description: "This time slot is no longer available. Please select a different time.",
          variant: "destructive",
        });
        return;
      }

      // If we get here, the slot is still available - proceed with booking
      await add({
        ...data,
        userId: user?.uid || "anonymous", // Use actual logged-in user ID
        email: user?.email || data.email, // Ensure email is always stored
        status: "pending",
        createdAt: new Date(),
        requestId: `${data.date}-${data.timeslot}-${Date.now()}`, // Unique identifier
      });

      // Update user's service plan if they selected complete program and don't already have it
      if (data.servicePlan === "complete-program" && userData?.servicePlan !== "complete-program" && user?.uid) {
        const userRef = doc(db, "users", user.uid);
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 3); // 3 months program

        await updateDoc(userRef, {
          servicePlan: "complete-program",
          programStartDate: startDate,
          programEndDate: endDate,
          updatedAt: new Date(),
        });
      }

      setIsSubmitted(true);
      toast({
        title: "Appointment Requested!",
        description: "We'll confirm your appointment within 24 hours.",
      });
    } catch (error) {
      console.error("Booking error:", error);
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

  if (isSubmitted) {
    return (
      <div className="text-center p-8 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
          Appointment Request Submitted!
        </h3>
        <p className="text-green-600 dark:text-green-300">
          Thank you for your interest. We'll confirm your appointment within 24 hours and send you a confirmation email.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
      {/* Form Header */}
      <div className="bg-primary-500 px-8 py-6">
        <h3 className="text-xl font-semibold text-white">Schedule Your Appointment</h3>
        <p className="text-primary-100 mt-2">
          Fill out the form below and we'll get back to you within 24 hours
        </p>
      </div>

      {/* Form Content */}
      <div className="p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name *
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter your full name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address *
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="email" 
                        placeholder="your.email@example.com"
                        readOnly
                        disabled
                        className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">Using your account email address</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number *
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" placeholder="+31 6 12345678" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Consultation Type */}
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
                        <RadioGroupItem value="Initial" id="initial" className="peer sr-only" />
                        <Label
                          htmlFor="initial"
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
                        <RadioGroupItem value="Follow-up" id="followup" className="peer sr-only" />
                        <Label
                          htmlFor="followup"
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
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid gap-4 mt-3"
                    >
                      <div>
                        <RadioGroupItem 
                          value="pay-as-you-go" 
                          id="payasyougo" 
                          className="peer sr-only" 
                          disabled={userData?.servicePlan === "complete-program"}
                        />
                        <Label
                          htmlFor="payasyougo"
                          className={`flex items-center justify-between p-4 border-2 rounded-lg transition-all duration-200 ${
                            userData?.servicePlan === "complete-program" 
                              ? "border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60" 
                              : "border-gray-200 dark:border-gray-600 cursor-pointer peer-checked:border-primary-500 peer-checked:bg-primary-50 dark:peer-checked:bg-primary-900/20"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <DollarSign className={`h-5 w-5 ${userData?.servicePlan === "complete-program" ? "text-gray-400" : "text-blue-500"}`} />
                            <div>
                              <p className={`font-medium ${userData?.servicePlan === "complete-program" ? "text-gray-500 dark:text-gray-400" : ""}`}>
                                Pay As You Go
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {userData?.servicePlan === "complete-program" ? "Not available - Complete Program active" : "Individual session billing"}
                              </p>
                            </div>
                          </div>
                          <Badge variant={userData?.servicePlan === "complete-program" ? "secondary" : "outline"}>
                            {userData?.servicePlan === "complete-program" ? "Disabled" : "Per Session"}
                          </Badge>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="complete-program" id="completeprogram" className="peer sr-only" />
                        <Label
                          htmlFor="completeprogram"
                          className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                            userData?.servicePlan === "complete-program"
                              ? "border-green-500 bg-green-50 dark:bg-green-900/20 border-2"
                              : "border-gray-200 dark:border-gray-600 peer-checked:border-primary-500 peer-checked:bg-primary-50 dark:peer-checked:bg-primary-900/20"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <Crown className={`h-5 w-5 ${userData?.servicePlan === "complete-program" ? "text-green-600" : "text-purple-500"}`} />
                            <div>
                              <p className={`font-medium ${userData?.servicePlan === "complete-program" ? "text-green-800 dark:text-green-200" : ""}`}>
                                Complete Program (3 Months)
                                {userData?.servicePlan === "complete-program" && (
                                  <span className="ml-2 text-green-600 font-semibold">✓ ACTIVE</span>
                                )}
                              </p>
                              <p className={`text-sm ${userData?.servicePlan === "complete-program" ? "text-green-700 dark:text-green-300" : "text-muted-foreground"}`}>
                                {userData?.servicePlan === "complete-program" 
                                  ? "Currently enrolled - unlimited consultations" 
                                  : "Monthly billing with unlimited consultations"
                                }
                              </p>
                            </div>
                          </div>
                          <Badge className={
                            userData?.servicePlan === "complete-program"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                          }>
                            {userData?.servicePlan === "complete-program" ? "Active" : "Monthly"}
                          </Badge>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  
                  {/* Billing Information */}
                  {userData?.servicePlan === "complete-program" && (
                    <Alert className="mt-3 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                      <Crown className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-700 dark:text-green-300">
                        <strong>Complete Program Active:</strong> You won't be billed for this appointment. Your program includes unlimited consultations until {userData.programEndDate ? new Date(userData.programEndDate.toDate()).toLocaleDateString() : "program end"}.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {form.watch("servicePlan") === "complete-program" && userData?.servicePlan !== "complete-program" && (
                    <Alert className="mt-3 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                      <AlertCircle className="h-4 w-4 text-purple-600" />
                      <AlertDescription className="text-purple-700 dark:text-purple-300">
                        <strong>Upgrade to Complete Program:</strong> You'll be billed monthly (€250/month) starting after this appointment. Includes unlimited consultations for 3 months.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {form.watch("servicePlan") === "pay-as-you-go" && (
                    <Alert className="mt-3 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-700 dark:text-blue-300">
                        <strong>Pay As You Go:</strong> You'll be billed per session. Initial consultation: €89, Follow-up sessions: €49.
                      </AlertDescription>
                    </Alert>
                  )}
                  
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
                  <FormLabel className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    What are your nutrition goals? *
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={4}
                      placeholder="Tell us about your goals, dietary preferences, and what you'd like to achieve..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preferred Date & Time */}
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Date</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="date" 
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => {
                          field.onChange(e);
                          setSelectedDate(e.target.value);
                          // Reset time slot when date changes
                          form.setValue("timeslot", "");
                        }}
                      />
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
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Available Time Slots
                      {slotsLoading && selectedDate && (
                        <span className="text-xs text-muted-foreground">(Loading...)</span>
                      )}
                    </FormLabel>
                    {selectedDate ? (
                      availableSlots.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          {availableSlots.map((slot) => (
                            <Button
                              key={slot.time}
                              type="button"
                              variant={field.value === slot.time ? "default" : "outline"}
                              disabled={!slot.available}
                              onClick={() => field.onChange(slot.time)}
                              className={`h-12 text-sm ${
                                !slot.available 
                                  ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' 
                                  : field.value === slot.time
                                  ? 'bg-primary-500 text-white'
                                  : 'hover:bg-primary-50'
                              }`}
                            >
                              {slot.time}
                              {!slot.available && (
                                <span className="ml-1 text-xs">(Booked)</span>
                              )}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-muted-foreground bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                          <p className="text-sm">No available slots for this date</p>
                          <p className="text-xs">Please select a different date</p>
                        </div>
                      )
                    ) : (
                      <div className="p-4 text-center text-muted-foreground bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Calendar className="w-6 h-6 mx-auto mb-2" />
                        <p className="text-sm">Please select a date first</p>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all duration-200"
                size="lg"
              >
                {loading ? "Booking..." : "Book My Consultation"}
              </Button>
              <p className="text-sm text-muted-foreground text-center mt-3">
                We'll confirm your appointment within 24 hours
              </p>
            </div>
          </form>
        </Form>
      </div>

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
              disabled={loading}
            >
              {loading ? "Processing..." : "Confirm & Pay €299"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
