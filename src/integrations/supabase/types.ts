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
      articles: {
        Row: {
          author_avatar: string | null
          author_name: string | null
          category: string | null
          content: string | null
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_published: boolean | null
          published_at: string | null
          read_time: number | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_avatar?: string | null
          author_name?: string | null
          category?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          read_time?: number | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_avatar?: string | null
          author_name?: string | null
          category?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          read_time?: number | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      booking_click_events: {
        Row: {
          coach_id: string
          created_at: string
          id: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          coach_id: string
          created_at?: string
          id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          coach_id?: string
          created_at?: string
          id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      brand_images: {
        Row: {
          generated_at: string
          id: string
          page_name: string
          prompt: string
          storage_path: string
          updated_at: string
        }
        Insert: {
          generated_at?: string
          id?: string
          page_name: string
          prompt: string
          storage_path: string
          updated_at?: string
        }
        Update: {
          generated_at?: string
          id?: string
          page_name?: string
          prompt?: string
          storage_path?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      coach_applications: {
        Row: {
          availability_status: string | null
          avatar_url: string | null
          bio: string | null
          booking_url: string | null
          certification_interest: string | null
          certifications: string | null
          coach_background: string | null
          coach_background_detail: string | null
          coaching_experience_level: string | null
          coaching_experience_years: string | null
          coaching_philosophy: string | null
          coaching_style: string[] | null
          commitment_level: string | null
          created_at: string
          current_role: string | null
          email: string
          engagement_model: string | null
          excitement_note: string | null
          exec_function: string[] | null
          exec_level: string | null
          experience_years: number | null
          founder_function_strength: string[] | null
          founder_stage_focus: string[] | null
          full_name: string
          id: string
          industry_focus: string[] | null
          leadership_experience_years: string | null
          linkedin_url: string | null
          onboarding_short_id: string | null
          onboarding_status: string | null
          onboarding_token: string | null
          phone: string | null
          pillar_specialties: string[] | null
          primary_join_reason: string | null
          primary_pillar: string | null
          reviewed_at: string | null
          reviewer_notes: string | null
          secondary_pillars: string[] | null
          specialties: string[] | null
          start_timeline: string | null
          status: Database["public"]["Enums"]["coach_status"] | null
          user_id: string | null
          website_url: string | null
          why_galoras: string | null
        }
        Insert: {
          availability_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          booking_url?: string | null
          certification_interest?: string | null
          certifications?: string | null
          coach_background?: string | null
          coach_background_detail?: string | null
          coaching_experience_level?: string | null
          coaching_experience_years?: string | null
          coaching_philosophy?: string | null
          coaching_style?: string[] | null
          commitment_level?: string | null
          created_at?: string
          current_role?: string | null
          email: string
          engagement_model?: string | null
          excitement_note?: string | null
          exec_function?: string[] | null
          exec_level?: string | null
          experience_years?: number | null
          founder_function_strength?: string[] | null
          founder_stage_focus?: string[] | null
          full_name: string
          id?: string
          industry_focus?: string[] | null
          leadership_experience_years?: string | null
          linkedin_url?: string | null
          onboarding_short_id?: string | null
          onboarding_status?: string | null
          onboarding_token?: string | null
          phone?: string | null
          pillar_specialties?: string[] | null
          primary_join_reason?: string | null
          primary_pillar?: string | null
          reviewed_at?: string | null
          reviewer_notes?: string | null
          secondary_pillars?: string[] | null
          specialties?: string[] | null
          start_timeline?: string | null
          status?: Database["public"]["Enums"]["coach_status"] | null
          user_id?: string | null
          website_url?: string | null
          why_galoras?: string | null
        }
        Update: {
          availability_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          booking_url?: string | null
          certification_interest?: string | null
          certifications?: string | null
          coach_background?: string | null
          coach_background_detail?: string | null
          coaching_experience_level?: string | null
          coaching_experience_years?: string | null
          coaching_philosophy?: string | null
          coaching_style?: string[] | null
          commitment_level?: string | null
          created_at?: string
          current_role?: string | null
          email?: string
          engagement_model?: string | null
          excitement_note?: string | null
          exec_function?: string[] | null
          exec_level?: string | null
          experience_years?: number | null
          founder_function_strength?: string[] | null
          founder_stage_focus?: string[] | null
          full_name?: string
          id?: string
          industry_focus?: string[] | null
          leadership_experience_years?: string | null
          linkedin_url?: string | null
          onboarding_short_id?: string | null
          onboarding_status?: string | null
          onboarding_token?: string | null
          phone?: string | null
          pillar_specialties?: string[] | null
          primary_join_reason?: string | null
          primary_pillar?: string | null
          reviewed_at?: string | null
          reviewer_notes?: string | null
          secondary_pillars?: string[] | null
          specialties?: string[] | null
          start_timeline?: string | null
          status?: Database["public"]["Enums"]["coach_status"] | null
          user_id?: string | null
          website_url?: string | null
          why_galoras?: string | null
        }
        Relationships: []
      }
      coach_availability: {
        Row: {
          coach_id: string
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean | null
          start_time: string
        }
        Insert: {
          coach_id: string
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean | null
          start_time: string
        }
        Update: {
          coach_id?: string
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_availability_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_categories: {
        Row: {
          category_id: string
          coach_id: string
          created_at: string
          id: string
        }
        Insert: {
          category_id: string
          coach_id: string
          created_at?: string
          id?: string
        }
        Update: {
          category_id?: string
          coach_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_categories_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      coaches: {
        Row: {
          avatar_url: string | null
          bio: string | null
          booking_url: string | null
          coach_background: string | null
          coaching_experience_level: string | null
          coaching_philosophy: string | null
          coaching_style: string | null
          created_at: string
          current_role: string | null
          cutout_url: string | null
          display_name: string | null
          experience_years: number | null
          featured_at: string | null
          featured_rank: number | null
          headline: string | null
          hourly_rate: number | null
          id: string
          is_enterprise_ready: boolean | null
          is_featured: boolean | null
          languages: string[] | null
          leadership_experience_years: string | null
          linkedin_url: string | null
          location: string | null
          pillar_specialties: string[] | null
          rating: number | null
          signature_framework: string | null
          specialties: string[] | null
          status: Database["public"]["Enums"]["coach_status"] | null
          timezone: string | null
          total_sessions: number | null
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          booking_url?: string | null
          coach_background?: string | null
          coaching_experience_level?: string | null
          coaching_philosophy?: string | null
          coaching_style?: string | null
          created_at?: string
          current_role?: string | null
          cutout_url?: string | null
          display_name?: string | null
          experience_years?: number | null
          featured_at?: string | null
          featured_rank?: number | null
          headline?: string | null
          hourly_rate?: number | null
          id?: string
          is_enterprise_ready?: boolean | null
          is_featured?: boolean | null
          languages?: string[] | null
          leadership_experience_years?: string | null
          linkedin_url?: string | null
          location?: string | null
          pillar_specialties?: string[] | null
          rating?: number | null
          signature_framework?: string | null
          specialties?: string[] | null
          status?: Database["public"]["Enums"]["coach_status"] | null
          timezone?: string | null
          total_sessions?: number | null
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          booking_url?: string | null
          coach_background?: string | null
          coaching_experience_level?: string | null
          coaching_philosophy?: string | null
          coaching_style?: string | null
          created_at?: string
          current_role?: string | null
          cutout_url?: string | null
          display_name?: string | null
          experience_years?: number | null
          featured_at?: string | null
          featured_rank?: number | null
          headline?: string | null
          hourly_rate?: number | null
          id?: string
          is_enterprise_ready?: boolean | null
          is_featured?: boolean | null
          languages?: string[] | null
          leadership_experience_years?: string | null
          linkedin_url?: string | null
          location?: string | null
          pillar_specialties?: string[] | null
          rating?: number | null
          signature_framework?: string | null
          specialties?: string[] | null
          status?: Database["public"]["Enums"]["coach_status"] | null
          timezone?: string | null
          total_sessions?: number | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          current_attendees: number | null
          description: string | null
          end_date: string | null
          event_type: string
          id: string
          image_url: string | null
          is_published: boolean | null
          is_virtual: boolean | null
          location: string | null
          max_attendees: number | null
          price: number | null
          registration_url: string | null
          slug: string
          start_date: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_attendees?: number | null
          description?: string | null
          end_date?: string | null
          event_type: string
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          is_virtual?: boolean | null
          location?: string | null
          max_attendees?: number | null
          price?: number | null
          registration_url?: string | null
          slug: string
          start_date: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_attendees?: number | null
          description?: string | null
          end_date?: string | null
          event_type?: string
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          is_virtual?: boolean | null
          location?: string | null
          max_attendees?: number | null
          price?: number | null
          registration_url?: string | null
          slug?: string
          start_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          company_name: string
          company_size: string | null
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string
          id: string
          industry: string | null
          interest: string[] | null
          message: string | null
          notes: string | null
          source: string | null
          status: Database["public"]["Enums"]["lead_status"] | null
          updated_at: string
        }
        Insert: {
          company_name: string
          company_size?: string | null
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          interest?: string[] | null
          message?: string | null
          notes?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          updated_at?: string
        }
        Update: {
          company_name?: string
          company_size?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          interest?: string[] | null
          message?: string | null
          notes?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read_at: string | null
          receiver_id: string
          sender_id: string
          status: Database["public"]["Enums"]["message_status"] | null
          subject: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read_at?: string | null
          receiver_id: string
          sender_id: string
          status?: Database["public"]["Enums"]["message_status"] | null
          subject?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
          status?: Database["public"]["Enums"]["message_status"] | null
          subject?: string | null
        }
        Relationships: []
      }
      onboarding_links: {
        Row: {
          application_id: string
          created_at: string
          expires_at: string
          id: string
          onboarding_token: string
          short_id: string
          used_at: string | null
        }
        Insert: {
          application_id: string
          created_at?: string
          expires_at?: string
          id?: string
          onboarding_token: string
          short_id: string
          used_at?: string | null
        }
        Update: {
          application_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          onboarding_token?: string
          short_id?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_links_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "coach_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      session_bookings: {
        Row: {
          client_email: string
          client_id: string
          client_name: string
          coach_id: string
          created_at: string | null
          duration_minutes: number | null
          google_calendar_event_id: string | null
          id: string
          notes: string | null
          scheduled_date: string
          scheduled_time: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          client_email: string
          client_id: string
          client_name: string
          coach_id: string
          created_at?: string | null
          duration_minutes?: number | null
          google_calendar_event_id?: string | null
          id?: string
          notes?: string | null
          scheduled_date: string
          scheduled_time: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          client_email?: string
          client_id?: string
          client_name?: string
          coach_id?: string
          created_at?: string | null
          duration_minutes?: number | null
          google_calendar_event_id?: string | null
          id?: string
          notes?: string | null
          scheduled_date?: string
          scheduled_time?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_bookings_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          client_company: string | null
          client_name: string
          client_title: string | null
          coach_id: string
          content: string
          created_at: string
          id: string
          is_featured: boolean | null
          rating: number | null
        }
        Insert: {
          client_company?: string | null
          client_name: string
          client_title?: string | null
          coach_id: string
          content: string
          created_at?: string
          id?: string
          is_featured?: boolean | null
          rating?: number | null
        }
        Update: {
          client_company?: string | null
          client_name?: string
          client_title?: string | null
          coach_id?: string
          content?: string
          created_at?: string
          id?: string
          is_featured?: boolean | null
          rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "coach" | "admin"
      coach_status: "pending" | "approved" | "rejected"
      lead_status: "new" | "contacted" | "qualified" | "closed"
      message_status: "sent" | "read" | "archived"
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
      app_role: ["user", "coach", "admin"],
      coach_status: ["pending", "approved", "rejected"],
      lead_status: ["new", "contacted", "qualified", "closed"],
      message_status: ["sent", "read", "archived"],
    },
  },
} as const
