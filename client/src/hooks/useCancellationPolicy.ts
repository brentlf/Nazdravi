import { useState, useEffect } from 'react';

export interface CancellationPolicyStatus {
  canCancel: boolean;
  canReschedule: boolean;
  requiresFee: boolean;
  feeAmount: number;
  hoursRemaining: number;
  timeUntilAppointment: string;
  policyMessage: string;
}

export function useCancellationPolicy(appointmentDate: string, appointmentTime: string) {
  const [policyStatus, setPolicyStatus] = useState<CancellationPolicyStatus>({
    canCancel: true,
    canReschedule: true,
    requiresFee: false,
    feeAmount: 0,
    hoursRemaining: 0,
    timeUntilAppointment: '',
    policyMessage: ''
  });

  useEffect(() => {
    const checkPolicy = () => {
      try {
        // Combine date and time into a single datetime
        const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}:00`);
        const now = new Date();
        
        // Calculate hours until appointment
        const millisecondsUntil = appointmentDateTime.getTime() - now.getTime();
        const hoursUntil = millisecondsUntil / (1000 * 60 * 60);
        
        // Format time remaining
        const formatTimeRemaining = (hours: number): string => {
          if (hours < 0) return 'Appointment has passed';
          if (hours < 1) return `${Math.floor(hours * 60)} minutes`;
          if (hours < 24) return `${Math.floor(hours)} hours ${Math.floor((hours % 1) * 60)} minutes`;
          const days = Math.floor(hours / 24);
          const remainingHours = Math.floor(hours % 24);
          return `${days} day${days > 1 ? 's' : ''} ${remainingHours} hour${remainingHours > 1 ? 's' : ''}`;
        };

        let status: CancellationPolicyStatus;

        if (hoursUntil < -1) {
          // Appointment has passed (more than 1 hour ago)
          status = {
            canCancel: false,
            canReschedule: false,
            requiresFee: false,
            feeAmount: 0,
            hoursRemaining: hoursUntil,
            timeUntilAppointment: formatTimeRemaining(hoursUntil),
            policyMessage: 'This appointment has already passed and cannot be modified.'
          };
        } else if (hoursUntil >= -1 && hoursUntil <= 1) {
          // Within 1 hour window (before or after) - free cancellation/reschedule
          status = {
            canCancel: true,
            canReschedule: true,
            requiresFee: false,
            feeAmount: 0,
            hoursRemaining: hoursUntil,
            timeUntilAppointment: formatTimeRemaining(Math.abs(hoursUntil)),
            policyMessage: hoursUntil < 0 
              ? 'You can still cancel or reschedule within 1 hour after your appointment time with no charge.'
              : 'You can cancel or reschedule with no charge within 1 hour of your appointment.'
          };
        } else if (hoursUntil > 1 && hoursUntil <= 4) {
          // Between 1-4 hours - €5 reschedule fee, free cancellation
          status = {
            canCancel: true,
            canReschedule: true,
            requiresFee: true,
            feeAmount: 5,
            hoursRemaining: hoursUntil,
            timeUntilAppointment: formatTimeRemaining(hoursUntil),
            policyMessage: 'Rescheduling within 4 hours requires a €5 administrative fee. Cancellation is still free.'
          };
        } else {
          // More than 4 hours - free cancellation and reschedule
          status = {
            canCancel: true,
            canReschedule: true,
            requiresFee: false,
            feeAmount: 0,
            hoursRemaining: hoursUntil,
            timeUntilAppointment: formatTimeRemaining(hoursUntil),
            policyMessage: 'You can cancel or reschedule free of charge.'
          };
        }

        setPolicyStatus(status);
      } catch (error) {
        console.error('Error calculating cancellation policy:', error);
        setPolicyStatus({
          canCancel: false,
          canReschedule: false,
          requiresFee: false,
          feeAmount: 0,
          hoursRemaining: 0,
          timeUntilAppointment: 'Unable to calculate',
          policyMessage: 'Unable to determine cancellation policy. Please contact support.'
        });
      }
    };

    checkPolicy();
    
    // Update every minute to keep countdown current
    const interval = setInterval(checkPolicy, 60000);
    
    return () => clearInterval(interval);
  }, [appointmentDate, appointmentTime]);

  return policyStatus;
}