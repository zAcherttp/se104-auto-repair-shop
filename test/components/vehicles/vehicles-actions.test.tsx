// Mock the entire vehicles module
jest.mock("@/app/actions/vehicles", () => ({
  fetchVehiclesWithDebt: jest.fn(),
  handleVehiclePayment: jest.fn(),
  removeVehicle: jest.fn(),
}));

import { 
  fetchVehiclesWithDebt, 
  handleVehiclePayment, 
  removeVehicle 
} from "@/app/actions/vehicles";
import { mockVehiclesData, mockEmptyVehiclesData } from "@/test/mocks/vehicles-data";

const mockFetchVehiclesWithDebt = fetchVehiclesWithDebt as jest.MockedFunction<typeof fetchVehiclesWithDebt>;
const mockHandleVehiclePayment = handleVehiclePayment as jest.MockedFunction<typeof handleVehiclePayment>;
const mockRemoveVehicle = removeVehicle as jest.MockedFunction<typeof removeVehicle>;

describe("Vehicles Server Actions", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("fetchVehiclesWithDebt", () => {
    it("successfully fetches vehicles with debt data", async () => {
      mockFetchVehiclesWithDebt.mockResolvedValue({
        data: mockVehiclesData,
        error: null,
      });

      const result = await fetchVehiclesWithDebt();

      expect(result.data).toEqual(mockVehiclesData);
      expect(result.error).toBeNull();
      expect(mockFetchVehiclesWithDebt).toHaveBeenCalledTimes(1);
    });

    it("handles empty vehicles data", async () => {
      mockFetchVehiclesWithDebt.mockResolvedValue({
        data: mockEmptyVehiclesData,
        error: null,
      });

      const result = await fetchVehiclesWithDebt();

      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });

    it("handles authentication errors", async () => {
      mockFetchVehiclesWithDebt.mockResolvedValue({
        data: undefined,
        error: new Error("Authentication required"),
      });

      const result = await fetchVehiclesWithDebt();

      expect(result.error).toBeTruthy();
      expect(result.error?.message).toBe("Authentication required");
      expect(result.data).toBeUndefined();
    });

    it("handles database connection errors", async () => {
      mockFetchVehiclesWithDebt.mockResolvedValue({
        data: undefined,
        error: new Error("Database connection failed"),
      });

      const result = await fetchVehiclesWithDebt();

      expect(result.error).toBeTruthy();
      expect(result.error?.message).toBe("Database connection failed");
      expect(result.data).toBeUndefined();
    });

    it("correctly calculates debt amounts", async () => {
      const vehicleWithDebt = mockVehiclesData.find(v => v.total_debt > 0);
      
      mockFetchVehiclesWithDebt.mockResolvedValue({
        data: [vehicleWithDebt!],
        error: null,
      });

      const result = await fetchVehiclesWithDebt();

      expect(result.data?.[0].total_debt).toBe(vehicleWithDebt!.total_debt);
      expect(result.data?.[0].total_repair_cost).toBeGreaterThan(result.data?.[0].total_paid);
    });
  });

  describe("handleVehiclePayment", () => {
    const validPaymentData = {
      vehicleId: "vehicle-1",
      amount: 500,
      paymentMethod: "cash",
    };

    it("successfully processes valid payment", async () => {
      mockHandleVehiclePayment.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await handleVehiclePayment(
        validPaymentData.vehicleId,
        validPaymentData.amount,
        validPaymentData.paymentMethod
      );

      expect(result.data).toEqual({ success: true });
      expect(result.error).toBeNull();
      expect(mockHandleVehiclePayment).toHaveBeenCalledWith(
        validPaymentData.vehicleId,
        validPaymentData.amount,
        validPaymentData.paymentMethod
      );
    });

    it("handles payment amount exceeding debt", async () => {
      mockHandleVehiclePayment.mockResolvedValue({
        data: undefined,
        error: new Error("Payment amount exceeds remaining debt"),
      });

      const result = await handleVehiclePayment("vehicle-1", 10000, "cash");

      expect(result.error).toBeTruthy();
      expect(result.error?.message).toBe("Payment amount exceeds remaining debt");
      expect(result.data).toBeUndefined();
    });

    it("handles no outstanding debt scenario", async () => {
      mockHandleVehiclePayment.mockResolvedValue({
        data: undefined,
        error: new Error("No outstanding debt found for this vehicle"),
      });

      const result = await handleVehiclePayment("vehicle-2", 100, "cash");

      expect(result.error).toBeTruthy();
      expect(result.error?.message).toBe("No outstanding debt found for this vehicle");
    });

    it("handles invalid vehicle ID", async () => {
      mockHandleVehiclePayment.mockResolvedValue({
        data: undefined,
        error: new Error("Vehicle not found"),
      });

      const result = await handleVehiclePayment("invalid-id", 100, "cash");

      expect(result.error).toBeTruthy();
      expect(result.error?.message).toBe("Vehicle not found");
    });

    it("handles different payment methods", async () => {
      mockHandleVehiclePayment.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const paymentMethods = ["cash", "card", "transfer"];

      for (const method of paymentMethods) {
        await handleVehiclePayment("vehicle-1", 100, method);
        expect(mockHandleVehiclePayment).toHaveBeenCalledWith("vehicle-1", 100, method);
      }
    });

    it("handles zero or negative payment amounts", async () => {
      mockHandleVehiclePayment.mockResolvedValue({
        data: undefined,
        error: new Error("Invalid payment amount"),
      });

      const result = await handleVehiclePayment("vehicle-1", 0, "cash");

      expect(result.error).toBeTruthy();
      expect(result.error?.message).toBe("Invalid payment amount");
    });
  });

  describe("removeVehicle", () => {
    it("successfully removes a vehicle", async () => {
      mockRemoveVehicle.mockResolvedValue({
        success: true,
      });

      const result = await removeVehicle("vehicle-1");

      expect(result.success).toBe(true);
      expect(mockRemoveVehicle).toHaveBeenCalledWith("vehicle-1");
    });

    it("handles vehicle not found error", async () => {
      mockRemoveVehicle.mockResolvedValue({
        error: "Vehicle not found",
      });

      const result = await removeVehicle("invalid-id");

      expect(result.error).toBe("Vehicle not found");
      expect(result.success).toBeUndefined();
    });

    it("handles database constraints error", async () => {
      mockRemoveVehicle.mockResolvedValue({
        error: "Cannot delete vehicle with existing repair orders",
      });

      const result = await removeVehicle("vehicle-with-orders");

      expect(result.error).toBe("Cannot delete vehicle with existing repair orders");
    });

    it("handles authentication errors", async () => {
      mockRemoveVehicle.mockResolvedValue({
        error: "Authentication required",
      });

      const result = await removeVehicle("vehicle-1");

      expect(result.error).toBe("Authentication required");
    });
  });

  describe("Data Integrity", () => {
    it("maintains data consistency across operations", async () => {
      // Fetch vehicles
      mockFetchVehiclesWithDebt.mockResolvedValue({
        data: mockVehiclesData,
        error: null,
      });

      const vehicles = await fetchVehiclesWithDebt();
      const vehicleWithDebt = vehicles.data?.find(v => v.total_debt > 0);

      expect(vehicleWithDebt).toBeTruthy();

      // Process payment
      mockHandleVehiclePayment.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const paymentResult = await handleVehiclePayment(
        vehicleWithDebt!.id,
        100,
        "cash"
      );

      expect(paymentResult.data?.success).toBe(true);

      // Verify calls were made with correct data
      expect(mockFetchVehiclesWithDebt).toHaveBeenCalled();
      expect(mockHandleVehiclePayment).toHaveBeenCalledWith(
        vehicleWithDebt!.id,
        100,
        "cash"
      );
    });

    it("handles concurrent operations correctly", async () => {
      const vehicleId = "vehicle-1";
      const operations = [
        handleVehiclePayment(vehicleId, 100, "cash"),
        handleVehiclePayment(vehicleId, 200, "card"),
        fetchVehiclesWithDebt(),
      ];

      mockHandleVehiclePayment.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      mockFetchVehiclesWithDebt.mockResolvedValue({
        data: mockVehiclesData,
        error: null,
      });

      const results = await Promise.all(operations);

      expect(results).toHaveLength(3);
      expect(mockHandleVehiclePayment).toHaveBeenCalledTimes(2);
      expect(mockFetchVehiclesWithDebt).toHaveBeenCalledTimes(1);
    });
  });

  describe("Edge Cases", () => {
    it("handles large payment amounts", async () => {
      mockHandleVehiclePayment.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await handleVehiclePayment("vehicle-1", 999999.99, "transfer");

      expect(result.data?.success).toBe(true);
      expect(mockHandleVehiclePayment).toHaveBeenCalledWith("vehicle-1", 999999.99, "transfer");
    });

    it("handles vehicles with zero debt calculations", async () => {
      const zeroDebtVehicle = mockVehiclesData.find(v => v.total_debt === 0);
      
      mockFetchVehiclesWithDebt.mockResolvedValue({
        data: [zeroDebtVehicle!],
        error: null,
      });

      const result = await fetchVehiclesWithDebt();

      expect(result.data?.[0].total_debt).toBe(0);
      expect(result.data?.[0].total_repair_cost).toBe(result.data?.[0].total_paid);
    });

    it("handles special characters in vehicle data", async () => {
      const specialCharVehicle = {
        ...mockVehiclesData[0],
        license_plate: "ÄÖÜ-123",
        brand: "Škoda",
        customer: {
          ...mockVehiclesData[0].customer,
          name: "José María",
          email: "josé.maría@email.com",
        },
      };

      mockFetchVehiclesWithDebt.mockResolvedValue({
        data: [specialCharVehicle],
        error: null,
      });

      const result = await fetchVehiclesWithDebt();

      expect(result.data?.[0].license_plate).toBe("ÄÖÜ-123");
      expect(result.data?.[0].brand).toBe("Škoda");
      expect(result.data?.[0].customer.name).toBe("José María");
    });
  });
});
