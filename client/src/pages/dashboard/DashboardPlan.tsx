import { useState } from "react";
import { Download, FileText, Calendar, AlertCircle, ExternalLink, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { Plan } from "@/types";
import { where, orderBy } from "firebase/firestore";
import { Link } from "wouter";

export default function DashboardPlan() {
  const { user } = useAuth();
  
  // Fetch user's nutrition plans
  const { data: plans, loading } = useFirestoreCollection<Plan>("plans", [
    where("userId", "==", user?.uid || ""),
    orderBy("createdAt", "desc")
  ]);

  const latestPlan = plans?.[0];

  const handleDownload = (plan: Plan) => {
    // In a real app, this would download from Firebase Storage
    alert(`Downloading ${plan.title}... This would download the PDF from Firebase Storage.`);
  };

  const handleViewOnline = (plan: Plan) => {
    // In a real app, this would open the PDF viewer
    alert(`Opening ${plan.title} in viewer... This would open a PDF viewer component.`);
  };

  if (loading) {
    return (
      <div className="min-h-screen py-20 bg-gray-50 dark:bg-gray-900">
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Nutrition Plan</h1>
          <p className="text-muted-foreground">
            Access your personalized nutrition plan and meal guides
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {latestPlan ? (
            <>
              {/* Current Plan */}
              <Card className="border-primary-200 bg-primary-50 dark:bg-primary-900/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{latestPlan.title}</CardTitle>
                        <p className="text-muted-foreground">
                          Created on {new Date(latestPlan.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-primary-500 text-white">Current Plan</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      onClick={() => handleViewOnline(latestPlan)}
                      className="flex-1 bg-primary-500 hover:bg-primary-600"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Online
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleDownload(latestPlan)}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Plan Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Plan Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-primary-600 dark:text-primary-400">What's Included</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                          <span>Personalized meal plans for 4 weeks</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                          <span>Shopping lists and prep guides</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                          <span>Recipe alternatives and substitutions</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                          <span>Macro and calorie breakdowns</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                          <span>Supplement recommendations</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-semibold text-primary-600 dark:text-primary-400">How to Use Your Plan</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
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
