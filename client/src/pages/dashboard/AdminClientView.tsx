import { useState, useEffect } from "react";
import { ArrowLeft, User, Search, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { User as UserType } from "@/types";
import { where, orderBy } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminClientView() {
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [, setLocation] = useLocation();
  const { setViewingClient } = useAuth();

  // Fetch all client users
  const { data: clients, loading } = useFirestoreCollection<UserType>("users", [
    where("role", "==", "client"),
    orderBy("name", "asc")
  ]);

  // Filter clients based on search
  const filteredClients = clients?.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Pagination calculations
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClients = filteredClients.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const selectedClient = clients?.find(client => client.uid === selectedClientId);

  const handleClientSelect = async (clientId: string) => {
    setSelectedClientId(clientId);
    await setViewingClient(clientId);
    setLocation('/dashboard');
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-5rem-4rem)] flex items-center justify-center bg-background">
        <Card className="w-full max-w-4xl mx-4">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem-4rem)] flex flex-col bg-background">
      {/* Compact Header */}
      <div className="flex-none px-4 sm:px-6 px-safe py-2 border-b bg-card">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Link>
            </Button>
            <div className="border-l pl-3">
              <h1 className="text-lg font-semibold">Client Dashboard View</h1>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredClients.length} clients
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="max-w-7xl mx-auto w-full h-full flex flex-col px-4 sm:px-6 px-safe py-2">
          {/* Compact Search and Controls */}
          <div className="flex-none mb-2">
            <div className="flex gap-3 items-center p-3 bg-card rounded-lg border">
              <div className="flex-1 relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                <SelectTrigger className="w-20 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent 
                  className="admin-select-content"
                  style={{
                    backgroundColor: 'hsl(var(--popover))',
                    color: 'hsl(var(--popover-foreground))',
                    borderColor: 'hsl(var(--border))',
                    opacity: 1,
                    backdropFilter: 'none'
                  }}
                >
                  <SelectItem value="8">8</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="16">16</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 bg-card rounded-lg border overflow-hidden flex flex-col min-h-0">
            {paginatedClients.length > 0 ? (
              <>
                {/* Mobile Card View for small screens */}
                <div className="block sm:hidden flex-1 overflow-auto min-h-0 p-2">
                  <div className="space-y-2">
                    {paginatedClients.map((client) => (
                      <Card key={client.uid} className="p-2 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Avatar className="h-7 w-7 flex-shrink-0">
                              <AvatarImage src={client.photoURL} alt={client.name} />
                              <AvatarFallback className="text-xs font-medium">
                                {client.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{client.name}</p>
                              <p className="text-[11px] text-muted-foreground truncate">{client.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-[10px] px-1 py-0">
                                  {client.preferredLanguage?.toUpperCase() || 'EN'}
                                </Badge>
                                <span className="text-[11px] text-muted-foreground">
                                  {new Date(client.createdAt).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                          {/* Mobile icon-only, desktop text button */}
                          <div className="flex items-center gap-2">
                            <Button 
                              size="icon"
                              className="h-8 w-8 p-0 sm:hidden"
                              onClick={() => handleClientSelect(client.uid)}
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm"
                              className="h-8 px-3 text-xs hidden sm:inline-flex"
                              onClick={() => handleClientSelect(client.uid)}
                            >
                              View
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block flex-1 overflow-auto min-h-0">
                  <Table>
                    <TableHeader className="sticky top-0 bg-card z-10">
                      <TableRow className="border-b">
                        <TableHead className="w-10 py-2"></TableHead>
                        <TableHead className="py-2">Name</TableHead>
                        <TableHead className="py-2">Email</TableHead>
                        <TableHead className="w-16 py-2">Lang</TableHead>
                        <TableHead className="w-24 py-2">Joined</TableHead>
                        <TableHead className="w-32 py-2 text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedClients.map((client) => (
                        <TableRow key={client.uid} className="hover:bg-muted/50 border-b">
                          <TableCell className="py-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={client.photoURL} alt={client.name} />
                              <AvatarFallback className="text-xs font-medium">
                                {client.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell className="py-2 font-medium">{client.name}</TableCell>
                          <TableCell className="py-2 text-muted-foreground text-sm">{client.email}</TableCell>
                          <TableCell className="py-2">
                            <Badge variant="secondary" className="text-xs px-1 py-0">
                              {client.preferredLanguage?.toUpperCase() || 'EN'}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2 text-xs text-muted-foreground">
                            {new Date(client.createdAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: '2-digit'
                            })}
                          </TableCell>
                          <TableCell className="py-2 text-right">
                            <Button 
                              size="sm"
                              className="h-8 px-3 text-xs"
                              onClick={() => handleClientSelect(client.uid)}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Compact Pagination */}
                {totalPages > 1 && (
                  <div className="flex-none border-t px-4 py-2 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredClients.length)} of {filteredClients.length}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-3 w-3" />
                        </Button>
                        
                        {/* Simplified pagination - show fewer pages */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage === 1) {
                              pageNum = i + 1;
                            } else if (currentPage === totalPages) {
                              pageNum = totalPages - 2 + i;
                            } else {
                              pageNum = currentPage - 1 + i;
                            }
                            
                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                size="sm"
                                className="h-7 w-7 p-0 text-xs"
                                onClick={() => setCurrentPage(pageNum)}
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <User className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? "No clients found" : "No clients available"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}