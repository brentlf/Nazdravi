import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Calendar, Clock, ArrowUp, CheckCircle, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { useFirestoreDocument } from "@/hooks/useFirestore";
import type { User } from "@shared/firebase-schema";

interface ServicePlanStatusWidgetProps {
  user: User | null;
}

export default function ServicePlanStatusWidget({ user }: ServicePlanStatusWidgetProps) {
  // Fetch fresh user data from Firebase to get real-time updates
  const { data: freshUserData } = useFirestoreDocument<User>("users", user?.uid || "");
  
  // Use fresh data if available, fallback to passed user data
  const currentUser = freshUserData || user;
  
  if (!currentUser) return null;

  const isCompleteProgramUser = currentUser.servicePlan === 'complete-program';
  const hasPlannedDowngrade = currentUser.plannedDowngrade === true;
  
  // Check for planned downgrade first
  if (hasPlannedDowngrade && isCompleteProgramUser) {
    const downgradeDate = currentUser.downgradeEffectiveDate && typeof currentUser.downgradeEffectiveDate === 'object' && 'toDate' in currentUser.downgradeEffectiveDate ? 
      (currentUser.downgradeEffectiveDate as any).toDate() : 
      new Date(currentUser.downgradeEffectiveDate as string);

    return (
      <Card className="border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 h-full">
        <CardContent className="p-3 h-full">
          <div className="flex items-start justify-between h-full">
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-1">
                <Clock className="w-3 h-3 text-amber-600" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Downgrade Scheduled
                </h3>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">
                Changes on {downgradeDate ? downgradeDate.toLocaleDateString() : 'next billing'}
              </p>
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-2.5 h-2.5 text-green-600" />
                Benefits active
              </div>
            </div>
            <div className="ml-2">
              <Button asChild variant="outline" size="sm" className="text-xs h-6">
                <Link href="/dashboard/profile">
                  Manage
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Get program status based on actual database dates
  const getProgramStatus = () => {
    if (!isCompleteProgramUser) return null;
    
    // Check if we have program dates from the database
    if (!currentUser.programStartDate || !currentUser.programEndDate) {
      // If no dates are set but user has complete program, it means they just selected it
      // but the database hasn't been updated yet with dates
      return {
        status: 'pending',
        daysRemaining: 90, // Default 3 months
        endDate: null,
        isExpiring: false
      };
    }
    
    // Handle Firebase Timestamp objects properly
    const programEndDate = currentUser.programEndDate && typeof currentUser.programEndDate === 'object' && 'toDate' in currentUser.programEndDate ? 
      (currentUser.programEndDate as any).toDate() : 
      new Date(currentUser.programEndDate as string);
    
    // Check if the date is valid
    if (isNaN(programEndDate.getTime())) {
      return {
        status: 'pending',
        daysRemaining: 90,
        endDate: null,
        isExpiring: false
      };
    }
    
    const now = new Date();
    const daysRemaining = Math.ceil((programEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining > 0) {
      return {
        status: 'active',
        daysRemaining,
        endDate: programEndDate,
        isExpiring: daysRemaining <= 14 // Show warning if less than 2 weeks
      };
    } else {
      return {
        status: 'expired',
        daysRemaining: 0,
        endDate: programEndDate,
        isExpiring: false
      };
    }
  };

  const programStatus = getProgramStatus();

  if (isCompleteProgramUser) {
    // Complete Program User Widget
    if (programStatus?.status === 'expired') {
      return (
        <Card className="border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 h-full">
          <CardContent className="p-2">
            <div className="flex items-start justify-between h-full">
              <div className="flex-1">
                <div className="flex items-center gap-1 mb-1">
                  <AlertTriangle className="w-3 h-3 text-orange-600" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Program Expired
                  </h3>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">
                  Ended {programStatus.endDate?.toLocaleDateString() || 'recently'}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <Clock className="w-2.5 h-2.5" />
                  Pay per session
                </div>
              </div>
              <div className="ml-2">
                <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-6" size="sm">
                  <Link href="/dashboard/profile">
                    <Crown className="w-2.5 h-2.5 mr-1" />
                    Renew
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    } else {
      // Active Complete Program
      return (
        <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 h-full">
                  <CardContent className="p-3 h-full">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Complete Program
                </h3>
              </div>
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                <Crown className="w-2.5 h-2.5 mr-1" />
                Active
              </Badge>
            </div>
            
            <div className="flex-1 flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  {programStatus?.isExpiring 
                    ? `Expires in ${programStatus.daysRemaining} days`
                    : `${programStatus?.daysRemaining} days remaining`
                  }
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="text-green-600 font-medium">✓</span>
                  <span>Unlimited consultations & priority support</span>
                </div>
              </div>
              
              <div className="ml-4 text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {programStatus?.daysRemaining}
                </div>
                <div className="text-xs text-gray-500 mb-2">days left</div>
                {programStatus?.isExpiring && (
                  <Button asChild variant="outline" size="sm" className="text-xs h-6">
                    <Link href="/dashboard/profile">
                      Extend
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
          </CardContent>
        </Card>
      );
    }
  } else {
    // Pay As You Go User Widget
    return (
      <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 h-full">
        <CardContent className="p-2 h-full flex flex-col">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-1">
                <CheckCircle className="w-3 h-3 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Pay As You Go
                </h3>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">
                Flexible pay-per-session plan
              </p>
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <span className="text-blue-600 font-medium">✓</span>
                <span>Pay per session</span>
              </div>
            </div>
            <div className="ml-2">
              <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs h-6" size="sm">
                <Link href="/dashboard/profile">
                  <ArrowUp className="w-2.5 h-2.5 mr-1" />
                  Upgrade
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
}