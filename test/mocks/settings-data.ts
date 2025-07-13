/**
 * Mock data for settings functionality
 * Used in testing employee management, garage settings, and data validation
 */

import type { Employee, SystemSetting, SparePart, LaborType } from "@/types/settings";

export const mockEmployee: Employee = {
  id: "emp-001",
  email: "john.doe@garage.com",
  full_name: "John Doe",
  role: "mechanic",
  created_at: "2024-12-01T08:00:00.000Z",
  updated_at: "2024-12-01T08:00:00.000Z",
};

export const mockEmployeeAdmin: Employee = {
  id: "emp-002",
  email: "admin@garage.com",
  full_name: "Admin User",
  role: "admin",
  created_at: "2024-12-01T08:00:00.000Z",
  updated_at: "2024-12-01T08:00:00.000Z",
};

export const mockEmployeesArray: Employee[] = [
  mockEmployee,
  mockEmployeeAdmin,
  {
    id: "emp-003",
    email: "jane.smith@garage.com",
    full_name: "Jane Smith",
    role: "service_advisor",
    created_at: "2024-12-02T09:00:00.000Z",
    updated_at: "2024-12-02T09:00:00.000Z",
  },
];

export const mockEmployeesEmptyArray: Employee[] = [];

export const mockSystemSetting: SystemSetting = {
  id: "setting-001",
  setting_key: "garage_name",
  setting_value: "Best Auto Repair",
  created_at: "2024-12-01T08:00:00.000Z",
  updated_at: "2024-12-01T08:00:00.000Z",
};

export const mockSystemSettingsArray: SystemSetting[] = [
  mockSystemSetting,
  {
    id: "setting-002",
    setting_key: "phone_number",
    setting_value: "+1234567890",
    created_at: "2024-12-01T08:00:00.000Z",
    updated_at: "2024-12-01T08:00:00.000Z",
  },
  {
    id: "setting-003",
    setting_key: "email_address",
    setting_value: "contact@bestrepair.com",
    created_at: "2024-12-01T08:00:00.000Z",
    updated_at: "2024-12-01T08:00:00.000Z",
  },
  {
    id: "setting-004",
    setting_key: "address",
    setting_value: "123 Main Street, City, State",
    created_at: "2024-12-01T08:00:00.000Z",
    updated_at: "2024-12-01T08:00:00.000Z",
  },
  {
    id: "setting-005",
    setting_key: "maximum_car_capacity",
    setting_value: "50",
    created_at: "2024-12-01T08:00:00.000Z",
    updated_at: "2024-12-01T08:00:00.000Z",
  },
  {
    id: "setting-006",
    setting_key: "max_parts_per_month",
    setting_value: "1000",
    created_at: "2024-12-01T08:00:00.000Z",
    updated_at: "2024-12-01T08:00:00.000Z",
  },
  {
    id: "setting-007",
    setting_key: "max_labor_types_per_month",
    setting_value: "100",
    created_at: "2024-12-01T08:00:00.000Z",
    updated_at: "2024-12-01T08:00:00.000Z",
  },
];

export const mockSparePart: SparePart = {
  id: "part-001",
  name: "Oil Filter",
  price: 25.99,
  stock_quantity: 100,
  created_at: "2024-12-01T08:00:00.000Z",
  updated_at: "2024-12-01T08:00:00.000Z",
};

export const mockSparePartsArray: SparePart[] = [
  mockSparePart,
  {
    id: "part-002",
    name: "Brake Pads",
    price: 89.99,
    stock_quantity: 50,
    created_at: "2024-12-01T08:00:00.000Z",
    updated_at: "2024-12-01T08:00:00.000Z",
  },
  {
    id: "part-003",
    name: "Air Filter",
    price: 15.50,
    stock_quantity: 75,
    created_at: "2024-12-01T08:00:00.000Z",
    updated_at: "2024-12-01T08:00:00.000Z",
  },
];

export const mockLaborType: LaborType = {
  id: "labor-001",
  name: "Oil Change",
  cost: 50.00,
  created_at: "2024-12-01T08:00:00.000Z",
  updated_at: "2024-12-01T08:00:00.000Z",
};

export const mockLaborTypesArray: LaborType[] = [
  mockLaborType,
  {
    id: "labor-002",
    name: "Brake Service",
    cost: 150.00,
    created_at: "2024-12-01T08:00:00.000Z",
    updated_at: "2024-12-01T08:00:00.000Z",
  },
  {
    id: "labor-003",
    name: "Engine Diagnostic",
    cost: 100.00,
    created_at: "2024-12-01T08:00:00.000Z",
    updated_at: "2024-12-01T08:00:00.000Z",
  },
];

export const mockEmptySparePartsArray: SparePart[] = [];
export const mockEmptyLaborTypesArray: LaborType[] = [];

// Mock API responses
export const mockSuccessResponse = {
  success: true,
  data: mockEmployee,
};

export const mockErrorResponse = {
  success: false,
  error: "Failed to process request",
};

export const mockEmployeesSuccessResponse = {
  success: true,
  data: mockEmployeesArray,
};

export const mockSystemSettingsSuccessResponse = {
  success: true,
  data: mockSystemSettingsArray,
};

export const mockSparePartsSuccessResponse = {
  success: true,
  data: mockSparePartsArray,
};

export const mockLaborTypesSuccessResponse = {
  success: true,
  data: mockLaborTypesArray,
};

// Mock garage info response
export const mockGarageInfoData = {
  garageName: "Best Auto Repair",
  phoneNumber: "+1234567890",
  emailAddress: "contact@bestrepair.com",
  address: "123 Main Street, City, State",
};

export const mockGarageInfoSuccessResponse = {
  success: true,
  data: mockGarageInfoData,
};
