import { CheckCircle, Heart, Target, Smile, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import PageTransition from "@/components/ui/PageTransition";
import aboutMeImage from "@assets/AboutMe.jpg";
import { FloatingOrganic } from "@/components/ui/FloatingOrganic";

export default function About() {
  const credentials = [
    "MSc Clinical Nutrition",
    "Registered Dietitian",
    "Sports Nutritionist",
    "Professional Member",
  ];

  const values = [
    {
      icon: Heart,
      title: "Compassionate Care",
      description: "You deserve to feel heard and supported. Your story matters.",
    },
    {
      icon: Target,
      title: "Personalized Approach",
      description: "Nutrition plans that fit your unique lifestyle and goals.",
    },
    {
      icon: Smile,
      title: "Joyful Living",
      description: "Healthy eating should bring joy, not stress.",
    },
    {
      icon: Star,
      title: "Sustainable Results",
      description: "Lasting changes, not quick fixes. Build lifelong healthy habits.",
    },
  ];

  const stats = [
    { number: "500+", label: "Lives Transformed" },
    { number: "95%", label: "Client Satisfaction" },
    { number: "24/7", label: "Ongoing Support" },
  ];

  return (
    <div className="min-h-screen bg-background page-content">
      {/* 3-Column Layout Container */}
      <div className="grid grid-cols-12 min-h-screen">
        
        {/* Left Column - Images */}
        <div className="col-span-3 relative">
          <div className="sticky top-0 h-screen flex flex-col gap-4 p-4">
            <img 
              src="https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
              alt="Woven basket with fresh produce"
              className="flex-1 object-cover rounded-lg shadow-lg" 
            />
            <img 
              src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
              alt="Healthy lifestyle"
              className="flex-1 object-cover rounded-lg shadow-lg" 
            />
          </div>
        </div>

        {/* Middle Column - Content with Hero Background */}
        <div className="col-span-6 relative">
          {/* Hero Section with Background */}
          <section className="relative h-screen flex items-center justify-center"
                   style={{
                     backgroundImage: `url('https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')`,
                     backgroundSize: 'cover',
                     backgroundPosition: 'center',
                     backgroundAttachment: 'fixed'
                   }}>
            {/* Overlay for text readability */}
            <div className="absolute inset-0 bg-black/40"></div>
            
            {/* Hero Content */}
            <div className="relative z-10 text-center text-white px-8">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-wide">
                REGISTERED DIETITIAN
              </h1>
              <p className="text-xl md:text-2xl font-light mb-8">
                Hi! I'm Vee, a Registered Dietitian with the HPCSA and HCPC
              </p>
              <p className="text-lg font-medium">
                Your Wellness Partner
              </p>
            </div>
          </section>

          {/* Content Sections */}
          <section className="bg-white dark:bg-gray-900 px-8 py-16">
            {/* About Section */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center mb-8">About Me</h2>
              
              <div className="space-y-6 text-center max-w-2xl mx-auto">
                <p className="text-lg leading-relaxed">
                  Evidence-based nutrition science with real-world practicality. Let's create sustainable habits that fit your life.
                </p>
                
                <div className="grid grid-cols-2 gap-4 mt-8">
                  {credentials.map((credential, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm font-medium">{credential}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* My Approach Section */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center mb-8">My Approach</h2>
              <div className="grid grid-cols-2 gap-6">
                {values.map((value, index) => {
                  const Icon = value.icon;
                  return (
                    <Card key={index} className="mediterranean-card">
                      <CardContent className="p-6 text-center">
                        <Icon className="w-8 h-8 text-primary mx-auto mb-3" />
                        <h3 className="font-bold mb-2">{value.title}</h3>
                        <p className="text-sm text-muted-foreground">{value.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Stats Section */}
            <div className="mb-16">
              <div className="grid grid-cols-3 gap-8 text-center">
                {stats.map((stat, index) => (
                  <div key={index} className="space-y-2">
                    <div className="text-3xl font-bold text-primary">{stat.number}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Personal Story Section */}
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-8">Your Dedicated Partner</h2>
              <div className="space-y-6 text-lg leading-relaxed max-w-2xl mx-auto">
                <p>
                  You deserve to feel heard and supported. Your story matters, and together we'll transform your relationship with food. 
                  My approach combines evidence-based nutrition science with real-world practicality.
                </p>
                <p>
                  Whether you're looking for personalized nutrition plans, ongoing support, or expert guidance on your wellness journey, 
                  I'm here to help you build lifelong healthy habits that bring joy, not stress.
                </p>
              </div>
              
              <div className="mt-12">
                <Button asChild size="lg" className="px-8 py-4">
                  <Link href="/appointment">Book Consultation</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column - Images */}
        <div className="col-span-3 relative">
          <div className="sticky top-0 h-screen flex flex-col gap-4 p-4">
            <img 
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
              alt="Fresh figs"
              className="flex-1 object-cover rounded-lg shadow-lg" 
            />
            <img 
              src="https://images.unsplash.com/photo-1559181567-c3190ca9959b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
              alt="Nutrition and wellness"
              className="flex-1 object-cover rounded-lg shadow-lg" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}