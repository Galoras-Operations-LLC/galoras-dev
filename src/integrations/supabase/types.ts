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
      bookings: {
        Row: {
          amount_cents: number | null
          client_id: string | null
          coach_id: string | null
          created_at: string
          currency: string | null
          id: string
          product_id: string | null
          status: string
          stripe_payment_intent_id: string | null
        }
        Insert: {
          amount_cents?: number | null
          client_id?: string | null
          coach_id?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          product_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
        }
        Update: {
          amount_cents?: number | null
          client_id?: string | null
          coach_id?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          product_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "coach_products"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_applications: {
        Row: {
          audience_tags: string[] | null
          availability_status: string | null
          availability_tag: string | null
          avatar_url: string | null
          bio: string | null
          booking_url: string | null
          certification_interest: string | null
          coach_background: string | null
          coach_background_detail: string | null
          coaching_experience_level: string | null
          coaching_experience_years: number | null
          coaching_philosophy: string | null
          coaching_style: string | null
          commitment_level: string | null
          converted: boolean | null
          created_at: string | null
          credential_tags: string[] | null
          current_role: string | null
          decided_at: string | null
          decided_by: string | null
          decision_reason: string | null
          email: string
          engagement_model: string | null
          enterprise_tags: string[] | null
          excitement_note: string | null
          exec_function: string | null
          exec_level: string | null
          fit_score: number | null
          fit_score_dimensions: Json | null
          founder_function_strength: string | null
          founder_stage_focus: string | null
          full_name: string | null
          id: string
          industry_focus: string | null
          industry_tags: string[] | null
          leadership_experience_years: number | null
          linkedin_url: string | null
          methodology: string | null
          notes: string | null
          onboarding_status: string
          onboarding_token: string | null
          onboarding_token_expires_at: string | null
          pending_product: Json | null
          phone: string | null
          pillar_specialties: string[] | null
          primary_join_reason: string | null
          primary_pillar: string | null
          review_status: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          secondary_pillars: string[] | null
          specialties: string[] | null
          specialty_tags: string[] | null
          start_timeline: string | null
          status: string | null
          style_tags: string[] | null
          updated_at: string | null
          user_id: string | null
          website_url: string | null
          why_galoras: string | null
        }
        Insert: {
          audience_tags?: string[] | null
          availability_status?: string | null
          availability_tag?: string | null
          avatar_url?: string | null
          bio?: string | null
          booking_url?: string | null
          certification_interest?: string | null
          coach_background?: string | null
          coach_background_detail?: string | null
          coaching_experience_level?: string | null
          coaching_experience_years?: number | null
          coaching_philosophy?: string | null
          coaching_style?: string | null
          commitment_level?: string | null
          converted?: boolean | null
          created_at?: string | null
          credential_tags?: string[] | null
          current_role?: string | null
          decided_at?: string | null
          decided_by?: string | null
          decision_reason?: string | null
          email: string
          engagement_model?: string | null
          enterprise_tags?: string[] | null
          excitement_note?: string | null
          exec_function?: string | null
          exec_level?: string | null
          fit_score?: number | null
          fit_score_dimensions?: Json | null
          founder_function_strength?: string | null
          founder_stage_focus?: string | null
          full_name?: string | null
          id?: string
          industry_focus?: string | null
          industry_tags?: string[] | null
          leadership_experience_years?: number | null
          linkedin_url?: string | null
          methodology?: string | null
          notes?: string | null
          onboarding_status?: string
          onboarding_token?: string | null
          onboarding_token_expires_at?: string | null
          pending_product?: Json | null
          phone?: string | null
          pillar_specialties?: string[] | null
          primary_join_reason?: string | null
          primary_pillar?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          secondary_pillars?: string[] | null
          specialties?: string[] | null
          specialty_tags?: string[] | null
          start_timeline?: string | null
          status?: string | null
          style_tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          website_url?: string | null
          why_galoras?: string | null
        }
        Update: {
          audience_tags?: string[] | null
          availability_status?: string | null
          availability_tag?: string | null
          avatar_url?: string | null
          bio?: string | null
          booking_url?: string | null
          certification_interest?: string | null
          coach_background?: string | null
          coach_background_detail?: string | null
          coaching_experience_level?: string | null
          coaching_experience_years?: number | null
          coaching_philosophy?: string | null
          coaching_style?: string | null
          commitment_level?: string | null
          converted?: boolean | null
          created_at?: string | null
          credential_tags?: string[] | null
          current_role?: string | null
          decided_at?: string | null
          decided_by?: string | null
          decision_reason?: string | null
          email?: string
          engagement_model?: string | null
          enterprise_tags?: string[] | null
          excitement_note?: string | null
          exec_function?: string | null
          exec_level?: string | null
          fit_score?: number | null
          fit_score_dimensions?: Json | null
          founder_function_strength?: string | null
          founder_stage_focus?: string | null
          full_name?: string | null
          id?: string
          industry_focus?: string | null
          industry_tags?: string[] | null
          leadership_experience_years?: number | null
          linkedin_url?: string | null
          methodology?: string | null
          notes?: string | null
          onboarding_status?: string
          onboarding_token?: string | null
          onboarding_token_expires_at?: string | null
          pending_product?: Json | null
          phone?: string | null
          pillar_specialties?: string[] | null
          primary_join_reason?: string | null
          primary_pillar?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          secondary_pillars?: string[] | null
          specialties?: string[] | null
          specialty_tags?: string[] | null
          start_timeline?: string | null
          status?: string | null
          style_tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          website_url?: string | null
          why_galoras?: string | null
        }
        Relationships: []
      }
      coach_availability: {
        Row: {
          coach_id: string | null
          created_at: string | null
          day_of_week: number | null
          end_time: string | null
          id: string
          is_available: boolean | null
          start_time: string | null
        }
        Insert: {
          coach_id?: string | null
          created_at?: string | null
          day_of_week?: number | null
          end_time?: string | null
          id?: string
          is_available?: boolean | null
          start_time?: string | null
        }
        Update: {
          coach_id?: string | null
          created_at?: string | null
          day_of_week?: number | null
          end_time?: string | null
          id?: string
          is_available?: boolean | null
          start_time?: string | null
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
      coach_products: {
        Row: {
          booking_mode: string
          coach_id: string
          created_at: string
          delivery_format: string | null
          duration_minutes: number | null
          duration_weeks: number | null
          enterprise_ready: boolean
          id: string
          is_active: boolean
          outcome_statement: string | null
          price_amount: number | null
          price_range_max: number | null
          price_range_min: number | null
          price_type: string
          product_type: string
          session_count: number | null
          sort_order: number
          target_audience: string[] | null
          title: string
          updated_at: string
          visibility_scope: string
        }
        Insert: {
          booking_mode?: string
          coach_id: string
          created_at?: string
          delivery_format?: string | null
          duration_minutes?: number | null
          duration_weeks?: number | null
          enterprise_ready?: boolean
          id?: string
          is_active?: boolean
          outcome_statement?: string | null
          price_amount?: number | null
          price_range_max?: number | null
          price_range_min?: number | null
          price_type?: string
          product_type: string
          session_count?: number | null
          sort_order?: number
          target_audience?: string[] | null
          title: string
          updated_at?: string
          visibility_scope?: string
        }
        Update: {
          booking_mode?: string
          coach_id?: string
          created_at?: string
          delivery_format?: string | null
          duration_minutes?: number | null
          duration_weeks?: number | null
          enterprise_ready?: boolean
          id?: string
          is_active?: boolean
          outcome_statement?: string | null
          price_amount?: number | null
          price_range_max?: number | null
          price_range_min?: number | null
          price_type?: string
          product_type?: string
          session_count?: number | null
          sort_order?: number
          target_audience?: string[] | null
          title?: string
          updated_at?: string
          visibility_scope?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_products_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_registrations: {
        Row: {
          bio: string | null
          coach_current_role: string | null
          company: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          linkedin_url: string | null
          registration_completed: boolean
          registration_token: string
          selected_tier: string
          specialties: string[] | null
          status: string
          stripe_customer_id: string | null
          stripe_payment_method_id: string | null
          stripe_setup_intent_id: string | null
          updated_at: string | null
          user_id: string | null
          years_experience: number | null
        }
        Insert: {
          bio?: string | null
          coach_current_role?: string | null
          company?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          linkedin_url?: string | null
          registration_completed?: boolean
          registration_token?: string
          selected_tier: string
          specialties?: string[] | null
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_method_id?: string | null
          stripe_setup_intent_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          years_experience?: number | null
        }
        Update: {
          bio?: string | null
          coach_current_role?: string | null
          company?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          linkedin_url?: string | null
          registration_completed?: boolean
          registration_token?: string
          selected_tier?: string
          specialties?: string[] | null
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_method_id?: string | null
          stripe_setup_intent_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      coach_tag_map: {
        Row: {
          coach_id: string
          tag_id: string
        }
        Insert: {
          coach_id: string
          tag_id: string
        }
        Update: {
          coach_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_tag_map_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_tag_map_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      coaches: {
        Row: {
          agent_last_run: string | null
          agent_recommendation: string | null
          audience: string[] | null
          availability_status: string | null
          avatar_url: string | null
          bio: string | null
          booking_url: string | null
          coach_background: string | null
          coach_background_detail: string | null
          coaching_experience_level: string | null
          coaching_philosophy: string | null
          coaching_style: string | null
          companies_worked: string | null
          created_at: string | null
          current_role: string | null
          cutout_url: string | null
          display_name: string | null
          email: string | null
          engagement_format: string | null
          engagement_model: string | null
          headline: string | null
          id: string
          industry: string | null
          industry_focus: string | null
          featured_rank: number | null
          is_featured: boolean | null
          leadership_experience_years: number | null
          lifecycle_status: string | null
          linkedin_url: string | null
          methodology: string | null
          missing_fields: Json | null
          pillar: string | null
          pillar_specialties: string[] | null
          positioning_statement: string | null
          primary_pillar: string | null
          profile_complete: boolean | null
          profile_image_url: string | null
          proof_points: Json | null
          published_at: string | null
          readiness_score: number | null
          reviewed_at: string | null
          reviewer_id: string | null
          reviewer_notes: string | null
          risk_flags: Json | null
          secondary_pillars: string[] | null
          slug: string | null
          specialties: string[] | null
          status: string | null
          structured_updated_at: string | null
          sub_pillar: string | null
          submitted_at: string | null
          suspended_at: string | null
          tier: string | null
          updated_at: string | null
          user_id: string | null
          website_url: string | null
          years_experience: number | null
        }
        Insert: {
          agent_last_run?: string | null
          agent_recommendation?: string | null
          audience?: string[] | null
          availability_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          booking_url?: string | null
          coach_background?: string | null
          coach_background_detail?: string | null
          coaching_experience_level?: string | null
          coaching_philosophy?: string | null
          coaching_style?: string | null
          companies_worked?: string | null
          created_at?: string | null
          current_role?: string | null
          cutout_url?: string | null
          display_name?: string | null
          email?: string | null
          engagement_format?: string | null
          engagement_model?: string | null
          headline?: string | null
          id?: string
          industry?: string | null
          industry_focus?: string | null
          featured_rank?: number | null
          is_featured?: boolean | null
          leadership_experience_years?: number | null
          lifecycle_status?: string | null
          linkedin_url?: string | null
          methodology?: string | null
          missing_fields?: Json | null
          pillar?: string | null
          pillar_specialties?: string[] | null
          positioning_statement?: string | null
          primary_pillar?: string | null
          profile_complete?: boolean | null
          profile_image_url?: string | null
          proof_points?: Json | null
          published_at?: string | null
          readiness_score?: number | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          reviewer_notes?: string | null
          risk_flags?: Json | null
          secondary_pillars?: string[] | null
          slug?: string | null
          specialties?: string[] | null
          status?: string | null
          structured_updated_at?: string | null
          sub_pillar?: string | null
          submitted_at?: string | null
          suspended_at?: string | null
          tier?: string | null
          updated_at?: string | null
          user_id?: string | null
          website_url?: string | null
          years_experience?: number | null
        }
        Update: {
          agent_last_run?: string | null
          agent_recommendation?: string | null
          audience?: string[] | null
          availability_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          booking_url?: string | null
          coach_background?: string | null
          coach_background_detail?: string | null
          coaching_experience_level?: string | null
          coaching_philosophy?: string | null
          coaching_style?: string | null
          companies_worked?: string | null
          created_at?: string | null
          current_role?: string | null
          cutout_url?: string | null
          display_name?: string | null
          email?: string | null
          engagement_format?: string | null
          engagement_model?: string | null
          headline?: string | null
          id?: string
          industry?: string | null
          industry_focus?: string | null
          featured_rank?: number | null
          is_featured?: boolean | null
          leadership_experience_years?: number | null
          lifecycle_status?: string | null
          linkedin_url?: string | null
          methodology?: string | null
          missing_fields?: Json | null
          pillar?: string | null
          pillar_specialties?: string[] | null
          positioning_statement?: string | null
          primary_pillar?: string | null
          profile_complete?: boolean | null
          profile_image_url?: string | null
          proof_points?: Json | null
          published_at?: string | null
          readiness_score?: number | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          reviewer_notes?: string | null
          risk_flags?: Json | null
          secondary_pillars?: string[] | null
          slug?: string | null
          specialties?: string[] | null
          status?: string | null
          structured_updated_at?: string | null
          sub_pillar?: string | null
          submitted_at?: string | null
          suspended_at?: string | null
          tier?: string | null
          updated_at?: string | null
          user_id?: string | null
          website_url?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      coach_transition_log: {
        Row: {
          id: string
          coach_id: string
          from_status: string | null
          to_status: string
          actor_id: string | null
          actor_email: string | null
          reviewer_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          coach_id: string
          from_status?: string | null
          to_status: string
          actor_id?: string | null
          actor_email?: string | null
          reviewer_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          coach_id?: string
          from_status?: string | null
          to_status?: string
          actor_id?: string | null
          actor_email?: string | null
          reviewer_notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_transition_log_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_agreements: {
        Row: {
          accepted: boolean
          agreement_type: string
          context: string | null
          document_version: string
          email: string | null
          id: string
          ip_address: string | null
          marketing_opt_in: boolean | null
          signed_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          accepted?: boolean
          agreement_type: string
          context?: string | null
          document_version?: string
          email?: string | null
          id?: string
          ip_address?: string | null
          marketing_opt_in?: boolean | null
          signed_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          accepted?: boolean
          agreement_type?: string
          context?: string | null
          document_version?: string
          email?: string | null
          id?: string
          ip_address?: string | null
          marketing_opt_in?: boolean | null
          signed_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          coach_id: string
          content: string
          created_at: string | null
          id: string
          read_at: string | null
          sender_email: string | null
          sender_id: string | null
          subject: string | null
        }
        Insert: {
          coach_id: string
          content: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          sender_email?: string | null
          sender_id?: string | null
          subject?: string | null
        }
        Update: {
          coach_id?: string
          content?: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          sender_email?: string | null
          sender_id?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      product_tag_map: {
        Row: {
          product_id: string
          tag_id: string
        }
        Insert: {
          product_id: string
          tag_id: string
        }
        Update: {
          product_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_tag_map_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "coach_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_tag_map_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      product_type_definitions: {
        Row: {
          badge_color: string
          created_at: string | null
          id: string
          label: string
          slug: string
          sort_order: number
        }
        Insert: {
          badge_color?: string
          created_at?: string | null
          id?: string
          label: string
          slug: string
          sort_order?: number
        }
        Update: {
          badge_color?: string
          created_at?: string | null
          id?: string
          label?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          challenges: string | null
          coaching_areas: string[] | null
          created_at: string | null
          email: string | null
          full_name: string | null
          goals: string[] | null
          id: string
          industry: string | null
          linkedin_url: string | null
          onboarding_complete: boolean
          stripe_customer_id: string | null
          subscription_current_period_end: string | null
          subscription_id: string | null
          subscription_status: string | null
          subscription_tier: string | null
          updated_at: string | null
          user_role: string | null
          user_type: string
        }
        Insert: {
          avatar_url?: string | null
          challenges?: string | null
          coaching_areas?: string[] | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          goals?: string[] | null
          id: string
          industry?: string | null
          linkedin_url?: string | null
          onboarding_complete?: boolean
          stripe_customer_id?: string | null
          subscription_current_period_end?: string | null
          subscription_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          user_role?: string | null
          user_type?: string
        }
        Update: {
          avatar_url?: string | null
          challenges?: string | null
          coaching_areas?: string[] | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          goals?: string[] | null
          id?: string
          industry?: string | null
          linkedin_url?: string | null
          onboarding_complete?: boolean
          stripe_customer_id?: string | null
          subscription_current_period_end?: string | null
          subscription_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          user_role?: string | null
          user_type?: string
        }
        Relationships: []
      }
      session_bookings: {
        Row: {
          client_email: string | null
          client_name: string | null
          coach_id: string | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          notes: string | null
          scheduled_date: string | null
          scheduled_time: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          client_email?: string | null
          client_name?: string | null
          coach_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          client_email?: string | null
          client_name?: string | null
          coach_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
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
      tags: {
        Row: {
          created_at: string | null
          display_order: number
          id: string
          is_active: boolean
          tag_family: string
          tag_key: string
          tag_label: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          tag_family: string
          tag_key: string
          tag_label: string
        }
        Update: {
          created_at?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          tag_family?: string
          tag_key?: string
          tag_label?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
