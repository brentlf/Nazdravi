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
      fetchUserAppointments();
      fetchUserInvoices();
      fetchPreEvaluationForm();
    }
  }, [userId]);

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
        
        // Check if this appointment belongs to the user using multiple field checks
        if (data.userId === userId || 
            data.email === user.email || 
            data.clientEmail === user.email ||
            data.userEmail === user.email ||
            data.user === user.email ||
            data.client === user.email) {
          userAppointments.push({
            id: doc.id,
            ...data
          });
          console.log(`Found matching appointment for user ${user.email}:`, doc.id);
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
        
        // Check if this invoice belongs to the user using multiple field checks
        if (data.userId === userId || 
            data.clientEmail === user.email || 
            data.email === user.email ||
            data.userEmail === user.email) {
          userInvoices.push({
            id: doc.id,
            ...data
          });
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
      let healthData = null;
      
      // Try to fetch from consentForms collection first
      try {
        const consentFormsRef = collection(db, 'consentForms');
        const consentSnapshot = await getDocs(consentFormsRef);
        console.log('Debug: Total consent forms in collection:', consentSnapshot.size);
        
        consentSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.userId === userId || data.email === user.email) {
            healthData = data;
          }
        });
      } catch (error) {
        console.log('Error fetching consent forms:', (error as any).message);
      }
      
      // If no consent form found, try preEvaluationForms
      if (!healthData) {
        try {
          const preEvalRef = collection(db, 'preEvaluationForms');
          const preEvalSnapshot = await getDocs(preEvalRef);
          console.log('Debug: Total pre-evaluation forms in collection:', preEvalSnapshot.size);
          
          preEvalSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.userId === userId || data.email === user.email) {
              healthData = data;
            }
          });
        } catch (error) {
          console.log('Error fetching pre-evaluation forms:', (error as any).message);
        }
      }
      
      console.log('Debug: Found health data:', healthData ? 'Yes' : 'No');
      if (healthData) {
        console.log('Debug: Health data structure:', Object.keys(healthData));
        setPreEvaluationForm(healthData);
        
        // Update user object with health information from forms
        setUser(prev => prev ? {
          ...prev,
          medicalConditions: healthData.medicalConditions || prev.medicalConditions || [],
          medications: healthData.medications || prev.medications || [],
          allergies: healthData.allergies || prev.allergies || [],
          phone: healthData.phone || prev.phone,
          address: healthData.address || prev.address,
          emergencyContact: healthData.emergencyContact || prev.emergencyContact,
          dateOfBirth: healthData.dateOfBirth || prev.dateOfBirth,
          gpContact: healthData.gpContact || prev.gpContact
        } : null);
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
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Health Goals</p>
                    <p className="text-sm text-muted-foreground">
                      {preEvaluationForm.healthGoals?.join(', ') || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Current Weight</p>
                    <p className="text-sm text-muted-foreground">{preEvaluationForm.currentWeight} kg</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Target Weight</p>
                    <p className="text-sm text-muted-foreground">{preEvaluationForm.targetWeight} kg</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Medical Conditions</p>
                    <p className="text-sm text-muted-foreground">
                      {user.medicalConditions?.join(', ') || 'None reported'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Medications</p>
                    <p className="text-sm text-muted-foreground">
                      {user.medications?.join(', ') || 'None reported'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">GP Contact</p>
                    <p className="text-sm text-muted-foreground">{user.gpContact || 'Not provided'}</p>
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