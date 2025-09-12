import { 
  Heart, 
  Target, 
  Smile, 
  Stethoscope, 
  Leaf, 
  Users,
  Clock,
  Shield,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Services() {
  const services = [
    {
      icon: Heart,
      title: "Personalized Nutrition",
      description: "Tailored meal plans designed specifically for your health goals and dietary preferences",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: Target,
      title: "Weight Management",
      description: "Sustainable strategies for achieving and maintaining your ideal weight",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Smile,
      title: "Mental Health Support",
      description: "Nutritional approaches to support mood, energy, and overall mental wellbeing",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Stethoscope,
      title: "Medical Nutrition",
      description: "Specialized nutrition therapy for diabetes, heart disease, and other conditions",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Leaf,
      title: "Plant-Based Nutrition",
      description: "Expert guidance for vegetarian, vegan, and plant-forward eating patterns",
      color: "from-lime-500 to-green-500"
    },
    {
      icon: Users,
      title: "Family Nutrition",
      description: "Comprehensive nutrition support for the whole family, from children to seniors",
      color: "from-purple-500 to-indigo-500"
    }
  ];

  return (
    <div className="page-wrapper relative -mt-28 pt-28" style={{
      backgroundImage: 'url("/nazdravi.nl%20(2).png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      minHeight: '100vh',
      width: '100%'
    }}>
      {/* Main content section */}
      <section className="page-content p-3 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto w-full">
          {/* Header Section */}
          <div className="text-center mb-8 xs:mb-10 sm:mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mb-4 xs:mb-6">
              <Leaf className="h-6 w-6 xs:h-7 xs:h-7 sm:h-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-3xl xs:text-4xl sm:text-5xl font-bold mb-3 xs:mb-4 text-white" 
                style={{fontFamily: 'The Seasons, serif', letterSpacing: '-0.01em'}}>
              Our Services
            </h1>
            <p className="text-lg xs:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed" style={{fontFamily: 'Calibri, sans-serif', letterSpacing: '0.02em'}}>
              Transform your health with evidence-based nutrition guidance tailored to your unique needs and lifestyle.
            </p>
          </div>

          {/* Services Grid - 6 Squares */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-6 sm:gap-8 mb-8 xs:mb-10 sm:mb-12">
            {services.map((service, index) => (
              <Card key={index} className="group relative border-2 border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <CardContent className="p-6 xs:p-8 text-center h-full flex flex-col items-center justify-center min-h-[250px]">
                  <div className={`inline-flex items-center justify-center w-16 h-16 xs:w-20 xs:h-20 bg-gradient-to-br ${service.color} rounded-2xl mb-4 xs:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <service.icon className="h-8 w-8 xs:h-10 xs:w-10 text-white" />
                  </div>
                  
                  <h3 className="text-xl xs:text-2xl font-bold mb-3 xs:mb-4 text-white" style={{fontFamily: 'The Seasons, serif', letterSpacing: '-0.01em'}}>
                    {service.title}
                  </h3>
                  
                  <p className="text-white/90 text-base xs:text-lg leading-relaxed" style={{fontFamily: 'Calibri, sans-serif', letterSpacing: '0.02em'}}>
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 xs:p-8 sm:p-10 shadow-lg">
            <div className="inline-flex items-center justify-center w-16 h-16 xs:w-20 xs:h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4 xs:mb-6">
              <Clock className="h-8 w-8 xs:h-10 xs:w-10 text-white" />
            </div>
            <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-white mb-3 xs:mb-4" style={{fontFamily: 'The Seasons, serif', letterSpacing: '-0.01em'}}>
              Ready to Start Your Journey?
            </h2>
            <p className="text-white/90 text-lg xs:text-xl mb-6 xs:mb-8 max-w-2xl mx-auto leading-relaxed" style={{fontFamily: 'Calibri, sans-serif', letterSpacing: '0.02em'}}>
              Book a consultation today and take the first step towards a healthier, happier you.
            </p>
            <div className="flex flex-col xs:flex-row gap-4 xs:gap-6 justify-center items-center">
              <Link href="/appointment">
                <Button size="lg" className="px-8 xs:px-10 py-3 xs:py-4 text-lg xs:text-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 transform hover:scale-105 border-2 border-yellow-300 text-white">
                  Book Consultation
                  <ArrowRight className="ml-2 h-5 w-5 xs:h-6 xs:w-6" />
                </Button>
              </Link>
              <Link href="/plans">
                <Button variant="outline" size="lg" className="px-8 xs:px-10 py-3 xs:py-4 text-lg xs:text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
                  View Plans
                </Button>
              </Link>
            </div>
          </div>

          {/* Nutrition Services Heading */}
          <div className="text-center mt-8 xs:mt-10 sm:mt-12">
            <h1 className="text-6xl xs:text-7xl sm:text-8xl md:text-9xl font-bold leading-tight lowercase" 
                style={{
                  fontFamily: 'The Seasons, serif', 
                  letterSpacing: '-0.01em',
                  background: 'linear-gradient(45deg, #f97316, #eab308)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent'
                }}>
              nutrition services
            </h1>
          </div>
        </div>
      </section>
    </div>
  );
}