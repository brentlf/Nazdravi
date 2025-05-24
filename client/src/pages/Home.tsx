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
      quote: "Vee helped me completely transform my relationship with food. I've lost 15kg and feel amazing!",
      rating: 5
    },
    {
      name: "Michael K.",
      quote: "The personalized approach made all the difference. Finally found a sustainable way to eat healthy.",
      rating: 5
    },
    {
      name: "Emma L.",
      quote: "Amazing support and practical advice. The meal plans actually fit into my busy lifestyle.",
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
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              🌱 Transform Your Health Today
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Your Personal Path to 
              <span className="block">Nutrition Success</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Professional nutrition counseling that fits your lifestyle. Get personalized meal plans, 
              ongoing support, and achieve lasting results with evidence-based guidance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" asChild>
                <Link href="/appointment">
                  <Calendar className="mr-2 h-5 w-5" />
                  Book Free Consultation
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/services">
                  Learn More
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-primary-600">{stat.number}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Comprehensive Nutrition Support
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to succeed on your health journey, backed by science and personalized to you.
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
              Success Stories
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
      <section className="py-20 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Health Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Book your free consultation today and take the first step towards a healthier you.
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