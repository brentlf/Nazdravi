import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, User, Target, Crown, CreditCard, CheckCircle } from "lucide-react";
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
import { useFirestoreActions, useFirestoreDocument } from "@/hooks/useFirestore";
import { useAvailableSlots } from "@/hooks/useAvailableSlots";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
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
  type: z.enum(["Initial", "Follow-up"]).refine((val) => val !== undefined, {
    message: "Please select a consultation type",
  }),
  goals: z.string().min(10, "Please describe your goals (minimum 10 characters)"),
  date: z.string().min(1, "Please select a preferred date"),
  timeslot: z.string().min(1, "Please select a time slot"),
  servicePlan: z.enum(["pay-as-you-go", "complete-program"]).refine((val) => val !== undefined, {
    message: "Please select a service plan",
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
  
  // Get available time slots for selected date with error handling
  const { availableSlots, loading: slotsLoading, error: slotsError } = useAvailableSlots(selectedDate);

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
          <CheckCircle className="h-8 w-8 text-white" />
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
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Form Content */}
      <div className="p-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            {/* Personal Information - Compact Grid */}
            <div className="bg-white dark:bg-gray-700 p-2 rounded-lg border border-gray-200 dark:border-gray-600">
              <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-1">
                <User className="h-3 w-3" />
                Personal Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-gray-700 dark:text-gray-300">Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Full name" className="h-7 text-xs" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-gray-700 dark:text-gray-300">Email *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email" 
                          placeholder="your.email@example.com"
                          readOnly
                          disabled
                          className="h-7 text-xs bg-gray-100 dark:bg-gray-600"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-gray-700 dark:text-gray-300">Phone *</FormLabel>
                      <FormControl>
                        <Input {...field} type="tel" placeholder="+31 6 12345678" className="h-7 text-xs" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Type, Plan & Goals - 3 Column Layout */}
            <div className="bg-white dark:bg-gray-700 p-2 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Consultation Type */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Type *
                  </h4>
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Initial" id="initial" className="w-3 h-3" />
                              <Label htmlFor="initial" className="text-xs cursor-pointer">
                                Initial (60min - €89)
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Follow-up" id="followup" className="w-3 h-3" />
                              <Label htmlFor="followup" className="text-xs cursor-pointer">
                                Follow-up (30min - €49)
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Service Plan */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    Plan *
                  </h4>
                  <FormField
                    control={form.control}
                    name="servicePlan"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem 
                                value="pay-as-you-go" 
                                id="payasyougo" 
                                className="w-3 h-3"
                                disabled={userData?.servicePlan === "complete-program"}
                              />
                              <Label 
                                htmlFor="payasyougo" 
                                className={`text-xs cursor-pointer ${userData?.servicePlan === "complete-program" ? "text-gray-400" : ""}`}
                              >
                                Pay-as-you-go (€89)
                                {userData?.servicePlan === "complete-program" && (
                                  <span className="text-gray-400"> - Disabled</span>
                                )}
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="complete-program" id="completeprogram" className="w-3 h-3" />
                              <Label htmlFor="completeprogram" className="text-xs cursor-pointer">
                                Complete Program (€299)
                                {userData?.servicePlan === "complete-program" && (
                                  <span className="text-green-600 font-semibold"> ✓ ACTIVE</span>
                                )}
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  {/* Complete Program Disclaimer */}
                  {userData?.servicePlan === "complete-program" && (
                    <div className="mt-1 p-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <p className="text-xs text-green-700 dark:text-green-300 m-0 leading-none">You have an active Complete Program subscription. No additional charges will apply for this appointment.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Goals */}
                <div className="flex flex-col h-full">
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    Goals *
                  </h4>
                  <FormField
                    control={form.control}
                    name="goals"
                    render={({ field }) => (
                      <FormItem className="flex-1 flex flex-col">
                        <FormControl className="flex-1">
                          <Textarea
                            {...field}
                            placeholder="Your nutrition goals..."
                            className="h-full min-h-[80px] text-xs resize-none flex-1"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Schedule - 2 Column Layout */}
            <div className="bg-white dark:bg-gray-700 p-2 rounded-lg border border-gray-200 dark:border-gray-600">
              <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Schedule *
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Date */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-gray-700 dark:text-gray-300">Preferred Date</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="date" 
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => {
                            field.onChange(e);
                            setSelectedDate(e.target.value);
                            form.setValue("timeslot", "");
                          }}
                          className="h-7 text-xs"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Time */}
                <FormField
                  control={form.control}
                  name="timeslot"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-gray-700 dark:text-gray-300">Available Times</FormLabel>
                      <FormControl>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={!selectedDate}
                        >
                          <SelectTrigger className={`h-7 text-xs ${!selectedDate ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}>
                            <SelectValue placeholder={!selectedDate ? "Select date first" : "Select time slot"} />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600">
                            {slotsLoading ? (
                              <SelectItem value="loading" disabled>Loading...</SelectItem>
                            ) : slotsError ? (
                              <SelectItem value="error" disabled>Error loading slots</SelectItem>
                            ) : availableSlots.length > 0 ? (
                              availableSlots.map((slot) => (
                                <SelectItem key={slot.time} value={slot.time} className="text-xs">
                                  {slot.time}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-slots" disabled>No slots available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      {!selectedDate && (
                        <p className="text-xs text-gray-500 mt-1">Please select a preferred date first</p>
                      )}
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button 
                type="submit" 
                disabled={loading || !form.formState.isValid} 
                className={`w-full h-8 text-xs font-semibold shadow-lg transition-colors ${
                  form.formState.isValid && !loading
                    ? "bg-blue-200 hover:bg-blue-300 text-blue-900 border border-blue-400"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-600 border border-gray-400 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-900"></div>
                    Submitting Request...
                  </div>
                ) : form.formState.isValid ? (
                  "📅 Request Appointment"
                ) : (
                  "Complete All Required Fields"
                )}
              </Button>
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
            
            <p className="text-xs text-gray-600 dark:text-gray-400">
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
