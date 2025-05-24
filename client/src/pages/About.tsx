import { Award, Users, Clock, Heart, Target, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

export default function About() {
  const { t } = useLanguage();
  
  const credentials = [
    "MSc in Clinical Nutrition",
    "Registered Dietitian (RD)",
    "Certified Sports Nutritionist",
    "Member of Professional Nutrition Association"
  ];

  const timeline = [
    {
      year: "2019",
      title: t("started-practice", "about"),
      description: t("started-description", "about")
    },
    {
      year: "2020",
      title: t("digital-platform", "about"),
      description: t("digital-description", "about")
    },
    {
      year: "2021",
      title: t("milestone-500", "about"),
      description: t("milestone-description", "about")
    },
    {
      year: "2022",
      title: t("advanced-certs", "about"),
      description: t("advanced-description", "about")
    },
    {
      year: "2024",
      title: t("present-day", "about"),
      description: t("present-description", "about")
    }
  ];

  const values = [
    {
      icon: Heart,
      title: t("compassionate-care", "about"),
      description: t("compassionate-description", "about")
    },
    {
      icon: Target,
      title: t("evidence-based", "about"),
      description: t("evidence-description", "about")
    },
    {
      icon: Users,
      title: t("sustainable-results", "about"),
      description: t("sustainable-description", "about")
    }
  ];

  return (
    <div className="min-h-screen py-20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 mb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <Badge className="mb-4 bg-primary-100 text-primary-700 hover:bg-primary-100">
              {t("meet-nutritionist", "about")}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t("hi-im-vee", "about")}
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              {t("vee-description", "about")}
            </p>

            {/* Key Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">500+</div>
                <div className="text-sm text-muted-foreground">{t("happy-clients", "about")}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">5+</div>
                <div className="text-sm text-muted-foreground">{t("years-experience", "about")}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">98%</div>
                <div className="text-sm text-muted-foreground">{t("success-rate", "about")}</div>
              </div>
            </div>

            <Button size="lg" asChild>
              <Link href="/appointment">{t("book-consultation", "about")}</Link>
            </Button>
          </div>

          {/* Image */}
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000" 
              alt="Professional nutritionist in consultation" 
              className="rounded-2xl shadow-2xl w-full"
            />
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center shadow-lg">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
              <Award className="w-8 h-8 text-primary-500" />
            </div>
          </div>
        </div>
      </section>

      {/* Credentials Section */}
      <section className="bg-primary-50 dark:bg-gray-800 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("professional-qualifications", "about")}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t("backed-by-education", "about")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {credentials.map((credential, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="font-semibold mb-2">{credential}</h3>
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* My Approach Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t("my-approach", "about")}
              </h2>
              <p className="text-xl text-muted-foreground">
                {t("sustainable-personalized", "about")}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-8">
                      <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                      </div>
                      <h3 className="text-xl font-semibold mb-4">{value.title}</h3>
                      <p className="text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="bg-gray-50 dark:bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("my-journey", "about")}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t("building-expertise", "about")}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary-200 dark:bg-primary-800"></div>

              {timeline.map((item, index) => (
                <div key={index} className="relative flex items-start mb-12 last:mb-0">
                  {/* Timeline Dot */}
                  <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg z-10">
                    {item.year.slice(-2)}
                  </div>
                  
                  {/* Content */}
                  <div className="ml-8 flex-1">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline">{item.year}</Badge>
                          <h3 className="text-xl font-semibold">{item.title}</h3>
                        </div>
                        <p className="text-muted-foreground">{item.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Personal Note Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary-500 to-primary-600 text-white">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {t("why-i-do", "about")}
              </h2>
              <blockquote className="text-xl leading-relaxed mb-8 italic">
                "{t("mission-quote", "about")}"
              </blockquote>
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-lg">Vee</p>
                  <p className="text-primary-100">{t("registered-dietitian-title", "about")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("ready-start-journey", "about")}
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t("lets-work-together", "about")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/appointment">{t("book-consultation", "about")}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">{t("get-in-touch", "about")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
