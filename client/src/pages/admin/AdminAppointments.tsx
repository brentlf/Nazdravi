import { useState } from "react";
import { Search, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Filter, ArrowLeft, CalendarX, RotateCcw, Edit, FileText, Mail, Euro, UserCheck, ClipboardList, Video, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useFirestoreCollection, useFirestoreActions } from "@/hooks/useFirestore";
import { Appointment } from "@/types";
import { emailService } from "@/lib/emailService";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminAppointments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date-desc");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isEditingAppointment, setIsEditingAppointment] = useState(false);
  const [editDate, setEditDate] = useState("");
  const [editTimeslot, setEditTimeslot] = useState("");
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const { toast } = useToast();

  // Fetch appointments
  const { data: appointments, loading } = useFirestoreCollection<Appointment>("appointments");
  const { update: updateAppointmentStatus, loading: updateLoading } = useFirestoreActions("appointments");

  // Handle status change functionality
  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      await updateAppointmentStatus(appointmentId, { 
        status: newStatus,
        lastModified: new Date().toISOString()
      });
      
      toast({
        title: "Status Updated",
        description: `Appointment status changed to ${newStatus}`,
      });
      
      setIsChangingStatus(false);
      setSelectedAppointment(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      });
    }
  };

  // Calculate status overview for action items
  const getStatusOverview = () => {
    if (!appointments) return null;
    
    const overview = {
      pendingInvoices: 0,
      missingConsentForms: 0,
      pendingPreEvaluation: 0,
      lateChanges: 0,
      noShows: 0,
      totalAppointments: appointments.length
    };

    appointments.forEach(appointment => {
      // Count pending invoices (completed appointments without invoices)
      if (appointment.status === 'completed' && !appointment.invoiceGenerated) {
        overview.pendingInvoices++;
      }

      // Count missing consent forms
      if (!appointment.consentFormSubmitted) {
        overview.missingConsentForms++;
      }

      // Count pending pre-evaluation forms
      if (!appointment.preEvaluationCompleted && appointment.status !== 'cancelled') {
        overview.pendingPreEvaluation++;
      }

      // Count late changes (appointments rescheduled within 4 hours)
      if (appointment.rescheduleHistory && appointment.rescheduleHistory.length > 0) {
        const lastReschedule = appointment.rescheduleHistory[appointment.rescheduleHistory.length - 1];
        const appointmentTime = new Date(`${appointment.date}T${appointment.timeslot}`);
        const rescheduleTime = new Date(lastReschedule.timestamp);
        const hoursDifference = (appointmentTime.getTime() - rescheduleTime.getTime()) / (1000 * 60 * 60);
        
        if (hoursDifference <= 4) {
          overview.lateChanges++;
        }
      }

      // Count no-shows
      if (appointment.status === 'no-show') {
        overview.noShows++;
      }
    });

    return overview;
  };

  const statusOverview = getStatusOverview();

  // Filter and sort appointments
  const filteredAndSortedAppointments = () => {
    if (!appointments) return [];

    let filtered = appointments.filter(appointment => {
      // Search filter
      const searchMatch = 
        appointment.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.clientEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.status?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const statusMatch = statusFilter === "all" || appointment.status === statusFilter;

      // Date filter
      let dateMatch = true;
      if (dateFilter !== "all") {
        const appointmentDate = appointment.date?.seconds 
          ? new Date(appointment.date.seconds * 1000)
          : new Date(appointment.date);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const weekFromNow = new Date(today);
        weekFromNow.setDate(weekFromNow.getDate() + 7);

        switch (dateFilter) {
          case "today":
            dateMatch = appointmentDate.toDateString() === today.toDateString();
            break;
          case "tomorrow":
            dateMatch = appointmentDate.toDateString() === tomorrow.toDateString();
            break;
          case "this-week":
            dateMatch = appointmentDate >= today && appointmentDate <= weekFromNow;
            break;
          case "past":
            dateMatch = appointmentDate < today;
            break;
          case "future":
            dateMatch = appointmentDate >= today;
            break;
        }
      }

      return searchMatch && statusMatch && dateMatch;
    });

    // Sort appointments
    filtered.sort((a, b) => {
      const dateA = a.date?.seconds ? new Date(a.date.seconds * 1000) : new Date(a.date);
      const dateB = b.date?.seconds ? new Date(b.date.seconds * 1000) : new Date(b.date);

      switch (sortBy) {
        case "date-asc":
          return dateA.getTime() - dateB.getTime();
        case "date-desc":
          return dateB.getTime() - dateA.getTime();
        case "client-name":
          return (a.clientName || "").localeCompare(b.clientName || "");
        case "status":
          return (a.status || "").localeCompare(b.status || "");
        case "type":
          return (a.type || "").localeCompare(b.type || "");
        default:
          return dateB.getTime() - dateA.getTime();
      }
    });

    return filtered;
  };

  const processedAppointments = filteredAndSortedAppointments();

  // Column sorting functionality
  const handleColumnSort = (column: string) => {
    if (sortBy === `${column}-asc`) {
      setSortBy(`${column}-desc`);
    } else if (sortBy === `${column}-desc`) {
      setSortBy(`${column}-asc`);
    } else {
      setSortBy(`${column}-asc`);
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy === `${column}-asc`) {
      return <ArrowUp className="w-4 h-4" />;
    } else if (sortBy === `${column}-desc`) {
      return <ArrowDown className="w-4 h-4" />;
    } else {
      return <ArrowUpDown className="w-4 h-4 opacity-50" />;
    }
  };

  // Helper function to get action item icons for each appointment
  const getActionItemIcons = (appointment: any) => {
    const icons = [];
    
    // Invoice needed (completed appointments without invoices)
    if (appointment.status === 'done') {
      icons.push(
        <Tooltip key="invoice">
          <TooltipTrigger>
            <Euro className="w-4 h-4 text-orange-500" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Invoice needed</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    // Teams meeting link needed for confirmed appointments
    if (appointment.status === 'confirmed' && !appointment.teamsJoinUrl) {
      icons.push(
        <Tooltip key="teams">
          <TooltipTrigger>
            <Video className="w-4 h-4 text-blue-500" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Teams meeting link needed</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    // Pending appointments need action
    if (appointment.status === 'pending') {
      icons.push(
        <Tooltip key="pending">
          <TooltipTrigger>
            <AlertCircle className="w-4 h-4 text-yellow-500" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Approval needed</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    // Reschedule requests need attention
    if (appointment.status === 'reschedule_requested') {
      icons.push(
        <Tooltip key="reschedule">
          <TooltipTrigger>
            <RotateCcw className="w-4 h-4 text-purple-500" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Reschedule request pending</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return icons.length > 0 ? icons : null;
  };

  // Helper function to get email history icons
  const getEmailHistoryIcons = (appointment: any) => {
    const icons = [];
    
    // This would typically come from email tracking data
    // For now, we'll show based on appointment status and actions
    
    // Confirmation email (sent when appointment is confirmed)
    if (appointment.status === 'confirmed' || appointment.status === 'done') {
      icons.push(
        <Tooltip key="confirm">
          <TooltipTrigger>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Confirmation sent</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    // Reminder email (sent 24h before)
    if (appointment.status === 'confirmed') {
      const appointmentDate = new Date(`${appointment.date}T${appointment.timeslot}`);
      const now = new Date();
      const hoursDiff = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff <= 24) {
        icons.push(
          <Tooltip key="reminder">
            <TooltipTrigger>
              <Clock className="w-4 h-4 text-blue-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Reminder sent</p>
            </TooltipContent>
          </Tooltip>
        );
      }
    }

    // Invoice email (sent after completion)
    if (appointment.status === 'done' && appointment.invoiceGenerated) {
      icons.push(
        <Tooltip key="invoice-email">
          <TooltipTrigger>
            <Euro className="w-4 h-4 text-orange-500" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Invoice sent</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    // Reschedule notification
    if (appointment.rescheduleHistory && appointment.rescheduleHistory.length > 0) {
      icons.push(
        <Tooltip key="reschedule-email">
          <TooltipTrigger>
            <RotateCcw className="w-4 h-4 text-purple-500" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Reschedule notice sent</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    // Cancellation email
    if (appointment.status === 'cancelled') {
      icons.push(
        <Tooltip key="cancel-email">
          <TooltipTrigger>
            <XCircle className="w-4 h-4 text-red-500" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Cancellation sent</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return icons;
  };

  // Filter appointments
  const filteredAppointments = appointments?.filter(appointment => {
    const matchesSearch = !searchTerm || 
      appointment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const handleAppointmentStatusChange = async (appointmentId: string, newStatus: "confirmed" | "done" | "reschedule_requested" | "cancelled_reschedule") => {
    try {
      const appointment = appointments?.find(apt => apt.id === appointmentId);
      await updateAppointmentStatus(appointmentId, { status: newStatus });
      
      let title = "Appointment updated";
      let description = `Appointment status changed to ${newStatus}.`;
      
      // Send automatic emails and create Teams meeting for confirmed appointments
      if (newStatus === "confirmed" && appointment) {
        try {
          // First, create Teams meeting
          const meetingSubject = `Nutrition Consultation - ${appointment.type} with ${appointment.name}`;
          const startDateTime = `${appointment.date}T${appointment.timeslot}:00`;
          const endDateTime = new Date(new Date(startDateTime).getTime() + 60 * 60 * 1000).toISOString();
          
          const teamsResponse = await fetch('/api/teams/create-meeting', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              subject: meetingSubject,
              startDateTime,
              endDateTime,
              attendeeEmail: appointment.email,
              attendeeName: appointment.name,
            }),
          });

          let teamsJoinUrl = '';
          let teamsMeetingId = '';
          
          if (teamsResponse.ok) {
            const teamsData = await teamsResponse.json();
            teamsJoinUrl = teamsData.teamsJoinUrl;
            teamsMeetingId = teamsData.teamsMeetingId;
            
            // Update appointment with Teams meeting details
            await updateAppointment(appointment.id, {
              ...appointment,
              status: newStatus,
              teamsJoinUrl,
              teamsMeetingId,
            });
          } else {
            // Still confirm appointment even if Teams meeting creation fails
            await updateAppointment(appointment.id, {
              ...appointment,
              status: newStatus,
            });
          }

          // Send appointment confirmation email to client
          await emailService.sendAppointmentConfirmation(
            appointment.email,
            appointment.name,
            appointment.date,
            appointment.timeslot,
            appointment.type
          );
          
          description = teamsJoinUrl 
            ? "Appointment confirmed, Teams meeting created, and confirmation email sent to client."
            : "Appointment confirmed and confirmation email sent to client.";
            
        } catch (error) {
          console.error('Failed to confirm appointment:', error);
          description = "Appointment confirmed (some features may not be available).";
        }
      } else if (newStatus === "reschedule_requested" && appointment) {
        // Send reschedule notification to admin
        try {
          await emailService.sendRescheduleRequest(
            'admin@veenutrition.com', // Configure your admin email
            appointment.name,
            appointment.email,
            appointment.date,
            appointment.timeslot,
            'Admin requested reschedule'
          );
        } catch (emailError) {
          console.error('Failed to send reschedule notification:', emailError);
        }
        title = "Reschedule Requested";
        description = "Client will be notified to select a new time and date.";
      } else if (newStatus === "cancelled_reschedule") {
        title = "Appointment Cancelled";
        description = "Appointment cancelled and marked for rescheduling.";
      }
      
      toast({
        title,
        description,
      });
      setSelectedAppointment(null);
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update appointment status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditAppointment = async () => {
    if (!selectedAppointment || !editDate || !editTimeslot) {
      toast({
        title: "Missing information",
        description: "Please select both date and time slot.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check availability before updating (if changing to a different slot)
      if (editDate !== selectedAppointment.date || editTimeslot !== selectedAppointment.timeslot) {
        // Check for conflicts with other appointments
        const appointmentsRef = collection(db, "appointments");
        const conflictQuery = query(
          appointmentsRef,
          where("date", "==", editDate),
          where("timeslot", "==", editTimeslot),
          where("status", "in", ["pending", "confirmed"])
        );
        
        const conflictSnapshot = await getDocs(conflictQuery);
        const hasConflict = conflictSnapshot.docs.some((doc: any) => doc.id !== selectedAppointment.id);
        
        if (hasConflict) {
          toast({
            title: "Time slot unavailable",
            description: "This time slot is already booked. Please select a different time.",
            variant: "destructive",
          });
          return;
        }
      }

      await updateAppointment(selectedAppointment.id!, { 
        date: editDate, 
        timeslot: editTimeslot,
        status: "confirmed" // Automatically confirm when admin makes direct changes
      });
      
      toast({
        title: "Appointment updated",
        description: "Appointment date and time have been successfully changed and confirmed.",
      });
      
      setIsEditingAppointment(false);
      setSelectedAppointment(null);
      setEditDate("");
      setEditTimeslot("");
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update appointment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const startEditingAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setEditDate(appointment.date);
    setEditTimeslot(appointment.timeslot);
    setIsEditingAppointment(true);
  };

  const handleNoShow = async (appointment: Appointment) => {
    try {
      // Calculate 50% penalty of original appointment cost
      const basePrice = appointment.type === "Initial" ? 75 : 50; // EUR pricing
      const penaltyAmount = Math.round(basePrice * 0.5);

      // Update appointment status to cancelled (since no-show means missed)
      await updateAppointment(appointment.id!, { 
        status: "cancelled",
        noShowPenalty: penaltyAmount,
        noShowDate: new Date().toISOString()
      });

      // Create penalty invoice
      const invoiceData = {
        userId: appointment.email, // Using email as identifier
        clientName: appointment.name,
        clientEmail: appointment.email,
        servicePlan: "pay-as-you-go", // No-show penalties are always pay-as-you-go
        items: [{
          description: `No-Show Penalty - ${appointment.type} Consultation`,
          amount: penaltyAmount,
          type: "penalty" as const,
          details: `Missed appointment on ${appointment.date} at ${appointment.timeslot}`
        }],
        totalAmount: penaltyAmount,
        currency: "EUR",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        appointmentId: appointment.id!,
        invoiceType: "penalty" as const
      };

      // Send invoice creation request
      await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData)
      });

      // Send no-show penalty email to client
      await fetch("/api/emails/no-show-notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: appointment.email,
          name: appointment.name,
          date: new Date(appointment.date).toLocaleDateString(),
          time: appointment.timeslot,
          penaltyAmount: penaltyAmount
        })
      });

      toast({
        title: "No-show processed",
        description: `${appointment.name} has been marked as no-show. Penalty invoice (€${penaltyAmount}) created and notification sent.`,
      });

      setSelectedAppointment(null);
    } catch (error) {
      console.error("No-show processing error:", error);
      toast({
        title: "Failed to process no-show",
        description: "Please try again or check the system logs.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "done":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case "reschedule_requested":
        return <CalendarX className="w-4 h-4 text-orange-500" />;
      case "cancelled_reschedule":
        return <RotateCcw className="w-4 h-4 text-red-500" />;
      default:
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "done":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "reschedule_requested":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "cancelled_reschedule":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    }
  };

  const getTypeColor = (type: string) => {
    return type === "Initial" 
      ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
      : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "confirmed":
        return "Confirmed";
      case "done":
        return "Completed";
      case "reschedule_requested":
        return "Reschedule Requested";
      case "cancelled_reschedule":
        return "Cancelled & Reschedule";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <Card>
            <CardContent className="p-8">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Header with Back Navigation */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" className="mb-4" asChild>
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold mb-2">Appointment Management</h1>
          <p className="text-muted-foreground">
            Review and manage client appointment requests
          </p>
        </div>

        {/* Status Overview Dashboard */}
        {statusOverview && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Invoices</p>
                  <p className="text-2xl font-bold text-orange-600">{statusOverview.pendingInvoices}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-500" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Missing Consent</p>
                  <p className="text-2xl font-bold text-red-600">{statusOverview.missingConsentForms}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pre-Evaluation</p>
                  <p className="text-2xl font-bold text-yellow-600">{statusOverview.pendingPreEvaluation}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Late Changes</p>
                  <p className="text-2xl font-bold text-purple-600">{statusOverview.lateChanges}</p>
                </div>
                <RotateCcw className="h-8 w-8 text-purple-500" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">No Shows</p>
                  <p className="text-2xl font-bold text-red-600">{statusOverview.noShows}</p>
                </div>
                <CalendarX className="h-8 w-8 text-red-500" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Appointments</p>
                  <p className="text-2xl font-bold text-green-600">{statusOverview.totalAppointments}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </Card>
          </div>
        )}

        {/* Enhanced Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search appointments by name, email, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="done">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="reschedule_requested">Reschedule Requested</SelectItem>
                  <SelectItem value="cancelled_reschedule">Cancelled & Reschedule</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Filter */}
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Dates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="future">Future</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Summary */}
            <div className="flex items-center justify-end mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {processedAppointments.length} of {appointments?.length || 0} appointments
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Appointments ({processedAppointments.length})</span>
              <div className="flex gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-yellow-500" />
                  {processedAppointments.filter(a => a.status === "pending").length} Pending
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  {processedAppointments.filter(a => a.status === "confirmed").length} Confirmed
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {processedAppointments.length > 0 ? (
              <div className="h-96 overflow-y-auto border rounded-md">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                        onClick={() => handleColumnSort('client-name')}
                      >
                        Client
                        {getSortIcon('client-name')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                        onClick={() => handleColumnSort('type')}
                      >
                        Type
                        {getSortIcon('type')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                        onClick={() => handleColumnSort('date')}
                      >
                        Date & Time
                        {getSortIcon('date')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                        onClick={() => handleColumnSort('status')}
                      >
                        Status
                        {getSortIcon('status')}
                      </Button>
                    </TableHead>
                    <TableHead>Action Items</TableHead>
                    <TableHead>Email History</TableHead>
                    <TableHead>Booked</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{appointment.name}</p>
                          <p className="text-sm text-muted-foreground">{appointment.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(appointment.type)}>
                          {appointment.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">
                              {new Date(appointment.date).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {appointment.timeslot}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(appointment.status)}
                          <Badge className={getStatusColor(appointment.status)}>
                            {getStatusLabel(appointment.status)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <div className="flex items-center space-x-1">
                            {getActionItemIcons(appointment) ? (
                              getActionItemIcons(appointment)
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </div>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <div className="flex items-center space-x-1">
                            {getEmailHistoryIcons(appointment).length > 0 ? (
                              getEmailHistoryIcons(appointment)
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </div>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {(() => {
                            try {
                              const bookedDate = appointment.createdAt && typeof appointment.createdAt === 'object' && 'toDate' in appointment.createdAt ? 
                                (appointment.createdAt as any).toDate() : 
                                new Date(appointment.createdAt);
                              return bookedDate.toLocaleDateString();
                            } catch {
                              return "Invalid Date";
                            }
                          })()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => startEditingAppointment(appointment)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedAppointment(appointment)}
                              >
                                View Details
                              </Button>
                            </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Appointment Details</DialogTitle>
                              <DialogDescription>
                                Review and manage this appointment request
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedAppointment && (
                              <div className="space-y-6">
                                {/* Client Information */}
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold mb-2">Client Information</h4>
                                    <div className="space-y-2 text-sm">
                                      <p><strong>Name:</strong> {selectedAppointment.name}</p>
                                      <p><strong>Email:</strong> {selectedAppointment.email}</p>
                                      <p><strong>Phone:</strong> {selectedAppointment.phone || "Not provided"}</p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-semibold mb-2">Appointment Details</h4>
                                    <div className="space-y-2 text-sm">
                                      <p><strong>Type:</strong> {selectedAppointment.type} Consultation</p>
                                      <p><strong>Date:</strong> {new Date(selectedAppointment.date).toLocaleDateString()}</p>
                                      <p><strong>Time:</strong> {selectedAppointment.timeslot}</p>
                                      <p><strong>Status:</strong> 
                                        <Badge className={`ml-2 ${getStatusColor(selectedAppointment.status)}`}>
                                          {selectedAppointment.status}
                                        </Badge>
                                      </p>
                                      {(selectedAppointment as any).teamsJoinUrl && (
                                        <p><strong>Teams Meeting:</strong> 
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => window.open((selectedAppointment as any).teamsJoinUrl, '_blank')}
                                            className="ml-2 text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
                                          >
                                            <Video className="w-3 h-3 mr-1" />
                                            Join Meeting
                                          </Button>
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Teams Meeting URL */}
                                <div>
                                  <h4 className="font-semibold mb-2">Teams Meeting</h4>
                                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
                                    <Input
                                      placeholder="Enter Teams meeting URL..."
                                      value={selectedAppointment.teamsJoinUrl || ""}
                                      onChange={(e) => setSelectedAppointment(prev => prev ? {...prev, teamsJoinUrl: e.target.value} : null)}
                                      className="w-full"
                                    />
                                    <Button
                                      size="sm"
                                      onClick={async () => {
                                        if (!selectedAppointment.id) return;
                                        setUpdateLoading(true);
                                        try {
                                          const response = await fetch(`/api/appointments/${selectedAppointment.id}/teams-url`, {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ 
                                              teamsJoinUrl: selectedAppointment.teamsJoinUrl 
                                            })
                                          });
                                          if (response.ok) {
                                            toast({
                                              title: "Success",
                                              description: "Teams meeting URL saved successfully",
                                            });
                                          } else {
                                            throw new Error('Failed to save Teams URL');
                                          }
                                        } catch (error) {
                                          toast({
                                            title: "Error",
                                            description: "Failed to save Teams meeting URL",
                                            variant: "destructive",
                                          });
                                        } finally {
                                          setUpdateLoading(false);
                                        }
                                      }}
                                      disabled={updateLoading}
                                      className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                      <Video className="w-3 h-3 mr-1" />
                                      {updateLoading ? "Saving..." : "Save Meeting URL"}
                                    </Button>
                                    {selectedAppointment.teamsJoinUrl && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => window.open(selectedAppointment.teamsJoinUrl, '_blank')}
                                        className="ml-2"
                                      >
                                        Test Meeting Link
                                      </Button>
                                    )}
                                  </div>
                                </div>

                                {/* Status Management */}
                                <div>
                                  <h4 className="font-semibold mb-2">Status Management</h4>
                                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
                                    <p className="text-sm">Change appointment status (can modify even completed appointments):</p>
                                    <div className="flex gap-2 flex-wrap">
                                      <Button
                                        size="sm"
                                        variant={selectedAppointment.status === "confirmed" ? "default" : "outline"}
                                        onClick={() => handleStatusChange(selectedAppointment.id!, "confirmed")}
                                        disabled={updateLoading}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                      >
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Confirmed
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant={selectedAppointment.status === "done" ? "default" : "outline"}
                                        onClick={() => handleStatusChange(selectedAppointment.id!, "done")}
                                        disabled={updateLoading}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                      >
                                        <UserCheck className="w-3 h-3 mr-1" />
                                        Completed
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant={selectedAppointment.status === "pending" ? "default" : "outline"}
                                        onClick={() => handleStatusChange(selectedAppointment.id!, "pending")}
                                        disabled={updateLoading}
                                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                                      >
                                        <Clock className="w-3 h-3 mr-1" />
                                        Pending
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant={selectedAppointment.status === "cancelled" ? "default" : "outline"}
                                        onClick={() => handleStatusChange(selectedAppointment.id!, "cancelled")}
                                        disabled={updateLoading}
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                      >
                                        <XCircle className="w-3 h-3 mr-1" />
                                        Cancelled
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant={selectedAppointment.status === "reschedule_requested" ? "default" : "outline"}
                                        onClick={() => handleStatusChange(selectedAppointment.id!, "reschedule_requested")}
                                        disabled={updateLoading}
                                        className="bg-orange-600 hover:bg-orange-700 text-white"
                                      >
                                        <CalendarX className="w-3 h-3 mr-1" />
                                        Reschedule Requested
                                      </Button>
                                    </div>
                                  </div>
                                </div>

                                {/* Goals */}
                                <div>
                                  <h4 className="font-semibold mb-2">Client Goals & Notes</h4>
                                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <p className="text-sm">{selectedAppointment.goals}</p>
                                  </div>
                                </div>

                                {/* Booking Information */}
                                <div className="text-xs text-muted-foreground border-t pt-4">
                                  <p>Booked on {new Date(selectedAppointment.createdAt).toLocaleString()}</p>
                                </div>
                              </div>
                            )}

                            <DialogFooter className="gap-2 flex-wrap">
                              <Button
                                variant="outline"
                                onClick={() => setSelectedAppointment(null)}
                              >
                                Close
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No appointments found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your search or filter criteria."
                    : "No appointment requests have been submitted yet."
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Appointment Dialog */}
        <Dialog open={isEditingAppointment} onOpenChange={setIsEditingAppointment}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Appointment</DialogTitle>
              <DialogDescription>
                Change the date and time for this appointment
              </DialogDescription>
            </DialogHeader>
            
            {selectedAppointment && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Client: {selectedAppointment.name}</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Current: {new Date(selectedAppointment.date).toLocaleDateString()} at {selectedAppointment.timeslot}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-date">New Date</Label>
                    <Input
                      id="edit-date"
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-timeslot">New Time Slot</Label>
                    <Select value={editTimeslot} onValueChange={setEditTimeslot}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="09:00">09:00</SelectItem>
                        <SelectItem value="10:00">10:00</SelectItem>
                        <SelectItem value="11:00">11:00</SelectItem>
                        <SelectItem value="13:00">13:00</SelectItem>
                        <SelectItem value="14:00">14:00</SelectItem>
                        <SelectItem value="15:00">15:00</SelectItem>
                        <SelectItem value="16:00">16:00</SelectItem>
                        <SelectItem value="17:00">17:00</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditingAppointment(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditAppointment}
                disabled={updateLoading || !editDate || !editTimeslot}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {updateLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-4 gap-6 mt-8">
          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{filteredAppointments.filter(a => a.status === "pending").length}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{filteredAppointments.filter(a => a.status === "confirmed").length}</p>
              <p className="text-sm text-muted-foreground">Confirmed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{filteredAppointments.filter(a => a.status === "done").length}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="w-8 h-8 text-primary-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {appointments?.filter(a => 
                  new Date(a.date).getMonth() === new Date().getMonth()
                ).length || 0}
              </p>
              <p className="text-sm text-muted-foreground">This Month</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
