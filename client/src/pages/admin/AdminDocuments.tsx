import { useState } from "react";
import { ArrowLeft, Upload, Download, FileText, Trash2, Search, Plus } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useFirestoreCollection, useFirestoreActions } from "@/hooks/useFirestore";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { User, Plan } from "@/types";

interface DocumentUploadData {
  clientUserId: string;
  title: string;
  description: string;
  file: File | null;
}

export default function AdminDocuments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [uploadData, setUploadData] = useState<DocumentUploadData>({
    clientUserId: "",
    title: "",
    description: "",
    file: null
  });
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

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
  const clientDocuments = selectedClient 
    ? documents?.filter(doc => doc.userId === selectedClient) || []
    : documents || [];

  const getClientName = (userId: string) => {
    const client = clients.find(c => c.uid === userId);
    return client?.name || "Unknown Client";
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
          <h1 className="text-3xl font-bold mb-2">Client Documents</h1>
          <p className="text-muted-foreground">
            Upload and manage nutritional plans and documents for your clients
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Client Selection & Search */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Clients</CardTitle>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="client-select">Select Client</Label>
                      <Select 
                        value={uploadData.clientUserId} 
                        onValueChange={(value) => setUploadData(prev => ({ ...prev, clientUserId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map(client => (
                            <SelectItem key={client.uid} value={client.uid}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="title">Document Title</Label>
                      <Input
                        id="title"
                        value={uploadData.title}
                        onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Nutrition Plan - Week 1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={uploadData.description}
                        onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of the document"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="file">Select File</Label>
                      <Input
                        id="file"
                        type="file"
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                      />
                      {uploadData.file && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Selected: {uploadData.file.name} ({Math.round(uploadData.file.size / 1024)} KB)
                        </p>
                      )}
                    </div>

                    <Button 
                      onClick={handleUploadDocument} 
                      disabled={uploading}
                      className="w-full"
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
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Client List */}
              <div className="space-y-2">
                <Button
                  variant={selectedClient === "" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedClient("")}
                >
                  All Clients
                </Button>
                {filteredClients.map(client => (
                  <Button
                    key={client.uid}
                    variant={selectedClient === client.uid ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedClient(client.uid)}
                  >
                    <div className="text-left">
                      <p className="font-medium">{client.name}</p>
                      <p className="text-xs text-muted-foreground">{client.email}</p>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Documents List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                {selectedClient 
                  ? `Documents for ${getClientName(selectedClient)}`
                  : "All Client Documents"
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              {clientDocuments.length > 0 ? (
                <div className="space-y-4">
                  {clientDocuments.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-start space-x-3">
                        <FileText className="w-5 h-5 text-blue-600 mt-1" />
                        <div>
                          <h3 className="font-medium">{doc.title}</h3>
                          <p className="text-sm text-muted-foreground mb-1">{doc.description}</p>
                          <div className="text-xs text-muted-foreground">
                            <span>Client: {getClientName(doc.userId)}</span>
                            <span className="mx-2">•</span>
                            <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                            {doc.fileName && (
                              <>
                                <span className="mx-2">•</span>
                                <span>{doc.fileName}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadDocument(doc)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteDocument(doc)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {selectedClient 
                      ? "No documents uploaded for this client yet."
                      : "No documents uploaded yet."
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}