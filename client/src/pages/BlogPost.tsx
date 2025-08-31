import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar, Clock, User, Share2 } from "lucide-react";
import { Link } from "wouter";
import { useFirestoreDocument } from "@/hooks/useFirestore";

export default function BlogPost() {
  const [location] = useLocation();
  const [blogId, setBlogId] = useState<string>("");
  
  // Extract blog ID from URL (e.g., /blog/post?id=123)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      setBlogId(id);
    }
  }, [location]);

  // Fetch the specific blog post from Firestore
  const { data: post, loading, error } = useFirestoreDocument("blogs", blogId);

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(' ').length;
    return Math.ceil(words / wordsPerMinute);
  };

  if (loading) {
    return (
      <div className="min-h-screen py-20 bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen py-20 bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
          <p className="text-muted-foreground mb-6">The blog post you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link href="/blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <div className="mb-8">
          <Button variant="ghost" asChild>
            <Link href="/blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
          </Button>
        </div>

        {/* Article */}
        <article className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            {post.category && (
              <Badge variant="secondary" className="mb-4">
                {post.category}
              </Badge>
            )}
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta information */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{post.author || 'Nazdravi'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(post.publishDate?.toDate() || post.createdAt?.toDate()).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{calculateReadTime(post.content || post.excerpt || '')} min read</span>
              </div>
            </div>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-xl text-muted-foreground leading-relaxed">
                {post.excerpt}
              </p>
            )}
          </header>

          {/* Featured Image with Title Overlay */}
          {post.featuredImage && (
            <div className="relative mb-8">
              <img 
                src={post.featuredImage} 
                alt={post.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent rounded-lg"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">
                  {post.title}
                </h1>
                {post.excerpt && (
                  <p className="text-white/90 text-sm md:text-base leading-relaxed max-w-2xl">
                    {post.excerpt}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div 
                className="prose prose-base max-w-none dark:prose-invert
                          prose-headings:text-gray-900 dark:prose-headings:text-white
                          prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-5 prose-h1:mt-6
                          prose-h2:text-xl prose-h2:font-semibold prose-h2:mb-4 prose-h2:mt-6 prose-h2:text-primary-700 dark:prose-h2:text-primary-300
                          prose-h3:text-lg prose-h3:font-semibold prose-h3:mb-3 prose-h3:mt-4
                          prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4 prose-p:text-base
                          prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-semibold
                          prose-em:text-gray-600 dark:prose-em:text-gray-400
                          prose-blockquote:border-l-4 prose-blockquote:border-primary-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:bg-primary-50 dark:prose-blockquote:bg-primary-900/20 prose-blockquote:py-3 prose-blockquote:rounded-r-md prose-blockquote:text-base
                          prose-ul:space-y-1 prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:text-base
                          prose-ol:space-y-1
                          prose-img:rounded-lg prose-img:shadow-md prose-img:mx-auto
                          prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-a:no-underline hover:prose-a:underline
                          prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
                          prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: post.content || post.excerpt || '' }}
              />
            </CardContent>
          </Card>

          {/* Share and Actions */}
          <div className="flex items-center justify-between border-t pt-8">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
            
            <Button asChild>
              <Link href="/blog">
                More Articles
              </Link>
            </Button>
          </div>
        </article>

        {/* Related Posts Section */}
        <section className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Continue Reading</h2>
          <div className="text-center">
            <Button asChild>
              <Link href="/blog">
                View All Blog Posts
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}