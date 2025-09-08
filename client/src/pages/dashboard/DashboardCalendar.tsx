import { useState, useEffect } from "react";
import { Calendar, Clock, ChevronLeft, ChevronRight, Video, Grid3X3, List } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { Appointment } from "@/types";
import { where, orderBy } from "firebase/firestore";
import { Link } from "wouter";

export default function DashboardCalendar() {
  const { effectiveUser: user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<'month' | 'week'>('month');

  // Fetch appointments
  const { data: appointments, loading } = useFirestoreCollection<Appointment>(
    "appointments",
    user?.uid ? [
      where("userId", "==", user.uid),
      orderBy("date", "desc")
    ] : [],
  );

  // Process appointments data
  const processedAppointments = appointments?.map((apt) => ({
    ...apt,
    date: (apt.date as any)?.seconds
      ? new Date((apt.date as any).seconds * 1000).toISOString().split("T")[0]
      : apt.date,
    timeslot: apt.timeslot || (apt as any).time || "Time TBD",
  })) || [];

  // Filter upcoming appointments
  const upcomingAppointments = processedAppointments.filter(apt => {
    const aptDate = new Date(apt.date);
    const now = new Date();
    return aptDate >= now;
  });

  // Calendar navigation
  const navigateCalendar = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (calendarView === 'month') {
        if (direction === 'prev') {
          newDate.setMonth(newDate.getMonth() - 1);
        } else {
          newDate.setMonth(newDate.getMonth() + 1);
        }
      } else {
        if (direction === 'prev') {
          newDate.setDate(newDate.getDate() - 7);
        } else {
          newDate.setDate(newDate.getDate() + 7);
        }
      }
      return newDate;
    });
  };

  // Get calendar days for current month
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  };

  // Check if date has appointment
  const hasAppointment = (date: Date) => {
    return upcomingAppointments.some(apt => {
      const aptDate = new Date(apt.date);
      return aptDate.toDateString() === date.toDateString();
    });
  };

  // Get appointments for specific date
  const getAppointmentsForDate = (date: Date) => {
    return upcomingAppointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate.toDateString() === date.toDateString();
    });
  };

  const getTeamsUrl = (appointment: any) => {
    return `https://teams.microsoft.com/l/meetup-join/19%3ameeting_${appointment.id}%40thread.tacv2/0?context=%7b%22Tid%22%3a%22${appointment.tenantId}%22%2c%22Oid%22%3a%22${appointment.userId}%22%7d`;
  };

  const calendarDays = getCalendarDays();
  const today = new Date();

  if (loading) {
    return (
      <div className="viewport-fit flex items-center justify-center bg-background">
        <Card className="w-full max-w-4xl mx-4">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="dashboard-viewport bg-background">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 px-safe py-1">
        
        {/* Back Navigation */}
        <div className="mb-2 flex-shrink-0">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="flex items-center gap-1 text-xs px-2 py-1">
              <ChevronLeft className="w-3 h-3" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        
        {/* Calendar Header */}
        <Card className="mb-1 flex-shrink-0">
          <CardHeader className="pb-1">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4" />
                Calendar View
              </CardTitle>
              <div className="flex items-center gap-2">
                {/* View Toggle */}
                <div className="flex items-center bg-muted rounded-lg p-1">
                  <Button
                    variant={calendarView === 'month' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => setCalendarView('month')}
                  >
                    <Grid3X3 className="w-3 h-3 mr-1" />
                    Month
                  </Button>
                  <Button
                    variant={calendarView === 'week' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => setCalendarView('week')}
                  >
                    <List className="w-3 h-3 mr-1" />
                    Week
                  </Button>
                </div>
                
                {/* Navigation */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => navigateCalendar('prev')}
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => navigateCalendar('next')}
                  >
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
            <h2 className="text-base font-semibold text-center">
              {calendarView === 'month' 
                ? currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
                : `Week of ${currentDate.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}`
              }
            </h2>
          </CardHeader>
        </Card>

        {/* Calendar Grid */}
        <Card className="flex-1 flex flex-col min-h-0">
          <CardContent className="flex-1 p-1">
            {calendarView === 'month' ? (
              /* Monthly Calendar Grid */
              <>
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-muted-foreground p-1">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1 flex-1">
                  {calendarDays.map((date, index) => {
                    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                    const isToday = date.toDateString() === today.toDateString();
                    const hasAppt = hasAppointment(date);
                    const appointments = getAppointmentsForDate(date);

                    return (
                      <div
                        key={index}
                        className={`
                          min-h-[40px] sm:min-h-[50px] p-1 border rounded-lg flex flex-col
                          ${isCurrentMonth ? 'bg-background' : 'bg-muted/30'}
                          ${isToday ? 'ring-2 ring-primary bg-primary/5' : ''}
                          ${hasAppt ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : ''}
                        `}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`
                            text-xs font-medium
                            ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                            ${isToday ? 'text-primary font-bold' : ''}
                          `}>
                            {date.getDate()}
                          </span>
                          {hasAppt && (
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                        
                        {/* Appointments for this date */}
                        <div className="flex-1 space-y-0.5">
                          {appointments.slice(0, 1).map((apt, aptIndex) => (
                            <div
                              key={aptIndex}
                              className="text-xs bg-primary/10 text-primary px-1 py-0.5 rounded truncate"
                              title={`${apt.timeslot} - ${apt.type}`}
                            >
                              {apt.timeslot}
                            </div>
                          ))}
                          {appointments.length > 1 && (
                            <div className="text-xs text-muted-foreground">
                              +{appointments.length - 1} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              /* Weekly Calendar with Times */
              <div className="flex-1 border border-border rounded-lg overflow-hidden">
                {/* Time slots header */}
                <div className="grid grid-cols-8 bg-muted/50">
                  <div className="text-xs font-semibold text-muted-foreground p-2 text-center border-r border-border">
                    Time
                  </div>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-xs font-semibold text-muted-foreground p-2 text-center border-r border-border last:border-r-0">
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
                    
                    // Get the week start date (Sunday)
                    const weekStart = new Date(currentDate);
                    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                    
                    for (let hour = startHour; hour < endHour; hour++) {
                      const timeString = `${hour.toString().padStart(2, '0')}:00`;
                      
                      timeSlots.push(
                        <div key={hour} className="grid grid-cols-8">
                          {/* Time column */}
                          <div className="text-xs text-muted-foreground p-1 text-center border-r border-b border-border bg-muted/20">
                            {timeString}
                          </div>
                          
                          {/* Day columns */}
                          {[0, 1, 2, 3, 4, 5, 6].map(dayOffset => {
                            const dayDate = new Date(weekStart);
                            dayDate.setDate(dayDate.getDate() + dayOffset);
                            
                            // Get appointments for this time slot and day
                            const slotAppointments = processedAppointments.filter(apt => {
                              const aptDate = new Date(apt.date);
                              const isSameDay = aptDate.toDateString() === dayDate.toDateString();
                              const aptTime = apt.timeslot?.split(' - ')[0] || '';
                              return isSameDay && aptTime.includes(timeString);
                            });
                            
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
          </CardContent>
        </Card>

        {/* Upcoming Appointments List */}
        {upcomingAppointments.length > 0 && (
          <Card className="mt-2 flex-shrink-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {upcomingAppointments.slice(0, 3).map((appointment) => {
                const appointmentDate = new Date(appointment.date);
                return (
                  <div key={appointment.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="flex flex-col items-center flex-shrink-0">
                        <span className="text-xs font-medium text-green-600">
                          {appointmentDate.toLocaleDateString('en-GB', { 
                            month: 'short' 
                          }).toUpperCase()}
                        </span>
                        <span className="text-sm font-bold">
                          {appointmentDate.getDate()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {appointment.timeslot}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {appointment.type} Session
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Badge variant="outline" className="text-xs">
                        {appointment.status}
                      </Badge>
                      {appointment.status === "confirmed" && (
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" asChild>
                          <a href={getTeamsUrl(appointment)} target="_blank" rel="noopener noreferrer">
                            <Video className="w-3 h-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
              {upcomingAppointments.length > 3 && (
                <div className="text-center">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/appointments">View All Appointments</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
