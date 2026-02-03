import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, User, ArrowRight, Clock } from "lucide-react";
import { format } from "date-fns";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { usePaginatedBlogPosts } from "@/hooks/useBlogPosts";
import { Skeleton } from "@/components/ui/skeleton";
import { SEOHead, BreadcrumbJsonLd } from "@/components/seo";
import { Helmet } from "react-helmet-async";
import BlogPagination from "@/components/blog/BlogPagination";

const POSTS_PER_PAGE = 9;

const BlogPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading } = usePaginatedBlogPosts(currentPage, POSTS_PER_PAGE, true);

  const posts = data?.posts || [];
  const totalPages = data?.totalPages || 1;
  const totalCount = data?.totalCount || 0;

  const featuredPost = currentPage === 1 ? posts[0] : null;
  const regularPosts = currentPage === 1 ? posts.slice(1) : posts;

  const blogUrl = "https://taxkora.com/blog";

  // Generate CollectionPage JSON-LD for blog listing
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${blogUrl}#webpage`,
    url: blogUrl,
    name: "TAXKORA Blog - Nigerian Tax Guides & Insights",
    description: "Expert tax insights, compliance guides, and tips for Nigerian businesses, freelancers, and SMEs. Learn about PIT, CIT, VAT, WHT, and FIRS requirements.",
    isPartOf: {
      "@type": "WebSite",
      "@id": "https://taxkora.com/#website",
      url: "https://taxkora.com",
      name: "TAXKORA Nigeria"
    },
    about: {
      "@type": "Thing",
      name: "Nigerian Tax Compliance"
    },
    inLanguage: "en-NG",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: totalCount,
      itemListElement: posts.slice(0, 10).map((post, index) => ({
        "@type": "ListItem",
        position: (currentPage - 1) * POSTS_PER_PAGE + index + 1,
        url: `https://taxkora.com/blog/${post.slug}`,
        name: post.title
      }))
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-background">
      {/* SEO Meta Tags */}
      <SEOHead
        title={currentPage > 1 ? `Blog - Page ${currentPage}` : "Blog - Nigerian Tax Guides & Insights"}
        description="Expert tax insights, compliance guides, and tips for Nigerian businesses, freelancers, and SMEs. Learn about Personal Income Tax, Company Income Tax, VAT, Withholding Tax, and FIRS requirements."
        canonicalUrl={currentPage > 1 ? `${blogUrl}?page=${currentPage}` : blogUrl}
        ogType="website"
        keywords={[
          "Nigeria tax blog",
          "Nigerian tax tips",
          "FIRS compliance guide",
          "tax filing Nigeria",
          "PIT guide Nigeria",
          "CIT guide Nigeria",
          "VAT Nigeria guide",
          "WHT Nigeria",
          "tax compliance SME Nigeria",
          "freelancer tax Nigeria"
        ]}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://taxkora.com" },
          { name: "Blog", url: blogUrl },
        ]}
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(collectionJsonLd)}
        </script>
      </Helmet>

      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-primary via-teal-600 to-teal-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-primary-foreground mb-6">
              TAXKORA Blog
            </h1>
            <p className="text-xl text-primary-foreground/80">
              Expert insights, tax tips, and guides to help Nigerian businesses and individuals navigate tax compliance with confidence.
            </p>
            {totalCount > 0 && (
              <p className="text-primary-foreground/60 mt-4">
                {totalCount} article{totalCount !== 1 ? "s" : ""} published
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="space-y-8">
              <Skeleton className="h-96 w-full rounded-2xl" />
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-80 rounded-2xl" />
                ))}
              </div>
            </div>
          ) : posts.length > 0 ? (
            <>
              {/* Featured Post - Only on first page */}
              {featuredPost && (
                <div className="mb-16">
                  <Link 
                    to={`/blog/${featuredPost.slug}`}
                    className="group grid lg:grid-cols-2 gap-8 bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="aspect-[16/10] lg:aspect-auto bg-secondary">
                      {featuredPost.cover_image_url ? (
                        <img 
                          src={featuredPost.cover_image_url} 
                          alt={featuredPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <span className="text-6xl">📝</span>
                        </div>
                      )}
                    </div>
                    <div className="p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                          {featuredPost.category}
                        </span>
                        <span className="text-sm text-muted-foreground">Featured</span>
                      </div>
                      <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                        {featuredPost.title}
                      </h2>
                      <p className="text-muted-foreground mb-6 line-clamp-3">
                        {featuredPost.excerpt || featuredPost.content.substring(0, 200)}...
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {featuredPost.author?.name || featuredPost.author_name}
                          </span>
                          {featuredPost.published_at && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(featuredPost.published_at), "MMM d, yyyy")}
                            </span>
                          )}
                        </div>
                        <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                          Read More
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              {/* Regular Posts Grid */}
              {regularPosts.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {regularPosts.map((post) => (
                    <Link 
                      key={post.id}
                      to={`/blog/${post.slug}`}
                      className="group bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="aspect-[16/10] bg-secondary overflow-hidden">
                        {post.cover_image_url ? (
                          <img 
                            src={post.cover_image_url} 
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                            <span className="text-4xl">📝</span>
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                            {post.category}
                          </span>
                          {post.published_at && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(new Date(post.published_at), "MMM d, yyyy")}
                            </span>
                          )}
                        </div>
                        <h3 className="font-display text-lg font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                          {post.excerpt || post.content.substring(0, 120)}...
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {post.author?.name || post.author_name}
                          </span>
                          <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                            Read
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Pagination */}
              <BlogPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                No Posts Yet
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                We're working on creating valuable content for you. Check back soon for tax tips, guides, and industry insights!
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default BlogPage;
