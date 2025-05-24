import { Download, FileText, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { useAuth } from "@/contexts/AuthContext";
import { Plan } from "@/types";
import { where, orderBy } from "firebase/firestore";

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          My Documents
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Download your nutrition plans and documents provided by your nutritionist
        </p>
      </CardHeader>
      <CardContent>
        {documents && documents.length > 0 ? (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm mb-1">{doc.title}</h3>
                    {doc.description && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {doc.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </div>
                      {doc.fileName && (
                        <span>{doc.fileName}</span>
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
                  className="flex-shrink-0"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Documents Yet</h3>
            <p className="text-muted-foreground">
              Your nutritionist hasn't uploaded any documents for you yet. 
              Documents like nutrition plans and guides will appear here when available.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}