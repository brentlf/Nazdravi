import { Heart, Target, Smile, Stethoscope, ArrowRight, Award, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function About() {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Image - Full Screen */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: `url(/OrangesBG.jpg)`,
        }}
      />
      {/* Dark overlay - Full Screen */}
      <div className="fixed inset-0 bg-black/40 -z-10" />

      {/* Content Container - Full height with proper spacing for footer overlay */}
      <div className="min-h-screen pt-16 pb-20">
        {/* Main content section */}
        <section className="px-4 py-4">
          <div className="max-w-6xl mx-auto w-full">
            {/* Header Section */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-white/15 backdrop-blur-sm rounded-full mb-3">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 leading-tight text-white font-serif">
                About Nazdravi
              </h1>
              <p className="text-sm text-white/90 max-w-xl mx-auto leading-relaxed">
                We're a nutrition practice that believes healthy eating should be simple, sustainable, and actually work for your real life.
              </p>
            </div>

            {/* Credentials Grid */}
            <div className="grid md:grid-cols-3 gap-3 mb-6">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/25 text-center hover:bg-white/20 transition-colors">
                <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl mb-2">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-white font-bold text-xs mb-1">Registered Dietitian</h3>
                <p className="text-white/80 text-xs">Licensed with HPCSA & HCPC</p>
              </div>
              
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/25 text-center hover:bg-white/20 transition-colors">
                <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl mb-2">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-white font-bold text-xs mb-1">8+ Years Experience</h3>
                <p className="text-white/80 text-xs">Clinical practice & private consulting</p>
              </div>
              
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/25 text-center hover:bg-white/20 transition-colors">
                <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl mb-2">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-white font-bold text-xs mb-1">500+ Clients Helped</h3>
                <p className="text-white/80 text-xs">95% report sustainable progress</p>
              </div>
            </div>

            {/* Approach Section */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 mb-6">
              <h2 className="text-lg font-bold text-white text-center mb-4">Our Approach</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl mb-2">
                    <Heart className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-white font-bold text-xs mb-2">Compassionate</h3>
                  <p className="text-white/80 text-xs leading-relaxed">No judgment, just support. We understand that everyone's journey is unique.</p>
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl mb-2">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-white font-bold text-xs mb-2">Practical</h3>
                  <p className="text-white/80 text-xs leading-relaxed">Real strategies for real life. We focus on actionable steps that fit your routine.</p>
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl mb-2">
                    <Smile className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-white font-bold text-xs mb-2">Sustainable</h3>
                  <p className="text-white/80 text-xs leading-relaxed">Habits that actually stick. We help you build lasting changes.</p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center">
              <h3 className="text-base font-bold text-white mb-3">Ready to Start Your Journey?</h3>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/appointment">
                  <Button size="sm" className="bg-white text-gray-900 hover:bg-gray-100 px-4 py-2 text-xs font-semibold">
                    Book Consultation
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
                <Link href="/services">
                  <Button variant="outline" size="sm" className="px-4 py-2 border-white/50 text-white hover:bg-white/20 text-xs font-semibold">
                    View Services
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}