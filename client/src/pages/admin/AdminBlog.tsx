import { useState } from "react";
import { ArrowLeft, Plus, Edit, Trash2, Search, Image, Save, Eye } from "lucide-react";
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
  const filteredPosts = blogPosts?.filter(post => {
    const matchesSearch = !searchTerm || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLang = selectedLang === "all" || post.lang === selectedLang;
    
    return matchesSearch && matchesLang;
  }) || [];

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
          <h1 className="text-3xl font-bold mb-2">Blog Management</h1>
          <p className="text-muted-foreground">
            Create and manage blog posts with image uploads
          </p>
        </div>

        {/* Actions and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search blog posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Language Filter */}
              <Select value={selectedLang} onValueChange={(value: any) => setSelectedLang(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="cs">Czech</SelectItem>
                </SelectContent>
              </Select>

              {/* New Post Button */}
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openNewPostDialog}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Blog Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingPost ? "Edit Blog Post" : "Create New Blog Post"}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column - Basic Info */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => handleTitleChange(e.target.value)}
                          placeholder="Enter blog post title"
                        />
                      </div>

                      <div>
                        <Label htmlFor="slug">URL Slug</Label>
                        <Input
                          id="slug"
                          value={formData.slug}
                          onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                          placeholder="url-friendly-slug"
                        />
                      </div>

                      <div>
                        <Label htmlFor="excerpt">Excerpt</Label>
                        <Textarea
                          id="excerpt"
                          value={formData.excerpt}
                          onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                          placeholder="Brief description of the post"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="mediumUrl">Medium URL</Label>
                        <Input
                          id="mediumUrl"
                          value={formData.mediumUrl}
                          onChange={(e) => setFormData(prev => ({ ...prev, mediumUrl: e.target.value }))}
                          placeholder="https://medium.com/@yourhandle/your-post"
                        />
                      </div>

                      <div>
                        <Label htmlFor="tags">Tags (comma-separated)</Label>
                        <Input
                          id="tags"
                          value={formData.tags.join(', ')}
                          onChange={(e) => handleTagsChange(e.target.value)}
                          placeholder="nutrition, health, diet"
                        />
                      </div>

                      <div>
                        <Label htmlFor="language">Language</Label>
                        <Select value={formData.lang} onValueChange={(value: "en" | "cs") => setFormData(prev => ({ ...prev, lang: value }))}>
                          <SelectTrigger>
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
                        <Label htmlFor="published">Publish immediately</Label>
                      </div>

                      <div>
                        <Label htmlFor="featured-image">Featured Image</Label>
                        <Input
                          id="featured-image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                        {(formData.featuredImageUrl || formData.featuredImage) && (
                          <div className="mt-2">
                            <p className="text-sm text-muted-foreground">
                              {formData.featuredImage ? `Selected: ${formData.featuredImage.name}` : "Current image will be used"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column - Content */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="content">Content</Label>
                        <Textarea
                          id="content"
                          value={formData.content}
                          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="Write your blog post content here..."
                          rows={20}
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSavePost} disabled={uploading}>
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
          </CardContent>
        </Card>

        {/* Blog Posts List */}
        <Card>
          <CardHeader>
            <CardTitle>Blog Posts ({filteredPosts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPosts.length > 0 ? (
              <div className="space-y-4">
                {filteredPosts.map(post => (
                  <div key={post.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex space-x-4 flex-1">
                      {/* Featured Image */}
                      {post.featuredImage && (
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={post.featuredImage} 
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Post Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium truncate">{post.title}</h3>
                          <Badge variant={post.published ? "default" : "secondary"}>
                            {post.published ? "Published" : "Draft"}
                          </Badge>
                          <Badge variant="outline">
                            {(post.lang || "EN").toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Created: {new Date(post.createdAt).toLocaleDateString()}</span>
                          <span>Updated: {new Date(post.updatedAt).toLocaleDateString()}</span>
                          {(post.tags && post.tags.length > 0) && (
                            <span>Tags: {post.tags.join(', ')}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(post.mediumUrl || `/blog/${post.slug}`, '_blank')}
                        disabled={!post.mediumUrl}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditPost(post)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeletePost(post)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Image className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No blog posts found. Create your first blog post!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}