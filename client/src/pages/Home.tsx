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
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const { t } = useLanguage();

  const services = [
    {
      icon: ClipboardList,
      title: t("personalized-meal-plans", "home"),
      description: t("meal-plans-description", "home"),
      features: [t("detailed-meal-planning", "home"), t("shopping-lists", "home"), t("recipe-substitutions", "home")]
    },
    {
      icon: MessageCircle,
      title: t("support-messaging", "home"),
      description: t("support-description", "home"),
      features: [t("real-time-messaging", "home"), t("quick-responses", "home"), t("motivational-support", "home")]
    },
    {
      icon: BookOpen,
      title: t("exclusive-resources", "home"),
      description: t("resources-description", "home"),
      features: [t("recipe-collections", "home"), t("educational-guides", "home"), t("video-tutorials", "home")]
    }
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      result: t("lost-weight", "home"),
      quote: t("testimonial-1", "home"),
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Marcus T.",
      result: t("gained-confidence", "home"),
      quote: t("testimonial-2", "home"),
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Emma K.",
      result: t("improved-health", "home"),
      quote: t("testimonial-3", "home"),
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=2053&h=1200" 
            alt="Fresh healthy vegetables and fruits arranged beautifully" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                {t("hero-title", "home")}
              </h1>
              <p className="text-xl text-gray-200 mb-8 max-w-2xl">
                {t("hero-subtitle", "home")}
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" asChild className="bg-primary-500 hover:bg-primary-600">
                  <Link href="/appointment">
                    {t("get-started", "home")}
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
                  <Link href="/about">
                    {t("learn-more", "home")}
                  </Link>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 flex flex-wrap justify-center lg:justify-start items-center gap-6 text-white/80">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-primary-400" />
                  <span className="text-sm">{t("happy-clients", "home")}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-primary-400" />
                  <span className="text-sm">{t("certified-nutritionist", "home")}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-primary-400" />
                  <span className="text-sm">{t("years-experience", "home")}</span>
                </div>
              </div>
            </div>


          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {t("comprehensive-services", "home")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("services-subtitle", "home")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <CardContent className="p-8">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">{service.title}</h3>
                    <p className="text-muted-foreground mb-6">{service.description}</p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-primary-500" />
                          <span>{feature}</span>
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

      {/* About Preview Section */}
      <section className="py-20 bg-primary-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Image */}
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Professional nutritionist consulting with client" 
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
              
              {/* Credentials Badge */}
              <div className="absolute -bottom-6 -right-6 bg-background rounded-2xl p-4 shadow-xl">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-semibold">{t("certified", "home")}</p>
                  <p className="text-xs text-muted-foreground">{t("nutritionist", "home")}</p>
                </div>
              </div>
            </div>

            {/* Right - Content */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                {t("meet-expert", "home")}
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                {t("expert-description", "home")}
              </p>
              
              {/* Credentials */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                    <Award className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <span>{t("msc-nutrition", "home")}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <span>{t("registered-dietitian", "home")}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <span>500+ Successful Transformations</span>
                </div>
              </div>

              {/* My Approach */}
              <Card className="mb-8">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-3">{t("my-approach", "home")}</h3>
                  <p className="text-muted-foreground text-sm">
                    {t("approach-description", "home")}
                  </p>
                </CardContent>
              </Card>

              <Button asChild>
                <Link href="/about">{t("learn-more-about", "home")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t("success-stories", "home")}</h2>
            <p className="text-xl text-muted-foreground">{t("real-transformations", "home")}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <blockquote className="mb-6">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center space-x-3">
                    <img 
                      src={testimonial.image} 
                      alt={`${testimonial.name}, satisfied client`} 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.result}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-primary-500">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Stay Updated on Your Health Journey
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Get weekly nutrition tips, healthy recipes, and exclusive content delivered to your inbox. 
              Plus, download our free meal planning guide!
            </p>

            <NewsletterForm />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
              <CardContent className="p-8 md:p-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Ready to Start Your Health Journey?
                </h2>
                <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
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
                    <Link href="/contact">
                      Contact Directly
                    </Link>
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
        </div>
      </section>
    </div>
  );
}
