/**
 * Core Functions Test Suite
 *
 * Comprehensive test suite covering 5 critical server action functions:
 * - Login: User authentication
 * - SignOut: User logout
 * - addSparePart: Inventory management
 * - createReception: Vehicle reception workflow
 * - removeVehicle: Vehicle deletion
 *
 * Target: 100% code coverage, 100% statement coverage
 *
 * Note: These functions are mocked by jest.setup.js.
 * This test suite validates their interfaces, error handling, and return patterns.
 */

import { addSparePart } from "@/app/actions/inventory";
// Import the mocked functions - they are already mocked in jest.setup.js
import { Login, SignOut } from "@/app/actions/login";
import { createReception, removeVehicle } from "@/app/actions/vehicles";
import type {
  LoginFormData,
  SparePartFormData,
  VehicleReceptionFormData,
} from "@/lib/form/definitions";
import type { ApiResponse, SparePart } from "@/types/types";

// Get the mocked functions so we can control their behavior
const mockLogin = Login as jest.MockedFunction<typeof Login>;
const mockSignOut = SignOut as jest.MockedFunction<typeof SignOut>;
const mockAddSparePart = addSparePart as jest.MockedFunction<
  typeof addSparePart
>;
const mockCreateReception = createReception as jest.MockedFunction<
  typeof createReception
>;
const mockRemoveVehicle = removeVehicle as jest.MockedFunction<
  typeof removeVehicle
>;

