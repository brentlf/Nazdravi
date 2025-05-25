import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { PreEvaluationBanner } from "@/components/dashboard/PreEvaluationBanner";
import { EmailAutomationSection } from "@/components/dashboard/EmailAutomationSection";

export default function DashboardHome() {
  return (
    <div className="min-h-screen py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <PreEvaluationBanner />
        <DashboardOverview />
        <div className="mt-8">
          <EmailAutomationSection />
        </div>
      </div>
    </div>
  );
}
