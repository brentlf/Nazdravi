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
      title: "Personalized Meal Plans",
      description: "Custom nutrition plans tailored to your goals, preferences, and lifestyle",
      features: ["Detailed meal planning", "Shopping lists", "Recipe substitutions", "Portion guidance"],
      price: "From €80/month",
      popular: false
    },
    {
      icon: MessageCircle,
      title: "24/7 Support & Coaching",
      description: "Get instant answers and ongoing support through our messaging platform",
      features: ["Quick responses", "Motivational support", "Expert guidance", "Progress tracking"],
      price: "From €120/month",
      popular: true
    },
    {
      icon: BookOpen,
      title: "Educational Resources",
      description: "Access comprehensive guides and materials to support your journey",
      features: ["Nutrition guides", "Recipe collections", "Video tutorials", "Meal prep guides"],
      price: "From €50/month",
      popular: false
    }
  ];

  const additionalServices = [
    {
      icon: Calendar,
      title: "One-on-One Consultations",
      description: "Personalized sessions to discuss your goals and create your plan",
      duration: "60 minutes",
      price: "€85 per session"
    },
    {
      icon: Users,
      title: "Group Workshops",
      description: "Join others on similar journeys in our interactive workshops",
      duration: "90 minutes",
      price: "€35 per person"
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

  return (
    <div className="min-h-screen py-20 bg-gradient-to-br from-background to-muted/30 country-texture relative overflow-hidden page-content">
      <div className="container mx-auto px-4 relative z-10">
        {/* Hero Section */}
        <section className="mb-20 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 text-base px-4 py-2 floating-element">
              Comprehensive Nutrition Services
            </Badge>
            <div className="doodle-arrow mb-6">
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-6 handwritten-accent">
                Transform Your Health Journey
              </h1>
            </div>
            <p className="serif-body text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
              Choose from our range of personalized nutrition services designed to fit your lifestyle, goals, and budget. Every plan is crafted with care to ensure sustainable, lasting results.
            </p>
            
            {/* Connecting doodle */}
            <DoodleConnector direction="down" className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-32" />
          </div>
        </section>

        {/* Main Services Section */}
        <section className="mb-20">
          <div className="text-center mb-12 relative">
            <div className="doodle-arrow mb-4">
              <h2 className="font-display text-3xl md:text-4xl mb-6 text-foreground handwritten-accent">
                Our Core Services
              </h2>
            </div>
            <p className="serif-body text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Comprehensive nutrition support tailored to your unique needs
            </p>
            
            <DoodleConnector direction="down" className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-24" />
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {mainServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <div key={index} className="relative">
                  <Card className={`mediterranean-card h-full floating-element ${service.popular ? 'ring-2 ring-primary/20' : ''}`}>
                    <CardContent className="p-8 relative">
                      {/* Popular badge */}
                      {service.popular && (
                        <div className="absolute -top-4 -right-4">
                          <Badge className="bg-primary text-white handwritten-accent">Most Popular</Badge>
                          <DoodleConnector direction="right" className="w-8 mt-1" />
                        </div>
                      )}
                      
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 blob-shape flex items-center justify-center mx-auto mb-6 warm-glow floating-element">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      
                      <h3 className="font-display text-xl mb-4 text-center handwritten-accent">{service.title}</h3>
                      <p className="serif-body text-muted-foreground mb-6 text-center leading-relaxed">{service.description}</p>
                      
                      <ul className="space-y-3 mb-6">
                        {service.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-2 serif-body text-sm">
                            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      
                      <div className="text-center">
                        <p className="font-display text-2xl font-bold text-primary mb-4">{service.price}</p>
                        <Button className="w-full mediterranean-card" asChild>
                          <Link href="/register">Get Started</Link>
                        </Button>
                      </div>
                      
                      {/* Organic background decoration */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-accent/5 blob-shape opacity-50"></div>
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

        {/* Additional Services Section */}
        <section className="mb-20">
          <div className="text-center mb-12 relative">
            <div className="doodle-arrow mb-4">
              <h2 className="font-display text-3xl md:text-4xl mb-6 text-foreground handwritten-accent">
                Additional Services
              </h2>
            </div>
            <p className="serif-body text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Specialized support for your unique wellness goals
            </p>
            
            <DoodleConnector direction="down" className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-24" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {additionalServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <div key={index} className="relative">
                  <Card className="mediterranean-card h-full floating-element">
                    <CardContent className="p-6 text-center relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-secondary/20 blob-shape flex items-center justify-center mx-auto mb-4 floating-element">
                        <Icon className="w-6 h-6 text-accent" />
                      </div>
                      
                      <h3 className="font-display text-lg mb-3 handwritten-accent">{service.title}</h3>
                      <p className="serif-body text-muted-foreground mb-4 text-sm leading-relaxed">{service.description}</p>
                      
                      <div className="space-y-2">
                        <p className="serif-body text-sm text-muted-foreground">Duration: {service.duration}</p>
                        <p className="font-display text-lg font-bold text-accent">{service.price}</p>
                      </div>
                      
                      {/* Organic background decoration */}
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-accent/5 to-secondary/5 blob-shape opacity-50"></div>
                    </CardContent>
                  </Card>
                  
                  {index === 1 && <FloatingOrganic className="absolute -top-4 -right-4 opacity-20" size="small" delay={2} />}
                </div>
              );
            })}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-20">
          <div className="text-center mb-12 relative">
            <div className="doodle-arrow mb-4">
              <h2 className="font-display text-3xl md:text-4xl mb-6 text-foreground handwritten-accent">
                Why Choose Our Services?
              </h2>
            </div>
            <p className="serif-body text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Experience the difference of personalized, evidence-based nutrition care
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="relative">
                <Card className="mediterranean-card p-4 floating-element">
                  <CardContent className="p-0 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="serif-body text-sm">{benefit}</span>
                  </CardContent>
                </Card>
                
                {index === 2 && <FloatingOrganic className="absolute -top-3 -right-3 opacity-20" size="small" delay={1.5} />}
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="max-w-2xl mx-auto relative">
            <div className="mediterranean-card p-8 floating-element overflow-hidden">
              <div className="relative z-10">
                <div className="doodle-arrow mb-4">
                  <h2 className="font-display text-3xl font-bold mb-4 handwritten-accent">Ready to Begin?</h2>
                </div>
                <p className="serif-body text-lg text-muted-foreground mb-8 leading-relaxed">
                  Take the first step towards a healthier, happier you. Let's create a nutrition plan that works for your life.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild className="mediterranean-card">
                    <Link href="/register">Start Your Journey</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="mediterranean-card">
                    <Link href="/about">Learn More About Me</Link>
                  </Button>
                </div>
                <p className="serif-body text-sm text-muted-foreground mt-6">
                  Free consultation available for new clients
                </p>
              </div>
              
              {/* Organic background decorations */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 blob-shape"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-accent/10 to-secondary/10 blob-shape"></div>
            </div>
            
            {/* Handwritten flourish */}
            <div className="absolute -bottom-4 -right-4">
              <span className="text-accent text-2xl transform rotate-12 inline-block">✨</span>
            </div>
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