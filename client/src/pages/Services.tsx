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
    <div className="min-h-screen bg-background relative">
      {/* Background Image - Full Screen */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: `url(/OrangesBG.jpg)`,
        }}
      />
      {/* Dark overlay - Full Screen */}
      <div className="fixed inset-0 bg-black/40 -z-10" />

      {/* Content Container - Full height with proper spacing for footer overlay */}
      <div className="min-h-screen pt-16 pb-20">
        {/* Main content section */}
        <section className="flex flex-col justify-center px-4 h-full">
          <div className="max-w-6xl mx-auto w-full">
            {/* Header Section */}
            <div className="text-center mb-4 flex-shrink-0">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-white/15 backdrop-blur-sm rounded-full mb-2">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 leading-tight text-white font-serif">
                Nutrition Services
              </h1>
              <p className="text-xs sm:text-sm text-white/90 max-w-xl mx-auto leading-relaxed">
                Transform your health with evidence-based nutrition guidance tailored to your unique needs and lifestyle.
              </p>
            </div>

            {/* Services Grid */}
            <div className="grid lg:grid-cols-3 gap-3 mb-4 flex-shrink-0">
              {services.map((service, index) => (
                <Card key={index} className={`relative border-0 bg-white/15 backdrop-blur-sm hover:bg-white/25 transition-all duration-300 rounded-xl ${service.popular ? 'ring-2 ring-yellow-400/50' : ''}`}>
                  {service.popular && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-yellow-400 text-gray-900 px-2 py-0.5 text-xs font-medium">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-3 text-white">
                    <div className={`inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br ${service.color} rounded-xl mb-2`}>
                      <service.icon className="h-4 w-4 text-white" />
                    </div>
                    
                    <h3 className="text-sm font-bold mb-1">
                      {service.title}
                    </h3>
                    
                    <p className="text-white/80 mb-2 leading-relaxed text-xs">
                      {service.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-white/70">
                        Duration: {service.duration}
                      </div>
                      <div className="text-base font-bold">
                        {service.price}
                      </div>
                    </div>
                    
                    <ul className="space-y-1 mb-2">
                      {service.features.slice(0, 2).map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-1 text-xs">
                          <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
                          <span className="text-white/90">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className="w-full bg-white text-gray-900 hover:bg-gray-100 font-medium text-xs py-1 h-7"
                      onClick={() => handleServicePlanSelection(service.id as any)}
                    >
                      {service.id === "program" ? "Start Program" : "Book Now"}
                      <ChevronRight className="ml-1 h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* CTA Section */}
            <div className="text-center flex-shrink-0">
              <Link href="/appointment">
                <Button size="sm" className="bg-white text-gray-900 hover:bg-gray-100 px-3 py-1.5 text-xs font-semibold">
                  Book Your Consultation
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>

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