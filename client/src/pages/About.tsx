import { Heart, Target, Smile, Stethoscope, ArrowRight, Award, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function About() {
  return (
    <div className="min-h-screen pt-16 pb-safe">
      {/* Main content section */}
      <section className="px-4 sm:px-6 px-safe py-8">
        <div className="max-w-6xl mx-auto w-full">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
              <Stethoscope className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight text-foreground font-serif">
              About Nazdravi
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We're a nutrition practice that believes healthy eating should be simple, sustainable, and actually work for your real life.
            </p>
          </div>

          {/* Credentials Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-all">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl mb-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-card-foreground font-bold text-lg mb-2">Registered Dietitian</h3>
              <p className="text-muted-foreground">Licensed with HPCSA & HCPC</p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-all">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-card-foreground font-bold text-lg mb-2">8+ Years Experience</h3>
              <p className="text-muted-foreground">Clinical practice & private consulting</p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-all">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-card-foreground font-bold text-lg mb-2">500+ Clients Helped</h3>
              <p className="text-muted-foreground">95% report sustainable progress</p>
            </div>
          </div>

          {/* Approach Section */}
          <div className="bg-card border border-border rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-card-foreground text-center mb-8">Our Approach</h2>
            <div className="grid sm:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl mb-4">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-card-foreground font-bold text-lg mb-3">Compassionate</h3>
                <p className="text-muted-foreground leading-relaxed">No judgment, just support. We understand that everyone's journey is unique.</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl mb-4">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-card-foreground font-bold text-lg mb-3">Practical</h3>
                <p className="text-muted-foreground leading-relaxed">Real strategies for real life. We focus on actionable steps that fit your routine.</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl mb-4">
                  <Smile className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-card-foreground font-bold text-lg mb-3">Sustainable</h3>
                <p className="text-muted-foreground leading-relaxed">Habits that actually stick. We help you build lasting changes.</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-foreground mb-6">Ready to Start Your Journey?</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/appointment">
                <Button size="lg" className="px-8 py-3">
                  Book Consultation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="outline" size="lg" className="px-8 py-3">
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