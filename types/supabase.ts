export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      job_photos: {
        Row: {
          id: string;
          job_id: string;
          original_name: string | null;
          size_bytes: number | null;
          storage_path: string;
          uploaded_at: string | null;
        };
        Insert: {
          id?: string;
          job_id: string;
          original_name?: string | null;
          size_bytes?: number | null;
          storage_path: string;
          uploaded_at?: string | null;
        };
        Update: {
          id?: string;
          job_id?: string;
          original_name?: string | null;
          size_bytes?: number | null;
          storage_path?: string;
          uploaded_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "job_photos_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "job_requests";
            referencedColumns: ["id"];
          }
        ];
      };
      job_quotes: {
        Row: {
          availability_note: string | null;
          created_at: string | null;
          id: string;
          job_id: string;
          message: string;
          portfolio_links: string[] | null;
          professional_id: string;
          quoted_price: number | null;
          quoted_price_note: string | null;
          responded_at: string | null;
          status: string | null;
        };
        Insert: {
          availability_note?: string | null;
          created_at?: string | null;
          id?: string;
          job_id: string;
          message: string;
          portfolio_links?: string[] | null;
          professional_id: string;
          quoted_price?: number | null;
          quoted_price_note?: string | null;
          responded_at?: string | null;
          status?: string | null;
        };
        Update: {
          availability_note?: string | null;
          created_at?: string | null;
          id?: string;
          job_id?: string;
          message?: string;
          portfolio_links?: string[] | null;
          professional_id?: string;
          quoted_price?: number | null;
          quoted_price_note?: string | null;
          responded_at?: string | null;
          status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "job_quotes_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "job_requests";
            referencedColumns: ["id"];
          }
        ];
      };
      job_requests: {
        Row: {
          access_notes: string | null;
          address: string | null;
          budget: string;
          category: Database["public"]["Enums"]["service_category"];
          contact_methods: string[] | null;
          created_at: string | null;
          custom_details: Json | null;
          customer_id: string;
          description: string;
          expires_at: string | null;
          frequency: string | null;
          id: string;
          photo_urls: string[] | null;
          preferred_date: string | null;
          quote_count: number | null;
          search_vector: unknown;
          service_location: string;
          service_type: Database["public"]["Enums"]["service_location_type"];
          status: Database["public"]["Enums"]["job_status"] | null;
          subcategory: string;
          updated_at: string | null;
          urgency: string;
          viewed_count: number | null;
        };
        Insert: {
          access_notes?: string | null;
          address?: string | null;
          budget: string;
          category: Database["public"]["Enums"]["service_category"];
          contact_methods?: string[] | null;
          created_at?: string | null;
          custom_details?: Json | null;
          customer_id: string;
          description: string;
          expires_at?: string | null;
          frequency?: string | null;
          id?: string;
          photo_urls?: string[] | null;
          preferred_date?: string | null;
          quote_count?: number | null;
          search_vector?: unknown;
          service_location: string;
          service_type: Database["public"]["Enums"]["service_location_type"];
          status?: Database["public"]["Enums"]["job_status"] | null;
          subcategory: string;
          updated_at?: string | null;
          urgency: string;
          viewed_count?: number | null;
        };
        Update: {
          access_notes?: string | null;
          address?: string | null;
          budget?: string;
          category?: Database["public"]["Enums"]["service_category"];
          contact_methods?: string[] | null;
          created_at?: string | null;
          custom_details?: Json | null;
          customer_id?: string;
          description?: string;
          expires_at?: string | null;
          frequency?: string | null;
          id?: string;
          photo_urls?: string[] | null;
          preferred_date?: string | null;
          quote_count?: number | null;
          search_vector?: unknown;
          service_location?: string;
          service_type?: Database["public"]["Enums"]["service_location_type"];
          status?: Database["public"]["Enums"]["job_status"] | null;
          subcategory?: string;
          updated_at?: string | null;
          urgency?: string;
          viewed_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "job_requests_customer_profile_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          full_name: string | null;
          id: string;
          is_verified: boolean;
          role: Database["public"]["Enums"]["user_role"] | null;
          updated_at: string | null;
          username: string | null;
          website: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          full_name?: string | null;
          id: string;
          is_verified?: boolean;
          role?: Database["public"]["Enums"]["user_role"] | null;
          updated_at?: string | null;
          username?: string | null;
          website?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          full_name?: string | null;
          id?: string;
          is_verified?: boolean;
          role?: Database["public"]["Enums"]["user_role"] | null;
          updated_at?: string | null;
          username?: string | null;
          website?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      job_status:
        | "open"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "expired";
      service_category:
        | "home-services"
        | "events"
        | "wellness"
        | "tech"
        | "creative"
        | "lessons"
        | "automotive"
        | "other";
      service_location_type: "home" | "business" | "remote" | "other";
      user_role: "professional" | "admin" | "customer";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {
      job_status: ["open", "in_progress", "completed", "cancelled", "expired"],
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
      user_role: ["professional", "admin", "customer"],
    },
  },
} as const;
