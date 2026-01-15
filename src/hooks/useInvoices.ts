import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export interface InvoiceItem {
  id?: string;
  invoice_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface Invoice {
  id: string;
  user_id: string;
  client_id: string | null;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  status: InvoiceStatus;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: InvoiceItem[];
  clients?: {
    id: string;
    name: string;
    email: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
  } | null;
}

export interface InvoiceInsert {
  client_id: string | null;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  status?: InvoiceStatus;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  notes?: string;
  items: InvoiceItem[];
}

export const useInvoices = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          clients (id, name, email, address, city, state)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Invoice[];
    },
    enabled: !!user,
  });

  const generateInvoiceNumber = async (): Promise<string> => {
    const { data, error } = await supabase.rpc("generate_invoice_number");
    if (error) throw error;
    return data;
  };

  const createInvoice = useMutation({
    mutationFn: async ({ items, ...invoiceData }: InvoiceInsert) => {
      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({ ...invoiceData, user_id: user!.id })
        .select()
        .single();
      if (invoiceError) throw invoiceError;

      // Create invoice items
      if (items.length > 0) {
        const itemsWithInvoiceId = items.map((item) => ({
          ...item,
          invoice_id: invoice.id,
        }));
        const { error: itemsError } = await supabase
          .from("invoice_items")
          .insert(itemsWithInvoiceId);
        if (itemsError) throw itemsError;
      }

      return invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create invoice: " + error.message);
    },
  });

  const updateInvoice = useMutation({
    mutationFn: async ({
      id,
      items,
      ...updates
    }: Partial<Invoice> & { id: string; items?: InvoiceItem[] }) => {
      const { data, error } = await supabase
        .from("invoices")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;

      // Update items if provided
      if (items) {
        // Delete existing items
        await supabase.from("invoice_items").delete().eq("invoice_id", id);
        // Insert new items
        if (items.length > 0) {
          const itemsWithInvoiceId = items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            amount: item.amount,
            invoice_id: id,
          }));
          await supabase.from("invoice_items").insert(itemsWithInvoiceId);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update invoice: " + error.message);
    },
  });

  const deleteInvoice = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("invoices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete invoice: " + error.message);
    },
  });

  const getInvoiceWithItems = async (id: string): Promise<Invoice | null> => {
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select(`
        *,
        clients (id, name, email, address, city, state)
      `)
      .eq("id", id)
      .maybeSingle();
    if (invoiceError) throw invoiceError;
    if (!invoice) return null;

    const { data: items, error: itemsError } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", id);
    if (itemsError) throw itemsError;

    return { ...invoice, items: items || [] } as Invoice;
  };

  return {
    invoices,
    isLoading,
    generateInvoiceNumber,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoiceWithItems,
  };
};
