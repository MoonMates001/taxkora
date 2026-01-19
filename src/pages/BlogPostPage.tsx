import { useParams, Link } from "react-router-dom";
import { Calendar, User, ArrowLeft, Tag, Share2, Clock } from "lucide-react";
import { format } from "date-fns";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useBlogPost, useBlogPosts } from "@/hooks/useBlogPosts";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = useBlogPost(slug || "");
  const { data: allPosts } = useBlogPosts(true);
  
  const relatedPosts = allPosts?.filter(p => 
    p.id !== post?.id && p.category === post?.category
  ).slice(0, 3) || [];

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt || "",
          url,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const estimatedReadTime = post ? Math.ceil(post.content.split(" ").length / 200) : 0;

  if (error) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-16 text-center">
          <div className="container mx-auto px-4">
            <div className="text-6xl mb-4">😕</div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">
              Post Not Found
            </h1>
            <p className="text-muted-foreground mb-8">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/blog">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {isLoading ? (
        <div className="pt-32 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <Skeleton className="h-8 w-32 mb-8" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-12 w-3/4 mb-8" />
            <Skeleton className="h-96 w-full rounded-2xl mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      ) : post ? (
        <>
          {/* Article Header */}
          <article className="pt-32 pb-16">
            <div className="container mx-auto px-4 max-w-4xl">
              {/* Back link */}
              <Link 
                to="/blog" 
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </Link>

              {/* Title and meta */}
              <header className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                    {post.category}
                  </span>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {estimatedReadTime} min read
                  </span>
                </div>
                
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
                  {post.title}
                </h1>

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {post.author_name}
                    </span>
                    {post.published_at && (
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(post.published_at), "MMMM d, yyyy")}
                      </span>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </header>

              {/* Cover image */}
              {post.cover_image_url && (
                <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-12">
                  <img 
                    src={post.cover_image_url} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="prose prose-lg max-w-none">
                <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </div>
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-border">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    {post.tags.map((tag, i) => (
                      <span 
                        key={i}
                        className="px-3 py-1 bg-secondary text-muted-foreground text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="py-16 bg-secondary/30">
              <div className="container mx-auto px-4">
                <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
                  Related Articles
                </h2>
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                  {relatedPosts.map((relatedPost) => (
                    <Link 
                      key={relatedPost.id}
                      to={`/blog/${relatedPost.slug}`}
                      className="group bg-card rounded-xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all"
                    >
                      <div className="aspect-[16/10] bg-secondary overflow-hidden">
                        {relatedPost.cover_image_url ? (
                          <img 
                            src={relatedPost.cover_image_url} 
                            alt={relatedPost.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                            <span className="text-3xl">📝</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {relatedPost.title}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      ) : null}

      <Footer />
    </main>
  );
};

export default BlogPostPage;
