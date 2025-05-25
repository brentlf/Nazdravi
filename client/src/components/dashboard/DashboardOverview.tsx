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
  User
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { Appointment, Message, Progress } from "@/types";
import type { Invoice } from "@shared/firebase-schema";
import ServicePlanStatusWidget from "./ServicePlanStatusWidget";
import { where, orderBy, limit } from "firebase/firestore";

export function DashboardOverview() {
  const { effectiveUser: user, isAdminViewingClient } = useAuth();



  // Try multiple approaches to find appointments - remove status filter first
  const { data: appointmentsByUserId } = useFirestoreCollection<Appointment>("appointments", 
    user?.uid ? [where("userId", "==", user.uid)] : []
  );
  
  const { data: appointmentsByEmail } = useFirestoreCollection<Appointment>("appointments", 
    user?.email ? [where("email", "==", user.email)] : []
  );
  
  // Also try searching by user field (some might use this instead)
  const { data: appointmentsByUser } = useFirestoreCollection<Appointment>("appointments", 
    user?.uid ? [where("user", "==", user.uid)] : []
  );

  // Fetch messages from the user's chat room (remove orderBy temporarily)
  const chatRoom = user ? `${user.uid}_admin` : "";
  const { data: messages } = useFirestoreCollection<Message>("messages", 
    chatRoom ? [where("chatRoom", "==", chatRoom)] : []
  );

  const { data: progressEntries } = useFirestoreCollection<Progress>("progress", 
    user?.uid ? [where("userId", "==", user.uid)] : []
  );

  // Fetch client's invoices by multiple identifiers
  const { data: invoicesByUserId } = useFirestoreCollection<Invoice>("invoices", 
    user?.uid ? [where("userId", "==", user.uid)] : []
  );
  
  const { data: invoicesByEmail } = useFirestoreCollection<Invoice>("invoices", 
    user?.email ? [where("clientEmail", "==", user.email)] : []
  );

  // Combine and deduplicate invoices
  const allUserInvoices = [
    ...(invoicesByUserId || []),
    ...(invoicesByEmail || [])
  ];
  
  const invoices = allUserInvoices.filter((invoice, index, self) => 
    index === self.findIndex(i => i.invoiceNumber === invoice.invoiceNumber)
  );

  // Combine all appointment sources
  const allAppointments = [
    ...(appointmentsByUserId || []),
    ...(appointmentsByEmail || []),
    ...(appointmentsByUser || [])
  ];
  
  // Remove duplicates and get effective appointments
  const effectiveAppointments = allAppointments.filter((apt, index, self) => 
    index === self.findIndex(a => a.id === apt.id)
  );
  
  // Debug logging for appointments
  console.log("Dashboard Appointments Debug:", {
    userId: user?.uid,
    userEmail: user?.email,
    appointmentsByUserId: appointmentsByUserId?.length || 0,
    appointmentsByEmail: appointmentsByEmail?.length || 0,
    appointmentsByUser: appointmentsByUser?.length || 0,
    totalAppointments: effectiveAppointments?.length || 0
  });

  // Handle both date formats (Timestamp and string) and time field variations
  const processedAppointments = effectiveAppointments?.map(apt => ({
    ...apt,
    date: (apt.date as any)?.seconds ? 
      new Date((apt.date as any).seconds * 1000).toISOString().split('T')[0] : 
      apt.date,
    timeslot: apt.timeslot || (apt as any).time || "Time TBD"
  }));

  const nextAppointment = processedAppointments?.[0];
  const unreadMessages = messages?.filter(msg => 
    msg.toUser === user?.uid && (msg.read === false || msg.read === undefined)
  ).length || 0;
  const latestProgress = progressEntries?.[0];
  const pendingInvoices = invoices?.filter(invoice => invoice.status === "pending").length || 0;


  
  // Calculate weight change this month
  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonthEntries = progressEntries?.filter(entry => 
    entry.date.startsWith(currentMonth) && entry.weightKg
  ) || [];
  
  const weightChange = thisMonthEntries.length >= 2 
    ? (thisMonthEntries[0].weightKg || 0) - (thisMonthEntries[thisMonthEntries.length - 1].weightKg || 0)
    : 0;

  const quickStats = [
    {
      title: "Next Appointment",
      value: nextAppointment ? 
        new Date(nextAppointment.date).toLocaleDateString() : 
        "None scheduled",
      subtitle: nextAppointment?.timeslot || "",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      action: nextAppointment ? "View Details" : "Book Now",
      href: "/dashboard/appointments"
    },
    {
      title: "Weight Progress",
      value: weightChange !== 0 ? `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)}kg` : "No data",
      subtitle: "This month",
      icon: TrendingDown,
      color: weightChange < 0 ? "text-green-600" : "text-gray-600",
      bgColor: weightChange < 0 ? "bg-green-50 dark:bg-green-900/20" : "bg-gray-50 dark:bg-gray-800",
      action: "View Progress",
      href: "/dashboard/progress"
    },
    {
      title: "Water Today",
      value: latestProgress?.waterLitres ? `${latestProgress.waterLitres}L` : "0L",
      subtitle: "Goal: 2.5L",
      icon: Droplets,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      action: "Update",
      href: "/dashboard/progress"
    },
    {
      title: "Messages",
      value: unreadMessages.toString(),
      subtitle: "Unread",
      icon: MessageCircle,
      color: "text-primary-600",
      bgColor: "bg-primary-50 dark:bg-primary-900/20",
      action: "View All",
      href: "/dashboard/messages"
    },
    {
      title: "Invoices",
      value: pendingInvoices.toString(),
      subtitle: "Pending Payment",
      icon: Receipt,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      action: "Pay Now",
      href: "/dashboard/invoices"
    }
  ];

  const quickActions = [
    {
      title: "Log Progress",
      description: "Update your weight and water intake",
      icon: Target,
      href: "/dashboard/progress",
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "Book Appointment",
      description: "Schedule your next consultation",
      icon: Calendar,
      href: "/dashboard/appointments",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "Send Message",
      description: "Ask your nutritionist a question",
      icon: MessageCircle,
      href: "/dashboard/messages",
      color: "bg-primary-500 hover:bg-primary-600"
    },
    {
      title: "View Plan",
      description: "Access your nutrition plan",
      icon: FileText,
      href: "/dashboard/plan",
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: "Pay Invoices",
      description: "View and pay outstanding invoices",
      icon: Receipt,
      href: "/dashboard/invoices",
      color: "bg-orange-500 hover:bg-orange-600"
    },
    {
      title: "Profile Settings",
      description: "Manage your account and health info",
      icon: User,
      href: "/dashboard/profile",
      color: "bg-gray-500 hover:bg-gray-600"
    }
  ];

  return (
    <div className="space-y-8">


      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white">
        {isAdminViewingClient && (
          <div className="mb-4 bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-3">
            <p className="text-sm text-yellow-100">
              👁️ Admin View: You are viewing {user?.name}'s dashboard
            </p>
          </div>
        )}
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-primary-100">Here's your nutrition journey overview</p>
      </div>

      {/* Service Plan Status Widget */}
      <ServicePlanStatusWidget user={user} />

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm text-muted-foreground">{stat.title}</h3>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bgColor}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.subtitle}</p>
                  <Button size="sm" variant="outline" asChild className="w-full">
                    <Link href={stat.href}>{stat.action}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Messages */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Recent Messages
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/messages">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {messages && messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.slice(0, 3).map((message) => (
                    <div key={message.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {message.fromUser === user?.uid ? "You" : "Nutritionist"}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">{message.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No messages yet</p>
                  <Button size="sm" className="mt-4" asChild>
                    <Link href="/dashboard/messages">Start Conversation</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
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
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${action.color}`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">{action.title}</p>
                          <p className="text-xs text-muted-foreground">{action.description}</p>
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
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Hydration</h4>
              <p className="text-sm text-blue-600 dark:text-blue-300">Aim for 2.5L daily</p>
              <div className="mt-2">
                <Badge variant="outline" className="border-blue-200 text-blue-700">
                  Daily Goal
                </Badge>
              </div>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Exercise</h4>
              <p className="text-sm text-green-600 dark:text-green-300">30 min walks 3x week</p>
              <div className="mt-2">
                <Badge variant="outline" className="border-green-200 text-green-700">
                  Weekly Goal
                </Badge>
              </div>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Meal Prep</h4>
              <p className="text-sm text-purple-600 dark:text-purple-300">Prep Sunday meals</p>
              <div className="mt-2">
                <Badge variant="outline" className="border-purple-200 text-purple-700">
                  Weekly Task
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
