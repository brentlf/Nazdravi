import { useState } from "react";
import {
  ClipboardList,
  MessageCircle,
  BookOpen,
  Calendar,
  Users,
  Target,
  CheckCircle,
  Star,
  Award,
  TrendingUp,
  Crown,
  CreditCard,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useFirestoreDocument } from "@/hooks/useFirestore";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FloatingOrganic,
  DoodleConnector,
  OrganicImage,
} from "@/components/ui/PageTransition";

export default function Services() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: userData } = useFirestoreDocument("users", user?.uid || "");
  const [showBillingConfirmation, setShowBillingConfirmation] = useState(false);
  const [pendingPlanType, setPendingPlanType] = useState<"pay-as-you-go" | "complete-program" | null>(null);

  const handleServicePlanSelection = async (planType: "pay-as-you-go" | "complete-program") => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to select a service plan.",
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }

    // Show billing confirmation for Complete Program upgrade
    if (planType === "complete-program" && userData?.servicePlan !== "complete-program") {
      setPendingPlanType(planType);
      setShowBillingConfirmation(true);
      return;
    }

    await updateServicePlan(planType);
  };

  const updateServicePlan = async (planType: "pay-as-you-go" | "complete-program") => {
    try {
      const userRef = doc(db, "users", user!.uid);
      const updateData: any = {
        servicePlan: planType,
        updatedAt: new Date(),
      };

      // If selecting complete program, add program dates
      if (planType === "complete-program") {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 3); // 3 months program

        updateData.programStartDate = startDate;
        updateData.programEndDate = endDate;
      }

      await updateDoc(userRef, updateData);

      toast({
        title: "Service Plan Updated",
        description: `You've selected the ${planType === "complete-program" ? "Complete Program" : "Pay As You Go"} plan.`,
      });

      // Redirect to appointment booking with selected plan
      setLocation(`/appointment?plan=${planType}`);
    } catch (error) {
      console.error("Error updating service plan:", error);
      toast({
        title: "Error",
        description: "Failed to update service plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const confirmBillingUpgrade = async () => {
    if (pendingPlanType) {
      await updateServicePlan(pendingPlanType);
      setShowBillingConfirmation(false);
      setPendingPlanType(null);
    }
  };

  const cancelBillingUpgrade = () => {
    setShowBillingConfirmation(false);
    setPendingPlanType(null);
  };

  const mainServices = [
    {
      icon: ClipboardList,
      title: "Meal Plans",
      description: "Custom nutrition tailored to you",
      features: ["Meal planning", "Shopping lists", "Recipe swaps"],
      price: "€80/month",
    },
    {
      icon: MessageCircle,
      title: "24/7 Support",
      description: "Direct access to expert guidance",
      features: ["Quick responses", "Progress tracking", "Daily motivation"],
      price: "€120/month",
      popular: true,
    },
    {
      icon: BookOpen,
      title: "Resources",
      description: "Complete nutrition education",
      features: ["Guides", "Videos", "Meal prep tips"],
      price: "€50/month",
    },
  ];

  const additionalServices = [
    {
      icon: Calendar,
      title: "1:1 Sessions",
      description: "Personal nutrition consultation",
      duration: "60 min",
      price: "€85",
    },
    {
      icon: Users,
      title: "Group Sessions",
      description: "Interactive nutrition workshops",
      duration: "90 min",
      price: "€35",
    },
    {
      icon: Target,
      title: "Specialized Programs",
      description: "Targeted programs for specific health conditions or goals",
      duration: "3-6 months",
      price: "Custom pricing",
    },
  ];

  const benefits = [
    "Evidence-based nutrition approach",
    "Flexible meal planning options",
    "Ongoing support and motivation",
    "Progress tracking and adjustments",
    "Recipe modifications for dietary needs",
    "Educational resources and guides",
  ];

  const servicePackages = [
    {
      title: "Pay As You Go",
      description: "Flexible pricing for individual services",
      price: "From €50",
      features: [
        "Individual sessions",
        "No commitment",
        "Choose your services",
        "Perfect for testing",
      ],
      popular: false,
    },
    {
      title: "Complete Program",
      description: "Comprehensive 3-month transformation",
      price: "€299/3 months",
      features: [
        "Full meal planning",
        "24/7 support",
        "Progress tracking",
        "Guaranteed results",
      ],
      popular: true,
    },
  ];

  return (
    <div className="min-h-screen py-10 bg-background relative overflow-hidden page-content">
      <div className="container mx-auto px-4 relative z-10">
        {/* Hero Section */}
        <section className="mb-10 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Transform Your Health Journey
            </h1>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Personalized nutrition services designed to fit your lifestyle and
              goals.
            </p>
          </div>
        </section>

        {/* Service Packages */}
        <section className="mb-10">
          <h2 className="font-display text-2xl md:text-3xl text-center mb-8">
            Choose Your Plan
          </h2>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-10">
            {servicePackages.map((pkg, index) => (
              <Card
                key={index}
                className={`mediterranean-card h-full floating-element ${pkg.popular ? "ring-2 ring-primary/20" : ""}`}
              >
                <CardContent className="p-6 relative">
                  {pkg.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white">
                      Most Popular
                    </Badge>
                  )}

                  <div className="text-center mb-4">
                    <h3 className="font-display text-xl font-bold mb-2">
                      {pkg.title}
                    </h3>
                    <p className="text-muted-foreground mb-3">
                      {pkg.description}
                    </p>
                    <div className="text-2xl font-bold text-primary">
                      {pkg.price}
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className="w-full" 
                    onClick={() => handleServicePlanSelection(
                      pkg.title === "Complete Program" ? "complete-program" : "pay-as-you-go"
                    )}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Core Services */}
        <section className="mb-8">
          <h2 className="font-display text-2xl text-center mb-6">
            What's Included
          </h2>

          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {mainServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <div key={index} className="relative">
                  <Card className="mediterranean-card h-full floating-element">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <Icon className="w-8 h-8 text-primary mx-auto mb-2" />
                        <h3 className="font-display text-lg font-bold mb-1">
                          {service.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {service.description}
                        </p>
                        <div className="text-lg font-bold text-primary">
                          {service.price}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Floating organic decorations */}
                  {index === 0 && (
                    <FloatingOrganic
                      className="absolute -top-8 -left-8 opacity-30"
                      size="small"
                      delay={1}
                    />
                  )}
                  {index === 2 && (
                    <FloatingOrganic
                      className="absolute -bottom-8 -right-8 opacity-30"
                      size="small"
                      delay={3}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/*Additional Services 
        <section className="mb-6">
          <h2 className="font-display text-xl text-center mb-4">Additional Options</h2>
          
          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {additionalServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="mediterranean-card floating-element">
                  <CardContent className="p-3 text-center">
                    <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
                    <h3 className="font-display text-sm font-bold mb-1">{service.title}</h3>
                    <p className="text-xs text-muted-foreground mb-1">{service.description}</p>
                    <p className="text-sm font-bold text-primary">{service.price}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>*/}

        {/* CTA Section 
        <section className="text-center">
          <div className="max-w-lg mx-auto">
            <h2 className="font-display text-2xl font-bold mb-4">
              Ready to Begin?
            </h2>
            <p className="text-muted-foreground mb-6">
              Take the first step towards a healthier you.
            </p>
            <Button asChild className="w-full">
              <Link href="/appointment">Book Consultation</Link>
            </Button>
          </div>
        </section>*/}
      </div>

      {/* Floating background elements */}
      <FloatingOrganic
        className="absolute top-20 -right-20 opacity-15"
        size="large"
        delay={1}
      />
      <FloatingOrganic
        className="absolute bottom-20 -left-20 opacity-15"
        size="large"
        delay={3}
      />
      <FloatingOrganic
        className="absolute top-1/2 right-10 opacity-10"
        size="medium"
        delay={2}
      />
      <FloatingOrganic
        className="absolute bottom-1/3 left-10 opacity-10"
        size="medium"
        delay={4}
      />

      {/* Billing Confirmation Dialog */}
      <Dialog open={showBillingConfirmation} onOpenChange={setShowBillingConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-orange-600" />
              </div>
              Complete Program Upgrade
            </DialogTitle>
            <DialogDescription className="text-left pt-2">
              You're about to upgrade to the Complete Program which includes:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Crown className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">What's Included:</h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 mt-2 space-y-1">
                    <li>• Unlimited nutrition consultations</li>
                    <li>• Personalized meal plans and recipes</li>
                    <li>• Priority 24/7 support access</li>
                    <li>• Weekly progress tracking sessions</li>
                    <li>• Comprehensive nutrition education</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs font-bold">€</span>
                </div>
                <div>
                  <h4 className="font-semibold text-amber-900 dark:text-amber-100">Billing Information:</h4>
                  <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                    <strong>€299 per month</strong> - Billing starts immediately upon confirmation.
                    Your first charge will be processed today and will recur monthly.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              By confirming, you agree to the monthly subscription fee and terms of service.
              You can cancel anytime from your account settings.
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={cancelBillingUpgrade}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmBillingUpgrade}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
            >
              Confirm Upgrade - €299/month
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
