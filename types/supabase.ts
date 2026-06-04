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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
    }
    Enums: {
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
      ],
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
      user_role: ["artisan", "admin", "customer"],
    },
  },
} as const
