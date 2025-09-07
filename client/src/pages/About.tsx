import { Heart, Target, Smile, Stethoscope, ArrowRight, Award, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function About() {
  return (
    <div className="page-wrapper">
      {/* Main content section */}
      <section className="page-content p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto w-full">
          {/* Header Section */}
          <div className="text-center mb-4 xs:mb-6 sm:mb-8 md:mb-10 lg:mb-12">
            <div className="inline-flex items-center justify-center w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full mb-2 xs:mb-3 sm:mb-4">
              <Stethoscope className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 xs:mb-3 sm:mb-4 leading-tight text-foreground font-serif">
              About Nazdravi
            </h1>
            <p className="text-sm xs:text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We're a nutrition practice that believes healthy eating should be simple, sustainable, and actually work for your real life.
            </p>
          </div>

          {/* Credentials Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 xs:gap-4 sm:gap-6 mb-6 xs:mb-8 sm:mb-10 md:mb-12">
            <div className="bg-card border border-border rounded-xl p-3 xs:p-4 sm:p-6 text-center hover:shadow-lg transition-all">
              <div className="inline-flex items-center justify-center w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl mb-2 xs:mb-3 sm:mb-4">
                <Award className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-card-foreground font-bold text-sm xs:text-base sm:text-lg mb-1 xs:mb-2">Registered Dietitian</h3>
              <p className="text-muted-foreground text-xs xs:text-sm sm:text-base">Licensed with HPCSA & HCPC</p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-3 xs:p-4 sm:p-6 text-center hover:shadow-lg transition-all">
              <div className="inline-flex items-center justify-center w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl mb-2 xs:mb-3 sm:mb-4">
                <Clock className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-card-foreground font-bold text-sm xs:text-base sm:text-lg mb-1 xs:mb-2">8+ Years Experience</h3>
              <p className="text-muted-foreground text-xs xs:text-sm sm:text-base">Clinical practice & private consulting</p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-3 xs:p-4 sm:p-6 text-center hover:shadow-lg transition-all xs:col-span-2 md:col-span-1">
              <div className="inline-flex items-center justify-center w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl mb-2 xs:mb-3 sm:mb-4">
                <Users className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-card-foreground font-bold text-sm xs:text-base sm:text-lg mb-1 xs:mb-2">500+ Clients Helped</h3>
              <p className="text-muted-foreground text-xs xs:text-sm sm:text-base">95% report sustainable progress</p>
            </div>
          </div>

          {/* Approach Section */}
          <div className="bg-card border border-border rounded-2xl p-3 xs:p-4 sm:p-6 md:p-8 mb-6 xs:mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-card-foreground text-center mb-4 xs:mb-6 sm:mb-8">Our Approach</h2>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-4 xs:gap-6 sm:gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 xs:w-12 xs:h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl mb-3 xs:mb-4">
                  <Heart className="h-5 w-5 xs:h-6 xs:w-6 text-white" />
                </div>
                <h3 className="text-card-foreground font-bold text-base xs:text-lg mb-2 xs:mb-3">Compassionate</h3>
                <p className="text-muted-foreground text-sm xs:text-base leading-relaxed">No judgment, just support. We understand that everyone's journey is unique.</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 xs:w-12 xs:h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl mb-3 xs:mb-4">
                  <Target className="h-5 w-5 xs:h-6 xs:w-6 text-white" />
                </div>
                <h3 className="text-card-foreground font-bold text-base xs:text-lg mb-2 xs:mb-3">Practical</h3>
                <p className="text-muted-foreground text-sm xs:text-base leading-relaxed">Real strategies for real life. We focus on actionable steps that fit your routine.</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 xs:w-12 xs:h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl mb-3 xs:mb-4">
                  <Smile className="h-5 w-5 xs:h-6 xs:w-6 text-white" />
                </div>
                <h3 className="text-card-foreground font-bold text-base xs:text-lg mb-2 xs:mb-3">Sustainable</h3>
                <p className="text-muted-foreground text-sm xs:text-base leading-relaxed">Habits that actually stick. We help you build lasting changes.</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-4 xs:p-6 sm:p-8 border border-primary/20">
            <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-foreground mb-3 xs:mb-4">Ready to Start Your Journey?</h3>
            <p className="text-muted-foreground mb-6 xs:mb-8 max-w-2xl mx-auto text-sm xs:text-base">
              Take the first step towards better health with a personalized nutrition consultation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 xs:gap-4 justify-center">
              <Link href="/appointment">
                <Button size="lg" className="px-6 xs:px-8 sm:px-10 py-3 xs:py-4 text-sm xs:text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transform hover:scale-105 border-2 border-primary/20">
                  Book Consultation
                  <ArrowRight className="ml-2 h-4 w-4 xs:h-5 xs:w-5" />
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="outline" size="lg" className="px-6 xs:px-8 sm:px-10 py-3 xs:py-4 text-sm xs:text-base sm:text-lg font-semibold border-2 bg-primary/5 hover:bg-primary/10 transition-all duration-300 transform hover:scale-105">
                  View Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}