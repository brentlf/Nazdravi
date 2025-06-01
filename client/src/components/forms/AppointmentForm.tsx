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
import { useFirestoreActions, useFirestoreCollection } from "@/hooks/useFirestore";
import { useAvailableSlots } from "@/hooks/useAvailableSlots";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

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
  const { toast } = useToast();
  const { add, loading } = useFirestoreActions("appointments");
  const { user } = useAuth();
  
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
    },
  });

  const timeSlots = [
    "09:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "14:00 - 15:00",
    "15:00 - 16:00",
    "16:00 - 17:00",
  ];

  const onSubmit = async (data: AppointmentFormData) => {
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
                      <div>
                        <RadioGroupItem value="Initial" id="initial" className="peer sr-only" />
                        <Label
                          htmlFor="initial"
                          className="flex items-center space-x-3 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer peer-checked:border-primary-500 peer-checked:bg-primary-50 dark:peer-checked:bg-primary-900/20 transition-all duration-200"
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
                          className="flex items-center space-x-3 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer peer-checked:border-primary-500 peer-checked:bg-primary-50 dark:peer-checked:bg-primary-900/20 transition-all duration-200"
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
    </div>
  );
}
