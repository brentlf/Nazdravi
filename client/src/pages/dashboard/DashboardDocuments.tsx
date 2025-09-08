import { Download, FileText, Calendar, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { useAuth } from "@/contexts/AuthContext";
import { Plan } from "@/types";
import { where, orderBy } from "firebase/firestore";
import { Link } from "wouter";

export default function DashboardDocuments() {
  const { effectiveUser } = useAuth();

  // Fetch user's documents
  const { data: documents, loading } = useFirestoreCollection<Plan>(
    "plans",
    effectiveUser ? [
      where("userId", "==", effectiveUser.uid),
      orderBy("createdAt", "desc")
    ] : undefined
  );

  const handleDownloadDocument = async (doc: Plan) => {
    if (doc.downloadURL) {
      try {
        // Fetch the file as a blob for proper download
        const response = await fetch(doc.downloadURL);
        const blob = await response.blob();
        
        // Create download link
        const link = window.document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        link.download = doc.fileName || `${doc.title}.pdf`;
        
        // Force download
        window.document.body.appendChild(link);
        link.click();
        
        // Cleanup
        window.document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download failed:', error);
        // Fallback to direct link
        const link = window.document.createElement('a');
        link.href = doc.downloadURL;
        link.download = doc.fileName || `${doc.title}.pdf`;
        link.target = '_blank';
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
      }
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${Math.round(kb)} KB`;
    }
    const mb = kb / 1024;
    return `${Math.round(mb * 10) / 10} MB`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            My Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-muted-foreground">Loading documents...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="dashboard-viewport bg-background">
      <div className="container mx-auto px-3 sm:px-4 px-safe py-2 flex flex-col h-full">
        {/* Back Navigation */}
        <div className="mb-2 flex-shrink-0">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="flex items-center gap-1 text-xs px-2 py-1">
              <ArrowLeft className="w-3 h-3" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4" />
              My Documents
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Download your nutrition plans and documents provided by your nutritionist
            </p>
          </CardHeader>
      <CardContent className="p-3">
        {documents && documents.length > 0 ? (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-xs mb-1">{doc.title}</h3>
                    {doc.description && (
                      <p className="text-xs text-muted-foreground mb-1 line-clamp-1">
                        {doc.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </div>
                      {doc.fileName && (
                        <span className="truncate max-w-20">{doc.fileName}</span>
                      )}
                      {doc.fileSize && (
                        <span>{formatFileSize(doc.fileSize)}</span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownloadDocument(doc)}
                  className="flex-shrink-0 text-xs px-2 py-1 h-7"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <h3 className="text-sm font-medium mb-1">No Documents Yet</h3>
            <p className="text-xs text-muted-foreground">
              Your nutritionist hasn't uploaded any documents for you yet. 
              Documents like nutrition plans and guides will appear here when available.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
      </div>
    </div>
  );
}