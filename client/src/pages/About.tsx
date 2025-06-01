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
      description:
        "You deserve to feel heard and supported. Your story matters.",
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
      description:
        "Lasting changes, not quick fixes. Build lifelong healthy habits.",
    },
  ];

  const stats = [
    { number: "500+", label: "Lives Transformed" },
    { number: "8+", label: "Years of Dedication" },
    { number: "95%", label: "Client Satisfaction" },
    { number: "24/7", label: "Ongoing Support" },
  ];

  return (
    <div className="min-h-screen bg-background page-content">
      {/* Hero Section with Overlapping Images */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Overlapping Images Background */}
        <div className="absolute inset-0">
          {/* Left Image - Overlapping */}
          <div 
            className="absolute top-10 left-10 w-80 h-96 bg-cover bg-center rounded-lg shadow-xl z-10 transform rotate-2"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=987&q=80')`,
            }}>
          </div>

          {/* Right Image - Overlapping */}
          <div 
            className="absolute top-20 right-10 w-80 h-96 bg-cover bg-center rounded-lg shadow-xl z-10 transform -rotate-2"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')`,
            }}>
          </div>

          {/* Bottom Left Image - Smaller, overlapping */}
          <div 
            className="absolute bottom-20 left-20 w-64 h-72 bg-cover bg-center rounded-lg shadow-lg z-15 transform rotate-1"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')`,
            }}>
          </div>

          {/* Bottom Right Image - Smaller, overlapping */}
          <div 
            className="absolute bottom-10 right-20 w-64 h-72 bg-cover bg-center rounded-lg shadow-lg z-15 transform -rotate-1"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1559181567-c3190ca9959b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')`,
            }}>
          </div>

          {/* Background overlay for text readability */}
          <div className="absolute inset-0 bg-white/70 dark:bg-black/70 z-5"></div>
        </div>
        
        {/* Hero Content - Clear and prominent */}
        <div className="relative z-30 text-center max-w-4xl mx-auto px-6">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-wide text-gray-900 dark:text-white drop-shadow-lg">
            REGISTERED DIETITIAN
          </h1>
          <p className="text-2xl md:text-3xl font-light text-gray-800 dark:text-gray-200 drop-shadow-md">
            Hi! I'm Vee, a Registered Dietitian with the HPCSA and HCPC
          </p>
        </div>
      </section>

      {/* Overlapping Images Grid */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-6">
          {/* Main overlapping grid container */}
          <div className="relative min-h-[600px] mb-16">
            {/* Left Image - Overlapping */}
            <div
              className="absolute top-0 left-0 w-80 h-96 bg-cover bg-center rounded-lg shadow-xl z-10 transform rotate-2"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=987&q=80')`,
              }}
            ></div>

            {/* Center Content */}
            <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-900 p-8 rounded-xl shadow-xl z-20 max-w-md">
              <h2 className="text-3xl font-bold text-center mb-4">
                Your Wellness Partner
              </h2>

              <p className="text-center text-muted-foreground mb-6">
                Evidence-based nutrition science with real-world practicality.
                Let's create sustainable habits that fit your life.
              </p>

              <div className="space-y-3">
                {credentials.map((credential, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">{credential}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Image - Overlapping */}
            <div
              className="absolute top-12 right-0 w-80 h-96 bg-cover bg-center rounded-lg shadow-xl z-10 transform -rotate-2"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')`,
              }}
            ></div>

            {/* Bottom Left Image - Smaller, overlapping */}
            <div
              className="absolute bottom-0 left-16 w-64 h-72 bg-cover bg-center rounded-lg shadow-lg z-15 transform rotate-1"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')`,
              }}
            ></div>

            {/* Bottom Right Image - Smaller, overlapping */}
            <div
              className="absolute bottom-8 right-16 w-64 h-72 bg-cover bg-center rounded-lg shadow-lg z-15 transform -rotate-1"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1559181567-c3190ca9959b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')`,
              }}
            ></div>
          </div>

          {/* My Approach Values Section */}
          <div className="mb-16 mt-32">
            <h2 className="text-3xl font-bold text-center mb-8">My Approach</h2>
            <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <Card
                    key={index}
                    className="mediterranean-card floating-element"
                  >
                    <CardContent className="p-6 text-center">
                      <Icon className="w-8 h-8 text-primary mx-auto mb-3" />
                      <h3 className="font-bold mb-2">{value.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Personal Story Section */}
      <section className="py-16 bg-muted/20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8">
            Your dedicated nutrition partner
          </h2>
          <div className="space-y-6 text-lg leading-relaxed">
            <p>
              You deserve to feel heard and supported. Your story matters, and
              together we'll transform your relationship with food. My approach
              combines evidence-based nutrition science with real-world
              practicality to create sustainable habits that fit your life.
            </p>
            <p>
              Whether you're looking for personalized nutrition plans, ongoing
              support, or expert guidance on your wellness journey, I'm here to
              help you build lifelong healthy habits. Let's create nutrition
              plans that bring joy, not stress.
            </p>
          </div>

          <div className="mt-12">
            <Button asChild size="lg" className="px-8 py-4">
              <Link href="/appointment">Book Consultation</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
