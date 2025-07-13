/**
 * Settings Hooks Tests
 * 
 * This test suite focuses on testing the settings-related custom hooks,
 * including TanStack Query integration, data fetching, and state management.
 */

// Mock the useQuery hook from TanStack Query
jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
}));

// Mock the settings actions
jest.mock("@/app/actions/settings", () => ({
  getEmployees: jest.fn(),
  getGarageInfo: jest.fn(),
  getSystemSettings: jest.fn(),
}));

import { useQuery } from "@tanstack/react-query";
import { getEmployees } from "@/app/actions/settings";
import { useEmployees } from "@/hooks/use-employees";
import { 
  mockEmployeesSuccessResponse, 
  mockErrorResponse
} from "@/test/mocks/settings-data";
import { renderHook } from "@testing-library/react";

const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;
const mockGetEmployees = getEmployees as jest.MockedFunction<typeof getEmployees>;

describe("Settings Hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("useEmployees Hook", () => {
    it("should return employees data on successful fetch", () => {
      mockUseQuery.mockReturnValue({
        data: mockEmployeesSuccessResponse.data,
        isLoading: false,
        error: null,
        isError: false,
        refetch: jest.fn(),
        isSuccess: true,
      } as any);

      const { result } = renderHook(() => useEmployees());

      expect(result.current.data).toEqual(mockEmployeesSuccessResponse.data);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it("should handle loading state", () => {
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
        refetch: jest.fn(),
        isSuccess: false,
      } as any);

      const { result } = renderHook(() => useEmployees());

      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBe(null);
    });

    it("should handle error state", () => {
      const errorMessage = "Failed to fetch employees";
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error(errorMessage),
        isError: true,
        refetch: jest.fn(),
        isSuccess: false,
      } as any);

      const { result } = renderHook(() => useEmployees());

      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toEqual(new Error(errorMessage));
      expect(result.current.isError).toBe(true);
    });

    it("should configure query with correct parameters", () => {
      mockUseQuery.mockReturnValue({
        data: mockEmployeesSuccessResponse.data,
        isLoading: false,
        error: null,
        isError: false,
        refetch: jest.fn(),
        isSuccess: true,
      } as any);

      renderHook(() => useEmployees());

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: ["employees"],
        queryFn: expect.any(Function),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
      });
    });

    it("should handle query function execution", async () => {
      mockGetEmployees.mockResolvedValue(mockEmployeesSuccessResponse);

      let queryFn: any;
      mockUseQuery.mockImplementation((config: any) => {
        queryFn = config.queryFn;
        return {
          data: mockEmployeesSuccessResponse.data,
          isLoading: false,
          error: null,
          isError: false,
          refetch: jest.fn(),
          isSuccess: true,
        } as any;
      });

      renderHook(() => useEmployees());

      const result = await queryFn();
      expect(result).toEqual(mockEmployeesSuccessResponse.data);
      expect(mockGetEmployees).toHaveBeenCalled();
    });

    it("should throw error when API response is unsuccessful", async () => {
      mockGetEmployees.mockResolvedValue(mockErrorResponse);

      let queryFn: any;
      mockUseQuery.mockImplementation((config: any) => {
        queryFn = config.queryFn;
        return {
          data: undefined,
          isLoading: false,
          error: null,
          isError: false,
          refetch: jest.fn(),
          isSuccess: false,
        } as any;
      });

      renderHook(() => useEmployees());

      await expect(queryFn()).rejects.toThrow("Failed to process request");
    });

    it("should handle successful query refetch", () => {
      const mockRefetch = jest.fn();
      mockUseQuery.mockReturnValue({
        data: mockEmployeesSuccessResponse.data,
        isLoading: false,
        error: null,
        isError: false,
        refetch: mockRefetch,
        isSuccess: true,
      } as any);

      const { result } = renderHook(() => useEmployees());

      expect(result.current.refetch).toBe(mockRefetch);
      expect(typeof result.current.refetch).toBe("function");
    });

    it("should handle cache configuration", () => {
      mockUseQuery.mockReturnValue({
        data: mockEmployeesSuccessResponse.data,
        isLoading: false,
        error: null,
        isError: false,
        refetch: jest.fn(),
        isSuccess: true,
      } as any);

      renderHook(() => useEmployees());

      const lastCall = mockUseQuery.mock.calls[mockUseQuery.mock.calls.length - 1];
      const config = lastCall[0];
      
      // Verify caching configuration
      expect(config.staleTime).toBe(5 * 60 * 1000); // 5 minutes
      expect(config.refetchOnWindowFocus).toBe(false);
      expect(config.queryKey).toEqual(["employees"]);
    });

    it("should handle query key uniqueness", () => {
      mockUseQuery.mockReturnValue({
        data: mockEmployeesSuccessResponse.data,
        isLoading: false,
        error: null,
        isError: false,
        refetch: jest.fn(),
        isSuccess: true,
      } as any);

      renderHook(() => useEmployees());

      const lastCall = mockUseQuery.mock.calls[mockUseQuery.mock.calls.length - 1];
      const config = lastCall[0];
      
      expect(Array.isArray(config.queryKey)).toBeTruthy();
      expect(config.queryKey[0]).toBe("employees");
    });

    it("should handle query function error scenarios", async () => {
      const networkError = new Error("Network connection failed");
      mockGetEmployees.mockRejectedValue(networkError);

      let queryFn: any;
      mockUseQuery.mockImplementation((config: any) => {
        queryFn = config.queryFn;
        return {
          data: undefined,
          isLoading: false,
          error: networkError,
          isError: true,
          refetch: jest.fn(),
          isSuccess: false,
        } as any;
      });

      renderHook(() => useEmployees());

      await expect(queryFn()).rejects.toThrow("Network connection failed");
    });
  });

  describe("Hook Integration Tests", () => {
    it("should maintain consistent behavior across re-renders", () => {
      mockUseQuery.mockReturnValue({
        data: mockEmployeesSuccessResponse.data,
        isLoading: false,
        error: null,
        isError: false,
        refetch: jest.fn(),
        isSuccess: true,
      } as any);

      const { result, rerender } = renderHook(() => useEmployees());

      const firstResult = result.current;
      rerender();
      const secondResult = result.current;

      expect(firstResult.data).toEqual(secondResult.data);
      expect(firstResult.isLoading).toBe(secondResult.isLoading);
    });

    it("should handle multiple hook instances", () => {
      mockUseQuery.mockReturnValue({
        data: mockEmployeesSuccessResponse.data,
        isLoading: false,
        error: null,
        isError: false,
        refetch: jest.fn(),
        isSuccess: true,
      } as any);

      const { result: result1 } = renderHook(() => useEmployees());
      const { result: result2 } = renderHook(() => useEmployees());

      expect(result1.current.data).toEqual(result2.current.data);
      expect(mockUseQuery).toHaveBeenCalledTimes(2);
    });

    it("should properly handle hook cleanup", () => {
      mockUseQuery.mockReturnValue({
        data: mockEmployeesSuccessResponse.data,
        isLoading: false,
        error: null,
        isError: false,
        refetch: jest.fn(),
        isSuccess: true,
      } as any);

      const { unmount } = renderHook(() => useEmployees());

      expect(() => unmount()).not.toThrow();
    });
  });
});
