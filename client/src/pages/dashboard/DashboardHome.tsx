import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { FloatingOrganic, DoodleConnector } from "@/components/ui/PageTransition";

export default function DashboardHome() {
  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-background to-muted/30 country-texture relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Header with organic design */}
        <div className="text-center mb-6 relative">
          <div className="doodle-arrow mb-2">
            <h1 className="font-display text-2xl md:text-3xl mb-2 text-foreground handwritten-accent">
              Welcome to Your Wellness Journey
            </h1>
          </div>
          <p className="serif-body text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Track your progress, manage appointments, and connect with your nutrition goals
          </p>
          
          {/* Connecting doodle */}
          <DoodleConnector direction="down" className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-24" />
        </div>

        <DashboardOverview />
      </div>
      
      {/* Floating background elements */}
      <FloatingOrganic className="absolute top-20 -right-20 opacity-15" size="large" delay={1} />
      <FloatingOrganic className="absolute bottom-20 -left-20 opacity-15" size="large" delay={3} />
      <FloatingOrganic className="absolute top-1/2 -left-16 opacity-10" size="medium" delay={2} />
    </div>
  );
}
