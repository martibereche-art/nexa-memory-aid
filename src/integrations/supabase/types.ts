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
      notes: {
        Row: {
          content: string
          created_at: string
          for_date: string | null
          id: string
          is_done: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          for_date?: string | null
          id?: string
          is_done?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          for_date?: string | null
          id?: string
          is_done?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          is_read: boolean
          kind: string
          source_key: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean
          kind?: string
          source_key?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean
          kind?: string
          source_key?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      packing_items: {
        Row: {
          created_at: string
          id: string
          is_checked: boolean
          list_id: string
          name: string
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_checked?: boolean
          list_id: string
          name: string
          sort_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_checked?: boolean
          list_id?: string
          name?: string
          sort_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "packing_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "packing_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      packing_lists: {
        Row: {
          created_at: string
          date: string | null
          destination: string
          id: string
          is_archived: boolean
          is_completed: boolean
          list_type: string
          notes: string
          reminder_at: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string | null
          destination?: string
          id?: string
          is_archived?: boolean
          is_completed?: boolean
          list_type?: string
          notes?: string
          reminder_at?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string | null
          destination?: string
          id?: string
          is_archived?: boolean
          is_completed?: boolean
          list_type?: string
          notes?: string
          reminder_at?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          background: string
          created_at: string
          display_name: string
          language: string
          notify_browser: boolean
          notify_in_app: boolean
          notify_sound: boolean
          notify_sound_id: string
          notify_volume: number
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          background?: string
          created_at?: string
          display_name?: string
          language?: string
          notify_browser?: boolean
          notify_in_app?: boolean
          notify_sound?: boolean
          notify_sound_id?: string
          notify_volume?: number
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          background?: string
          created_at?: string
          display_name?: string
          language?: string
          notify_browser?: boolean
          notify_in_app?: boolean
          notify_sound?: boolean
          notify_sound_id?: string
          notify_volume?: number
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_items: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          is_archived: boolean
          is_favorite: boolean
          location: string
          name: string
          tags: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_archived?: boolean
          is_favorite?: boolean
          location?: string
          name: string
          tags?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_archived?: boolean
          is_favorite?: boolean
          location?: string
          name?: string
          tags?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shopping_items: {
        Row: {
          created_at: string
          id: string
          is_purchased: boolean
          is_recurring: boolean
          list_id: string
          name: string
          notes: string
          priority: string
          quantity: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_purchased?: boolean
          is_recurring?: boolean
          list_id: string
          name: string
          notes?: string
          priority?: string
          quantity?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_purchased?: boolean
          is_recurring?: boolean
          list_id?: string
          name?: string
          notes?: string
          priority?: string
          quantity?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "shopping_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_lists: {
        Row: {
          category: string
          created_at: string
          id: string
          is_archived: boolean
          notes: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          is_archived?: boolean
          notes?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_archived?: boolean
          notes?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          plan: string
          provider: string | null
          provider_customer_id: string | null
          provider_subscription_id: string | null
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          plan?: string
          provider?: string | null
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          plan?: string
          provider?: string | null
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          category: string
          completed_at: string | null
          created_at: string
          description: string
          due_date: string | null
          id: string
          is_recurring: boolean
          notes: string
          priority: string
          recurrence: string
          reminder_at: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          completed_at?: string | null
          created_at?: string
          description?: string
          due_date?: string | null
          id?: string
          is_recurring?: boolean
          notes?: string
          priority?: string
          recurrence?: string
          reminder_at?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          completed_at?: string | null
          created_at?: string
          description?: string
          due_date?: string | null
          id?: string
          is_recurring?: boolean
          notes?: string
          priority?: string
          recurrence?: string
          reminder_at?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      waiting_items: {
        Row: {
          category: string
          created_at: string
          description: string
          expected_date: string | null
          from_whom: string
          id: string
          last_follow_up: string | null
          next_reminder: string | null
          notes: string
          priority: string
          start_date: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string
          expected_date?: string | null
          from_whom?: string
          id?: string
          last_follow_up?: string | null
          next_reminder?: string | null
          notes?: string
          priority?: string
          start_date?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          expected_date?: string | null
          from_whom?: string
          id?: string
          last_follow_up?: string | null
          next_reminder?: string | null
          notes?: string
          priority?: string
          start_date?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_prime: { Args: { _user_id: string }; Returns: boolean }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
