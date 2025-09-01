import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronLeft, ChevronRight, Calendar, Video, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Appointment } from "@/types";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from "date-fns";

interface AppointmentsCalendarProps {
  appointments: Appointment[];
}

const statusConfig = {
  pending: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock,
    label: "Pending"
  },
  confirmed: {
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
    label: "Confirmed"
  },
  cancelled: {
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
    label: "Cancelled"
  },
  done: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: CheckCircle,
    label: "Completed"
  },
  reschedule_requested: {
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: AlertTriangle,
    label: "Reschedule"
  },
  cancelled_reschedule: {
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: XCircle,
    label: "Cancelled"
  }
};

export function AppointmentsCalendar({ appointments }: AppointmentsCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {};
    
    appointments.forEach(appointment => {
      if (appointment.date) {
        const dateKey = format(new Date(appointment.date), 'yyyy-MM-dd');
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(appointment);
      }
    });
    
    return grouped;
  }, [appointments]);

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleJoinTeams = (appointment: Appointment) => {
    if (appointment.teamsJoinUrl) {
      window.open(appointment.teamsJoinUrl, '_blank');
    }
  };

  return (
    <Card className="bg-gradient-to-br from-card via-card/95 to-muted/20 border hover:border-primary/20 transition-all duration-300 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4 bg-gradient-to-r from-muted/20 to-muted/10 rounded-t-lg border-b border-border/50">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          Appointments Overview
        </CardTitle>
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handlePrevMonth}
            className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-semibold min-w-[140px] text-center text-foreground bg-muted/30 px-4 py-2 rounded-lg">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleNextMonth}
            className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-3">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/20 rounded-lg">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {daysInMonth.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayAppointments = appointmentsByDate[dateKey] || [];
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isCurrentDay = isToday(day);
            
            return (
              <div
                key={dateKey}
                className={`
                  min-h-[80px] p-2 border rounded-xl transition-all duration-200 group
                  ${isCurrentMonth 
                    ? 'bg-card hover:bg-muted/30 border-border' 
                    : 'bg-muted/20 hover:bg-muted/40 border-border/50'
                  }
                  ${isCurrentDay ? 'ring-2 ring-primary/50 bg-primary/5 shadow-sm' : ''}
                  hover:shadow-sm hover:border-primary/20
                `}
              >
                <div className={`
                  text-sm font-semibold mb-1 transition-colors
                  ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                  ${isCurrentDay ? 'text-primary font-bold' : ''}
                  group-hover:text-primary
                `}>
                  {format(day, 'd')}
                </div>
                
                {/* Appointments for this day */}
                <div className="space-y-1">
                  {dayAppointments.slice(0, 2).map(appointment => {
                    const config = statusConfig[appointment.status as keyof typeof statusConfig];
                    const StatusIcon = config?.icon || Clock;
                    
                    return (
                      <div
                        key={appointment.id}
                        className={`
                          px-1 py-0.5 rounded text-xs border cursor-pointer
                          ${config?.color || 'bg-gray-100 text-gray-800 border-gray-200'}
                          hover:opacity-80 transition-opacity
                        `}
                        onClick={() => appointment.status === 'confirmed' && handleJoinTeams(appointment)}
                        title={`${appointment.name} - ${appointment.timeslot} (${config?.label})`}
                      >
                        <div className="flex items-center gap-1 truncate">
                          <StatusIcon className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate text-xs">
                            {appointment.timeslot?.split('-')[0]} {appointment.name?.split(' ')[0]}
                          </span>
                          {appointment.status === 'confirmed' && appointment.teamsJoinUrl && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJoinTeams(appointment);
                              }}
                              className="ml-auto bg-blue-500 hover:bg-blue-600 text-white rounded p-0.5 transition-colors"
                              title="Join Teams Meeting"
                            >
                              <Video className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Show +X more if there are additional appointments */}
                  {dayAppointments.length > 2 && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <div className="text-xs text-muted-foreground px-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                          +{dayAppointments.length - 2} more
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-3">
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">
                            {format(day, 'MMMM d, yyyy')} - {dayAppointments.length} appointments
                          </h4>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {dayAppointments.map(appointment => {
                              const config = statusConfig[appointment.status as keyof typeof statusConfig];
                              const StatusIcon = config?.icon || Clock;
                              
                              return (
                                <div
                                  key={appointment.id}
                                  className={`
                                    p-2 rounded border text-xs
                                    ${config?.color || 'bg-gray-100 text-gray-800 border-gray-200'}
                                    ${appointment.status === 'confirmed' && (appointment as any).teamsJoinUrl ? 'cursor-pointer hover:opacity-80' : ''}
                                  `}
                                  onClick={() => appointment.status === 'confirmed' && handleJoinTeams(appointment)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <StatusIcon className="w-3 h-3" />
                                      <span className="font-medium">{appointment.name}</span>
                                    </div>
                                    {appointment.status === 'confirmed' && appointment.teamsJoinUrl && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleJoinTeams(appointment);
                                        }}
                                        className="bg-blue-500 hover:bg-blue-600 text-white rounded p-1 transition-colors"
                                        title="Join Teams Meeting"
                                      >
                                        <Video className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                  <div className="mt-1 text-muted-foreground">
                                    {appointment.timeslot} • {appointment.type || 'Consultation'}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <div className="text-xs font-medium text-muted-foreground">Status:</div>
          {Object.entries(statusConfig).map(([status, config]) => {
            const StatusIcon = config.icon;
            return (
              <div key={status} className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded border ${config.color}`}></div>
                <span className="text-xs text-muted-foreground">{config.label}</span>
              </div>
            );
          })}
          <div className="flex items-center gap-1 ml-2">
            <Video className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Teams Link</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}