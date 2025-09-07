import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, AlertTriangle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { User } from "@/types";
import { Link } from "wouter";

export default function AdminCleanupUsers() {
  const [duplicates, setDuplicates] = useState<{ [email: string]: User[] }>({});
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const { toast } = useToast();

  const scanForDuplicates = async () => {
    setScanning(true);
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      const usersByEmail: { [email: string]: User[] } = {};
      
      snapshot.forEach(doc => {
        const userData = { id: doc.id, ...doc.data() } as User;
        if (!usersByEmail[userData.email]) {
          usersByEmail[userData.email] = [];
        }
        usersByEmail[userData.email].push(userData);
      });
      
      // Filter to only show duplicates
      const duplicateUsers = Object.fromEntries(
        Object.entries(usersByEmail).filter(([_, users]) => users.length > 1)
      );
      
      setDuplicates(duplicateUsers);
      
      const duplicateCount = Object.values(duplicateUsers).reduce((sum, users) => sum + users.length - 1, 0);
      
      toast({
        title: "Scan Complete",
        description: `Found ${duplicateCount} duplicate users across ${Object.keys(duplicateUsers).length} email addresses.`,
      });
    } catch (error) {
      console.error('Error scanning for duplicates:', error);
      toast({
        title: "Scan Failed",
        description: "Failed to scan for duplicate users.",
        variant: "destructive",
      });
    } finally {
      setScanning(false);
    }
  };

  const removeDuplicate = async (user: User) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'users', user.id));
      
      // Update local state
      setDuplicates(prev => {
        const updated = { ...prev };
        updated[user.email] = updated[user.email].filter(u => u.id !== user.id);
        if (updated[user.email].length <= 1) {
          delete updated[user.email];
        }
        return updated;
      });
      
      toast({
        title: "User Removed",
        description: `Duplicate user ${user.name} (${user.email}) has been removed.`,
      });
    } catch (error) {
      console.error('Error removing duplicate:', error);
      toast({
        title: "Remove Failed",
        description: "Failed to remove duplicate user.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin Dashboard
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            User Cleanup Tool
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Button 
              onClick={scanForDuplicates} 
              disabled={scanning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {scanning ? "Scanning..." : "Scan for Duplicates"}
            </Button>
            
            {Object.keys(duplicates).length > 0 && (
              <Badge variant="destructive">
                {Object.values(duplicates).reduce((sum, users) => sum + users.length - 1, 0)} duplicates found
              </Badge>
            )}
          </div>

          {Object.entries(duplicates).map(([email, users]) => (
            <Card key={email} className="border-red-200">
              <CardHeader>
                <CardTitle className="text-lg text-red-700">
                  Duplicate Email: {email}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {users.map((user, index) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">
                          ID: {user.id} | Role: {user.role} | 
                          Created: {user.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {index === 0 ? (
                          <Badge variant="default">Keep (Oldest)</Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeDuplicate(user)}
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {Object.keys(duplicates).length === 0 && !scanning && (
            <div className="text-center text-gray-500 py-8">
              Click "Scan for Duplicates" to check for duplicate users in your system.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}