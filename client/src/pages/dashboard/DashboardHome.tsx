import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { PreEvaluationBanner } from "@/components/dashboard/PreEvaluationBanner";

export default function DashboardHome() {
  return (
    <div className="min-h-screen py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <PreEvaluationBanner />
        <DashboardOverview />
      </div>
    </div>
  );
}
