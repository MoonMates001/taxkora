import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { useAuditLog } from "./useAuditLog";

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  tax_id: string | null;
  created_at: string;
  updated_at: string;
}

export type ClientInsert = Omit<Client, "id" | "created_at" | "updated_at">;

export const useClients = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { logEvent } = useAuditLog();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("name");
      if (error) throw error;
      
      // Log access to client data for audit trail
      if (data && data.length > 0) {
        logEvent.mutate({
          action: 'view',
          tableName: 'clients',
          newData: { count: data.length, action: 'list_clients' },
        });
      }
      
      return data as Client[];
    },
    enabled: !!user,
  });

  const createClient = useMutation({
    mutationFn: async (client: Omit<ClientInsert, "user_id">) => {
      const { data, error } = await supabase
        .from("clients")
        .insert({ ...client, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      // Audit log: client created (mask sensitive data in log)
      logEvent.mutate({
        action: 'create',
        tableName: 'clients',
        recordId: data.id,
        newData: { 
          name: data.name, 
          has_email: !!data.email,
          has_phone: !!data.phone,
          has_tax_id: !!data.tax_id,
        },
      });
      toast.success("Client created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create client: " + error.message);
    },
  });

  const updateClient = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Client> & { id: string }) => {
      // Get old data for audit trail
      const { data: oldData } = await supabase
        .from("clients")
        .select("*")
        .eq("id", id)
        .single();
      
      const { data, error } = await supabase
        .from("clients")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return { newData: data, oldData };
    },
    onSuccess: ({ newData, oldData }) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      // Audit log: client updated (mask sensitive fields)
      logEvent.mutate({
        action: 'update',
        tableName: 'clients',
        recordId: newData.id,
        oldData: oldData ? { 
          name: oldData.name,
          has_email: !!oldData.email,
          has_phone: !!oldData.phone,
          has_tax_id: !!oldData.tax_id,
        } : null,
        newData: { 
          name: newData.name,
          has_email: !!newData.email,
          has_phone: !!newData.phone,
          has_tax_id: !!newData.tax_id,
        },
      });
      toast.success("Client updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update client: " + error.message);
    },
  });

  const deleteClient = useMutation({
    mutationFn: async (id: string) => {
      // Get client data for audit trail before deletion
      const { data: clientData } = await supabase
        .from("clients")
        .select("name")
        .eq("id", id)
        .single();
      
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
      return { id, name: clientData?.name };
    },
    onSuccess: ({ id, name }) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      // Audit log: client deleted
      logEvent.mutate({
        action: 'delete',
        tableName: 'clients',
        recordId: id,
        oldData: { name: name || 'Unknown' },
      });
      toast.success("Client deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete client: " + error.message);
    },
  });

  return {
    clients,
    isLoading,
    createClient,
    updateClient,
    deleteClient,
  };
};
