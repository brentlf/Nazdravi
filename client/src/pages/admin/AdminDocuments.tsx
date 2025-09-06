import { useState } from "react";
import { ArrowLeft, Upload, Download, FileText, Trash2, Search, Plus, Filter, SortAsc, Eye, Calendar, User, FileType, MoreVertical, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useFirestoreCollection, useFirestoreActions } from "@/hooks/useFirestore";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { Plan } from "@/types";

interface DocumentUploadData {
  clientUserId: string;
  title: string;
  description: string;
  file: File | null;
}

export default function AdminDocuments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title" | "client">("newest");
  const [fileTypeFilter, setFileTypeFilter] = useState<string>("all");
  const [uploadData, setUploadData] = useState<DocumentUploadData>({
    clientUserId: "",
    title: "",
    description: "",
    file: null
  });
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const { toast } = useToast();

  // Fetch clients
  const { data: users } = useFirestoreCollection<User>("users", []);
  const clients = users?.filter(user => user.role === "client") || [];

  // Fetch documents/plans
  const { data: documents } = useFirestoreCollection<Plan>("plans", []);
  const { add: addDocument, remove: removeDocument } = useFirestoreActions("plans");

  // Filter clients based on search
  const filteredClients = clients.filter(client =>
    !searchTerm ||
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get documents for selected client
  let clientDocuments = selectedClient 
    ? documents?.filter(doc => doc.userId === selectedClient) || []
    : documents || [];

  // Apply file type filter
  if (fileTypeFilter !== "all") {
    clientDocuments = clientDocuments.filter(doc => {
      if (!doc.fileType) return fileTypeFilter === "other";
      return doc.fileType.startsWith(fileTypeFilter);
    });
  }

  // Apply sorting
  clientDocuments = [...clientDocuments].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "title":
        return a.title.localeCompare(b.title);
      case "client":
        return getClientName(a.userId).localeCompare(getClientName(b.userId));
      default:
        return 0;
    }
  });

  // Get unique file types for filter
  const fileTypes = Array.from(new Set(
    documents?.map(doc => {
      if (!doc.fileType) return "other";
      const type = doc.fileType.split('/')[0];
      return type === 'application' ? 'document' : type;
    }) || []
  ));
  
  // Debug: Log all documents to see what's in the database
  console.log('Admin Documents Debug:', {
    totalDocuments: documents?.length || 0,
    allDocuments: documents,
    selectedClient,
    clientDocuments: clientDocuments.length
  });

  const getClientName = (userId: string) => {
    const client = clients.find(c => c.uid === userId);
    return client?.name || "Unknown Client";
  };

  const getFileTypeIcon = (fileType: string) => {
    if (!fileType) return FileType;
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('application/pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return '📊';
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return '📈';
    return '📎';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeColor = (fileType: string) => {
    if (!fileType) return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    if (fileType.startsWith('image/')) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (fileType.startsWith('application/pdf')) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    if (fileType.includes('word') || fileType.includes('document')) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setUploadData(prev => ({ ...prev, file }));
  };

  const handleUploadDocument = async () => {
    if (!uploadData.file || !uploadData.clientUserId || !uploadData.title.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields and select a file.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      // Upload file to Firebase Storage
      const fileRef = ref(storage, `documents/${uploadData.clientUserId}/${Date.now()}_${uploadData.file.name}`);
      const uploadResult = await uploadBytes(fileRef, uploadData.file);
      const downloadURL = await getDownloadURL(uploadResult.ref);

      // Save document metadata to Firestore
      const documentData = {
        userId: uploadData.clientUserId,
        title: uploadData.title,
        description: uploadData.description,
        storagePath: uploadResult.ref.fullPath,
        downloadURL,
        fileName: uploadData.file.name,
        fileSize: uploadData.file.size,
        fileType: uploadData.file.type,
        createdAt: new Date()
      };
      
      console.log('Uploading document with data:', documentData);
      await addDocument(documentData);

      toast({
        title: "Document uploaded",
        description: `Successfully uploaded ${uploadData.title} for ${getClientName(uploadData.clientUserId)}.`
      });

      // Reset form
      setUploadData({
        clientUserId: "",
        title: "",
        description: "",
        file: null
      });
      setDialogOpen(false);

    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (document: Plan) => {
    try {
      // Delete file from Firebase Storage
      if (document.storagePath) {
        const fileRef = ref(storage, document.storagePath);
        await deleteObject(fileRef);
      }

      // Remove document from Firestore
      await removeDocument(document.id);

      toast({
        title: "Document deleted",
        description: "Document has been removed successfully."
      });

    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Delete failed",
        description: "Failed to delete document. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadDocument = (doc: Plan) => {
    if (doc.downloadURL) {
      const link = window.document.createElement('a');
      link.href = doc.downloadURL;
      link.download = doc.fileName || doc.title;
      link.target = '_blank';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-3 py-4">
        {/* Header with Back Navigation */}
        <div className="mb-4">
          <Button variant="ghost" size="sm" className="mb-3 hover:bg-white/50" asChild>
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin Dashboard
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                Client Documents
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-base">
                Upload and manage nutritional plans and documents for your clients
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle className="text-xl">Upload New Document</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="client-select" className="text-sm font-medium">Select Client</Label>
                      <Select 
                        value={uploadData.clientUserId} 
                        onValueChange={(value) => setUploadData(prev => ({ ...prev, clientUserId: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Choose a client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map(client => (
                            <SelectItem key={client.uid} value={client.uid}>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                {client.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="title" className="text-sm font-medium">Document Title</Label>
                      <Input
                        id="title"
                        value={uploadData.title}
                        onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Nutrition Plan - Week 1"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                      <Textarea
                        id="description"
                        value={uploadData.description}
                        onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of the document"
                        rows={3}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="file" className="text-sm font-medium">Select File</Label>
                      <div className="mt-1 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                        <Input
                          id="file"
                          type="file"
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <label htmlFor="file" className="cursor-pointer">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            PDF, DOC, DOCX, TXT, JPG, PNG up to 10MB
                          </p>
                        </label>
                      </div>
                      {uploadData.file && (
                        <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800 dark:text-green-200">
                              {uploadData.file.name}
                            </span>
                            <Badge variant="secondary" className="ml-auto">
                              {formatFileSize(uploadData.file.size)}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUploadDocument} 
                    disabled={uploading}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {uploading ? (
                      <>
                        <Upload className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Document
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Sidebar - Client Selection & Filters */}
          <div className="xl:col-span-1 space-y-6">
            {/* Client Selection */}
            <Card className="shadow-lg border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5" />
                  Clients
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <Button
                    variant={selectedClient === "" ? "default" : "ghost"}
                    className="w-full justify-start h-auto p-3"
                    onClick={() => setSelectedClient("")}
                  >
                    <div className="text-left">
                      <p className="font-medium">All Clients</p>
                      <p className="text-xs text-muted-foreground">
                        {documents?.length || 0} documents
                      </p>
                    </div>
                  </Button>
                  {filteredClients.map(client => {
                    const clientDocCount = documents?.filter(doc => doc.userId === client.uid).length || 0;
                    return (
                      <Button
                        key={client.uid}
                        variant={selectedClient === client.uid ? "default" : "ghost"}
                        className="w-full justify-start h-auto p-3"
                        onClick={() => setSelectedClient(client.uid)}
                      >
                        <div className="text-left">
                          <p className="font-medium">{client.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {client.email} • {clientDocCount} docs
                          </p>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card className="shadow-lg border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Filter className="w-5 h-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">File Type</Label>
                  <Select value={fileTypeFilter} onValueChange={setFileTypeFilter}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {fileTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Sort By</Label>
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="title">Title A-Z</SelectItem>
                      <SelectItem value="client">Client A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Documents List */}
          <div className="xl:col-span-3">
            <Card className="shadow-lg border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      {selectedClient 
                        ? `Documents for ${getClientName(selectedClient)}`
                        : "All Client Documents"
                      }
                    </CardTitle>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                      {clientDocuments.length} document{clientDocuments.length !== 1 ? 's' : ''} found
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === "list" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                    >
                      <SortAsc className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                    >
                      <FileText className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {clientDocuments.length > 0 ? (
                  <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
                    {clientDocuments.map(doc => (
                      <div key={doc.id} className={`group relative ${viewMode === "grid" ? "p-4 border rounded-xl hover:shadow-md transition-all duration-200 bg-white/50 dark:bg-slate-800/50" : "flex items-center justify-between p-4 border rounded-xl hover:shadow-md transition-all duration-200 bg-white/50 dark:bg-slate-800/50"}`}>
                        <div className={`${viewMode === "grid" ? "space-y-3" : "flex items-start space-x-4 flex-1"}`}>
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">
                              {getFileTypeIcon(doc.fileType || "")}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                {doc.title}
                              </h3>
                              {viewMode === "grid" && (
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                                  {doc.description}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {viewMode === "list" && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-1">
                              {doc.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <Badge variant="outline" className="text-xs">
                              <User className="w-3 h-3 mr-1" />
                              {getClientName(doc.userId)}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(doc.createdAt).toLocaleDateString()}
                            </Badge>
                            {doc.fileName && (
                              <Badge variant="outline" className="text-xs">
                                <FileType className="w-3 h-3 mr-1" />
                                {doc.fileName.split('.').pop()?.toUpperCase()}
                              </Badge>
                            )}
                            {doc.fileSize && (
                              <Badge variant="outline" className="text-xs">
                                {formatFileSize(doc.fileSize)}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className={`${viewMode === "grid" ? "mt-4 flex justify-between items-center" : "flex items-center space-x-2"}`}>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadDocument(doc)}
                              className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(doc.downloadURL, '_blank')}
                              className="hover:bg-green-50 dark:hover:bg-green-900/20"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleDeleteDocument(doc)} className="text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                      <FileText className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      No documents found
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      {selectedClient 
                        ? "No documents uploaded for this client yet."
                        : "No documents uploaded yet. Upload your first document to get started."
                      }
                    </p>
                    <Button 
                      onClick={() => setDialogOpen(true)}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Upload Document
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}