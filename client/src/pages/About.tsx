import {
  CheckCircle,
  Heart,
  Target,
  Smile,
  Star,
  Award,
  Users,
  Clock,
  GraduationCap,
  Stethoscope,
  Shield,
  BookOpen,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import aboutPageBG from "@assets/AboutPageBG.jpg";

export default function About() {
  const credentials = [
    {
      icon: GraduationCap,
      title: "Registered Dietitian HPCSA",
      description: "Licensed with Health Professions Council of South Africa",
    },
    {
      icon: Shield,
      title: "Registered Dietitian HCPC",
      description:
        "Licensed with Health Professions Council in the United Kingdom",
    },
    {
      icon: Stethoscope,
      title: "Clinical Experience",
      description: "Years working in hospitals within the clinical practice",
    },
    {
      icon: BookOpen,
      title: "Professional Member",
      description: "Active member of professional nutrition associations",
    },
  ];

  const values = [
    {
      icon: Heart,
      title: "Compassionate Care",
      description:
        "You deserve to feel heard and supported. Your story matters, and I'm here to listen with empathy and understanding.",
    },
    {
      icon: Target,
      title: "Personalized Approach",
      description:
        "Every nutrition plan is tailored to your unique lifestyle, preferences, and health goals for optimal results.",
    },
    {
      icon: Smile,
      title: "Joyful Living",
      description:
        "Healthy eating should enhance your life, not restrict it. Let's find the joy in nourishing your body.",
    },
    {
      icon: Star,
      title: "Sustainable Results",
      description:
        "Focus on lasting lifestyle changes rather than quick fixes. Build habits that will serve you for life.",
    },
  ];

  return (
    <div className="min-h-screen bg-background page-content">
      {/* Full-Width Hero Section */}
      <section
        className="relative h-[50vh] flex items-center justify-center w-full"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.2)), url(${aboutPageBG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-8 max-w-4xl">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full mb-6">
              <Stethoscope className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-wide text-white">
            REGISTERED DIETITIAN
          </h1>
          <p className="text-xl md:text-2xl font-light mb-8 leading-relaxed">
            Registered Dietitian with the HPCSA and HCPC
          </p>
          <div className="flex items-center justify-center gap-2 text-lg font-medium">
            <Heart className="w-5 h-5 text-red-400" />
            <span>Your Wellness Partner</span>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <div className="bg-white dark:bg-gray-900">
        <section className="container mx-auto px-8 py-12 max-w-4xl">
          {/* About Section */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold mb-4">About Me</h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
            </div>

            <div className="space-y-8 text-center max-w-3xl mx-auto">
              <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                Hi! I'm Vee, a Registered Dietitian with both the Health
                Professions Council of South Africa (HPCSA) and the Health and
                Care Professions Council (HCPC) in the UK. With over 8 years
                of clinical experience, I've had the privilege of supporting
                individuals and families across various stages of life—from
                managing complex medical conditions to guiding parents through
                the critical stages of infant and child nutrition.
              </p>
              <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                My passion lies in real, practical nutrition—grounded in
                science, not fad diets. I believe healthy living doesn't have
                to be restrictive or overwhelming. Instead, I help clients
                build sustainable habits that fit naturally into their
                lifestyle, culture, and family needs.
              </p>
              <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                Whether you're navigating a new diagnosis, trying to feel more
                confident during pregnancy and postpartum, or simply looking
                to eat better without the confusion, I'm here to help you make
                informed and empowering choices.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                {credentials.map((credential, index) => {
                  const Icon = credential.icon;
                  return (
                    <Card
                      key={index}
                      className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-700"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-bold text-base mb-1">
                              {credential.title}
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                              {credential.description}
                            </p>
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
          <div className="mb-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                <Target className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-3xl font-bold mb-4">My Approach</h2>
              <div className="w-24 h-1 bg-green-600 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <Card
                    key={index}
                    className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700"
                  >
                    <CardContent className="p-4 text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-lg font-bold mb-2">
                        {value.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Personal Story Section */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-100 dark:bg-rose-900 rounded-full mb-4">
              <Heart className="w-8 h-8 text-rose-600 dark:text-rose-400" />
            </div>
            <h2 className="text-3xl font-bold mb-4">
              Your Dedicated Partner
            </h2>
            <div className="w-24 h-1 bg-rose-600 mx-auto rounded-full mb-6"></div>

            <div className="space-y-4 text-base leading-relaxed max-w-3xl mx-auto text-gray-700 dark:text-gray-300">
              <p>
                You deserve to feel heard and supported. Your story matters,
                and together we'll transform your relationship with food. My
                approach combines evidence-based nutrition science with
                real-world practicality.
              </p>
            </div>

            <div className="mt-12">
              <Button
                asChild
                size="lg"
                className="px-10 py-4 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link href="/appointment">Book Consultation</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}