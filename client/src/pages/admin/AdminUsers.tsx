import { useState } from "react";
import { Search, MoreHorizontal, Shield, User, Trash2, Edit, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { FloatingOrganic, DoodleConnector } from "@/components/ui/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { User as UserType } from "@/types";
import { orderBy } from "firebase/firestore";

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const { toast } = useToast();

  // Fetch users
  const { data: users, loading } = useFirestoreCollection<UserType>("users", [
    orderBy("createdAt", "desc")
  ]);

  const { update: updateUser, remove: removeUser, loading: actionLoading } = useFirestoreActions("users");

  // Filter users
  const filteredUsers = users?.filter(user => {
    const matchesSearch = !searchTerm || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  }) || [];

  const handleRoleChange = async (userId: string, newRole: "client" | "admin") => {
    try {
      await updateUser(userId, { role: newRole });
      toast({
        title: "Role updated",
        description: `User role has been changed to ${newRole}.`,
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update user role. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    try {
      await removeUser(userId);
      toast({
        title: "User deleted",
        description: `${userName} has been removed from the system.`,
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      case "client":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">User Management</h1>
              <p className="text-muted-foreground">
                Manage client accounts and user permissions
              </p>
            </div>
            <Button variant="outline" asChild className="bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100">
              <Link href="/admin/cleanup">
                <Trash2 className="mr-2 h-4 w-4" />
                Clean Up Duplicates
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Role Filter */}
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="client">Clients</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Users ({filteredUsers.length})</span>
              <div className="flex gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {filteredUsers.filter(u => u.role === "client").length} Clients
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {filteredUsers.filter(u => u.role === "admin").length} Admins
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredUsers.length > 0 ? (
              <div className="h-96 overflow-y-auto border rounded-md">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Service Plan</TableHead>
                    <TableHead>Program Dates</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.photoURL} />
                            <AvatarFallback>
                              {user.name?.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {user.role === "admin" ? (
                            <>
                              <Shield className="w-3 h-3 mr-1" />
                              Admin
                            </>
                          ) : (
                            <>
                              <User className="w-3 h-3 mr-1" />
                              Client
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.role === "client" ? (
                            <Badge variant={user.servicePlan === "complete-program" ? "default" : "secondary"}>
                              {user.servicePlan === "complete-program" ? "Complete Program" : "Pay As You Go"}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.role === "client" && user.servicePlan === "complete-program" && user.programStartDate ? (
                            <div>
                              <div className="text-xs text-muted-foreground">Start:</div>
                              <div>{(() => {
                                try {
                                  const startDate = user.programStartDate && typeof user.programStartDate === 'object' && 'toDate' in user.programStartDate ? 
                                    (user.programStartDate as any).toDate() : 
                                    new Date(user.programStartDate);
                                  return startDate.toLocaleDateString();
                                } catch {
                                  return "Invalid Date";
                                }
                              })()}</div>
                              {user.programEndDate && (
                                <>
                                  <div className="text-xs text-muted-foreground mt-1">End:</div>
                                  <div>{(() => {
                                    try {
                                      const endDate = user.programEndDate && typeof user.programEndDate === 'object' && 'toDate' in user.programEndDate ? 
                                        (user.programEndDate as any).toDate() : 
                                        new Date(user.programEndDate);
                                      return endDate.toLocaleDateString();
                                    } catch {
                                      return "Invalid Date";
                                    }
                                  })()}</div>
                                </>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {user.preferredLanguage === "en" ? "🇺🇸 English" : 
                           user.preferredLanguage === "cs" ? "🇨🇿 Czech" : 
                           user.preferredLanguage === "af" ? "🇿🇦 Afrikaans" : "🇺🇸 English"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {(() => {
                            try {
                              const joinDate = user.createdAt && typeof user.createdAt === 'object' && 'toDate' in user.createdAt ? 
                                (user.createdAt as any).toDate() : 
                                new Date(user.createdAt);
                              return joinDate.toLocaleDateString();
                            } catch {
                              return "Invalid Date";
                            }
                          })()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="!bg-white border-2">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/users/${user.uid}`} className="flex w-full">
                                <Edit className="w-4 h-4 mr-2" />
                                View Profile
                              </Link>
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            {/* Role Change Options */}
                            {user.role === "client" ? (
                              <DropdownMenuItem 
                                onClick={() => handleRoleChange(user.uid, "admin")}
                                disabled={actionLoading}
                              >
                                <Shield className="w-4 h-4 mr-2" />
                                Make Admin
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                onClick={() => handleRoleChange(user.uid, "client")}
                                disabled={actionLoading}
                              >
                                <User className="w-4 h-4 mr-2" />
                                Make Client
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator />
                            
                            {/* Delete User */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem 
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-red-600 dark:text-red-400"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete User
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {user.name}? This action cannot be undone.
                                    All user data including appointments, messages, and progress will be permanently removed.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteUser(user.uid, user.name)}
                                    className="bg-red-600 hover:bg-red-700"
                                    disabled={actionLoading}
                                  >
                                    {actionLoading ? "Deleting..." : "Delete"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No users found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || roleFilter !== "all" 
                    ? "Try adjusting your search or filter criteria."
                    : "No users have registered yet."
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardContent className="p-6 text-center">
              <User className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{filteredUsers.filter(u => u.role === "client").length}</p>
              <p className="text-sm text-muted-foreground">Total Clients</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{filteredUsers.filter(u => u.role === "admin").length}</p>
              <p className="text-sm text-muted-foreground">Admin Users</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-8 h-8 mx-auto mb-2 text-green-500">📈</div>
              <p className="text-2xl font-bold">
                {users?.filter(u => 
                  new Date(u.createdAt).getMonth() === new Date().getMonth()
                ).length || 0}
              </p>
              <p className="text-sm text-muted-foreground">New This Month</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
