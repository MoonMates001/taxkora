import { useState } from "react";
import { Mail, Phone, MapPin, MessageSquare, Clock, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateSupportTicket } from "@/hooks/useSupportTickets";
import { z } from "zod";

const supportSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  phone: z.string().trim().max(20).optional(),
  subject: z.string().trim().min(5, "Subject must be at least 5 characters").max(200),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
  category: z.string().optional(),
});

const CustomerSupport = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    category: "general",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const createTicket = useCreateSupportTicket();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const result = supportSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }
    
    await createTicket.mutateAsync({
      name: result.data.name,
      email: result.data.email,
      phone: result.data.phone,
      subject: result.data.subject,
      message: result.data.message,
      category: result.data.category,
    });
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      category: "general",
    });
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      value: "alphalinkprime@gmail.com",
      href: "mailto:alphalinkprime@gmail.com",
      description: "Get a response within 24 hours",
    },
    {
      icon: Phone,
      title: "Phone Support",
      value: "+234 707 770 6706",
      href: "tel:+2347077706706",
      description: "Mon-Fri, 9am-6pm WAT",
    },
    {
      icon: MessageSquare,
      title: "WhatsApp",
      value: "+234 707 770 6706",
      href: "https://wa.me/2347077706706",
      description: "Quick responses on WhatsApp",
    },
    {
      icon: MapPin,
      title: "Office",
      value: "Lagos, Nigeria",
      href: "#",
      description: "Visit us in person",
    },
  ];

  const categories = [
    { value: "general", label: "General Inquiry" },
    { value: "billing", label: "Billing & Payments" },
    { value: "technical", label: "Technical Support" },
    { value: "tax-advice", label: "Tax Advice" },
    { value: "partnership", label: "Partnership" },
    { value: "feedback", label: "Feedback" },
  ];

  return (
    <section id="support" className="py-24 bg-secondary/30 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full text-primary text-sm font-medium mb-4">
            <MessageSquare className="w-4 h-4" />
            Customer Support
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            We're Here to <span className="text-gradient">Help</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Have questions about your taxes or need assistance with TAXKORA? Our dedicated support team is ready to help you succeed.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact Methods */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="font-display text-xl font-bold text-foreground mb-6">
              Get in Touch
            </h3>
            
            {contactMethods.map((method, index) => (
              <a
                key={index}
                href={method.href}
                target={method.href.startsWith("http") ? "_blank" : undefined}
                rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group flex items-start gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <method.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {method.title}
                  </h4>
                  <p className="text-primary font-medium">{method.value}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {method.description}
                  </p>
                </div>
              </a>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-2xl border border-border p-8 shadow-lg">
              <h3 className="font-display text-xl font-bold text-foreground mb-6">
                Send Us a Message
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Full Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                      className={errors.name ? "border-destructive" : ""}
                    />
                    {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+234 XXX XXX XXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Category
                    </label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Subject *
                  </label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="How can we help?"
                    className={errors.subject ? "border-destructive" : ""}
                  />
                  {errors.subject && <p className="text-sm text-destructive mt-1">{errors.subject}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Message *
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your question or issue in detail..."
                    rows={5}
                    className={errors.message ? "border-destructive" : ""}
                  />
                  {errors.message && <p className="text-sm text-destructive mt-1">{errors.message}</p>}
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full group"
                  disabled={createTicket.isPending}
                >
                  {createTicket.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerSupport;
