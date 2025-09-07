import { useState, useEffect } from "react";
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
  Crown,
  Mail,
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
  const [viewportHeight, setViewportHeight] = useState(0);
  const [isShortViewport, setIsShortViewport] = useState(false);
  
  // Detect viewport height
  useEffect(() => {
    const checkViewport = () => {
      const height = window.innerHeight;
      setViewportHeight(height);
      setIsShortViewport(height < 600); // Short viewport threshold
    };
    
    checkViewport();
    window.addEventListener('resize', checkViewport);
    
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

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
      icon: Mail,
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

  const additionalActions = [
    {
      title: "Calendar",
      description: "View your schedule",
      icon: Calendar,
      href: "/dashboard/calendar",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Documents",
      description: "Your nutrition files",
      icon: FileText,
      href: "/dashboard/documents",
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
    {
      title: "Resources",
      description: "Helpful guides & tips",
      icon: Target,
      href: "/dashboard/resources",
      color: "bg-orange-500 hover:bg-orange-600",
    },
  ];

  return (
    <div className="space-y-2 relative viewport-fit adaptive-content">
      {/* Compact Welcome Section */}
      <div className="relative overflow-hidden mediterranean-card p-2 xs:p-3 sm:p-4 text-white bg-gradient-to-br from-primary to-accent warm-glow flex-shrink-0">
        {isAdminViewingClient && (
          <div className="mb-2 xs:mb-3 bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-1.5 xs:p-2 floating-element">
            <p className="text-xs xs:text-sm text-yellow-100">
              Admin View: You are viewing {user?.name}'s dashboard
            </p>
          </div>
        )}

        <div className="relative z-10">
          <div className="doodle-arrow mb-1">
            <h1 className="font-display text-base xs:text-lg font-bold mb-1 handwritten-accent h-short-heading">
              Welcome back, {user?.name}!
            </h1>
          </div>
          <p className="serif-body text-xs xs:text-sm text-primary-100 leading-relaxed h-short-text">
            Here's your nutrition journey overview
          </p>
        </div>

        {/* Organic background decorations */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent blob-shape"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-br from-accent/20 to-transparent blob-shape"></div>

        {/* Floating elements */}
        <FloatingOrganic
          className="absolute -top-4 -right-4 opacity-20"
          size="small"
          delay={1}
        />
      </div>

      {/* Optimized Grid Layout - Stats + Program Section */}
      <div className="grid lg:grid-cols-12 gap-2 flex-shrink-0">
        {/* Quick Stats - Takes up more space */}
        <div className="lg:col-span-8">
          <h3 className="text-sm font-semibold mb-1.5 flex items-center gap-2 text-muted-foreground">
            <Target className="w-4 h-4" />
            Quick Overview
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1 sm:gap-1.5">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon;
              
              // Dynamic height based on viewport height
              const getCardHeight = () => {
                if (isShortViewport) {
                  return "h-12 sm:h-14 md:h-16"; // Very compact for short viewports
                } else if (viewportHeight < 700) {
                  return "h-14 sm:h-16 md:h-18"; // Compact for medium viewports
                } else if (viewportHeight < 900) {
                  return "h-16 sm:h-18 md:h-20"; // Normal for medium-tall viewports
                } else {
                  return "h-18 sm:h-20 md:h-24 lg:h-28"; // Tall for large viewports
                }
              };

              const getHeaderHeight = () => {
                if (isShortViewport) {
                  return "h-3 sm:h-4";
                } else if (viewportHeight < 700) {
                  return "h-4 sm:h-5";
                } else if (viewportHeight < 900) {
                  return "h-4 sm:h-5 md:h-6";
                } else {
                  return "h-4 sm:h-5 md:h-6";
                }
              };

              const getIconSize = () => {
                if (isShortViewport) {
                  return "w-2.5 h-2.5 sm:w-3 sm:h-3";
                } else if (viewportHeight < 700) {
                  return "w-3 h-3 sm:w-3.5 sm:h-3.5";
                } else if (viewportHeight < 900) {
                  return "w-3 h-3 sm:w-4 sm:h-4 md:w-4 md:h-4";
                } else {
                  return "w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5";
                }
              };

              const getTextSize = () => {
                if (isShortViewport) {
                  return "text-xs sm:text-sm";
                } else if (viewportHeight < 700) {
                  return "text-sm sm:text-base";
                } else if (viewportHeight < 900) {
                  return "text-sm sm:text-lg";
                } else {
                  return "text-sm sm:text-lg md:text-xl";
                }
              };

              const getButtonHeight = () => {
                if (isShortViewport) {
                  return "h-4 sm:h-5";
                } else if (viewportHeight < 700) {
                  return "h-5 sm:h-6";
                } else if (viewportHeight < 900) {
                  return "h-5 sm:h-6 md:h-7";
                } else {
                  return "h-5 sm:h-6 md:h-8";
                }
              };

              return (
                <Card
                  key={index}
                  className={`group relative overflow-hidden bg-gradient-to-br from-card via-card/95 to-muted/30 border hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 ${getCardHeight()}`}
                >
                  <CardContent className="p-1.5 sm:p-3 flex flex-col h-full relative z-10">
                    {/* Dynamic Header - Height responsive */}
                    <div className={`flex items-center gap-1 ${getHeaderHeight()} flex-shrink-0`}>
                      <div className={`${getIconSize()} rounded-md flex items-center justify-center ${stat.bgColor} shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className={`${isShortViewport ? 'w-1 h-1 sm:w-1.5 sm:h-1.5' : viewportHeight < 700 ? 'w-1.5 h-1.5 sm:w-2 sm:h-2' : viewportHeight < 900 ? 'w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5' : 'w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5'} ${stat.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide leading-none truncate" title={stat.title}>
                          {stat.title}
                        </p>
                      </div>
                    </div>
                    
                    {/* Flexible Content Area - Takes remaining space */}
                    <div className="flex-1 flex flex-col justify-center py-1 sm:py-2">
                      <div className="text-center">
                        <p className={`${getTextSize()} font-bold text-foreground leading-none mb-0.5 sm:mb-1 transition-colors duration-300 group-hover:text-primary`}>
                          {stat.value}
                        </p>
                        {stat.subtitle && (
                          <p className="text-[9px] sm:text-xs text-muted-foreground leading-tight">
                            {stat.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Dynamic Button Area - Height responsive */}
                    <div className={`${getButtonHeight()} flex-shrink-0`}>
                      <Button 
                        size="sm" 
                        variant="default" 
                        asChild 
                        className="w-full h-full text-[9px] sm:text-xs font-medium bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300 shadow-sm"
                      >
                        <Link href={stat.href} className="flex items-center justify-center">{stat.action}</Link>
                      </Button>
                    </div>
                  </CardContent>
                  
                  {/* Subtle background decoration */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Card>
              );
            })}
          </div>
        </div>

        {/* Program Status - Matches Quick Overview height */}
        <div className="lg:col-span-4">
          <h3 className="text-sm font-semibold mb-1.5 flex items-center gap-2 text-muted-foreground">
            <Crown className="w-4 h-4" />
            Program Status
          </h3>
          <div className="h-24 sm:h-28 flex flex-col gap-1.5">
            <div className="flex-1">
              <ServicePlanStatusWidget user={user} />
            </div>
            {/* Only show billing widget for complete program users and make it very compact */}
            {user?.servicePlan === 'complete-program' && (
              <div className="h-12 flex-shrink-0">
                <SubscriptionBillingWidget user={user} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compact Main Content - Messages + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 flex-1 min-h-0">
        {/* Recent Messages */}
        <div className="lg:col-span-2 min-h-0">
          <Card className="h-full flex flex-col bg-gradient-to-br from-card via-card/95 to-muted/20 border hover:border-primary/20 transition-all duration-300 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 flex-shrink-0 bg-gradient-to-r from-muted/20 to-muted/10 rounded-t-lg border-b border-border/50">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <div className="w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="w-3 h-3 text-primary" />
                </div>
                Messages ({messages?.length || 0})
              </CardTitle>
              <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary transition-all duration-200 font-medium text-xs" asChild>
                <Link href="/dashboard/messages">All</Link>
              </Button>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-2 min-h-0">
              {messages && messages.length > 0 ? (
                <div className="space-y-1.5 flex-1 overflow-y-auto">
                  {messages.slice(0, 4).map((message) => (
                    <div key={message.id} className="group flex items-start gap-2 p-1.5 hover:bg-muted/20 rounded-lg transition-all duration-200 cursor-pointer">
                      <div className="w-5 h-5 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                        <MessageCircle className="w-2.5 h-2.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors duration-200">
                            {message.fromUser === user?.uid ? "You" : "Nutritionist"}
                          </span>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {new Date(message.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-tight">{message.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">No messages</p>
                    <Button size="sm" className="mt-3" asChild>
                      <Link href="/dashboard/messages">Start Chat</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1 min-h-0">
          <Card className="h-full flex flex-col bg-gradient-to-br from-card via-card/95 to-muted/20 border hover:border-primary/20 transition-all duration-300 shadow-sm">
            <CardHeader className="pb-2 flex-shrink-0 bg-gradient-to-r from-muted/20 to-muted/10 rounded-t-lg border-b border-border/50">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <div className="w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="w-3 h-3 text-primary" />
                </div>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-2 flex flex-col">
              <div className="flex flex-col gap-1.5 h-full">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Card
                      key={index}
                      className="group relative overflow-hidden bg-gradient-to-r from-background via-background to-muted/30 border border-border/40 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 flex-1"
                    >
                      <Link href={action.href} className="block w-full h-full">
                        <CardContent className="p-2 flex items-center gap-2 h-full">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${action.color} flex-shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg relative`}>
                            <Icon className="w-3.5 h-3.5 text-white" />
                            {action.badge && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">
                                {action.badge > 9 ? '9+' : action.badge}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300 truncate leading-tight">{action.title}</p>
                            <p className="text-xs text-muted-foreground leading-tight mt-0.5 truncate">
                              {action.description}
                            </p>
                          </div>
                        </CardContent>
                        {/* Subtle background decoration */}
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </Link>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Navigation - Non-intrusive compact section */}
      <div className="flex-shrink-0">
        <div className="grid grid-cols-3 gap-1.5">
          {additionalActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={index} href={action.href} className="block">
                <Card className="group relative overflow-hidden bg-gradient-to-r from-muted/30 via-muted/20 to-muted/10 border border-border/30 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5 transition-all duration-300">
                  <CardContent className="p-2 flex flex-col items-center gap-1.5 h-16">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${action.color} flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors duration-300 leading-tight">{action.title}</p>
                    </div>
                  </CardContent>
                  {/* Subtle background decoration */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}

