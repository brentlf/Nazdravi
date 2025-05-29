import { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, Calendar, FileText, CreditCard, MessageSquare, Save, Edit3 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: string;
  servicePlan?: string;
  programStartDate?: string;
  programEndDate?: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  dateOfBirth?: string;
  medicalConditions?: string[];
  medications?: string[];
  allergies?: string[];
  gpContact?: string;
  adminNotes?: string;
  createdAt: any;
}

function AdminUserProfile() {
  const { userId } = useParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [preEvaluationForm, setPreEvaluationForm] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  // Fetch related data after user profile is loaded
  useEffect(() => {
    if (user && userId && !preEvaluationForm) {
      console.log('User loaded, now fetching related data for:', user.email);
      fetchUserAppointments();
      fetchUserInvoices();
      fetchPreEvaluationForm();
    }
  }, [user?.uid, userId]); // Only depend on user.uid to prevent infinite loop

  const fetchUserProfile = async () => {
    if (!userId) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = { uid: userDoc.id, ...userDoc.data() } as UserProfile;
        setUser(userData);
        setAdminNotes(userData.adminNotes || '');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAppointments = async () => {
    if (!userId || !user) return;
    
    try {
      const appointmentsRef = collection(db, 'appointments');
      
      // Get all appointments and filter client-side to avoid index issues
      const allDocsSnapshot = await getDocs(appointmentsRef);
      
      const userAppointments = [];
      
      // Debug: Log first few appointments to understand structure
      let debugCount = 0;
      allDocsSnapshot.forEach(doc => {
        const data = doc.data();
        
        // Debug first 3 appointments to see structure
        if (debugCount < 3) {
          console.log(`Appointment ${debugCount + 1} structure:`, {
            id: doc.id,
            fields: Object.keys(data),
            userId: data.userId,
            email: data.email,
            clientEmail: data.clientEmail,
            userEmail: data.userEmail
          });
          debugCount++;
        }
        
        // Primary match: Use userId for reliable connection
        if (data.userId === userId) {
          userAppointments.push({
            id: doc.id,
            ...data
          });
          console.log(`Found appointment for userId ${userId}:`, doc.id);
        }
      });
      
      console.log(`Total appointments found for user ${user.email}: ${userAppointments.length}`);
      
      // Sort by date descending
      userAppointments.sort((a, b) => {
        const dateA = new Date((a as any).date || 0);
        const dateB = new Date((b as any).date || 0);
        return dateB.getTime() - dateA.getTime();
      });
      
      setAppointments(userAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchUserInvoices = async () => {
    if (!userId || !user) return;
    
    try {
      const invoicesRef = collection(db, 'invoices');
      
      // Get all invoices and filter client-side to avoid index issues
      const allInvoicesSnapshot = await getDocs(invoicesRef);
      console.log('Debug: Total invoices in collection:', allInvoicesSnapshot.size);
      
      const userInvoices = [];
      
      allInvoicesSnapshot.forEach(doc => {
        const data = doc.data();
        
        // Primary match: Use userId for reliable connection
        if (data.userId === userId) {
          userInvoices.push({
            id: doc.id,
            ...data
          });
          console.log(`Found invoice for userId ${userId}:`, doc.id);
        }
      });
      

      
      // Sort by creation date descending
      userInvoices.sort((a, b) => {
        const dateA = (a as any).createdAt?.toDate ? (a as any).createdAt.toDate() : new Date((a as any).createdAt || 0);
        const dateB = (b as any).createdAt?.toDate ? (b as any).createdAt.toDate() : new Date((b as any).createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      });
      
      setInvoices(userInvoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const fetchPreEvaluationForm = async () => {
    if (!userId || !user) return;
    
    try {
      let combinedHealthData: any = {};
      
      // First, get health data from the user's profile (updated by health assessments)
      if (user.healthGoals || user.medicalConditions || user.medications || user.allergies) {
        combinedHealthData = {
          healthGoals: user.healthGoals || [],
          currentWeight: user.currentWeight || '',
          targetWeight: user.targetWeight || '',
          height: user.height || '',
          activityLevel: user.activityLevel || '',
          medicalConditions: user.medicalConditions || [],
          medications: user.medications || [],
          allergies: user.allergies || [],
          dietaryRestrictions: user.dietaryRestrictions || [],
          previousDietExperience: user.previousDietExperience || '',
          motivationLevel: user.motivationLevel || '',
          availableTimeForCooking: user.availableTimeForCooking || '',
          preferredMealTimes: user.preferredMealTimes || [],
          budgetRange: user.budgetRange || '',
          additionalNotes: user.additionalNotes || '',
          gpContact: user.gpContact || '',
          emergencyContact: user.emergencyContact || '',
          emergencyContactPhone: user.emergencyContactPhone || ''
        };
        console.log('Found health data in user profile');
      }
      
      // Then, fetch from consentRecords collection to get consent form data
      try {
        const consentFormsRef = collection(db, 'consentRecords');
        const consentSnapshot = await getDocs(consentFormsRef);
        
        consentSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.userId === userId || data.userEmail === user.email) {
            // Merge consent form data (don't overwrite existing data unless it's more complete)
            combinedHealthData = {
              ...combinedHealthData,
              gpContact: data.gpContact || combinedHealthData.gpContact,
              emergencyContact: data.emergencyContact || combinedHealthData.emergencyContact,
              emergencyContactPhone: data.emergencyContactPhone || combinedHealthData.emergencyContactPhone,
              medicalConditions: data.medicalConditions?.length ? data.medicalConditions : combinedHealthData.medicalConditions,
              medications: data.medications?.length ? data.medications : combinedHealthData.medications,
              allergies: data.allergies?.length ? data.allergies : combinedHealthData.allergies,
              // Add any other consent-specific fields
              consentFormCompleted: true,
              consentFormDate: data.submittedAt || data.createdAt
            };
            console.log('Merged consent record data');
          }
        });
      } catch (error) {
        console.log('Error fetching consent forms:', (error as any).message);
      }
      
      // Finally, fetch from preEvaluationForms collection to get assessment data
      try {
        const preEvalRef = collection(db, 'preEvaluationForms');
        const preEvalSnapshot = await getDocs(preEvalRef);
        
        preEvalSnapshot.forEach(doc => {
          const data = doc.data();
          console.log('Pre-evaluation form data structure:', {
            docId: doc.id,
            userId: data.userId,
            targetUserId: userId,
            dataKeys: Object.keys(data),
            healthGoals: data.healthGoals,
            currentWeight: data.currentWeight,
            heightCm: data.heightCm,
            activityLevel: data.activityLevel
          });
          
          if (data.userId === userId) {
            // Merge pre-evaluation data (this usually has the most complete health info)
            combinedHealthData = {
              ...combinedHealthData,
              healthGoals: data.healthGoals || combinedHealthData.healthGoals,
              currentWeight: data.currentWeight || combinedHealthData.currentWeight,
              targetWeight: data.targetWeight || combinedHealthData.targetWeight,
              height: data.heightCm || data.height || combinedHealthData.height,
              activityLevel: data.activityLevel || combinedHealthData.activityLevel,
              medicalConditions: data.medicalConditions || combinedHealthData.medicalConditions,
              medications: data.medications || combinedHealthData.medications,
              allergies: data.allergies || combinedHealthData.allergies,
              dietaryRestrictions: data.dietaryRestrictions || combinedHealthData.dietaryRestrictions,
              previousDietExperience: data.previousDietExperience || combinedHealthData.previousDietExperience,
              motivationLevel: data.motivationLevel || combinedHealthData.motivationLevel,
              availableTimeForCooking: data.availableTimeForCooking || combinedHealthData.availableTimeForCooking,
              preferredMealTimes: data.preferredMealTimes || combinedHealthData.preferredMealTimes,
              budgetRange: data.budgetRange || combinedHealthData.budgetRange,
              additionalNotes: data.additionalNotes || combinedHealthData.additionalNotes,
              preEvaluationCompleted: true,
              preEvaluationDate: data.completedAt || data.submittedAt
            };
            console.log('Merged pre-evaluation form data with keys:', Object.keys(combinedHealthData));
            console.log('Sample merged data:', {
              healthGoals: combinedHealthData.healthGoals,
              currentWeight: combinedHealthData.currentWeight,
              height: combinedHealthData.height,
              activityLevel: combinedHealthData.activityLevel
            });
          }
        });
      } catch (error) {
        console.log('Error fetching pre-evaluation forms:', (error as any).message);
      }
      
      // Set the combined health data
      if (Object.keys(combinedHealthData).length > 0) {
        console.log('Setting combined health data with keys:', Object.keys(combinedHealthData));
        console.log('DETAILED HEALTH DATA:', {
          healthGoals: combinedHealthData.healthGoals,
          currentWeight: combinedHealthData.currentWeight,
          targetWeight: combinedHealthData.targetWeight,
          height: combinedHealthData.height,
          activityLevel: combinedHealthData.activityLevel,
          medicalConditions: combinedHealthData.medicalConditions,
          medications: combinedHealthData.medications,
          allergies: combinedHealthData.allergies,
          dietaryRestrictions: combinedHealthData.dietaryRestrictions,
          previousDietExperience: `"${combinedHealthData.previousDietExperience}"`,
          motivationLevel: `"${combinedHealthData.motivationLevel}"`,
          availableTimeForCooking: `"${combinedHealthData.availableTimeForCooking}"`,
          preferredMealTimes: combinedHealthData.preferredMealTimes,
          budgetRange: `"${combinedHealthData.budgetRange}"`
        });
        console.log('EXACT VALUES CHECK:', {
          motivationLevel: combinedHealthData.motivationLevel === '' ? 'EMPTY STRING' : combinedHealthData.motivationLevel === undefined ? 'UNDEFINED' : combinedHealthData.motivationLevel === null ? 'NULL' : combinedHealthData.motivationLevel,
          previousDietExperience: combinedHealthData.previousDietExperience === '' ? 'EMPTY STRING' : combinedHealthData.previousDietExperience === undefined ? 'UNDEFINED' : combinedHealthData.previousDietExperience === null ? 'NULL' : combinedHealthData.previousDietExperience,
          budgetRange: combinedHealthData.budgetRange === '' ? 'EMPTY STRING' : combinedHealthData.budgetRange === undefined ? 'UNDEFINED' : combinedHealthData.budgetRange === null ? 'NULL' : combinedHealthData.budgetRange,
          availableTimeForCooking: combinedHealthData.availableTimeForCooking === '' ? 'EMPTY STRING' : combinedHealthData.availableTimeForCooking === undefined ? 'UNDEFINED' : combinedHealthData.availableTimeForCooking === null ? 'NULL' : combinedHealthData.availableTimeForCooking
        });
        setPreEvaluationForm(combinedHealthData);
      } else {
        console.log('No health data found in any collection');
        setPreEvaluationForm(null);
      }
    } catch (error) {
      console.error('Error fetching health information:', error);
    }
  };

  const saveAdminNotes = async () => {
    if (!userId) return;
    
    setSavingNotes(true);
    try {
      await updateDoc(doc(db, 'users', userId), {
        adminNotes: adminNotes
      });
      
      setIsEditingNotes(false);
      toast({
        title: "Notes Saved",
        description: "Admin notes have been updated successfully",
      });
    } catch (error) {
      console.error('Error saving admin notes:', error);
      toast({
        title: "Error",
        description: "Failed to save admin notes",
        variant: "destructive"
      });
    } finally {
      setSavingNotes(false);
    }
  };

  const formatDate = (timestamp: any) => {
    try {
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString();
    } catch {
      return 'Unknown date';
    }
  };

  const getServicePlanBadge = (plan: string) => {
    return plan === 'complete-program' ? (
      <Badge variant="default">Complete Program</Badge>
    ) : (
      <Badge variant="outline">Pay-as-you-go</Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'outline',
      confirmed: 'default',
      completed: 'secondary',
      cancelled: 'destructive'
    };
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p>User not found</p>
        <Link href="/admin/users">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Button variant="ghost" size="sm" className="mb-4" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="health-info">Health Info</TabsTrigger>
          <TabsTrigger value="notes">Admin Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm text-muted-foreground">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{user.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">{user.address || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Member Since</p>
                  <p className="text-sm text-muted-foreground">{formatDate(user.createdAt)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Current Plan</p>
                  {user.servicePlan ? getServicePlanBadge(user.servicePlan) : <Badge variant="outline">Not set</Badge>}
                </div>
                {user.programStartDate && (
                  <div>
                    <p className="text-sm font-medium">Program Start Date</p>
                    <p className="text-sm text-muted-foreground">{formatDate(user.programStartDate)}</p>
                  </div>
                )}
                {user.programEndDate && (
                  <div>
                    <p className="text-sm font-medium">Program End Date</p>
                    <p className="text-sm text-muted-foreground">{formatDate(user.programEndDate)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Appointment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No appointments found</p>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{appointment.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(appointment.date)} at {appointment.timeslot}
                        </p>
                      </div>
                      {getStatusBadge(appointment.status)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Invoice History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No invoices found</p>
              ) : (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">€{invoice.amount}</p>
                        <p className="text-sm text-muted-foreground">
                          Invoice #{invoice.id.slice(-8)} - {formatDate(invoice.createdAt)}
                        </p>
                      </div>
                      <Badge variant={invoice.status === 'paid' ? 'default' : 'outline'}>
                        {invoice.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health-info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Health Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {preEvaluationForm ? (
                <div className="space-y-6">
                  {/* Basic Health Information */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sage-dark">Basic Health Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Health Goals</p>
                        <p className="text-sm text-muted-foreground">
                          {preEvaluationForm.healthGoals?.length ? preEvaluationForm.healthGoals.join(', ') : 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Activity Level</p>
                        <p className="text-sm text-muted-foreground">
                          {preEvaluationForm.activityLevel || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Current Weight</p>
                        <p className="text-sm text-muted-foreground">
                          {preEvaluationForm.currentWeight ? `${preEvaluationForm.currentWeight} kg` : 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Target Weight</p>
                        <p className="text-sm text-muted-foreground">
                          {preEvaluationForm.targetWeight ? `${preEvaluationForm.targetWeight} kg` : 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Height</p>
                        <p className="text-sm text-muted-foreground">
                          {preEvaluationForm.height ? `${preEvaluationForm.height} cm` : 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Motivation Level</p>
                        <p className="text-sm text-muted-foreground">
                          {preEvaluationForm.motivationLevel || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Medical Information */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sage-dark">Medical Information</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium">Medical Conditions</p>
                        <p className="text-sm text-muted-foreground">
                          {preEvaluationForm.medicalConditions?.length ? preEvaluationForm.medicalConditions.join(', ') : 'None reported'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Medications</p>
                        <p className="text-sm text-muted-foreground">
                          {preEvaluationForm.medications?.length ? preEvaluationForm.medications.join(', ') : 'None reported'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Allergies</p>
                        <p className="text-sm text-muted-foreground">
                          {preEvaluationForm.allergies?.length ? preEvaluationForm.allergies.join(', ') : 'None reported'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dietary Information */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sage-dark">Dietary Information</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium">Dietary Restrictions</p>
                        <p className="text-sm text-muted-foreground">
                          {preEvaluationForm.dietaryRestrictions?.length ? preEvaluationForm.dietaryRestrictions.join(', ') : 'None specified'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Previous Diet Experience</p>
                        <p className="text-sm text-muted-foreground">
                          {preEvaluationForm.previousDietExperience || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Budget Range</p>
                        <p className="text-sm text-muted-foreground">
                          {preEvaluationForm.budgetRange || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Lifestyle Information */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sage-dark">Lifestyle Information</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium">Available Time for Cooking</p>
                        <p className="text-sm text-muted-foreground">
                          {preEvaluationForm.availableTimeForCooking || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Preferred Meal Times</p>
                        <p className="text-sm text-muted-foreground">
                          {preEvaluationForm.preferredMealTimes?.length ? preEvaluationForm.preferredMealTimes.join(', ') : 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sage-dark">Emergency & Medical Contacts</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium">GP Contact</p>
                        <p className="text-sm text-muted-foreground">{preEvaluationForm.gpContact || user.gpContact || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Emergency Contact</p>
                        <p className="text-sm text-muted-foreground">{preEvaluationForm.emergencyContact || user.emergencyContact || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  {preEvaluationForm.additionalNotes && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-sage-dark">Additional Notes</h4>
                      <p className="text-sm text-muted-foreground">{preEvaluationForm.additionalNotes}</p>
                    </div>
                  )}

                  {/* Form Completion Status */}
                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-medium text-sage-dark">Assessment Status</h4>
                    <div className="flex gap-4">
                      {preEvaluationForm.consentFormCompleted && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Consent Form Complete
                        </Badge>
                      )}
                      {preEvaluationForm.preEvaluationCompleted && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Health Assessment Complete
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No health information available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Admin Notes
              </CardTitle>
              <CardDescription>
                Private notes only visible to admin users
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEditingNotes ? (
                <div className="space-y-4">
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add private notes about this client..."
                    rows={6}
                  />
                  <div className="flex gap-2">
                    <Button onClick={saveAdminNotes} disabled={savingNotes}>
                      <Save className="h-4 w-4 mr-2" />
                      {savingNotes ? 'Saving...' : 'Save Notes'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsEditingNotes(false);
                        setAdminNotes(user.adminNotes || '');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="min-h-[150px] p-4 border rounded-lg bg-muted/30">
                    {adminNotes ? (
                      <p className="whitespace-pre-wrap">{adminNotes}</p>
                    ) : (
                      <p className="text-muted-foreground italic">No admin notes yet</p>
                    )}
                  </div>
                  <Button onClick={() => setIsEditingNotes(true)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Notes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}

export default AdminUserProfile;