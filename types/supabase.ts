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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      contracts: {
        Row: {
          agreed_scope: string | null
          artisan_accepted_at: string | null
          artisan_id: string
          created_at: string | null
          customer_accepted_at: string | null
          customer_id: string
          escrow_funded_amount: number
          escrow_released_amount: number
          escrow_status: Database["public"]["Enums"]["escrow_status"]
          expected_completion_date: string | null
          id: string
          job_id: string
          platform_fee_percentage: number
          quote_id: string
          start_date: string | null
          status: Database["public"]["Enums"]["contract_status"]
          total_agreed_amount: number
          updated_at: string | null
        }
        Insert: {
          agreed_scope?: string | null
          artisan_accepted_at?: string | null
          artisan_id: string
          created_at?: string | null
          customer_accepted_at?: string | null
          customer_id: string
          escrow_funded_amount?: number
          escrow_released_amount?: number
          escrow_status?: Database["public"]["Enums"]["escrow_status"]
          expected_completion_date?: string | null
          id?: string
          job_id: string
          platform_fee_percentage?: number
          quote_id: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["contract_status"]
          total_agreed_amount: number
          updated_at?: string | null
        }
        Update: {
          agreed_scope?: string | null
          artisan_accepted_at?: string | null
          artisan_id?: string
          created_at?: string | null
          customer_accepted_at?: string | null
          customer_id?: string
          escrow_funded_amount?: number
          escrow_released_amount?: number
          escrow_status?: Database["public"]["Enums"]["escrow_status"]
          expected_completion_date?: string | null
          id?: string
          job_id?: string
          platform_fee_percentage?: number
          quote_id?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["contract_status"]
          total_agreed_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_artisan_id_fkey"
            columns: ["artisan_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "job_quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          artisan_id: string
          created_at: string | null
          customer_id: string
          id: string
          job_id: string
          last_message_at: string | null
        }
        Insert: {
          artisan_id: string
          created_at?: string | null
          customer_id: string
          id?: string
          job_id: string
          last_message_at?: string | null
        }
        Update: {
          artisan_id?: string
          created_at?: string | null
          customer_id?: string
          id?: string
          job_id?: string
          last_message_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_artisan_id_fkey"
            columns: ["artisan_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_packages: {
        Row: {
          created_at: string | null
          credits_amount: number
          discount_percentage: number
          display_order: number
          id: string
          is_active: boolean
          name: string
          price_naira: number
        }
        Insert: {
          created_at?: string | null
          credits_amount: number
          discount_percentage?: number
          display_order: number
          id?: string
          is_active?: boolean
          name: string
          price_naira: number
        }
        Update: {
          created_at?: string | null
          credits_amount?: number
          discount_percentage?: number
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          price_naira?: number
        }
        Relationships: []
      }
      job_credit_tiers: {
        Row: {
          budget_range_key: string
          created_at: string | null
          credit_cost: number
          id: string
          is_active: boolean
        }
        Insert: {
          budget_range_key: string
          created_at?: string | null
          credit_cost: number
          id?: string
          is_active?: boolean
        }
        Update: {
          budget_range_key?: string
          created_at?: string | null
          credit_cost?: number
          id?: string
          is_active?: boolean
        }
        Relationships: []
      }
      job_photos: {
        Row: {
          id: string
          job_id: string
          original_name: string | null
          size_bytes: number | null
          storage_path: string
          uploaded_at: string | null
        }
        Insert: {
          id?: string
          job_id: string
          original_name?: string | null
          size_bytes?: number | null
          storage_path: string
          uploaded_at?: string | null
        }
        Update: {
          id?: string
          job_id?: string
          original_name?: string | null
          size_bytes?: number | null
          storage_path?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_photos_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      job_quotes: {
        Row: {
          artisan_id: string
          availability_note: string | null
          created_at: string | null
          customer_id: string | null
          id: string
          is_viewed: boolean
          job_id: string
          message: string
          portfolio_links: string[] | null
          quoted_price: number | null
          quoted_price_note: string | null
          responded_at: string | null
          status: Database["public"]["Enums"]["quote_status"] | null
          viewed_at: string | null
        }
        Insert: {
          artisan_id: string
          availability_note?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          is_viewed?: boolean
          job_id: string
          message: string
          portfolio_links?: string[] | null
          quoted_price?: number | null
          quoted_price_note?: string | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["quote_status"] | null
          viewed_at?: string | null
        }
        Update: {
          artisan_id?: string
          availability_note?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          is_viewed?: boolean
          job_id?: string
          message?: string
          portfolio_links?: string[] | null
          quoted_price?: number | null
          quoted_price_note?: string | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["quote_status"] | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_quotes_artisan_id_fkey"
            columns: ["artisan_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_quotes_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      job_requests: {
        Row: {
          access_notes: string | null
          address: string | null
          budget: string
          category: Database["public"]["Enums"]["service_category"]
          city: string | null
          contact_methods: string[] | null
          coordinates: Json | null
          created_at: string | null
          credit_cost: number | null
          custom_details: Json | null
          customer_id: string
          description: string
          expires_at: string | null
          frequency: string | null
          id: string
          lga_id: number | null
          lga_name: string | null
          photo_urls: string[] | null
          preferred_date: string | null
          quote_count: number | null
          service_type: Database["public"]["Enums"]["service_location_type"]
          state: string | null
          state_code: string | null
          status: Database["public"]["Enums"]["job_status"] | null
          subcategory: string
          title: string
          updated_at: string | null
          urgency: string
          viewed_count: number | null
        }
        Insert: {
          access_notes?: string | null
          address?: string | null
          budget: string
          category: Database["public"]["Enums"]["service_category"]
          city?: string | null
          contact_methods?: string[] | null
          coordinates?: Json | null
          created_at?: string | null
          credit_cost?: number | null
          custom_details?: Json | null
          customer_id: string
          description: string
          expires_at?: string | null
          frequency?: string | null
          id?: string
          lga_id?: number | null
          lga_name?: string | null
          photo_urls?: string[] | null
          preferred_date?: string | null
          quote_count?: number | null
          service_type: Database["public"]["Enums"]["service_location_type"]
          state?: string | null
          state_code?: string | null
          status?: Database["public"]["Enums"]["job_status"] | null
          subcategory: string
          title: string
          updated_at?: string | null
          urgency: string
          viewed_count?: number | null
        }
        Update: {
          access_notes?: string | null
          address?: string | null
          budget?: string
          category?: Database["public"]["Enums"]["service_category"]
          city?: string | null
          contact_methods?: string[] | null
          coordinates?: Json | null
          created_at?: string | null
          credit_cost?: number | null
          custom_details?: Json | null
          customer_id?: string
          description?: string
          expires_at?: string | null
          frequency?: string | null
          id?: string
          lga_id?: number | null
          lga_name?: string | null
          photo_urls?: string[] | null
          preferred_date?: string | null
          quote_count?: number | null
          service_type?: Database["public"]["Enums"]["service_location_type"]
          state?: string | null
          state_code?: string | null
          status?: Database["public"]["Enums"]["job_status"] | null
          subcategory?: string
          title?: string
          updated_at?: string | null
          urgency?: string
          viewed_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "job_requests_customer_profile_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json | null
          content: string | null
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          quoted_message_id: string | null
          sender_id: string
        }
        Insert: {
          attachments?: Json | null
          content?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          quoted_message_id?: string | null
          sender_id: string
        }
        Update: {
          attachments?: Json | null
          content?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          quoted_message_id?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_quoted_message_id_fkey"
            columns: ["quoted_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          metadata: Json | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          metadata?: Json | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          metadata?: Json | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_requests: {
        Row: {
          amount: number
          artisan_id: string
          contract_id: string
          created_at: string | null
          customer_id: string
          description: string
          id: string
          request_type: Database["public"]["Enums"]["payment_request_type"]
          status: Database["public"]["Enums"]["payment_request_status"]
          updated_at: string | null
        }
        Insert: {
          amount: number
          artisan_id: string
          contract_id: string
          created_at?: string | null
          customer_id: string
          description: string
          id?: string
          request_type: Database["public"]["Enums"]["payment_request_type"]
          status?: Database["public"]["Enums"]["payment_request_status"]
          updated_at?: string | null
        }
        Update: {
          amount?: number
          artisan_id?: string
          contract_id?: string
          created_at?: string | null
          customer_id?: string
          description?: string
          id?: string
          request_type?: Database["public"]["Enums"]["payment_request_type"]
          status?: Database["public"]["Enums"]["payment_request_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_requests_artisan_id_fkey"
            columns: ["artisan_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_requests_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_methods: {
        Row: {
          created_at: string | null
          id: string
          is_default: boolean
          provider: string
          provider_account_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_default?: boolean
          provider: string
          provider_account_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_default?: boolean
          provider?: string
          provider_account_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_methods_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address_preference: string | null
          artisan_data: Json | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          completed_onboarding_roles: string[] | null
          coordinates: Json | null
          current_active_role: Database["public"]["Enums"]["user_role"] | null
          customer_data: Json | null
          full_name: string | null
          id: string
          is_verified: boolean
          last_seen: string | null
          lga_id: number | null
          lga_name: string | null
          nin: string | null
          onboarding_completed_at: string | null
          phone: string | null
          post_code: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          state_code: string | null
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          address_preference?: string | null
          artisan_data?: Json | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          completed_onboarding_roles?: string[] | null
          coordinates?: Json | null
          current_active_role?: Database["public"]["Enums"]["user_role"] | null
          customer_data?: Json | null
          full_name?: string | null
          id: string
          is_verified?: boolean
          last_seen?: string | null
          lga_id?: number | null
          lga_name?: string | null
          nin?: string | null
          onboarding_completed_at?: string | null
          phone?: string | null
          post_code?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          state_code?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          address_preference?: string | null
          artisan_data?: Json | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          completed_onboarding_roles?: string[] | null
          coordinates?: Json | null
          current_active_role?: Database["public"]["Enums"]["user_role"] | null
          customer_data?: Json | null
          full_name?: string | null
          id?: string
          is_verified?: boolean
          last_seen?: string | null
          lga_id?: number | null
          lga_name?: string | null
          nin?: string | null
          onboarding_completed_at?: string | null
          phone?: string | null
          post_code?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          state_code?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          contract_id: string | null
          created_at: string | null
          currency: string
          description: string | null
          expires_at: string | null
          external_reference_id: string | null
          id: string
          job_id: string | null
          original_transaction_id: string | null
          paystack_metadata: Json | null
          quote_id: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string | null
        }
        Insert: {
          amount: number
          contract_id?: string | null
          created_at?: string | null
          currency?: string
          description?: string | null
          expires_at?: string | null
          external_reference_id?: string | null
          id?: string
          job_id?: string | null
          original_transaction_id?: string | null
          paystack_metadata?: Json | null
          quote_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          user_id?: string | null
        }
        Update: {
          amount?: number
          contract_id?: string | null
          created_at?: string | null
          currency?: string
          description?: string | null
          expires_at?: string | null
          external_reference_id?: string | null
          id?: string
          job_id?: string | null
          original_transaction_id?: string | null
          paystack_metadata?: Json | null
          quote_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_original_transaction_id_fkey"
            columns: ["original_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "job_quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      unlocked_jobs: {
        Row: {
          artisan_id: string
          credits_spent: number
          id: string
          is_refunded: boolean
          job_id: string
          original_transaction_id: string | null
          unlocked_at: string | null
        }
        Insert: {
          artisan_id: string
          credits_spent: number
          id?: string
          is_refunded?: boolean
          job_id: string
          original_transaction_id?: string | null
          unlocked_at?: string | null
        }
        Update: {
          artisan_id?: string
          credits_spent?: number
          id?: string
          is_refunded?: boolean
          job_id?: string
          original_transaction_id?: string | null
          unlocked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unlocked_jobs_artisan_id_fkey"
            columns: ["artisan_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unlocked_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unlocked_jobs_original_transaction_id_fkey"
            columns: ["original_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          created_at: string | null
          credit_balance: number
          fiat_balance: number
          id: string
          paystack_customer_code: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credit_balance?: number
          fiat_balance?: number
          id?: string
          paystack_customer_code?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credit_balance?: number
          fiat_balance?: number
          id?: string
          paystack_customer_code?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_quote_and_create_contract: {
        Args: { p_quote_id: string }
        Returns: Json
      }
      buy_credits_with_fiat: { Args: { p_package_id: string }; Returns: Json }
      create_notification: {
        Args: {
          p_link?: string
          p_message: string
          p_metadata?: Json
          p_title: string
          p_type: Database["public"]["Enums"]["notification_type"]
          p_user_id: string
        }
        Returns: string
      }
      create_payment_request: {
        Args: {
          p_amount: number
          p_contract_id: string
          p_description: string
          p_request_type: string
        }
        Returns: Json
      }
      is_artisan_of_job: { Args: { p_job_id: string }; Returns: boolean }
      is_customer_of_quote: { Args: { p_quote_id: string }; Returns: boolean }
      mark_job_completed: { Args: { p_contract_id: string }; Returns: Json }
      reconcile_wallet: { Args: { p_user_id: string }; Returns: Json }
      reconcile_wallet_internal: { Args: { p_user_id: string }; Returns: Json }
      simulate_payment: {
        Args: { p_amount: number; p_currency: string; p_type: string }
        Returns: Json
      }
      unlock_job: { Args: { p_job_id: string }; Returns: Json }
      update_payment_request_status: {
        Args: { p_new_status: string; p_request_id: string }
        Returns: Json
      }
    }
    Enums: {
      contract_status:
        | "draft"
        | "active"
        | "completed"
        | "cancelled"
        | "disputed"
      escrow_status: "none" | "held" | "released" | "refunded" | "disputed"
      job_status: "open" | "in_progress" | "completed" | "cancelled" | "expired"
      notification_type:
        | "info"
        | "success"
        | "warning"
        | "new_quote"
        | "quote_accepted"
        | "quote_declined"
        | "job_expired"
        | "system"
        | "payment_approved"
        | "payment_rejected"
        | "funds_released"
        | "escrow_funded"
        | "job_completed"
        | "wallet_credited"
        | "payment_request"
      payment_request_status: "pending" | "approved" | "rejected"
      payment_request_type: "fund_escrow" | "release_escrow"
      quote_status:
        | "pending"
        | "responded"
        | "accepted"
        | "declined"
        | "withdrawn"
      service_category:
        | "home-services"
        | "events"
        | "wellness"
        | "tech"
        | "creative"
        | "lessons"
        | "automotive"
        | "other"
      service_location_type: "home" | "business" | "remote" | "other"
      transaction_status: "pending" | "completed" | "failed" | "cancelled"
      transaction_type:
        | "credit_purchase"
        | "credit_spend"
        | "fiat_deposit"
        | "escrow_hold"
        | "escrow_release"
        | "escrow_refund"
        | "platform_fee"
        | "withdrawal"
        | "adjustment"
      user_role: "artisan" | "admin" | "customer"
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
      contract_status: [
        "draft",
        "active",
        "completed",
        "cancelled",
        "disputed",
      ],
      escrow_status: ["none", "held", "released", "refunded", "disputed"],
      job_status: ["open", "in_progress", "completed", "cancelled", "expired"],
      notification_type: [
        "info",
        "success",
        "warning",
        "new_quote",
        "quote_accepted",
        "quote_declined",
        "job_expired",
        "system",
        "payment_approved",
        "payment_rejected",
        "funds_released",
        "escrow_funded",
        "job_completed",
        "wallet_credited",
        "payment_request",
      ],
      payment_request_status: ["pending", "approved", "rejected"],
      payment_request_type: ["fund_escrow", "release_escrow"],
      quote_status: [
        "pending",
        "responded",
        "accepted",
        "declined",
        "withdrawn",
      ],
      service_category: [
        "home-services",
        "events",
        "wellness",
        "tech",
        "creative",
        "lessons",
        "automotive",
        "other",
      ],
      service_location_type: ["home", "business", "remote", "other"],
      transaction_status: ["pending", "completed", "failed", "cancelled"],
      transaction_type: [
        "credit_purchase",
        "credit_spend",
        "fiat_deposit",
        "escrow_hold",
        "escrow_release",
        "escrow_refund",
        "platform_fee",
        "withdrawal",
        "adjustment",
      ],
      user_role: ["artisan", "admin", "customer"],
    },
  },
} as const
