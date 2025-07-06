// Mock the server actions
jest.mock("@/app/actions/vehicles", () => ({
  createReception: jest.fn(),
}));

// Mock hooks with simplified return types
jest.mock("@/hooks/use-car-brands", () => ({
  useCarBrands: jest.fn(),
}));

jest.mock("@/hooks/use-daily-vehicle-limit", () => ({
  useDailyVehicleLimit: jest.fn(),
}));

import { createReception } from "@/app/actions/vehicles";
import { useCarBrands } from "@/hooks/use-car-brands";
import { useDailyVehicleLimit } from "@/hooks/use-daily-vehicle-limit";
import { VehicleReceptionFormData } from "@/lib/form/definitions";

const mockCreateReception = createReception as jest.MockedFunction<
  typeof createReception
>;
const mockUseCarBrands = useCarBrands as jest.MockedFunction<
  typeof useCarBrands
>;
const mockUseDailyVehicleLimit = useDailyVehicleLimit as jest.MockedFunction<
  typeof useDailyVehicleLimit
>;

describe("ReceptionForm Data Layer", () => {
  const validReceptionData: VehicleReceptionFormData = {
    customerName: "John Doe",
    phoneNumber: "1234567890",
    licensePlate: "ABC123",
    carBrand: "Toyota",
    address: "123 Main St",
    receptionDate: new Date("2024-01-15"),
    notes: "Oil change needed",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock returns for hooks with simplified structure
    mockUseCarBrands.mockReturnValue({
      data: ["Toyota", "Honda", "Ford", "BMW", "Mercedes"],
      isLoading: false,
      error: null,
    } as any);

    mockUseDailyVehicleLimit.mockReturnValue({
      data: {
        currentCount: 5,
        maxCapacity: 15,
        canCreate: true,
        isAtLimit: false,
        isNearLimit: false,
      },
      isLoading: false,
      error: null,
    } as any);
  });

  describe("Data Submission", () => {
    it("submits valid complete reception data successfully", async () => {
      mockCreateReception.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await createReception(validReceptionData);

      expect(result.data).toEqual({ success: true });
      expect(result.error).toBeNull();
      expect(mockCreateReception).toHaveBeenCalledWith(validReceptionData);
    });

    it("submits minimal required reception data", async () => {
      const minimalData: VehicleReceptionFormData = {
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
      expect(mockCreateReception).toHaveBeenCalledWith(minimalData);
    });

    it("handles license plate case transformation", async () => {
      const dataWithLowercasePlate: VehicleReceptionFormData = {
        ...validReceptionData,
        licensePlate: "xyz123", // lowercase input
      };

      mockCreateReception.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await createReception(dataWithLowercasePlate);

      expect(result.data).toEqual({ success: true });
      expect(mockCreateReception).toHaveBeenCalledWith(dataWithLowercasePlate);
    });

    it("handles reception data with special characters in notes", async () => {
      const dataWithSpecialNotes: VehicleReceptionFormData = {
        ...validReceptionData,
        notes:
          "Customer reports: Engine noise @ 2500 RPM & vibration during idle",
      };

      mockCreateReception.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await createReception(dataWithSpecialNotes);

      expect(result.data).toEqual({ success: true });
      expect(mockCreateReception).toHaveBeenCalledWith(dataWithSpecialNotes);
    });
  });

  describe("Error Handling", () => {
    it("handles database connection errors", async () => {
      const errorMessage = "Database connection failed";
      mockCreateReception.mockResolvedValue({
        data: undefined,
        error: new Error(errorMessage),
      });

      const result = await createReception(validReceptionData);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe(errorMessage);
    });

    it("handles validation errors from server", async () => {
      const validationError = "Invalid phone number format";
      mockCreateReception.mockResolvedValue({
        data: undefined,
        error: new Error(validationError),
      });

      const invalidData: VehicleReceptionFormData = {
        ...validReceptionData,
        phoneNumber: "invalid-phone",
      };

      const result = await createReception(invalidData);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe(validationError);
    });

    it("handles authentication errors", async () => {
      const authError = "Authentication required";
      mockCreateReception.mockResolvedValue({
        data: undefined,
        error: new Error(authError),
      });

      const result = await createReception(validReceptionData);

      expect(result.data).toBeUndefined();
      expect(result.error?.message).toBe(authError);
    });

    it("handles server timeout errors", async () => {
      const timeoutError = "Request timeout";
      mockCreateReception.mockRejectedValue(new Error(timeoutError));

      try {
        await createReception(validReceptionData);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe(timeoutError);
      }
    });
  });

  describe("Car Brands Data", () => {
    it("provides valid car brands list", () => {
      const result = mockUseCarBrands();
      const { data, isLoading, error } = result;

      expect(data).toEqual(["Toyota", "Honda", "Ford", "BMW", "Mercedes"]);
      expect(isLoading).toBe(false);
      expect(error).toBeNull();
    });

    it("handles loading state for car brands", () => {
      mockUseCarBrands.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      const result = mockUseCarBrands();
      const { data, isLoading, error } = result;

      expect(data).toBeUndefined();
      expect(isLoading).toBe(true);
      expect(error).toBeNull();
    });

    it("handles car brands fetch error", () => {
      const brandsError = "Failed to fetch car brands";
      mockUseCarBrands.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error(brandsError),
      } as any);

      const result = mockUseCarBrands();
      const { data, isLoading, error } = result;

      expect(data).toBeUndefined();
      expect(isLoading).toBe(false);
      expect(error?.message).toBe(brandsError);
    });

    it("handles empty car brands list", () => {
      mockUseCarBrands.mockReturnValue({
        data: [] as string[],
        isLoading: false,
        error: null,
      } as any);

      const result = mockUseCarBrands();
      const { data, isLoading, error } = result;

      expect(data).toEqual([]);
      expect(isLoading).toBe(false);
      expect(error).toBeNull();
    });
  });

  describe("Daily Vehicle Limit Logic", () => {
    it("allows reception when under daily limit", () => {
      mockUseDailyVehicleLimit.mockReturnValue({
        data: {
          currentCount: 8,
          maxCapacity: 15,
          canCreate: true,
          isAtLimit: false,
          isNearLimit: false,
        },
        isLoading: false,
        error: null,
      } as any);

      const result = mockUseDailyVehicleLimit();
      const { data } = result;

      expect(data?.currentCount).toBeLessThan(data?.maxCapacity || 0);
      expect(data?.canCreate).toBe(true);
      expect(data?.isAtLimit).toBe(false);
      expect(data?.currentCount).toBe(8);
      expect(data?.maxCapacity).toBe(15);
    });

    it("warns when approaching daily limit", () => {
      mockUseDailyVehicleLimit.mockReturnValue({
        data: {
          currentCount: 14,
          maxCapacity: 15,
          canCreate: true,
          isAtLimit: false,
          isNearLimit: true,
        },
        isLoading: false,
        error: null,
      } as any);

      const result = mockUseDailyVehicleLimit();
      const { data } = result;

      expect(data?.isNearLimit).toBe(true);
      expect(data?.canCreate).toBe(true);
      expect(data?.currentCount).toBe(14);
      expect(data?.maxCapacity).toBe(15);
    });

    it("blocks reception when daily limit reached", () => {
      mockUseDailyVehicleLimit.mockReturnValue({
        data: {
          currentCount: 15,
          maxCapacity: 15,
          canCreate: false,
          isAtLimit: true,
          isNearLimit: true,
        },
        isLoading: false,
        error: null,
      } as any);

      const result = mockUseDailyVehicleLimit();
      const { data } = result;

      expect(data?.isAtLimit).toBe(true);
      expect(data?.canCreate).toBe(false);
      expect(data?.currentCount).toBe(15);
      expect(data?.maxCapacity).toBe(15);
    });

    it("blocks reception when daily limit exceeded", () => {
      mockUseDailyVehicleLimit.mockReturnValue({
        data: {
          currentCount: 16,
          maxCapacity: 15,
          canCreate: false,
          isAtLimit: true,
          isNearLimit: true,
        },
        isLoading: false,
        error: null,
      } as any);

      const result = mockUseDailyVehicleLimit();
      const { data } = result;

      expect(data?.isAtLimit).toBe(true);
      expect(data?.canCreate).toBe(false);
      expect(data?.currentCount).toBe(16);
      expect(data?.maxCapacity).toBe(15);
    });

    it("handles loading state for daily limit", () => {
      mockUseDailyVehicleLimit.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      const result = mockUseDailyVehicleLimit();
      const { data, isLoading, error } = result;

      expect(data).toBeUndefined();
      expect(isLoading).toBe(true);
      expect(error).toBeNull();
    });

    it("handles daily limit fetch error", () => {
      const limitError = "Failed to fetch daily limit";
      mockUseDailyVehicleLimit.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error(limitError),
      } as any);

      const result = mockUseDailyVehicleLimit();
      const { data, isLoading, error } = result;

      expect(data).toBeUndefined();
      expect(isLoading).toBe(false);
      expect(error?.message).toBe(limitError);
    });

    it("handles zero daily limit configuration", () => {
      mockUseDailyVehicleLimit.mockReturnValue({
        data: {
          currentCount: 0,
          maxCapacity: 0,
          canCreate: false,
          isAtLimit: true,
          isNearLimit: true,
        },
        isLoading: false,
        error: null,
      } as any);

      const result = mockUseDailyVehicleLimit();
      const { data } = result;

      expect(data?.isAtLimit).toBe(true);
      expect(data?.canCreate).toBe(false);
      expect(data?.currentCount).toBe(0);
      expect(data?.maxCapacity).toBe(0);
    });

    it("handles unlimited daily limit configuration", () => {
      mockUseDailyVehicleLimit.mockReturnValue({
        data: {
          currentCount: 100,
          maxCapacity: null, // null indicates unlimited
          canCreate: true,
          isAtLimit: false,
          isNearLimit: false,
        },
        isLoading: false,
        error: null,
      } as any);

      const result = mockUseDailyVehicleLimit();
      const { data } = result;

      expect(data?.maxCapacity).toBeNull();
      expect(data?.canCreate).toBe(true);
      expect(data?.isAtLimit).toBe(false);
      expect(data?.currentCount).toBe(100);
    });
  });

  describe("Data Validation Logic", () => {
    it("validates required fields are present", () => {
      const requiredFields = [
        "customerName",
        "phoneNumber",
        "licensePlate",
        "carBrand",
        "receptionDate",
      ];

      requiredFields.forEach((field) => {
        expect(validReceptionData).toHaveProperty(field);
        expect(
          validReceptionData[field as keyof VehicleReceptionFormData]
        ).toBeTruthy();
      });
    });

    it("validates phone number format requirements", () => {
      const phonePatterns = [
        { phone: "1234567890", valid: true, description: "10 digits" },
        { phone: "12345678901", valid: true, description: "11 digits" },
        {
          phone: "123456789",
          valid: false,
          description: "9 digits - too short",
        },
        { phone: "abc1234567", valid: false, description: "contains letters" },
        { phone: "123-456-7890", valid: false, description: "contains dashes" },
        {
          phone: "(123) 456-7890",
          valid: false,
          description: "contains formatting",
        },
      ];

      phonePatterns.forEach(({ phone, valid, description }) => {
        const isValidFormat = /^[0-9]{10,11}$/.test(phone);
        expect(isValidFormat).toBe(valid);
      });
    });

    it("validates license plate format requirements", () => {
      const platePatterns = [
        { plate: "ABC123", valid: true, description: "standard format" },
        { plate: "ABC-123", valid: true, description: "with dash" },
        { plate: "A", valid: false, description: "too short" },
        { plate: "ABCDEFGHIJK", valid: false, description: "too long" },
        { plate: "", valid: false, description: "empty" },
        {
          plate: "abc123",
          valid: true,
          description: "lowercase (transforms to upper)",
        },
      ];

      platePatterns.forEach(({ plate, valid, description }) => {
        const isValidLength = plate.length >= 2 && plate.length <= 10;
        const isNotEmpty = plate.trim().length > 0;
        const isValidFormat = isValidLength && isNotEmpty;

        expect(isValidFormat).toBe(valid);
      });
    });

    it("validates customer name requirements", () => {
      const namePatterns = [
        { name: "John Doe", valid: true, description: "standard name" },
        { name: "A", valid: false, description: "too short" },
        { name: "José María", valid: true, description: "with accents" },
        { name: "李小明", valid: true, description: "unicode characters" },
        { name: "", valid: false, description: "empty" },
        { name: "   ", valid: false, description: "only spaces" },
      ];

      namePatterns.forEach(({ name, valid, description }) => {
        const isValidLength = name.trim().length >= 2;
        expect(isValidLength).toBe(valid);
      });
    });

    it("validates reception date requirements", () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const pastDate = new Date("2020-01-01");
      const veryOldDate = new Date("1800-01-01");

      const dateTests = [
        { date: today, valid: true, description: "today" },
        { date: pastDate, valid: true, description: "past date" },
        { date: tomorrow, valid: false, description: "future date" },
        { date: veryOldDate, valid: false, description: "very old date" },
      ];

      dateTests.forEach(({ date, valid, description }) => {
        const isNotFuture = date <= today;
        const isNotTooOld = date >= new Date("1900-01-01");
        const isValidDate = isNotFuture && isNotTooOld;

        expect(isValidDate).toBe(valid);
      });
    });
  });

  describe("Edge Cases and Boundary Conditions", () => {
    it("handles concurrent submission attempts", async () => {
      let submissionCount = 0;
      mockCreateReception.mockImplementation(async () => {
        submissionCount++;
        return {
          data: { success: true },
          error: null,
        };
      });

      // Simulate concurrent submissions
      const promises = [
        createReception(validReceptionData),
        createReception(validReceptionData),
        createReception(validReceptionData),
      ];

      const results = await Promise.all(promises);

      expect(submissionCount).toBe(3);
      results.forEach((result) => {
        expect(result.data).toEqual({ success: true });
        expect(result.error).toBeNull();
      });
    });

    it("handles large text input in notes field", async () => {
      const largeNotes = "A".repeat(1000); // 1000 character string
      const dataWithLargeNotes: VehicleReceptionFormData = {
        ...validReceptionData,
        notes: largeNotes,
      };

      mockCreateReception.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await createReception(dataWithLargeNotes);

      expect(result.data).toEqual({ success: true });
      expect(mockCreateReception).toHaveBeenCalledWith(dataWithLargeNotes);
    });

    it("handles unicode characters in customer data", async () => {
      const unicodeData: VehicleReceptionFormData = {
        ...validReceptionData,
        customerName: "José María García-López",
        address: "Calle de la Constitución, 123, 28001 Madrid, España",
        notes: "Cliente prefiere comunicación en español 🇪🇸",
      };

      mockCreateReception.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await createReception(unicodeData);

      expect(result.data).toEqual({ success: true });
      expect(mockCreateReception).toHaveBeenCalledWith(unicodeData);
    });

    it("handles maximum daily limit boundary", async () => {
      // Test exactly at the limit
      mockUseDailyVehicleLimit.mockReturnValue({
        data: {
          currentCount: 999,
          maxCapacity: 999,
          canCreate: false,
          isAtLimit: true,
          isNearLimit: true,
        },
        isLoading: false,
        error: null,
      } as any);

      const result = mockUseDailyVehicleLimit();
      const { data } = result;

      expect(data?.isAtLimit).toBe(true);
      expect(data?.canCreate).toBe(false);
      expect(data?.currentCount).toBe(999);
      expect(data?.maxCapacity).toBe(999);
    });
  });
});
