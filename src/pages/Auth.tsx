import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { Building2, User, ArrowLeft, Loader2, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import logoImage from "@/assets/logo.png";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

type AccountType = "business" | "personal";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get("ref");
  
  const [isLogin, setIsLogin] = useState(true);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [referrerName, setReferrerName] = useState<string | null>(null);

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Check if referral code is valid and get referrer info + track click
  useEffect(() => {
    if (referralCode) {
      setIsLogin(false); // Switch to signup mode for referrals
      
      const fetchReferrerAndTrackClick = async () => {
        // Use secure function to get referral info (includes referrer name)
        const { data } = await supabase
          .rpc("get_referral_by_code", { p_code: referralCode });
        
        if (data && data.length > 0) {
          const referral = data[0];
          if (referral.referrer_name) {
            setReferrerName(referral.referrer_name);
          }
          
          // Track the referral link click
          await supabase
            .from("referral_link_clicks")
            .insert({
              referral_code: referralCode,
              referrer_id: referral.referrer_id,
              user_agent: navigator.userAgent,
              referrer_url: document.referrer || null,
            });
        }
      };
      
      fetchReferrerAndTrackClick();
    }
  }, [referralCode]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Login Failed",
            description: error.message === "Invalid login credentials" 
              ? "Invalid email or password. Please try again." 
              : error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You've successfully logged in.",
          });
          navigate("/dashboard");
        }
      } else {
        if (!accountType) {
          toast({
            title: "Account Type Required",
            description: "Please select an account type.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        const { error } = await signUp(email, password, fullName, accountType, businessName);
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Account Exists",
              description: "This email is already registered. Please log in instead.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Sign Up Failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          // If signed up with referral code, update or create the referral record and send notification
          if (referralCode) {
            // Get the newly created user session
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session?.user) {
              // Try to find an existing pending referral with this code for this email
              const { data: existingReferral } = await supabase
                .from("referrals")
                .select("id, referrer_id")
                .eq("referral_code", referralCode)
                .eq("status", "pending")
                .eq("referred_email", email)
                .maybeSingle();

              if (existingReferral) {
                // Update existing email-invited referral
                await supabase
                  .from("referrals")
                  .update({
                    referred_user_id: session.user.id,
                    status: "subscribed",
                    completed_at: new Date().toISOString(),
                  })
                  .eq("id", existingReferral.id);

                // Send notification
                await supabase.functions.invoke("referral-notification", {
                  body: {
                    referrerId: existingReferral.referrer_id,
                    referredEmail: email,
                    eventType: "subscribed",
                  },
                });
              } else {
                // No matching email invite — this is a link-based signup
                // Get referrer info
                const { data: referrerData } = await supabase
                  .rpc("get_referral_by_code", { p_code: referralCode });

                if (referrerData && referrerData.length > 0) {
                  const referrerId = referrerData[0].referrer_id;

                  // Create a new completed referral record
                  await supabase
                    .from("referrals")
                    .insert({
                      referrer_id: referrerId,
                      referral_code: referralCode,
                      referred_user_id: session.user.id,
                      referred_email: email,
                      status: "subscribed",
                      completed_at: new Date().toISOString(),
                    });

                  // Send notification
                  await supabase.functions.invoke("referral-notification", {
                    body: {
                      referrerId: referrerId,
                      referredEmail: email,
                      eventType: "subscribed",
                    },
                  });
                }
              }

              // Mark corresponding link click as converted
              await supabase
                .from("referral_link_clicks")
                .update({ converted: true, converted_user_id: session.user.id })
                .eq("referral_code", referralCode)
                .eq("converted", false);
            }
          }
          
          // Auto-create 90-day trial for business accounts
          if (accountType === "business") {
            try {
              const { data: { session } } = await supabase.auth.getSession();
              if (session?.user) {
                const startDate = new Date();
                const endDate = new Date();
                endDate.setDate(endDate.getDate() + 90);

                await supabase
                  .from("subscriptions")
                  .insert({
                    user_id: session.user.id,
                    plan: "pit_business" as const,
                    status: "active" as const,
                    amount: 0,
                    start_date: startDate.toISOString().split("T")[0],
                    end_date: endDate.toISOString().split("T")[0],
                    payment_reference: "TRIAL",
                  });
              }
            } catch (trialError) {
              console.error("Failed to create trial subscription:", trialError);
            }
          }

          toast({
            title: "Account Created!",
            description: accountType === "business" 
              ? "Welcome to TAXKORA! Your 90-day free trial has started." 
              : "Welcome to TAXKORA! Redirecting to your dashboard...",
          });
          navigate("/dashboard");
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setBusinessName("");
    setAccountType(null);
    setErrors({});
    setReferrerName(null);
  };

  return (
    <div className="min-h-screen bg-hero flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-coral-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2">
            <img src={logoImage} alt="TAXKORA" className="w-10 h-10 rounded-lg object-contain" />
            <span className="font-display font-bold text-2xl text-primary-foreground">TAXKORA</span>
          </a>
        </div>

        {/* Referral Banner */}
        {referralCode && referrerName && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 flex items-center gap-3">
            <Gift className="w-6 h-6 text-green-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">
                You've been referred by {referrerName}!
              </p>
              <p className="text-xs text-green-600">
                Sign up to get started with your free trial
              </p>
            </div>
          </div>
        )}

        <div className="bg-card rounded-2xl shadow-xl p-8">
          <h1 className="font-display text-2xl font-bold text-foreground text-center mb-2">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-muted-foreground text-center mb-6">
            {isLogin 
              ? "Sign in to access your dashboard" 
              : accountType 
                ? `Setting up your ${accountType} account` 
                : "Choose your account type to get started"}
          </p>

          {/* Account Type Selection (Sign Up only) */}
          {!isLogin && !accountType && (
            <div className="space-y-4">
              <button
                onClick={() => setAccountType("business")}
                className="w-full p-6 border-2 border-border rounded-xl hover:border-primary hover:bg-teal-50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all">
                    <Building2 className="w-7 h-7 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-display font-semibold text-lg text-foreground">Business Account</h3>
                    <p className="text-muted-foreground text-sm">For SMEs, self-employed & family businesses</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setAccountType("personal")}
                className="w-full p-6 border-2 border-border rounded-xl hover:border-accent hover:bg-coral-400/5 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center group-hover:bg-accent group-hover:scale-110 transition-all">
                    <User className="w-7 h-7 text-accent group-hover:text-accent-foreground" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-display font-semibold text-lg text-foreground">Personal Account</h3>
                    <p className="text-muted-foreground text-sm">For individual taxpayers</p>
                  </div>
                </div>
              </button>

              <div className="pt-4 text-center">
                <p className="text-muted-foreground text-sm">
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      setIsLogin(true);
                      resetForm();
                    }}
                    className="text-primary font-semibold hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Auth Form */}
          {(isLogin || accountType) && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <button
                  type="button"
                  onClick={() => setAccountType(null)}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm">Change account type</span>
                </button>
              )}

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              )}

              {!isLogin && accountType === "business" && (
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    type="text"
                    placeholder="Enter your business name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  required
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  required
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </>
                ) : (
                  <>{isLogin ? "Sign In" : "Create Account"}</>
                )}
              </Button>

              <div className="text-center pt-4">
                <p className="text-muted-foreground text-sm">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      resetForm();
                    }}
                    className="text-primary font-semibold hover:underline"
                  >
                    {isLogin ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
