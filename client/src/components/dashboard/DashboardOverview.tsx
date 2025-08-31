import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MessageCircle,
  TrendingDown,
  Droplets,
  FileText,
  Target,
  Clock,
  Users,
  Receipt,
  User,
} from "lucide-react";
import { Link } from "wouter";
import {
  FloatingOrganic,
  DoodleConnector,
} from "@/components/ui/PageTransition";
import { useAuth } from "@/contexts/AuthContext";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { Appointment, Message, Progress } from "@/types";
import type { Invoice } from "@shared/firebase-schema";
import ServicePlanStatusWidget from "./ServicePlanStatusWidget";
import SubscriptionBillingWidget from "./SubscriptionBillingWidget";
import { where, orderBy, limit, or } from "firebase/firestore";

export function DashboardOverview() {
  const { effectiveUser: user, isAdminViewingClient } = useAuth();

  // Single optimized query for appointments using OR conditions
  const { data: appointments, loading: appointmentsLoading, error: appointmentsError } = useFirestoreCollection<Appointment>(
    "appointments",
    user?.uid ? [
      or(
        where("userId", "==", user.uid),
        where("email", "==", user.email || "")
      ),
      orderBy("date", "desc"),
      limit(10)
    ] : [],
  );

  // Fetch messages from the user's chat room
  const chatRoom = user ? `${user.uid}_admin` : "";
  const { data: messages, loading: messagesLoading, error: messagesError } = useFirestoreCollection<Message>(
    "messages",
    chatRoom ? [where("chatRoom", "==", chatRoom), orderBy("createdAt", "desc"), limit(6)] : [],
  );

  // Fetch progress entries
  const { data: progressEntries, loading: progressLoading, error: progressError } = useFirestoreCollection<Progress>(
    "progress",
    user?.uid ? [where("userId", "==", user.uid), orderBy("createdAt", "desc"), limit(10)] : [],
  );

  // Fetch client's invoices
  const { data: invoices, loading: invoicesLoading, error: invoicesError } = useFirestoreCollection<Invoice>(
    "invoices",
    user?.uid ? [
      or(
        where("userId", "==", user.uid),
        where("clientEmail", "==", user.email || "")
      ),
      orderBy("createdAt", "desc"),
      limit(10)
    ] : [],
  );

  // Count unread messages (messages TO the user that haven't been read)
  const unreadCount = messages?.filter(message => 
    message.toUser === user?.uid && (message.read === false || message.read === undefined)
  )?.length || 0;

  // Process appointments data
  const processedAppointments = appointments?.map((apt) => ({
    ...apt,
    date: (apt.date as any)?.seconds
      ? new Date((apt.date as any).seconds * 1000).toISOString().split("T")[0]
      : apt.date,
    timeslot: apt.timeslot || (apt as any).time || "Time TBD",
  })) || [];

  const nextAppointment = processedAppointments[0];
  const latestProgress = progressEntries?.[0];
  const pendingInvoices = invoices?.filter((invoice) => invoice.status === "pending").length || 0;

  // Calculate weight change this month
  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonthEntries = progressEntries?.filter(
    (entry) => entry.date.startsWith(currentMonth) && entry.weightKg,
  ) || [];

  const weightChange = thisMonthEntries.length >= 2
    ? (thisMonthEntries[0].weightKg || 0) - (thisMonthEntries[thisMonthEntries.length - 1].weightKg || 0)
    : 0;

  // Handle loading states
  const isLoading = appointmentsLoading || messagesLoading || progressLoading || invoicesLoading;
  const hasErrors = appointmentsError || messagesError || progressError || invoicesError;

  if (isLoading) {
    return (
      <div className="space-y-8 relative">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (hasErrors) {
    return (
      <div className="space-y-8 relative">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-red-600 dark:text-red-300">
            There was an error loading your dashboard data. Please refresh the page or contact support if the problem persists.
          </p>
        </div>
      </div>
    );
  }

  const quickStats = [
    {
      title: "Next Appointment",
      value: nextAppointment
        ? new Date(nextAppointment.date).toLocaleDateString()
        : "None scheduled",
      subtitle: nextAppointment?.timeslot || "",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      action: nextAppointment ? "View Details" : "Book Now",
      href: "/dashboard/appointments",
    },
    {
      title: "Weight Progress",
      value:
        weightChange !== 0
          ? `${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)}kg`
          : "No data",
      subtitle: "This month",
      icon: TrendingDown,
      color: weightChange < 0 ? "text-green-600" : "text-gray-600",
      bgColor:
        weightChange < 0
          ? "bg-green-50 dark:bg-green-900/20"
          : "bg-gray-50 dark:bg-gray-800",
      action: "View Progress",
      href: "/dashboard/progress",
    },
    {
      title: "Water Today",
      value: latestProgress?.waterLitres
        ? `${latestProgress.waterLitres}L`
        : "0L",
      subtitle: "Goal: 2.5L",
      icon: Droplets,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      action: "Update",
      href: "/dashboard/progress",
    },
    {
      title: "Messages",
      value: unreadCount.toString(),
      subtitle: "Unread",
      icon: MessageCircle,
      color: "text-primary-600",
      bgColor: "bg-primary-50 dark:bg-primary-900/20",
      action: "View All",
      href: "/dashboard/messages",
    },
    {
      title: "Invoices",
      value: pendingInvoices.toString(),
      subtitle: "Pending Payment",
      icon: Receipt,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      action: "Pay Now",
      href: "/dashboard/invoices",
    },
  ];

  const quickActions = [
    {
      title: "Book Appointment",
      description: "Schedule your next consultation",
      icon: Calendar,
      href: "/dashboard/appointments",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Send Message",
      description: "Ask your nutritionist a question",
      icon: MessageCircle,
      href: "/dashboard/messages",
      color: "bg-primary-500 hover:bg-primary-600",
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      title: "View Plan",
      description: "Access your nutrition plan",
      icon: FileText,
      href: "/dashboard/plan",
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "Profile Settings",
      description: "Manage your account and health info",
      icon: User,
      href: "/dashboard/profile",
      color: "bg-gray-500 hover:bg-gray-600",
    },
  ];

  return (
    <div className="space-y-6 relative">
      {/* Welcome Section with Organic Design */}
      <div className="relative overflow-hidden mediterranean-card p-6 text-white bg-gradient-to-br from-primary to-accent warm-glow">
        {isAdminViewingClient && (
          <div className="mb-4 bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-3 floating-element">
            <p className="text-sm text-yellow-100">
              Admin View: You are viewing {user?.name}'s dashboard
            </p>
          </div>
        )}

        <div className="relative z-10">
          <div className="doodle-arrow mb-1">
            <h1 className="font-display text-2xl font-bold mb-1 handwritten-accent">
              Welcome back, {user?.name}!
            </h1>
          </div>
          <p className="serif-body text-lg text-primary-100 leading-relaxed">
            Here's your nutrition journey overview
          </p>
        </div>

        {/* Organic background decorations */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent blob-shape"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-accent/20 to-transparent blob-shape"></div>

        {/* Floating elements */}
        <FloatingOrganic
          className="absolute -top-4 -right-4 opacity-20"
          size="medium"
          delay={1}
        />
      </div>

      {/* Service Plan Status Widget */}
      <ServicePlanStatusWidget user={user} />

      {/* Subscription Billing Widget for Complete Program Users */}
      <SubscriptionBillingWidget user={user} />

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow duration-200"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm text-muted-foreground">
                    {stat.title}
                  </h3>
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bgColor}`}
                  >
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">
                    {stat.subtitle}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                    className="w-full"
                  >
                    <Link href={stat.href}>{stat.action}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6 lg:items-stretch">
        {/* Recent Messages */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Recent Messages
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/messages">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="h-64">
              {messages && messages.length > 0 ? (
                <div className="h-full overflow-y-auto space-y-4 pr-2">
                  {messages.slice(0, 6).map((message) => (
                    <div
                      key={message.id}
                      className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {message.fromUser === user?.uid
                            ? "You"
                            : "Nutritionist"}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {message.text}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No messages yet</p>
                    <Button size="sm" className="mt-4" asChild>
                      <Link href="/dashboard/messages">Start Conversation</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <div className="h-full overflow-y-auto space-y-1 pr-1">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start h-auto p-4"
                      asChild
                    >
                      <Link href={action.href}>
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${action.color} relative`}
                        >
                          <Icon className="w-4 h-4 text-white" />
                          {action.badge && (
                            <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                              {action.badge}
                            </div>
                          )}
                        </div>
                        <div className="text-left flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{action.title}</p>
                            {action.badge && (
                              <Badge variant="destructive" className="ml-2 text-xs">
                                {action.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                      </Link>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* This Week's Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            This Week's Focus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                Hydration
              </h4>
              <p className="text-sm text-blue-600 dark:text-blue-300 mb-2">
                Aim for 2.5L daily
              </p>
              <Badge
                variant="outline"
                className="border-blue-200 text-blue-700 text-xs"
              >
                Daily Goal
              </Badge>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-1">
                Exercise
              </h4>
              <p className="text-sm text-green-600 dark:text-green-300 mb-2">
                30 min walks 3x week
              </p>
              <Badge
                variant="outline"
                className="border-green-200 text-green-700 text-xs"
              >
                Weekly Goal
              </Badge>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-1">
                Meal Prep
              </h4>
              <p className="text-sm text-purple-600 dark:text-purple-300 mb-2">
                Prep Sunday meals
              </p>
              <Badge
                variant="outline"
                className="border-purple-200 text-purple-700 text-xs"
              >
                Weekly Task
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
