import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Scale, Droplets, Calendar, TrendingDown, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useFirestoreCollection, useFirestoreActions } from "@/hooks/useFirestore";
import { ProgressChart } from "@/components/dashboard/ProgressChart";
import { Progress } from "@/types";
import { where, orderBy, limit } from "firebase/firestore";
import { Link } from "wouter";

const progressSchema = z.object({
  date: z.string().min(1, "Please select a date"),
  weightKg: z.number().min(30).max(300).optional(),
  waterLitres: z.number().min(0).max(10).optional(),
  notes: z.string().max(500).optional(),
}).refine((data) => data.weightKg || data.waterLitres, {
  message: "Please enter at least weight or water intake",
});

type ProgressFormData = z.infer<typeof progressSchema>;

export default function DashboardProgress() {
  const [isAddingProgress, setIsAddingProgress] = useState(false);
  const { effectiveUser: user, isAdminViewingClient } = useAuth();
  const { toast } = useToast();
  const { add: addProgress, loading: adding } = useFirestoreActions("progress");

  // Fetch user's progress entries
  const { data: progressEntries, loading } = useFirestoreCollection<Progress>("progress", [
    where("userId", "==", user?.uid || ""),
    orderBy("date", "desc"),
    limit(50)
  ]);

  const form = useForm<ProgressFormData>({
    resolver: zodResolver(progressSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      weightKg: undefined,
      waterLitres: undefined,
      notes: "",
    },
  });

  const onSubmit = async (data: ProgressFormData) => {
    if (!user) return;

    try {
      await addProgress({
        ...data,
        userId: user.uid,
        weightKg: data.weightKg || null,
        waterLitres: data.waterLitres || null,
      });

      setIsAddingProgress(false);
      form.reset({
        date: new Date().toISOString().split('T')[0],
        weightKg: undefined,
        waterLitres: undefined,
        notes: "",
      });
      
      toast({
        title: "Progress logged!",
        description: "Your progress has been recorded successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to log progress",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Calculate stats
  const latestEntry = progressEntries?.[0];
  const entriesThisMonth = progressEntries?.filter(entry => 
    entry.date.startsWith(new Date().toISOString().slice(0, 7))
  ) || [];
  
  const weightEntries = progressEntries?.filter(entry => entry.weightKg) || [];
  const weightChange = weightEntries.length >= 2 
    ? (weightEntries[weightEntries.length - 1].weightKg || 0) - (weightEntries[0].weightKg || 0)
    : 0;

  const avgWaterThisMonth = entriesThisMonth.length > 0 
    ? entriesThisMonth.reduce((sum, entry) => sum + (entry.waterLitres || 0), 0) / entriesThisMonth.length
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Back to Dashboard Navigation */}
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="flex items-center gap-2 text-sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Progress Tracking</h1>
            <p className="text-muted-foreground">
              Monitor your weight, hydration, and overall progress
            </p>
          </div>
          
          <Dialog open={isAddingProgress} onOpenChange={setIsAddingProgress}>
            <DialogTrigger asChild>
              <Button className="bg-primary-500 hover:bg-primary-600">
                <Plus className="w-4 h-4 mr-2" />
                Log Progress
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log Your Progress</DialogTitle>
                <DialogDescription>
                  Record your weight, water intake, or add notes about your day
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" max={new Date().toISOString().split('T')[0]} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="weightKg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (kg)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              step="0.1" 
                              placeholder="70.5"
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="waterLitres"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Water Intake (L)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              step="0.1" 
                              placeholder="2.5"
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            rows={3}
                            placeholder="How are you feeling today? Any challenges or wins to share?"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddingProgress(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={adding}
                      className="flex-1 bg-primary-500 hover:bg-primary-600"
                    >
                      {adding ? "Saving..." : "Save Progress"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Current Weight</span>
                <Scale className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">
                {latestEntry?.weightKg ? `${latestEntry.weightKg}kg` : 'No data'}
              </p>
              <p className="text-xs text-muted-foreground">
                {latestEntry?.date ? `Last updated: ${new Date(latestEntry.date).toLocaleDateString()}` : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Weight Change</span>
                <TrendingDown className={`w-4 h-4 ${weightChange < 0 ? 'text-green-500' : 'text-gray-400'}`} />
              </div>
              <p className={`text-2xl font-bold ${weightChange < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                {weightChange !== 0 ? `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)}kg` : '0kg'}
              </p>
              <p className="text-xs text-muted-foreground">Total change</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Avg Water This Month</span>
                <Droplets className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {avgWaterThisMonth > 0 ? `${avgWaterThisMonth.toFixed(1)}L` : '0L'}
              </p>
              <p className="text-xs text-muted-foreground">
                Goal: 2.5L daily
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Entries This Month</span>
                <Calendar className="w-4 h-4 text-primary-500" />
              </div>
              <p className="text-2xl font-bold text-primary-600">
                {entriesThisMonth.length}
              </p>
              <p className="text-xs text-muted-foreground">
                Keep it up!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Charts */}
        {progressEntries && progressEntries.length > 0 ? (
          <ProgressChart progressData={progressEntries} />
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Scale className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Start tracking your progress</h3>
              <p className="text-muted-foreground mb-6">
                Log your first entry to see your progress charts and trends
              </p>
              <Button onClick={() => setIsAddingProgress(true)} className="bg-primary-500 hover:bg-primary-600">
                <Plus className="w-4 h-4 mr-2" />
                Log Your First Entry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recent Entries */}
        {progressEntries && progressEntries.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Recent Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progressEntries.slice(0, 10).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-medium">
                        {new Date(entry.date).toLocaleDateString()}
                      </div>
                      <div className="flex gap-4">
                        {entry.weightKg && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Scale className="w-3 h-3" />
                            {entry.weightKg}kg
                          </Badge>
                        )}
                        {entry.waterLitres && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Droplets className="w-3 h-3 text-blue-500" />
                            {entry.waterLitres}L
                          </Badge>
                        )}
                      </div>
                    </div>
                    {entry.notes && (
                      <p className="text-sm text-muted-foreground max-w-xs truncate">
                        {entry.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
