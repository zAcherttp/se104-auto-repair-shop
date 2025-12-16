/**
 * Mock data for payments/invoices functionality
 * Used in testing payment processing, data validation, and display logic
 */

import type { PaymentWithDetails } from "@/types";

export const mockPaymentData: PaymentWithDetails = {
  id: "payment-001",
  amount: 545.0,
  payment_method: "cash",
  payment_date: "2024-12-15",
  created_at: "2024-12-15T10:30:00.000Z",
  created_by: "user-001",
  vehicle_id: "vehicle-001",
  vehicle: {
    id: "vehicle-001",
    license_plate: "ABC-123",
    brand: "Toyota",
    customer_id: "customer-001",
    total_paid: 545.0,
    created_at: "2024-12-01T08:00:00.000Z",
    customer: {
      id: "customer-001",
      name: "John Doe",
      phone: "+1234567890",
      email: "john.doe@example.com",
      address: "123 Main Street",
      created_at: "2024-12-01T08:00:00.000Z",
    },
  },
  created_by_profile: {
    full_name: "Admin User",
    email: "admin@garage.com",
  },
};

export const mockPaymentDataCard: PaymentWithDetails = {
  id: "payment-002",
  amount: 850.5,
  payment_method: "card",
  payment_date: "2024-12-16",
  created_at: "2024-12-16T14:15:00.000Z",
  created_by: "user-002",
  vehicle_id: "vehicle-002",
  vehicle: {
    id: "vehicle-002",
    license_plate: "XYZ-789",
    brand: "Honda",
    customer_id: "customer-002",
    total_paid: 850.5,
    created_at: "2024-12-02T09:00:00.000Z",
    customer: {
      id: "customer-002",
      name: "Jane Smith",
      phone: "+1987654321",
      email: "jane.smith@example.com",
      address: "456 Oak Avenue",
      created_at: "2024-12-02T09:00:00.000Z",
    },
  },
  created_by_profile: {
    full_name: "Employee User",
    email: "employee@garage.com",
  },
};

export const mockPaymentDataTransfer: PaymentWithDetails = {
  id: "payment-003",
  amount: 1200.75,
  payment_method: "transfer",
  payment_date: "2024-12-17",
  created_at: "2024-12-17T16:45:00.000Z",
  created_by: "user-001",
  vehicle_id: "vehicle-003",
  vehicle: {
    id: "vehicle-003",
    license_plate: "DEF-456",
    brand: "Ford",
    customer_id: "customer-003",
    total_paid: 1200.75,
    created_at: "2024-12-03T10:00:00.000Z",
    customer: {
      id: "customer-003",
      name: "Mike Johnson",
      phone: "+1122334455",
      email: "mike.johnson@example.com",
      address: "789 Pine Street",
      created_at: "2024-12-03T10:00:00.000Z",
    },
  },
  created_by_profile: {
    full_name: "Admin User",
    email: "admin@garage.com",
  },
};

export const mockPaymentDataNoProfile: PaymentWithDetails = {
  id: "payment-004",
  amount: 325.0,
  payment_method: "cash",
  payment_date: "2024-12-14",
  created_at: "2024-12-14T11:20:00.000Z",
  created_by: "user-deleted",
  vehicle_id: "vehicle-004",
  vehicle: {
    id: "vehicle-004",
    license_plate: "GHI-789",
    brand: "Nissan",
    customer_id: "customer-004",
    total_paid: 325.0,
    created_at: "2024-12-04T11:00:00.000Z",
    customer: {
      id: "customer-004",
      name: "Sarah Wilson",
      phone: "+1555666777",
      email: "sarah.wilson@example.com",
      address: "321 Elm Drive",
      created_at: "2024-12-04T11:00:00.000Z",
    },
  },
  created_by_profile: undefined,
};

export const mockPaymentDataMissingInfo: PaymentWithDetails = {
  id: "payment-005",
  amount: 150.25,
  payment_method: "card",
  payment_date: null,
  created_at: "2024-12-13T13:30:00.000Z",
  created_by: "user-003",
  vehicle_id: "vehicle-005",
  vehicle: {
    id: "vehicle-005",
    license_plate: "JKL-012",
    brand: "BMW",
    customer_id: "customer-005",
    total_paid: 150.25,
    created_at: "2024-12-05T12:00:00.000Z",
    customer: {
      id: "customer-005",
      name: "Robert Brown",
      phone: null,
      email: "robert.brown@example.com",
      address: "654 Maple Lane",
      created_at: "2024-12-05T12:00:00.000Z",
    },
  },
  created_by_profile: {
    full_name: null,
    email: "noname@garage.com",
  },
};

export const mockPaymentsArray: PaymentWithDetails[] = [
  mockPaymentData,
  mockPaymentDataCard,
  mockPaymentDataTransfer,
  mockPaymentDataNoProfile,
  mockPaymentDataMissingInfo,
];

export const mockPaymentsArraySortedByDate: PaymentWithDetails[] = [
  mockPaymentDataTransfer, // 2024-12-17
  mockPaymentDataCard, // 2024-12-16
  mockPaymentData, // 2024-12-15
  mockPaymentDataNoProfile, // 2024-12-14
  mockPaymentDataMissingInfo, // null date
];

export const mockPaymentsArrayFilteredWeek: PaymentWithDetails[] = [
  mockPaymentDataTransfer,
  mockPaymentDataCard,
  mockPaymentData,
];

export const mockPaymentsArrayFilteredMonth: PaymentWithDetails[] = [
  mockPaymentData,
  mockPaymentDataCard,
  mockPaymentDataTransfer,
  mockPaymentDataNoProfile,
  mockPaymentDataMissingInfo,
];

export const mockPaymentsEmptyArray: PaymentWithDetails[] = [];

// Test data for edge cases
export const mockPaymentDataLargeAmount: PaymentWithDetails = {
  ...mockPaymentData,
  id: "payment-large",
  amount: 999999.99,
};

export const mockPaymentDataSmallAmount: PaymentWithDetails = {
  ...mockPaymentData,
  id: "payment-small",
  amount: 0.01,
};

export const mockPaymentDataZeroAmount: PaymentWithDetails = {
  ...mockPaymentData,
  id: "payment-zero",
  amount: 0,
};
