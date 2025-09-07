import { useState } from "react";
import { FileText, Upload, Download, Search, Plus, Calendar, User, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useFirestoreCollection, useFirestoreActions } from "@/hooks/useFirestore";
import { Plan, User as UserType } from "@/types";
import { orderBy } from "firebase/firestore";

export default function AdminPlans() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const { toast } = useToast();

  // Fetch plans
  const { data: plans, loading } = useFirestoreCollection<Plan>("plans", [
    orderBy("createdAt", "desc")
  ]);

  // Fetch users for displaying client names
  const { data: users } = useFirestoreCollection<UserType>("users");

  const { remove: deletePlan, loading: actionLoading } = useFirestoreActions("plans");

  // Filter plans
  const filteredPlans = plans?.filter(plan => {
    if (!searchTerm) return true;
    const user = users?.find(u => u.uid === plan.userId);
    return plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user?.email.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  const getUserName = (userId: string) => {
    const user = users?.find(u => u.uid === userId);
    return user?.name || "Unknown User";
  };

  const getUserEmail = (userId: string) => {
    const user = users?.find(u => u.uid === userId);
    return user?.email || "";
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      await deletePlan(planId);
      toast({
        title: "Plan deleted",
        description: "The nutrition plan has been removed successfully.",
      });
      setSelectedPlan(null);
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete the plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPlan = (plan: Plan) => {
    // In a real implementation, this would download from Firebase Storage
    toast({
      title: "Download started",
      description: `Downloading ${plan.title}...`,
    });
  };

  if (loading) {
    return (
      <div className="viewport-fit bg-background">        <div className="viewport-content py-20">
        <div className="container mx-auto px-4">
          <Card>
            <CardContent className="p-8">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="viewport-fit bg-background">      <div className="viewport-content py-20">
      <div className="container mx-auto px-4">
        {/* Header with Back Navigation */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" className="mb-4" asChild>
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold mb-2">Nutrition Plans</h1>
          <p className="text-muted-foreground">
            Manage client nutrition plans and documents
          </p>
        </div>

        {/* Actions and Search */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search plans by title or client name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Upload Button */}
              <Button className="bg-brand text-brand-foreground hover:brightness-110">
                <Upload className="w-4 h-4 mr-2" />
                Upload New Plan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Plans Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Plans ({filteredPlans.length})</span>
              <Badge variant="outline" className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {plans?.length || 0} Total Plans
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPlans.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan Title</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>File Path</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-info" />
                          <span className="font-medium">{plan.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{getUserName(plan.userId)}</p>
                          <p className="text-sm text-muted-foreground">{getUserEmail(plan.userId)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(plan.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {plan.storagePath}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadPlan(plan)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedPlan(plan)}
                              >
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Plan Details</DialogTitle>
                                <DialogDescription>
                                  Review nutrition plan information
                                </DialogDescription>
                              </DialogHeader>
                              
                              {selectedPlan && (
                                <div className="space-y-6">
                                  <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-semibold mb-2">Plan Information</h4>
                                      <div className="space-y-2 text-sm">
                                        <p><strong>Title:</strong> {selectedPlan.title}</p>
                                        <p><strong>Storage Path:</strong> {selectedPlan.storagePath}</p>
                                        <p><strong>Created:</strong> {new Date(selectedPlan.createdAt).toLocaleString()}</p>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h4 className="font-semibold mb-2">Client Information</h4>
                                      <div className="space-y-2 text-sm">
                                        <p><strong>Name:</strong> {getUserName(selectedPlan.userId)}</p>
                                        <p><strong>Email:</strong> {getUserEmail(selectedPlan.userId)}</p>
                                        <p><strong>Client ID:</strong> {selectedPlan.userId}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              <DialogFooter className="gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => setSelectedPlan(null)}
                                >
                                  Close
                                </Button>
                                <Button
                                  onClick={() => selectedPlan && handleDownloadPlan(selectedPlan)}
                                  className="bg-brand text-brand-foreground hover:brightness-110"
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Download Plan
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => selectedPlan && handleDeletePlan(selectedPlan.id!)}
                                  disabled={actionLoading}
                                >
                                  {actionLoading ? "Deleting..." : "Delete Plan"}
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
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No nutrition plans found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "No plans match your search criteria." : "Upload your first nutrition plan to get started."}
                </p>
                <Button className="bg-brand text-brand-foreground hover:brightness-110">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Plan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}