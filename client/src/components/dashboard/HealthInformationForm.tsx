import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Heart, AlertTriangle, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";

const healthInfoSchema = z.object({
  age: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  medicalConditions: z.array(z.string()).optional(),
  otherMedicalCondition: z.string().optional(),
  allergies: z.string().optional(),
  currentMedications: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  gpName: z.string().optional(),
  gpPhone: z.string().optional(),
  healthGoals: z.array(z.string()).optional(),
  otherHealthGoal: z.string().optional(),
  activityLevel: z.string().optional(),
  stressLevel: z.string().optional(),
  sleepHours: z.string().optional(),
  waterIntake: z.string().optional(),
  smokingStatus: z.string().optional(),
  alcoholConsumption: z.string().optional(),
  targetWeight: z.string().optional(),
  previousDietExperience: z.string().optional(),
  motivationLevel: z.string().optional(),
  availableTimeForCooking: z.string().optional(),
  preferredMealTimes: z.array(z.string()).optional(),
  budgetRange: z.string().optional(),
  additionalNotes: z.string().optional(),
});

type HealthInfoFormData = z.infer<typeof healthInfoSchema>;

interface HealthInformationFormProps {
  userId: string;
}

export function HealthInformationForm({ userId }: HealthInformationFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [originalData, setOriginalData] = useState<any>(null);

  const form = useForm<HealthInfoFormData>({
    resolver: zodResolver(healthInfoSchema),
    defaultValues: {
      age: "",
      height: "",
      weight: "",
      medicalConditions: [],
      otherMedicalCondition: "",
      allergies: "",
      currentMedications: "",
      dietaryRestrictions: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      gpName: "",
      gpPhone: "",
      healthGoals: [],
      otherHealthGoal: "",
      activityLevel: "",
      stressLevel: "",
      sleepHours: "",
      waterIntake: "",
      smokingStatus: "",
      alcoholConsumption: "",
      targetWeight: "",
      previousDietExperience: "",
      motivationLevel: "",
      availableTimeForCooking: "",
      preferredMealTimes: [],
      budgetRange: "",
      additionalNotes: "",
    },
  });

  const medicalConditionOptions = [
    "diabetes",
    "hypertension",
    "heart-disease",
    "thyroid",
    "digestive",
    "kidney-disease",
    "arthritis",
    "depression",
    "anxiety",
    "other",
    "none"
  ];

  // Watch for "other" selections
  const watchedMedicalConditions = form.watch("medicalConditions");
  const watchedHealthGoals = form.watch("healthGoals");
  const hasOtherMedicalCondition = watchedMedicalConditions?.includes("other");
  const hasOtherHealthGoal = watchedHealthGoals?.includes("other");

  const healthGoalOptions = [
    "weight-loss",
    "weight-gain",
    "muscle-building",
    "improved-energy",
    "better-digestion",
    "manage-condition",
    "general-wellness",
    "sports-performance"
  ];

  // Load Firebase data on component mount
  useEffect(() => {
    const loadHealthData = async () => {
      try {
        setIsDataLoading(true);
        
        // Load from user profile (single source of truth for health data)
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        
        let healthData: any = {};
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          console.log('📋 Loading health data from user profile:', userData);
          
          healthData = {
            age: userData.age?.toString() || "",
            height: userData.height || "",
            weight: userData.currentWeight || "",
            targetWeight: userData.targetWeight || "",
            medicalConditions: userData.medicalConditions || [],
            otherMedicalCondition: userData.otherMedicalCondition || "",
            allergies: userData.allergies || [],
            currentMedications: userData.medications || [],
            dietaryRestrictions: userData.dietaryRestrictions || [],
            healthGoals: userData.healthGoals || [],
            otherHealthGoal: userData.otherHealthGoal || "",
            activityLevel: userData.activityLevel || "",
            stressLevel: userData.stressLevel || "",
            sleepHours: userData.sleepHours?.toString() || "",
            waterIntake: userData.waterIntake || "",
            smokingStatus: userData.smokingStatus || "",
            alcoholConsumption: userData.alcoholConsumption || "",
            previousDietExperience: userData.previousDietExperience || "",
            motivationLevel: userData.motivationLevel || "",
            availableTimeForCooking: userData.availableTimeForCooking || "",
            preferredMealTimes: userData.preferredMealTimes || [],
            budgetRange: userData.budgetRange || "",
            additionalNotes: userData.additionalNotes || "",
            emergencyContactName: userData.emergencyContact || "",
            emergencyContactPhone: userData.emergencyContactPhone || "",
            gpName: userData.gpContact || "",
            gpPhone: userData.gpPhone || "",
          };
        } else {
          console.log('⚠️ No user profile data found for user:', userId);
        }
        
        console.log('📊 Health data being set as defaults:', healthData);
        
        // Store original data for comparison
        setOriginalData(healthData);
        
        // Set form values with Firebase data as defaults
        form.reset(healthData);
        
      } catch (error) {
        console.error("Error loading health data:", error);
        toast({
          title: "Loading Error",
          description: "Failed to load your health information. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsDataLoading(false);
      }
    };

    if (userId) {
      loadHealthData();
    }
  }, [userId, form, toast]);

  const getChangedFields = (newData: HealthInfoFormData) => {
    const changes: string[] = [];
    
    if (!originalData) return changes;
    
    Object.keys(newData).forEach((key) => {
      const originalValue = originalData[key];
      const newValue = newData[key as keyof HealthInfoFormData];
      
      // Handle arrays
      if (Array.isArray(originalValue) && Array.isArray(newValue)) {
        if (JSON.stringify(originalValue.sort()) !== JSON.stringify(newValue.sort())) {
          changes.push(key);
        }
      } else if (originalValue !== newValue) {
        changes.push(key);
      }
    });
    
    return changes;
  };

  const onSubmit = async (data: HealthInfoFormData) => {
    setIsLoading(true);
    
    try {
      const changedFields = getChangedFields(data);
      
      if (changedFields.length === 0) {
        toast({
          title: "No Changes",
          description: "No changes were made to your health information.",
        });
        setIsLoading(false);
        return;
      }

      // Update pre-evaluation form with health data
      const preEvaluationRef = doc(db, "preEvaluationForms", userId);
      await updateDoc(preEvaluationRef, {
        age: data.age ? parseInt(data.age) : null,
        height: data.height,
        currentWeight: data.weight,
        medicalConditions: data.medicalConditions,
        allergies: data.allergies,
        currentMedications: data.currentMedications,
        dietaryRestrictions: data.dietaryRestrictions,
        healthGoals: data.healthGoals,
        activityLevel: data.activityLevel,
        stressLevel: data.stressLevel,
        sleepHours: data.sleepHours ? parseInt(data.sleepHours) : null,
        waterIntake: data.waterIntake,
        smokingStatus: data.smokingStatus,
        alcoholConsumption: data.alcoholConsumption,
        lastUpdated: new Date(),
      });

      // Update consent form with contact data
      const consentRef = doc(db, "consentForms", userId);
      await updateDoc(consentRef, {
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        gpName: data.gpName,
        gpPhone: data.gpPhone,
        lastUpdated: new Date(),
      });

      // Send admin notification about health updates
      try {
        const response = await fetch('/api/emails/health-update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clientName: user?.name || 'Unknown Client',
            clientEmail: user?.email || 'unknown@email.com',
            changedFields: changedFields,
            updatedData: data,
          }),
        });

        if (!response.ok) {
          console.error('Failed to send admin notification');
        }
      } catch (emailError) {
        console.error('Email notification error:', emailError);
      }

      // Update original data for future comparisons
      setOriginalData(data);

      toast({
        title: "Health Information Updated",
        description: `Your health information has been updated successfully. ${changedFields.length > 0 ? 'Your dietitian has been notified of the changes.' : ''}`,
      });

    } catch (error) {
      console.error("Error updating health information:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update your health information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isDataLoading) {
    return (
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader className="bg-red-50 dark:bg-red-900/20">
          <CardTitle className="flex items-center gap-2 text-red-900 dark:text-red-100">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            Health Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading your health information...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-red-200 dark:border-red-800">
      <CardHeader className="bg-red-50 dark:bg-red-900/20">
        <CardTitle className="flex items-center gap-2 text-red-900 dark:text-red-100">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" />
          </div>
          Health Information
        </CardTitle>
        <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Changes to your health information will notify your dietitian
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Basic Health Metrics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Health Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  {...form.register("age")}
                  placeholder="Your age"
                />
              </div>
              <div>
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  {...form.register("height")}
                  placeholder="e.g., 170cm or 5'7"
                />
              </div>
              <div>
                <Label htmlFor="weight">Current Weight</Label>
                <Input
                  id="weight"
                  {...form.register("weight")}
                  placeholder="e.g., 70kg or 154lbs"
                />
              </div>
              <div>
                <Label htmlFor="targetWeight">Target Weight</Label>
                <Input
                  id="targetWeight"
                  {...form.register("targetWeight")}
                  placeholder="e.g., 65kg or 143lbs"
                />
              </div>
            </div>
          </div>

          {/* Medical Conditions */}
          <div className="space-y-4">
            <Label>Medical Conditions (Select all that apply)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {medicalConditionOptions.map((condition) => (
                <div key={condition} className="flex items-center space-x-2">
                  <Checkbox
                    id={condition}
                    checked={form.watch("medicalConditions")?.includes(condition)}
                    onCheckedChange={(checked) => {
                      const currentConditions = form.getValues("medicalConditions") || [];
                      if (checked) {
                        form.setValue("medicalConditions", [...currentConditions, condition]);
                      } else {
                        form.setValue("medicalConditions", currentConditions.filter(c => c !== condition));
                      }
                    }}
                  />
                  <Label htmlFor={condition} className="text-sm capitalize">
                    {condition.replace('-', ' ')}
                  </Label>
                </div>
              ))}
            </div>

            {/* Conditional input for other medical condition */}
            {hasOtherMedicalCondition && (
              <div className="mt-4">
                <Label htmlFor="otherMedicalCondition">Please specify other medical condition</Label>
                <Input
                  id="otherMedicalCondition"
                  {...form.register("otherMedicalCondition")}
                  placeholder="Describe your medical condition"
                />
              </div>
            )}
          </div>

          {/* Health Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Health Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  {...form.register("allergies")}
                  placeholder="List any allergies or food intolerances"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="currentMedications">Current Medications</Label>
                <Textarea
                  id="currentMedications"
                  {...form.register("currentMedications")}
                  placeholder="List current medications and supplements"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
                <Textarea
                  id="dietaryRestrictions"
                  {...form.register("dietaryRestrictions")}
                  placeholder="Any dietary restrictions or preferences"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Health Goals */}
          <div className="space-y-4">
            <Label>Health Goals (Select all that apply)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {healthGoalOptions.map((goal) => (
                <div key={goal} className="flex items-center space-x-2">
                  <Checkbox
                    id={goal}
                    checked={form.watch("healthGoals")?.includes(goal)}
                    onCheckedChange={(checked) => {
                      const currentGoals = form.getValues("healthGoals") || [];
                      if (checked) {
                        form.setValue("healthGoals", [...currentGoals, goal]);
                      } else {
                        form.setValue("healthGoals", currentGoals.filter(g => g !== goal));
                      }
                    }}
                  />
                  <Label htmlFor={goal} className="text-sm capitalize">
                    {goal.replace('-', ' ')}
                  </Label>
                </div>
              ))}
            </div>

            {/* Conditional input for other health goal */}
            {hasOtherHealthGoal && (
              <div className="mt-4">
                <Label htmlFor="otherHealthGoal">Please specify other health goal</Label>
                <Input
                  id="otherHealthGoal"
                  {...form.register("otherHealthGoal")}
                  placeholder="Describe your health goal"
                />
              </div>
            )}
          </div>

          {/* Lifestyle Factors */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Lifestyle Factors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="activityLevel">Activity Level</Label>
                <Input
                  id="activityLevel"
                  {...form.register("activityLevel")}
                  placeholder="e.g., Sedentary, Moderate, Active"
                />
              </div>
              <div>
                <Label htmlFor="sleepHours">Hours of Sleep per Night</Label>
                <Input
                  id="sleepHours"
                  type="number"
                  {...form.register("sleepHours")}
                  placeholder="Average hours"
                />
              </div>
              <div>
                <Label htmlFor="stressLevel">Stress Level (1-10)</Label>
                <Input
                  id="stressLevel"
                  {...form.register("stressLevel")}
                  placeholder="Rate your stress level"
                />
              </div>
              <div>
                <Label htmlFor="waterIntake">Daily Water Intake</Label>
                <Input
                  id="waterIntake"
                  {...form.register("waterIntake")}
                  placeholder="e.g., 2 liters, 8 glasses"
                />
              </div>
              <div>
                <Label htmlFor="smokingStatus">Smoking Status</Label>
                <Input
                  id="smokingStatus"
                  {...form.register("smokingStatus")}
                  placeholder="e.g., Never, Former, Current"
                />
              </div>
              <div>
                <Label htmlFor="alcoholConsumption">Alcohol Consumption</Label>
                <Input
                  id="alcoholConsumption"
                  {...form.register("alcoholConsumption")}
                  placeholder="e.g., None, Occasional, Regular"
                />
              </div>
            </div>

            {/* Additional Lifestyle Factors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <Label htmlFor="previousDietExperience">Previous Diet Experience</Label>
                <Textarea
                  id="previousDietExperience"
                  {...form.register("previousDietExperience")}
                  placeholder="Describe your previous diet experiences"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="motivationLevel">Motivation Level (1-10)</Label>
                <Input
                  id="motivationLevel"
                  {...form.register("motivationLevel")}
                  placeholder="Rate your motivation for change"
                />
              </div>
              <div>
                <Label htmlFor="availableTimeForCooking">Available Cooking Time</Label>
                <Input
                  id="availableTimeForCooking"
                  {...form.register("availableTimeForCooking")}
                  placeholder="e.g., 30 minutes daily, weekends only"
                />
              </div>
              <div>
                <Label htmlFor="budgetRange">Budget Range for Nutrition</Label>
                <Input
                  id="budgetRange"
                  {...form.register("budgetRange")}
                  placeholder="e.g., $50-100 weekly, €200 monthly"
                />
              </div>
            </div>

            {/* Preferred Meal Times */}
            <div className="mt-4">
              <Label>Preferred Meal Times (Select all that apply)</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {["early-morning", "morning", "midday", "afternoon", "evening", "late-evening"].map((time) => (
                  <div key={time} className="flex items-center space-x-2">
                    <Checkbox
                      id={time}
                      checked={form.watch("preferredMealTimes")?.includes(time)}
                      onCheckedChange={(checked) => {
                        const currentTimes = form.getValues("preferredMealTimes") || [];
                        if (checked) {
                          form.setValue("preferredMealTimes", [...currentTimes, time]);
                        } else {
                          form.setValue("preferredMealTimes", currentTimes.filter(t => t !== time));
                        }
                      }}
                    />
                    <Label htmlFor={time} className="text-sm capitalize">
                      {time.replace('-', ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Notes */}
            <div className="mt-4">
              <Label htmlFor="additionalNotes">Additional Notes</Label>
              <Textarea
                id="additionalNotes"
                {...form.register("additionalNotes")}
                placeholder="Any additional information you'd like to share about your health, lifestyle, or nutrition goals"
                rows={4}
              />
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Emergency Contacts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                <Input
                  id="emergencyContactName"
                  {...form.register("emergencyContactName")}
                  placeholder="Full name"
                />
              </div>
              <div>
                <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                <Input
                  id="emergencyContactPhone"
                  {...form.register("emergencyContactPhone")}
                  placeholder="Phone number"
                />
              </div>
              <div>
                <Label htmlFor="gpName">GP Name</Label>
                <Input
                  id="gpName"
                  {...form.register("gpName")}
                  placeholder="Your doctor's name"
                />
              </div>
              <div>
                <Label htmlFor="gpPhone">GP Phone</Label>
                <Input
                  id="gpPhone"
                  {...form.register("gpPhone")}
                  placeholder="Doctor's phone number"
                />
              </div>
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Health Information...
              </>
            ) : (
              "Update Health Information"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}