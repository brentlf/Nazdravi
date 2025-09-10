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
      price: "€95",
      features: [
        "Detailed health history review",
        "Current eating habits analysis",
        "Personalized nutrition plan",
        "Goal setting & recommendations",
      ],
      color: "from-emerald-500 to-teal-500",
      popular: false,
    },
    {
      id: "followup",
      icon: MessageCircle,
      title: "Follow-up Sessions",
      description: "Ongoing support and plan adjustments",
      duration: "30 minutes",
      price: "€40",
      features: [
        "Progress review and accountability",
        "Adjustments to nutrition plan",
        "Motivation and practical tips",
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
      price: "€300",
      features: [
        "Initial consultation (60 min) + 5 follow-up sessions (30 min each)",
        "Weekly meal plans & recipes",
        "Messaging support for questions and accountability",
        "Progress tracking tools",
      ],
      color: "from-purple-500 to-pink-500",
      popular: true,
    },
  ];

  return (
    <div className="page-wrapper">
      {/* Main content section */}
      <section className="page-content p-3 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto w-full">
          {/* Header Section */}
          <div className="text-center mb-3 xs:mb-4 sm:mb-6">
            <div className="inline-flex items-center justify-center w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full mb-2 xs:mb-3">
              <Leaf className="h-4 w-4 xs:h-5 xs:h-5 sm:h-6 sm:h-6 text-primary" />
            </div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold mb-2 xs:mb-3 leading-tight text-foreground" 
                style={{fontFamily: 'The Seasons, serif', letterSpacing: '-0.01em'}}>
              Nutrition Services
            </h1>
            <p className="text-sm xs:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Transform your health with evidence-based nutrition guidance tailored to your unique needs and lifestyle.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 sm:gap-5 mb-4 xs:mb-6 sm:mb-8">
            {services.map((service, index) => (
              <Card key={index} className={`relative border border-border bg-card hover:shadow-lg transition-all duration-300 ${service.popular ? 'ring-2 ring-yellow-400/50' : ''}`}>
                {service.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 font-bold text-xs shadow-lg border-2 border-yellow-300/50">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardContent className="p-3 xs:p-4 text-card-foreground h-full flex flex-col">
                  <div className={`inline-flex items-center justify-center w-8 h-8 xs:w-10 xs:h-10 bg-gradient-to-br ${service.color} rounded-xl mb-2 xs:mb-3`}>
                    <service.icon className="h-4 w-4 xs:h-5 xs:w-5 text-foreground" />
                  </div>
                  
                  <h3 className="text-base xs:text-lg font-bold mb-1 xs:mb-2">
                    {service.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-2 xs:mb-3 leading-relaxed flex-grow text-xs xs:text-sm">
                    {service.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-2 xs:mb-3">
                    <div className="text-xs xs:text-sm text-muted-foreground">
                      Duration: {service.duration}
                    </div>
                    <div className="text-lg xs:text-xl font-bold text-primary">
                      {service.price}
                    </div>
                  </div>
                  
                  <ul className="space-y-1 xs:space-y-1.5 mb-3 xs:mb-4 flex-grow">
                    {service.features.slice(0, 3).map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-1 xs:gap-1.5">
                        <CheckCircle className="h-3 w-3 xs:h-3.5 xs:w-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground text-xs xs:text-sm">{feature}</span>
                      </li>
                    ))}
                    {service.features.length > 3 && (
                      <li className="text-xs xs:text-sm text-muted-foreground italic">+ {service.features.length - 3} more features</li>
                    )}
                  </ul>
                  
                  <Button 
                    variant="outline"
                    className={`w-full font-semibold py-2 xs:py-3 text-xs xs:text-sm transition-all duration-300 transform hover:scale-105 ${
                      service.popular 
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-lg hover:shadow-xl border-2 border-yellow-400/30' 
                        : '!bg-primary/10 hover:!bg-primary/20 !border-2 !border-primary/30 shadow-md hover:shadow-lg'
                    }`}
                    style={service.popular ? {} : {
                      backgroundColor: 'hsl(var(--primary) / 0.1)',
                      borderColor: 'hsl(var(--primary) / 0.3)'
                    }}
                    onClick={() => handleServicePlanSelection(service.id as any)}
                  >
                    {service.id === "program" ? "Start Program" : "Book Now"}
                    <ChevronRight className="ml-2 h-3 w-3 xs:h-4 xs:w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-3 xs:p-4 sm:p-6 shadow-lg">
            <h3 className="text-lg xs:text-xl font-bold text-foreground mb-2 xs:mb-3">💡 Not sure which option is right for you?</h3>
            <p className="text-muted-foreground mb-4 xs:mb-6 max-w-2xl mx-auto text-sm xs:text-base">
              Schedule a free 15-minute consultation to discuss your goals and find the perfect service for your needs.
            </p>
            <Link href="/appointment">
              <Button size="lg" className="px-6 xs:px-8 py-2 xs:py-3 text-sm xs:text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transform hover:scale-105 border-2 border-primary/20">
                Book Your Consultation
                <ArrowRight className="ml-2 h-4 w-4 xs:h-5 xs:w-5" />
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
              <li>• Initial consultation (60 min) + 5 follow-up sessions (30 min each)</li>
              <li>• Weekly meal plans & recipes</li>
              <li>• Messaging support for questions and accountability</li>
              <li>• Progress tracking tools</li>
            </ul>
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium text-foreground">Total: €300</p>
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