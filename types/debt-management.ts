export interface VehicleDebt {
  vehicle: {
    id: string;
    license_plate: string;
    brand: string;
    customer: {
      id: string;
      name: string;
      phone: string | null;
      email: string | null;
    };
  };
  repair_orders: Array<{
    id: string;
    total_amount: number;
    status: string;
    reception_date: string | null;
    created_at: string;
  }>;
  payments: Array<{
    id: string;
    amount: number;
    payment_method: string;
    created_at: string;
  }>;
  total_debt: number;
  total_paid: number;
  remaining_debt: number;
}

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};
