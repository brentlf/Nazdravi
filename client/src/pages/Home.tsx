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
              <Badge variant="secondary" className="w-fit shadow-lg border-0 bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-sm">
                🌱 Transform Your Health Today
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Transform Your Health with 
                <span className="block text-primary bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Personalized Nutrition</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl">
                Personalized nutrition counseling designed to help you achieve your health goals through sustainable lifestyle changes and expert guidance.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                  <Link href="/appointment">
                    <Calendar className="mr-2 h-5 w-5" />
                    Book Free Consultation ✨
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="border-2 border-primary/30 hover:border-primary hover:bg-primary/10 backdrop-blur-sm shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
                  <Link href="/services">
                    Learn More 🌿
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

            {/* Vibrant Hero Image with Floating Elements */}
            <div className="relative">
              {/* Main Image with Dynamic Border */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-700">
                <img 
                  src={heroImage} 
                  alt="Healthy nutrition and lifestyle" 
                  className="w-full h-96 lg:h-[500px] object-cover"
                />
                {/* Colorful overlay elements */}
                <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-full animate-bounce delay-700"></div>
                <div className="absolute bottom-6 left-6 w-12 h-12 bg-gradient-to-br from-accent to-accent/60 rounded-full animate-pulse"></div>
              </div>
              
              {/* Floating decorative shapes around image */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-primary/40 to-primary/20 rounded-full blur-lg animate-pulse"></div>
              <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-gradient-to-br from-accent/30 to-accent/10 rounded-full blur-xl animate-bounce delay-1000"></div>
              <div className="absolute top-1/3 -right-4 w-14 h-14 bg-gradient-to-br from-secondary/50 to-secondary/25 rounded-full blur-md animate-pulse delay-500"></div>
              <div className="absolute bottom-1/4 -left-4 w-18 h-18 bg-gradient-to-br from-primary/35 to-primary/15 rounded-full blur-lg animate-bounce delay-1500"></div>
              
              {/* Organic blob decorations */}
              <div className="absolute top-16 -left-3 w-8 h-20 bg-gradient-to-br from-accent/40 to-transparent rounded-full transform rotate-12 blur-sm"></div>
              <div className="absolute bottom-16 -right-3 w-20 h-10 bg-gradient-to-br from-primary/30 to-transparent rounded-full transform -rotate-45 blur-sm"></div>
            </div>

          </div>
        </div>
      </section>
      {/* Services Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Your journey to better health starts here
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              As a certified nutritional therapist, I specialize in helping individuals transform their relationship with food and achieve lasting health results. My passion is helping people discover the power of nutrition and create sustainable habits that support their overall wellbeing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Icon className="w-8 h-8 text-primary-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">{service.title}</h3>
                    <p className="text-muted-foreground mb-6">{service.description}</p>
                    <ul className="space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center justify-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500" />
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
      <section className="py-20 bg-primary-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-muted-foreground">
              Real results from real people who transformed their health
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white dark:bg-gray-800">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                  <p className="font-semibold">— {testimonial.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 text-white bg-[#f7f2ed]">
        <div className="container mx-auto px-4 text-center bg-[#ffffff00]">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Transformation?
          </h2>
          <p className="text-xl mb-8 opacity-90 text-[#050404]">
            Book your free consultation today and take the first step towards a healthier, happier you.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/appointment">
              <Calendar className="mr-2 h-5 w-5" />
              Book Free Consultation
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