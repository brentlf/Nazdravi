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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32 country-texture mediterranean-header">
        {/* Subtle Mediterranean Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
          <div className="absolute top-20 left-10 w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-2xl"></div>
          <div className="absolute top-60 right-16 w-32 h-32 bg-gradient-to-br from-accent/15 to-accent/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 left-20 w-28 h-28 bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-full blur-2xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-8 relative">
              <Badge variant="secondary" className="w-fit font-serif-elegant border-0 bg-gradient-to-r from-primary/15 to-accent/15 text-primary">
                Nourish Your Best Life
              </Badge>
              
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl leading-tight text-foreground">
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

            {/* Organic Hero Image with Mediterranean Flow */}
            <div className="relative animate-float">
              {/* Main Image with Organic Masking */}
              <div className="relative overflow-hidden blob-mask shadow-2xl warm-glow">
                <img 
                  src={heroImage} 
                  alt="Mediterranean nutrition lifestyle" 
                  className="w-full h-96 lg:h-[500px] object-cover transition-transform duration-700 hover:scale-110"
                />
                {/* Subtle overlay elements */}
                <div className="absolute top-6 right-6 w-12 h-12 bg-gradient-to-br from-primary/30 to-accent/20 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
                <div className="absolute bottom-8 left-8 w-8 h-8 bg-gradient-to-br from-accent/40 to-secondary/30 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
              </div>
              
              {/* Gentle floating elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-lg animate-float"></div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-br from-accent/15 to-transparent rounded-full blur-xl animate-float" style={{animationDelay: '3s'}}></div>
            </div>

          </div>
        </div>
      </section>
      {/* Services Section */}
      <section className="py-20 bg-gradient-to-br from-background to-muted/30">
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
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 doodle-line w-32 rotate-12"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="mediterranean-card text-center hover:shadow-xl transition-all duration-500 border-0">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-6 warm-glow">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-display text-xl mb-4 text-foreground">{service.title}</h3>
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
              );
            })}
          </div>
        </div>
      </section>
      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-accent/10 to-secondary/10 country-texture">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl mb-6 text-foreground">
              Stories of Transformation
            </h2>
            <p className="serif-body text-xl text-muted-foreground leading-relaxed">
              Real journeys from clients who discovered the joy of nourishing themselves
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="mediterranean-card border-0 warm-glow">
                <CardContent className="p-8">
                  <div className="flex justify-center mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="serif-body text-muted-foreground mb-6 italic leading-relaxed text-center">"{testimonial.quote}"</p>
                  <p className="font-display text-center text-foreground">— {testimonial.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/15 to-accent/15 country-texture">
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