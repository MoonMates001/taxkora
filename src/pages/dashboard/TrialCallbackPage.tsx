import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, CreditCard, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type VerificationStatus = "pending" | "success" | "failed";

interface VerificationResult {
  status: string;
  message: string;
  plan?: string;
  trial_end_date?: string;
  card_saved?: boolean;
  card_last_four?: string;
}

const PLAN_NAMES: Record<string, string> = {
  pit_individual: "Individual PIT",
  pit_business: "Business PIT",
  cit: "Companies Income Tax",
};

export default function TrialCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("pending");
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyTransaction = async () => {
      const transactionId = searchParams.get("transaction_id");
      const txRef = searchParams.get("tx_ref");
      const status = searchParams.get("status");

      if (status === "cancelled") {
        setVerificationStatus("failed");
        setVerificationResult({ status: "failed", message: "Card verification was cancelled" });
        setIsLoading(false);
        return;
      }

      if (!transactionId) {
        setVerificationStatus("failed");
        setVerificationResult({ status: "failed", message: "No transaction ID provided" });
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("flutterwave-trial-verify", {
          body: { transaction_id: transactionId, tx_ref: txRef },
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data.status === "success") {
          setVerificationStatus("success");
          setVerificationResult(data);
        } else {
          setVerificationStatus("failed");
          setVerificationResult(data);
        }
      } catch (err) {
        console.error("Trial verification error:", err);
        setVerificationStatus("failed");
        setVerificationResult({
          status: "failed",
          message: err instanceof Error ? err.message : "Verification failed",
        });
      } finally {
        setIsLoading(false);
      }
    };

    verifyTransaction();
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                Activating Trial...
              </>
            ) : verificationStatus === "success" ? (
              <>
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                Trial Activated!
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6 text-destructive" />
                Activation Failed
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">
                Verifying your card and activating your free trial...
              </p>
            </div>
          ) : verificationStatus === "success" && verificationResult ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-700 dark:text-green-400">
                    Your 3-month free trial is now active!
                  </span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Enjoy full access to all features until{" "}
                  {verificationResult.trial_end_date
                    ? new Date(verificationResult.trial_end_date).toLocaleDateString("en-NG", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "the trial ends"}
                  .
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-medium">
                    {PLAN_NAMES[verificationResult.plan || ""] || verificationResult.plan}
                  </span>
                </div>

                {verificationResult.card_saved && verificationResult.card_last_four && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Card Saved</span>
                    <span className="font-medium flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      •••• {verificationResult.card_last_four}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Auto-Renewal</span>
                  <span className="font-medium text-green-600">Enabled</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Your card will be automatically charged when your trial ends. You can cancel anytime from your subscription settings.
              </p>

              <div className="flex gap-3 pt-4">
                <Button className="flex-1" onClick={() => navigate("/dashboard")}>
                  Go to Dashboard
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-sm text-destructive">
                  {verificationResult?.message || "Unable to activate your trial. Please try again."}
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => navigate("/dashboard")}>
                  Back to Dashboard
                </Button>
                <Button className="flex-1" onClick={() => navigate("/dashboard/subscription")}>
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
