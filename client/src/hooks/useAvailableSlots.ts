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

  // 30-minute appointments starting only at the top of each hour
  const defaultSlots = [
    "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"
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
          where("status", "in", ["requested", "confirmed"])
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