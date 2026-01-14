import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useFlutterwavePayment } from "@/hooks/useFlutterwavePayment";
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from "@/hooks/useSubscription";

type CallbackStatus = "verifying" | "success" | "failed" | "cancelled";

export default function PaymentCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyPayment } = useFlutterwavePayment();
  const [status, setStatus] = useState<CallbackStatus>("verifying");
  const [message, setMessage] = useState("");
  const [planName, setPlanName] = useState<string | null>(null);

  useEffect(() => {
    const verifyTransaction = async () => {
      const txStatus = searchParams.get("status");
      const transactionId = searchParams.get("transaction_id");
      const txRef = searchParams.get("tx_ref");

      // Check if payment was cancelled
      if (txStatus === "cancelled") {
        setStatus("cancelled");
        setMessage("Payment was cancelled. You can try again when ready.");
        return;
      }

      // Check if we have required params
      if (!transactionId) {
        setStatus("failed");
        setMessage("Missing transaction information. Please try again.");
        return;
      }

      try {
        const result = await verifyPayment(transactionId, txRef || undefined);

        if (result?.status === "success") {
          setStatus("success");
          
          // Try to get plan name from tx_ref pattern
          if (txRef) {
            if (txRef.includes("PIT_INDIVIDUAL") || txRef.toLowerCase().includes("individual")) {
              setPlanName(SUBSCRIPTION_PLANS.pit_individual.name);
            } else if (txRef.includes("PIT_BUSINESS") || txRef.toLowerCase().includes("business")) {
              setPlanName(SUBSCRIPTION_PLANS.pit_business.name);
            } else if (txRef.includes("CIT") || txRef.toLowerCase().includes("cit")) {
              setPlanName(SUBSCRIPTION_PLANS.cit.name);
            }
          }
          
          setMessage("Your subscription has been activated successfully!");
        } else {
          setStatus("failed");
          setMessage(result?.message || "Payment verification failed. Please contact support.");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("failed");
        setMessage("An error occurred while verifying your payment. Please contact support.");
      }
    };

    verifyTransaction();
  }, [searchParams, verifyPayment]);

  const getStatusIcon = () => {
    switch (status) {
      case "verifying":
        return <Loader2 className="h-16 w-16 text-primary animate-spin" />;
      case "success":
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case "failed":
        return <XCircle className="h-16 w-16 text-red-500" />;
      case "cancelled":
        return <AlertCircle className="h-16 w-16 text-amber-500" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case "verifying":
        return "Verifying Payment...";
      case "success":
        return "Payment Successful!";
      case "failed":
        return "Payment Failed";
      case "cancelled":
        return "Payment Cancelled";
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">{getStatusIcon()}</div>
          <CardTitle className="text-2xl">{getStatusTitle()}</CardTitle>
          <CardDescription className="text-base">{message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "success" && planName && (
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-400">
                <strong>{planName}</strong> plan is now active for 1 year.
              </p>
            </div>
          )}

          {status === "verifying" && (
            <p className="text-sm text-muted-foreground">
              Please wait while we confirm your payment with our payment provider...
            </p>
          )}

          {status !== "verifying" && (
            <div className="flex flex-col gap-2">
              {status === "success" && (
                <Button onClick={() => navigate("/dashboard")} className="w-full">
                  Go to Dashboard
                </Button>
              )}
              {(status === "failed" || status === "cancelled") && (
                <>
                  <Button onClick={() => navigate("/dashboard/subscription")} className="w-full">
                    Try Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                    className="w-full"
                  >
                    Go to Dashboard
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
