import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { FloatingOrganic, DoodleConnector } from "@/components/ui/PageTransition";

export default function DashboardHome() {
  return (
    <div className="dashboard-page">
      <div className="dashboard-content">
        <DashboardOverview />
      </div>
      
      {/* Subtle background elements - hidden on mobile to save space */}
      <FloatingOrganic className="hidden lg:block absolute top-20 -right-20 opacity-5" size="large" delay={1} />
      <FloatingOrganic className="hidden lg:block absolute bottom-20 -left-20 opacity-5" size="large" delay={3} />
    </div>
  );
}
