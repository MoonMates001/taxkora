import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePWA } from "@/hooks/usePWA";
import { 
  Download, 
  Smartphone, 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  Zap, 
  Shield, 
  Bell,
  Calculator,
  FileText,
  TrendingUp,
  ArrowLeft,
  Share,
  MoreVertical,
  Plus
} from "lucide-react";
import logo from "@/assets/logo.png";

const InstallApp = () => {
  const { isInstallable, isInstalled, isOnline, promptInstall } = usePWA();

  const features = [
    {
      icon: Calculator,
      title: "Tax Calculator",
      description: "Calculate PIT, CIT, VAT & WHT instantly"
    },
    {
      icon: FileText,
      title: "Invoice Management",
      description: "Create and manage professional invoices"
    },
    {
      icon: TrendingUp,
      title: "Financial Tracking",
      description: "Track income, expenses & tax liabilities"
    },
    {
      icon: Zap,
      title: "Offline Support",
      description: "Access key features without internet"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your financial data stays protected"
    },
    {
      icon: Bell,
      title: "Tax Reminders",
      description: "Never miss a filing deadline"
    }
  ];

  const androidInstructions = [
    { step: 1, text: "Tap the menu button", icon: MoreVertical },
    { step: 2, text: "Select 'Add to Home screen'", icon: Plus },
    { step: 3, text: "Tap 'Add' to confirm", icon: Download }
  ];

  const iosInstructions = [
    { step: 1, text: "Tap the Share button", icon: Share },
    { step: 2, text: "Scroll and tap 'Add to Home Screen'", icon: Plus },
    { step: 3, text: "Tap 'Add' to confirm", icon: Download }
  ];

  return (
    <>
      <Helmet>
        <title>Install TAXKORA App | Nigeria Tax Calculator Mobile App</title>
        <meta name="description" content="Install TAXKORA on your mobile device. Access Nigeria's #1 tax calculator app offline. Calculate PIT, CIT, VAT & WHT on the go." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              <img src={logo} alt="TAXKORA" className="h-8 w-auto" />
            </Link>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <Wifi className="w-4 h-4" />
                  Online
                </span>
              ) : (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <WifiOff className="w-4 h-4" />
                  Offline
                </span>
              )}
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <Smartphone className="w-12 h-12 text-primary-foreground" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Install TAXKORA App
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Get instant access to Nigeria's #1 tax calculator right from your home screen. 
              Works offline, loads faster, and provides a native app experience.
            </p>

            {isInstalled ? (
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary rounded-full">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">App Already Installed!</span>
              </div>
            ) : isInstallable ? (
              <Button 
                size="lg" 
                onClick={promptInstall}
                className="gap-2 text-lg px-8 py-6"
              >
                <Download className="w-5 h-5" />
                Install Now
              </Button>
            ) : (
              <div className="text-muted-foreground">
                <p className="mb-4">Use the instructions below to install on your device</p>
              </div>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Installation Instructions */}
          {!isInstalled && (
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {/* Android Instructions */}
              <Card className="border-border/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-6 h-6 text-primary" fill="currentColor">
                        <path d="M17.6,9.48l1.84-3.18c0.16-0.31,0.04-0.69-0.26-0.85c-0.29-0.15-0.65-0.06-0.83,0.22l-1.88,3.24 c-1.37-0.53-2.91-0.83-4.53-0.83c-1.62,0-3.16,0.3-4.53,0.83L5.55,5.65C5.37,5.39,5.01,5.31,4.72,5.45C4.43,5.6,4.3,5.99,4.47,6.3 l1.84,3.18C3.38,11.24,1.33,14.27,1.33,18h21.33C22.67,14.27,20.62,11.24,17.6,9.48z M7,15.25c-0.69,0-1.25-0.56-1.25-1.25 s0.56-1.25,1.25-1.25s1.25,0.56,1.25,1.25S7.69,15.25,7,15.25z M17,15.25c-0.69,0-1.25-0.56-1.25-1.25s0.56-1.25,1.25-1.25 s1.25,0.56,1.25,1.25S17.69,15.25,17,15.25z"/>
                      </svg>
                    </div>
                    <div>
                      <CardTitle className="text-lg">Android (Chrome)</CardTitle>
                      <CardDescription>Install via browser menu</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-4">
                    {androidInstructions.map((item) => (
                      <li key={item.step} className="flex items-center gap-3">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                          {item.step}
                        </span>
                        <div className="flex items-center gap-2">
                          <item.icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{item.text}</span>
                        </div>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>

              {/* iOS Instructions */}
              <Card className="border-border/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="currentColor">
                        <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z"/>
                      </svg>
                    </div>
                    <div>
                      <CardTitle className="text-lg">iPhone (Safari)</CardTitle>
                      <CardDescription>Install via Share menu</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-4">
                    {iosInstructions.map((item) => (
                      <li key={item.step} className="flex items-center gap-3">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                          {item.step}
                        </span>
                        <div className="flex items-center gap-2">
                          <item.icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{item.text}</span>
                        </div>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Benefits Section */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-8">
              <h2 className="text-xl font-bold text-foreground mb-6 text-center">
                Why Install TAXKORA?
              </h2>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">2x</div>
                  <p className="text-muted-foreground">Faster than website</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">100%</div>
                  <p className="text-muted-foreground">Offline capable</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">0MB</div>
                  <p className="text-muted-foreground">Storage used (cached)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Already have an account?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="outline">
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/auth">Start Free Trial</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default InstallApp;
