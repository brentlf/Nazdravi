import {
  Award,
  Users,
  Clock,
  Heart,
  Target,
  CheckCircle,
  Smile,
  Star,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  FloatingOrganic,
  DoodleConnector,
  OrganicImage,
} from "@/components/ui/PageTransition";
import aboutMeImage from "@assets/AboutMe.jpg";

export default function About() {
  const credentials = [
    "MSc Clinical Nutrition",
    "Registered Dietitian",
    "Sports Nutritionist",
    "Professional Member",
  ];

  const values = [
    {
      icon: Heart,
      title: "Compassionate Care",
      description: "You deserve to feel heard and supported. Your story matters.",
    },
    {
      icon: Target,
      title: "Personalized Approach",
      description: "Nutrition plans that fit your unique lifestyle and goals.",
    },
    {
      icon: Smile,
      title: "Joyful Living",
      description: "Healthy eating should bring joy, not stress.",
    },
    {
      icon: Star,
      title: "Sustainable Results",
      description: "Lasting changes, not quick fixes. Build lifelong healthy habits.",
    },
  ];

  const stats = [
    { number: "500+", label: "Lives Transformed" },
    { number: "8+", label: "Years of Dedication" },
    { number: "95%", label: "Client Satisfaction" },
    { number: "24/7", label: "Ongoing Support" },
  ];

  return (
    <div className="min-h-screen py-10 bg-background relative overflow-hidden page-content">
      <div className="container mx-auto px-4 relative z-10">
        {/* Hero Section */}
        <section className="mb-10 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Hi, I'm Vee!
            </h1>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Your dedicated nutrition partner. Let's transform your relationship with food together.
            </p>
          </div>
        </section>

        {/* About Section */}
        <section className="mb-8">
          <div className="grid md:grid-cols-2 gap-6 items-center max-w-4xl mx-auto">
            <div className="order-2 md:order-1">
              <img 
                src={aboutMeImage} 
                alt="Vee - Your nutrition partner"
                className="w-full h-64 object-cover rounded-lg shadow-lg"
              />
            </div>

            <div className="space-y-4 order-1 md:order-2">
              <h2 className="font-display text-2xl font-bold">Your Wellness Partner</h2>
              
              <p className="text-muted-foreground">
                Evidence-based nutrition science with real-world practicality. Let's create sustainable habits that fit your life.
              </p>

              <div className="grid grid-cols-2 gap-2">
                {credentials.map((credential, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{credential}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-8">
          <h2 className="font-display text-2xl text-center mb-6">My Approach</h2>
          
          <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="mediterranean-card floating-element">
                  <CardContent className="p-4 text-center">
                    <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
                    <h3 className="font-display text-sm font-bold mb-1">{value.title}</h3>
                    <p className="text-xs text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="max-w-lg mx-auto">
            <h2 className="font-display text-2xl font-bold mb-4">Ready to Start?</h2>
            <p className="text-muted-foreground mb-6">Let's create a nutrition plan that works for you.</p>
            <Button asChild className="w-full">
              <Link href="/appointment">Book Consultation</Link>
            </Button>
          </div>
        </section>
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
    </div>
  );
}
