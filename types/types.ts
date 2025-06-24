import { Tables } from "@/supabase/types";

export type ApiResponse<T> = {
  error: Error | null;
  data?: T;
  totalCount?: number;
};

export type Customer = Tables<"customers">;
export type Vehicle = Tables<"vehicles">;
export type RepairOrder = Tables<"repair_orders">;
export type RepairOrderItem = Tables<"repair_order_items">;
export type SparePart = Tables<"spare_parts">;
export type LaborType = Tables<"labor_types">;
export type Payment = Tables<"payments">;
export type GarageSettings = Tables<"system_settings">;

export type RepairOrderStatus =
  | "pending"
  | "in-progress"
  | "completed"
  | "cancelled";

export type RepairOrderWithItemsDetails = RepairOrder & {
  repair_order_items: RepairOrderItemWithDetails[];
};

export type RepairOrderItemWithDetails = RepairOrderItem & {
  spare_part: SparePart;
  labor_type: LaborType;
};

export type RepairOrderWithVehicleDetails = RepairOrder & {
  vehicle: Vehicle & {
    customer: Customer;
  };
};

export type OrderDataProps = {
  vehicle: Vehicle;
  customer: Customer;
  RepairOrderWithItemsDetails: RepairOrderWithItemsDetails[];
};

export type VehicleWithDetails = Vehicle & {
  customer: Customer;
  repair_orders: RepairOrder[];
};
