import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Search, Calendar, Clock, ArrowRight, BookOpen, Leaf, Grid3X3, List, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFirestoreCollection } from "@/hooks/useFirestore";

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);

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

  // Pagination logic
  const postsPerPage = viewMode === "grid" ? 6 : 20;
  const totalPages = Math.ceil(postsToShow.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const paginatedPosts = postsToShow.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, viewMode]);


  function calculateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(" ").length;
    return Math.ceil(wordCount / wordsPerMinute) || 5; // Default to 5 min for excerpts
  }

  // Pagination controls
  const PaginationControls = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 3;
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 2) {
          for (let i = 1; i <= 3; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 1) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 2; i <= totalPages; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        }
      }
      
      return pages;
    };

    return (
      <div className="flex items-center justify-center gap-1 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="h-8 px-2 text-xs"
        >
          <ChevronLeft className="h-3 w-3" />
          Prev
        </Button>
        
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            <Button
              key={index}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => typeof page === 'number' && setCurrentPage(page)}
              disabled={page === '...'}
              className="w-8 h-8 text-xs"
            >
              {page}
            </Button>
          ))}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="h-8 px-2 text-xs"
        >
          Next
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="page-content container mx-auto px-4 sm:px-6 px-safe py-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse border border-border">
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
    <div className="page-wrapper">
      {/* Main content section */}
      <section className="page-content px-3 sm:px-4 px-safe py-3">
        <div className="max-w-7xl mx-auto w-full">
          {/* Header Section */}
          <div className="text-center mb-3 xs:mb-4">
            <div className="inline-flex items-center justify-center w-8 h-8 xs:w-10 xs:h-10 bg-primary/10 rounded-full mb-2">
              <BookOpen className="h-4 w-4 xs:h-5 xs:w-5 text-primary" />
            </div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold mb-1 xs:mb-2 leading-tight text-foreground font-serif">
              Nutrition Blog
            </h1>
            <p className="text-sm xs:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Expert insights, practical tips, and evidence-based guidance to support your nutrition journey.
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-card border border-border rounded-xl p-3 mb-3 xs:mb-4">
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2 xs:gap-3 items-end">
              {/* Search Bar */}
              <div>
                <h3 className="text-sm font-semibold text-card-foreground mb-1">Find Articles</h3>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-8 text-sm"
                  />
                </div>
              </div>
              
              {/* Category Filters */}
              <div>
                <h3 className="text-sm font-semibold text-card-foreground mb-1">Categories</h3>
                <div className="flex gap-1 flex-wrap">
                  <Button
                    variant={selectedCategory === "" ? "default" : "outline"}
                    onClick={() => setSelectedCategory("")}
                    size="sm"
                    className="h-7 px-2 text-xs"
                  >
                    All
                  </Button>
                  {uniqueCategories.slice(0, 3).map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      onClick={() => setSelectedCategory(category)}
                      size="sm"
                      className="h-7 px-2 text-xs"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* View Toggle */}
              <div>
                <h3 className="text-sm font-semibold text-card-foreground mb-1">View</h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                      viewMode === "grid" 
                        ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                        : "bg-background border border-input hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <Grid3X3 className="h-3 w-3" />
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                      viewMode === "list" 
                        ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                        : "bg-background border border-input hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <List className="h-3 w-3" />
                    List
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Blog Posts Section */}
          {postsToShow.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-muted rounded-full mb-2">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="text-base font-bold text-card-foreground mb-2">No Articles Found</h3>
              <p className="text-muted-foreground mb-3 max-w-md mx-auto text-sm">
                Try adjusting your search terms or browse all categories to discover our nutrition content.
              </p>
              <Button 
                onClick={() => { setSearchTerm(""); setSelectedCategory(""); }}
                variant="outline"
                size="sm"
                className="h-8 text-xs"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-center">
                <h2 className="text-lg font-bold text-foreground mb-1">Latest Articles</h2>
                <p className="text-muted-foreground text-xs">
                  Showing {startIndex + 1}-{Math.min(endIndex, postsToShow.length)} of {postsToShow.length} article{postsToShow.length !== 1 ? 's' : ''}
                  {viewMode === "grid" ? " (6 per page)" : " (20 per page)"}
                </p>
              </div>
              
              {/* Blog Posts - Grid View */}
              {viewMode === "grid" && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {paginatedPosts.map((post, index) => (
                    <Card key={post.id || index} className="group border border-border bg-card hover:shadow-lg transition-all duration-300 overflow-hidden">
                      {post.tags && post.tags.length > 0 && (
                        <Badge className="absolute top-1 right-1 bg-primary text-primary-foreground border-0 z-10 text-xs px-1 py-0.5">
                          {post.tags[0]}
                        </Badge>
                      )}
                      
                      {/* Thumbnail */}
                      <div className="w-full h-32 bg-muted relative overflow-hidden">
                        {post.featuredImage || post.mediumUrl ? (
                          <img
                            src={post.featuredImage || post.mediumUrl}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Leaf className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <CardContent className="p-3 text-card-foreground">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : "Recent"}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {calculateReadTime(post.content || post.excerpt || "")} min
                          </div>
                        </div>
                        
                        <h3 className="text-sm font-bold mb-1 text-card-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                          {post.title}
                        </h3>
                        
                        <p className="text-muted-foreground mb-2 leading-relaxed line-clamp-2 text-xs">
                          {post.excerpt || post.content?.substring(0, 80) + "..."}
                        </p>
                        
                        <Link href={`/blog/post?id=${post.id}`}>
                          <Button variant="outline" className="w-full text-xs py-1.5 h-7">
                            Read Article
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Blog Posts - List View */}
              {viewMode === "list" && (
                <div className="space-y-3">
                  {paginatedPosts.map((post, index) => (
                    <Card key={post.id || index} className="group border border-border bg-card hover:shadow-lg transition-all duration-300 overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        {/* Thumbnail - Smaller in list view */}
                        <div className="w-full md:w-32 h-32 md:h-24 bg-muted relative overflow-hidden flex-shrink-0">
                          {post.featuredImage || post.mediumUrl ? (
                            <img
                              src={post.featuredImage || post.mediumUrl}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Leaf className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        
                        {/* Content */}
                        <CardContent className="p-4 text-card-foreground flex-1">
                          <div className="flex flex-col h-full">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-1">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : "Recent"}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {calculateReadTime(post.content || post.excerpt || "")} min
                                  </div>
                                </div>
                                
                                <h3 className="text-base font-bold mb-1 text-card-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                                  {post.title}
                                </h3>
                                
                                <p className="text-muted-foreground leading-relaxed line-clamp-2 mb-2 text-sm">
                                  {post.excerpt || post.content?.substring(0, 150) + "..."}
                                </p>
                              </div>
                              
                              {/* Tags and Read Button */}
                              <div className="flex flex-col items-end gap-2 ml-3">
                                {post.tags && post.tags.length > 0 && (
                                  <div className="flex gap-1 flex-wrap justify-end">
                                    {post.tags.slice(0, 1).map((tag: string, tagIndex: number) => (
                                      <Badge key={tagIndex} variant="secondary" className="text-xs px-1 py-0.5">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                                
                                <Link href={`/blog/post?id=${post.id}`}>
                                  <Button variant="outline" size="sm" className="whitespace-nowrap h-7 text-xs">
                                    Read Article
                                    <ArrowRight className="ml-1 h-3 w-3" />
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination Controls */}
              <PaginationControls />
            </div>
          )}

          {/* CTA Section */}
          <div className="text-center mt-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-base font-bold text-card-foreground mb-2">Need Personalized Nutrition Advice?</h3>
              <p className="text-muted-foreground mb-3 max-w-2xl mx-auto text-sm">
                Our blog articles provide general guidance, but for personalized recommendations tailored to your specific needs, book a consultation with our expert dietitian.
              </p>
              <Link href="/appointment">
                <Button size="sm" className="px-4 py-2 bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-sm">
                  Book Consultation
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}