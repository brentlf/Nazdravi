import { useState } from "react";
import { PenTool, Plus, Eye, Trash2, Edit, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useFirestoreCollection, useFirestoreActions } from "@/hooks/useFirestore";
import { BlogPost } from "@/types";

export default function AdminBlog() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const { toast } = useToast();

  const { data: blogPosts, loading } = useFirestoreCollection<BlogPost>("blogPosts");
  const { add: addPost, update: updatePost, remove: removePost } = useFirestoreActions("blogPosts");

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    tags: "",
    lang: "en",
    published: false,
    featuredImage: ""
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      toast({
        title: "Missing information",
        description: "Please fill in title and content.",
        variant: "destructive",
      });
      return;
    }

    try {
      const postData = {
        ...formData,
        slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        createdAt: editingPost?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      if (editingPost) {
        await updatePost(editingPost.id, postData);
        toast({
          title: "Post updated",
          description: "Blog post has been successfully updated.",
        });
      } else {
        await addPost(postData);
        toast({
          title: "Post created",
          description: "New blog post has been created.",
        });
      }

      setFormData({
        title: "",
        excerpt: "",
        content: "",
        tags: "",
        lang: "en",
        published: false,
        featuredImage: ""
      });
      setIsCreateOpen(false);
      setEditingPost(null);
    } catch (error) {
      toast({
        title: "Operation failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (post: BlogPost) => {
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      tags: post.tags.join(', '),
      lang: post.lang,
      published: post.published,
      featuredImage: post.featuredImage || ""
    });
    setEditingPost(post);
    setIsCreateOpen(true);
  };

  const handleDelete = async (postId: string) => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      try {
        await removePost(postId);
        toast({
          title: "Post deleted",
          description: "Blog post has been removed.",
        });
      } catch (error) {
        toast({
          title: "Delete failed",
          description: "Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Blog Management</h1>
            <p className="text-muted-foreground">
              Create and manage nutrition blog posts for your clients
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#A5CBA4] hover:bg-[#95bb94] text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPost ? "Edit Blog Post" : "Create New Blog Post"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Enter post title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lang">Language</Label>
                    <Select value={formData.lang} onValueChange={(value) => setFormData({...formData, lang: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="cs">Czech</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                    placeholder="Brief description of the post"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="Write your blog post content here..."
                    rows={12}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      placeholder="nutrition, health, diet"
                    />
                  </div>
                  <div>
                    <Label htmlFor="featuredImage">Featured Image URL</Label>
                    <Input
                      id="featuredImage"
                      value={formData.featuredImage}
                      onChange={(e) => setFormData({...formData, featuredImage: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => setFormData({...formData, published: checked})}
                  />
                  <Label htmlFor="published">Publish immediately</Label>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleSubmit} className="bg-[#A5CBA4] hover:bg-[#95bb94] text-white">
                    {editingPost ? "Update Post" : "Create Post"}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setIsCreateOpen(false);
                    setEditingPost(null);
                    setFormData({
                      title: "",
                      excerpt: "",
                      content: "",
                      tags: "",
                      lang: "en",
                      published: false,
                      featuredImage: ""
                    });
                  }}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : blogPosts && blogPosts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`px-2 py-1 rounded text-xs ${
                      post.published 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {post.published ? 'Published' : 'Draft'}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Globe className="w-3 h-3" />
                      {post.lang.toUpperCase()}
                    </div>
                  </div>
                  
                  <h3 className="font-semibold mb-2 line-clamp-2">{post.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="bg-[#A5CBA4]/20 text-[#A5CBA4] text-xs px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(post)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <PenTool className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No blog posts yet</h3>
              <p className="text-muted-foreground mb-4">
                Start creating valuable nutrition content for your clients.
              </p>
              <Button 
                onClick={() => setIsCreateOpen(true)}
                className="bg-[#A5CBA4] hover:bg-[#95bb94] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Post
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}