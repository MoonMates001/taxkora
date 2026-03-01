import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useSubscription, SUBSCRIPTION_PLANS, SubscriptionPlan } from "@/hooks/useSubscription";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Crown, Gift, Loader2, Sparkles } from "lucide-react";

interface SubscriptionGateProps {
  children: ReactNode;
  requiredPlan?: SubscriptionPlan | SubscriptionPlan[];
  feature?: string;
  fallback?: ReactNode;
}

export const SubscriptionGate = ({
  children,
  requiredPlan,
  feature = "this feature",
  fallback,
}: SubscriptionGateProps) => {
  const { isSubscriptionActive, activePlan, isLoading, isTrialSubscription, daysRemaining } = useSubscription();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if user has an active subscription
  if (!isSubscriptionActive) {
    return fallback || <SubscriptionRequired feature={feature} />;
  }

  // If specific plans are required, check if user has one of them
  if (requiredPlan) {
    const requiredPlans = Array.isArray(requiredPlan) ? requiredPlan : [requiredPlan];
    if (activePlan && !requiredPlans.includes(activePlan)) {
      return fallback || <UpgradeRequired feature={feature} currentPlan={activePlan} requiredPlans={requiredPlans} />;
    }
  }

  // Show trial warning banner if on trial and less than 7 days remaining
  if (isTrialSubscription && daysRemaining !== null && daysRemaining <= 7) {
    return (
      <>
        <TrialExpiringBanner daysRemaining={daysRemaining} />
        {children}
      </>
    );
  }

  return <>{children}</>;
};

const SubscriptionRequired = ({ feature }: { feature: string }) => {
  return (
    <div className="flex items-center justify-center min-h-[500px] p-6">
      <Card className="max-w-lg w-full text-center shadow-lg border-2">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl">Subscription Required</CardTitle>
          <CardDescription className="text-base">
            Access to {feature} requires an active subscription or free trial
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400 mb-2">
              <Gift className="w-5 h-5" />
              <span className="font-semibold">New User?</span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-400">
              Start your <strong>3-month free trial</strong> today — no payment required!
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Choose a plan to unlock:</p>
            <ul className="text-sm text-left space-y-2 max-w-xs mx-auto">
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Business tax computation
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                VAT & WHT management
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Invoice management
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Automated tax reports
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Link to="/dashboard/subscription">
              <Button className="w-full" size="lg">
                <Crown className="w-4 h-4 mr-2" />
                View Plans & Start Free Trial
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const UpgradeRequired = ({
  feature,
  currentPlan,
  requiredPlans,
}: {
  feature: string;
  currentPlan: SubscriptionPlan;
  requiredPlans: SubscriptionPlan[];
}) => {
  const currentPlanDetails = SUBSCRIPTION_PLANS[currentPlan];
  const requiredPlanNames = requiredPlans.map((p) => SUBSCRIPTION_PLANS[p].name).join(" or ");

  return (
    <div className="flex items-center justify-center min-h-[500px] p-6">
      <Card className="max-w-lg w-full text-center shadow-lg border-2">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl">Upgrade Required</CardTitle>
          <CardDescription className="text-base">
            {feature} requires a higher tier subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <Badge variant="secondary" className="mb-2">Current</Badge>
              <p className="font-medium">{currentPlanDetails.name}</p>
            </div>
            <div className="text-muted-foreground">→</div>
            <div className="text-center">
              <Badge className="mb-2 bg-primary">Required</Badge>
              <p className="font-medium">{requiredPlanNames}</p>
            </div>
          </div>

          <Link to="/dashboard/subscription">
            <Button className="w-full" size="lg">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade Plan
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

const TrialExpiringBanner = ({ daysRemaining }: { daysRemaining: number }) => {
  const urgencyClass = daysRemaining <= 1 
    ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800" 
    : "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800";
  
  const textClass = daysRemaining <= 1 
    ? "text-red-700 dark:text-red-400" 
    : "text-amber-700 dark:text-amber-400";

  return (
    <div className={`mb-6 p-4 rounded-lg border ${urgencyClass}`}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Gift className={`w-5 h-5 ${textClass}`} />
          <div>
            <p className={`font-medium ${textClass}`}>
              {daysRemaining <= 1 
                ? "⚠️ Your trial expires tomorrow!" 
                : `Your trial expires in ${daysRemaining} days`}
            </p>
            <p className={`text-sm ${textClass} opacity-80`}>
              Subscribe now to keep access to all premium features
            </p>
          </div>
        </div>
        <Link to="/dashboard/subscription">
          <Button size="sm" variant={daysRemaining <= 1 ? "destructive" : "default"}>
            Subscribe Now
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default SubscriptionGate;
