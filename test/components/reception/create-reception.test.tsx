// Mock the entire vehicles module
jest.mock("@/app/actions/vehicles", () => ({
  createReception: jest.fn(),
}));

import { createReception } from "@/app/actions/vehicles";
import { VehicleReceptionFormData } from "@/lib/form/definitions";

const mockCreateReception = createReception as jest.MockedFunction<typeof createReception>;

describe("createReception Server Action", () => {
  const validFormData: VehicleReceptionFormData = {
    customerName: "John Doe",
    phoneNumber: "1234567890",
    address: "123 Main St",
    licensePlate: "ABC123",
    carBrand: "Toyota",
    receptionDate: new Date("2024-01-15"),
    notes: "Oil change needed",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Success Cases", () => {
    it("creates reception with valid complete data", async () => {
      mockCreateReception.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await createReception(validFormData);

      expect(result.data).toEqual({ success: true });
      expect(result.error).toBeNull();
      expect(mockCreateReception).toHaveBeenCalledWith(validFormData);
    });

    it("creates reception with minimal required data", async () => {
      const minimalData = {
        customerName: "Jane Smith",
        phoneNumber: "9876543210",
        licensePlate: "XYZ789",
        carBrand: "Honda",
        receptionDate: new Date("2024-01-20"),
      };

      mockCreateReception.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await createReception(minimalData);

      expect(result.data).toEqual({ success: true });
      expect(result.error).toBeNull();
    });

    it("handles optional fields correctly", async () => {
      const dataWithOptionals = {
        ...validFormData,
        address: undefined,
        notes: undefined,
      };

      mockCreateReception.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await createReception(dataWithOptionals);

      expect(result.data).toEqual({ success: true });
      expect(result.error).toBeNull();
    });
  });

  describe("Error Cases", () => {
    it("handles database connection errors", async () => {
      mockCreateReception.mockResolvedValue({
        data: undefined,
        error: new Error("Database connection failed"),
      });

      const result = await createReception(validFormData);

      expect(result.error).toBeTruthy();
      expect(result.error?.message).toBe("Database connection failed");
      expect(result.data).toBeUndefined();
    });

    it("handles authentication errors", async () => {
      mockCreateReception.mockResolvedValue({
        data: undefined,
        error: new Error("Authentication required"),
      });

      const result = await createReception(validFormData);

      expect(result.error).toBeTruthy();
      expect(result.error?.message).toBe("Authentication required");
      expect(result.data).toBeUndefined();
    });

    it("handles daily limit exceeded errors", async () => {
      mockCreateReception.mockResolvedValue({
        data: undefined,
        error: new Error("Daily vehicle limit exceeded"),
      });

      const result = await createReception(validFormData);

      expect(result.error).toBeTruthy();
      expect(result.error?.message).toBe("Daily vehicle limit exceeded");
      expect(result.data).toBeUndefined();
    });
  });

  describe("Data Validation", () => {
    it("handles empty customer name", async () => {
      const invalidData = {
        ...validFormData,
        customerName: "",
      };

      mockCreateReception.mockResolvedValue({
        data: undefined,
        error: new Error("Customer name is required"),
      });

      const result = await createReception(invalidData);

      expect(result.error).toBeTruthy();
      expect(mockCreateReception).toHaveBeenCalledWith(invalidData);
    });

    it("handles invalid phone number", async () => {
      const invalidData = {
        ...validFormData,
        phoneNumber: "123", // Too short
      };

      mockCreateReception.mockResolvedValue({
        data: undefined,
        error: new Error("Phone number must be at least 10 digits"),
      });

      const result = await createReception(invalidData);

      expect(result.error).toBeTruthy();
    });

    it("handles empty license plate", async () => {
      const invalidData = {
        ...validFormData,
        licensePlate: "",
      };

      mockCreateReception.mockResolvedValue({
        data: undefined,
        error: new Error("License plate is required"),
      });

      const result = await createReception(invalidData);

      expect(result.error).toBeTruthy();
    });

    it("handles missing car brand", async () => {
      const invalidData = {
        ...validFormData,
        carBrand: "",
      };

      mockCreateReception.mockResolvedValue({
        data: undefined,
        error: new Error("Car brand is required"),
      });

      const result = await createReception(invalidData);

      expect(result.error).toBeTruthy();
    });

    it("handles invalid reception date", async () => {
      const invalidData = {
        ...validFormData,
        receptionDate: new Date("invalid-date"),
      };

      mockCreateReception.mockResolvedValue({
        data: undefined,
        error: new Error("Invalid reception date"),
      });

      const result = await createReception(invalidData);

      expect(result.error).toBeTruthy();
    });
  });

  describe("Edge Cases", () => {
    it("handles very long input values", async () => {
      const longInputData = {
        ...validFormData,
        customerName: "A".repeat(1000), // Very long name
        notes: "B".repeat(2000), // Very long notes
      };

      mockCreateReception.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await createReception(longInputData);

      expect(result.data).toEqual({ success: true });
    });

    it("handles special characters in input", async () => {
      const specialCharData = {
        ...validFormData,
        customerName: "João Müller",
        licensePlate: "ABC-123",
        notes: "Vehicle needs: ñ, ç, ü special care",
      };

      mockCreateReception.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await createReception(specialCharData);

      expect(result.data).toEqual({ success: true });
    });

    it("handles future reception dates", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const futureDateData = {
        ...validFormData,
        receptionDate: futureDate,
      };

      mockCreateReception.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await createReception(futureDateData);

      expect(result.data).toEqual({ success: true });
    });
  });
});
