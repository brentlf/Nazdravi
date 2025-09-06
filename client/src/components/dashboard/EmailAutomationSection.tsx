import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Clock, CheckCircle, AlertCircle, Eye, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface EmailRecord {
  id: string;
  subject: string;
  to: string;
  status: 'pending' | 'delivered' | 'opened' | 'failed';
  timestamp: any;
  type: 'appointment-confirmation' | 'invoice-generated' | 'appointment-cancelled' | 'late-reschedule' | 'no-show' | 'reminder' | 'other';
}

export function EmailAutomationSection() {
  const { user } = useAuth();
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailPreferences, setEmailPreferences] = useState({
    appointmentReminders: true,
    invoiceNotifications: true,
    cancellationNotices: true,
    marketingEmails: false
  });

  useEffect(() => {
    if (user?.email) {
      fetchEmailHistory();
    }
  }, [user?.email]);

  const fetchEmailHistory = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    try {
      const emailsRef = collection(db, 'mail');
      const q = query(
        emailsRef,
        where('to', '==', user.email),
        orderBy('timestamp', 'desc'),
        limit(20)
      );
      
      const querySnapshot = await getDocs(q);
      const emailData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EmailRecord[];
      
      setEmails(emailData);
    } catch (error) {
      console.error('Error fetching email history:', error);
      toast({
        title: "Error",
        description: "Failed to load email history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'opened':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Mail className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (rawStatus: string) => {
    // Map backend statuses to UI statuses
    const status = rawStatus === 'sent' ? 'delivered' : rawStatus;
    const variants = {
      delivered: 'default',
      opened: 'secondary',
      pending: 'outline',
      failed: 'destructive'
    } as const;

    return (
      <Badge variant={variants[(status as keyof typeof variants)] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getEmailTypeLabel = (type: string) => {
    const labels = {
      'appointment-confirmation': 'Appointment Confirmation',
      'invoice-generated': 'Invoice Generated',
      'appointment-cancelled': 'Appointment Cancelled',
      'late-reschedule': 'Late Reschedule Notice',
      'no-show': 'No-Show Notice',
      'reminder': 'Appointment Reminder',
      'other': 'System Email'
    };
    return labels[type as keyof typeof labels] || 'Email';
  };

  const formatDate = (timestamp: any) => {
    try {
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return 'Unknown date';
    }
  };

  const handleResendEmail = async (emailId: string) => {
    toast({
      title: "Feature Coming Soon",
      description: "Email resend functionality will be available soon",
    });
  };

  const updateEmailPreferences = async () => {
    try {
      if (!user?.uid) return;
      const prefRef = collection(db, 'users');
      // Write to users/{uid} document (merge)
      // Using fetch to avoid adding new imports for updateDoc in this context
      // In the actual codebase, prefer: updateDoc(doc(db,'users',user.uid), { emailPreferences })
      // Here we fallback to Firestore REST via callable API if present; otherwise no-op UI ack
      // Minimal persistence approach for now:
      // @ts-ignore
      const { updateDoc, doc } = await import('firebase/firestore');
      // @ts-ignore
      await updateDoc(doc(db as any, 'users', user.uid), { emailPreferences });
      toast({
        title: "Preferences Updated",
        description: "Your email preferences have been saved",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Communications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Communications
          </CardTitle>
          <CardDescription>
            Track your email notifications and manage preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {emails.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No email communications yet</p>
              </div>
            ) : (
              emails.map((email) => (
                <div
                  key={email.id}
                  className="flex items-start justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(email.status)}
                    <div className="space-y-1">
                      <p className="font-medium">{email.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        {getEmailTypeLabel(email.type)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(email.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(email.status)}
                    {email.status === 'failed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResendEmail(email.id)}
                      >
                        Resend
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Preferences</CardTitle>
          <CardDescription>
            Manage which types of emails you'd like to receive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Appointment Reminders</p>
                <p className="text-sm text-muted-foreground">
                  Receive reminders before your appointments
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailPreferences.appointmentReminders}
                onChange={(e) =>
                  setEmailPreferences(prev => ({
                    ...prev,
                    appointmentReminders: e.target.checked
                  }))
                }
                className="h-4 w-4"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Invoice Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when new invoices are generated
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailPreferences.invoiceNotifications}
                onChange={(e) =>
                  setEmailPreferences(prev => ({
                    ...prev,
                    invoiceNotifications: e.target.checked
                  }))
                }
                className="h-4 w-4"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Cancellation Notices</p>
                <p className="text-sm text-muted-foreground">
                  Receive notifications about appointment changes
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailPreferences.cancellationNotices}
                onChange={(e) =>
                  setEmailPreferences(prev => ({
                    ...prev,
                    cancellationNotices: e.target.checked
                  }))
                }
                className="h-4 w-4"
              />
            </div>
            
            <Button onClick={updateEmailPreferences} className="w-full">
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}