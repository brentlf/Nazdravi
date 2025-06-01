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
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { FloatingOrganic, DoodleConnector, OrganicImage } from "@/components/ui/PageTransition";
import heroImage from "@assets/AboutMe.jpg";

export default function Home() {
  const services = [
    {
      icon: ClipboardList,
      title: "Personalized Meal Plans",
      description: "Custom nutrition plans tailored to your goals and preferences",
      features: ["Detailed meal planning", "Shopping lists", "Recipe substitutions"]
    },
    {
      icon: MessageCircle,
      title: "24/7 Support & Messaging",
      description: "Get instant answers and ongoing support through our messaging platform",
      features: ["Quick responses", "Motivational support", "Expert guidance"]
    },
    {
      icon: BookOpen,
      title: "Educational Resources",
      description: "Access comprehensive guides and materials to support your journey",
      features: ["Nutrition guides", "Recipe collections", "Progress tracking tools"]
    }
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      quote: "Vee completely transformed my approach to nutrition. The personalized plan was easy to follow and the results were incredible!",
      rating: 5
    },
    {
      name: "Michael R.",
      quote: "The expertise and support Vee provides is unmatched. I finally understand how to properly nourish my body.",
      rating: 5
    },
    {
      name: "Emma L.",
      quote: "Best investment I've ever made for my health. Vee's guidance helped me achieve goals I thought were impossible.",
      rating: 5
    }
  ];

  const stats = [
    { icon: Users, number: "500+", label: "Happy Clients" },
    { icon: Award, number: "95%", label: "Success Rate" },
    { icon: Clock, number: "8+", label: "Years Experience" },
    { icon: TrendingDown, number: "12kg", label: "Average Weight Loss" }
  ];

  return (
    <div className="min-h-screen bg-background page-content">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32 min-h-screen flex items-center">
        {/* Full background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${heroImage})`,
          }}
        ></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-8 relative">
              <Badge variant="secondary" className="w-fit font-serif-elegant border-0 bg-primary/10 text-primary">
                Nourish Your Best Life
              </Badge>
              
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl leading-tight text-foreground floating-element">
                Discover the Art of 
                <span className="block text-primary font-display italic">Holistic Nutrition</span>
              </h1>
              
              <p className="serif-body text-xl text-muted-foreground max-w-2xl leading-relaxed">
                Experience personalized nutrition guidance rooted in Mediterranean wisdom and modern science. Together, we'll cultivate sustainable habits that nourish both body and soul.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="mediterranean-button font-serif-elegant">
                  <Link href="/appointment">
                    <Calendar className="mr-2 h-5 w-5" />
                    Begin Your Journey
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="border-2 border-primary/30 hover:border-primary hover:bg-primary/10 font-serif-elegant warm-glow">
                  <Link href="/services">
                    Explore Services
                  </Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="text-center">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Icon className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="text-2xl font-bold text-primary-600">{stat.number}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>



          </div>
        </div>
      </section>
      {/* Services Section */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 relative">
            <div className="doodle-arrow mb-4">
              <h2 className="font-display text-3xl md:text-4xl mb-6 text-foreground handwritten-accent">
                Nurturing Wellness Through Ancient Wisdom
              </h2>
            </div>
            <p className="serif-body text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              As a certified nutritional therapist, I blend Mediterranean traditions with modern science to help you transform your relationship with food. Together, we'll discover sustainable practices that honor both your heritage and your health goals.
            </p>
            
            {/* Handwritten connecting doodle */}
            <DoodleConnector direction="down" className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-32" />
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div key={index} className="relative">
                  <Card className="mediterranean-card text-center hover:shadow-xl transition-all duration-500 border-0 floating-element">
                    <CardContent className="p-8">
                      {/* Handwritten doodle accent for middle card */}
                      {index === 1 && (
                        <div className="absolute -top-4 -right-4">
                          <span className="font-display text-accent italic text-sm transform rotate-12 inline-block">Popular!</span>
                          <DoodleConnector direction="right" className="w-8 mt-1" />
                        </div>
                      )}
                      
                      <div className="w-16 h-16 bg-primary/20 blob-shape flex items-center justify-center mx-auto mb-6 warm-glow floating-element">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      
                      <h3 className="font-display text-xl mb-4 text-foreground handwritten-accent">{service.title}</h3>
                      <p className="serif-body text-muted-foreground mb-6 leading-relaxed">{service.description}</p>
                      
                      <ul className="space-y-3">
                        {service.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center justify-center gap-2 serif-body text-sm">
                            <CheckCircle className="w-4 h-4 text-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  
                  {/* Floating organic elements around cards */}
                  {index === 0 && <FloatingOrganic className="absolute -top-8 -left-8 opacity-40" size="small" delay={1} />}
                  {index === 2 && <FloatingOrganic className="absolute -bottom-8 -right-8 opacity-40" size="small" delay={3} />}
                </div>
              );
            })}
            
            {/* Connecting doodle lines between cards */}
            <DoodleConnector direction="right" className="absolute top-1/2 left-1/3 transform -translate-y-1/2 w-16 hidden md:block" />
            <DoodleConnector direction="right" className="absolute top-1/2 left-2/3 transform -translate-y-1/2 w-16 hidden md:block" />
          </div>
        </div>
      </section>
      {/* Testimonials Section */}
      <section className="py-20 bg-muted/10 country-texture relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 relative">
            <div className="doodle-arrow mb-4">
              <h2 className="font-display text-3xl md:text-4xl mb-6 text-foreground handwritten-accent">
                Stories of Transformation
              </h2>
            </div>
            <p className="serif-body text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Real journeys from clients who discovered the joy of nourishing themselves
            </p>
            
            {/* Connecting doodle to testimonials */}
            <DoodleConnector direction="down" className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-24" />
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="relative">
                <Card className="mediterranean-card border-0 warm-glow floating-element overflow-hidden">
                  <CardContent className="p-8 relative">
                    {/* Organic background pattern */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blob-shape opacity-50"></div>
                    
                    <div className="flex justify-center mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                      ))}
                    </div>
                    
                    <p className="serif-body text-muted-foreground mb-6 italic leading-relaxed text-center relative z-10">
                      "{testimonial.quote}"
                    </p>
                    <p className="font-display text-center text-foreground handwritten-accent">
                      — {testimonial.name}
                    </p>
                    
                    {/* Handwritten flourish */}
                    {index === 1 && (
                      <div className="absolute -bottom-2 -right-2">
                        <span className="text-accent text-2xl transform rotate-12 inline-block">✨</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Floating organic decorations */}
                {index === 0 && <FloatingOrganic className="absolute -top-6 -right-6 opacity-30" size="small" delay={0.5} />}
                {index === 2 && <FloatingOrganic className="absolute -bottom-6 -left-6 opacity-30" size="small" delay={2.5} />}
              </div>
            ))}
          </div>
        </div>
        
        {/* Large floating background elements */}
        <FloatingOrganic className="absolute top-20 -right-20 opacity-20" size="large" delay={1} />
        <FloatingOrganic className="absolute bottom-20 -left-20 opacity-20" size="large" delay={3} />
      </section>
      {/* CTA Section */}
      <section className="py-20 bg-primary/10 country-texture">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl mb-6 text-foreground">
            Ready to Embrace Your Wellness Journey?
          </h2>
          <p className="serif-body text-xl mb-8 text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Begin your personalized nutrition transformation with a complimentary consultation. Let's explore how Mediterranean-inspired wellness can nourish your life.
          </p>
          <Button size="lg" asChild className="mediterranean-button font-serif-elegant">
            <Link href="/appointment">
              <Calendar className="mr-2 h-5 w-5" />
              Schedule Your Consultation
            </Link>
          </Button>
        </div>
      </section>
      {/* Newsletter Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Stay Updated
            </h2>
            <p className="text-muted-foreground mb-8">
              Get weekly nutrition tips, healthy recipes, and exclusive content delivered to your inbox.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </section>
    </div>
  );
}