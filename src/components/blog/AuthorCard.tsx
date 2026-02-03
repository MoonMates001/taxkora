import { Twitter, Linkedin, Globe, Mail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BlogAuthor } from "@/hooks/useBlogAuthors";

interface AuthorCardProps {
  author: BlogAuthor;
  variant?: "compact" | "full";
}

const AuthorCard = ({ author, variant = "full" }: AuthorCardProps) => {
  const initials = author.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={author.avatar_url || undefined} alt={author.name} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-foreground">{author.name}</p>
          {author.job_title && (
            <p className="text-sm text-muted-foreground">{author.job_title}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={author.avatar_url || undefined} alt={author.name} />
          <AvatarFallback className="bg-primary/10 text-primary text-lg">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-display text-lg font-bold text-foreground">
            {author.name}
          </h3>
          {author.job_title && (
            <p className="text-sm text-primary font-medium mb-2">
              {author.job_title}
            </p>
          )}
          {author.bio && (
            <p className="text-muted-foreground text-sm leading-relaxed">
              {author.bio}
            </p>
          )}
          
          {/* Social Links */}
          <div className="flex items-center gap-3 mt-4">
            {author.twitter_url && (
              <a
                href={author.twitter_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label={`${author.name} on Twitter`}
              >
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {author.linkedin_url && (
              <a
                href={author.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label={`${author.name} on LinkedIn`}
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {author.website_url && (
              <a
                href={author.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label={`${author.name}'s website`}
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
            {author.email && (
              <a
                href={`mailto:${author.email}`}
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label={`Email ${author.name}`}
              >
                <Mail className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorCard;
