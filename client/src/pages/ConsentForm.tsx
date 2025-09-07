import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, AlertTriangle, FileText, Globe, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormDescription,
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
import { useAuth } from "@/contexts/AuthContext";
import { useFirestoreActions } from "@/hooks/useFirestore";

const consentSchema = z.object({
  // Required consents
  languageConfirmation: z.boolean().refine(val => val === true, {
    message: "You must confirm your language comprehension"
  }),
  privateServiceConsent: z.boolean().refine(val => val === true, {
    message: "You must acknowledge this is a private service"
  }),
  videoConsentGDPR: z.boolean().refine(val => val === true, {
    message: "You must consent to video consultation and data processing"
  }),
  resultsVariabilityConsent: z.boolean().refine(val => val === true, {
    message: "You must acknowledge that results may vary"
  }),
  saClientConsent: z.boolean().optional(),
  
  // Service language preference
  preferredLanguage: z.enum(["english", "czech"], {
    required_error: "Please select your preferred consultation language"
  }),
  
  // Location for compliance
  currentLocation: z.enum(["uk", "south-africa", "czech-republic", "netherlands", "other"], {
    required_error: "Please specify your current location"
  }),
  customLocation: z.string().optional()
}).refine((data) => {
  // If "other" is selected, customLocation must be provided
  if (data.currentLocation === "other") {
    return data.customLocation && data.customLocation.trim().length > 0;
  }
  return true;
}, {
  message: "Please specify your country/location when selecting 'Other'",
  path: ["customLocation"]
});

type ConsentFormData = z.infer<typeof consentSchema>;

