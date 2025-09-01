import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { FloatingOrganic, DoodleConnector } from "@/components/ui/PageTransition";

export default function DashboardHome() {
  return (
    <div className="h-[calc(100vh-8rem)] bg-gradient-to-br from-background via-background to-muted/10 relative overflow-hidden">
      <div className="container mx-auto px-6 py-4 relative z-10 h-full flex flex-col">

        {/* Main dashboard content with flex-1 to fill remaining space */}
        <div className="flex-1 overflow-y-auto">
          <DashboardOverview />
        </div>
      </div>
      
      {/* Floating background elements */}
      <FloatingOrganic className="absolute top-20 -right-20 opacity-15" size="large" delay={1} />
      <FloatingOrganic className="absolute bottom-20 -left-20 opacity-15" size="large" delay={3} />
      <FloatingOrganic className="absolute top-1/2 -left-16 opacity-10" size="medium" delay={2} />
    </div>
  );
}
