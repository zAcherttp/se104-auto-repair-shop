export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface Employee {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface SparePart {
  id: string;
  name: string;
  price: number;
  stock_quantity: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface LaborType {
  id: string;
  name: string;
  cost: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface GarageInfo {
  garageName: string;
  phoneNumber: string;
  emailAddress: string;
  address: string;
  bannerImageUrl: string;
  logoImageUrl: string;
  logoPosition: "left" | "right" | "none";
}
