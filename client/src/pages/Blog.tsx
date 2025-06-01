import { useState } from "react";
import { Link } from "wouter";
import { Search, Calendar, Clock, ArrowRight, Tag } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { BlogPost } from "@/types";
import { where, orderBy } from "firebase/firestore";
import { FloatingOrganic, DoodleConnector } from "@/components/ui/PageTransition";
export default function Blog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Fetch from the correct "blogs" collection
  const { data: blogPosts, loading } = useFirestoreCollection<any>("blogs");
  
  // Debug: Log the blog data
  console.log("Blog posts from 'blogs' collection:", blogPosts);

  // Extract categories from blog posts (using 'category' field from Firebase)
  const allCategories = blogPosts?.map(post => post.category).filter(Boolean) || [];
  const uniqueCategories = Array.from(new Set(allCategories));

  // Filter blog posts based on search and category
  const filteredPosts = blogPosts?.filter(post => {
    const matchesSearch = !searchTerm || 
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }) || [];

  // Use only authentic data from Firebase
  const postsToShow = filteredPosts;

  function calculateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute) || 5; // Default to 5 min for excerpts
  }

  if (loading) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
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
    <div className="min-h-screen py-20 bg-background relative overflow-hidden page-content">
      {/* Hero Section */}
      <section className="container mx-auto px-4 mb-16 relative">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4 text-base px-4 py-2 floating-element">
            Evidence-Based Nutrition Insights
          </Badge>
          <div className="doodle-arrow mb-6">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6 handwritten-accent">
              Nutrition Blog & Resources
            </h1>
          </div>
          <p className="serif-body text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
            Expert insights, practical tips, and evidence-based guidance to support your nutrition journey with Mediterranean wisdom and modern science.
          </p>
          
          {/* Connecting doodle */}
          <DoodleConnector direction="down" className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-32" />
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="container mx-auto px-4 mb-12">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === "" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("")}
            >
              All Topics
            </Button>
            {uniqueCategories.slice(0, 5).map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="container mx-auto px-4">
        {postsToShow.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {postsToShow.map((post) => (
              <article key={post.id} className="group h-full">
                <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden h-full flex flex-col">
                  {/* Featured Image */}
                  <div className="relative overflow-hidden">
                    <img 
                      src={post.featuredImage || post.image || "https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"} 
                      alt={post.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Category overlay */}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-primary-500 text-white">
                        {post.category || "Nutrition"}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6 flex flex-col flex-grow">
                    {/* Meta information */}
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{post.date || 'Recent'}</span>
                      <span className="mx-2">•</span>
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{calculateReadTime(post.excerpt || '')} min read</span>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-semibold mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                      <Link 
                        href={`/blog/post?id=${post.id}`}
                        className="hover:text-primary-600 transition-colors"
                      >
                        {post.title}
                      </Link>
                    </h2>

                    {/* Excerpt */}
                    <p className="text-muted-foreground mb-4 line-clamp-3 flex-grow">
                      {post.excerpt}
                    </p>

                    {/* Category and Read More - Pushed to bottom */}
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        {post.category && (
                          <Badge variant="outline" className="text-xs">
                            {post.category}
                          </Badge>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link 
                          href={`/blog/post?id=${post.id}`}
                          className="group/btn flex items-center"
                        >
                          Read More
                          <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </article>
            ))}
          </div>
        ) : (
          /* No Results */
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No articles found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search terms or clearing the filters
            </p>
            <Button onClick={() => { setSearchTerm(""); setSelectedCategory(""); }}>
              Clear Filters
            </Button>
          </div>
        )}
      </section>

      {/* Newsletter CTA */}
      <section className="container mx-auto px-4 mt-20">
        <Card className="bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Never miss an article
            </h2>
            <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
              Stay updated with the latest nutrition tips and health insights
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/#newsletter">Subscribe Now</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
      
      {/* Floating background elements */}
      <FloatingOrganic className="absolute top-20 -right-20 opacity-15" size="large" delay={1} />
      <FloatingOrganic className="absolute bottom-20 -left-20 opacity-15" size="large" delay={3} />
      <FloatingOrganic className="absolute top-1/2 right-10 opacity-10" size="medium" delay={2} />
      <FloatingOrganic className="absolute bottom-1/3 left-10 opacity-10" size="medium" delay={4} />
    </div>
  );
}