export default function ConsentForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { add: saveConsent, loading } = useFirestoreActions("consentRecords");

  const form = useForm<ConsentFormData>({
    resolver: zodResolver(consentSchema),
    defaultValues: {
      languageConfirmation: false,
      privateServiceConsent: false,
      videoConsentGDPR: false,
      resultsVariabilityConsent: false,
      saClientConsent: false,
      customLocation: "",
    },
  });

  const watchedLocation = form.watch("currentLocation");
  const isSouthAfrica = watchedLocation === "south-africa";
  const isOtherLocation = watchedLocation === "other";

  const onSubmit = async (data: ConsentFormData) => {
    if (!user?.uid) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to submit the consent form.",
        variant: "destructive",
      });
      return;
    }
    try {
      // Save consent data to Firebase for compliance
      await saveConsent({
        ...data,
        userId: user.uid,
        userEmail: user.email || 'anonymous',
        submittedAt: new Date(),
        ipAddress: 'recorded', // You could capture actual IP if needed
        consentVersion: '1.0',
        status: 'completed'
      });

      // Mark consent as completed in localStorage
      localStorage.setItem('consentFormCompleted', 'true');
      localStorage.setItem('consentCompletedAt', new Date().toISOString());
      
      setIsSubmitted(true);
      
      toast({
        title: "Consent Completed",
        description: "Your consent has been recorded successfully.",
      });
      
    } catch (error) {
      console.error("Consent submission error:", error);
      toast({
        title: "Submission Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleNextStep = () => {
    // Validate step 1 fields before proceeding
    const step1Fields = [
      "languageConfirmation",
      "privateServiceConsent", 
      "videoConsentGDPR",
      "resultsVariabilityConsent",
      "preferredLanguage",
      "currentLocation"
    ];
    
    if (isSouthAfrica) {
      step1Fields.push("saClientConsent");
    }

    let hasErrors = false;
    step1Fields.forEach(field => {
      const fieldError = form.formState.errors[field as keyof ConsentFormData];
      if (fieldError) {
        hasErrors = true;
      }
    });

    if (!hasErrors) {
      setStep(2);
    } else {
      toast({
        title: "Complete Required Consents",
        description: "All checkboxes must be checked to proceed.",
        variant: "destructive",
      });
    }
  };

  // Show success screen after submission
  if (isSubmitted) {
    return (
      <div className="h-full py-20 bg-background overflow-y-auto">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center p-8 bg-success/10 rounded-2xl border border-success/30">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Consent Form Completed
            </h3>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Thank you for completing the informed consent form. You can now proceed with booking your consultation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-brand text-brand-foreground hover:brightness-110">
                <a href="/appointment">
                  <Shield className="w-4 h-4 mr-2" />
                  Book Consultation
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/">
                  Return Home
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-full py-20 bg-background overflow-y-auto">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h1 className="text-3xl font-bold mb-4">Sign in required</h1>
          <p className="text-muted-foreground mb-6">Please sign in to complete the consent form.</p>
          <Button asChild className="bg-brand text-brand-foreground hover:brightness-110">
            <a href="/login">Go to Login</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full py-20 bg-background overflow-y-auto">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Informed Consent Form</h1>
          <p className="text-muted-foreground">
            This form is required by law to ensure you understand the nature of our nutrition services and your rights as a client.
          </p>
        </div>



        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-6">
                {/* Language and Location */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-brand" />
                      Service Language & Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="preferredLanguage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Consultation Language *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your preferred language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="english">🇺🇸 English (Primary)</SelectItem>
                              <SelectItem value="czech">🇨🇿 Czech (Upon Request)</SelectItem>
                              <SelectItem value="afrikaans">🇿🇦 Afrikaans (Upon Request)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currentLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Location/Residence *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your current location" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="uk">🇬🇧 United Kingdom</SelectItem>
                              <SelectItem value="south-africa">🇿🇦 South Africa</SelectItem>
                              <SelectItem value="czech-republic">🇨🇿 Czech Republic</SelectItem>
                              <SelectItem value="netherlands">🇳🇱 Netherlands (Expats)</SelectItem>
                              <SelectItem value="other">🌍 Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Conditional custom location input */}
                    {isOtherLocation && (
                      <FormField
                        control={form.control}
                        name="customLocation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Please specify your country/location *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your country or location" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Required Consents */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-brand" />
                      Required Consents
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    
                    <FormField
                      control={form.control}
                      name="languageConfirmation"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="font-medium">
                              Language Comprehension Confirmation *
                            </FormLabel>
                            <FormDescription>
                              I confirm that I can read, speak, and fully understand English, Czech, OR Afrikaans, 
                              and I consent to receive nutrition consultation services in my selected language.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="privateServiceConsent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="font-medium">
                              Private Service Acknowledgment *
                            </FormLabel>
                            <FormDescription>
                              I understand that this is a private healthcare service, not covered by public insurance, 
                              and does not provide emergency medical care.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="videoConsentGDPR"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="font-medium">
                              Video Consultation & Data Processing Consent *
                            </FormLabel>
                            <FormDescription>
                              I consent to video consultation services and electronic record-keeping 
                              under GDPR regulations for the purpose of providing nutrition care.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="resultsVariabilityConsent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="font-medium">
                              Results Variability Acknowledgment *
                            </FormLabel>
                            <FormDescription>
                              I acknowledge that nutrition consultation results vary by individual, 
                              and no specific weight-loss amounts or health outcomes are guaranteed.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {isSouthAfrica && (
                      <FormField
                        control={form.control}
                        name="saClientConsent"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="font-medium">
                                South Africa - Local Follow-up Requirement *
                              </FormLabel>
                              <FormDescription>
                                I understand that as a South African client, local follow-up with a physician 
                                may be required as per HPCSA Booklet 10 telehealth guidelines.
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    )}

                    <Alert className="mt-6">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        All consent items above are mandatory to proceed with our nutrition services. 
                        Please read each item carefully before agreeing.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button 
                    type="submit"
                    disabled={loading || !user}
                    className="bg-brand text-brand-foreground hover:brightness-110"
                  >
                    {loading ? "Submitting..." : "Complete & Proceed to Booking"}
                  </Button>
                </div>
              </div>
          </form>
        </Form>
      </div>
    </div>
  );
}