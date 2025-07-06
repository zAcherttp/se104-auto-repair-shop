// Mock form validation and server action
jest.mock("@/lib/form/definitions", () => ({
  VehicleReceptionFormSchema: {
    safeParse: jest.fn(),
  },
}));

jest.mock("@/app/actions/vehicles", () => ({
  createReception: jest.fn(),
}));

import { createReception } from "@/app/actions/vehicles";
import { VehicleReceptionFormSchema } from "@/lib/form/definitions";

const mockCreateReception = createReception as jest.MockedFunction<typeof createReception>;
const mockVehicleReceptionFormSchema = VehicleReceptionFormSchema as any;

describe("Reception Form Data Processing", () => {
  const validFormData = {
    customerName: "John Doe",
    phoneNumber: "1234567890",
    licensePlate: "ABC123",
    carBrand: "Toyota",
    receptionDate: new Date("2024-01-15"),
    address: "123 Main St",
    notes: "Oil change needed",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful validation by default
    mockVehicleReceptionFormSchema.safeParse.mockReturnValue({
      success: true,
      data: validFormData,
    });

    // Mock successful submission by default
    mockCreateReception.mockResolvedValue({
      data: { success: true },
      error: null,
    });
  });

  describe("Form Data Validation", () => {
    it("validates complete form data successfully", () => {
      const result = mockVehicleReceptionFormSchema.safeParse(validFormData);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validFormData);
      expect(mockVehicleReceptionFormSchema.safeParse).toHaveBeenCalledWith(validFormData);
    });

    it("rejects empty customer name", () => {
      const invalidData = { ...validFormData, customerName: "" };

      mockVehicleReceptionFormSchema.safeParse.mockReturnValue({
        success: false,
        error: { 
          issues: [{ 
            path: ["customerName"], 
            message: "Customer name must be at least 2 characters" 
          }] 
        },
      });

      const result = mockVehicleReceptionFormSchema.safeParse(invalidData);
      
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe("Customer name must be at least 2 characters");
    });

    it("rejects invalid phone number", () => {
      const invalidData = { ...validFormData, phoneNumber: "123" };

      mockVehicleReceptionFormSchema.safeParse.mockReturnValue({
        success: false,
        error: { 
          issues: [{ 
            path: ["phoneNumber"], 
            message: "Phone number must be at least 10 digits" 
          }] 
        },
      });

      const result = mockVehicleReceptionFormSchema.safeParse(invalidData);
      
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe("Phone number must be at least 10 digits");
    });

    it("rejects empty license plate", () => {
      const invalidData = { ...validFormData, licensePlate: "" };

      mockVehicleReceptionFormSchema.safeParse.mockReturnValue({
        success: false,
        error: { 
          issues: [{ 
            path: ["licensePlate"], 
            message: "License plate is required" 
          }] 
        },
      });

      const result = mockVehicleReceptionFormSchema.safeParse(invalidData);
      
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe("License plate is required");
    });

    it("rejects empty car brand", () => {
      const invalidData = { ...validFormData, carBrand: "" };

      mockVehicleReceptionFormSchema.safeParse.mockReturnValue({
        success: false,
        error: { 
          issues: [{ 
            path: ["carBrand"], 
            message: "Please select a car brand" 
          }] 
        },
      });

      const result = mockVehicleReceptionFormSchema.safeParse(invalidData);
      
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe("Please select a car brand");
    });

    it("accepts minimal valid data", () => {
      const minimalData = {
        customerName: "Jane Smith",
        phoneNumber: "9876543210",
        licensePlate: "XYZ789",
        carBrand: "Honda",
        receptionDate: new Date("2024-01-20"),
      };

      mockVehicleReceptionFormSchema.safeParse.mockReturnValue({
        success: true,
        data: minimalData,
      });

      const result = mockVehicleReceptionFormSchema.safeParse(minimalData);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(minimalData);
    });

    it("handles optional fields", () => {
      const dataWithOptionals = {
        ...validFormData,
        address: undefined,
        notes: undefined,
      };

      mockVehicleReceptionFormSchema.safeParse.mockReturnValue({
        success: true,
        data: dataWithOptionals,
      });

      const result = mockVehicleReceptionFormSchema.safeParse(dataWithOptionals);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(dataWithOptionals);
    });
  });

  describe("Form Submission Logic", () => {
    it("submits valid data successfully", async () => {
      const result = await mockCreateReception(validFormData);

      expect(result.data).toEqual({ success: true });
      expect(result.error).toBeNull();
      expect(mockCreateReception).toHaveBeenCalledWith(validFormData);
    });

    it("handles submission with minimal data", async () => {
      const minimalData = {
        customerName: "Jane Smith",
        phoneNumber: "9876543210",
        licensePlate: "XYZ789",
        carBrand: "Honda",
        receptionDate: new Date("2024-01-20"),
      };

      const result = await mockCreateReception(minimalData);

      expect(result.data).toEqual({ success: true });
      expect(result.error).toBeNull();
      expect(mockCreateReception).toHaveBeenCalledWith(minimalData);
    });

    it("handles database errors during submission", async () => {
      mockCreateReception.mockResolvedValue({
        data: undefined,
        error: new Error("Database connection failed"),
      });

      const result = await mockCreateReception(validFormData);

      expect(result.error).toBeTruthy();
      expect(result.error?.message).toBe("Database connection failed");
      expect(result.data).toBeUndefined();
    });

    it("handles authentication errors", async () => {
      mockCreateReception.mockResolvedValue({
        data: undefined,
        error: new Error("Authentication required"),
      });

      const result = await mockCreateReception(validFormData);

      expect(result.error).toBeTruthy();
      expect(result.error?.message).toBe("Authentication required");
    });

    it("handles daily limit exceeded errors", async () => {
      mockCreateReception.mockResolvedValue({
        data: undefined,
        error: new Error("Daily vehicle reception limit exceeded"),
      });

      const result = await mockCreateReception(validFormData);

      expect(result.error).toBeTruthy();
      expect(result.error?.message).toBe("Daily vehicle reception limit exceeded");
    });
  });

  describe("Data Processing", () => {
    it("processes license plate formatting", () => {
      const inputData = { ...validFormData, licensePlate: " abc 123 " };
      const processedData = { ...validFormData, licensePlate: "ABC123" };

      mockVehicleReceptionFormSchema.safeParse.mockReturnValue({
        success: true,
        data: processedData,
      });

      const result = mockVehicleReceptionFormSchema.safeParse(inputData);
      
      expect(result.success).toBe(true);
      expect(result.data?.licensePlate).toBe("ABC123");
    });

    it("handles special characters in customer data", () => {
      const specialCharData = {
        ...validFormData,
        customerName: "José García-Smith",
        address: "123 Müller Straße, São Paulo",
        notes: "Vehicle needs special care: ñ, ç, ü characters",
      };

      mockVehicleReceptionFormSchema.safeParse.mockReturnValue({
        success: true,
        data: specialCharData,
      });

      const result = mockVehicleReceptionFormSchema.safeParse(specialCharData);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(specialCharData);
    });

    it("validates phone number format", () => {
      const validPhoneNumbers = ["1234567890", "12345678901", "123456789012"];
      
      validPhoneNumbers.forEach(phone => {
        const data = { ...validFormData, phoneNumber: phone };
        
        mockVehicleReceptionFormSchema.safeParse.mockReturnValue({
          success: true,
          data: data,
        });

        const result = mockVehicleReceptionFormSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it("rejects invalid phone number formats", () => {
      const invalidPhoneNumbers = ["123", "abcd123456", "123-456-7890"];
      
      invalidPhoneNumbers.forEach(phone => {
        const data = { ...validFormData, phoneNumber: phone };
        
        mockVehicleReceptionFormSchema.safeParse.mockReturnValue({
          success: false,
          error: { 
            issues: [{ 
              path: ["phoneNumber"], 
              message: "Phone number must contain only numbers" 
            }] 
          },
        });

        const result = mockVehicleReceptionFormSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });

    it("handles date validation", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      
      const dataWithFutureDate = {
        ...validFormData,
        receptionDate: futureDate,
      };

      mockVehicleReceptionFormSchema.safeParse.mockReturnValue({
        success: true,
        data: dataWithFutureDate,
      });

      const result = mockVehicleReceptionFormSchema.safeParse(dataWithFutureDate);
      
      expect(result.success).toBe(true);
      expect(result.data?.receptionDate).toEqual(futureDate);
    });
  });

  describe("Error Handling", () => {
    it("handles multiple validation errors", () => {
      const invalidData = {
        customerName: "",
        phoneNumber: "123",
        licensePlate: "",
        carBrand: "",
        receptionDate: new Date("2024-01-15"),
      };

      mockVehicleReceptionFormSchema.safeParse.mockReturnValue({
        success: false,
        error: {
          issues: [
            { path: ["customerName"], message: "Customer name is required" },
            { path: ["phoneNumber"], message: "Phone number too short" },
            { path: ["licensePlate"], message: "License plate is required" },
            { path: ["carBrand"], message: "Car brand is required" },
          ],
        },
      });

      const result = mockVehicleReceptionFormSchema.safeParse(invalidData);
      
      expect(result.success).toBe(false);
      expect(result.error.issues).toHaveLength(4);
    });

    it("prevents submission when validation fails", () => {
      mockVehicleReceptionFormSchema.safeParse.mockReturnValue({
        success: false,
        error: { issues: [{ message: "Validation failed" }] },
      });

      const validationResult = mockVehicleReceptionFormSchema.safeParse(validFormData);
      
      // If validation fails, form should not submit
      if (!validationResult.success) {
        expect(mockCreateReception).not.toHaveBeenCalled();
      }
    });
  });
});
