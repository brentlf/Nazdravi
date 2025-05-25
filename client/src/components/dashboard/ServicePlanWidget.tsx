import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Calendar, CreditCard, Zap } from "lucide-react";
import { Link } from "wouter";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { where, orderBy, limit } from "firebase/firestore";
import type { User, Invoice } from "@/shared/firebase-schema";

interface ServicePlanWidgetProps {
  user: User | null;
}

export default function ServicePlanWidget({ user }: ServicePlanWidgetProps) {
  // Fetch user's invoices based on their service plan
  const { data: invoices } = useFirestoreCollection<Invoice>("invoices", [
    where("userId", "==", user?.uid || ""),
    orderBy("createdAt", "desc"),
    limit(10)
  ]);

  if (!user) return null;

  const isCompleteProgramUser = user.servicePlan === 'complete-program';

  // Filter invoices based on service plan
  const relevantInvoices = invoices?.filter(invoice => {
    if (isCompleteProgramUser) {
      return invoice.invoiceType === 'subscription';
    } else {
      return invoice.invoiceType === 'session' || !invoice.invoiceType;
    }
  }) || [];

  const pendingInvoices = relevantInvoices.filter(invoice => invoice.status === 'pending');
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // For complete program users, check if current month's invoice exists
  const currentMonthInvoice = isCompleteProgramUser 
    ? relevantInvoices.find(invoice => 
        invoice.subscriptionMonth === currentMonth && 
        invoice.subscriptionYear === currentYear
      )
    : null;

  const getServicePlanBadge = () => {
    if (isCompleteProgramUser) {
      return (
        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <Crown className="w-3 h-3 mr-1" />
          Complete Program
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="text-blue-600 border-blue-600">
          <Zap className="w-3 h-3 mr-1" />
          Pay As You Go
        </Badge>
      );
    }
  };

  const getStatusMessage = () => {
    if (isCompleteProgramUser) {
      if (!currentMonthInvoice) {
        return {
          message: "Monthly invoice pending generation",
          type: "warning" as const
        };
      } else if (currentMonthInvoice.status === 'pending') {
        return {
          message: "Monthly payment due",
          type: "error" as const
        };
      } else if (currentMonthInvoice.status === 'paid') {
        return {
          message: "Monthly subscription active",
          type: "success" as const
        };
      }
    } else {
      if (pendingInvoices.length > 0) {
        return {
          message: `${pendingInvoices.length} session payment${pendingInvoices.length > 1 ? 's' : ''} pending`,
          type: "error" as const
        };
      } else {
        return {
          message: "All sessions paid up to date",
          type: "success" as const
        };
      }
    }
    return { message: "Status unknown", type: "warning" as const };
  };

  const status = getStatusMessage();

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            Service Plan & Billing
          </CardTitle>
          {getServicePlanBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            status.type === 'success' ? 'bg-green-500' :
            status.type === 'error' ? 'bg-red-500' : 'bg-yellow-500'
          }`} />
          <span className={`text-sm font-medium ${
            status.type === 'success' ? 'text-green-700 dark:text-green-300' :
            status.type === 'error' ? 'text-red-700 dark:text-red-300' : 
            'text-yellow-700 dark:text-yellow-300'
          }`}>
            {status.message}
          </span>
        </div>

        {/* Plan Details */}
        <div className="space-y-2">
          {isCompleteProgramUser ? (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Billing Cycle:</span>
                <span className="font-medium">Monthly</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Consultations:</span>
                <span className="font-medium text-green-600">Unlimited</span>
              </div>
              {currentMonthInvoice && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">This Month:</span>
                  <span className="font-medium">€{currentMonthInvoice.amount.toFixed(2)}</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Billing Model:</span>
                <span className="font-medium">Per Session</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Pending Payments:</span>
                <span className="font-medium">{pendingInvoices.length}</span>
              </div>
              {pendingInvoices.length > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Due:</span>
                  <span className="font-medium text-red-600">
                    €{pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {pendingInvoices.length > 0 && (
            <Button asChild size="sm" className="flex-1">
              <Link href="/dashboard/invoices">
                <CreditCard className="w-4 h-4 mr-1" />
                Pay Now
              </Link>
            </Button>
          )}
          
          {!isCompleteProgramUser && (
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href="/dashboard/profile">
                <Crown className="w-4 h-4 mr-1" />
                Upgrade
              </Link>
            </Button>
          )}

          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/invoices">
              <Calendar className="w-4 h-4 mr-1" />
              History
            </Link>
          </Button>
        </div>

        {/* Upgrade Benefits for Pay-as-you-go */}
        {!isCompleteProgramUser && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-lg p-3 mt-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Complete Program Benefits:
            </h4>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>✓ Unlimited consultations</li>
              <li>✓ Priority booking</li>
              <li>✓ Monthly billing (no per-session charges)</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}