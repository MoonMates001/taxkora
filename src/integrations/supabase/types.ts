export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      capital_assets: {
        Row: {
          acquisition_date: string
          category: Database["public"]["Enums"]["capital_asset_category"]
          cost: number
          created_at: string
          description: string
          id: string
          updated_at: string
          user_id: string
          year_acquired: number
        }
        Insert: {
          acquisition_date?: string
          category: Database["public"]["Enums"]["capital_asset_category"]
          cost: number
          created_at?: string
          description: string
          id?: string
          updated_at?: string
          user_id: string
          year_acquired: number
        }
        Update: {
          acquisition_date?: string
          category?: Database["public"]["Enums"]["capital_asset_category"]
          cost?: number
          created_at?: string
          description?: string
          id?: string
          updated_at?: string
          user_id?: string
          year_acquired?: number
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          state: string | null
          tax_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          state?: string | null
          tax_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          state?: string | null
          tax_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      deduction_documents: {
        Row: {
          created_at: string
          description: string | null
          document_type: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          document_type: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          user_id: string
          year: number
        }
        Update: {
          created_at?: string
          description?: string | null
          document_type?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      encrypted_user_data: {
        Row: {
          created_at: string
          data_type: string
          encrypted_value: string
          id: string
          iv: string
          masked_value: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_type: string
          encrypted_value: string
          id?: string
          iv: string
          masked_value?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_type?: string
          encrypted_value?: string
          id?: string
          iv?: string
          masked_value?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["expense_category"]
          created_at: string
          date: string
          description: string
          id: string
          notes: string | null
          receipt_url: string | null
          updated_at: string
          user_id: string
          vendor: string | null
        }
        Insert: {
          amount: number
          category: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          date?: string
          description: string
          id?: string
          notes?: string | null
          receipt_url?: string | null
          updated_at?: string
          user_id: string
          vendor?: string | null
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          date?: string
          description?: string
          id?: string
          notes?: string | null
          receipt_url?: string | null
          updated_at?: string
          user_id?: string
          vendor?: string | null
        }
        Relationships: []
      }
      income_records: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["income_category"]
          client_id: string | null
          created_at: string
          date: string
          description: string
          id: string
          invoice_id: string | null
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: Database["public"]["Enums"]["income_category"]
          client_id?: string | null
          created_at?: string
          date?: string
          description: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["income_category"]
          client_id?: string | null
          created_at?: string
          date?: string
          description?: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "income_records_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "income_records_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "income_records_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          invoice_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          quantity?: number
          unit_price: number
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_id: string | null
          created_at: string
          due_date: string
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          tax_amount: number
          tax_rate: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          due_date: string
          id?: string
          invoice_number: string
          issue_date?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          due_date?: string
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients_masked"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_emails: {
        Row: {
          created_at: string
          email_type: string
          id: string
          sent_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_type: string
          id?: string
          sent_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_type?: string
          id?: string
          sent_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          business_address: string | null
          business_city: string | null
          business_name: string | null
          business_state: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          invoice_logo_url: string | null
          invoice_primary_color: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"]
          business_address?: string | null
          business_city?: string | null
          business_name?: string | null
          business_state?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          invoice_logo_url?: string | null
          invoice_primary_color?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          business_address?: string | null
          business_city?: string | null
          business_name?: string | null
          business_state?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          invoice_logo_url?: string | null
          invoice_primary_color?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          referral_code: string
          referred_email: string | null
          referred_user_id: string | null
          referrer_id: string
          reward_claimed: boolean
          status: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code: string
          referred_email?: string | null
          referred_user_id?: string | null
          referrer_id: string
          reward_claimed?: boolean
          status?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code?: string
          referred_email?: string | null
          referred_user_id?: string | null
          referrer_id?: string
          reward_claimed?: boolean
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      statutory_deductions: {
        Row: {
          annual_rent_paid: number
          created_at: string
          employment_compensation: number
          gifts_received: number
          housing_loan_interest: number
          id: string
          life_insurance_premium: number
          nhf_contribution: number
          nhis_contribution: number
          pension_benefits_received: number
          pension_contribution: number
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          annual_rent_paid?: number
          created_at?: string
          employment_compensation?: number
          gifts_received?: number
          housing_loan_interest?: number
          id?: string
          life_insurance_premium?: number
          nhf_contribution?: number
          nhis_contribution?: number
          pension_benefits_received?: number
          pension_contribution?: number
          updated_at?: string
          user_id: string
          year?: number
        }
        Update: {
          annual_rent_paid?: number
          created_at?: string
          employment_compensation?: number
          gifts_received?: number
          housing_loan_interest?: number
          id?: string
          life_insurance_premium?: number
          nhf_contribution?: number
          nhis_contribution?: number
          pension_benefits_received?: number
          pension_contribution?: number
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          created_at: string
          end_date: string | null
          flutterwave_tx_ref: string | null
          id: string
          payment_reference: string | null
          plan: Database["public"]["Enums"]["subscription_plan"]
          start_date: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          end_date?: string | null
          flutterwave_tx_ref?: string | null
          id?: string
          payment_reference?: string | null
          plan: Database["public"]["Enums"]["subscription_plan"]
          start_date?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          end_date?: string | null
          flutterwave_tx_ref?: string | null
          id?: string
          payment_reference?: string | null
          plan?: Database["public"]["Enums"]["subscription_plan"]
          start_date?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tax_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          payment_date: string
          payment_method: string | null
          payment_reference: string | null
          payment_type: string
          receipt_url: string | null
          status: string
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          payment_reference?: string | null
          payment_type: string
          receipt_url?: string | null
          status?: string
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          payment_reference?: string | null
          payment_type?: string
          receipt_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      vat_filing_status: {
        Row: {
          created_at: string
          filed_date: string | null
          id: string
          month: number
          notes: string | null
          payment_amount: number | null
          payment_date: string | null
          payment_reference: string | null
          status: string
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          filed_date?: string | null
          id?: string
          month: number
          notes?: string | null
          payment_amount?: number | null
          payment_date?: string | null
          payment_reference?: string | null
          status?: string
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          created_at?: string
          filed_date?: string | null
          id?: string
          month?: number
          notes?: string | null
          payment_amount?: number | null
          payment_date?: string | null
          payment_reference?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      vat_transactions: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          description: string
          id: string
          is_exempt: boolean
          month: number
          transaction_date: string
          transaction_type: Database["public"]["Enums"]["vat_transaction_type"]
          updated_at: string
          user_id: string
          vat_amount: number
          year: number
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          description: string
          id?: string
          is_exempt?: boolean
          month: number
          transaction_date?: string
          transaction_type: Database["public"]["Enums"]["vat_transaction_type"]
          updated_at?: string
          user_id: string
          vat_amount: number
          year: number
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          description?: string
          id?: string
          is_exempt?: boolean
          month?: number
          transaction_date?: string
          transaction_type?: Database["public"]["Enums"]["vat_transaction_type"]
          updated_at?: string
          user_id?: string
          vat_amount?: number
          year?: number
        }
        Relationships: []
      }
      wht_transactions: {
        Row: {
          created_at: string
          description: string | null
          gross_amount: number
          id: string
          net_amount: number
          payment_date: string
          payment_type: Database["public"]["Enums"]["wht_payment_type"]
          recipient_name: string
          recipient_tin: string | null
          recipient_type: Database["public"]["Enums"]["wht_recipient_type"]
          updated_at: string
          user_id: string
          wht_amount: number
          wht_rate: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          gross_amount: number
          id?: string
          net_amount: number
          payment_date?: string
          payment_type: Database["public"]["Enums"]["wht_payment_type"]
          recipient_name: string
          recipient_tin?: string | null
          recipient_type: Database["public"]["Enums"]["wht_recipient_type"]
          updated_at?: string
          user_id: string
          wht_amount: number
          wht_rate: number
        }
        Update: {
          created_at?: string
          description?: string | null
          gross_amount?: number
          id?: string
          net_amount?: number
          payment_date?: string
          payment_type?: Database["public"]["Enums"]["wht_payment_type"]
          recipient_name?: string
          recipient_tin?: string | null
          recipient_type?: Database["public"]["Enums"]["wht_recipient_type"]
          updated_at?: string
          user_id?: string
          wht_amount?: number
          wht_rate?: number
        }
        Relationships: []
      }
    }
    Views: {
      clients_masked: {
        Row: {
          city: string | null
          created_at: string | null
          email_masked: string | null
          id: string | null
          name: string | null
          phone_masked: string | null
          state: string | null
          tax_id_masked: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          email_masked?: never
          id?: string | null
          name?: string | null
          phone_masked?: never
          state?: string | null
          tax_id_masked?: never
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          email_masked?: never
          id?: string | null
          name?: string | null
          phone_masked?: never
          state?: string | null
          tax_id_masked?: never
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles_masked: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"] | null
          business_city: string | null
          business_name: string | null
          business_state: string | null
          created_at: string | null
          email_masked: string | null
          full_name: string | null
          id: string | null
          invoice_primary_color: string | null
          phone_masked: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"] | null
          business_city?: string | null
          business_name?: string | null
          business_state?: string | null
          created_at?: string | null
          email_masked?: never
          full_name?: string | null
          id?: string | null
          invoice_primary_color?: string | null
          phone_masked?: never
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"] | null
          business_city?: string | null
          business_name?: string | null
          business_state?: string | null
          created_at?: string | null
          email_masked?: never
          full_name?: string | null
          id?: string | null
          invoice_primary_color?: string | null
          phone_masked?: never
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_invoice_number: { Args: { p_user_id: string }; Returns: string }
      generate_referral_code: { Args: never; Returns: string }
      get_referral_by_code: {
        Args: { p_code: string }
        Returns: {
          referral_code: string
          referrer_id: string
        }[]
      }
      log_audit_event: {
        Args: {
          p_action: string
          p_ip_address?: string
          p_new_data?: Json
          p_old_data?: Json
          p_record_id?: string
          p_table_name: string
          p_user_agent?: string
          p_user_id: string
        }
        Returns: string
      }
      mask_email: { Args: { email: string }; Returns: string }
      mask_payment_ref: { Args: { ref: string }; Returns: string }
      mask_phone: { Args: { phone: string }; Returns: string }
      mask_tin: { Args: { tin: string }; Returns: string }
    }
    Enums: {
      account_type: "business" | "personal"
      capital_asset_category:
        | "plant_machinery"
        | "motor_vehicles"
        | "furniture_fittings"
        | "buildings"
        | "computers_equipment"
        | "agricultural_equipment"
        | "other"
      expense_category:
        | "office_supplies"
        | "utilities"
        | "rent"
        | "salaries"
        | "marketing"
        | "travel"
        | "professional_services"
        | "insurance"
        | "equipment"
        | "maintenance"
        | "inventory"
        | "taxes"
        | "other"
        | "housing"
        | "food"
        | "healthcare"
        | "education"
        | "entertainment"
        | "personal_care"
        | "clothing"
        | "transportation"
        | "debt_payment"
        | "savings"
      income_category:
        | "sales"
        | "services"
        | "consulting"
        | "commission"
        | "interest"
        | "rental"
        | "investment"
        | "grants"
        | "other"
        | "salary"
        | "wages"
        | "pension"
        | "dividends"
        | "gifts"
        | "freelance"
      invoice_status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
      subscription_plan: "pit_individual" | "pit_business" | "cit"
      subscription_status: "active" | "expired" | "cancelled" | "pending"
      vat_transaction_type: "output" | "input"
      wht_payment_type:
        | "dividends"
        | "interest"
        | "royalties"
        | "rent"
        | "commissions"
        | "professionalFees"
        | "constructionContracts"
        | "managementFees"
        | "technicalFees"
        | "consultingFees"
        | "directorsFees"
        | "other"
      wht_recipient_type: "corporate" | "individual" | "non_resident"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_type: ["business", "personal"],
      capital_asset_category: [
        "plant_machinery",
        "motor_vehicles",
        "furniture_fittings",
        "buildings",
        "computers_equipment",
        "agricultural_equipment",
        "other",
      ],
      expense_category: [
        "office_supplies",
        "utilities",
        "rent",
        "salaries",
        "marketing",
        "travel",
        "professional_services",
        "insurance",
        "equipment",
        "maintenance",
        "inventory",
        "taxes",
        "other",
        "housing",
        "food",
        "healthcare",
        "education",
        "entertainment",
        "personal_care",
        "clothing",
        "transportation",
        "debt_payment",
        "savings",
      ],
      income_category: [
        "sales",
        "services",
        "consulting",
        "commission",
        "interest",
        "rental",
        "investment",
        "grants",
        "other",
        "salary",
        "wages",
        "pension",
        "dividends",
        "gifts",
        "freelance",
      ],
      invoice_status: ["draft", "sent", "paid", "overdue", "cancelled"],
      subscription_plan: ["pit_individual", "pit_business", "cit"],
      subscription_status: ["active", "expired", "cancelled", "pending"],
      vat_transaction_type: ["output", "input"],
      wht_payment_type: [
        "dividends",
        "interest",
        "royalties",
        "rent",
        "commissions",
        "professionalFees",
        "constructionContracts",
        "managementFees",
        "technicalFees",
        "consultingFees",
        "directorsFees",
        "other",
      ],
      wht_recipient_type: ["corporate", "individual", "non_resident"],
    },
  },
} as const
