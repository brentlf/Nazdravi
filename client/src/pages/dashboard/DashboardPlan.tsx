import { useState } from "react";
import { Download, FileText, Calendar, AlertCircle, ExternalLink, ArrowLeft, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { Plan } from "@/types";
import { where, orderBy } from "firebase/firestore";
import { Link } from "wouter";
import { FloatingOrganic, DoodleConnector } from "@/components/ui/PageTransition";

export default function DashboardPlan() {
  const { effectiveUser: user, isAdminViewingClient } = useAuth();
  
  // Fetch user's nutrition plans with real-time updates
  const { data: plans, loading } = useFirestoreCollection<Plan>("plans", [
    where("userId", "==", user?.uid || "")
  ]);

  // Debug logging to check data flow
  console.log('DashboardPlan Debug:', {
    userId: user?.uid,
    plansFound: plans?.length || 0,
    plans: plans,
    loading
  });

  const latestPlan = plans?.[0];

  const handleDownload = async (plan: Plan) => {
    if (plan.downloadURL) {
      try {
        // Fetch the file as a blob
        const response = await fetch(plan.downloadURL);
        const blob = await response.blob();
        
        // Create a download link
        const link = window.document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        link.download = plan.fileName || `${plan.title}.pdf`;
        
        // Force download
        window.document.body.appendChild(link);
        link.click();
        
        // Cleanup
        window.document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download failed:', error);
        // Fallback to direct link
        const link = window.document.createElement('a');
        link.href = plan.downloadURL;
        link.download = plan.fileName || `${plan.title}.pdf`;
        link.target = '_blank';
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
      }
    } else {
      alert('Download URL not available for this document.');
    }
  };

  const handleViewOnline = (plan: Plan) => {
    if (plan.downloadURL) {
      window.open(plan.downloadURL, '_blank');
    } else {
      alert('Document URL not available for viewing.');
    }
  };

  if (loading) {
    return (
      <div className="h-full bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="animate-pulse">
              <CardContent className="p-8">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-viewport bg-background">
      <div className="container mx-auto px-3 py-2">
        {/* Back to Dashboard Navigation */}
        <div className="mb-2">
          <Link href="/dashboard">
            <Button variant="ghost" className="flex items-center gap-1 text-xs px-2 py-1">
              <ArrowLeft className="w-3 h-3" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-3">
          <h1 className="text-xl font-bold mb-1">My Nutrition Plan</h1>
          <p className="text-sm text-muted-foreground">
            Access your personalized nutrition plan and meal guides
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-3">
          {latestPlan ? (
            <>
              {/* Current Plan */}
              <Card className="border-primary-200 bg-primary-50 dark:bg-primary-900/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{latestPlan.title}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          Created on {new Date(latestPlan.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-primary-500 text-white text-xs">Current Plan</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      onClick={() => handleViewOnline(latestPlan)}
                      className="flex-1 bg-primary-500 hover:bg-primary-600 text-xs py-2"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View Online
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleDownload(latestPlan)}
                      className="flex-1 text-xs py-2"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Plan Overview */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Plan Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-primary-600 dark:text-primary-400 text-sm">What's Included</h3>
                      <ul className="space-y-1 text-xs">
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                          <span>Personalized meal plans for 4 weeks</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                          <span>Shopping lists and prep guides</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                          <span>Recipe alternatives and substitutions</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                          <span>Macro and calorie breakdowns</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                          <span>Supplement recommendations</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-semibold text-primary-600 dark:text-primary-400 text-sm">How to Use Your Plan</h3>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        <li>1. Review the meal plan overview and goals</li>
                        <li>2. Check the weekly shopping lists</li>
                        <li>3. Follow the prep day guidelines</li>
                        <li>4. Track your progress using the dashboard</li>
                        <li>5. Reach out with any questions via messages</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Previous Plans */}
              {plans && plans.length > 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Previous Plans</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {plans.slice(1).map((plan) => (
                        <div key={plan.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{plan.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(plan.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleViewOnline(plan)}>
                              View
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDownload(plan)}>
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            /* No Plan Available */
            <Card>
              <CardContent className="p-12 text-center">
                <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Nutrition Plan Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Your personalized nutrition plan will appear here after your initial consultation.
                </p>
                
                <Alert className="max-w-md mx-auto mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Book an appointment to get your personalized nutrition plan created by your nutritionist.
                  </AlertDescription>
                </Alert>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild>
                    <a href="/dashboard/appointments">
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Consultation
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/dashboard/messages">
                      Ask a Question
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Support Section */}
          <Card className="bg-blue-50 dark:bg-blue-900/20">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Need Help with Your Plan?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                If you have questions about your nutrition plan, need recipe modifications, 
                or want to discuss challenges you're facing, don't hesitate to reach out.
              </p>
              <Button size="sm" variant="outline" asChild>
                <a href="/dashboard/messages">
                  Message Your Nutritionist
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
