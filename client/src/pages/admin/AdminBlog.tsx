import { useState } from "react";
import { ArrowLeft, Plus, Edit, Trash2, Search, Image, Save, Eye, Filter, SortAsc, Calendar, Globe, Tag, MoreVertical, CheckCircle, AlertCircle, BookOpen, Grid3X3, List, Clock, User } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useFirestoreCollection, useFirestoreActions } from "@/hooks/useFirestore";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { BlogPost } from "@/types";

interface BlogPostFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  mediumUrl: string;
  tags: string[];
  lang: "en" | "cs";
  published: boolean;
  featuredImage: File | null;
  featuredImageUrl?: string;
}

export default function AdminBlog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLang, setSelectedLang] = useState<"all" | "en" | "cs">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title" | "published">("newest");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<BlogPostFormData>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    mediumUrl: "",
    tags: [],
    lang: "en",
    published: false,
    featuredImage: null,
    featuredImageUrl: ""
  });

  const { toast } = useToast();

  // Fetch blog posts
  const { data: blogPosts } = useFirestoreCollection<BlogPost>("blogs", []);
  const { add: addBlogPost, update: updateBlogPost, remove: removeBlogPost } = useFirestoreActions("blogs");

  // Filter blog posts
  let filteredPosts = blogPosts?.filter(post => {
    const matchesSearch = !searchTerm || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLang = selectedLang === "all" || post.lang === selectedLang;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "published" && post.published) ||
      (statusFilter === "draft" && !post.published);
    
    return matchesSearch && matchesLang && matchesStatus;
  }) || [];

  // Apply sorting
  filteredPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "title":
        return a.title.localeCompare(b.title);
      case "published":
        return (b.published ? 1 : 0) - (a.published ? 1 : 0);
      default:
        return 0;
    }
  });

  // Get unique tags for statistics
  const allTags = Array.from(new Set(blogPosts?.flatMap(post => post.tags || []) || []));
  const publishedCount = blogPosts?.filter(post => post.published).length || 0;
  const draftCount = blogPosts?.filter(post => !post.published).length || 0;

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title)
    }));
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setFormData(prev => ({ ...prev, tags }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, featuredImage: file }));
  };

  const uploadImage = async (file: File): Promise<string> => {
    const imageRef = ref(storage, `blog-images/${Date.now()}_${file.name}`);
    const uploadResult = await uploadBytes(imageRef, file);
    return getDownloadURL(uploadResult.ref);
  };

  const handleSavePost = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in the title and content.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      let featuredImageUrl = formData.featuredImageUrl || "";

      // Upload featured image if provided
      if (formData.featuredImage) {
        featuredImageUrl = await uploadImage(formData.featuredImage);
      }

      const postData = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        excerpt: formData.excerpt,
        content: formData.content,
        mediumUrl: formData.mediumUrl,
        featuredImage: featuredImageUrl,
        tags: formData.tags,
        lang: formData.lang,
        published: formData.published,
        updatedAt: new Date()
      };

      if (editingPost) {
        // Update existing post
        await updateBlogPost(editingPost.id, postData);
        toast({
          title: "Blog post updated",
          description: "Your blog post has been updated successfully."
        });
      } else {
        // Create new post
        await addBlogPost({
          ...postData,
          createdAt: new Date()
        });
        toast({
          title: "Blog post created",
          description: "Your blog post has been created successfully."
        });
      }

      // Reset form
      resetForm();
      setDialogOpen(false);

    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Save failed",
        description: "Failed to save blog post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      mediumUrl: post.mediumUrl || "",
      tags: post.tags || [],
      lang: post.lang as "en" | "cs",
      published: post.published,
      featuredImage: null,
      featuredImageUrl: post.featuredImage || ""
    });
    setDialogOpen(true);
  };

  const handleDeletePost = async (post: BlogPost) => {
    try {
      // Delete featured image from storage if exists
      if (post.featuredImage) {
        try {
          const imageRef = ref(storage, post.featuredImage);
          await deleteObject(imageRef);
        } catch (error) {
          console.log("Image deletion failed (may not exist):", error);
        }
      }

      // Remove post from Firestore
      await removeBlogPost(post.id);

      toast({
        title: "Blog post deleted",
        description: "The blog post has been removed successfully."
      });

    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Delete failed",
        description: "Failed to delete blog post. Please try again.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      mediumUrl: "",
      tags: [],
      lang: "en",
      published: false,
      featuredImage: null,
      featuredImageUrl: ""
    });
    setEditingPost(null);
  };

  const openNewPostDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                Blog Management
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-base">
                Create and manage blog posts with image uploads
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg" onClick={openNewPostDialog}>
                  <Plus className="w-5 h-5 mr-2" />
                  New Blog Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">
                      {editingPost ? "Edit Blog Post" : "Create New Blog Post"}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Basic Info */}
                    <div className="lg:col-span-1 space-y-6">
                      <Card>
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg">Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label htmlFor="title" className="text-sm font-medium">Title</Label>
                            <Input
                              id="title"
                              value={formData.title}
                              onChange={(e) => handleTitleChange(e.target.value)}
                              placeholder="Enter blog post title"
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="slug" className="text-sm font-medium">URL Slug</Label>
                            <Input
                              id="slug"
                              value={formData.slug}
                              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                              placeholder="url-friendly-slug"
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="excerpt" className="text-sm font-medium">Excerpt</Label>
                            <Textarea
                              id="excerpt"
                              value={formData.excerpt}
                              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                              placeholder="Brief description of the post"
                              rows={3}
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="mediumUrl" className="text-sm font-medium">Medium URL</Label>
                            <Input
                              id="mediumUrl"
                              value={formData.mediumUrl}
                              onChange={(e) => setFormData(prev => ({ ...prev, mediumUrl: e.target.value }))}
                              placeholder="https://medium.com/@yourhandle/your-post"
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="tags" className="text-sm font-medium">Tags (comma-separated)</Label>
                            <Input
                              id="tags"
                              value={formData.tags.join(', ')}
                              onChange={(e) => handleTagsChange(e.target.value)}
                              placeholder="nutrition, health, diet"
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="language" className="text-sm font-medium">Language</Label>
                            <Select value={formData.lang} onValueChange={(value: "en" | "cs") => setFormData(prev => ({ ...prev, lang: value }))}>
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="cs">Czech</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              id="published"
                              checked={formData.published}
                              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
                            />
                            <Label htmlFor="published" className="text-sm">Publish immediately</Label>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg">Featured Image</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                            <Input
                              id="featured-image"
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                            />
                            <label htmlFor="featured-image" className="cursor-pointer">
                              <Image className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                Click to upload featured image
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                JPG, PNG up to 5MB
                              </p>
                            </label>
                          </div>
                          {(formData.featuredImageUrl || formData.featuredImage) && (
                            <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                                  {formData.featuredImage ? `Selected: ${formData.featuredImage.name}` : "Current image will be used"}
                                </span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Right Column - Content */}
                    <div className="lg:col-span-2">
                      <Card>
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Content</CardTitle>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                const template = `<h2>Introduction</h2>
<p>Start with an engaging introduction that hooks your readers and explains what they'll learn in this article.</p>

<h2>Main Topic: Benefits of Proper Nutrition</h2>
<p>Explain the main concept or topic here. Use clear, concise language that your audience can easily understand.</p>

<h3>Key Point 1: Energy Levels</h3>
<p>Break down complex topics into digestible subsections. This makes your content easier to read and understand.</p>
<ul>
  <li>Stable blood sugar levels throughout the day</li>
  <li>Reduced afternoon energy crashes</li>
  <li>Better mental clarity and focus</li>
</ul>

<h3>Key Point 2: Long-term Health</h3>
<p>Continue with another important aspect of your topic.</p>

<blockquote>
"Proper nutrition is the foundation of good health and a vibrant life." - This is how you add quotes or testimonials
</blockquote>

<h2>Practical Tips</h2>
<p>Always include actionable advice your readers can implement:</p>
<ol>
  <li><strong>Start small:</strong> Make one healthy change at a time</li>
  <li><strong>Plan ahead:</strong> Meal prep on weekends</li>
  <li><strong>Stay consistent:</strong> Focus on progress, not perfection</li>
</ol>

<h2>Conclusion</h2>
<p>Summarize the key points and encourage readers to take action. End with a call-to-action that relates to your services.</p>

<p><em>Ready to transform your nutrition? Book a consultation today to create your personalized plan!</em></p>`;
                                setFormData(prev => ({ ...prev, content: template }));
                              }}
                            >
                              Use Template
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {/* Formatting Guide */}
                          <Card className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                            <div className="text-sm">
                              <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">HTML Formatting Guide:</h4>
                              <div className="grid grid-cols-2 gap-2 text-blue-700 dark:text-blue-300">
                                <span><code>&lt;h2&gt;</code> Main headers</span>
                                <span><code>&lt;h3&gt;</code> Sub headers</span>
                                <span><code>&lt;p&gt;</code> Paragraphs</span>
                                <span><code>&lt;strong&gt;</code> Bold text</span>
                                <span><code>&lt;em&gt;</code> Italic text</span>
                                <span><code>&lt;ul&gt;&lt;li&gt;</code> Bullet lists</span>
                                <span><code>&lt;ol&gt;&lt;li&gt;</code> Numbered lists</span>
                                <span><code>&lt;blockquote&gt;</code> Quotes</span>
                              </div>
                            </div>
                          </Card>
                          
                          <Textarea
                            id="content"
                            value={formData.content}
                            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                            placeholder="Write your blog post content using HTML formatting..."
                            rows={20}
                            className="font-mono text-sm"
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-6">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSavePost} 
                      disabled={uploading}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {uploading ? (
                        <>
                          <Save className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {editingPost ? "Update Post" : "Create Post"}
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">Total Posts</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{blogPosts?.length || 0}</p>
                </div>
                <BookOpen className="w-8 h-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">Published</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{publishedCount}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">Drafts</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{draftCount}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">Tags</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{allTags.length}</p>
                </div>
                <Tag className="w-8 h-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>
          </div>

        {/* Filters and Search */}
        <Card className="mb-6 shadow-lg border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-3 justify-between">
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search blog posts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <Select value={selectedLang} onValueChange={(value: any) => setSelectedLang(value)}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Languages</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="cs">Czech</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Drafts</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="title">Title A-Z</SelectItem>
                      <SelectItem value="published">Published First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Blog Posts List */}
          <Card className="shadow-lg border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Blog Posts ({filteredPosts.length})</CardTitle>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <span>{publishedCount} published</span>
                  <span>•</span>
                  <span>{draftCount} drafts</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredPosts.length > 0 ? (
                <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                  {filteredPosts.map(post => (
                    <div key={post.id} className={`group relative ${viewMode === "grid" ? "p-6 border rounded-xl hover:shadow-lg transition-all duration-200 bg-white/50 dark:bg-slate-800/50" : "flex items-start justify-between p-6 border rounded-xl hover:shadow-lg transition-all duration-200 bg-white/50 dark:bg-slate-800/50"}`}>
                      <div className={`${viewMode === "grid" ? "space-y-4" : "flex items-start space-x-6 flex-1"}`}>
                        {/* Featured Image */}
                        {post.featuredImage && (
                          <div className={`${viewMode === "grid" ? "w-full h-48" : "w-24 h-24"} bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden flex-shrink-0`}>
                            <img 
                              src={post.featuredImage} 
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        {/* Post Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate text-lg">
                              {post.title}
                            </h3>
                            <Badge variant={post.published ? "default" : "secondary"} className="text-xs">
                              {post.published ? "Published" : "Draft"}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Globe className="w-3 h-3 mr-1" />
                              {(post.lang || "EN").toUpperCase()}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                            {post.excerpt}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(post.createdAt).toLocaleDateString()}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              Updated {new Date(post.updatedAt).toLocaleDateString()}
                            </Badge>
                            {(post.tags && post.tags.length > 0) && (
                              <Badge variant="outline" className="text-xs">
                                <Tag className="w-3 h-3 mr-1" />
                                {post.tags.slice(0, 2).join(', ')}
                                {post.tags.length > 2 && ` +${post.tags.length - 2}`}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className={`${viewMode === "grid" ? "mt-4 flex justify-between items-center" : "flex items-center space-x-2"}`}>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(post.mediumUrl || `/blog/${post.slug}`, '_blank')}
                            disabled={!post.mediumUrl}
                            className="hover:bg-green-50 dark:hover:bg-green-900/20"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditPost(post)}
                            className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="outline">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleDeletePost(post)} className="text-red-600">
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
                    <BookOpen className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    No blog posts found
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    {searchTerm || selectedLang !== "all" || statusFilter !== "all"
                      ? "No posts match your current filters. Try adjusting your search criteria."
                      : "No blog posts found. Create your first blog post to get started!"
                    }
                  </p>
                  <Button 
                    onClick={openNewPostDialog}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Post
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
      </div>
    </div>
  );
}