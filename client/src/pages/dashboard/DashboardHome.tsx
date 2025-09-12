import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { FloatingOrganic, DoodleConnector } from "@/components/ui/PageTransition";

export default function DashboardHome() {
  return (
    <div className="dashboard-viewport relative -mt-28 pt-28" style={{
      backgroundImage: 'url("/backbanana.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      minHeight: '100vh'
    }}>
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
