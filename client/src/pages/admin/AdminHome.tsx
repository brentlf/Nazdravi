import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Calendar, 
  MessageCircle, 
  FileText, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  CalendarX,
  Mail,
  Receipt,
  CreditCard
} from "lucide-react";
import { Link } from "wouter";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { User, Appointment, Message } from "@/types";
import type { Invoice } from "@shared/firebase-schema";
import { where, orderBy, limit } from "firebase/firestore";
import { AppointmentsCalendar } from "@/components/admin/AppointmentsCalendar";
import { FloatingOrganic, DoodleConnector } from "@/components/ui/PageTransition";

export default function AdminHome() {
  // Fetch dashboard data
  const { data: users } = useFirestoreCollection<User>("users", [
    orderBy("createdAt", "desc")
  ]);

  const { data: appointments } = useFirestoreCollection<Appointment>("appointments", [
    orderBy("createdAt", "desc"),
    limit(10)
  ]);

  const { data: messages } = useFirestoreCollection<Message>("messages", [
    orderBy("createdAt", "desc"),
    limit(10)
  ]);

  const { data: invoices } = useFirestoreCollection<Invoice>("invoices", [
    orderBy("createdAt", "desc"),
    limit(20)
  ]);

  // Helper function to get sender name
  const getSenderName = (message: Message) => {
    if (message.fromUser === "admin") {
              return "Nazdravi";
    }
    
    // Find the user who sent the message
    const sender = users?.find(user => user.uid === message.fromUser);
    return sender?.name || "Unknown Client";
  };

  // Calculate stats
  const totalUsers = users?.length || 0;
  const clientUsers = users?.filter(user => user.role === "client").length || 0;
  const completeProgramUsers = users?.filter(user => (user as any).servicePlan === "complete-program").length || 0;
  
  const pendingAppointments = appointments?.filter(apt => apt.status === "pending").length || 0;
  const thisMonthAppointments = appointments?.filter(apt => 
    new Date(apt.date).getMonth() === new Date().getMonth()
  ).length || 0;

  const recentMessages = messages?.slice(0, 5) || [];
  const unreadMessages = messages?.filter(msg => 
    msg.toUser === "admin" && (msg.read === false || msg.read === undefined) // Only unread messages to admin
  ).length || 0;

  // Invoice statistics
  const totalInvoices = invoices?.length || 0;
  const pendingInvoices = invoices?.filter(inv => inv.status === 'pending').length || 0;
  const paidInvoices = invoices?.filter(inv => inv.status === 'paid').length || 0;
  const penaltyInvoices = invoices?.filter(inv => inv.invoiceType === 'penalty').length || 0;
  const pendingPenalties = invoices?.filter(inv => inv.invoiceType === 'penalty' && inv.status === 'pending').length || 0;
  const thisMonthRevenue = invoices?.filter(inv => 
    inv.status === 'paid' && 
    new Date(inv.createdAt).getMonth() === new Date().getMonth()
  ).reduce((sum, inv) => sum + inv.amount, 0) || 0;

  const quickStats = [
    {
      title: "Total Clients",
      value: clientUsers.toString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      href: "/admin/users"
    },
    {
      title: "Appointment Management",
      value: `${pendingAppointments} pending`,
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      href: "/admin/appointments"
    },
    {
      title: "Daily Reminder Emails",
      value: "Send Now",
      icon: Mail,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      href: "/admin/emails"
    },
    {
      title: "Unread Messages",
      value: unreadMessages.toString(),
      icon: MessageCircle,
      color: "text-primary-600",
      bgColor: "bg-primary-50 dark:bg-primary-900/20",
      href: "/admin/messages"
    },
    {
      title: "Billing & Subscriptions",
      value: `${pendingInvoices} pending`,
      subtitle: `${completeProgramUsers} subscriptions • ${penaltyInvoices} penalties`,
      icon: Receipt,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      href: "/admin/invoices",
      badge: pendingPenalties > 0 ? `${pendingPenalties} penalty` : null
    }
  ];

  const quickActions = [
    {
      title: "Client Documents",
      description: "Upload nutrition plans and documents for clients",
      icon: FileText,
      href: "/admin/documents",
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: "Blog Management",
      description: "Create and manage blog posts with images",
      icon: FileText,
      href: "/admin/blog",
      color: "bg-pink-500 hover:bg-pink-600"
    },
    {
      title: "Manage Availability",
      description: "Set unavailable dates and time slots",
      icon: CalendarX,
      href: "/admin/availability",
      color: "bg-red-500 hover:bg-red-600"
    },
    {
      title: "Email Automation",
      description: "Send appointment reminders and manage email notifications",
      icon: Mail,
      href: "/admin/emails",
      color: "bg-indigo-500 hover:bg-indigo-600"
    }
  ];

  return (
    <div className="h-[calc(100vh-8rem)] bg-gradient-to-br from-background via-background to-muted/10 relative overflow-hidden">
      <div className="container mx-auto px-6 py-4 relative z-10 h-full flex flex-col">
        {/* Header with Navigation and Organic Design */}
        <div className="mb-2 relative">
          <div className="flex items-center justify-between">
            <div className="relative">
              <div className="doodle-arrow mb-1">
                <h1 className="font-display text-xl md:text-2xl mb-1 text-foreground handwritten-accent">
                  Admin Dashboard
                </h1>
              </div>
              <p className="serif-body text-base text-muted-foreground leading-relaxed">
                Overview of your nutrition practice and client management
              </p>
              
              {/* Handwritten flourish */}
              <div className="absolute -bottom-4 -right-8">
                <span className="text-accent text-lg transform rotate-12 inline-block">✨</span>
              </div>
            </div>
            <div className="relative">
              <Button variant="outline" asChild className="mediterranean-card floating-element">
                <Link href="/admin-client-view">
                  <Users className="mr-2 h-4 w-4" />
                  View Client Dashboard
                </Link>
              </Button>
              
              {/* Organic decoration */}
              <FloatingOrganic className="absolute -top-4 -right-4 opacity-30" size="small" delay={0.5} />
            </div>
          </div>
          
          {/* Connecting doodle to stats section */}
          <DoodleConnector direction="down" className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-32" />
        </div>

        {/* Top Section - Stats + Quick Actions */}
        <div className="grid lg:grid-cols-3 gap-3 mb-2">
          {/* Stats Cards */}
          <div className="lg:col-span-2">
            <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Key Metrics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {quickStats.map((stat, index) => {
                const Icon = stat.icon;
                
                // Get display value and button text based on card type
                let displayValue, buttonText, displayTitle;
                
                if (stat.title === "Daily Reminder Emails") {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  const tomorrowAppointments = appointments?.filter(apt => {
                    const aptDate = new Date(apt.date);
                    return aptDate.toDateString() === tomorrow.toDateString() && 
                           apt.status === "confirmed";
                  }) || [];
                  displayValue = tomorrowAppointments.length;
                  buttonText = "Send";
                  displayTitle = "Daily Emails";
                } else {
                  displayValue = stat.value;
                  buttonText = "View";
                  // Create better abbreviated titles for longer names
                  if (stat.title === "Appointment Management") {
                    displayTitle = "Appointments";
                  } else if (stat.title === "Billing & Subscriptions") {
                    displayTitle = "Billing & Invoicing";
                  } else if (stat.title.includes("Billing")) {
                    displayTitle = "Billing";
                  } else {
                    displayTitle = stat.title.length > 12 ? 
                      stat.title.split(' ').slice(0, 2).join(' ') : 
                      stat.title;
                  }
                }

                return (
                  <Card key={index} className="group relative overflow-hidden bg-gradient-to-br from-card via-card/95 to-muted/30 border hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 h-36">
                    <CardContent className="p-3 flex flex-col h-full relative z-10">
                      {/* Header with icon and title */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${stat.bgColor} shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                          <Icon className={`w-4 h-4 ${stat.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide leading-tight overflow-hidden text-ellipsis whitespace-nowrap" title={displayTitle}>
                            {displayTitle}
                          </p>
                        </div>
                      </div>
                      
                      {/* Main value display */}
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="text-center">
                          <p className="text-3xl font-bold text-foreground leading-none mb-1 transition-colors duration-300 group-hover:text-primary">
                            {displayValue}
                          </p>
                          {stat.badge && (
                            <Badge variant="outline" className="text-xs text-destructive border-destructive/30 bg-destructive/5">
                              {stat.badge}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Action button */}
                      <div className="pt-3">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          asChild 
                          className="w-full h-8 text-xs font-medium hover:bg-primary/10 hover:text-primary transition-all duration-300"
                        >
                          <Link href={stat.href}>
                            {stat.title === "Daily Reminder Emails" && <Mail className="w-3 h-3 mr-1.5" />}
                            {buttonText}
                          </Link>
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

          {/* Quick Actions */}
          <div className="lg:col-span-1 h-36">
            <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2 h-full">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    size="default"
                    className="group h-full p-3 flex items-center gap-2 justify-start bg-gradient-to-r from-card to-muted/30 hover:from-primary/5 hover:to-primary/10 hover:border-primary/20 transition-all duration-300"
                    asChild
                  >
                    <Link href={action.href}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.color} flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-left leading-tight group-hover:text-primary transition-colors duration-300">{action.title}</span>
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content - Calendar + Messages */}
        <div className="grid lg:grid-cols-3 gap-3 flex-1">
          {/* Calendar - Left Side (66%) */}
          <div className="lg:col-span-2 h-full">
            <AppointmentsCalendar appointments={appointments || []} />
          </div>

          {/* Messages - Right Side (33%) */}
          <div className="lg:col-span-1 h-full">
            <Card className="h-full flex flex-col bg-gradient-to-br from-card via-card/95 to-muted/20 border hover:border-primary/20 transition-all duration-300 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-4 flex-shrink-0 bg-gradient-to-r from-muted/20 to-muted/10 rounded-t-lg border-b border-border/50">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-primary" />
                  </div>
                  Messages ({recentMessages.length})
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hover:bg-primary/10 hover:text-primary transition-all duration-200 font-medium" 
                  asChild
                >
                  <Link href="/admin/messages">All</Link>
                </Button>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-3">
                {recentMessages.length > 0 ? (
                  <div className="space-y-2 flex-1 overflow-y-auto">
                    {recentMessages.map((message) => (
                      <div key={message.id} className="group flex items-start gap-2 p-2 hover:bg-muted/20 rounded-lg transition-all duration-200 cursor-pointer">
                        <div className="w-6 h-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                          <MessageCircle className="w-3 h-3 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors duration-200">
                              {getSenderName(message)}
                            </span>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {(() => {
                                try {
                                  let date;
                                  if (message.createdAt instanceof Date) {
                                    date = message.createdAt;
                                  } else if (message.createdAt && typeof message.createdAt === 'object' && 'toDate' in message.createdAt) {
                                    date = (message.createdAt as any).toDate();
                                  } else {
                                    date = new Date();
                                  }
                                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                } catch (error) {
                                  return 'Recent';
                                }
                              })()}
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
                        <Link href="/admin/messages">Start Chat</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Floating background elements */}
      <FloatingOrganic className="absolute top-20 -right-24 opacity-15" size="large" delay={1} />
      <FloatingOrganic className="absolute bottom-20 -left-24 opacity-15" size="large" delay={3} />
      <FloatingOrganic className="absolute top-1/2 right-10 opacity-10" size="medium" delay={2} />
      <FloatingOrganic className="absolute bottom-1/3 left-10 opacity-10" size="medium" delay={4} />
    </div>
  );
}
