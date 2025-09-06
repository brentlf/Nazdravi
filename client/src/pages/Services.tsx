import { useState } from "react";
import {
  MessageCircle,
  CheckCircle,
  ChevronRight,
  ArrowRight,
  Leaf,
  Crown,
  Calendar,
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

      if (planType === "complete-program") {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 3);
        updateData.programStartDate = startDate;
        updateData.programEndDate = endDate;
      }

      await updateDoc(userRef, updateData);

      toast({
        title: "Service Plan Updated",
        description: `You've selected the ${planType === "complete-program" ? "Complete Program" : "Pay As You Go"} plan.`,
      });

      window.location.reload();
    } catch (error) {
      console.error("Error updating service plan:", error);
      toast({
        title: "Error",
        description: "Failed to update service plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const services = [
    {
      id: "initial",
      icon: Calendar,
      title: "Initial Consultation",
      description: "Comprehensive assessment and personalized nutrition strategy",
      duration: "60 minutes",
      price: "€120",
      features: [
        "Detailed health history review",
        "Current eating habits analysis",
        "Body composition assessment",
        "Personalized nutrition plan",
        "30-day follow-up support",
      ],
      color: "from-emerald-500 to-teal-500",
      popular: false,
    },
    {
      id: "followup",
      icon: MessageCircle,
      title: "Follow-up Sessions",
      description: "Ongoing support and plan adjustments",
      duration: "45 minutes",
      price: "€80",
      features: [
        "Progress review and assessment",
        "Plan adjustments and optimization",
        "New goal setting",
        "Continued motivation and support",
        "Recipe and meal suggestions",
      ],
      color: "from-blue-500 to-cyan-500",
      popular: false,
    },
    {
      id: "program",
      icon: Crown,
      title: "Complete Program",
      description: "Comprehensive 3-month transformation journey",
      duration: "3 months",
      price: "€450",
      features: [
        "Initial consultation + 6 follow-ups",
        "Weekly meal plans and recipes",
        "24/7 messaging support",
        "Progress tracking tools",
        "Educational resources",
        "Final assessment and maintenance plan",
      ],
      color: "from-purple-500 to-pink-500",
      popular: true,
    },
  ];

  return (
    <div className="min-h-screen pt-16 pb-20">
      {/* Main content section */}
      <section className="px-4 py-8">
        <div className="max-w-7xl mx-auto w-full">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
              <Leaf className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight text-foreground font-serif">
              Nutrition Services
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Transform your health with evidence-based nutrition guidance tailored to your unique needs and lifestyle.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid lg:grid-cols-3 gap-6 mb-12">
            {services.map((service, index) => (
              <Card key={index} className={`relative border border-border bg-card hover:shadow-lg transition-all duration-300 ${service.popular ? 'ring-2 ring-yellow-400/50' : ''}`}>
                {service.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-yellow-400 text-gray-900 px-3 py-1 font-medium">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardContent className="p-6 text-card-foreground h-full flex flex-col">
                  <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${service.color} rounded-xl mb-4`}>
                    <service.icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3">
                    {service.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-4 leading-relaxed flex-grow">
                    {service.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-muted-foreground">
                      Duration: {service.duration}
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {service.price}
                    </div>
                  </div>
                  
                  <ul className="space-y-2 mb-6 flex-grow">
                    {service.features.slice(0, 4).map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground text-sm">{feature}</span>
                      </li>
                    ))}
                    {service.features.length > 4 && (
                      <li className="text-sm text-muted-foreground italic">+ {service.features.length - 4} more features</li>
                    )}
                  </ul>
                  
                  <Button 
                    className="w-full"
                    onClick={() => handleServicePlanSelection(service.id as any)}
                  >
                    {service.id === "program" ? "Start Program" : "Book Now"}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center bg-card border border-border rounded-2xl p-8">
            <h3 className="text-xl font-bold text-card-foreground mb-4">Not sure which option is right for you?</h3>
            <p className="text-muted-foreground mb-6">
              Schedule a free 15-minute consultation to discuss your goals and find the perfect service for your needs.
            </p>
            <Link href="/appointment">
              <Button size="lg" className="px-8 py-3">
                Book Your Consultation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Billing Confirmation Dialog */}
      <Dialog open={showBillingConfirmation} onOpenChange={setShowBillingConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Program Upgrade</DialogTitle>
            <DialogDescription>
              You're about to upgrade to the Complete Program. This will provide you with comprehensive support for 3 months.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              The Complete Program includes:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>• Initial consultation + 6 follow-ups</li>
              <li>• Weekly meal plans and recipes</li>
              <li>• 24/7 messaging support</li>
              <li>• Progress tracking tools</li>
              <li>• Educational resources</li>
            </ul>
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium text-foreground">Total: €450</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBillingConfirmation(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowBillingConfirmation(false);
              updateServicePlan(pendingPlanType!);
            }}>
              Confirm Upgrade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}