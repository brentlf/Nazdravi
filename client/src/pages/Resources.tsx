import { useState } from "react";
import { Download, Search, FileText, Video, ExternalLink, BookOpen, Calculator, Gift } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { Resource } from "@/types";
import { where, orderBy } from "firebase/firestore";

export default function Resources() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch resources from Firestore
  const { data: resources, loading } = useFirestoreCollection<Resource>("resources", [
    orderBy("createdAt", "desc")
  ]);

  // Sample resources for demo
  const sampleResources: Resource[] = [
    {
      id: "1",
      title: "7-Day Meal Plan Guide",
      description: "Complete meal planning guide with shopping lists, prep tips, and 21 delicious recipes for balanced nutrition.",
      url: "/downloads/7-day-meal-plan.pdf",
      tags: ["Meal Planning", "Recipes", "Guide"],
      lang: "en",
      type: "pdf",
      createdAt: new Date()
    },
    {
      id: "2",
      title: "Macro Calculator",
      description: "Interactive calculator to determine your optimal daily macronutrient intake based on your goals and activity level.",
      url: "/tools/macro-calculator",
      tags: ["Calculator", "Macros", "Tools"],
      lang: "en",
      type: "link",
      createdAt: new Date()
    },
    {
      id: "3",
      title: "Healthy Snack Ideas",
      description: "50 nutritious snack ideas categorized by dietary preferences and energy levels to keep you satisfied.",
      url: "/downloads/healthy-snacks.pdf",
      tags: ["Snacks", "Recipes", "Healthy"],
      lang: "en",
      type: "pdf",
      createdAt: new Date()
    },
    {
      id: "4",
      title: "Portion Control Guide",
      description: "Visual guide to portion sizes with easy-to-follow hand measurements and serving suggestions.",
      url: "/downloads/portion-guide.pdf",
      tags: ["Portion Control", "Guide", "Weight Loss"],
      lang: "en",
      type: "pdf",
      createdAt: new Date()
    },
    {
      id: "5",
      title: "Hydration Tracker",
      description: "Printable water intake tracker to help you stay hydrated and meet your daily goals.",
      url: "/downloads/hydration-tracker.pdf",
      tags: ["Hydration", "Tracker", "Health"],
      lang: "en",
      type: "pdf",
      createdAt: new Date()
    },
    {
      id: "6",
      title: "Mindful Eating Workshop",
      description: "30-minute video workshop on developing a healthy relationship with food through mindful eating practices.",
      url: "/videos/mindful-eating-workshop",
      tags: ["Mindfulness", "Workshop", "Education"],
      lang: "en",
      type: "video",
      createdAt: new Date()
    }
  ];

  const resourcesToShow = resources && resources.length > 0 ? resources : sampleResources;

  // Filter resources based on search term
  const filteredResources = resourcesToShow.filter(resource =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Categorize resources by type
  const pdfResources = filteredResources.filter(r => r.type === "pdf");
  const videoResources = filteredResources.filter(r => r.type === "video");
  const toolResources = filteredResources.filter(r => r.type === "link");

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

  const handleDownload = (resource: Resource) => {
    // In a real app, this would trigger the actual download
    alert(`Downloading ${resource.title}... This would trigger a PDF download in the real app.`);
  };

  const handleOpenTool = (resource: Resource) => {
    // In a real app, this would open the interactive tool
    alert(`Opening ${resource.title}... This would open an interactive tool.`);
  };

  if (loading) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4">
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
    <div className="min-h-screen py-20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 mb-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Free Nutrition Resources
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Download our expert-crafted resources to jumpstart your nutrition journey. 
            All resources are free and designed to support your health goals.
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="container mx-auto px-4 mb-12">
        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </section>

      {/* Featured Resource */}
      <section className="container mx-auto px-4 mb-16">
        <Card className="bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <CardContent className="p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Gift className="w-6 h-6" />
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/20">
                    Featured Download
                  </Badge>
                </div>
                <h2 className="text-3xl font-bold mb-4">Complete Meal Planning Guide</h2>
                <p className="text-primary-100 mb-6 text-lg">
                  Our most comprehensive resource! Get 20 pages of meal planning strategies, 
                  weekly templates, shopping lists, and budget-friendly tips.
                </p>
                <Button size="lg" variant="secondary" onClick={() => handleDownload(sampleResources[0])}>
                  <Download className="w-5 h-5 mr-2" />
                  Download Free Guide
                </Button>
              </div>
              <div className="text-center">
                <div className="w-48 h-48 bg-white/10 rounded-2xl flex items-center justify-center mx-auto">
                  <BookOpen className="w-24 h-24 text-white/80" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Resources Tabs */}
      <section className="container mx-auto px-4">
        <Tabs defaultValue="all" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 max-w-md mx-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="guides">Guides</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredResources.map((resource) => {
                const Icon = getResourceIcon(resource.type);
                return (
                  <Card key={resource.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        </div>
                        <Badge variant="outline">
                          {resource.type.toUpperCase()}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{resource.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        {resource.description}
                      </p>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {resource.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Action Button */}
                      {resource.type === "pdf" ? (
                        <Button className="w-full" onClick={() => handleDownload(resource)}>
                          <Download className="w-4 h-4 mr-2" />
                          Download {resource.type.toUpperCase()}
                        </Button>
                      ) : resource.type === "link" ? (
                        <Button className="w-full" onClick={() => handleOpenTool(resource)}>
                          <Calculator className="w-4 h-4 mr-2" />
                          Use Tool
                        </Button>
                      ) : (
                        <Button className="w-full" onClick={() => handleOpenTool(resource)}>
                          <Video className="w-4 h-4 mr-2" />
                          Watch Video
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="guides">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pdfResources.map((resource) => (
                <Card key={resource.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <Badge variant="outline">PDF</Badge>
                    </div>
                    <CardTitle className="text-xl">{resource.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6">{resource.description}</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {resource.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button className="w-full" onClick={() => handleDownload(resource)}>
                      <Download className="w-4 h-4 mr-2" />
                      Download Guide
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tools">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {toolResources.map((resource) => (
                <Card key={resource.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <Calculator className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <Badge variant="outline">TOOL</Badge>
                    </div>
                    <CardTitle className="text-xl">{resource.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6">{resource.description}</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {resource.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button className="w-full" onClick={() => handleOpenTool(resource)}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Use Tool
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="videos">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {videoResources.map((resource) => (
                <Card key={resource.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <Video className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <Badge variant="outline">VIDEO</Badge>
                    </div>
                    <CardTitle className="text-xl">{resource.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6">{resource.description}</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {resource.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button className="w-full" onClick={() => handleOpenTool(resource)}>
                      <Video className="w-4 h-4 mr-2" />
                      Watch Video
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Newsletter CTA */}
      <section className="container mx-auto px-4 mt-20">
        <Card className="bg-primary-50 dark:bg-primary-900/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Get Notified of New Resources
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Subscribe to our newsletter to be the first to know when we release new guides, 
              tools, and educational content.
            </p>
            <Button asChild>
              <a href="/#newsletter">Subscribe to Newsletter</a>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
