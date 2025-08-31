import { Link } from "wouter";
import {
  Users,
  Award,
  Clock,
  ClipboardList,
  MessageCircle,
  BookOpen,
  CheckCircle,
  Star,
  TrendingDown,
  Droplets,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import {
  FloatingOrganic,
  DoodleConnector,
  OrganicImage,
} from "@/components/ui/PageTransition";
import heroImage from "@assets/OrangesBG.jpg";

export default function Home() {
  const services = [
    {
      icon: ClipboardList,
      title: "Meal Plans",
      description: "Custom nutrition tailored to you",
      features: ["Meal planning", "Shopping lists", "Recipe swaps"],
    },
    {
      icon: MessageCircle,
      title: "24/7 Support",
      description: "Direct access to expert guidance",
      features: ["Quick responses", "Progress tracking", "Motivation"],
    },
    {
      icon: BookOpen,
      title: "Resources",
      description: "Complete nutrition education",
      features: ["Guides", "Recipes", "Progress tools"],
    },
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      quote:
        "Transformed my nutrition approach. Easy to follow, incredible results!",
      rating: 5,
    },
    {
      name: "Michael R.",
      quote: "Unmatched expertise. Finally understand proper nutrition.",
      rating: 5,
    },
    {
      name: "Emma L.",
      quote: "Best health investment. Achieved impossible goals.",
      rating: 5,
    },
  ];

  const stats = [
    { icon: Users, number: "500+", label: "Happy Clients" },
    { icon: Award, number: "95%", label: "Success Rate" },
    { icon: Clock, number: "8+", label: "Years Experience" },
    { icon: TrendingDown, number: "12kg", label: "Average Weight Loss" },
  ];

  return (
    <div className="bg-background page-content">
      {/* Hero Section - Matching nazdravi design exactly */}
      <section className="relative overflow-hidden h-screen flex items-center">
        {/* Natural orange tree background with soft blur effect */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${heroImage})`,
            }}
          />
          {/* Soft blur overlay to ensure text readability */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
        </div>

        {/* VB initials positioned to align with the title */}
        <div className="absolute top-8 left-80 z-20">
          <div className="text-white text-2xl font-light tracking-widest">
            VB
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-6 h-full flex items-center">
          <div className="max-w-2xl">
            {/* Main title "nazdravi" in elegant serif */}
            <h1 className="text-6xl lg:text-8xl xl:text-9xl font-bold mb-6 leading-tight text-white font-serif">
              nazdravi
            </h1>
            
            {/* Subtitle "Registered Dietitian" */}
            <p className="text-xl lg:text-2xl mb-12 text-white font-light tracking-wide">
              Registered Dietitian
            </p>
            
            {/* BOOK AN APPOINTMENT button */}
            <Link href="/appointment">
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm rounded-lg transition-all duration-300 hover:border-white/50"
              >
                BOOK AN APPOINTMENT
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

{
  /* Services Section 
      <section className="py-10 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl md:text-3xl mb-4">Ditch the Fads. Embrace Real Nutrition.</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Say goodbye to gimmicks and hello to a sustainable, balanced lifestyle. Rooted in science—not trends—our approach is simple: make healthier decisions, one step at a time. No extremes, no restrictions—just evidence-based guidance that fits your real life. Ready to feel good for good?
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="mediterranean-card floating-element">
                  <CardContent className="p-4 text-center">
                    <Icon className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h3 className="font-display text-lg font-bold mb-2">{service.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                    
                    <ul className="space-y-1">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2 text-xs">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* Testimonials Section* 
      <section className="py-10 bg-muted/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl md:text-3xl mb-4">Client Success</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Real transformation stories
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="mediterranean-card floating-element">
                <CardContent className="p-4 text-center">
                  <div className="flex justify-center mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 italic">
                    "{testimonial.quote}"
                  </p>
                  <p className="font-display text-sm font-bold">
                    — {testimonial.name}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    
      {/* CTA Section 
      <section className="py-10 bg-primary/10">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-lg mx-auto">
            <h2 className="font-display text-2xl md:text-3xl mb-4">
              Ready to Start?
            </h2>
            <p className="text-muted-foreground mb-6">
              Begin your personalized nutrition transformation with a
              complimentary consultation.
            </p>
            <Button asChild className="w-full">
              <Link href="/appointment">
                <Calendar className="mr-2 h-4 w-4" />
                Book Free Consultation
              </Link>
            </Button>
          </div>
        </div>
      </section>
      */
}
