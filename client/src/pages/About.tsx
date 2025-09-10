import { Heart, Target, Smile, Stethoscope, ArrowRight, Award, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function About() {
  return (
    <div className="page-wrapper">
      {/* Main content section */}
      <section className="page-content p-3 sm:p-4 lg:p-6">
        <div className="max-w-6xl mx-auto w-full">
          {/* Header Section */}
          <div className="text-center mb-3 xs:mb-4 sm:mb-6">
            <div className="inline-flex items-center justify-center w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full mb-2 xs:mb-3">
              <Stethoscope className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold mb-2 xs:mb-3 leading-tight text-foreground" 
                style={{fontFamily: 'The Seasons, serif', letterSpacing: '-0.01em'}}>
              About Nazdravi
            </h1>
            <p className="text-sm xs:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We're a nutrition practice that believes healthy eating should be simple, sustainable, and actually work for your real life.
            </p>
          </div>

          {/* Credentials Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 xs:gap-4 sm:gap-5 mb-4 xs:mb-6 sm:mb-8">
            <div className="bg-card border border-border rounded-xl p-3 xs:p-4 text-center hover:shadow-lg transition-all">
              <div className="inline-flex items-center justify-center w-8 h-8 xs:w-10 xs:h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl mb-2 xs:mb-3">
                <Award className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
              </div>
              <h3 className="text-card-foreground font-bold text-sm xs:text-base mb-1 xs:mb-2">Registered Dietitian</h3>
              <p className="text-muted-foreground text-xs xs:text-sm">Licensed with HPCSA & HCPC</p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-3 xs:p-4 text-center hover:shadow-lg transition-all">
              <div className="inline-flex items-center justify-center w-8 h-8 xs:w-10 xs:h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl mb-2 xs:mb-3">
                <Clock className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
              </div>
              <h3 className="text-card-foreground font-bold text-sm xs:text-base mb-1 xs:mb-2">8+ Years Experience</h3>
              <p className="text-muted-foreground text-xs xs:text-sm">Clinical practice & private consulting</p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-3 xs:p-4 text-center hover:shadow-lg transition-all xs:col-span-2 md:col-span-1">
              <div className="inline-flex items-center justify-center w-8 h-8 xs:w-10 xs:h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl mb-2 xs:mb-3">
                <Users className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
              </div>
              <h3 className="text-card-foreground font-bold text-sm xs:text-base mb-1 xs:mb-2">500+ Clients Helped</h3>
              <p className="text-muted-foreground text-xs xs:text-sm">95% report sustainable progress</p>
            </div>
          </div>

          {/* Approach Section */}
          <div className="bg-card border border-border rounded-2xl p-3 xs:p-4 sm:p-6 mb-4 xs:mb-6 sm:mb-8">
            <h2 className="text-lg xs:text-xl font-bold text-card-foreground text-center mb-3 xs:mb-4 sm:mb-6">Our Approach</h2>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 xs:gap-4 sm:gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 xs:w-12 xs:h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl mb-2 xs:mb-3">
                  <Heart className="h-5 w-5 xs:h-6 xs:w-6 text-white" />
                </div>
                <h3 className="text-card-foreground font-bold text-base xs:text-lg mb-1 xs:mb-2">Compassionate</h3>
                <p className="text-muted-foreground text-sm xs:text-base leading-relaxed">No judgment, just support. We understand that everyone's journey is unique.</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 xs:w-12 xs:h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl mb-2 xs:mb-3">
                  <Target className="h-5 w-5 xs:h-6 xs:w-6 text-white" />
                </div>
                <h3 className="text-card-foreground font-bold text-base xs:text-lg mb-1 xs:mb-2">Practical</h3>
                <p className="text-muted-foreground text-sm xs:text-base leading-relaxed">Real strategies for real life. We focus on actionable steps that fit your routine.</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 xs:w-12 xs:h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl mb-2 xs:mb-3">
                  <Smile className="h-5 w-5 xs:h-6 xs:w-6 text-white" />
                </div>
                <h3 className="text-card-foreground font-bold text-base xs:text-lg mb-1 xs:mb-2">Sustainable</h3>
                <p className="text-muted-foreground text-sm xs:text-base leading-relaxed">Habits that actually stick. We help you build lasting changes.</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-3 xs:p-4 sm:p-6 border border-primary/20">
            <h3 className="text-lg xs:text-xl font-bold text-foreground mb-2 xs:mb-3">Ready to Start Your Journey?</h3>
            <p className="text-muted-foreground mb-4 xs:mb-6 max-w-2xl mx-auto text-sm xs:text-base">
              Take the first step towards better health with a personalized nutrition consultation.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 xs:gap-3 justify-center">
              <Link href="/appointment">
                <Button size="lg" className="px-6 xs:px-8 py-2 xs:py-3 text-sm xs:text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transform hover:scale-105 border-2 border-primary/20">
                  Book Consultation
                  <ArrowRight className="ml-2 h-4 w-4 xs:h-5 xs:w-5" />
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="outline" size="lg" className="px-6 xs:px-8 py-2 xs:py-3 text-sm xs:text-base font-semibold border-2 bg-primary/5 hover:bg-primary/10 transition-all duration-300 transform hover:scale-105">
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