import { VehicleWithDebt } from "@/types/types";

export const mockVehiclesData: VehicleWithDebt[] = [
  {
    id: "vehicle-1",
    license_plate: "ABC123",
    brand: "Toyota",
    customer: {
      id: "customer-1",
      name: "John Doe",
      phone: "123-456-7890",
      email: "john.doe@email.com",
      address: "123 Main St, City, State 12345",
    },
    total_repair_cost: 1500.00,
    total_paid: 750.00,
    total_debt: 750.00,
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "vehicle-2",
    license_plate: "XYZ789",
    brand: "Honda",
    customer: {
      id: "customer-2",
      name: "Jane Smith",
      phone: "098-765-4321",
      email: "jane.smith@email.com",
      address: "456 Oak Ave, Town, State 67890",
    },
    total_repair_cost: 800.00,
    total_paid: 800.00,
    total_debt: 0.00,
    created_at: "2024-01-16T11:00:00Z",
  },
  {
    id: "vehicle-3",
    license_plate: "DEF456",
    brand: "Ford",
    customer: {
      id: "customer-3",
      name: "Bob Johnson",
      phone: "555-123-4567",
      email: null,
      address: "789 Pine Rd, Village, State 54321",
    },
    total_repair_cost: 2200.00,
    total_paid: 1000.00,
    total_debt: 1200.00,
    created_at: "2024-01-17T09:30:00Z",
  },
  {
    id: "vehicle-4",
    license_plate: "GHI789",
    brand: "Chevrolet",
    customer: {
      id: "customer-4",
      name: "Alice Brown",
      phone: null,
      email: "alice.brown@email.com",
      address: null,
    },
    total_repair_cost: 0.00,
    total_paid: 0.00,
    total_debt: 0.00,
    created_at: "2024-01-18T14:15:00Z",
  },
];

export const mockEmptyVehiclesData: VehicleWithDebt[] = [];

export const mockLargeVehiclesDataset = Array.from({ length: 100 }, (_, i) => ({
  id: `vehicle-${i + 1}`,
  license_plate: `TEST${String(i + 1).padStart(3, '0')}`,
  brand: ["Toyota", "Honda", "Ford", "Chevrolet", "Nissan"][i % 5],
  customer: {
    id: `customer-${i + 1}`,
    name: `Customer ${i + 1}`,
    phone: `555-${String(i + 1).padStart(4, '0')}`,
    email: `customer${i + 1}@email.com`,
    address: `${i + 1} Test St, Test City, State ${String(i + 1).padStart(5, '0')}`,
  },
  total_repair_cost: (i + 1) * 100,
  total_paid: (i + 1) * 50,
  total_debt: (i + 1) * 50,
  created_at: new Date(2024, 0, (i % 30) + 1).toISOString(),
}));

export const mockVehicleWithHighDebt: VehicleWithDebt = {
  id: "vehicle-high-debt",
  license_plate: "DEBT999",
  brand: "BMW",
  customer: {
    id: "customer-high-debt",
    name: "High Debt Customer",
    phone: "999-888-7777",
    email: "highdebt@email.com",
    address: "999 High St, Debt City, State 99999",
  },
  total_repair_cost: 10000.00,
  total_paid: 1000.00,
  total_debt: 9000.00,
  created_at: "2024-01-01T00:00:00Z",
};

export const mockVehicleWithNoDebt: VehicleWithDebt = {
  id: "vehicle-no-debt",
  license_plate: "PAID000",
  brand: "Mercedes",
  customer: {
    id: "customer-no-debt",
    name: "Paid Customer",
    phone: "000-111-2222",
    email: "paid@email.com",
    address: "000 Paid St, Clear City, State 00000",
  },
  total_repair_cost: 2000.00,
  total_paid: 2000.00,
  total_debt: 0.00,
  created_at: "2024-01-20T12:00:00Z",
};
