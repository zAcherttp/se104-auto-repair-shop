export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          address: string | null;
          created_at: string | null;
          email: string | null;
          id: string;
          name: string;
          phone: string | null;
        };
        Insert: {
          address?: string | null;
          created_at?: string | null;
          email?: string | null;
          id?: string;
          name: string;
          phone?: string | null;
        };
        Update: {
          address?: string | null;
          created_at?: string | null;
          email?: string | null;
          id?: string;
          name?: string;
          phone?: string | null;
        };
        Relationships: [];
      };
      labor_types: {
        Row: {
          cost: number;
          created_at: string | null;
          id: string;
          name: string;
        };
        Insert: {
          cost: number;
          created_at?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          cost?: number;
          created_at?: string | null;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          amount: number;
          created_at: string | null;
          created_by: string | null;
          id: string;
          payment_date: string | null;
          payment_method: string;
          vehicle_id: string | null;
        };
        Insert: {
          amount: number;
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          payment_date?: string | null;
          payment_method?: string;
          vehicle_id?: string | null;
        };
        Update: {
          amount?: number;
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          payment_date?: string | null;
          payment_method?: string;
          vehicle_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "payments_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_vehicle_id_fkey";
            columns: ["vehicle_id"];
            isOneToOne: false;
            referencedRelation: "vehicles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string | null;
          email: string;
          full_name: string | null;
          id: string;
          role: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          full_name?: string | null;
          id: string;
          role: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          full_name?: string | null;
          id?: string;
          role?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      repair_order_items: {
        Row: {
          assigned_to: string | null;
          created_at: string | null;
          description: string;
          id: string;
          labor_cost: number | null;
          labor_type_id: string | null;
          quantity: number | null;
          repair_order_id: string | null;
          spare_part_id: string | null;
          total_amount: number;
          unit_price: number | null;
          updated_at: string | null;
        };
        Insert: {
          assigned_to?: string | null;
          created_at?: string | null;
          description: string;
          id?: string;
          labor_cost?: number | null;
          labor_type_id?: string | null;
          quantity?: number | null;
          repair_order_id?: string | null;
          spare_part_id?: string | null;
          total_amount: number;
          unit_price?: number | null;
          updated_at?: string | null;
        };
        Update: {
          assigned_to?: string | null;
          created_at?: string | null;
          description?: string;
          id?: string;
          labor_cost?: number | null;
          labor_type_id?: string | null;
          quantity?: number | null;
          repair_order_id?: string | null;
          spare_part_id?: string | null;
          total_amount?: number;
          unit_price?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "repair_order_items_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "repair_order_items_labor_type_id_fkey";
            columns: ["labor_type_id"];
            isOneToOne: false;
            referencedRelation: "labor_types";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "repair_order_items_repair_order_id_fkey";
            columns: ["repair_order_id"];
            isOneToOne: false;
            referencedRelation: "repair_orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "repair_order_items_spare_part_id_fkey";
            columns: ["spare_part_id"];
            isOneToOne: false;
            referencedRelation: "spare_parts";
            referencedColumns: ["id"];
          },
        ];
      };
      repair_orders: {
        Row: {
          completion_date: string | null;
          created_at: string | null;
          created_by: string | null;
          id: string;
          notes: string | null;
          reception_date: string;
          status: string;
          total_amount: number | null;
          updated_at: string | null;
          vehicle_id: string | null;
        };
        Insert: {
          completion_date?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          notes?: string | null;
          reception_date?: string;
          status?: string;
          total_amount?: number | null;
          updated_at?: string | null;
          vehicle_id?: string | null;
        };
        Update: {
          completion_date?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          notes?: string | null;
          reception_date?: string;
          status?: string;
          total_amount?: number | null;
          updated_at?: string | null;
          vehicle_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "repair_orders_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "repair_orders_vehicle_id_fkey";
            columns: ["vehicle_id"];
            isOneToOne: false;
            referencedRelation: "vehicles";
            referencedColumns: ["id"];
          },
        ];
      };
      spare_parts: {
        Row: {
          created_at: string | null;
          id: string;
          name: string;
          price: number;
          stock_quantity: number | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          name: string;
          price: number;
          stock_quantity?: number | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          name?: string;
          price?: number;
          stock_quantity?: number | null;
        };
        Relationships: [];
      };
      system_settings: {
        Row: {
          created_at: string | null;
          id: string;
          setting_key: string;
          setting_value: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          setting_key: string;
          setting_value: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          setting_key?: string;
          setting_value?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      vehicles: {
        Row: {
          brand: string;
          created_at: string | null;
          customer_id: string | null;
          id: string;
          license_plate: string;
          total_paid: number | null;
        };
        Insert: {
          brand: string;
          created_at?: string | null;
          customer_id?: string | null;
          id?: string;
          license_plate: string;
          total_paid?: number | null;
        };
        Update: {
          brand?: string;
          created_at?: string | null;
          customer_id?: string | null;
          id?: string;
          license_plate?: string;
          total_paid?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "vehicles_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: { user_id: string };
        Returns: boolean;
      };
      is_staff: {
        Args: { user_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      payment_method: "cash" | "transfer" | "card";
      repair_order_status: "pending" | "in_progress" | "completed";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
