import type {
  Customer,
  LaborType,
  OrderDataProps,
  Payment,
  RepairOrderItemWithDetails,
  RepairOrderWithItemsDetails,
  SparePart,
  Vehicle,
} from "@/types";

// Mock spare parts
export const mockSpareParts: SparePart[] = [
  {
    id: "part-1",
    name: "Brake Pads",
    price: 150.0,
    stock_quantity: 10,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "part-2",
    name: "Oil Filter",
    price: 25.0,
    stock_quantity: 20,
    created_at: "2024-01-01T00:00:00Z",
  },
];

// Mock labor types
export const mockLaborTypes: LaborType[] = [
  {
    id: "labor-1",
    name: "Brake Service",
    cost: 80.0,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "labor-2",
    name: "Oil Change",
    cost: 60.0,
    created_at: "2024-01-01T00:00:00Z",
  },
];

// Mock customer
export const mockCustomer: Customer = {
  id: "customer-1",
  name: "John Doe",
  phone: "1234567890",
  email: "john.doe@example.com",
  address: "123 Main St, City, State",
  created_at: "2024-01-01T00:00:00Z",
};

// Mock payments
export const mockPayments: Payment[] = [
  {
    id: "payment-1",
    vehicle_id: "vehicle-1",
    amount: 200.0,
    payment_method: "cash",
    payment_date: "2024-01-15T00:00:00Z",
    created_by: "user-1",
    created_at: "2024-01-15T00:00:00Z",
  },
  {
    id: "payment-2",
    vehicle_id: "vehicle-1",
    amount: 150.0,
    payment_method: "card",
    payment_date: "2024-01-20T00:00:00Z",
    created_by: "user-1",
    created_at: "2024-01-20T00:00:00Z",
  },
];

// Mock vehicle
export const mockVehicle: Vehicle & { payments: Payment[] } = {
  id: "vehicle-1",
  license_plate: "ABC-123",
  brand: "Toyota",
  customer_id: "customer-1",
  total_paid: null,
  created_at: "2024-01-01T00:00:00Z",
  payments: mockPayments,
};

// Mock repair order items with details
export const mockRepairOrderItems: RepairOrderItemWithDetails[] = [
  {
    id: "item-1",
    repair_order_id: "order-1",
    description: "Replace brake pads",
    spare_part_id: "part-1",
    labor_type_id: "labor-1",
    quantity: 2,
    unit_price: 150.0,
    labor_cost: 160.0,
    total_amount: 460.0, // (150 * 2) + 160
    assigned_to: null,
    created_at: "2024-01-10T00:00:00Z",
    updated_at: "2024-01-10T00:00:00Z",
    spare_part: mockSpareParts[0],
    labor_type: mockLaborTypes[0],
  },
  {
    id: "item-2",
    repair_order_id: "order-1",
    description: "Oil change service",
    spare_part_id: "part-2",
    labor_type_id: "labor-2",
    quantity: 1,
    unit_price: 25.0,
    labor_cost: 60.0,
    total_amount: 85.0, // 25 + 60
    assigned_to: null,
    created_at: "2024-01-10T00:00:00Z",
    updated_at: "2024-01-10T00:00:00Z",
    spare_part: mockSpareParts[1],
    labor_type: mockLaborTypes[1],
  },
];

// Mock repair orders with items
export const mockRepairOrders: RepairOrderWithItemsDetails[] = [
  {
    id: "order-1",
    vehicle_id: "vehicle-1",
    status: "completed",
    reception_date: "2024-01-10T00:00:00Z",
    completion_date: "2024-01-12T00:00:00Z",
    notes: "Regular maintenance service",
    total_amount: 545.0, // 460 + 85
    created_by: "user-1",
    created_at: "2024-01-10T00:00:00Z",
    updated_at: "2024-01-12T00:00:00Z",
    repair_order_items: mockRepairOrderItems,
  },
];

// Mock order data for track-order component
export const mockOrderData: OrderDataProps = {
  vehicle: mockVehicle,
  customer: mockCustomer,
  RepairOrderWithItemsDetails: mockRepairOrders,
};

// Mock order data with multiple repair orders
export const mockOrderDataMultipleOrders: OrderDataProps = {
  vehicle: mockVehicle,
  customer: mockCustomer,
  RepairOrderWithItemsDetails: [
    ...mockRepairOrders,
    {
      id: "order-2",
      vehicle_id: "vehicle-1",
      status: "in_progress",
      reception_date: "2024-01-20T00:00:00Z",
      completion_date: null,
      notes: "Engine diagnostics",
      total_amount: 300.0,
      created_by: "user-1",
      created_at: "2024-01-20T00:00:00Z",
      updated_at: "2024-01-20T00:00:00Z",
      repair_order_items: [],
    },
  ],
};

// Mock order data with no repair orders
export const mockOrderDataNoOrders: OrderDataProps = {
  vehicle: mockVehicle,
  customer: mockCustomer,
  RepairOrderWithItemsDetails: [],
};

// Mock order data with overpayment scenario
export const mockOrderDataOverpaid: OrderDataProps = {
  vehicle: {
    ...mockVehicle,
    payments: [
      ...mockPayments,
      {
        id: "payment-3",
        vehicle_id: "vehicle-1",
        amount: 300.0,
        payment_method: "cash",
        payment_date: "2024-01-25T00:00:00Z",
        created_by: "user-1",
        created_at: "2024-01-25T00:00:00Z",
      },
    ],
  },
  customer: mockCustomer,
  RepairOrderWithItemsDetails: mockRepairOrders,
};

// Mock order data with outstanding debt
export const mockOrderDataWithDebt: OrderDataProps = {
  vehicle: {
    ...mockVehicle,
    payments: [mockPayments[0]], // Only one payment of 200, total cost is 545
  },
  customer: mockCustomer,
  RepairOrderWithItemsDetails: mockRepairOrders,
};

// Mock order data with exact payment
export const mockOrderDataPaidInFull: OrderDataProps = {
  vehicle: {
    ...mockVehicle,
    payments: [
      {
        id: "payment-full",
        vehicle_id: "vehicle-1",
        amount: 545.0,
        payment_method: "card",
        payment_date: "2024-01-15T00:00:00Z",
        created_by: "user-1",
        created_at: "2024-01-15T00:00:00Z",
      },
    ],
  },
  customer: mockCustomer,
  RepairOrderWithItemsDetails: mockRepairOrders,
};

// Mock Supabase responses
export const mockSupabaseVehicleResponse = {
  data: {
    ...mockVehicle,
    customer: mockCustomer,
    payments: mockPayments,
  },
  error: null,
};

export const mockSupabaseRepairOrdersResponse = {
  data: mockRepairOrders,
  error: null,
};

export const mockSupabaseVehicleNotFoundResponse = {
  data: null,
  error: { message: "Vehicle not found" },
};

export const mockSupabaseErrorResponse = {
  data: null,
  error: { message: "Database connection failed" },
};
