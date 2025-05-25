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
    
    const programEndDate = new Date(currentUser.programEndDate);
    
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
        <Card className="border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Complete Program Expired
                  </h3>
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    Reverted to Pay As You Go
                  </Badge>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Your 3-month Complete Program ended on {programStatus.endDate?.toLocaleDateString() || 'Unknown date'}. 
                  You've been automatically switched back to Pay As You Go billing.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  Current Plan: Pay per session billing
                </div>
              </div>
              <div className="ml-6">
                <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Link href="/dashboard/profile">
                    <Crown className="w-4 h-4 mr-1" />
                    Renew Program
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
        <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Complete Program Active
                  </h3>
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Enjoy unlimited consultations and priority support. 
                  {programStatus?.isExpiring 
                    ? `Program expires in ${programStatus.daysRemaining} days.`
                    : `${programStatus?.daysRemaining} days remaining in your program.`
                  }
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-600 font-medium">✓</span>
                    <span className="text-gray-600 dark:text-gray-400">Unlimited consultations</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-600 font-medium">✓</span>
                    <span className="text-gray-600 dark:text-gray-400">Priority booking</span>
                  </div>
                </div>
              </div>
              <div className="ml-6 text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {programStatus?.daysRemaining}
                </div>
                <div className="text-sm text-gray-500">days left</div>
                {programStatus?.isExpiring && (
                  <Button asChild variant="outline" size="sm" className="mt-2">
                    <Link href="/dashboard/profile">
                      <Calendar className="w-4 h-4 mr-1" />
                      Extend
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
  } else {
    // Pay As You Go User Widget
    return (
      <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Pay As You Go Plan
                </h3>
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  Per Session
                </Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                You're currently on our flexible pay-per-session plan. 
                Upgrade to our Complete Program for unlimited consultations and exclusive benefits.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-blue-600 font-medium">✓</span>
                  <span className="text-gray-600 dark:text-gray-400">Flexible scheduling</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-blue-600 font-medium">✓</span>
                  <span className="text-gray-600 dark:text-gray-400">Pay per session</span>
                </div>
              </div>
            </div>
            <div className="ml-6">
              <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                <Link href="/dashboard/profile">
                  <ArrowUp className="w-4 h-4 mr-1" />
                  Upgrade to Complete
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Upgrade Benefits Preview */}
          <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Complete Program Benefits:
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <Crown className="w-3 h-3 inline mr-1 text-purple-500" />
                Unlimited consultations
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <Calendar className="w-3 h-3 inline mr-1 text-purple-500" />
                Priority booking
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-3 h-3 inline mr-1 text-purple-500" />
                Monthly billing
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <Clock className="w-3 h-3 inline mr-1 text-purple-500" />
                3-month program
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
}