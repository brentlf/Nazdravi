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
  
  // Health screening
  age: z.string().min(1, "Age is required").refine(val => parseInt(val) >= 18 && parseInt(val) <= 120, {
    message: "Age must be between 18 and 120"
  }),
  height: z.string().min(1, "Height is required"),
  weight: z.string().min(1, "Weight is required"),
  chronicConditions: z.string(),
  currentMedication: z.string(),
  recentBloodTests: z.enum(["yes", "no"], {
    required_error: "Please specify if you've had recent blood tests"
  }),
  gpContact: z.string().min(1, "GP contact information is required"),
  
  // Service language preference
  preferredLanguage: z.enum(["english", "czech"], {
    required_error: "Please select your preferred consultation language"
  }),
  
  // Location for compliance
  currentLocation: z.enum(["uk", "south-africa", "czech-republic", "netherlands"], {
    required_error: "Please specify your current location"
  })
});

type ConsentFormData = z.infer<typeof consentSchema>;

export default function ConsentForm() {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<ConsentFormData>({
    resolver: zodResolver(consentSchema),
    defaultValues: {
      languageConfirmation: false,
      privateServiceConsent: false,
      videoConsentGDPR: false,
      resultsVariabilityConsent: false,
      saClientConsent: false,
      chronicConditions: "",
      currentMedication: "",
      gpContact: "",
    },
  });

  const watchedLocation = form.watch("currentLocation");
  const isSouthAfrica = watchedLocation === "south-africa";

  const onSubmit = async (data: ConsentFormData) => {
    try {
      // Here you would typically save the consent data to your backend
      console.log("Consent form data:", data);
      
      toast({
        title: "Consent form completed",
        description: "Thank you for completing the informed consent. You can now proceed to book your consultation.",
      });
      
      // Redirect to booking page
      window.location.href = "/appointment";
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Please try again or contact support if the problem persists.",
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
        title: "Please complete all required consents",
        description: "All consent checkboxes must be checked to proceed.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Informed Consent & Health Screening</h1>
          <p className="text-muted-foreground">
            Step {step} of 2: {step === 1 ? "Consent & Service Agreement" : "Health Information"}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              step >= 1 ? 'bg-[#A5CBA4] border-[#A5CBA4] text-white' : 'border-gray-300'
            }`}>
              {step > 1 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <div className={`w-16 h-0.5 ${step >= 2 ? 'bg-[#A5CBA4]' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              step >= 2 ? 'bg-[#A5CBA4] border-[#A5CBA4] text-white' : 'border-gray-300'
            }`}>
              2
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {step === 1 && (
              <div className="space-y-6">
                {/* Language and Location */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-[#A5CBA4]" />
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
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Required Consents */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-[#A5CBA4]" />
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
                              I confirm that I can read, speak, and fully understand English OR Czech, 
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
                    type="button" 
                    onClick={handleNextStep}
                    className="bg-[#A5CBA4] hover:bg-[#95bb94] text-white"
                  >
                    Continue to Health Screening
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#A5CBA4]" />
                      Health Screening Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 30" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Height *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 170cm or 5'7\"" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 70kg or 154lbs" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="chronicConditions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chronic Conditions</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Please list any chronic health conditions (diabetes, hypertension, etc.) or write 'None'"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currentMedication"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Medications</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Please list current medications, supplements, or write 'None'"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="recentBloodTests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recent Blood Tests (within 6 months) *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Have you had blood tests recently?" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="yes">Yes, within 6 months</SelectItem>
                              <SelectItem value="no">No recent blood tests</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gpContact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GP/Primary Care Physician Contact *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Name and contact information of your GP/primary doctor"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            This information is required for coordination of care and emergency situations.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    Back to Consents
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-[#A5CBA4] hover:bg-[#95bb94] text-white"
                  >
                    Complete & Proceed to Booking
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}