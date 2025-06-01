import { CheckCircle, Heart, Target, Smile, Star, Award, Users, Clock, GraduationCap, Stethoscope, Shield, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import aboutPageBG from "@assets/Untitled design (1).jpg";

export default function About() {
  const credentials = [
    {
      icon: GraduationCap,
      title: "MSc Clinical Nutrition",
      description: "Advanced Master's degree in Clinical Nutrition Science"
    },
    {
      icon: Shield,
      title: "Registered Dietitian HPCSA",
      description: "Licensed with Health Professions Council of South Africa"
    },
    {
      icon: Stethoscope,
      title: "Sports Nutritionist",
      description: "Specialized expertise in performance nutrition"
    },
    {
      icon: BookOpen,
      title: "Professional Member",
      description: "Active member of professional nutrition associations"
    },
  ];

  const values = [
    {
      icon: Heart,
      title: "Compassionate Care",
      description: "You deserve to feel heard and supported. Your story matters, and I'm here to listen with empathy and understanding.",
    },
    {
      icon: Target,
      title: "Personalized Approach",
      description: "Every nutrition plan is tailored to your unique lifestyle, preferences, and health goals for optimal results.",
    },
    {
      icon: Smile,
      title: "Joyful Living",
      description: "Healthy eating should enhance your life, not restrict it. Let's find the joy in nourishing your body.",
    },
    {
      icon: Star,
      title: "Sustainable Results",
      description: "Focus on lasting lifestyle changes rather than quick fixes. Build habits that will serve you for life.",
    },
  ];

  const stats = [
    { 
      icon: Users,
      number: "500+", 
      label: "Lives Transformed",
      description: "Clients successfully achieving their health goals"
    },
    { 
      icon: Award,
      number: "95%", 
      label: "Client Satisfaction",
      description: "Consistently high satisfaction ratings"
    },
    { 
      icon: Clock,
      number: "24/7", 
      label: "Ongoing Support",
      description: "Continuous guidance throughout your journey"
    },
  ];

  return (
    <div className="min-h-screen bg-background page-content">
      {/* Full-Width Hero Section */}
      <section className="relative h-screen flex items-center justify-center w-full"
               style={{
                 backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.2)), url(${aboutPageBG})`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
                 backgroundAttachment: 'fixed'
               }}>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-8 max-w-4xl">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full mb-6">
              <Stethoscope className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-wide">
            REGISTERED DIETITIAN
          </h1>
          <p className="text-xl md:text-2xl font-light mb-8 leading-relaxed">
            Hi! I'm Vee, a Registered Dietitian with the HPCSA and HCPC
          </p>
          <div className="flex items-center justify-center gap-2 text-lg font-medium">
            <Heart className="w-5 h-5 text-red-400" />
            <span>Your Wellness Partner</span>
          </div>
        </div>
      </section>

      {/* 3-Column Layout Section */}
      <div className="grid grid-cols-12 min-h-screen">
        
        {/* Left Column - Images */}
        <div className="col-span-3 bg-gray-50 dark:bg-gray-800">
          <div className="sticky top-0 h-screen flex flex-col gap-6 p-6">
            <div className="relative group flex-1">
              <img 
                src="https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Woven basket with fresh produce"
                className="w-full h-full object-cover rounded-xl shadow-xl group-hover:shadow-2xl transition-shadow duration-300" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
            </div>
            <div className="relative group flex-1">
              <img 
                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Healthy lifestyle"
                className="w-full h-full object-cover rounded-xl shadow-xl group-hover:shadow-2xl transition-shadow duration-300" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
            </div>
          </div>
        </div>

        {/* Middle Column - Content */}
        <div className="col-span-6 bg-white dark:bg-gray-900">
          <section className="px-8 py-20">
            {/* About Section */}
            <div className="mb-20">
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                  <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-4xl font-bold mb-4">About Me</h2>
                <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
              </div>
              
              <div className="space-y-8 text-center max-w-3xl mx-auto">
                <p className="text-xl leading-relaxed text-gray-700 dark:text-gray-300">
                  Evidence-based nutrition science with real-world practicality. Let's create sustainable habits that fit your life and support your wellness journey with compassion and expertise.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                  {credentials.map((credential, index) => {
                    const Icon = credential.icon;
                    return (
                      <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-700">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="text-left">
                              <h3 className="font-bold text-lg mb-2">{credential.title}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{credential.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* My Approach Section */}
            <div className="mb-20">
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                  <Target className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-4xl font-bold mb-4">My Approach</h2>
                <div className="w-24 h-1 bg-green-600 mx-auto rounded-full"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {values.map((value, index) => {
                  const Icon = value.icon;
                  return (
                    <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
                      <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{value.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Stats Section */}
            <div className="mb-20">
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full mb-4">
                  <Award className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-4xl font-bold mb-4">Track Record</h2>
                <div className="w-24 h-1 bg-purple-600 mx-auto rounded-full"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-indigo-50 to-white dark:from-gray-800 dark:to-gray-700">
                      <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Icon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">{stat.number}</div>
                        <div className="text-lg font-semibold mb-2">{stat.label}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{stat.description}</div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Personal Story Section */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-100 dark:bg-rose-900 rounded-full mb-6">
                <Heart className="w-8 h-8 text-rose-600 dark:text-rose-400" />
              </div>
              <h2 className="text-4xl font-bold mb-4">Your Dedicated Partner</h2>
              <div className="w-24 h-1 bg-rose-600 mx-auto rounded-full mb-8"></div>
              
              <div className="space-y-8 text-lg leading-relaxed max-w-3xl mx-auto text-gray-700 dark:text-gray-300">
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
                <Button asChild size="lg" className="px-10 py-4 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300">
                  <Link href="/appointment">
                    Book Consultation
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column - Images */}
        <div className="col-span-3 bg-gray-50 dark:bg-gray-800">
          <div className="sticky top-0 h-screen flex flex-col gap-6 p-6">
            <div className="relative group flex-1">
              <img 
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Fresh figs"
                className="w-full h-full object-cover rounded-xl shadow-xl group-hover:shadow-2xl transition-shadow duration-300" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
            </div>
            <div className="relative group flex-1">
              <img 
                src="https://images.unsplash.com/photo-1559181567-c3190ca9959b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Nutrition and wellness"
                className="w-full h-full object-cover rounded-xl shadow-xl group-hover:shadow-2xl transition-shadow duration-300" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}