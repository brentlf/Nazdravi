import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface TimeSlot {
  time: string;
  available: boolean;
}

export function useAvailableSlots(selectedDate: string) {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  // Enhanced scheduling rules: day-specific time slots
  const getTimeSlotsByDay = (date: string): string[] => {
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Sundays: No bookings allowed
    if (dayOfWeek === 0) {
      return [];
    }
    
    // Saturdays: 8:00 to 11:00
    if (dayOfWeek === 6) {
      return ["08:00", "09:00", "10:00", "11:00"];
    }
    
    // Tuesdays & Thursdays: allow booking up to 21:00
    if (dayOfWeek === 2 || dayOfWeek === 4) {
      return [
        "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00",
        "18:00", "19:00", "20:00", "21:00"
      ];
    }
    
    // All other days (Monday, Wednesday, Friday): last slot = 17:00
    return ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
  };

  useEffect(() => {
    if (!selectedDate) return;

    const fetchAvailableSlots = async () => {
      setLoading(true);
      try {
        // Get existing appointments for the selected date
        const appointmentsRef = collection(db, "appointments");
        const q = query(
          appointmentsRef,
          where("date", "==", selectedDate),
          where("status", "in", ["pending", "confirmed"])
        );
        
        const querySnapshot = await getDocs(q);
        const bookedSlots = querySnapshot.docs.map(doc => doc.data().timeslot);
        
        console.log(`Checking availability for ${selectedDate}:`, {
          bookedSlots,
          totalAppointments: querySnapshot.docs.length
        });

        // Get admin unavailable slots for the selected date
        const unavailableRef = collection(db, "unavailableSlots");
        const unavailableQuery = query(
          unavailableRef,
          where("date", "==", selectedDate)
        );
        
        const unavailableSnapshot = await getDocs(unavailableQuery);
        const unavailableSlots = unavailableSnapshot.docs.flatMap(doc => doc.data().timeslots || []);

        // Get day-specific time slots
        const daySlots = getTimeSlotsByDay(selectedDate);
        
        // If no slots available for this day (e.g., Sundays), return empty array
        if (daySlots.length === 0) {
          setAvailableSlots([]);
          return;
        }

        console.log(`Day-specific slots for ${selectedDate}:`, daySlots);

        // Create availability array using day-specific slots
        const slots: TimeSlot[] = daySlots.map(time => ({
          time,
          available: !bookedSlots.includes(time) && !unavailableSlots.includes(time)
        }));

        setAvailableSlots(slots);
      } catch (error) {
        console.error("Error fetching available slots:", error);
        // Fallback to all slots available if error
        setAvailableSlots(defaultSlots.map(time => ({ time, available: true })));
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableSlots();
  }, [selectedDate]);

  return { availableSlots, loading };
}