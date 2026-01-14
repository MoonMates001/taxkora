import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentParams {
  amount: number;
  email: string;
  name: string;
  phone?: string;
  payment_type: "invoice" | "subscription";
  reference_id?: string;
  description?: string;
  plan?: string;
}

interface PaymentResult {
  status: string;
  payment_link: string;
  tx_ref: string;
}

interface VerifyResult {
  status: string;
  message: string;
  transaction?: {
    id: number;
    tx_ref: string;
    amount: number;
    currency: string;
    payment_type: string;
    status: string;
    customer: {
      email: string;
      name: string;
    };
    created_at: string;
  };
}

export const useFlutterwavePayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiatePayment = async (params: PaymentParams): Promise<PaymentResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke("flutterwave-payment", {
        body: params,
      });

      if (functionError) {
        const ctx = (functionError as any).context;
        const body = ctx?.body;

        if (typeof body === "string") {
          try {
            const parsed = JSON.parse(body);
            if (parsed?.error) throw new Error(parsed.error);
          } catch {
            // ignore JSON parse errors
          }
        }

        throw new Error(functionError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      return data as PaymentResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Payment initialization failed";
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPayment = async (transactionId: string, txRef?: string): Promise<VerifyResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke("flutterwave-verify", {
        body: { transaction_id: transactionId, tx_ref: txRef },
      });

      if (functionError) {
        const ctx = (functionError as any).context;
        const body = ctx?.body;

        if (typeof body === "string") {
          try {
            const parsed = JSON.parse(body);
            if (parsed?.error) throw new Error(parsed.error);
          } catch {
            // ignore JSON parse errors
          }
        }

        throw new Error(functionError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      return data as VerifyResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Payment verification failed";
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const openPaymentPage = async (params: PaymentParams) => {
    const result = await initiatePayment(params);
    if (result?.payment_link) {
      window.location.href = result.payment_link;
    }
  };

  return {
    initiatePayment,
    verifyPayment,
    openPaymentPage,
    isLoading,
    error,
  };
};
