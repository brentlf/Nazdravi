import { useState } from "react";
import {
  CheckCircle,
  Crown,
  Star,
  ArrowRight,
  Calendar,
  MessageCircle,
  FileText,
  Target,
  Users,
  Clock,
  Shield,
  Heart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
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

export default function Plans() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: userData } = useFirestoreDocument("users", user?.uid || "");
  const [showBillingConfirmation, setShowBillingConfirmation] = useState(false);
  const [pendingPlanType, setPendingPlanType] = useState<"pay-as-you-go" | "complete-program" | null>(null);

  const handlePlanSelection = async (planType: "pay-as-you-go" | "complete-program") => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to select a plan.",
        variant: "destructive",
      });
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
        title: "Plan Updated",
        description: `You've selected the ${planType === "complete-program" ? "Complete Program" : "Pay As You Go"} plan.`,
      });

      window.location.reload();
    } catch (error) {
      console.error("Error updating service plan:", error);
      toast({
        title: "Error",
        description: "Failed to update plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const services = [
    {
      id: "initial",
      icon: Calendar,
      title: "Initial Consultation",
      description: "Comprehensive assessment and personalised nutrition strategy",
      duration: "60 minutes",
      price: "€95",
      features: [
        "Detailed health history review",
        "Current eating habits analysis",
        "Personalised nutrition plan",
        "Goal setting & recommendations",
        "Plus more features"
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
        "Plus more features"
      ],
      color: "from-blue-500 to-cyan-500",
      popular: false,
    },
    {
      id: "program",
      icon: Crown,
      title: "Complete Programme",
      description: "Comprehensive 3-month transformation journey",
      duration: "3 months",
      price: "€300",
      features: [
        "Initial consultation (60 min) + 5 follow-up sessions (30 min each)",
        "Weekly support",
        "Messaging support for questions and accountability",
        "Progress tracking tools",
        "Plus more features"
      ],
      color: "from-purple-500 to-pink-500",
      popular: true,
    },
  ];

  return (
    <div className="page-wrapper -mt-28 pt-28 relative" style={{
      minHeight: '100vh',
      paddingTop: '0'
    }}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 w-full h-full z-0"
        style={{
          backgroundImage: 'url("/pexels-readymade-3850662.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20 z-10"></div>
      {/* Main content section */}
      <section className="page-content p-3 sm:p-4 lg:p-6 relative z-20">
        <div className="max-w-7xl mx-auto w-full">
          {/* Header Section */}
          <div className="text-center mb-8 xs:mb-10 sm:mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mb-4 xs:mb-6">
              <Crown className="h-6 w-6 xs:h-7 xs:h-7 sm:h-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-3xl xs:text-4xl sm:text-5xl font-bold mb-3 xs:mb-4 text-white" 
                style={{fontFamily: 'The Seasons, serif', letterSpacing: '-0.01em'}}>
              Choose Your Plan
            </h1>
            <p className="text-lg xs:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed" style={{fontFamily: 'Calibri, sans-serif', letterSpacing: '0.02em'}}>
              Select the nutrition plan that best fits your lifestyle and goals. Both options provide expert guidance tailored to your unique needs.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 sm:gap-5 mb-4 xs:mb-6 sm:mb-8">
            {services.map((service, index) => (
                <Card key={index} className={`relative border border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 ${service.popular ? 'ring-2 ring-yellow-400/50' : ''}`}>
                {service.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 font-bold text-xs shadow-lg border-2 border-yellow-300/50">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardContent className="p-3 xs:p-4 text-white h-full flex flex-col">
                  <div className={`inline-flex items-center justify-center w-8 h-8 xs:w-10 xs:h-10 bg-gradient-to-br ${service.color} rounded-xl mb-2 xs:mb-3`}>
                    <service.icon className="h-4 w-4 xs:h-5 xs:w-5 text-white" />
                  </div>
                  
                  <h3 className="text-xl xs:text-2xl font-bold mb-1 xs:mb-2" style={{fontFamily: 'The Seasons, serif', letterSpacing: '-0.01em'}}>
                    {service.title}
                  </h3>
                  
                  <p className="text-white/90 mb-2 xs:mb-3 leading-relaxed flex-grow text-base xs:text-lg" style={{fontFamily: 'Calibri, sans-serif', letterSpacing: '0.02em'}}>
                    {service.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-2 xs:mb-3">
                    <div className="text-sm xs:text-base text-white/80" style={{fontFamily: 'Calibri, sans-serif', letterSpacing: '0.02em'}}>
                      Duration: {service.duration}
                    </div>
                    <div className="text-xl xs:text-2xl font-bold text-white" style={{fontFamily: 'Calibri, sans-serif', letterSpacing: '0.02em'}}>
                      {service.price}
                    </div>
                  </div>
                  
                  <ul className="space-y-1 xs:space-y-1.5 mb-3 xs:mb-4 flex-grow">
                    {service.features.slice(0, 3).map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-1 xs:gap-1.5">
                        <CheckCircle className="h-3 w-3 xs:h-3.5 xs:w-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-white/90 text-sm xs:text-base" style={{fontFamily: 'Calibri, sans-serif', letterSpacing: '0.02em'}}>{feature}</span>
                      </li>
                    ))}
                    {service.features.length > 3 && (
                      <li className="text-sm xs:text-base text-white/80 italic" style={{fontFamily: 'Calibri, sans-serif', letterSpacing: '0.02em'}}>+ more features</li>
                    )}
                  </ul>
                  
                    <Button 
                      variant="outline"
                      className={`w-full font-semibold py-2 xs:py-3 text-sm xs:text-base transition-all duration-300 transform hover:scale-105 ${
                        service.popular 
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-lg hover:shadow-xl border-2 border-yellow-400/30 text-white' 
                          : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl border-2 border-blue-400/30 text-white'
                      }`}
                      onClick={() => handlePlanSelection(service.id as any)}
                    >
                    {service.id === "program" ? "Start Program" : "Book Now"}
                    <ArrowRight className="ml-2 h-3 w-3 xs:h-4 xs:w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-3 xs:p-4 sm:p-6 shadow-lg mb-8">
            <h3 className="text-xl xs:text-2xl font-bold text-white mb-2 xs:mb-3 uppercase" style={{fontFamily: 'The Seasons, serif', letterSpacing: '-0.01em'}}>💡 Not sure which option is right for you?</h3>
            <p className="text-white/90 mb-4 xs:mb-6 max-w-2xl mx-auto text-base xs:text-lg" style={{fontFamily: 'Calibri, sans-serif', letterSpacing: '0.02em'}}>
              Schedule a free 15-minute consultation to discuss your goals and find the perfect service for your needs.
            </p>
            <Link href="/appointment">
              <Button size="lg" className="px-6 xs:px-8 py-2 xs:py-3 text-base xs:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 transform hover:scale-105 border-2 border-yellow-300 text-white">
                Book Your Consultation
                <ArrowRight className="ml-2 h-4 w-4 xs:h-5 xs:w-5" />
              </Button>
            </Link>
          </div>

          {/* FAQ Section */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 xs:p-8">
            <h2 className="text-2xl xs:text-3xl font-bold text-white text-center mb-6 xs:mb-8" style={{fontFamily: 'The Seasons, serif', letterSpacing: '-0.01em'}}>
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Can I switch plans later?</h3>
                <p className="text-white/80 text-sm" style={{fontFamily: 'Calibri, sans-serif', letterSpacing: '0.02em'}}>
                  Yes! You can upgrade or downgrade your plan at any time. Contact us to discuss your options.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">What if I'm not satisfied?</h3>
                <p className="text-white/80 text-sm" style={{fontFamily: 'Calibri, sans-serif', letterSpacing: '0.02em'}}>
                  We offer a 30-day satisfaction guarantee. If you're not happy with your results, we'll work with you to make it right.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">How do I get started?</h3>
                <p className="text-white/80 text-sm" style={{fontFamily: 'Calibri, sans-serif', letterSpacing: '0.02em'}}>
                  Simply choose your plan and book your initial consultation. We'll guide you through every step of the process.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Is there a contract?</h3>
                <p className="text-white/80 text-sm" style={{fontFamily: 'Calibri, sans-serif', letterSpacing: '0.02em'}}>
                  No contracts! You can cancel or change your plan at any time. We believe in flexible, client-centered care.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Billing Confirmation Dialog */}
      <Dialog open={showBillingConfirmation} onOpenChange={setShowBillingConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{fontFamily: 'The Seasons, serif', letterSpacing: '-0.01em'}}>Complete Program Upgrade</DialogTitle>
            <DialogDescription style={{fontFamily: 'Calibri, sans-serif', letterSpacing: '0.02em'}}>
              You're about to upgrade to the Complete Program. This will provide you with comprehensive support for 3 months.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground" style={{fontFamily: 'Calibri, sans-serif', letterSpacing: '0.02em'}}>
              The Complete Program includes:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li style={{fontFamily: 'Calibri, sans-serif', letterSpacing: '0.02em'}}>• Initial consultation (60 min) + 5 follow-up sessions (30 min each)</li>
              <li style={{fontFamily: 'Calibri, sans-serif', letterSpacing: '0.02em'}}>• Weekly meal plans & recipes</li>
              <li style={{fontFamily: 'Calibri, sans-serif', letterSpacing: '0.02em'}}>• Unlimited messaging support</li>
              <li style={{fontFamily: 'Calibri, sans-serif', letterSpacing: '0.02em'}}>• Progress tracking tools</li>
            </ul>
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium text-foreground" style={{fontFamily: 'Calibri, sans-serif', letterSpacing: '0.02em'}}>Total: €300</p>
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
