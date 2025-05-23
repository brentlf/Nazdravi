import { useState } from "react";
import { Search, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { orderBy, where } from "firebase/firestore";

export default function AdminAppointments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const { toast } = useToast();

  // Fetch appointments
  const { data: appointments, loading } = useFirestoreCollection<Appointment>("appointments", [
    orderBy("date", "desc")
  ]);

  const { update: updateAppointment, loading: actionLoading } = useFirestoreActions("appointments");

  // Filter appointments
  const filteredAppointments = appointments?.filter(appointment => {
    const matchesSearch = !searchTerm || 
      appointment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const handleStatusChange = async (appointmentId: string, newStatus: "confirmed" | "done") => {
    try {
      await updateAppointment(appointmentId, { status: newStatus });
      toast({
        title: "Appointment updated",
        description: `Appointment status changed to ${newStatus}.`,
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "done":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "done":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      default:
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    }
  };

  const getTypeColor = (type: string) => {
    return type === "Initial" 
      ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
      : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Appointment Management</h1>
          <p className="text-muted-foreground">
            Review and manage client appointment requests
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
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
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="done">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Appointments ({filteredAppointments.length})</span>
              <div className="flex gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-yellow-500" />
                  {filteredAppointments.filter(a => a.status === "pending").length} Pending
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  {filteredAppointments.filter(a => a.status === "confirmed").length} Confirmed
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAppointments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Booked</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment) => (
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
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(appointment.createdAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
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

                            <DialogFooter className="gap-2">
                              {selectedAppointment?.status === "pending" && (
                                <>
                                  <Button
                                    variant="outline"
                                    onClick={() => setSelectedAppointment(null)}
                                  >
                                    Close
                                  </Button>
                                  <Button
                                    onClick={() => handleStatusChange(selectedAppointment.id!, "confirmed")}
                                    disabled={actionLoading}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    {actionLoading ? "Confirming..." : "Confirm Appointment"}
                                  </Button>
                                </>
                              )}
                              
                              {selectedAppointment?.status === "confirmed" && (
                                <>
                                  <Button
                                    variant="outline"
                                    onClick={() => setSelectedAppointment(null)}
                                  >
                                    Close
                                  </Button>
                                  <Button
                                    onClick={() => handleStatusChange(selectedAppointment.id!, "done")}
                                    disabled={actionLoading}
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    {actionLoading ? "Updating..." : "Mark as Completed"}
                                  </Button>
                                </>
                              )}
                              
                              {selectedAppointment?.status === "done" && (
                                <Button
                                  variant="outline"
                                  onClick={() => setSelectedAppointment(null)}
                                >
                                  Close
                                </Button>
                              )}
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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

        {/* Summary Stats */}
        <div className="grid md:grid-cols-4 gap-6 mt-8">
          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{filteredAppointments.filter(a => a.status === "pending").length}</p>
              <p className="text-sm text-muted-foreground">Pending Review</p>
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
