import { useParams, Link } from "wouter";
import { ArrowLeft, Calendar, Clock, Share2, Tag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { BlogPost } from "@/types";
import { where } from "firebase/firestore";

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug;

  // Fetch blog post by slug
  const { data: blogPosts, loading } = useFirestoreCollection<BlogPost>("blog_posts", [
    where("slug", "==", slug),
    where("published", "==", true)
  ]);

  const post = blogPosts?.[0];

  // Sample blog post for demo
  const samplePost: BlogPost = {
    id: "1",
    slug: "meal-prep-busy-professionals",
    title: "10 Simple Meal Prep Ideas for Busy Professionals",
    excerpt: "Discover time-saving meal prep strategies that will help you maintain a healthy diet even with a hectic schedule.",
    content: `
# 10 Simple Meal Prep Ideas for Busy Professionals

In today's fast-paced world, maintaining a healthy diet can feel like an impossible task. Between long work hours, commutes, and personal responsibilities, finding time to prepare nutritious meals often takes a backseat. However, with the right meal prep strategies, you can take control of your nutrition without sacrificing precious time.

## Why Meal Prep Matters

Meal prepping isn't just a trend—it's a practical solution that offers numerous benefits:

- **Time savings**: Spend a few hours on the weekend to save hours during the week
- **Cost effectiveness**: Reduce food waste and avoid expensive takeout
- **Portion control**: Pre-portioned meals help maintain healthy eating habits
- **Reduced stress**: Eliminate daily decisions about what to eat
- **Better nutrition**: Ensure you're getting balanced, wholesome meals

## The Busy Professional's Guide to Meal Prep

### 1. Start with Simple Proteins

The foundation of any good meal prep is protein. Choose options that are versatile and can be prepared in large batches:

- **Grilled chicken breast**: Season differently each week for variety
- **Baked salmon**: Rich in omega-3 fatty acids
- **Hard-boiled eggs**: Perfect for breakfast or snacks
- **Turkey meatballs**: Can be used in various dishes
- **Tofu or tempeh**: Great plant-based options

### 2. Embrace Sheet Pan Cooking

Sheet pan meals are a meal prepper's best friend. Simply toss vegetables and protein with olive oil and seasonings, then bake everything together:

- Chicken thighs with roasted vegetables
- Salmon with asparagus and sweet potatoes
- Turkey meatballs with bell peppers and zucchini

### 3. Master the Art of Grain Bowls

Grain bowls are customizable, nutritious, and perfect for meal prep:

**Base**: Quinoa, brown rice, or farro
**Protein**: Your choice from above
**Vegetables**: Roasted, steamed, or raw
**Healthy fats**: Avocado, nuts, or seeds
**Flavor**: Tahini, pesto, or vinaigrette

### 4. Prep Components, Not Just Complete Meals

Sometimes preparing individual components is more practical:

- Cook grains in bulk
- Wash and chop vegetables
- Prepare proteins
- Make sauces and dressings

This approach allows for more variety throughout the week.

### 5. Leverage Your Slow Cooker or Instant Pot

These appliances are perfect for busy professionals:

- **Slow cooker**: Set it before work and come home to a ready meal
- **Instant Pot**: Quick cooking for proteins and grains
- **Examples**: Chicken curry, beef stew, lentil soup

## Breakfast Prep Ideas

Don't forget about the most important meal of the day:

### Overnight Oats
Combine oats, milk, chia seeds, and your favorite toppings in jars. Refrigerate overnight for a grab-and-go breakfast.

### Egg Muffins
Whisk eggs with vegetables and pour into muffin tins. Bake and store for easy reheating.

### Smoothie Packs
Pre-portion frozen fruits and vegetables in bags. Just add liquid and blend in the morning.

## Storage and Safety Tips

Proper storage is crucial for meal prep success:

- Use glass containers when possible
- Label everything with dates
- Store for no more than 3-4 days in the refrigerator
- Freeze portions you won't eat within a few days
- Always reheat thoroughly before eating

## Making It Sustainable

The key to successful meal prep is making it sustainable:

1. **Start small**: Begin with prepping just lunches or dinners
2. **Be realistic**: Don't try to prep every meal immediately
3. **Allow flexibility**: It's okay to have some backup options
4. **Listen to your body**: Adjust portions and ingredients based on your needs

## Sample Weekly Meal Prep Schedule

**Sunday (2-3 hours):**
- Cook grains and proteins
- Wash and chop vegetables
- Prepare 2-3 sauce/dressing options
- Assemble some complete meals

**Wednesday (30 minutes):**
- Quick refresh: wash more vegetables
- Prepare one new protein option
- Adjust portions as needed

## Conclusion

Meal prep doesn't have to be complicated or time-consuming. By implementing these simple strategies, you can maintain a healthy diet even with the busiest schedule. Remember, the goal is progress, not perfection. Start with one or two ideas and gradually build your meal prep routine.

Your future self will thank you for the time and effort you invest in your health today. With a little planning and preparation, you can enjoy nutritious, delicious meals all week long—no matter how hectic your schedule gets.

## Ready to Get Started?

If you need personalized guidance with meal planning and nutrition, I'm here to help. Book a consultation to create a meal prep strategy that works specifically for your lifestyle and goals.
    `,
    featuredImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600",
    tags: ["Meal Prep", "Tips", "Busy Lifestyle", "Nutrition"],
    lang: "en",
    published: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15")
  };

  const currentPost = post || samplePost;

  function calculateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  if (loading) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentPost) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The article you're looking for doesn't exist or has been moved.
          </p>
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
    <div className="min-h-screen py-20">
      {/* Back Button */}
      <div className="container mx-auto px-4 mb-8">
        <Button variant="ghost" asChild>
          <Link href="/blog">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
        </Button>
      </div>

      {/* Article Header */}
      <header className="container mx-auto px-4 mb-12">
        <div className="max-w-4xl mx-auto">
          {/* Meta Information */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(currentPost.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{calculateReadTime(currentPost.content)} min read</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>Vee</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {currentPost.title}
          </h1>

          {/* Excerpt */}
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            {currentPost.excerpt}
          </p>

          {/* Tags */}
          <div className="flex items-center gap-2 mb-8">
            <Tag className="w-4 h-4 text-muted-foreground" />
            {currentPost.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Featured Image */}
          {currentPost.featuredImage && (
            <div className="relative rounded-2xl overflow-hidden mb-12">
              <img 
                src={currentPost.featuredImage} 
                alt={currentPost.title}
                className="w-full h-[400px] object-cover"
              />
            </div>
          )}
        </div>
      </header>

      {/* Article Content */}
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto grid lg:grid-cols-4 gap-12">
          {/* Main Content */}
          <article className="lg:col-span-3">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              {/* Render markdown content */}
              {currentPost.content.split('\n').map((paragraph, index) => {
                if (paragraph.startsWith('# ')) {
                  return <h1 key={index} className="text-3xl font-bold mt-8 mb-4">{paragraph.slice(2)}</h1>;
                } else if (paragraph.startsWith('## ')) {
                  return <h2 key={index} className="text-2xl font-semibold mt-6 mb-3">{paragraph.slice(3)}</h2>;
                } else if (paragraph.startsWith('### ')) {
                  return <h3 key={index} className="text-xl font-semibold mt-4 mb-2">{paragraph.slice(4)}</h3>;
                } else if (paragraph.startsWith('- ')) {
                  return <li key={index} className="ml-4">{paragraph.slice(2)}</li>;
                } else if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                  return <p key={index} className="font-bold">{paragraph.slice(2, -2)}</p>;
                } else if (paragraph.trim() === '') {
                  return <br key={index} />;
                } else {
                  return <p key={index} className="mb-4 leading-relaxed">{paragraph}</p>;
                }
              })}
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-8">
              {/* Share */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Share this article</h3>
                  <Button variant="outline" className="w-full">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </CardContent>
              </Card>

              {/* Author */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Vee</h3>
                      <p className="text-sm text-muted-foreground">Registered Dietitian</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Passionate about helping people transform their relationship with food through evidence-based nutrition.
                  </p>
                  <Button size="sm" variant="outline" asChild className="w-full">
                    <Link href="/about">Learn More</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Related Topics */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Related Topics</h3>
                  <div className="space-y-2">
                    {currentPost.tags.map((tag) => (
                      <Button key={tag} variant="ghost" size="sm" className="w-full justify-start">
                        <Tag className="w-4 h-4 mr-2" />
                        {tag}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>

      {/* Call to Action */}
      <section className="container mx-auto px-4 mt-20">
        <div className="max-w-4xl mx-auto">
          <Separator className="mb-12" />
          
          <Card className="bg-gradient-to-r from-primary-500 to-primary-600 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">
                Ready to Transform Your Nutrition?
              </h2>
              <p className="text-primary-100 mb-6">
                Get personalized guidance and support on your health journey.
              </p>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/appointment">Book a Consultation</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
