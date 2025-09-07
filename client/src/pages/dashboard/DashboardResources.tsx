import { useState } from "react";
import { Download, Search, FileText, Video, ExternalLink, Filter, ArrowLeft } from "lucide-react";
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
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { Resource } from "@/types";
import { orderBy } from "firebase/firestore";
import { Link } from "wouter";

export default function DashboardResources() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");

  // Fetch resources from Firestore
  const { data: resources, loading } = useFirestoreCollection<Resource>("resources", [
    orderBy("createdAt", "desc")
  ]);

  // Sample resources for demo - these would come from Firestore in production
  const sampleResources: Resource[] = [
    {
      id: "1",
      title: "Comprehensive Meal Planning Guide",
      description: "A detailed guide to planning balanced meals, including templates, shopping lists, and budget tips.",
      url: "/downloads/meal-planning-guide.pdf",
      tags: ["Meal Planning", "Guide", "Budget"],
      lang: "en",
      type: "pdf",
      createdAt: new Date()
    },
    {
      id: "2",
      title: "Healthy Recipe Collection",
      description: "50+ nutritious recipes for breakfast, lunch, dinner, and snacks with nutritional information.",
      url: "/downloads/recipe-collection.pdf",
      tags: ["Recipes", "Healthy", "Cooking"],
      lang: "en",
      type: "pdf",
      createdAt: new Date()
    },
    {
      id: "3",
      title: "Portion Control Visual Guide",
      description: "Easy-to-follow visual guide for proper portion sizes using hand measurements.",
      url: "/downloads/portion-guide.pdf",
      tags: ["Portion Control", "Weight Loss", "Guide"],
      lang: "en",
      type: "pdf",
      createdAt: new Date()
    },
    {
      id: "4",
      title: "Macro Calculator Tool",
      description: "Interactive calculator to determine your daily macronutrient needs based on your goals.",
      url: "/tools/macro-calculator",
      tags: ["Calculator", "Macros", "Tools"],
      lang: "en",
      type: "link",
      createdAt: new Date()
    },
    {
      id: "5",
      title: "Hydration Tracking Sheet",
      description: "Printable daily water intake tracker to help you stay hydrated.",
      url: "/downloads/hydration-tracker.pdf",
      tags: ["Hydration", "Tracker", "Health"],
      lang: "en",
      type: "pdf",
      createdAt: new Date()
    },
    {
      id: "6",
      title: "Mindful Eating Workshop",
      description: "Video workshop on developing a healthy relationship with food through mindfulness.",
      url: "/videos/mindful-eating",
      tags: ["Mindfulness", "Education", "Video"],
      lang: "en",
      type: "video",
      createdAt: new Date()
    },
    {
      id: "7",
      title: "Supplement Guide",
      description: "Evidence-based guide to choosing the right supplements for your health goals.",
      url: "/downloads/supplement-guide.pdf",
      tags: ["Supplements", "Health", "Guide"],
      lang: "en",
      type: "pdf",
      createdAt: new Date()
    },
    {
      id: "8",
      title: "Exercise & Nutrition Video Series",
      description: "3-part video series on combining nutrition with exercise for optimal health.",
      url: "/videos/exercise-nutrition",
      tags: ["Exercise", "Video", "Education"],
      lang: "en",
      type: "video",
      createdAt: new Date()
    }
  ];

  const resourcesToShow = resources && resources.length > 0 ? resources : sampleResources;

  // Get all unique tags
  const allTags = Array.from(new Set(resourcesToShow.flatMap(r => r.tags)));

  // Filter resources
  const filteredResources = resourcesToShow.filter(resource => {
    const matchesSearch = !searchTerm || 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedType === "all" || resource.type === selectedType;
    const matchesTag = selectedTag === "all" || resource.tags.includes(selectedTag);
    
    return matchesSearch && matchesType && matchesTag;
  });

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return FileText;
      case "video":
        return Video;
      case "link":
        return ExternalLink;
      default:
        return FileText;
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case "pdf":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "video":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      case "link":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const handleResourceAction = (resource: Resource) => {
    if (resource.type === "pdf") {
      // In a real app, this would download from Firebase Storage
      alert(`Downloading ${resource.title}... This would download the PDF from Firebase Storage.`);
    } else if (resource.type === "video") {
      // In a real app, this would open a video player
      alert(`Opening ${resource.title}... This would open a video player.`);
    } else {
      // In a real app, this would open the interactive tool
      alert(`Opening ${resource.title}... This would open an interactive tool.`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 px-safe">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 px-safe">
        {/* Back to Dashboard Navigation */}
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="flex items-center gap-2 text-sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Resource Library</h1>
          <p className="text-muted-foreground">
            Access exclusive guides, tools, and educational content to support your nutrition journey
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Type Filter */}
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="pdf">PDF Guides</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="link">Interactive Tools</SelectItem>
                </SelectContent>
              </Select>

              {/* Tag Filter */}
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {allTags.slice(0, 10).map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Resources Grid */}
        {filteredResources.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredResources.map((resource) => {
              const Icon = getResourceIcon(resource.type);
              return (
                <Card key={resource.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                      </div>
                      <Badge className={getResourceColor(resource.type)}>
                        {resource.type.toUpperCase()}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight">{resource.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                      {resource.description}
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {resource.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {resource.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{resource.tags.length - 3} more
                        </Badge>
                      )}
                    </div>

                    {/* Action Button */}
                    <Button 
                      className="w-full bg-primary-500 hover:bg-primary-600" 
                      onClick={() => handleResourceAction(resource)}
                    >
                      {resource.type === "pdf" && (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </>
                      )}
                      {resource.type === "video" && (
                        <>
                          <Video className="w-4 h-4 mr-2" />
                          Watch Video
                        </>
                      )}
                      {resource.type === "link" && (
                        <>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open Tool
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* No Results */
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No resources found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedType("all");
                  setSelectedTag("all");
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Access */}
        <Card className="mt-8 bg-primary-50 dark:bg-primary-900/20">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">💡 Quick Access</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" size="sm" onClick={() => setSelectedTag("Meal Planning")}>
                Meal Planning
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedTag("Recipes")}>
                Recipes
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedTag("Weight Loss")}>
                Weight Loss
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedType("video")}>
                Videos
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Need Something Specific?</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Can't find what you're looking for? Send a message to your nutritionist to request 
              specific resources or ask questions about any of the materials.
            </p>
            <Button size="sm" variant="outline" asChild>
              <a href="/dashboard/messages">
                Message Your Nutritionist
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
