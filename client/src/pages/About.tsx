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
      title: "Started Practice",
      description: "Opened Vee Nutrition to help people transform their relationship with food"
    },
    {
      year: "2020",
      title: "Digital Platform Launch",
      description: "Developed online consultation platform to reach more clients"
    },
    {
      year: "2021",
      title: "500+ Clients Milestone",
      description: "Reached milestone of helping over 500 individuals achieve their health goals"
    },
    {
      year: "2022",
      title: "Advanced Certifications",
      description: "Completed specialized training in sports nutrition and metabolic health"
    },
    {
      year: "2024",
      title: "Present Day",
      description: "Continuing to evolve practice with latest nutrition science and technology"
    }
  ];

  const values = [
    {
      icon: Heart,
      title: "Compassionate Care",
      description: "Every client receives personalized attention and support throughout their journey"
    },
    {
      icon: Target,
      title: "Evidence-Based",
      description: "All recommendations are grounded in current scientific research and proven methods"
    },
    {
      icon: Users,
      title: "Sustainable Results",
      description: "Focus on creating lasting lifestyle changes rather than quick fixes"
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
              Meet Your Nutritionist
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Hi, I'm Vee - Your Partner in Health
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              With over 5 years of experience in clinical nutrition and a passion for helping 
              people transform their relationship with food, I believe that sustainable health 
              starts with understanding your unique needs.
            </p>

            {/* Key Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">500+</div>
                <div className="text-sm text-muted-foreground">Happy Clients</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">5+</div>
                <div className="text-sm text-muted-foreground">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">98%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>

            <Button size="lg" asChild>
              <Link href="/appointment">Book Your Consultation</Link>
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
              Professional Qualifications
            </h2>
            <p className="text-xl text-muted-foreground">
              Backed by education, certification, and continuous learning
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
                My Approach to Nutrition
              </h2>
              <p className="text-xl text-muted-foreground">
                Sustainable, personalized, and evidence-based nutrition guidance
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
              My Journey
            </h2>
            <p className="text-xl text-muted-foreground">
              Building expertise and helping clients achieve their goals
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
                Why I Do What I Do
              </h2>
              <blockquote className="text-xl leading-relaxed mb-8 italic">
                "I believe that everyone deserves to feel confident and healthy in their own body. 
                My mission is to provide you with the knowledge, tools, and support you need to 
                create lasting positive changes. It's not about perfection – it's about progress, 
                self-compassion, and finding what works for your unique lifestyle."
              </blockquote>
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-lg">Vee</p>
                  <p className="text-primary-100">Registered Dietitian & Nutritionist</p>
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
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Let's work together to create a personalized nutrition plan that fits your lifestyle and helps you achieve your health goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/appointment">Book a Consultation</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">Get in Touch</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
