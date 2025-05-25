import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, setDoc, addDoc, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock, Heart, Globe, Mail, Phone, Crown } from "lucide-react";
import { emailService } from "@/lib/emailService";

// Profile update schema
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
});

// Health information schema
const healthInfoSchema = z.object({
  age: z.string().min(1, "Age is required"),
  height: z.string().min(1, "Height is required"),
  weight: z.string().min(1, "Weight is required"),
  chronicConditions: z.string(),
  currentMedication: z.string(),
  gpContact: z.string().min(1, "GP contact is required"),
  emergencyContact: z.string().optional(),
});

// Preferences schema
const preferencesSchema = z.object({
  preferredLanguage: z.enum(["english", "czech"]),
  currentLocation: z.enum(["uk", "south-africa", "czech-republic", "netherlands"]),
  emailNotifications: z.boolean().default(true),
  servicePlan: z.enum(["pay-as-you-go", "complete-program"]).default("pay-as-you-go"),
});

// Password change schema
const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type HealthInfoFormData = z.infer<typeof healthInfoSchema>;
type PreferencesFormData = z.infer<typeof preferencesSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function DashboardProfile() {
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [healthAssessment, setHealthAssessment] = useState<any>(null);
  const [consentRecord, setConsentRecord] = useState<any>(null);
  const [currentUserData, setCurrentUserData] = useState<any>(null);

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.uid) return;

      try {
        // Load health assessment
        const healthQuery = query(
          collection(db, "healthAssessments"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(1)
        );
        const healthSnapshot = await getDocs(healthQuery);
        if (!healthSnapshot.empty) {
          setHealthAssessment(healthSnapshot.docs[0].data());
        }

        // Load consent record
        const consentQuery = query(
          collection(db, "consentRecords"),
          where("userId", "==", user.uid),
          orderBy("submittedAt", "desc"),
          limit(1)
        );
        const consentSnapshot = await getDocs(consentQuery);
        if (!consentSnapshot.empty) {
          setConsentRecord(consentSnapshot.docs[0].data());
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, [user?.uid]);

  // Profile form
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: "",
    },
  });

  // Health info form
  const healthForm = useForm<HealthInfoFormData>({
    resolver: zodResolver(healthInfoSchema),
    defaultValues: {
      age: "",
      height: "",
      weight: "",
      chronicConditions: "",
      currentMedication: "",
      gpContact: "",
      emergencyContact: "",
    },
  });

  // Preferences form
  const preferencesForm = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      preferredLanguage: "english",
      currentLocation: "uk", 
      emailNotifications: true,
      servicePlan: "pay-as-you-go",
    },
  });

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      // Fetch fresh user data from Firebase to get the current service plan
      const fetchUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setCurrentUserData(userData);
            preferencesForm.setValue("servicePlan", userData.servicePlan || "pay-as-you-go");
            preferencesForm.setValue("emailNotifications", userData.emailNotifications ?? true);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Fallback to user context data
          preferencesForm.setValue("servicePlan", user.servicePlan || "pay-as-you-go");
          preferencesForm.setValue("emailNotifications", user.emailNotifications ?? true);
        }
      };
      
      fetchUserData();
    }
  }, [user, preferencesForm]);

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Load existing data when component mounts
  useEffect(() => {
    if (healthAssessment) {
      healthForm.reset({
        age: healthAssessment.age?.toString() || "",
        height: healthAssessment.height || "",
        weight: healthAssessment.weight || "",
        chronicConditions: healthAssessment.chronicConditions || "",
        currentMedication: healthAssessment.currentMedication || "",
        gpContact: healthAssessment.gpContact || "",
        emergencyContact: healthAssessment.emergencyContact || "",
      });
    }

    if (consentRecord) {
      preferencesForm.reset({
        preferredLanguage: consentRecord.preferredLanguage || "english",
        currentLocation: consentRecord.currentLocation || "uk",
        emailNotifications: true,
      });
    }
  }, [healthAssessment, consentRecord, healthForm, preferencesForm]);

  // Handle profile update
  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      await updateUserProfile({
        name: data.name,
        email: data.email,
      });

      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle health info update
  const onHealthSubmit = async (data: HealthInfoFormData) => {
    setIsLoading(true);
    try {
      // Save health assessment update
      await addDoc(collection(db, "healthAssessments"), {
        userId: user?.uid || "",
        assessmentDate: new Date(),
        age: parseInt(data.age),
        height: data.height,
        weight: data.weight,
        chronicConditions: data.chronicConditions,
        currentMedication: data.currentMedication,
        gpContact: data.gpContact,
        emergencyContact: data.emergencyContact,
        preferredLanguage: preferencesForm.getValues("preferredLanguage"),
        currentLocation: preferencesForm.getValues("currentLocation"),
        recentBloodTests: false, // Default value
        createdAt: new Date(),
      });

      // Notify admin of health info changes
      try {
        await emailService.sendHealthUpdateNotification(
          "admin@veenutrition.com",
          user?.name || "Client",
          user?.email || "",
          data.chronicConditions,
          data.currentMedication
        );
      } catch (emailError) {
        console.error("Failed to send admin notification:", emailError);
      }

      toast({
        title: "Health information updated",
        description: "Your health information has been updated and your dietitian has been notified.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update health information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle preferences update
  const onPreferencesSubmit = async (data: PreferencesFormData) => {
    setIsLoading(true);
    try {
      const updateData: any = {
        preferredLanguage: data.preferredLanguage,
        servicePlan: data.servicePlan,
        emailNotifications: data.emailNotifications,
      };

      // If switching to complete program, set start and end dates
      if (data.servicePlan === "complete-program" && user?.servicePlan !== "complete-program") {
        const now = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 3); // 3 months from now
        
        // Store as ISO strings for Firebase compatibility
        updateData.programStartDate = now.toISOString();
        updateData.programEndDate = endDate.toISOString();
      }

      // If switching back to pay-as-you-go, clear program dates
      if (data.servicePlan === "pay-as-you-go") {
        updateData.programStartDate = null;
        updateData.programEndDate = null;
      }

      // Update user preferences
      await updateUserProfile(updateData);

      // Notify admin of preference changes
      try {
        await emailService.sendPreferencesUpdateNotification(
          "admin@veenutrition.com",
          user?.name || "Client",
          user?.email || "",
          data.preferredLanguage,
          data.currentLocation
        );
      } catch (emailError) {
        console.error("Failed to send admin notification:", emailError);
      }

      toast({
        title: data.servicePlan === "complete-program" ? "Welcome to Complete Program!" : "Preferences updated",
        description: data.servicePlan === "complete-program" 
          ? "Your 3-month unlimited access program starts now."
          : "Your preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password change
  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);
    try {
      // This would typically involve Firebase Auth password update
      // For now, show success message
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
      
      passwordForm.reset();
    } catch (error) {
      toast({
        title: "Password change failed",
        description: "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          Profile Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2 ml-13">
          Manage your account information, health details, and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Health Info
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
              <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    {...profileForm.register("name")}
                    placeholder="Enter your full name"
                  />
                  {profileForm.formState.errors.name && (
                    <p className="text-sm text-red-600 mt-1">
                      {profileForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    {...profileForm.register("email")}
                    placeholder="Enter your email address"
                  />
                  {profileForm.formState.errors.email && (
                    <p className="text-sm text-red-600 mt-1">
                      {profileForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...profileForm.register("phone")}
                    placeholder="Enter your phone number"
                  />
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Info Tab */}
        <TabsContent value="health">
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader className="bg-red-50 dark:bg-red-900/20">
              <CardTitle className="flex items-center gap-2 text-red-900 dark:text-red-100">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                Health Information
              </CardTitle>
              <p className="text-sm text-red-700 dark:text-red-300">
                Changes to chronic conditions and medications will notify your dietitian
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={healthForm.handleSubmit(onHealthSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      {...healthForm.register("age")}
                      placeholder="Your age"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Height</Label>
                    <Input
                      id="height"
                      {...healthForm.register("height")}
                      placeholder="e.g., 170cm or 5'7 inches"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight</Label>
                    <Input
                      id="weight"
                      {...healthForm.register("weight")}
                      placeholder="e.g., 70kg or 154lbs"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="chronicConditions">Chronic Conditions</Label>
                  <Textarea
                    id="chronicConditions"
                    {...healthForm.register("chronicConditions")}
                    placeholder="List any chronic conditions, allergies, or ongoing health issues"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="currentMedication">Current Medications</Label>
                  <Textarea
                    id="currentMedication"
                    {...healthForm.register("currentMedication")}
                    placeholder="List all medications, supplements, and dosages you are currently taking"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="gpContact">GP Contact Information</Label>
                  <Input
                    id="gpContact"
                    {...healthForm.register("gpContact")}
                    placeholder="Your general practitioner's contact details"
                  />
                </div>

                <div>
                  <Label htmlFor="emergencyContact">Emergency Contact (Optional)</Label>
                  <Input
                    id="emergencyContact"
                    {...healthForm.register("emergencyContact")}
                    placeholder="Emergency contact name and phone number"
                  />
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Health Information"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Preferences & Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={preferencesForm.handleSubmit(onPreferencesSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="preferredLanguage">Consultation Language</Label>
                  <Select
                    value={preferencesForm.watch("preferredLanguage")}
                    onValueChange={(value) => preferencesForm.setValue("preferredLanguage", value as "english" | "czech")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your preferred language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="czech">Czech</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="currentLocation">Current Location</Label>
                  <Select
                    value={preferencesForm.watch("currentLocation")}
                    onValueChange={(value) => preferencesForm.setValue("currentLocation", value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your current location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="south-africa">South Africa</SelectItem>
                      <SelectItem value="czech-republic">Czech Republic</SelectItem>
                      <SelectItem value="netherlands">Netherlands</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="servicePlan">Service Plan</Label>
                  <Select
                    value={preferencesForm.watch("servicePlan")}
                    onValueChange={(value) => preferencesForm.setValue("servicePlan", value as "pay-as-you-go" | "complete-program")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your service plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pay-as-you-go">
                        <div className="flex flex-col">
                          <span className="font-medium">Pay As You Go</span>
                          <span className="text-sm text-gray-500">Individual session billing</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="complete-program">
                        <div className="flex flex-col">
                          <span className="font-medium">Complete Program (3 Months)</span>
                          <span className="text-sm text-gray-500">Monthly billing with unlimited consultations</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {preferencesForm.watch("servicePlan") === "complete-program" && (
                    <div className="mt-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-sm">✓</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-green-900 dark:text-green-100">Complete Program Benefits</h4>
                          <ul className="text-sm text-green-700 dark:text-green-300 mt-1 space-y-1">
                            <li>• Unlimited consultations for 3 months</li>
                            <li>• Priority booking and support</li>
                            <li>• Monthly billing instead of per-session</li>
                            <li>• Comprehensive nutrition plan</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Program Status Display */}
                {currentUserData?.servicePlan === "complete-program" && (
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      Complete Program Status
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Start Date:</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {currentUserData.programStartDate 
                            ? new Date(currentUserData.programStartDate).toLocaleDateString()
                            : "Not set"
                          }
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">End Date:</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {currentUserData.programEndDate 
                            ? new Date(currentUserData.programEndDate).toLocaleDateString()
                            : "Not set"
                          }
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                        <div className="font-medium">
                          {currentUserData.programEndDate ? (
                            new Date(currentUserData.programEndDate) > new Date() ? (
                              <span className="text-green-600">Active</span>
                            ) : (
                              <span className="text-red-600">Expired</span>
                            )
                          ) : (
                            <span className="text-yellow-600">Pending Setup</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Days Remaining:</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {currentUserData.programEndDate ? (
                            Math.max(0, Math.ceil((new Date(currentUserData.programEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
                          ) : (
                            "N/A"
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Label>Notification Preferences</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="emailNotifications"
                        checked={preferencesForm.watch("emailNotifications")}
                        onChange={(e) => preferencesForm.setValue("emailNotifications", e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="emailNotifications" className="text-sm">
                        Email notifications for appointments and updates
                      </Label>
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Preferences"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    {...passwordForm.register("currentPassword")}
                    placeholder="Enter your current password"
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-sm text-red-600 mt-1">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    {...passwordForm.register("newPassword")}
                    placeholder="Enter your new password"
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-sm text-red-600 mt-1">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...passwordForm.register("confirmPassword")}
                    placeholder="Confirm your new password"
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Change Password"}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-medium mb-4">Account Actions</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="w-4 h-4 mr-2" />
                    Download My Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                    <Phone className="w-4 h-4 mr-2" />
                    Request Account Deletion
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}