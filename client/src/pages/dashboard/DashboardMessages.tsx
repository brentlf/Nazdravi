import { MessageThread } from "@/components/dashboard/MessageThread";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function DashboardMessages() {
  return (
    <div className="h-[calc(100vh-8rem)] bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6 py-4 h-full flex flex-col">
        {/* Compact Header with Back Navigation */}
        <div className="flex items-center gap-4 mb-4 flex-shrink-0">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Messages</h1>
            <p className="text-sm text-muted-foreground">
              Chat with your nutritionist
            </p>
          </div>
        </div>

        {/* Main Content - Message Thread */}
        <div className="flex-1 min-h-0">
          <MessageThread />
        </div>
      </div>
    </div>
  );
}
