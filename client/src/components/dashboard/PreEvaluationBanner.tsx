import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PreEvaluationData {
  userId: string;
  appointmentId?: string;
  healthGoals: string[];
  currentWeight: string;
  targetWeight: string;
  heightCm: string;
  activityLevel: string;
  dietaryRestrictions: string[];
  medicalConditions: string[];
  medications: string[];
  allergies: string[];
  previousDietExperience: string;
  motivationLevel: string;
  availableTimeForCooking: string;
  preferredMealTimes: string[];
  budgetRange: string;
  additionalNotes: string;
  completedAt: Date;
}

export function PreEvaluationBanner() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [hasCompletedForm, setHasCompletedForm] = useState(false);
  const [hasPendingAppointment, setHasPendingAppointment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<PreEvaluationData>>({
    healthGoals: [],
    dietaryRestrictions: [],
    medicalConditions: [],
    medications: [],
    allergies: [],
    preferredMealTimes: [],
    currentWeight: '',
    targetWeight: '',
    heightCm: '',
    activityLevel: '',
    previousDietExperience: '',
    motivationLevel: '',
    availableTimeForCooking: '',
    budgetRange: '',
    additionalNotes: ''
  });

  useEffect(() => {
    if (user?.uid) {
      checkFormStatus();
      checkPendingAppointments();
    }
  }, [user?.uid]);

  const checkFormStatus = async () => {
    if (!user?.uid) return;
    
    try {
      const formsRef = collection(db, 'preEvaluationForms');
      const q = query(formsRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      setHasCompletedForm(!querySnapshot.empty);
    } catch (error) {
      console.error('Error checking form status:', error);
    }
  };

  const checkPendingAppointments = async () => {
    if (!user?.uid) return;
    
    try {
      const appointmentsRef = collection(db, 'appointments');
      const q = query(
        appointmentsRef,
        where('userId', '==', user.uid),
        where('status', 'in', ['pending', 'confirmed'])
      );
      const querySnapshot = await getDocs(q);
      
      setHasPendingAppointment(!querySnapshot.empty);
    } catch (error) {
      console.error('Error checking appointments:', error);
    }
  };

  const handleArrayFieldChange = (field: keyof PreEvaluationData, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentArray = (prev[field] as string[]) || [];
      if (checked) {
        return { ...prev, [field]: [...currentArray, value] };
      } else {
        return { ...prev, [field]: currentArray.filter(item => item !== value) };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    setLoading(true);
    try {
      const formDoc = doc(db, 'preEvaluationForms', user.uid);
      const submissionData: PreEvaluationData = {
        ...formData as PreEvaluationData,
        userId: user.uid,
        completedAt: new Date()
      };

      // Save to preEvaluationForms collection
      await setDoc(formDoc, submissionData);

      // Also update user's health profile in users collection
      const { updateDoc } = await import('firebase/firestore');
      const userRef = doc(db, 'users', user.uid);
      
      await updateDoc(userRef, {
        // Basic health information
        healthGoals: formData.healthGoals,
        currentWeight: formData.currentWeight,
        targetWeight: formData.targetWeight,
        height: formData.heightCm,
        activityLevel: formData.activityLevel,
        
        // Medical information
        medicalConditions: formData.medicalConditions,
        medications: formData.medications,
        allergies: formData.allergies,
        
        // Dietary information
        dietaryRestrictions: formData.dietaryRestrictions,
        previousDietExperience: formData.previousDietExperience,
        
        // Lifestyle information
        motivationLevel: formData.motivationLevel,
        availableTimeForCooking: formData.availableTimeForCooking,
        preferredMealTimes: formData.preferredMealTimes,
        budgetRange: formData.budgetRange,
        
        // Additional notes
        additionalNotes: formData.additionalNotes,
        
        // Metadata
        healthAssessmentCompleted: true,
        healthAssessmentCompletedAt: new Date(),
        updatedAt: new Date(),
      });
      
      setHasCompletedForm(true);
      setShowForm(false);
      
      toast({
        title: "Form Submitted Successfully",
        description: "Your health information has been saved and your profile updated.",
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your form. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Don't show banner if no pending appointments
  if (!hasPendingAppointment) return null;

  // Show success message if form completed
  if (hasCompletedForm) {
    return (
      <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          <strong>Pre-evaluation form completed!</strong> We've received your health information and will review it before your appointment.
        </AlertDescription>
      </Alert>
    );
  }

  // Show action required banner
  if (!showForm) {
    return (
      <Alert className="mb-6 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800 dark:text-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <strong>Action Required:</strong> Please complete your pre-evaluation form before your upcoming appointment.
            </div>
            <Button 
              onClick={() => setShowForm(true)}
              variant="outline"
              size="sm"
              className="ml-4"
            >
              <FileText className="h-4 w-4 mr-2" />
              Complete Form
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Show the form
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Pre-Evaluation Health Assessment
        </CardTitle>
        <CardDescription>
          Please fill out this form before your appointment to help us provide the best possible nutrition guidance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Health Goals */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Health Goals (select all that apply)</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                'Weight Loss', 'Weight Gain', 'Muscle Building', 'Better Energy',
                'Improved Digestion', 'Heart Health', 'Blood Sugar Control', 'Better Sleep'
              ].map(goal => (
                <div key={goal} className="flex items-center space-x-2">
                  <Checkbox
                    id={`goal-${goal}`}
                    checked={formData.healthGoals?.includes(goal)}
                    onCheckedChange={(checked) => 
                      handleArrayFieldChange('healthGoals', goal, checked as boolean)
                    }
                  />
                  <Label htmlFor={`goal-${goal}`} className="text-sm">{goal}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Physical Information */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentWeight">Current Weight (kg)</Label>
              <Input
                id="currentWeight"
                type="number"
                value={formData.currentWeight}
                onChange={(e) => setFormData(prev => ({ ...prev, currentWeight: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetWeight">Target Weight (kg)</Label>
              <Input
                id="targetWeight"
                type="number"
                value={formData.targetWeight}
                onChange={(e) => setFormData(prev => ({ ...prev, targetWeight: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                value={formData.heightCm}
                onChange={(e) => setFormData(prev => ({ ...prev, heightCm: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Activity Level */}
          <div className="space-y-2">
            <Label htmlFor="activityLevel">Activity Level</Label>
            <Select 
              value={formData.activityLevel} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, activityLevel: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your activity level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
                <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                <SelectItem value="very-active">Very Active (2x/day or intense exercise)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dietary Restrictions */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Dietary Restrictions</Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                'None', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Low-Carb', 'Halal', 'Kosher'
              ].map(restriction => (
                <div key={restriction} className="flex items-center space-x-2">
                  <Checkbox
                    id={`restriction-${restriction}`}
                    checked={formData.dietaryRestrictions?.includes(restriction)}
                    onCheckedChange={(checked) => 
                      handleArrayFieldChange('dietaryRestrictions', restriction, checked as boolean)
                    }
                  />
                  <Label htmlFor={`restriction-${restriction}`} className="text-sm">{restriction}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Medical Conditions */}
          <div className="space-y-2">
            <Label htmlFor="medicalConditions">Medical Conditions (if any)</Label>
            <Textarea
              id="medicalConditions"
              placeholder="List any medical conditions, chronic illnesses, or health concerns..."
              value={formData.medicalConditions?.join(', ')}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                medicalConditions: e.target.value ? e.target.value.split(', ') : []
              }))}
            />
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="additionalNotes">Additional Notes</Label>
            <Textarea
              id="additionalNotes"
              placeholder="Any other information you'd like to share..."
              value={formData.additionalNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Form'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}