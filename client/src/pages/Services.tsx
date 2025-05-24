import { Check, Calendar, Clock, Users, Target, MessageCircle, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Services() {
  const { t } = useLanguage();
  const services = [
    {
      id: "initial",
      title: t("initial-consultation-title", "services"),
      duration: t("60-minutes", "services"),
      price: "€89",
      description: t("initial-consultation-desc", "services"),
      features: [
        t("complete-health-assessment", "services"),
        t("detailed-nutrition-analysis", "services"),
        t("goal-setting-session", "services"),
        t("personalized-recommendations", "services"),
        t("client-dashboard-access", "services"),
        t("followup-plan-outline", "services")
      ],
      icon: Users,
      popular: false,
      color: "bg-blue-500"
    },
    {
      id: "followup",
      title: t("followup-session-title", "services"),
      duration: t("30-minutes", "services"),
      price: "€59",
      description: t("followup-session-desc", "services"),
      features: [
        t("progress-review-analysis", "services"),
        t("plan-adjustments", "services"),
        t("challenge-troubleshooting", "services"),
        t("continued-motivation", "services"),
        t("updated-recommendations", "services"),
        t("goal-refinement", "services")
      ],
      icon: Clock,
      popular: true,
      color: "bg-green-500"
    },
    {
      id: "program",
      title: t("complete-program-title", "services"),
      duration: t("12-weeks", "services"),
      price: "€499",
      description: t("complete-program-desc", "services"),
      features: [
        t("initial-60min-consultation", "services"),
        t("weekly-followup-sessions", "services"),
        t("personalized-meal-plans", "services"),
        t("recipe-collections", "services"),
        t("24-7-messaging-support", "services"),
        t("progress-tracking-tools", "services"),
        t("resource-library-access", "services"),
        t("final-assessment-plan", "services")
      ],
      icon: Target,
      popular: false,
      color: "bg-purple-500"
    }
  ];

  const additionalServices = [
    {
      title: t("meal-planning-title", "services"),
      description: t("meal-planning-desc", "services"),
      icon: FileText
    },
    {
      title: t("24-7-support-title", "services"),
      description: t("24-7-support-desc", "services"),
      icon: MessageCircle
    },
    {
      title: t("progress-tracking-title", "services"),
      description: t("progress-tracking-desc", "services"),
      icon: Target
    }
  ];

  const processSteps = [
    {
      step: "1",
      title: t("step-1-title", "services"),
      description: t("step-1-desc", "services")
    },
    {
      step: "2",
      title: t("step-2-title", "services"),
      description: t("step-2-desc", "services")
    },
    {
      step: "3",
      title: t("step-3-title", "services"),
      description: t("step-3-desc", "services")
    },
    {
      step: "4",
      title: t("step-4-title", "services"),
      description: t("step-4-desc", "services")
    }
  ];

  return (
    <div className="min-h-screen py-20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 mb-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t("title", "services")}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {t("subtitle", "services")}
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
                className={`relative hover:shadow-xl transition-all duration-300 hover:-translate-y-2 ${
                  service.popular ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                {service.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary-500 text-white">{t("most-popular", "services")}</Badge>
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

                <CardContent className="space-y-6">
                  <p className="text-muted-foreground text-center">{service.description}</p>
                  
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary-600 mb-2">{service.price}</div>
                    <p className="text-sm text-muted-foreground">One-time fee</p>
                  </div>

                  <ul className="space-y-3">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button className="w-full" asChild>
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
              {t("whats-included", "services")}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t("comprehensive-support", "services")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {additionalServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
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
              {t("how-it-works", "services")}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t("simple-steps", "services")}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              {processSteps.map((step, index) => (
                <div key={index} className="text-center relative">
                  {/* Connector Line */}
                  {index < processSteps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-primary-200 dark:bg-primary-800 z-0"></div>
                  )}
                  
                  {/* Step Circle */}
                  <div className="w-16 h-16 bg-primary-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 relative z-10">
                    {step.step}
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50 dark:bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("faq-title", "services")}
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("faq-1-question", "services")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t("faq-1-answer", "services")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("faq-2-question", "services")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t("faq-2-answer", "services")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("faq-3-question", "services")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t("faq-3-answer", "services")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I contact you between sessions?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Absolutely! All clients have access to our secure messaging platform where you can ask questions, 
                  share updates, and get support between scheduled appointments.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary-500 to-primary-600 text-white">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Transform Your Health?
              </h2>
              <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
                Book your initial consultation today and take the first step towards a healthier, 
                more confident you. I'm here to support you every step of the way.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/appointment">
                    <Calendar className="mr-2 h-5 w-5" />
                    Book a Consultation
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600" asChild>
                  <Link href="/contact">Contact Directly</Link>
                </Button>
              </div>
              
              {/* Contact Info */}
              <div className="mt-8 text-primary-100 text-sm">
                <p>Or contact me directly at:</p>
                <p className="font-medium">info@vee-nutrition.com | +31 6 12345678</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
