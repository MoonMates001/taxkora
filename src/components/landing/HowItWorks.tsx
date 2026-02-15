import { UserPlus, FileSpreadsheet, Calculator, Send, ArrowRight, Play, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";

const HowItWorks = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const steps = [
    {
      number: "01",
      icon: UserPlus,
      title: "Create Your Account",
      description: "Sign up in 2 minutes. Choose between Business or Personal module based on your tax needs.",
      color: "teal"
    },
    {
      number: "02",
      icon: FileSpreadsheet,
      title: "Record Your Transactions",
      description: "Add income, expenses, and invoices. Our smart system auto-categorizes and tracks everything.",
      color: "teal"
    },
    {
      number: "03",
      icon: Calculator,
      title: "Auto Tax Computation",
      description: "TAXKORA calculates your PIT, CIT, VAT, and WHT in real-time based on current NRS regulations.",
      color: "teal"
    },
    {
      number: "04",
      icon: Send,
      title: "File with Confidence",
      description: "Review your tax summary and file directly to NRS. Get instant confirmation and keep records organized.",
      color: "coral"
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-secondary/30 relative">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full text-primary text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-coral-500 rounded-full" />
            Simple Process
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            From Signup to Filing in{" "}
            <span className="text-gradient-accent">4 Easy Steps</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Get started in minutes. TAXKORA handles the complexity so you can focus on what matters—your business.
          </p>
        </div>

        {/* Video Walkthrough Section */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border bg-card">
            {/* Video/GIF Container */}
            <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800">
              {/* Animated Dashboard Preview */}
              <div className="absolute inset-0 p-4 sm:p-8">
                {/* Browser chrome */}
                <div className="bg-gray-800/80 backdrop-blur rounded-t-xl border border-gray-700/50 p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-coral-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <div className="flex-1 ml-4 h-5 bg-gray-700/50 rounded flex items-center px-3">
                      <span className="text-xs text-gray-400">app.taxkora.com/dashboard</span>
                    </div>
                  </div>
                </div>
                
                {/* Animated Dashboard Content */}
                <div className="bg-gray-900/90 backdrop-blur border-x border-b border-gray-700/50 rounded-b-xl p-4 h-[calc(100%-44px)] overflow-hidden">
                  <div className="space-y-3 animate-fade-in">
                    {/* Stat cards animation */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className={`bg-gray-800/60 rounded-lg p-3 border border-gray-700/30 transition-all duration-700 ${isPlaying ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-70'}`} style={{ transitionDelay: '0ms' }}>
                        <div className="text-[10px] text-gray-400">Income</div>
                        <div className={`text-sm font-bold text-white transition-all duration-1000 ${isPlaying ? 'scale-100' : 'scale-95'}`}>₦4.2M</div>
                        <div className="text-[10px] text-green-400">↑ 12.5%</div>
                      </div>
                      <div className={`bg-gray-800/60 rounded-lg p-3 border border-gray-700/30 transition-all duration-700 ${isPlaying ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-70'}`} style={{ transitionDelay: '100ms' }}>
                        <div className="text-[10px] text-gray-400">Expenses</div>
                        <div className={`text-sm font-bold text-white transition-all duration-1000 ${isPlaying ? 'scale-100' : 'scale-95'}`}>₦1.8M</div>
                        <div className="text-[10px] text-coral-400">↓ 3.2%</div>
                      </div>
                      <div className={`bg-teal-600/20 rounded-lg p-3 border border-teal-500/30 transition-all duration-700 ${isPlaying ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-70'}`} style={{ transitionDelay: '200ms' }}>
                        <div className="text-[10px] text-teal-300">Tax Due</div>
                        <div className={`text-sm font-bold text-white transition-all duration-1000 ${isPlaying ? 'scale-100' : 'scale-95'}`}>₦245K</div>
                        <div className="text-[10px] text-teal-400">Auto-computed</div>
                      </div>
                    </div>

                    {/* Chart animation */}
                    <div className={`bg-gray-800/40 rounded-lg p-3 h-20 transition-all duration-700 ${isPlaying ? 'opacity-100' : 'opacity-70'}`} style={{ transitionDelay: '300ms' }}>
                      <div className="flex items-end justify-between h-full gap-1">
                        {[35, 55, 40, 70, 50, 85, 65, 80, 55, 90, 70, 82].map((h, i) => (
                          <div 
                            key={i} 
                            className={`flex-1 bg-gradient-to-t from-teal-600 to-teal-400 rounded-t transition-all duration-1000 ${isPlaying ? '' : 'scale-y-75'}`}
                            style={{ 
                              height: `${isPlaying ? h : h * 0.5}%`,
                              transitionDelay: `${400 + i * 50}ms`
                            }} 
                          />
                        ))}
                      </div>
                    </div>

                    {/* Invoice row animation */}
                    <div className={`bg-gray-800/40 rounded-lg p-3 flex items-center justify-between transition-all duration-700 ${isPlaying ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-70'}`} style={{ transitionDelay: '800ms' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-coral-500/20 rounded-lg flex items-center justify-center">
                          <FileSpreadsheet className="w-4 h-4 text-coral-400" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-white">INV-2025-0142</div>
                          <div className="text-[10px] text-gray-400">Acme Corp</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-white">₦850,000</div>
                        <span className="text-[10px] px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded">Paid</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Play overlay */}
              {!isPlaying && (
                <button 
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all hover:bg-black/30 group cursor-pointer"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                    <span className="text-white font-medium text-sm">Watch Platform Demo</span>
                  </div>
                </button>
              )}

              {/* Replay button */}
              {isPlaying && (
                <button 
                  onClick={() => {
                    setIsPlaying(false);
                    setTimeout(() => setIsPlaying(true), 100);
                  }}
                  className="absolute bottom-4 right-4 px-3 py-1.5 bg-white/10 backdrop-blur border border-white/20 rounded-lg text-white text-xs font-medium hover:bg-white/20 transition-all flex items-center gap-2"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  Replay Demo
                </button>
              )}
            </div>

            {/* Caption bar */}
            <div className="bg-card px-6 py-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground text-sm">See TAXKORA in Action</h3>
                  <p className="text-muted-foreground text-xs">Watch how easy it is to manage your taxes</p>
                </div>
                <Link to="/auth">
                  <Button size="sm" variant="outline" className="text-xs">
                    Try It Yourself
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Steps - Desktop */}
        <div className="hidden lg:block relative max-w-6xl mx-auto">
          {/* Connection line */}
          <div className="absolute top-24 left-[10%] right-[10%] h-0.5">
            <div className="w-full h-full bg-gradient-to-r from-teal-500 via-teal-500 to-coral-500 opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-teal-500 to-coral-500 animate-pulse opacity-20" />
          </div>

          <div className="grid grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                {/* Step circle */}
                <div className="relative inline-flex mb-8">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center relative z-10 shadow-lg ${
                    step.color === "coral" 
                      ? "bg-gradient-to-br from-coral-400 to-coral-600" 
                      : "bg-gradient-to-br from-teal-500 to-teal-700"
                  }`}>
                    <step.icon className="w-9 h-9 text-white" />
                  </div>
                  <span className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-20 shadow-md ${
                    step.color === "coral"
                      ? "bg-coral-500 text-white"
                      : "bg-teal-600 text-white"
                  }`}>
                    {step.number}
                  </span>
                </div>

                <h3 className="font-display font-bold text-xl text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Steps - Mobile */}
        <div className="lg:hidden space-y-8">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-6">
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${
                  step.color === "coral" 
                    ? "bg-gradient-to-br from-coral-400 to-coral-600" 
                    : "bg-gradient-to-br from-teal-500 to-teal-700"
                }`}>
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-0.5 flex-1 mt-4 ${
                    step.color === "coral" ? "bg-coral-200" : "bg-teal-200"
                  }`} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-8">
                <span className={`text-sm font-bold ${
                  step.color === "coral" ? "text-coral-500" : "text-teal-600"
                }`}>
                  Step {step.number}
                </span>
                <h3 className="font-display font-bold text-lg text-foreground mt-1 mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center px-4 sm:px-0">
          <Link to="/auth" className="block sm:inline-block">
            <Button size="lg" className="group w-full sm:w-auto">
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <p className="text-muted-foreground text-sm mt-4">
            90-day free trial • No credit card required
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
