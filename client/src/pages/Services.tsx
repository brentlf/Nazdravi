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
  Info,
  Lock,
  ArrowRight,
  ChevronRight,
  Leaf,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

      // Refresh user data
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

  const additionalServices = [
    {
      icon: BookOpen,
      title: "Meal Planning",
      description: "Custom weekly meal plans with shopping lists",
      price: "€40/week",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Target,
      title: "Progress Tracking",
      description: "Advanced analytics and goal monitoring",
      price: "€25/month",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Users,
      title: "Group Sessions",
      description: "Small group nutrition workshops",
      price: "€35/session",
      color: "from-indigo-500 to-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        {/* Natural background with overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23d1fae5%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
        </div>

        <div className="relative z-10 container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-2xl mb-8">
              <Leaf className="h-10 w-10 text-primary-foreground" />
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-8 text-balance text-foreground">
              Nutrition Services
            </h1>
            
            <p className="text-xl lg:text-2xl mb-12 text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Transform your health with evidence-based nutrition guidance tailored to your unique needs and lifestyle.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/appointment">
                <Button size="lg" className="text-lg px-8 py-6 shadow-elegant hover:shadow-2xl transition-all duration-300">
                  Book Your Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-balance">
              Choose Your Path
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              From single consultations to comprehensive programs, find the perfect level of support for your journey.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {services.map((service, index) => (
              <Card key={index} className={`relative border-0 shadow-soft hover:shadow-elegant transition-all duration-500 hover:-translate-y-2 ${service.popular ? 'ring-2 ring-primary/20' : ''}`}>
                {service.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardContent className="p-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <service.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 text-foreground">
                    {service.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-sm text-muted-foreground">
                      Duration: {service.duration}
                    </div>
                    <div className="text-3xl font-bold text-foreground">
                      {service.price}
                    </div>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-foreground text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                    onClick={() => handleServicePlanSelection(service.id as any)}
                  >
                    {service.id === "program" ? "Start Program" : "Book Now"}
                    <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-balance">
              Additional Support
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Enhance your nutrition journey with specialized services designed to meet your specific needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {additionalServices.map((service, index) => (
              <Card key={index} className="border-0 shadow-soft hover:shadow-elegant transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <service.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-4 text-foreground">
                    {service.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  
                  <div className="text-2xl font-bold text-foreground mb-6">
                    {service.price}
                  </div>
                  
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    Learn More
                    <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl lg:text-5xl font-bold mb-8 text-balance">
                  Why Choose Nazdravi?
                </h2>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Our evidence-based approach combines cutting-edge nutrition science with personalized care to deliver sustainable results.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                      <Award className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Registered Professional</h3>
                      <p className="text-muted-foreground">Licensed with HPCSA and HCPC</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Personalized Approach</h3>
                      <p className="text-muted-foreground">Tailored to your unique needs</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Proven Results</h3>
                      <p className="text-muted-foreground">95% success rate with clients</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-8 lg:p-12">
                  <div className="text-center">
                    <div className="text-6xl lg:text-7xl font-bold text-primary mb-4">500+</div>
                    <div className="text-xl font-semibold text-foreground mb-2">Happy Clients</div>
                    <div className="text-muted-foreground">Transformed through better nutrition</div>
                  </div>
                  <div className="mt-8 grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-foreground">8+</div>
                      <div className="text-sm text-muted-foreground">Years Experience</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-foreground">95%</div>
                      <div className="text-sm text-muted-foreground">Success Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-balance">
              Ready to Transform Your Health?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Start your journey to better nutrition today with a personalized consultation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/appointment">
                <Button size="lg" className="text-lg px-8 py-6 shadow-elegant hover:shadow-2xl transition-all duration-300">
                  Book Your Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                  Learn More About Us
                </Button>
              </Link>
            </div>
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
