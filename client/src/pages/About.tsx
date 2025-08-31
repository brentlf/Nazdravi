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
  ArrowRight,
  ChevronRight,
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
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Shield,
      title: "Registered Dietitian HCPC",
      description: "Licensed with Health Professions Council in the United Kingdom",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: Stethoscope,
      title: "Clinical Experience",
      description: "Years working in hospitals within the clinical practice",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: BookOpen,
      title: "Professional Member",
      description: "Active member of professional nutrition associations",
      color: "from-orange-500 to-red-500",
    },
  ];

  const values = [
    {
      icon: Heart,
      title: "Compassionate Care",
      description: "You deserve to feel heard and supported. Your story matters, and I'm here to listen with empathy and understanding.",
      color: "from-red-500 to-pink-500",
    },
    {
      icon: Target,
      title: "Personalized Approach",
      description: "Every nutrition plan is tailored to your unique lifestyle, preferences, and health goals for optimal results.",
      color: "from-blue-500 to-indigo-500",
    },
    {
      icon: Smile,
      title: "Joyful Living",
      description: "Healthy eating should enhance your life, not restrict it. Let's find the joy in nourishing your body.",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: Star,
      title: "Sustainable Results",
      description: "Focus on lasting lifestyle changes rather than quick fixes. Build habits that will serve you for life.",
      color: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section
        className="relative h-[60vh] lg:h-[70vh] flex items-center justify-center w-full"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.3)), url(${aboutPageBG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-8 max-w-5xl">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full mb-8">
              <Stethoscope className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl lg:text-7xl xl:text-8xl font-bold mb-8 tracking-wide text-white text-balance">
            REGISTERED DIETITIAN
          </h1>
          <p className="text-xl lg:text-2xl font-light mb-8 leading-relaxed max-w-4xl mx-auto">
            Dedicated to transforming lives through evidence-based nutrition guidance and personalized care
          </p>
          <div className="flex items-center justify-center gap-3 text-lg font-medium">
            <Heart className="w-6 h-6 text-red-400" />
            <span>Your Wellness Partner</span>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-8 text-balance">
              Our Mission
            </h2>
            <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed mb-12">
              To empower individuals with the knowledge, tools, and support they need to achieve optimal health through sustainable nutrition practices that honor both body and mind.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Clear Goals</h3>
                <p className="text-muted-foreground">Define and achieve your health objectives</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Personalized Care</h3>
                <p className="text-muted-foreground">Tailored to your unique needs</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Long-term Success</h3>
                <p className="text-muted-foreground">Sustainable results that last</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Credentials Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-balance">
              Professional Credentials
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Your health is in expert hands with our internationally recognized qualifications and extensive clinical experience.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {credentials.map((credential, index) => (
              <Card key={index} className="border-0 shadow-soft hover:shadow-elegant transition-all duration-300 group">
                <CardContent className="p-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${credential.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <credential.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-foreground">
                    {credential.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {credential.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-balance">
              Our Core Values
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              These principles guide every interaction and decision in our practice, ensuring you receive the highest quality care.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <Card key={index} className="border-0 shadow-soft hover:shadow-elegant transition-all duration-300 group">
                <CardContent className="p-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${value.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <value.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-foreground">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl lg:text-5xl font-bold mb-8 text-balance">
                  Years of Clinical Excellence
                </h2>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  With over 8 years of clinical practice in hospitals and private practice, I bring a wealth of experience in managing complex nutritional needs across diverse patient populations.
                </p>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                      <Award className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Clinical Expertise</h3>
                      <p className="text-muted-foreground">Hospital-based nutrition therapy</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Evidence-Based Practice</h3>
                      <p className="text-muted-foreground">Latest research and guidelines</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Patient-Centered Care</h3>
                      <p className="text-muted-foreground">Individualized treatment plans</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-8 lg:p-12">
                  <div className="text-center">
                    <div className="text-6xl lg:text-7xl font-bold text-primary mb-4">8+</div>
                    <div className="text-xl font-semibold text-foreground mb-2">Years of Experience</div>
                    <div className="text-muted-foreground">In clinical nutrition practice</div>
                  </div>
                  <div className="mt-8 grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-foreground">500+</div>
                      <div className="text-sm text-muted-foreground">Patients Helped</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-foreground">95%</div>
                      <div className="text-sm text-muted-foreground">Success Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-balance">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Let's work together to achieve your health and nutrition goals with personalized guidance and support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/appointment">
                <Button size="lg" className="text-lg px-8 py-6 shadow-elegant hover:shadow-2xl transition-all duration-300">
                  Book Your Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                  Explore Our Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}