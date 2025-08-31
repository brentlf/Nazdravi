import { useState } from "react";
import { Link } from "wouter";
import { Search, Calendar, Clock, ArrowRight, Tag, BookOpen, Leaf } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { BlogPost } from "@/types";
import { where, orderBy } from "firebase/firestore";
import {
  FloatingOrganic,
  DoodleConnector,
} from "@/components/ui/PageTransition";

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Fetch from the correct "blogs" collection
  const { data: blogPosts, loading } = useFirestoreCollection<any>("blogs");

  // Debug: Log the blog data
  console.log("Blog posts from 'blogs' collection:", blogPosts);

  // Extract categories from blog posts (using 'category' field from Firebase)
  const allCategories =
    blogPosts?.map((post) => post.category).filter(Boolean) || [];
  const uniqueCategories = Array.from(new Set(allCategories));

  // Filter blog posts based on search and category
  const filteredPosts =
    blogPosts?.filter((post) => {
      const matchesSearch =
        !searchTerm ||
        post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        !selectedCategory || post.category === selectedCategory;

      return matchesSearch && matchesCategory;
    }) || [];

  // Use only authentic data from Firebase
  const postsToShow = filteredPosts;

  function calculateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(" ").length;
    return Math.ceil(wordCount / wordsPerMinute) || 5; // Default to 5 min for excerpts
  }

  if (loading) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse border-0 shadow-soft">
                <div className="h-48 bg-muted rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        {/* Natural background with overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23fed7aa%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
        </div>

        <div className="relative z-10 container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-2xl mb-8">
              <BookOpen className="h-10 w-10 text-primary-foreground" />
            </div>
            
            <Badge
              variant="secondary"
              className="mb-8 px-4 py-2 bg-white/10 backdrop-blur-sm border-white/20 text-foreground font-medium"
            >
              Evidence-Based Nutrition Insights
            </Badge>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-8 text-balance text-foreground">
              Nutrition Blog & Resources
            </h1>
            
            <p className="text-xl lg:text-2xl mb-12 text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Expert insights, practical tips, and evidence-based guidance to support your nutrition journey with modern science and holistic wisdom.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 border-border/40 focus:border-primary transition-colors duration-300"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedCategory === "" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("")}
                  className="h-12 px-6"
                >
                  All
                </Button>
                {uniqueCategories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className="h-12 px-6"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="pb-20">
        <div className="container mx-auto px-6">
          {postsToShow.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-muted rounded-2xl mb-6">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">No articles found</h3>
              <p className="text-muted-foreground mb-8">
                Try adjusting your search terms or browse all categories.
              </p>
              <Button onClick={() => { setSearchTerm(""); setSelectedCategory(""); }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {postsToShow.map((post, index) => (
                <Card key={post.id || index} className="group border-0 shadow-soft hover:shadow-elegant transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Leaf className="h-16 w-16 text-primary/30" />
                      </div>
                    )}
                    {post.category && (
                      <Badge className="absolute top-4 left-4 bg-white/90 text-foreground border-0">
                        {post.category}
                      </Badge>
                    )}
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : "Recent"}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {calculateReadTime(post.content || post.excerpt || "")} min read
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                      {post.title}
                    </h3>
                    
                    <p className="text-muted-foreground mb-6 leading-relaxed line-clamp-3">
                      {post.excerpt || post.content?.substring(0, 150) + "..."}
                    </p>
                    
                    <Link href={`/blog/post?id=${post.id}`}>
                      <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                        Read More
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-6">
              <Leaf className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-balance">
              Stay Updated
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Get the latest nutrition insights, recipes, and wellness tips delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-12 border-border/40 focus:border-primary transition-colors duration-300"
              />
              <Button className="h-12 px-8">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
