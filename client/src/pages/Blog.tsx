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

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Fetch from the correct "blogs" collection
  const { data: blogPosts, loading } = useFirestoreCollection<any>("blogs");

  // Debug: Log the blog data
  console.log("Blog posts from 'blogs' collection:", blogPosts);

  // Extract categories from blog posts (using 'tags' field from Firebase)
  const allCategories =
    blogPosts?.flatMap((post) => post.tags || []).filter(Boolean) || [];
  const uniqueCategories = Array.from(new Set(allCategories));

  // Filter blog posts based on search and category
  const filteredPosts =
    blogPosts?.filter((post) => {
      const matchesSearch =
        !searchTerm ||
        post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        !selectedCategory || (post.tags && post.tags.includes(selectedCategory));

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
      <div className="min-h-screen bg-background">
        {/* Background Image - Full Screen */}
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
          style={{
            backgroundImage: `url(/OrangesBG.jpg)`,
          }}
        />
        {/* Dark overlay - Full Screen */}
        <div className="fixed inset-0 bg-black/40 -z-10" />
        
        <div className="pt-20 pb-16">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background Image - Full Screen */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: `url(/OrangesBG.jpg)`,
        }}
      />
      {/* Dark overlay - Full Screen */}
      <div className="fixed inset-0 bg-black/40 -z-10" />

      {/* Content Container with proper spacing */}
      <div className="pt-16 pb-20">
        {/* Main content section */}
        <section className="flex flex-col justify-center px-4 h-full">
          <div className="max-w-7xl mx-auto w-full">
              {/* Header Section */}
              <div className="text-center mb-2 flex-shrink-0">
                <div className="inline-flex items-center justify-center w-8 h-8 bg-white/15 backdrop-blur-sm rounded-full mb-2">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 leading-tight text-white font-serif">
                  Nutrition Blog
                </h1>
                <p className="text-xs text-white/90 max-w-lg mx-auto leading-relaxed">
                  Expert insights, practical tips, and evidence-based guidance to support your nutrition journey.
                </p>
              </div>

              {/* Search and Filter Section */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 mb-3">
                <div className="grid lg:grid-cols-2 gap-3 items-center">
                  {/* Search Bar */}
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-1">Find Articles</h3>
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-white/70" />
                      <Input
                        type="text"
                        placeholder="Search articles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 h-6 bg-white/15 border-white/25 text-white placeholder:text-white/60 focus:border-white/40 text-xs"
                      />
                    </div>
                  </div>
                  
                  {/* Category Filters */}
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-1">Browse Categories</h3>
                    <div className="flex gap-1 flex-wrap">
                      <Button
                        variant={selectedCategory === "" ? "default" : "outline"}
                        onClick={() => setSelectedCategory("")}
                        className="h-6 px-2 bg-white/20 border-white/30 text-white hover:bg-white/30 font-medium text-xs"
                      >
                        All
                      </Button>
                      {uniqueCategories.slice(0, 4).map((category) => (
                        <Button
                          key={category}
                          variant={selectedCategory === category ? "default" : "outline"}
                          onClick={() => setSelectedCategory(category)}
                          className="h-6 px-2 bg-white/20 border-white/30 text-white hover:bg-white/30 font-medium text-xs"
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Blog Posts Section */}
              {postsToShow.length === 0 ? (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-white/15 rounded-full mb-2">
                    <Search className="h-4 w-5 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">No Articles Found</h3>
                  <p className="text-white/70 mb-2 text-xs max-w-md mx-auto">
                    Try adjusting your search terms or browse all categories to discover our nutrition content.
                  </p>
                  <Button 
                    onClick={() => { setSearchTerm(""); setSelectedCategory(""); }}
                    className="bg-white text-gray-900 hover:bg-gray-100 px-3 py-1 text-xs font-semibold"
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-center">
                    <h2 className="text-lg font-bold text-white mb-1">Latest Articles</h2>
                    <p className="text-white/70 text-xs">Showing {postsToShow.length} article{postsToShow.length !== 1 ? 's' : ''}</p>
                  </div>
                  
                  {/* 3x2 Grid for 6 Blog Posts */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {postsToShow.slice(0, 6).map((post, index) => (
                      <Card key={post.id || index} className="group border-0 bg-white/15 backdrop-blur-sm hover:bg-white/25 transition-all duration-300 overflow-hidden rounded-lg h-28 relative">
                        {post.tags && post.tags.length > 0 && (
                          <Badge className="absolute top-1 right-1 bg-white/95 text-gray-900 border-0 text-xs font-semibold px-1 py-0.5 z-10">
                            {post.tags[0]}
                          </Badge>
                        )}
                        <div className="flex h-full">
                          {/* Thumbnail on the left */}
                          <div className="w-20 h-full bg-gradient-to-br from-white/15 to-white/5 relative overflow-hidden flex-shrink-0">
                            {post.featuredImage || post.mediumUrl ? (
                              <img
                                src={post.featuredImage || post.mediumUrl}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Leaf className="h-6 w-6 text-white/30" />
                              </div>
                            )}
                          </div>
                          
                          {/* Content on the right */}
                          <CardContent className="p-2 text-white flex-1">
                            <div className="flex items-center gap-2 text-xs text-white/70 mb-1">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-2.5 w-2.5" />
                                {post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : "Recent"}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5" />
                                {calculateReadTime(post.content || post.excerpt || "")} min
                              </div>
                            </div>
                            
                            <h3 className="text-xs font-bold mb-1 text-white group-hover:text-yellow-300 transition-colors duration-300 line-clamp-1">
                              {post.title}
                            </h3>
                            
                            <p className="text-white/80 mb-2 leading-relaxed text-xs line-clamp-1">
                              {post.excerpt || post.content?.substring(0, 80) + "..."}
                            </p>
                            
                            <Link href={`/blog/post?id=${post.id}`}>
                              <Button variant="outline" className="border-white/40 text-white hover:bg-white/20 text-xs font-medium py-1 h-5">
                                Read
                                <ArrowRight className="ml-1 h-2.5 w-2.5" />
                              </Button>
                            </Link>
                          </CardContent>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA Section */}
              <div className="text-center mt-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                  <h3 className="text-sm font-bold text-white mb-1">Need Personalized Nutrition Advice?</h3>
                  <p className="text-white/80 text-xs mb-2 max-w-2xl mx-auto">
                    Our blog articles provide general guidance, but for personalized recommendations tailored to your specific needs, book a consultation with our expert dietitian.
                  </p>
                  <Link href="/appointment">
                    <Button size="sm" className="bg-white text-gray-900 hover:bg-gray-100 px-3 py-1 text-xs font-semibold h-6">
                      Book Consultation
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
          </div>
        </section>
      </div>
    </div>
  );
}
