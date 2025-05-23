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

  // Default time slots for nutrition consultations
  const defaultSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00"
  ];

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

        // Create availability array
        const slots: TimeSlot[] = defaultSlots.map(time => ({
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