import { Award, Users, Clock, Heart, Target, CheckCircle, Smile, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { FloatingOrganic, DoodleConnector, OrganicImage } from "@/components/ui/PageTransition";
import aboutMeImage from "@assets/AboutMe.jpg";

export default function About() {
  const credentials = [
    "MSc in Clinical Nutrition",
    "Registered Dietitian (RD)",
    "Certified Sports Nutritionist",
    "Member of Professional Nutrition Association"
  ];

  const values = [
    {
      icon: Heart,
      title: "Compassionate Care",
      description: "I believe every person deserves to feel heard, understood, and supported on their wellness journey. Your story matters to me."
    },
    {
      icon: Target,
      title: "Personalized Approach",
      description: "No two people are the same, which is why I create nutrition plans that fit your unique lifestyle, preferences, and goals."
    },
    {
      icon: Smile,
      title: "Joyful Living",
      description: "Healthy eating should bring joy, not stress. Together, we'll find ways to make nutritious choices that you genuinely love."
    },
    {
      icon: Star,
      title: "Sustainable Results",
      description: "I focus on creating lasting changes that become natural parts of your life, not quick fixes that fade away."
    }
  ];

  const stats = [
    { number: "500+", label: "Lives Transformed" },
    { number: "8+", label: "Years of Dedication" },
    { number: "95%", label: "Client Satisfaction" },
    { number: "24/7", label: "Ongoing Support" }
  ];

  return (
    <div className="min-h-screen py-20 bg-gradient-to-br from-background to-muted/30 country-texture relative overflow-hidden page-content">
      <div className="container mx-auto px-4 relative z-10">
        {/* Hero Section */}
        <section className="mb-20 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 text-base px-4 py-2 floating-element">
              Meet Your Nutrition Partner
            </Badge>
            <div className="doodle-arrow mb-6">
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-6 handwritten-accent">
                Hi, I'm Vee!
              </h1>
            </div>
            <p className="serif-body text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
              I'm here to help you discover that healthy eating can be delicious, sustainable, and perfectly tailored to your life. Let's transform your relationship with food together.
            </p>
            
            {/* Connecting doodle */}
            <DoodleConnector direction="down" className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-32" />
          </div>
        </section>

        {/* Personal Story Section */}
        <section className="mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 relative">
              <OrganicImage 
                src={aboutMeImage}
                alt="Vee - Your dedicated nutrition therapist"
                shape="blob"
                size="hero"
                className="shadow-2xl warm-glow floating-element"
              />
              
              {/* Floating organic decorations */}
              <FloatingOrganic className="absolute -top-8 -right-8 opacity-30" size="medium" delay={1} />
              <FloatingOrganic className="absolute -bottom-8 -left-8 opacity-20" size="small" delay={2} />
              
              {/* Handwritten accent */}
              <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg floating-element">
                <span className="font-display text-primary italic text-sm">Your Wellness Partner</span>
              </div>
            </div>
            
            <div className="space-y-6 order-1 lg:order-2">
              <div className="space-y-4">
                <h2 className="font-display text-3xl font-bold handwritten-accent">
                  Your Partner in Wellness
                </h2>
              </div>
              
              <p className="serif-body text-lg text-muted-foreground leading-relaxed">
                I believe that healthy eating shouldn't feel like a punishment—it should be enjoyable, nourishing, and perfectly tailored to your unique lifestyle. My approach combines evidence-based nutrition science with real-world practicality, because I know how challenging it can be to maintain healthy habits in our busy lives.
              </p>
              
              <p className="serif-body text-lg text-muted-foreground leading-relaxed">
                Whether you're looking to improve your energy levels, manage a health condition, or simply feel more confident in your food choices, I'm here to guide you every step of the way. Together, we'll create a sustainable path to wellness that fits seamlessly into your life.
              </p>

              <div className="space-y-2">
                {credentials.map((credential, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="serif-body text-sm">{credential}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center relative">
                <Card className="mediterranean-card p-6 floating-element">
                  <CardContent className="p-0 relative">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/5 to-accent/5 blob-shape opacity-50"></div>
                    <h3 className="font-display text-3xl font-bold text-primary mb-2">{stat.number}</h3>
                    <p className="serif-body text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
                {index === 1 && <FloatingOrganic className="absolute -top-4 -right-4 opacity-20" size="small" delay={1.5} />}
              </div>
            ))}
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-20">
          <div className="text-center mb-12 relative">
            <div className="doodle-arrow mb-4">
              <h2 className="font-display text-3xl md:text-4xl mb-6 text-foreground handwritten-accent">
                My Core Values
              </h2>
            </div>
            <p className="serif-body text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              These principles guide everything I do in my practice
            </p>
            
            <DoodleConnector direction="down" className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-24" />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="relative">
                  <Card className="mediterranean-card p-6 h-full floating-element">
                    <CardContent className="p-0 relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 blob-shape flex items-center justify-center mb-4 floating-element">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-display text-xl mb-3 handwritten-accent">{value.title}</h3>
                      <p className="serif-body text-muted-foreground leading-relaxed">{value.description}</p>
                      
                      {/* Organic background decoration */}
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/5 to-accent/5 blob-shape opacity-50"></div>
                    </CardContent>
                  </Card>
                  
                  {index === 0 && <FloatingOrganic className="absolute -top-6 -left-6 opacity-20" size="small" delay={0.5} />}
                  {index === 3 && <FloatingOrganic className="absolute -bottom-6 -right-6 opacity-20" size="small" delay={3} />}
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display text-3xl font-bold mb-4 handwritten-accent">Ready to Start Your Journey?</h2>
            <p className="serif-body text-lg text-muted-foreground mb-8">
              Let's work together to create a nutrition plan that works for you.
            </p>
            <Button size="lg" asChild className="mediterranean-card">
              <Link href="/register">
                Start Your Transformation
              </Link>
            </Button>
            <p className="serif-body text-sm text-muted-foreground mt-6">
              No pressure, no judgment—just genuine support for your wellness goals.
            </p>
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