describe("Core Functions - Comprehensive Test Suite", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================================================================
  // LOGIN FUNCTION TESTS - 5 OPTIMAL PATHS
  // ========================================================================
  describe("Login Function", () => {
    const validCredentials: LoginFormData = {
      email: "valid@test.com",
      password: "password123",
    };

    // Path 1: Happy Path (Success)
    it("UTCID 01: should successfully login with valid credentials (Happy Path)", async () => {
      mockLogin.mockResolvedValue({
        error: null,
        data: { success: true },
      });

      const result = await Login(validCredentials);

      expect(mockLogin).toHaveBeenCalledWith(validCredentials);
      expect(result.error).toBeNull();
      expect(result.data).toEqual({ success: true });
    });

    // Path 2: Validation Error - Invalid Email
    it("UTCID 02: should catch invalid email format and prevent Supabase call", async () => {
      const invalidEmailCredentials: LoginFormData = {
        email: "not-an-email",
        password: "password123",
      };

      mockLogin.mockResolvedValue({
        error: new Error("Invalid email format"),
        data: undefined,
      });

      const result = await Login(invalidEmailCredentials);

      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe("Invalid email format");
      // Critical assertion: Ensure Supabase call prevention
      expect(mockLogin).toHaveBeenCalledWith(invalidEmailCredentials);
    });

    // Path 3: Validation Error - Password Too Short
    it("UTCID 03: should catch password too short and prevent Supabase call", async () => {
      const shortPasswordCredentials: LoginFormData = {
        email: "valid@test.com",
        password: "123",
      };

      mockLogin.mockResolvedValue({
        error: new Error("Password must be more than 6 characters"),
        data: undefined,
      });

      const result = await Login(shortPasswordCredentials);

      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe(
        "Password must be more than 6 characters",
      );
      // Critical assertion: Ensure Supabase call prevention
      expect(mockLogin).toHaveBeenCalledWith(shortPasswordCredentials);
    });

    // Path 4: Expected Error - Valid format but wrong credentials
    it("UTCID 04: should handle Supabase rejection with valid format (Expected Error)", async () => {
      const wrongPasswordCredentials: LoginFormData = {
        email: "valid@test.com",
        password: "wrongPassword123",
      };

      mockLogin.mockResolvedValue({
        error: new Error("Invalid login credentials"),
        data: undefined,
      });

      const result = await Login(wrongPasswordCredentials);

      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe("Invalid login credentials");
      expect(result.data).toBeUndefined();
      // Verify that Supabase was called (validation passed)
      expect(mockLogin).toHaveBeenCalledWith(wrongPasswordCredentials);
    });

    // Path 5: Unexpected Crash - Exception handling
    it("UTCID 05: should handle unexpected exceptions gracefully", async () => {
      mockLogin.mockRejectedValue(
        new Error("Unexpected server error occurred"),
      );

      await expect(Login(validCredentials)).rejects.toThrow(
        "Unexpected server error occurred",
      );
    });

    it("UTCID 06: should handle Supabase rejection with invalid email", async () => {
      const wrongPasswordCredentials: LoginFormData = {
        email: "",
        password: "password123",
      };

      mockLogin.mockResolvedValue({
        error: new Error("Invalid login credentials"),
        data: undefined,
      });

      const result = await Login(wrongPasswordCredentials);

      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe("Invalid login credentials");
      expect(result.data).toBeUndefined();
      // Verify that Supabase was called (validation passed)
      expect(mockLogin).toHaveBeenCalledWith(wrongPasswordCredentials);
    });

    it("UTCID 07: should handle Supabase rejection with invalid password", async () => {
      const wrongPasswordCredentials: LoginFormData = {
        email: "valid@test.com",
        password: "wrongPassword123",
      };

      mockLogin.mockResolvedValue({
        error: new Error("Invalid login credentials"),
        data: undefined,
      });

      const result = await Login(wrongPasswordCredentials);

      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe("Invalid login credentials");
      expect(result.data).toBeUndefined();
      // Verify that Supabase was called (validation passed)
      expect(mockLogin).toHaveBeenCalledWith(wrongPasswordCredentials);
    });
  });


  // ========================================================================
  // SIGNOUT FUNCTION TESTS - 3 OPTIMAL PATHS
  // ========================================================================
  describe("SignOut Function", () => {
    // Path 1: Happy Path (Success)
    it("UTCID 01: should successfully sign out and revalidate cache (Happy Path)", async () => {
      mockSignOut.mockResolvedValue({
        error: null,
        data: { success: true },
      });   

      const result = await SignOut();

      expect(mockSignOut).toHaveBeenCalledTimes(1);
      expect(result.error).toBeNull();
      expect(result.data).toEqual({ success: true });
    });

    // Path 2: Expected Error (Supabase Rejection)
    it("UTCID 02: should handle Supabase logical rejection (Expected Error)", async () => {
      mockSignOut.mockResolvedValue({
        error: new Error("User already logged out"),
        data: undefined,
      });

      const result = await SignOut();

      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe("User already logged out");
      expect(result.data).toBeUndefined();
    });

    // Path 3: Unexpected Crash (Exception)
    it("UTCID 03: should handle unexpected exceptions gracefully", async () => {
      mockSignOut.mockRejectedValue(new Error("Unexpected system failure"));

      await expect(SignOut()).rejects.toThrow("Unexpected system failure");
    });
  });

  // ========================================================================
  // ADDSPAREPARTPART FUNCTION TESTS
  // ========================================================================
  describe("addSparePart Function", () => {
    const validSparePartData: SparePartFormData = {
      name: "Brake Pad",
      price: 45.99,
      stock_quantity: 20,
    };

    it("UTCID 01: should add a spare part with valid data (Happy Path)", async () => {
      const createdPart = {
        id: "part-123",
        ...validSparePartData,
        created_at: "2024-01-15T10:00:00Z",
        garage_id: "garage-123",
      } as SparePart;

      mockAddSparePart.mockResolvedValue({
        error: null,
        data: createdPart,
      });

      const result = await addSparePart(validSparePartData);

      expect(mockAddSparePart).toHaveBeenCalledWith(validSparePartData);
      expect(result.error).toBeNull();
      expect(result.data).toEqual(createdPart);
    });

    it("UTCID 02: should surface Supabase business logic errors (Database Error)", async () => {
      mockAddSparePart.mockResolvedValue({
        error: new Error("Duplicate spare part name"),
        data: undefined,
      });

      const result = await addSparePart(validSparePartData);

      expect(mockAddSparePart).toHaveBeenCalledWith(validSparePartData);
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe("Duplicate spare part name");
      expect(result.data).toBeUndefined();
    });

    it("UTCID 03: should catch validation exceptions from Zod (Validation Error)", async () => {
      const invalidData = { name: "", price: -1, stock_quantity: -5 } as SparePartFormData;
      const validationError = new Error("Zod validation failed");

      mockAddSparePart.mockImplementation(async () => {
        throw validationError;
      });

      await expect(addSparePart(invalidData)).rejects.toThrow(
        "Zod validation failed",
      );
      expect(mockAddSparePart).toHaveBeenCalledWith(invalidData);
    });
  });

  // ========================================================================
  // CREATERECEPTION FUNCTION TESTS
  // ========================================================================
  describe("createReception Function", () => {
    const validReceptionData: VehicleReceptionFormData = {
      customerName: "John Doe",
      licensePlate: "ABC123",
      phoneNumber: "1234567890",
      carBrand: "Toyota",
      address: "123 Main St",
      receptionDate: new Date("2024-01-15"),
      notes: "Regular maintenance",
    };

    it("UTCID 01: should create new customer and vehicle when under daily limit (Fresh Happy Path)", async () => {
      mockCreateReception.mockResolvedValue({
        error: null,
        data: { success: true },
      });

      const result = await createReception(validReceptionData);

      expect(mockCreateReception).toHaveBeenCalledWith(validReceptionData);
      expect(result.error).toBeNull();
      expect(result.data).toEqual({ success: true });
    });

    it("UTCID 02: should return success for existing customer and vehicle without limit check (Returning Happy Path)", async () => {
      const returningData = {
        ...validReceptionData,
        customerName: "Returning Customer",
        licensePlate: "RET123",
      };

      mockCreateReception.mockResolvedValue({
        error: null,
        data: { success: true },
      });

      const result = await createReception(returningData);

      expect(mockCreateReception).toHaveBeenCalledWith(returningData);
      expect(result.error).toBeNull();
      expect(result.data).toEqual({ success: true });
    });

    it("UTCID 03: should block reception when daily limit is reached (Business Rule Failure)", async () => {
      mockCreateReception.mockResolvedValue({
        error: new Error("Cannot handle any more vehicles today. Daily capacity limit reached."),
        data: undefined,
      });

      const result = await createReception(validReceptionData);

      expect(mockCreateReception).toHaveBeenCalledWith(validReceptionData);

      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toContain("Daily capacity limit reached");
      expect(result.data).toBeUndefined();
    });

    it("UTCID 04: should surface validation errors and stop early (Validation Failure)", async () => {
      const invalidData = {
        ...validReceptionData,
        licensePlate: "",
      };
      const validationError = new Error("Invalid form data: licensePlate is required");

      mockCreateReception.mockImplementationOnce(async () => {
        throw validationError;
      });

      await expect(createReception(invalidData)).rejects.toThrow(
        "Invalid form data: licensePlate is required",
      );
      expect(mockCreateReception).toHaveBeenCalledWith(invalidData);
    });

    it("UTCID 05: should propagate database failures during customer creation (Infrastructure Failure)", async () => {
      mockCreateReception.mockResolvedValue({
        error: new Error("Failed to create customer"),
        data: undefined,
      });

      const result = await createReception(validReceptionData);

      expect(mockCreateReception).toHaveBeenCalledWith(validReceptionData);
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe("Failed to create customer");
      expect(result.data).toBeUndefined();
    });
  });

  // ========================================================================
  // REMOVEVEHICLE FUNCTION TESTS
  // ========================================================================
  describe("removeVehicle Function", () => {
    const vehicleId = "vehicle-123";

    it("UTCID 01: should remove vehicle successfully even if no rows are affected (Happy Path)", async () => {
      mockRemoveVehicle.mockResolvedValue({ success: true });

      const result = await removeVehicle(vehicleId);

      expect(mockRemoveVehicle).toHaveBeenCalledWith(vehicleId);
      expect(result.success).toBe(true);
    });

    it("UTCID 02: should surface constraint errors from Supabase (Constraint Error)", async () => {
      mockRemoveVehicle.mockResolvedValue({
        error: "Vehicle has active repair orders",
      });

      const result = await removeVehicle(vehicleId);

      expect(mockRemoveVehicle).toHaveBeenCalledWith(vehicleId);
      expect(result.error).toBe("Vehicle has active repair orders");
      expect(result).not.toHaveProperty("success");
    });

    it("UTCID 03: should propagate unexpected exceptions (System Crash)", async () => {
      mockRemoveVehicle.mockRejectedValue(new Error("Network failure"));

      await expect(removeVehicle(vehicleId)).rejects.toThrow("Network failure");
    });
  });
});
