import { useState } from "react";
import { Calendar, Clock, Plus, Trash2, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useFirestoreCollection, useFirestoreActions } from "@/hooks/useFirestore";

interface UnavailableSlot {
  id?: string;
  date: string;
  timeslots: string[];
  reason?: string;
  createdAt: Date;
}

export default function AdminAvailability() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const { toast } = useToast();

  const { data: unavailableSlots, loading } = useFirestoreCollection<UnavailableSlot>("unavailableSlots");
  const { add: addUnavailableSlot, remove: removeUnavailableSlot } = useFirestoreActions("unavailableSlots");

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00"
  ];

  const handleTimeToggle = (time: string) => {
    setSelectedTimes(prev => 
      prev.includes(time) 
        ? prev.filter(t => t !== time)
        : [...prev, time]
    );
  };

  const handleSubmit = async () => {
    if (!selectedDate || selectedTimes.length === 0) {
      toast({
        title: "Missing information",
        description: "Please select a date and at least one time slot.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addUnavailableSlot({
        date: selectedDate,
        timeslots: selectedTimes,
        reason: reason || "Not available",
        createdAt: new Date(),
      });

      toast({
        title: "Availability updated",
        description: "Selected time slots have been marked as unavailable.",
      });

      setSelectedDate("");
      setSelectedTimes([]);
      setReason("");
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveSlot = async (slotId: string) => {
    try {
      await removeUnavailableSlot(slotId);
      toast({
        title: "Availability restored",
        description: "Time slots are now available for booking.",
      });
    } catch (error) {
      toast({
        title: "Remove failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Manage Availability</h1>
          <p className="text-muted-foreground">
            Set your unavailable dates and times for client bookings
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Add Unavailable Slots */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#A5CBA4]" />
                Block Time Slots
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="date">Select Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <Label>Select Time Slots to Block</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTimes.includes(time) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleTimeToggle(time)}
                      className={selectedTimes.includes(time) ? "bg-red-500 hover:bg-red-600" : ""}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="reason">Reason (Optional)</Label>
                <Input
                  id="reason"
                  placeholder="e.g., Conference, Personal appointment"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleSubmit}
                className="w-full bg-[#A5CBA4] hover:bg-[#95bb94] text-white"
                disabled={!selectedDate || selectedTimes.length === 0}
              >
                <Save className="w-4 h-4 mr-2" />
                Block Selected Times
              </Button>
            </CardContent>
          </Card>

          {/* Current Unavailable Slots */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#A5CBA4]" />
                Current Blocked Times
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : unavailableSlots && unavailableSlots.length > 0 ? (
                <div className="space-y-4">
                  {unavailableSlots.map((slot) => (
                    <div key={slot.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(slot.date).toLocaleDateString()}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {slot.timeslots.map((time) => (
                              <span key={time} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                                {time}
                              </span>
                            ))}
                          </div>
                          {slot.reason && (
                            <p className="text-sm text-muted-foreground mt-2">
                              Reason: {slot.reason}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveSlot(slot.id!)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No blocked time slots</h3>
                  <p className="text-muted-foreground">
                    All time slots are currently available for client bookings.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}