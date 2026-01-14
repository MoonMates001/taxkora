import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Loader2, Building2, User, Building, Clock, Gift } from "lucide-react";
import { useSubscription, SUBSCRIPTION_PLANS, SubscriptionPlan } from "@/hooks/useSubscription";
import { useFlutterwavePayment } from "@/hooks/useFlutterwavePayment";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { format } from "date-fns";
import { toast } from "sonner";

const planIcons: Record<SubscriptionPlan, React.ReactNode> = {
  pit_individual: <User className="h-8 w-8" />,
  pit_business: <Building2 className="h-8 w-8" />,
  cit: <Building className="h-8 w-8" />,
};

export default function SubscriptionPage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { 
    subscription, 
    allSubscriptions, 
    isLoading, 
    isSubscriptionActive, 
    activePlan, 
    createPendingSubscription,
    startTrialSubscription,
    hasHadSubscription,
    isTrialSubscription,
    daysRemaining,
  } = useSubscription();
  const { initiatePayment, isLoading: isPaymentLoading } = useFlutterwavePayment();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isStartingTrial, setIsStartingTrial] = useState(false);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!user?.email) {
      toast.error("Please log in to subscribe");
      return;
    }

    setSelectedPlan(plan);
    const planDetails = SUBSCRIPTION_PLANS[plan];

    try {
      const result = await initiatePayment({
        amount: planDetails.amount,
        email: user.email,
        name: profile?.full_name || user.email,
        phone: profile?.phone || undefined,
        payment_type: "subscription",
        description: `${planDetails.name} Annual Subscription`,
      });

      if (result?.tx_ref) {
        await createPendingSubscription.mutateAsync({
          plan,
          txRef: result.tx_ref,
        });

        if (result.payment_link) {
          window.location.href = result.payment_link;
        }
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Failed to initiate subscription payment");
    } finally {
      setSelectedPlan(null);
    }
  };

  const handleStartTrial = async (plan: SubscriptionPlan) => {
    if (!user?.email) {
      toast.error("Please log in to start a trial");
      return;
    }

    setIsStartingTrial(true);
    setSelectedPlan(plan);

    try {
      await startTrialSubscription.mutateAsync({
        plan,
        email: user.email,
        name: profile?.full_name || user.email,
      });
    } catch (error) {
      console.error("Trial error:", error);
    } finally {
      setIsStartingTrial(false);
      setSelectedPlan(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const canStartTrial = !hasHadSubscription;

  return (
    <div className="space-y-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
          <p className="text-muted-foreground mt-2">
            Choose the plan that best fits your tax filing needs
          </p>
        </div>

        {/* Trial Banner for New Users */}
        {canStartTrial && !isSubscriptionActive && (
          <Card className="border-green-500 bg-green-50 dark:bg-green-950/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg text-green-700 dark:text-green-400">
                  🎉 Start Your 3-Month Free Trial!
                </CardTitle>
              </div>
              <CardDescription className="text-green-600 dark:text-green-400">
                New to TaxKora? Try any plan free for 3 months. No payment required.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Current Subscription Status */}
        {isSubscriptionActive && subscription && (
          <Card className={`${isTrialSubscription ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-primary bg-primary/5'}`}>
            <CardHeader>
              <div className="flex items-center gap-2">
                {isTrialSubscription ? (
                  <Gift className="h-5 w-5 text-green-600" />
                ) : (
                  <Crown className="h-5 w-5 text-primary" />
                )}
                <CardTitle className="text-lg">
                  {isTrialSubscription ? 'Free Trial Active' : 'Active Subscription'}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="font-semibold">{SUBSCRIPTION_PLANS[subscription.plan].name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valid Until</p>
                  <p className="font-semibold">
                    {subscription.end_date
                      ? format(new Date(subscription.end_date), "MMM dd, yyyy")
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Days Remaining</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className={`font-semibold ${daysRemaining && daysRemaining <= 7 ? 'text-red-600' : ''}`}>
                      {daysRemaining !== null ? `${daysRemaining} days` : "—"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge 
                    variant="default" 
                    className={isTrialSubscription ? 'bg-green-600' : 'bg-green-600'}
                  >
                    {isTrialSubscription ? 'Trial' : 'Active'}
                  </Badge>
                </div>
              </div>

              {/* Upgrade CTA for trial users */}
              {isTrialSubscription && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">
                    Enjoying TaxKora? Subscribe now to continue after your trial ends.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Subscription Plans */}
        <div className="grid gap-6 md:grid-cols-3">
          {(Object.entries(SUBSCRIPTION_PLANS) as [SubscriptionPlan, typeof SUBSCRIPTION_PLANS[SubscriptionPlan]][]).map(
            ([planKey, plan]) => {
              const isCurrentPlan = activePlan === planKey;
              const isProcessing = selectedPlan === planKey && (isPaymentLoading || createPendingSubscription.isPending || isStartingTrial);

              return (
                <Card
                  key={planKey}
                  className={`relative flex flex-col ${
                    isCurrentPlan ? "border-primary ring-2 ring-primary" : ""
                  } ${planKey === "pit_business" ? "md:scale-105 shadow-lg" : ""}`}
                >
                  {planKey === "pit_business" && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Popular</Badge>
                    </div>
                  )}
                  {isCurrentPlan && (
                    <div className="absolute -top-3 right-4">
                      <Badge variant="secondary">
                        {isTrialSubscription ? 'Current Trial' : 'Current Plan'}
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {planIcons[planKey]}
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="text-center mb-6">
                      <span className="text-4xl font-bold">{formatCurrency(plan.amount)}</span>
                      <span className="text-muted-foreground">/year</span>
                      {canStartTrial && !isSubscriptionActive && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            3 months free trial
                          </Badge>
                        </div>
                      )}
                    </div>
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2">
                    {canStartTrial && !isSubscriptionActive ? (
                      <>
                        <Button
                          className="w-full"
                          variant="default"
                          disabled={isProcessing || isLoading}
                          onClick={() => handleStartTrial(planKey)}
                        >
                          {isProcessing && isStartingTrial ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Starting Trial...
                            </>
                          ) : (
                            <>
                              <Gift className="mr-2 h-4 w-4" />
                              Start Free Trial
                            </>
                          )}
                        </Button>
                        <Button
                          className="w-full"
                          variant="outline"
                          disabled={isProcessing || isLoading}
                          onClick={() => handleSubscribe(planKey)}
                        >
                          {isProcessing && !isStartingTrial ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            "Subscribe Now"
                          )}
                        </Button>
                      </>
                    ) : (
                      <Button
                        className="w-full"
                        variant={isCurrentPlan && !isTrialSubscription ? "secondary" : "default"}
                        disabled={(isCurrentPlan && !isTrialSubscription) || isProcessing || isLoading}
                        onClick={() => handleSubscribe(planKey)}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : isCurrentPlan && !isTrialSubscription ? (
                          "Current Plan"
                        ) : isCurrentPlan && isTrialSubscription ? (
                          "Upgrade Now"
                        ) : (
                          "Subscribe Now"
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            }
          )}
        </div>

        {/* Subscription History */}
        {allSubscriptions && allSubscriptions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Subscription History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allSubscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        {planIcons[sub.plan]}
                      </div>
                      <div>
                        <p className="font-medium">
                          {SUBSCRIPTION_PLANS[sub.plan].name}
                          {sub.payment_reference === "TRIAL" && (
                            <Badge variant="outline" className="ml-2 text-xs">Trial</Badge>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(sub.created_at), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {sub.amount === 0 ? "Free" : formatCurrency(sub.amount)}
                      </p>
                      <Badge
                        variant={
                          sub.status === "active"
                            ? "default"
                            : sub.status === "pending"
                            ? "secondary"
                            : "outline"
                        }
                        className={sub.status === "active" ? "bg-green-600" : ""}
                      >
                        {sub.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
