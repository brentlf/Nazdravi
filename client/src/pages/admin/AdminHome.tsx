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
    <div className="min-h-screen py-20 bg-gradient-to-br from-background to-muted/30 country-texture relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Header with Navigation and Organic Design */}
        <div className="mb-12 relative">
          <div className="flex items-center justify-between">
            <div className="relative">
              <div className="doodle-arrow mb-2">
                <h1 className="font-display text-3xl md:text-4xl mb-2 text-foreground handwritten-accent">
                  Admin Dashboard
                </h1>
              </div>
              <p className="serif-body text-xl text-muted-foreground leading-relaxed">
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

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8 items-stretch">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            
            // Special handling for Daily Reminder Emails tile
            if (stat.title === "Daily Reminder Emails") {
              // Get tomorrow's date and appointments
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              const tomorrowAppointments = appointments?.filter(apt => {
                const aptDate = new Date(apt.date);
                return aptDate.toDateString() === tomorrow.toDateString() && 
                       apt.status === "confirmed";
              }) || [];

              return (
                <div key={index} className="relative h-full">
                  <Card className="mediterranean-card hover:shadow-xl transition-all duration-500 border-0 floating-element h-full">
                    <CardContent className="p-4 flex flex-col h-full relative min-h-[180px]">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-display text-sm text-muted-foreground">{stat.title}</h3>
                        <div className={`w-8 h-8 blob-shape flex items-center justify-center ${stat.bgColor} floating-element`}>
                          <Icon className={`w-4 h-4 ${stat.color}`} />
                        </div>
                      </div>
                      <div className="flex-grow mb-3">
                        <p className="font-display text-2xl font-bold mb-1">{tomorrowAppointments.length}</p>
                        <p className="serif-body text-xs text-muted-foreground">
                          clients with appointments tomorrow
                        </p>
                        <Badge variant="secondary" className="text-xs mt-1 handwritten-accent">
                          Ready to send
                        </Badge>
                      </div>
                      <Button size="sm" variant="outline" asChild className="w-full mt-auto mediterranean-card">
                        <Link href={stat.href}>
                          <Mail className="w-3 h-3 mr-1" />
                          Send Reminders
                        </Link>
                      </Button>
                      
                      {/* Organic background decoration */}
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/5 to-accent/5 blob-shape opacity-50"></div>
                    </CardContent>
                  </Card>
                  
                  {/* Floating organic decoration */}
                  {index === 2 && <FloatingOrganic className="absolute -top-4 -right-4 opacity-20" size="small" delay={1.5} />}
                </div>
              );
            }
            
            // Regular stat tiles
            return (
              <div key={index} className="relative h-full">
                <Card className="mediterranean-card hover:shadow-xl transition-all duration-500 border-0 floating-element h-full">
                  <CardContent className="p-4 flex flex-col h-full relative min-h-[180px]">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-display text-sm text-muted-foreground">{stat.title}</h3>
                      <div className={`w-8 h-8 blob-shape flex items-center justify-center ${stat.bgColor} floating-element`}>
                        <Icon className={`w-4 h-4 ${stat.color}`} />
                      </div>
                    </div>
                    <div className="flex-grow mb-3">
                      <p className="font-display text-2xl font-bold mb-1">{stat.value}</p>
                      {stat.subtitle && (
                        <p className="serif-body text-xs text-muted-foreground">{stat.subtitle}</p>
                      )}
                      {stat.badge && (
                        <Badge variant="outline" className="text-xs text-red-600 border-red-600 mt-1 handwritten-accent">
                          {stat.badge}
                        </Badge>
                      )}
                    </div>
                    <Button size="sm" variant="outline" asChild className="w-full mt-auto mediterranean-card">
                      <Link href={stat.href}>View Details</Link>
                    </Button>
                    
                    {/* Organic background decoration */}
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/5 to-accent/5 blob-shape opacity-50"></div>
                  </CardContent>
                </Card>
                
                {/* Floating organic decorations */}
                {index === 0 && <FloatingOrganic className="absolute -top-4 -left-4 opacity-20" size="small" delay={0.5} />}
                {index === 4 && <FloatingOrganic className="absolute -bottom-4 -right-4 opacity-20" size="small" delay={2.5} />}
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 lg:items-stretch">
          {/* Recent Activity */}
          <div className="lg:col-span-2 grid grid-rows-2 gap-8">
            {/* Appointments Overview Calendar */}
            <AppointmentsCalendar appointments={appointments || []} />

            {/* Recent Messages */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Recent Messages
                </CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/messages">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentMessages.length > 0 ? (
                  <div className="space-y-4">
                    {recentMessages.map((message) => (
                      <div key={message.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                          <MessageCircle className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{getSenderName(message)}</p>
                          <p className="text-sm text-muted-foreground truncate">{message.text}</p>
                          <p className="text-xs text-muted-foreground mt-1">
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
                                return date.toLocaleDateString();
                              } catch (error) {
                                return 'Recent';
                              }
                            })()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No recent messages</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-8">
            {/* Quick Actions */}
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

            {/* Practice Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Practice Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Clients</span>
                    <span className="font-semibold">{clientUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">This Month</span>
                    <span className="font-semibold">{thisMonthAppointments} appointments</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Pending Reviews</span>
                    <span className="font-semibold">{pendingAppointments}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Unread Messages</span>
                    <span className="font-semibold">{unreadMessages}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Firebase Connection</span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      Healthy
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email Service</span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Storage</span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      Available
                    </Badge>
                  </div>
                </div>
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
