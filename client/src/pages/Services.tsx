import { ClipboardList, MessageCircle, BookOpen, Calendar, Users, Target, CheckCircle, Star, Award, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { FloatingOrganic, DoodleConnector, OrganicImage } from "@/components/ui/PageTransition";

export default function Services() {
  const mainServices = [
    {
      icon: ClipboardList,
      title: "Meal Plans",
      description: "Custom nutrition tailored to you",
      features: ["Meal planning", "Shopping lists", "Recipe swaps"],
      price: "€80/month"
    },
    {
      icon: MessageCircle,
      title: "24/7 Support",
      description: "Direct access to expert guidance",
      features: ["Quick responses", "Progress tracking", "Daily motivation"],
      price: "€120/month",
      popular: true
    },
    {
      icon: BookOpen,
      title: "Resources",
      description: "Complete nutrition education",
      features: ["Guides", "Videos", "Meal prep tips"],
      price: "€50/month"
    }
  ];

  const additionalServices = [
    {
      icon: Calendar,
      title: "1:1 Sessions",
      description: "Personal nutrition consultation",
      duration: "60 min",
      price: "€85"
    },
    {
      icon: Users,
      title: "Group Sessions",
      description: "Interactive nutrition workshops",
      duration: "90 min",
      price: "€35"
    },
    {
      icon: Target,
      title: "Specialized Programs",
      description: "Targeted programs for specific health conditions or goals",
      duration: "3-6 months",
      price: "Custom pricing"
    }
  ];

  const benefits = [
    "Evidence-based nutrition approach",
    "Flexible meal planning options",
    "Ongoing support and motivation",
    "Progress tracking and adjustments",
    "Recipe modifications for dietary needs",
    "Educational resources and guides"
  ];

  const servicePackages = [
    {
      title: "Pay As You Go",
      description: "Flexible pricing for individual services",
      price: "From €50",
      features: ["Individual sessions", "No commitment", "Choose your services", "Perfect for testing"],
      popular: false
    },
    {
      title: "Complete Program",
      description: "Comprehensive 3-month transformation",
      price: "€299/3 months",
      features: ["Full meal planning", "24/7 support", "Progress tracking", "Guaranteed results"],
      popular: true
    }
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
              Personalized nutrition services designed to fit your lifestyle and goals.
            </p>
          </div>
        </section>

        {/* Service Packages */}
        <section className="mb-10">
          <h2 className="font-display text-2xl md:text-3xl text-center mb-8">Choose Your Plan</h2>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-10">
            {servicePackages.map((pkg, index) => (
              <Card key={index} className={`mediterranean-card h-full floating-element ${pkg.popular ? 'ring-2 ring-primary/20' : ''}`}>
                <CardContent className="p-6 relative">
                  {pkg.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white">
                      Most Popular
                    </Badge>
                  )}
                  
                  <div className="text-center mb-4">
                    <h3 className="font-display text-xl font-bold mb-2">{pkg.title}</h3>
                    <p className="text-muted-foreground mb-3">{pkg.description}</p>
                    <div className="text-2xl font-bold text-primary">{pkg.price}</div>
                  </div>
                  
                  <ul className="space-y-2 mb-6">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button asChild className="w-full">
                    <Link href="/appointment">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Core Services */}
        <section className="mb-8">
          <h2 className="font-display text-2xl text-center mb-6">What's Included</h2>
          
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {mainServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <div key={index} className="relative">
                  <Card className="mediterranean-card h-full floating-element">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <Icon className="w-8 h-8 text-primary mx-auto mb-2" />
                        <h3 className="font-display text-lg font-bold mb-1">{service.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                        <div className="text-lg font-bold text-primary">{service.price}</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Floating organic decorations */}
                  {index === 0 && <FloatingOrganic className="absolute -top-8 -left-8 opacity-30" size="small" delay={1} />}
                  {index === 2 && <FloatingOrganic className="absolute -bottom-8 -right-8 opacity-30" size="small" delay={3} />}
                </div>
              );
            })}
            
            {/* Connecting doodle lines between cards */}
            <DoodleConnector direction="right" className="absolute top-1/2 left-1/3 transform -translate-y-1/2 w-16 hidden md:block" />
            <DoodleConnector direction="right" className="absolute top-1/2 left-2/3 transform -translate-y-1/2 w-16 hidden md:block" />
          </div>
        </section>

        {/* Additional Services */}
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
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="max-w-lg mx-auto">
            <h2 className="font-display text-2xl font-bold mb-4">Ready to Begin?</h2>
            <p className="text-muted-foreground mb-6">Take the first step towards a healthier you.</p>
            <Button asChild className="w-full">
              <Link href="/appointment">Book Consultation</Link>
            </Button>
          </div>
        </section>
      </div>
      
      {/* Floating background elements */}
      <FloatingOrganic className="absolute top-20 -right-20 opacity-15" size="large" delay={1} />
      <FloatingOrganic className="absolute bottom-20 -left-20 opacity-15" size="large" delay={3} />
      <FloatingOrganic className="absolute top-1/2 right-10 opacity-10" size="medium" delay={2} />
      <FloatingOrganic className="absolute bottom-1/3 left-10 opacity-10" size="medium" delay={4} />
    </div>
  );
}