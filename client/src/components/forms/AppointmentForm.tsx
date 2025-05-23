import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Clock, User, Mail, Phone, Target } from "lucide-react";
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
import { useFirestoreActions } from "@/hooks/useFirestore";

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
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

export function AppointmentForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const { add, loading } = useFirestoreActions("appointments");

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      name: "",
      email: "",
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
      await add({
        ...data,
        userId: "visitor", // For visitor appointments
        status: "pending",
      });

      setIsSubmitted(true);
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
                      <Input {...field} type="email" placeholder="your.email@example.com" />
                    </FormControl>
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
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
