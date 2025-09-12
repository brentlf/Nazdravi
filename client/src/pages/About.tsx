import { Heart, Target, Smile, Stethoscope, ArrowRight, Award, Users, Clock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function About() {
  return (
    <div className="page-wrapper -mt-28 pt-28 relative">
      {/* Background using the reference image */}
      <div 
        className="fixed inset-0 w-full h-full z-0"
        style={{
          backgroundImage: 'url("/nazdravi.nl%20(1).png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minHeight: '100vh'
        }}
      />
      {/* Main content section */}
      <section className="page-content p-3 sm:p-4 lg:p-6 relative z-10">
        <div className="max-w-6xl mx-auto w-full">
          {/* Header Section - Split Layout */}
          <div className="relative mb-2 xs:mb-3 sm:mb-4">
            
            
            {/* Description text positioned below the main content */}
            <div className="text-center">
              <p className="text-lg xs:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed font-medium" style={{fontFamily: 'Calibri, sans-serif', letterSpacing: '0.02em'}}>
                I'm a nutrition practice that believes healthy eating should be simple, sustainable, and actually work for your real life.
              </p>
            </div>
          </div>

          {/* Credentials Grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2 xs:gap-3 sm:gap-4 mb-2 xs:mb-3 sm:mb-4">
              <div className="border-2 border-white/30 rounded-xl p-2 xs:p-3 sm:p-4 text-center hover:shadow-lg transition-all flex flex-col items-center justify-center min-h-[120px] bg-white/10 backdrop-blur-none">
              <div className="inline-flex items-center justify-center w-8 h-8 xs:w-10 xs:h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl mb-2 xs:mb-3">
                <Award className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
              </div>
                      <h3 className="text-white font-bold text-2xl xs:text-3xl mb-1 xs:mb-2" style={{fontFamily: 'The Seasons, serif', letterSpacing: '-0.01em'}}>Registered Dietitian</h3>
              <p className="text-white/90 text-base xs:text-lg leading-relaxed" style={{fontFamily: 'Calibri, sans-serif', letterSpacing: '0.02em'}}>Licensed with HPCSA & HCPC</p>
            </div>
            
              <div className="border-2 border-white/30 rounded-xl p-2 xs:p-3 sm:p-4 text-center hover:shadow-lg transition-all flex flex-col items-center justify-center min-h-[120px] bg-white/10 backdrop-blur-none">
              <div className="inline-flex items-center justify-center w-8 h-8 xs:w-10 xs:h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl mb-2 xs:mb-3">
                <Heart className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
              </div>
                      <h3 className="text-white font-bold text-2xl xs:text-3xl mb-1 xs:mb-2" style={{fontFamily: 'The Seasons, serif', letterSpacing: '-0.01em'}}>Holistic Approach</h3>
              <p className="text-white/90 text-base xs:text-lg leading-relaxed" style={{fontFamily: 'Calibri, sans-serif', letterSpacing: '0.02em'}}>With over 10 years of experience as a dietitian, I provide evidence-based advice tailored to each individual's needs. My approach is holistic, focusing not only on nutrition but also on lifestyle, balance, and long-term well-being.</p>
            </div>
            
            <div className="border-2 border-white/30 rounded-xl p-3 xs:p-4 sm:p-5 text-center hover:shadow-lg transition-all xs:col-span-2 md:col-span-1 flex flex-col items-center justify-center min-h-[120px] bg-white/10 backdrop-blur-none">
              <div className="inline-flex items-center justify-center w-8 h-8 xs:w-10 xs:h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl mb-2 xs:mb-3">
                <Globe className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
              </div>
                      <h3 className="text-white font-bold text-2xl xs:text-3xl mb-1 xs:mb-2" style={{fontFamily: 'The Seasons, serif', letterSpacing: '-0.01em'}}>Global Perspective</h3>
              <p className="text-white/90 text-base xs:text-lg leading-relaxed" style={{fontFamily: 'Calibri, sans-serif', letterSpacing: '0.02em'}}>Having lived in different parts of the world, I bring a global perspective to my work, drawing on diverse cultures, food traditions, and cuisines. This experience allows me to create practical and culturally sensitive solutions that support health whilst celebrating the joy of food.</p>
            </div>
          </div>

          {/* Approach Section */}
            <div className="border-2 border-white/30 rounded-2xl p-2 xs:p-3 sm:p-4 mb-2 xs:mb-3 sm:mb-4 bg-white/10 backdrop-blur-none">
            <h2 className="text-xl xs:text-2xl font-bold text-white text-center mb-2 xs:mb-3" style={{fontFamily: 'The Seasons, serif', letterSpacing: '-0.01em'}}>My Approach</h2>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 xs:gap-3 sm:gap-4">
              <div className="text-center flex flex-col items-center justify-center min-h-[100px]">
                <div className="inline-flex items-center justify-center w-8 h-8 xs:w-10 xs:h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl mb-2 xs:mb-3">
                  <Heart className="h-4 w-4 xs:h-5 xs:w-5 text-white" />
                </div>
                <h3 className="text-white font-bold text-2xl xs:text-3xl mb-1 xs:mb-2" style={{fontFamily: 'The Seasons, serif', letterSpacing: '-0.01em'}}>Compassionate</h3>
                <p className="text-white/90 text-base xs:text-lg leading-relaxed" style={{fontFamily: 'Calibri, sans-serif', letterSpacing: '0.02em'}}>No judgement, just support. I understand that everyone's journey is unique.</p>
              </div>
              
              <div className="text-center flex flex-col items-center justify-center min-h-[100px]">
                <div className="inline-flex items-center justify-center w-8 h-8 xs:w-10 xs:h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl mb-2 xs:mb-3">
                  <Target className="h-4 w-4 xs:h-5 xs:w-5 text-white" />
                </div>
                <h3 className="text-white font-bold text-2xl xs:text-3xl mb-1 xs:mb-2" style={{fontFamily: 'The Seasons, serif', letterSpacing: '-0.01em'}}>Practical</h3>
                <p className="text-white/90 text-base xs:text-lg leading-relaxed" style={{fontFamily: 'Calibri, sans-serif', letterSpacing: '0.02em'}}>Real strategies for real life. I focus on actionable steps that fit your routine.</p>
              </div>
              
              <div className="text-center flex flex-col items-center justify-center min-h-[100px]">
                <div className="inline-flex items-center justify-center w-8 h-8 xs:w-10 xs:h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl mb-2 xs:mb-3">
                  <Smile className="h-4 w-4 xs:h-5 xs:w-5 text-white" />
                </div>
                <h3 className="text-white font-bold text-2xl xs:text-3xl mb-1 xs:mb-2" style={{fontFamily: 'The Seasons, serif', letterSpacing: '-0.01em'}}>Sustainable</h3>
                <p className="text-white/90 text-base xs:text-lg leading-relaxed" style={{fontFamily: 'Calibri, sans-serif', letterSpacing: '0.02em'}}>Habits that actually stick. I help you build lasting changes.</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="relative text-center bg-gradient-to-br from-yellow-50/95 to-orange-50/95 border border-orange-200 rounded-2xl p-2 xs:p-3 sm:p-4 flex flex-col items-center justify-center min-h-[150px] mb-4 xs:mb-6 sm:mb-8 -mt-2 xs:-mt-3">
            {/* "ABOUT" text positioned at bottom left next to journey box */}
            <div className="absolute -left-88 bottom-4">
              <div className="font-medium uppercase leading-none animate-fadeInUp" 
                   style={{
                     fontFamily: 'Calibri, sans-serif', 
                     letterSpacing: '0.02em', 
                     fontSize: 'clamp(3.5rem, 6vw, 8rem)',
                     color: '#FF7F50',
                     textShadow: '3px 3px 0px #8B0000, -1px -1px 0px #8B0000, 1px -1px 0px #8B0000, -1px 1px 0px #8B0000, 2px 2px 4px rgba(0,0,0,0.5)',
                     filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
                     animationDelay: '0.5s',
                     animationFillMode: 'both'
                   }}>
                ABOUT
              </div>
            </div>
            <h3 className="text-2xl xs:text-3xl font-bold text-card-foreground mb-2 xs:mb-3" style={{fontFamily: 'The Seasons, serif', letterSpacing: '-0.01em'}}>Ready to Start Your Journey?</h3>
            <p className="text-muted-foreground mb-3 xs:mb-4 max-w-2xl mx-auto text-lg xs:text-xl leading-relaxed" style={{fontFamily: 'Calibri, sans-serif', letterSpacing: '0.02em'}}>
              Take the first step towards better health with a personalised nutrition consultation.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 xs:gap-3 justify-center">
              <Link href="/appointment">
                <Button size="lg" className="px-6 xs:px-8 py-2 xs:py-3 text-base xs:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transform hover:scale-105 border-2 border-orange-300 text-white">
                  Book Consultation
                  <ArrowRight className="ml-2 h-4 w-4 xs:h-5 xs:w-5" />
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="outline" size="lg" className="px-6 xs:px-8 py-2 xs:py-3 text-base xs:text-lg font-semibold border-2 border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 transition-all duration-300 transform hover:scale-105">
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