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
    <div className="min-h-screen bg-background page-content">
      {/* Hero Section with Background Image */}
      <section className="relative h-[70vh] flex items-center justify-center">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80')`,
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-6">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-wide">
            REGISTERED DIETITIAN
          </h1>
          <p className="text-xl md:text-2xl font-light">
            Hi! I'm Vee, a Registered Dietitian with the HPCSA and HCPC
          </p>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Left Image */}
            <div className="h-96 bg-cover bg-center rounded-lg shadow-lg"
                 style={{
                   backgroundImage: `url('https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=987&q=80')`,
                 }}>
            </div>

            {/* Center Content */}
            <div className="flex flex-col justify-center space-y-6">
              <h2 className="text-3xl font-bold text-center">Mother and Baby Health</h2>
              
              <div className="space-y-4 text-center">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">MSc Clinical Nutrition</h3>
                  <p className="text-muted-foreground">Advanced expertise in clinical nutrition science</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Registered Dietitian</h3>
                  <p className="text-muted-foreground">HPCSA and HCPC certified professional</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Specialized Care</h3>
                  <p className="text-muted-foreground">Focus on maternal and infant nutrition</p>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="h-96 bg-cover bg-center rounded-lg shadow-lg"
                 style={{
                   backgroundImage: `url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')`,
                 }}>
            </div>
          </div>

          {/* Bottom Images Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Image */}
            <div className="h-80 bg-cover bg-center rounded-lg shadow-lg"
                 style={{
                   backgroundImage: `url('https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')`,
                 }}>
            </div>

            {/* Right Image */}
            <div className="h-80 bg-cover bg-center rounded-lg shadow-lg"
                 style={{
                   backgroundImage: `url('https://images.unsplash.com/photo-1559181567-c3190ca9959b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')`,
                 }}>
            </div>
          </div>
        </div>
      </section>

      {/* Personal Story Section */}
      <section className="py-16 bg-muted/20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8">My Journey</h2>
          <div className="space-y-6 text-lg leading-relaxed">
            <p>
              My passion for nutrition began with my own journey to understanding how food impacts our bodies, 
              minds, and overall wellbeing. With advanced training in clinical nutrition and years of practice, 
              I've dedicated my career to helping individuals and families build sustainable, healthy relationships with food.
            </p>
            <p>
              I specialize in mother and baby health, understanding the unique nutritional needs during pregnancy, 
              breastfeeding, and early childhood development. Every client receives personalized care based on 
              evidence-based nutrition science combined with practical, real-world solutions.
            </p>
          </div>
          
          <div className="mt-12">
            <Button asChild size="lg" className="px-8 py-4">
              <Link href="/appointment">Start Your Journey</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
