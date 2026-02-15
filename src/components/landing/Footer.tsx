import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Linkedin, Twitter, Instagram } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  const footerLinks = {
    product: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "How It Works", href: "#how-it-works" }
    ],
    solutions: [
      { label: "For Individuals", href: "#features" },
      { label: "For SMEs", href: "#features" },
      { label: "For Corporations", href: "#features" }
    ],
    resources: [
      { label: "Help Center", href: "#" },
      { label: "Tax Guides", href: "#" },
      { label: "Blog", href: "#" }
    ],
    company: [
      { label: "About Us", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#contact" }
    ]
  };

  const socialLinks = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Instagram, href: "#", label: "Instagram" }
  ];

  return (
    <footer id="contact" className="bg-gray-900 text-gray-300">
      {/* Main footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-6 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <img src={logo} alt="TAXKORA" className="w-10 h-10 rounded-xl object-contain" />
              <span className="font-display font-bold text-2xl text-white">TAXKORA</span>
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Nigeria's leading tax and financial compliance platform. 
              Making tax simple for businesses and individuals since 2024.
            </p>
            
            {/* Contact info */}
            <div className="space-y-3">
              <a href="mailto:alphalinkprime@gmail.com" className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                <Mail className="w-4 h-4 text-teal-500" />
                <span>alphalinkprime@gmail.com</span>
              </a>
              <a href="tel:+2347077706706" className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                <Phone className="w-4 h-4 text-teal-500" />
                <span>+234 707 770 6706</span>
              </a>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-teal-500" />
                <span>Lagos, Nigeria</span>
              </div>
            </div>

            {/* Social links */}
            <div className="flex gap-3 mt-6">
              {socialLinks.map((social, i) => (
                <a 
                  key={i} 
                  href={social.href} 
                  aria-label={social.label}
                  className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-teal-600 flex items-center justify-center transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-1">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-sm hover:text-teal-400 transition-colors inline-flex items-center min-h-[44px] py-2">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Solutions</h4>
            <ul className="space-y-1">
              {footerLinks.solutions.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-sm hover:text-teal-400 transition-colors inline-flex items-center min-h-[44px] py-2">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-1">
              {footerLinks.resources.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-sm hover:text-teal-400 transition-colors inline-flex items-center min-h-[44px] py-2">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-1">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-sm hover:text-teal-400 transition-colors inline-flex items-center min-h-[44px] py-2">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} TAXKORA. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-6">
              <a href="#" className="text-sm text-gray-500 hover:text-teal-400 transition-colors inline-flex items-center min-h-[44px] py-2 px-1">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-teal-400 transition-colors inline-flex items-center min-h-[44px] py-2 px-1">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-teal-400 transition-colors inline-flex items-center min-h-[44px] py-2 px-1">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
