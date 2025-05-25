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
    if ((appointment as any).teamsJoinUrl) {
      window.open((appointment as any).teamsJoinUrl, '_blank');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Appointments Overview
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-medium min-w-[140px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <Button variant="outline" size="sm" onClick={handleNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
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
                  min-h-[80px] p-1 border rounded-lg transition-colors
                  ${isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}
                  ${isCurrentDay ? 'ring-2 ring-primary' : ''}
                  hover:bg-gray-50 dark:hover:bg-gray-700
                `}
              >
                <div className={`
                  text-sm font-medium mb-1
                  ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                  ${isCurrentDay ? 'text-primary font-bold' : ''}
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
                          {appointment.status === 'confirmed' && (appointment as any).teamsJoinUrl && (
                            <Video className="w-3 h-3 flex-shrink-0 ml-auto" />
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
                                    {appointment.status === 'confirmed' && (appointment as any).teamsJoinUrl && (
                                      <Video className="w-3 h-3" />
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
        <div className="flex flex-wrap gap-3 pt-4 border-t">
          <div className="text-sm font-medium text-muted-foreground">Status:</div>
          {Object.entries(statusConfig).map(([status, config]) => {
            const StatusIcon = config.icon;
            return (
              <div key={status} className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded border ${config.color}`}></div>
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