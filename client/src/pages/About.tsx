import { Award, Users, Clock, Heart, Target, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function About() {
  const credentials = [
    "MSc in Clinical Nutrition",
    "Registered Dietitian (RD)",
    "Certified Sports Nutritionist",
    "Member of Professional Nutrition Association"
  ];

  const timeline = [
    {
      year: "2019",
      title: "Started my practice",
      description: "After completing my Master's degree in Nutrition Science"
    },
    {
      year: "2020",
      title: "Digital Platform Expertise",
      description: "Specialized in online nutrition counseling and digital health tools"
    },
    {
      year: "2021",
      title: "500+ clients helped",
      description: "Successfully guided over 500 individuals to better health"
    },
    {
      year: "2022",
      title: "Advanced certifications",
      description: "Regularly updating knowledge with latest research and methodologies"
    },
    {
      year: "2024",
      title: "Present day",
      description: "Continuing to innovate in personalized nutrition therapy"
    }
  ];

  const values = [
    {
      icon: Heart,
      title: "Compassionate Care",
      description: "Understanding and empathetic support throughout your journey"
    },
    {
      icon: Target,
      title: "Evidence-Based",
      description: "All recommendations are backed by the latest scientific research"
    },
    {
      icon: Users,
      title: "Sustainable & Personalized",
      description: "Plans that fit your lifestyle and create lasting change"
    }
  ];

  const stats = [
    { number: "500+", label: "Happy Clients" },
    { number: "8+", label: "Years Experience" },
    { number: "95%", label: "Success Rate" },
    { number: "24/7", label: "Support Available" }
  ];

  return (
    <div className="min-h-screen py-20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 mb-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About Vee
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Meet the nutritional therapist dedicated to helping you transform your life through the power of nutrition and sustainable lifestyle changes.
          </p>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="container mx-auto px-4 mb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <Badge variant="secondary" className="w-fit">
                👋 Hi, I'm Vee!
              </Badge>
              <h2 className="text-3xl font-bold">
                Registered Dietitian & Nutrition Expert
              </h2>
            </div>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              I'm a registered dietitian with over 8 years of experience helping people achieve their health goals through personalized nutrition. My passion is helping people discover that healthy eating can be enjoyable, sustainable, and perfectly suited to their individual needs.
            </p>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              My journey in nutrition began with my own personal transformation. After years of struggling with my own health and energy levels, I discovered the transformative power of proper nutrition and holistic wellness. This inspired me to become certified in nutritional therapy and specialize in helping others achieve their health goals.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-4 bg-primary-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">{stat.number}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="bg-primary-50 dark:bg-gray-800 rounded-2xl p-8">
              <h3 className="text-xl font-semibold mb-4">Professional Qualifications</h3>
              <ul className="space-y-3">
                {credentials.map((credential, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-muted-foreground">{credential}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-primary-50 dark:bg-gray-800 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              My Mission
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              I believe everyone deserves to feel their best in their own body. My mission is to provide you with the knowledge, tools, and support needed to achieve sustainable health transformation.
            </p>
            
            <blockquote className="text-2xl font-medium italic text-primary-600 border-l-4 border-primary-600 pl-6 max-w-2xl mx-auto">
              "My mission is to help you achieve lasting health through nutrition"
            </blockquote>
          </div>
        </div>
      </section>

      {/* My Journey Timeline */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              My Journey
            </h2>
            <p className="text-xl text-muted-foreground">
              Building expertise and helping people transform their health
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {timeline.map((item, index) => (
                <div key={index} className="flex gap-6 items-start">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">
                      {item.year}
                    </div>
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* My Approach */}
      <section className="bg-white dark:bg-gray-800 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              My Approach
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              I believe in a holistic, evidence-based approach to nutrition that considers your unique lifestyle, preferences, and goals. No two people are the same, so neither should their nutrition plans.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Icon className="w-8 h-8 text-primary-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why I Do What I Do */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Why I Do What I Do
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              My passion is helping people discover that healthy eating can be enjoyable, sustainable, and perfectly suited to their individual needs. I've seen firsthand how the right nutrition approach can transform not just physical health, but energy levels, confidence, and overall quality of life.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Every client's success story reminds me why I chose this path - to empower people with the knowledge and tools they need to take control of their health and live their best lives.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to start your journey to better health?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Let's work together to create a personalized nutrition plan that fits your lifestyle and helps you achieve your goals.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/appointment">
              Book Your Free Consultation
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}