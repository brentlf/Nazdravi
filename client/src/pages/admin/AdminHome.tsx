import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Calendar, 
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  CalendarX,
  Mail,
  CreditCard,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List
} from "lucide-react";
import { Link } from "wouter";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { User, Appointment } from "@/types";
import type { Invoice } from "@shared/firebase-schema";
import { orderBy, limit } from "firebase/firestore";
import { FloatingOrganic, DoodleConnector } from "@/components/ui/PageTransition";

// Helper function to parse appointment date
function parseAppointmentDate(appointment: Appointment): Date {
  const [day, month, year] = appointment.date.split('/').map(Number);
  return new Date(year, month - 1, day);
}

// Helper function to get sender name
function getSenderName(message: any): string {
  return message.senderName || message.sender || 'Unknown';
}

export default function AdminHome() {
  const [calendarView, setCalendarView] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Fetch dashboard data
  const { data: users } = useFirestoreCollection<User>("users", [
    orderBy("createdAt", "desc")
  ]);

  const { data: appointments } = useFirestoreCollection<Appointment>("appointments", [
    orderBy("createdAt", "desc"),
    limit(10)
  ]);


  const { data: invoices } = useFirestoreCollection<Invoice>("invoices", [
    orderBy("createdAt", "desc"),
    limit(20)
  ]);

  // Fetch messages for desktop view
  const { data: messages } = useFirestoreCollection("messages", [
    orderBy("timestamp", "desc"),
    limit(10)
  ]);


  // Calculate stats
  const clientUsers = users?.filter(user => user.role === "client").length || 0;

  // Process appointments for desktop view
  const upcomingAppointments = appointments?.filter(apt => {
    const aptDate = parseAppointmentDate(apt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return aptDate >= today && apt.status !== "cancelled";
  }).sort((a, b) => {
    const dateA = parseAppointmentDate(a);
    const dateB = parseAppointmentDate(b);
    return dateA.getTime() - dateB.getTime();
  }) || [];

  // Process messages for desktop view
  const recentMessages = messages || [];
  const completeProgramUsers = users?.filter(user => (user as any).servicePlan === "complete-program").length || 0;
  
  const pendingAppointments = appointments?.filter(apt => apt.status === "pending").length || 0;

  // Invoice statistics
  const pendingInvoices = invoices?.filter(inv => inv.status === 'pending').length || 0;
  const penaltyInvoices = invoices?.filter(inv => inv.invoiceType === 'penalty').length || 0;
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
      title: "Pending Appointments",
      value: pendingAppointments.toString(),
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      href: "/admin/appointments"
    },
    {
      title: "This Month Revenue",
      value: `$${thisMonthRevenue.toFixed(0)}`,
      icon: CreditCard,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      href: "/admin/invoices"
    },
    {
      title: "Pending Invoices",
      value: pendingInvoices.toString(),
      icon: CreditCard,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      href: "/admin/invoices"
    },
    {
      title: "Complete Program",
      value: completeProgramUsers.toString(),
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      href: "/admin/users"
    },
    {
      title: "Messages",
      value: "Chat",
      icon: MessageCircle,
      color: "text-primary-600",
      bgColor: "bg-primary-50 dark:bg-primary-900/20",
      href: "/admin/messages"
    },
    {
      title: "Daily Emails",
      value: (() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowAppointments = appointments?.filter(apt => {
          const aptDate = new Date(apt.date);
          return aptDate.toDateString() === tomorrow.toDateString() && 
                 apt.status === "confirmed";
        }) || [];
        return tomorrowAppointments.length.toString();
      })(),
      icon: Mail,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
      href: "/admin/emails"
    }
  ];

  const quickActions = [
    {
      title: "Client Documents",
      description: "Upload nutrition plans and documents for clients",
      icon: Users,
      href: "/admin/documents",
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: "Blog Management",
      description: "Create and manage blog posts with images",
      icon: Calendar,
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
    <div className="h-[calc(100vh-5rem)] bg-gradient-to-br from-background via-background to-muted/10 relative">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-1 sm:py-2 lg:py-3 relative z-10 h-full flex flex-col">
        {/* Header with Navigation and Organic Design */}
        <div className="mb-1 lg:mb-2 relative flex-shrink-0">
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
              
              {/* Organic decoration - Hidden on mobile */}
              <FloatingOrganic className="hidden sm:block absolute -top-4 -right-4 opacity-30" size="small" delay={0.5} />
            </div>
          </div>
          
          {/* Connecting doodle to stats section - Hidden on mobile */}
          <DoodleConnector direction="down" className="hidden sm:block absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-32" />
        </div>


        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-2 lg:gap-3 mb-2 lg:mb-3 flex-shrink-0">
          {/* Key Metrics */}
          <div className="lg:col-span-5">
            <h3 className="text-sm lg:text-base font-semibold mb-1.5 lg:mb-2 flex items-center gap-2 text-foreground">
              <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5" />
              Key Metrics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-1.5 lg:gap-2">
              {quickStats.map((stat, index) => {
                const Icon = stat.icon;
                
                // Get display value based on card type
                let displayValue, displayTitle;
                
                if (stat.title === "Daily Reminder Emails") {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  const tomorrowAppointments = appointments?.filter(apt => {
                    const aptDate = new Date(apt.date);
                    return aptDate.toDateString() === tomorrow.toDateString() && 
                           apt.status === "confirmed";
                  }) || [];
                  displayValue = tomorrowAppointments.length;
                  displayTitle = "Daily Emails";
                } else {
                  displayValue = stat.value;
                  // Create better abbreviated titles for longer names
                  if (stat.title === "Appointment Management") {
                    displayTitle = "Appointments";
                  } else if (stat.title === "Billing & Subscriptions") {
                    displayTitle = "Billing";
                  } else if (stat.title.includes("Billing")) {
                    displayTitle = "Billing";
                  } else {
                    displayTitle = stat.title.length > 12 ? 
                      stat.title.split(' ').slice(0, 2).join(' ') : 
                      stat.title;
                  }
                }

                return (
                  <Link href={stat.href} className="block">
                    <Card
                      key={index}
                      className="group relative overflow-hidden bg-gradient-to-br from-card via-card/95 to-muted/30 border hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer"
                    >
                      {isMobile ? (
                        /* Mobile Design - Compact */
                        <CardContent className="p-2 flex flex-col items-center justify-center gap-1.5 h-16">
                          {/* Icon */}
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bgColor} shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                            <Icon className={`w-5 h-5 ${stat.color}`} />
                          </div>
                          
                          {/* Value and Title */}
                          <div className="text-center">
                            <div className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                              {displayValue}
                            </div>
                            <div className="text-xs font-medium text-muted-foreground group-hover:text-primary/80 transition-colors duration-300">
                              {displayTitle}
                            </div>
                          </div>
                        </CardContent>
                      ) : (
                        /* Desktop Design - Compact */
                        <CardContent className="p-2 flex flex-col items-center justify-center gap-1.5 h-16">
                          {/* Icon */}
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.bgColor} shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                            <Icon className={`w-4 h-4 ${stat.color}`} />
                          </div>
                          
                          {/* Value and Title */}
                          <div className="text-center">
                            <div className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                              {displayValue}
                            </div>
                            <div className="text-xs font-medium text-muted-foreground group-hover:text-primary/80 transition-colors duration-300">
                              {displayTitle}
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Only - Quick Actions Section */}
        <div className="lg:hidden mb-3 flex-shrink-0">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-foreground">
            <Calendar className="w-4 h-4" />
            Quick Actions
          </h3>
          <div className="space-y-1.5">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="group w-full p-2 flex items-center gap-2 justify-start bg-gradient-to-r from-card to-muted/30 hover:from-primary/5 hover:to-primary/10 hover:border-primary/20 transition-all duration-300 h-auto"
                  asChild
                >
                  <Link href={action.href}>
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center ${action.color} flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                      <Icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-xs font-medium group-hover:text-primary transition-colors duration-300">{action.title}</div>
                      <div className="text-xs text-muted-foreground group-hover:text-primary/80 transition-colors duration-300 leading-tight">{action.description}</div>
                    </div>
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Desktop Only - Calendar and Sidebar Section */}
        <div className="hidden lg:grid grid-cols-1 lg:grid-cols-5 gap-3 mb-3 flex-1 min-h-0">
          {/* Calendar Section - Left Side */}
          <div className="lg:col-span-3 flex flex-col">
            <Card className="flex-1 flex flex-col">
              <CardHeader className="pb-2 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Appointment Calendar
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="flex items-center bg-muted rounded-lg p-1">
                      <Button
                        variant={calendarView === 'month' ? 'default' : 'ghost'}
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => setCalendarView('month')}
                      >
                        <Grid3X3 className="w-4 h-4 mr-1" />
                        Month
                      </Button>
                      <Button
                        variant={calendarView === 'week' ? 'default' : 'ghost'}
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => setCalendarView('week')}
                      >
                        <List className="w-4 h-4 mr-1" />
                        Week
                      </Button>
                    </div>
                    
                    {/* Navigation */}
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          const newDate = new Date(currentDate);
                          if (calendarView === 'month') {
                            newDate.setMonth(newDate.getMonth() - 1);
                          } else {
                            newDate.setDate(newDate.getDate() - 7);
                          }
                          setCurrentDate(newDate);
                        }}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm font-medium min-w-[120px] text-center">
                        {calendarView === 'month' 
                          ? currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
                          : `Week of ${currentDate.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}`
                        }
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          const newDate = new Date(currentDate);
                          if (calendarView === 'month') {
                            newDate.setMonth(newDate.getMonth() + 1);
                          } else {
                            newDate.setDate(newDate.getDate() + 7);
                          }
                          setCurrentDate(newDate);
                        }}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 flex flex-col">
                  {calendarView === 'month' ? (
                    /* Monthly Calendar Grid */
                    <div className="flex-1 border border-border rounded-lg overflow-hidden">
                      {/* Day headers */}
                      <div className="grid grid-cols-7 bg-muted/50">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                          <div key={day} className="text-xs font-semibold text-muted-foreground p-3 text-center border-r border-border last:border-r-0">
                            {day}
                          </div>
                        ))}
                      </div>
                      
                      {/* Calendar days */}
                      <div className="flex-1">
                        {(() => {
                          const today = new Date();
                          const currentMonth = currentDate.getMonth();
                          const currentYear = currentDate.getFullYear();
                          const firstDay = new Date(currentYear, currentMonth, 1);
                          const startDate = new Date(firstDay);
                          startDate.setDate(startDate.getDate() - firstDay.getDay());
                          
                          const weeks = [];
                          const date = new Date(startDate);
                          
                          // Generate 6 weeks of calendar
                          for (let week = 0; week < 6; week++) {
                            const weekDays = [];
                            
                            for (let day = 0; day < 7; day++) {
                              const isCurrentMonth = date.getMonth() === currentMonth;
                              const isToday = date.toDateString() === today.toDateString();
                              
                              // Get appointments for this day
                              const dayAppointments = appointments?.filter(apt => {
                                const aptDate = parseAppointmentDate(apt);
                                return aptDate.toDateString() === date.toDateString();
                              }) || [];
                              
                              weekDays.push(
                                <div
                                  key={date.toISOString()}
                                  className={`
                                    flex flex-col items-center justify-start p-2 cursor-pointer transition-colors border-r border-b border-border last:border-r-0 min-h-[80px]
                                    ${isCurrentMonth ? 'text-foreground bg-background' : 'text-muted-foreground/50 bg-muted/20'}
                                    ${isToday ? 'bg-primary text-primary-foreground font-semibold' : ''}
                                    ${dayAppointments.length > 0 && !isToday ? 'bg-primary/5' : ''}
                                    hover:bg-muted/50
                                  `}
                                >
                                  <div className="text-sm font-medium mb-1">
                                    {date.getDate()}
                                  </div>
                                  {dayAppointments.length > 0 && (
                                    <div className="flex flex-col gap-1 w-full">
                                      {dayAppointments.slice(0, 2).map((apt, idx) => (
                                        <div
                                          key={idx}
                                          className="text-xs px-1 py-0.5 rounded bg-primary/20 text-primary truncate"
                                          title={`${apt.timeslot} - ${apt.type}`}
                                        >
                                          {apt.timeslot}
                                        </div>
                                      ))}
                                      {dayAppointments.length > 2 && (
                                        <div className="text-xs text-muted-foreground">
                                          +{dayAppointments.length - 2} more
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                              
                              date.setDate(date.getDate() + 1);
                            }
                            
                            weeks.push(
                              <div key={week} className="grid grid-cols-7">
                                {weekDays}
                              </div>
                            );
                          }
                          
                          return weeks;
                        })()}
                      </div>
                    </div>
                  ) : (
                    /* Weekly Calendar with Times */
                    <div className="flex-1 border border-border rounded-lg overflow-hidden">
                      {/* Time slots header */}
                      <div className="grid grid-cols-8 bg-muted/50">
                        <div className="text-xs font-semibold text-muted-foreground p-3 text-center border-r border-border">
                          Time
                        </div>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                          <div key={day} className="text-xs font-semibold text-muted-foreground p-3 text-center border-r border-border last:border-r-0">
                            {day}
                          </div>
                        ))}
                      </div>
                      
                      {/* Time slots and appointments */}
                      <div className="flex-1">
                        {(() => {
                          const timeSlots = [];
                          const startHour = 8; // 8 AM
                          const endHour = 20; // 8 PM
                          
                          for (let hour = startHour; hour < endHour; hour++) {
                            const timeString = `${hour.toString().padStart(2, '0')}:00`;
                            
                            // Get the week start date (Sunday)
                            const weekStart = new Date(currentDate);
                            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                            
                            timeSlots.push(
                              <div key={hour} className="grid grid-cols-8">
                                {/* Time column */}
                                <div className="text-xs text-muted-foreground p-2 text-center border-r border-b border-border bg-muted/20">
                                  {timeString}
                                </div>
                                
                                {/* Day columns */}
                                {[0, 1, 2, 3, 4, 5, 6].map(dayOffset => {
                                  const dayDate = new Date(weekStart);
                                  dayDate.setDate(dayDate.getDate() + dayOffset);
                                  
                                  // Get appointments for this time slot and day
                                  const slotAppointments = appointments?.filter(apt => {
                                    const aptDate = parseAppointmentDate(apt);
                                    const isSameDay = aptDate.toDateString() === dayDate.toDateString();
                                    const aptTime = apt.timeslot?.split(' - ')[0] || '';
                                    return isSameDay && aptTime.includes(timeString);
                                  }) || [];
                                  
                                  return (
                                    <div
                                      key={`${hour}-${dayOffset}`}
                                      className="border-r border-b border-border last:border-r-0 p-1 min-h-[40px] hover:bg-muted/30"
                                    >
                                      {slotAppointments.map((apt, idx) => (
                                        <div
                                          key={idx}
                                          className="text-xs px-2 py-1 rounded bg-primary/20 text-primary mb-1 truncate"
                                          title={`${apt.timeslot} - ${apt.type}`}
                                        >
                                          {apt.timeslot}
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          }
                          
                          return timeSlots;
                        })()}
                      </div>
                    </div>
                  )}
                  
                  {/* Upcoming appointments list */}
                  {upcomingAppointments.length > 0 && (
                    <div className="space-y-2 flex-shrink-0">
                      <h4 className="text-sm font-medium text-muted-foreground">Upcoming</h4>
                      {upcomingAppointments.slice(0, 3).map((appointment, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <div>
                              <p className="text-xs font-medium">
                                {parseAppointmentDate(appointment).toLocaleDateString('en-GB', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {appointment.timeslot}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {appointment.status}
                          </Badge>
                        </div>
                      ))}
                      {upcomingAppointments.length > 3 && (
                        <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                          <Link href="/admin/calendar">View All</Link>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

            {/* Quick Actions & Recent Messages - Right Side */}
            <div className="lg:col-span-2 space-y-3">
            {/* Quick Actions */}
            <div>
              <h3 className="text-sm lg:text-base font-semibold mb-2 lg:mb-3 flex items-center gap-2 text-foreground">
                <Calendar className="w-4 h-4 lg:w-5 lg:h-5" />
                Quick Actions
              </h3>
              <div className="space-y-1.5 lg:space-y-2">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <div key={index}>
                    {/* Mobile Design - Compact */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="group w-full p-2 flex items-center gap-2 justify-start bg-gradient-to-r from-card to-muted/30 hover:from-primary/5 hover:to-primary/10 hover:border-primary/20 transition-all duration-300 h-auto lg:hidden"
                      asChild
                    >
                      <Link href={action.href}>
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center ${action.color} flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                          <Icon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-xs font-medium group-hover:text-primary transition-colors duration-300">{action.title}</div>
                          <div className="text-xs text-muted-foreground group-hover:text-primary/80 transition-colors duration-300 leading-tight">{action.description}</div>
                        </div>
                      </Link>
                    </Button>

                    {/* Desktop Design - Compact */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="group w-full p-2 flex items-center gap-2 justify-start bg-gradient-to-r from-card to-muted/30 hover:from-primary/5 hover:to-primary/10 hover:border-primary/20 transition-all duration-300 h-auto hidden lg:flex"
                      asChild
                    >
                      <Link href={action.href}>
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center ${action.color} flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                          <Icon className="w-3 h-3 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-xs font-medium group-hover:text-primary transition-colors duration-300">{action.title}</div>
                          <div className="text-xs text-muted-foreground group-hover:text-primary/80 transition-colors duration-300 leading-tight">{action.description}</div>
                        </div>
                      </Link>
                    </Button>
                  </div>
                );
              })}
              </div>
            </div>

            {/* Recent Messages - Desktop Only */}
            <div className="hidden lg:block">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-foreground">
                <MessageCircle className="w-4 h-4" />
                Recent Messages
              </h3>
              <div className="space-y-1.5">
                {recentMessages.length > 0 ? (
                  <>
                    {recentMessages.slice(0, 3).map((message, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-muted/30 rounded-md">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                          <MessageCircle className="w-3 h-3 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-xs truncate">
                              {getSenderName(message)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(message.timestamp).toLocaleDateString('en-GB', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                      <Link href="/admin/messages">View All Messages</Link>
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <MessageCircle className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground">No recent messages</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Alerts and Important Info */}
        {(penaltyInvoices > 0 || pendingAppointments > 0) && (
          <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800 mb-2 flex-shrink-0">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-orange-800 dark:text-orange-200">Action Required</h4>
                  <div className="text-sm text-orange-700 dark:text-orange-300">
                    {penaltyInvoices > 0 && `${penaltyInvoices} penalty invoice${penaltyInvoices > 1 ? 's' : ''} need attention`}
                    {penaltyInvoices > 0 && pendingAppointments > 0 && ' • '}
                    {pendingAppointments > 0 && `${pendingAppointments} appointment${pendingAppointments > 1 ? 's' : ''} pending confirmation`}
                  </div>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/admin/invoices">View Details</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
      
      {/* Floating background elements - Hidden on mobile */}
      <FloatingOrganic className="hidden sm:block absolute top-20 -right-24 opacity-15" size="large" delay={1} />
      <FloatingOrganic className="hidden sm:block absolute bottom-20 -left-24 opacity-15" size="large" delay={3} />
      <FloatingOrganic className="hidden sm:block absolute top-1/2 right-10 opacity-10" size="medium" delay={2} />
      <FloatingOrganic className="hidden sm:block absolute bottom-1/3 left-10 opacity-10" size="medium" delay={4} />
    </div>
  );
}
