import { Award, Users, Clock, Heart, Target, CheckCircle, Smile, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import aboutMeImage from "@assets/AboutMe.jpg";

export default function About() {
  const credentials = [
    "MSc in Clinical Nutrition",
    "Registered Dietitian (RD)",
    "Certified Sports Nutritionist",
    "Member of Professional Nutrition Association"
  ];

  const values = [
    {
      icon: Heart,
      title: "Compassionate Care",
      description: "I believe every person deserves to feel heard, understood, and supported on their wellness journey. Your story matters to me."
    },
    {
      icon: Target,
      title: "Personalized Approach",
      description: "No two people are the same, which is why I create nutrition plans that fit your unique lifestyle, preferences, and goals."
    },
    {
      icon: Smile,
      title: "Joyful Living",
      description: "Healthy eating should bring joy, not stress. Together, we'll find ways to make nutritious choices that you genuinely love."
    },
    {
      icon: Star,
      title: "Sustainable Results",
      description: "I focus on creating lasting changes that become natural parts of your life, not quick fixes that fade away."
    }
  ];

  const stats = [
    { number: "500+", label: "Lives Transformed" },
    { number: "8+", label: "Years of Dedication" },
    { number: "95%", label: "Client Satisfaction" },
    { number: "24/7", label: "Ongoing Support" }
  ];

  return (
    <div className="min-h-screen py-20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 mb-20">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4 text-base px-4 py-2">
            💚 Meet Your Nutrition Partner
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Hi, I'm Vee!
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            I'm here to help you discover that healthy eating can be delicious, sustainable, and perfectly tailored to your life. Let's transform your relationship with food together.
          </p>
        </div>
      </section>

      {/* Personal Story Section */}
      <section className="container mx-auto px-4 mb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <img 
              src={aboutMeImage} 
              alt="Vee - Your dedicated nutrition therapist"
              className="rounded-2xl shadow-lg w-full h-[500px] object-cover"
            />
          </div>
          
          <div className="space-y-6 order-1 lg:order-2">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">
                Your Partner in Wellness
              </h2>
            </div>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              I believe that healthy eating shouldn't feel like a punishment—it should be enjoyable, nourishing, and perfectly tailored to your unique lifestyle. My approach combines evidence-based nutrition science with real-world practicality, because I know how challenging it can be to maintain healthy habits in our busy lives.
            </p>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              My own journey with nutrition started when I realized that small, sustainable changes could create profound transformations. After experiencing the life-changing benefits of proper nutrition firsthand, I knew I wanted to help others discover this same sense of vitality and confidence. That's what drives me every day—seeing my clients not just reach their goals, but truly thrive.
            </p>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              When I'm not working with clients, you'll find me experimenting with new healthy recipes, staying up-to-date with the latest nutrition research, or enjoying outdoor activities. I believe in practicing what I preach—living a balanced, joyful life that includes delicious food and meaningful connections.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-4 bg-primary-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">{stat.number}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Professional Credentials</h3>
              <ul className="space-y-2">
                {credentials.map((credential, index) => (
                  <li key={index} className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {credential}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-primary-50 dark:bg-gray-800 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              What Guides My Practice
            </h2>
            <p className="text-xl text-muted-foreground">
              These values shape every interaction and ensure you receive the most supportive, effective care possible.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            I'm excited to work with you and help you create lasting, positive changes in your life. Your transformation starts with a single conversation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/appointment">
              <Button size="lg" className="px-8 py-3 text-lg">
                Book Your Consultation
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                Get in Touch
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            No pressure, no judgment—just genuine support for your wellness goals.
          </p>
        </div>
      </section>
    </div>
  );
}