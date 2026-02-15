import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CreateSupportTicketData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  category?: string;
}

export const useCreateSupportTicket = () => {
  return useMutation({
    mutationFn: async (data: CreateSupportTicketData) => {
      const { error } = await supabase
        .from("support_tickets")
        .insert(data);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Your message has been sent! We'll get back to you soon.");
    },
    onError: (error) => {
      toast.error("Failed to send message: " + error.message);
    },
  });
};
