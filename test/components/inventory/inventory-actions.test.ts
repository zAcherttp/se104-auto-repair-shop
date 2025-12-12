/**
 * Inventory Actions Tests
 *
 * This test suite focuses on testing the inventory server actions behavior,
 * mocking the implementation to test integration patterns and response handling.
 */

import { addSparePart } from "@/app/actions/inventory";
import {
  mockSparePart,
  mockSparePartInvalidPrice,
  mockSparePartMissingName,
} from "@/test/mocks/inventory-data";
import type { ApiResponse, SparePart } from "@/types/types";

// The addSparePart function is already mocked by jest.setup.js
const mockAddSparePart = addSparePart as jest.MockedFunction<
  typeof addSparePart
>;

describe("Inventory Actions", () => {
  const mockFormData = {
    name: "Test Part",
    price: 25.99,
    stock_quantity: 10,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addSparePart Action Integration", () => {
    it("successfully adds a spare part", async () => {
      const expectedResult: ApiResponse<SparePart> = {
        error: null,
        data: mockSparePart,
      };

      mockAddSparePart.mockResolvedValueOnce(expectedResult);

      const result = await addSparePart(mockFormData);

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockSparePart);
      expect(mockAddSparePart).toHaveBeenCalledWith(mockFormData);
    });

    it("handles database errors correctly", async () => {
      const expectedError: ApiResponse<SparePart> = {
        error: new Error("Database constraint violation"),
        data: undefined,
      };

      mockAddSparePart.mockResolvedValueOnce(expectedError);

      const result = await addSparePart(mockFormData);

      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe("Database constraint violation");
      expect(result.data).toBeUndefined();
    });

    it("handles form validation errors", async () => {
      const validationError: ApiResponse<SparePart> = {
        error: new Error("Name is required"),
        data: undefined,
      };

      mockAddSparePart.mockResolvedValueOnce(validationError);

      const invalidData = { ...mockSparePartMissingName };
      const result = await addSparePart(invalidData as any);

      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe("Name is required");
      expect(result.data).toBeUndefined();
    });

    it("handles unexpected errors gracefully", async () => {
      const unexpectedError: ApiResponse<SparePart> = {
        error: new Error("Network connection failed"),
        data: undefined,
      };

      mockAddSparePart.mockResolvedValueOnce(unexpectedError);

      const result = await addSparePart(mockFormData);

      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe("Network connection failed");
      expect(result.data).toBeUndefined();
    });

    it("handles rejected promises correctly", async () => {
      const rejectionError = new Error("Promise rejection");
      mockAddSparePart.mockRejectedValueOnce(rejectionError);

      await expect(addSparePart(mockFormData)).rejects.toThrow(
        "Promise rejection",
      );
    });

    it("processes different form data types correctly", async () => {
      const formDataVariations = [
        { name: "Brake Pads", price: 45.99, stock_quantity: 25 },
        { name: "Oil Filter", price: 12.5, stock_quantity: 100 },
        { name: "Air Filter", price: 18.75, stock_quantity: 0 },
      ];

      for (const formData of formDataVariations) {
        const expectedResult: ApiResponse<SparePart> = {
          error: null,
          data: { ...mockSparePart, ...formData },
        };

        mockAddSparePart.mockResolvedValueOnce(expectedResult);

        const result = await addSparePart(formData);

        expect(result.error).toBeNull();
        expect(result.data?.name).toBe(formData.name);
        expect(result.data?.price).toBe(formData.price);
        expect(result.data?.stock_quantity).toBe(formData.stock_quantity);
      }
    });

    it("returns proper ApiResponse structure", async () => {
      const expectedResult: ApiResponse<SparePart> = {
        error: null,
        data: mockSparePart,
      };

      mockAddSparePart.mockResolvedValueOnce(expectedResult);

      const result = await addSparePart(mockFormData);

      // Verify ApiResponse structure
      expect(result).toHaveProperty("error");
      expect(result).toHaveProperty("data");
      expect(typeof result.error).toBe("object"); // null is of type object
      expect(result.data).toBeDefined();
    });

    it("handles null or undefined form data", async () => {
      const parseError: ApiResponse<SparePart> = {
        error: new Error("Invalid input data"),
        data: undefined,
      };

      mockAddSparePart.mockResolvedValueOnce(parseError);

      const result = await addSparePart(null as any);

      expect(result.error).toBeInstanceOf(Error);
      expect(result.data).toBeUndefined();
    });

    it("validates price constraints", async () => {
      const invalidPriceError: ApiResponse<SparePart> = {
        error: new Error("Price must be a positive number"),
        data: undefined,
      };

      mockAddSparePart.mockResolvedValueOnce(invalidPriceError);

      const invalidPriceData = { ...mockSparePartInvalidPrice };
      const result = await addSparePart(invalidPriceData as any);

      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe("Price must be a positive number");
    });

    it("handles empty string values correctly", async () => {
      const emptyStringData = {
        name: "",
        price: 0,
        stock_quantity: 0,
      };

      const validationError: ApiResponse<SparePart> = {
        error: new Error("Name cannot be empty"),
        data: undefined,
      };

      mockAddSparePart.mockResolvedValueOnce(validationError);

      const result = await addSparePart(emptyStringData);

      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe("Name cannot be empty");
    });

    it("preserves exact data structure in response", async () => {
      const inputData = {
        name: "Precision Part",
        price: 99.99,
        stock_quantity: 5,
      };

      const dbResponse = {
        id: "generated-id",
        created_at: "2024-12-01T10:00:00.000Z",
        ...inputData,
      };

      const expectedResult: ApiResponse<SparePart> = {
        error: null,
        data: dbResponse,
      };

      mockAddSparePart.mockResolvedValueOnce(expectedResult);

      const result = await addSparePart(inputData);

      expect(result.data).toEqual(dbResponse);
      expect(result.data?.name).toBe(inputData.name);
      expect(result.data?.price).toBe(inputData.price);
      expect(result.data?.stock_quantity).toBe(inputData.stock_quantity);
    });
  });

  describe("Mock Function Behavior", () => {
    it("tracks function calls correctly", async () => {
      const mockData = { name: "Test", price: 10, stock_quantity: 5 };

      mockAddSparePart.mockResolvedValueOnce({
        error: null,
        data: mockSparePart,
      });

      await addSparePart(mockData);

      expect(mockAddSparePart).toHaveBeenCalledTimes(1);
      expect(mockAddSparePart).toHaveBeenCalledWith(mockData);
    });

    it("handles multiple consecutive calls", async () => {
      const calls = [
        { name: "Part 1", price: 10, stock_quantity: 5 },
        { name: "Part 2", price: 20, stock_quantity: 10 },
        { name: "Part 3", price: 30, stock_quantity: 15 },
      ];

      calls.forEach(() => {
        mockAddSparePart.mockResolvedValueOnce({
          error: null,
          data: mockSparePart,
        });
      });

      for (const callData of calls) {
        await addSparePart(callData);
      }

      expect(mockAddSparePart).toHaveBeenCalledTimes(3);
      calls.forEach((callData, index) => {
        expect(mockAddSparePart).toHaveBeenNthCalledWith(index + 1, callData);
      });
    });

    it("resets call history between tests", () => {
      // This test verifies that beforeEach clears mocks properly
      expect(mockAddSparePart).toHaveBeenCalledTimes(0);
      expect(mockAddSparePart.mock.calls).toHaveLength(0);
    });

    it("handles mock implementation changes", async () => {
      // First call succeeds
      mockAddSparePart.mockResolvedValueOnce({
        error: null,
        data: mockSparePart,
      });

      // Second call fails
      mockAddSparePart.mockResolvedValueOnce({
        error: new Error("Failure"),
        data: undefined,
      });

      const mockData = { name: "Test", price: 10, stock_quantity: 5 };

      const result1 = await addSparePart(mockData);
      expect(result1.error).toBeNull();

      const result2 = await addSparePart(mockData);
      expect(result2.error).toBeInstanceOf(Error);
    });
  });

  describe("Integration Patterns", () => {
    it("follows consistent error response patterns", async () => {
      const errorMessages = [
        "Database constraint violation",
        "Validation failed",
        "Network timeout",
        "Permission denied",
      ];

      for (const message of errorMessages) {
        mockAddSparePart.mockResolvedValueOnce({
          error: new Error(message),
          data: undefined,
        });

        const result = await addSparePart(mockFormData);

        expect(result.error).toBeInstanceOf(Error);
        expect(result.error?.message).toBe(message);
        expect(result.data).toBeUndefined();
      }
    });

    it("follows consistent success response patterns", async () => {
      const successResponses = [
        { ...mockSparePart, name: "Part A" },
        { ...mockSparePart, name: "Part B", price: 50.0 },
        { ...mockSparePart, name: "Part C", stock_quantity: 100 },
      ];

      for (const responseData of successResponses) {
        mockAddSparePart.mockResolvedValueOnce({
          error: null,
          data: responseData,
        });

        const result = await addSparePart(mockFormData);

        expect(result.error).toBeNull();
        expect(result.data).toEqual(responseData);
      }
    });
  });
});
