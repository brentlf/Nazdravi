import { useState } from "react";
import { Languages, Search, Plus, Edit, Trash2, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useFirestoreCollection, useFirestoreActions } from "@/hooks/useFirestore";
import { Translation } from "@/types";
import { orderBy, where } from "firebase/firestore";

export default function AdminTranslations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [namespaceFilter, setNamespaceFilter] = useState<string>("all");
  const [selectedTranslation, setSelectedTranslation] = useState<Translation | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTranslation, setNewTranslation] = useState({
    lang: "en",
    namespace: "common",
    key: "",
    value: ""
  });
  const { toast } = useToast();

  // Fetch translations
  const { data: translations, loading } = useFirestoreCollection<Translation>("translations", [
    orderBy("lang", "asc"),
    orderBy("namespace", "asc"),
    orderBy("key", "asc")
  ]);

  const { add: addTranslation, update: updateTranslation, remove: deleteTranslation, loading: actionLoading } = useFirestoreActions("translations");

  // Filter translations
  const filteredTranslations = translations?.filter(translation => {
    const matchesSearch = !searchTerm || 
      translation.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      translation.value.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLanguage = languageFilter === "all" || translation.lang === languageFilter;
    const matchesNamespace = namespaceFilter === "all" || translation.namespace === namespaceFilter;
    
    return matchesSearch && matchesLanguage && matchesNamespace;
  }) || [];

  // Get unique namespaces for filter
  const namespaces = [...new Set(translations?.map(t => t.namespace) || [])];

  const handleAddTranslation = async () => {
    if (!newTranslation.key || !newTranslation.value) {
      toast({
        title: "Missing fields",
        description: "Please fill in both key and value fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addTranslation({
        ...newTranslation,
        createdAt: new Date(),
      });

      toast({
        title: "Translation added",
        description: "New translation has been created successfully.",
      });

      setNewTranslation({
        lang: "en",
        namespace: "common",
        key: "",
        value: ""
      });
      setIsAddingNew(false);
    } catch (error) {
      toast({
        title: "Failed to add translation",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTranslation = async () => {
    if (!selectedTranslation) return;

    try {
      await updateTranslation(selectedTranslation.id!, {
        value: selectedTranslation.value
      });

      toast({
        title: "Translation updated",
        description: "Translation has been updated successfully.",
      });

      setSelectedTranslation(null);
    } catch (error) {
      toast({
        title: "Failed to update translation",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTranslation = async (translationId: string) => {
    try {
      await deleteTranslation(translationId);
      toast({
        title: "Translation deleted",
        description: "Translation has been removed successfully.",
      });
      setSelectedTranslation(null);
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete translation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getLanguageFlag = (lang: string) => {
    return lang === "en" ? "🇺🇸" : "🇨🇿";
  };

  const getLanguageName = (lang: string) => {
    return lang === "en" ? "English" : "Czech";
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Website Translations</h1>
          <p className="text-muted-foreground">
            Manage multilingual content for your website
          </p>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search translations by key or value..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Language Filter */}
              <Select value={languageFilter} onValueChange={setLanguageFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Filter by language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  <SelectItem value="en">🇺🇸 English</SelectItem>
                  <SelectItem value="cs">🇨🇿 Czech</SelectItem>
                  <SelectItem value="af">🇿🇦 Afrikaans</SelectItem>
                </SelectContent>
              </Select>

              {/* Namespace Filter */}
              <Select value={namespaceFilter} onValueChange={setNamespaceFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Filter by namespace" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Namespaces</SelectItem>
                  {namespaces.map(namespace => (
                    <SelectItem key={namespace} value={namespace}>
                      {namespace}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Add Button */}
              <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
                <DialogTrigger asChild>
                  <Button className="bg-[#A5CBA4] hover:bg-[#95bb94] text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Translation
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Translation</DialogTitle>
                    <DialogDescription>
                      Create a new translation entry for your website
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="lang">Language</Label>
                        <Select value={newTranslation.lang} onValueChange={(value) => setNewTranslation({...newTranslation, lang: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">🇺🇸 English</SelectItem>
                            <SelectItem value="cs">🇨🇿 Czech</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="namespace">Namespace</Label>
                        <Input
                          id="namespace"
                          placeholder="common, navigation, etc."
                          value={newTranslation.namespace}
                          onChange={(e) => setNewTranslation({...newTranslation, namespace: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="key">Translation Key</Label>
                      <Input
                        id="key"
                        placeholder="home.title, about.description, etc."
                        value={newTranslation.key}
                        onChange={(e) => setNewTranslation({...newTranslation, key: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="value">Translation Value</Label>
                      <Textarea
                        id="value"
                        placeholder="Enter the translated text..."
                        value={newTranslation.value}
                        onChange={(e) => setNewTranslation({...newTranslation, value: e.target.value})}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddingNew(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddTranslation} disabled={actionLoading}>
                      {actionLoading ? "Adding..." : "Add Translation"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Translations Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Translations ({filteredTranslations.length})</span>
              <div className="flex gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  🇺🇸 {translations?.filter(t => t.lang === "en").length || 0}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  🇳🇱 {translations?.filter(t => t.lang === "nl").length || 0}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTranslations.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Language</TableHead>
                    <TableHead>Namespace</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTranslations.map((translation) => (
                    <TableRow key={translation.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getLanguageFlag(translation.lang)}</span>
                          <span className="text-sm">{getLanguageName(translation.lang)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{translation.namespace}</Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {translation.key}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={translation.value}>
                          {translation.value}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedTranslation(translation)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Translation</DialogTitle>
                                <DialogDescription>
                                  Update the translation value
                                </DialogDescription>
                              </DialogHeader>
                              
                              {selectedTranslation && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Language</Label>
                                      <div className="flex items-center space-x-2 p-2 border rounded">
                                        <span>{getLanguageFlag(selectedTranslation.lang)}</span>
                                        <span>{getLanguageName(selectedTranslation.lang)}</span>
                                      </div>
                                    </div>
                                    <div>
                                      <Label>Namespace</Label>
                                      <div className="p-2 border rounded bg-gray-50 dark:bg-gray-800">
                                        {selectedTranslation.namespace}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <Label>Key</Label>
                                    <div className="p-2 border rounded bg-gray-50 dark:bg-gray-800 font-mono text-sm">
                                      {selectedTranslation.key}
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <Label htmlFor="edit-value">Translation Value</Label>
                                    <Textarea
                                      id="edit-value"
                                      value={selectedTranslation.value}
                                      onChange={(e) => setSelectedTranslation({
                                        ...selectedTranslation,
                                        value: e.target.value
                                      })}
                                    />
                                  </div>
                                </div>
                              )}

                              <DialogFooter className="gap-2">
                                <Button variant="outline" onClick={() => setSelectedTranslation(null)}>
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => selectedTranslation && handleDeleteTranslation(selectedTranslation.id!)}
                                  disabled={actionLoading}
                                >
                                  Delete
                                </Button>
                                <Button onClick={handleUpdateTranslation} disabled={actionLoading}>
                                  {actionLoading ? "Updating..." : "Update"}
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
                <Languages className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No translations found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || languageFilter !== "all" || namespaceFilter !== "all" 
                    ? "No translations match your filter criteria." 
                    : "Create your first translation to get started with multilingual support."}
                </p>
                <Button 
                  className="bg-[#A5CBA4] hover:bg-[#95bb94] text-white"
                  onClick={() => setIsAddingNew(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Translation
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}