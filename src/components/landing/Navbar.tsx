import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "Blog", href: "/blog", isRoute: true },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? "bg-background/95 backdrop-blur-lg border-b border-border shadow-sm" 
        : "bg-transparent"
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="TAXKORA" className="w-9 h-9 rounded-xl object-contain" />
            <span className={`font-display font-bold text-xl transition-colors ${
              isScrolled ? "text-foreground" : "text-primary-foreground"
            }`}>
              TAXKORA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link, i) => (
              link.isRoute ? (
                <Link 
                  key={i}
                  to={link.href}
                  className={`text-sm font-medium transition-colors ${
                    isScrolled 
                      ? "text-muted-foreground hover:text-foreground" 
                      : "text-primary-foreground/80 hover:text-primary-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ) : (
                <a 
                  key={i}
                  href={link.href} 
                  className={`text-sm font-medium transition-colors ${
                    isScrolled 
                      ? "text-muted-foreground hover:text-foreground" 
                      : "text-primary-foreground/80 hover:text-primary-foreground"
                  }`}
                >
                  {link.label}
                </a>
              )
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button variant={isScrolled ? "default" : "heroOutline"} size="sm">
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  variant={isScrolled ? "outline" : "ghost"} 
                  size="sm" 
                  onClick={() => signOut()}
                  className={!isScrolled ? "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10" : ""}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={!isScrolled ? "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10" : ""}
                  >
                    Log In
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button 
                    variant={isScrolled ? "default" : "accent"} 
                    size="sm"
                  >
                    Start Free Trial
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              isScrolled 
                ? "text-foreground hover:bg-secondary" 
                : "text-primary-foreground hover:bg-primary-foreground/10"
            }`}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className={`lg:hidden py-4 border-t animate-fade-in ${
            isScrolled ? "border-border" : "border-primary-foreground/10"
          }`}>
            <div className="flex flex-col gap-2">
              {navLinks.map((link, i) => (
                link.isRoute ? (
                  <Link 
                    key={i}
                    to={link.href}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isScrolled 
                        ? "text-muted-foreground hover:text-foreground hover:bg-secondary" 
                        : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a 
                    key={i}
                    href={link.href} 
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isScrolled 
                        ? "text-muted-foreground hover:text-foreground hover:bg-secondary" 
                        : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </a>
                )
              ))}
              
              <div className={`flex flex-col gap-2 pt-4 mt-2 border-t ${
                isScrolled ? "border-border" : "border-primary-foreground/10"
              }`}>
                {user ? (
                  <>
                    <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                      <Button variant="default" size="sm" className="w-full">
                        Dashboard
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => { signOut(); setIsOpen(false); }} className="w-full">
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">
                        Log In
                      </Button>
                    </Link>
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button variant="default" size="sm" className="w-full">
                        Start Free Trial
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
