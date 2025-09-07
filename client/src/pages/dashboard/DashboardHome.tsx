import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { FloatingOrganic, DoodleConnector } from "@/components/ui/PageTransition";

export default function DashboardHome() {
  return (
    <div className="viewport-fit bg-gradient-to-br from-background via-background to-muted/10 relative">
      <div className="adaptive-content">

        {/* Main dashboard content with flex-1 to fill remaining space */}
        <div className="content-section">
          <DashboardOverview />
        </div>
      </div>
      
      {/* Floating background elements - hidden on mobile to save space */}
      <FloatingOrganic className="hidden xs:block absolute top-20 -right-20 opacity-15" size="large" delay={1} />
      <FloatingOrganic className="hidden xs:block absolute bottom-20 -left-20 opacity-15" size="large" delay={3} />
      <FloatingOrganic className="hidden xs:block absolute top-1/2 -left-16 opacity-10" size="medium" delay={2} />
    </div>
  );
}
