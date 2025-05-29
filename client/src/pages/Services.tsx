import { Check, Calendar, Clock, Users, Target, MessageCircle, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export default function Services() {
  const services = [
    {
      id: "initial",
      title: "Initial Consultation",
      duration: "60 minutes",
      price: "€89",
      description: "Comprehensive assessment of your current health status, dietary habits, and lifestyle to create your personalized nutrition roadmap.",
      features: [
        "Complete health assessment",
        "Detailed nutrition analysis", 
        "Goal setting session",
        "Personalized recommendations",
        "Client dashboard access",
        "Follow-up plan outline"
      ],
      icon: Users,
      popular: false,
      color: "bg-blue-500"
    },
    {
      id: "followup",
      title: "Follow-up Session",
      duration: "30 minutes",
      price: "€49",
      description: "Regular check-ins to monitor progress, adjust your plan, and provide ongoing support for sustainable results.",
      features: [
        "Progress review",
        "Plan adjustments",
        "Nutritional guidance",
        "Motivation support",
        "Q&A session",
        "Updated recommendations"
      ],
      icon: Target,
      popular: true,
      color: "bg-green-500"
    },
    {
      id: "complete",
      title: "Complete Program",
      duration: "12 weeks",
      price: "€449",
      description: "Comprehensive 12-week program including initial consultation, weekly follow-ups, and personalized meal plans.",
      features: [
        "Initial consultation (60 min)",
        "Weekly follow-up sessions",
        "Personalized meal plans",
        "Shopping lists",
        "Recipe collection",
        "24/7 messaging support",
        "Progress tracking tools",
        "Lifestyle coaching"
      ],
      icon: Calendar,
      popular: false,
      color: "bg-purple-500"
    }
  ];

  const additionalServices = [
    {
      icon: MessageCircle,
      title: "Meal Planning",
      description: "Custom meal plans tailored to your preferences and dietary needs"
    },
    {
      icon: Target,
      title: "Progress Tracking",
      description: "Monitor your journey with comprehensive tracking tools"
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock messaging support for questions and motivation"
    }
  ];

  const processSteps = [
    {
      step: "1",
      title: "Assessment",
      description: "Comprehensive health and lifestyle evaluation"
    },
    {
      step: "2", 
      title: "Planning",
      description: "Personalized nutrition plan development"
    },
    {
      step: "3",
      title: "Implementation",
      description: "Implementation and support"
    },
    {
      step: "4",
      title: "Monitoring",
      description: "Ongoing monitoring and adjustments"
    }
  ];

  return (
    <div className="min-h-screen py-20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 mb-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Comprehensive Nutrition Services
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Personalized nutrition solutions designed to help you achieve your health goals with expert guidance and ongoing support.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="container mx-auto px-4 mb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Card 
                key={service.id} 
                className={`relative hover:shadow-xl transition-all duration-300 hover:-translate-y-2 h-full flex flex-col ${
                  service.popular ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                {service.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary-500 text-white">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 ${service.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-2">{service.title}</CardTitle>
                  <div className="flex items-center justify-center gap-4 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {service.duration}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 flex flex-col flex-grow">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600">{service.price}</div>
                    <p className="text-sm text-muted-foreground">One-time fee</p>
                  </div>

                  <p className="text-muted-foreground text-center">{service.description}</p>

                  <ul className="space-y-3 flex-grow">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button className="w-full mt-auto" asChild>
                    <Link href="/appointment">Book Now</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Additional Services */}
      <section className="bg-primary-50 dark:bg-gray-800 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What's Included
            </h2>
            <p className="text-xl text-muted-foreground">
              Every service comes with comprehensive support and resources
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {additionalServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Icon className="w-8 h-8 text-primary-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">{service.title}</h3>
                    <p className="text-muted-foreground">{service.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground">
              Simple steps to transform your health
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Choose the service that best fits your needs and take the first step towards better health.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/appointment">
              <Calendar className="mr-2 h-5 w-5" />
              Book Your Consultation
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}