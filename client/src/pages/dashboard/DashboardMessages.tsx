import { MessageThread } from "@/components/dashboard/MessageThread";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function DashboardMessages() {
  return (
    <div className="min-h-[calc(100vh-8rem)] bg-background">
      <div className="container mx-auto px-3 sm:px-6 px-safe py-2 h-full flex flex-col">
        {/* Compact Header with Back Navigation */}
        <div className="flex items-center gap-2 sm:gap-4 mb-2 flex-shrink-0">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="sm:hidden h-8 w-8 p-0" title="Back">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/dashboard" className="hidden sm:block">
            <Button variant="ghost" size="sm" className="items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-base sm:text-lg font-bold">Messages</h1>
            <p className="text-[11px] sm:text-xs text-muted-foreground">
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
