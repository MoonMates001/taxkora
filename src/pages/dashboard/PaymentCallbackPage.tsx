import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useFlutterwavePayment } from "@/hooks/useFlutterwavePayment";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

const PaymentCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyPayment, isLoading } = useFlutterwavePayment();
  const [verificationResult, setVerificationResult] = useState<{
    status: "pending" | "success" | "failed";
    message?: string;
    transaction?: any;
  }>({ status: "pending" });

  useEffect(() => {
    const transactionId = searchParams.get("transaction_id");
    const txRef = searchParams.get("tx_ref");
    const status = searchParams.get("status");

    if (status === "cancelled") {
      setVerificationResult({
        status: "failed",
        message: "Payment was cancelled",
      });
      return;
    }

    if (transactionId) {
      verifyTransaction(transactionId, txRef || undefined);
    } else {
      setVerificationResult({
        status: "failed",
        message: "No transaction ID found",
      });
    }
  }, [searchParams]);

  const verifyTransaction = async (transactionId: string, txRef?: string) => {
    const result = await verifyPayment(transactionId, txRef);
    
    if (result?.status === "success") {
      setVerificationResult({
        status: "success",
        message: result.message,
        transaction: result.transaction,
      });
    } else {
      setVerificationResult({
        status: "failed",
        message: result?.message || "Verification failed",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="text-center">
          {isLoading || verificationResult.status === "pending" ? (
            <>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <CardTitle>Verifying Payment</CardTitle>
              <CardDescription>Please wait while we confirm your payment...</CardDescription>
            </>
          ) : verificationResult.status === "success" ? (
            <>
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-green-600">Payment Successful!</CardTitle>
              <CardDescription>Your payment has been processed successfully.</CardDescription>
            </>
          ) : (
            <>
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-red-600">Payment Failed</CardTitle>
              <CardDescription>{verificationResult.message}</CardDescription>
            </>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          {verificationResult.status === "success" && verificationResult.transaction && (
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold">
                  {formatCurrency(verificationResult.transaction.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference</span>
                <span className="font-mono text-sm">{verificationResult.transaction.tx_ref}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="capitalize">{verificationResult.transaction.payment_type}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/dashboard")}
            >
              Go to Dashboard
            </Button>
            {verificationResult.status === "success" && (
              <Button
                className="flex-1"
                onClick={() => navigate("/dashboard/tax-payments")}
              >
                View Payments
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCallbackPage;
