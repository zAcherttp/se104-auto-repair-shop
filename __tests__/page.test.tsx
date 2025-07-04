import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Page from "@/app/page";

// Mock the hooks
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
}));

const mockUseGarageInfo = jest.fn();
jest.mock("@/hooks/use-garage-info", () => ({
  useGarageInfo: () => mockUseGarageInfo(),
}));

describe("Landing Page - User Interactions", () => {
  beforeEach(() => {
    // Reset mocks
    mockPush.mockClear();
    mockUseGarageInfo.mockClear();
  });

  describe("Button Navigation Tests", () => {
    beforeEach(() => {
      // Mock garage info with data
      mockUseGarageInfo.mockReturnValue({
        data: {
          garageName: "Test Auto Shop",
          phoneNumber: "(555) 123-4567",
          emailAddress: "test@shop.com",
          address: "123 Test St",
        },
        isLoading: false,
        error: null,
        isError: false,
      });
    });

    it("renders both action buttons", () => {
      render(<Page />);

      const staffLoginButton = screen.getByRole("button", {
        name: /staff login/i,
      });
      const trackOrderButton = screen.getByRole("button", {
        name: /track order/i,
      });

      expect(staffLoginButton).toBeTruthy();
      expect(trackOrderButton).toBeTruthy();
    });

    it("navigates to login page when Staff Login button is clicked", async () => {
      render(<Page />);

      const staffLoginButton = screen.getByRole("button", {
        name: /staff login/i,
      });
      fireEvent.click(staffLoginButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/login");
        expect(mockPush).toHaveBeenCalledTimes(1);
      });
    });

    it("navigates to track order page when Track Order button is clicked", async () => {
      render(<Page />);

      const trackOrderButton = screen.getByRole("button", {
        name: /track order/i,
      });
      fireEvent.click(trackOrderButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/track-order");
        expect(mockPush).toHaveBeenCalledTimes(1);
      });
    });

    it("handles multiple button clicks correctly", async () => {
      render(<Page />);

      const staffLoginButton = screen.getByRole("button", {
        name: /staff login/i,
      });
      const trackOrderButton = screen.getByRole("button", {
        name: /track order/i,
      });

      // Click staff login button
      fireEvent.click(staffLoginButton);
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/login");
      });

      // Click track order button
      fireEvent.click(trackOrderButton);
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/track-order");
      });

      // Verify both calls were made
      expect(mockPush).toHaveBeenCalledTimes(2);
    });

    it("buttons are enabled and clickable", () => {
      render(<Page />);

      const staffLoginButton = screen.getByRole("button", {
        name: /staff login/i,
      }) as HTMLButtonElement;
      const trackOrderButton = screen.getByRole("button", {
        name: /track order/i,
      }) as HTMLButtonElement;

      expect(staffLoginButton).toBeTruthy();
      expect(trackOrderButton).toBeTruthy();
      expect(staffLoginButton.disabled).toBeFalsy();
      expect(trackOrderButton.disabled).toBeFalsy();
    });
  });

  describe("Content Rendering Based on Data", () => {
    it("renders default content when no garage info is available", () => {
      mockUseGarageInfo.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
        isError: false,
      });

      render(<Page />);

      // Should show default title
      expect(screen.getByText("AutoRepair Manager")).toBeTruthy();

      // Should show default subtitle
      expect(
        screen.getByText("Comprehensive vehicle repair management system")
      ).toBeTruthy();

      // Should still show action buttons
      expect(screen.getByRole("button", { name: /staff login/i })).toBeTruthy();
      expect(screen.getByRole("button", { name: /track order/i })).toBeTruthy();
    });

    it("renders garage info when data is available", () => {
      const mockGarageInfo = {
        garageName: "Custom Auto Shop",
        phoneNumber: "(555) 987-6543",
        emailAddress: "info@customshop.com",
        address: "456 Custom Ave",
      };

      mockUseGarageInfo.mockReturnValue({
        data: mockGarageInfo,
        isLoading: false,
        error: null,
        isError: false,
      });

      render(<Page />);

      // Should show custom garage name
      expect(screen.getByText("Custom Auto Shop")).toBeTruthy();

      // Should show contact information
      expect(screen.getByText("(555) 987-6543")).toBeTruthy();
      expect(screen.getByText("info@customshop.com")).toBeTruthy();
      expect(screen.getByText("456 Custom Ave")).toBeTruthy();
    });

    it("shows loading state correctly", () => {
      mockUseGarageInfo.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
      });

      render(<Page />);

      // During loading state, only the loading skeleton should be visible
      // The subtitle is not rendered during loading state

      // Should still show action buttons during loading
      expect(screen.getByRole("button", { name: /staff login/i })).toBeTruthy();
      expect(screen.getByRole("button", { name: /track order/i })).toBeTruthy();

      // Should show the features section
      expect(screen.getByText("Why Choose AutoRepair Manager?")).toBeTruthy();
    });

    it("handles partial contact information gracefully", () => {
      mockUseGarageInfo.mockReturnValue({
        data: {
          garageName: "Partial Info Shop",
          phoneNumber: "(555) 123-4567",
          emailAddress: null,
          address: null,
        },
        isLoading: false,
        error: null,
        isError: false,
      });

      render(<Page />);

      // Should show available info
      expect(screen.getByText("Partial Info Shop")).toBeTruthy();
      expect(screen.getByText("(555) 123-4567")).toBeTruthy();

      // Should not show null values
      expect(screen.queryByText("null")).toBeFalsy();
    });

    it("shows configuration message when no contact info is available", () => {
      mockUseGarageInfo.mockReturnValue({
        data: {
          garageName: "No Contact Shop",
          phoneNumber: null,
          emailAddress: null,
          address: null,
        },
        isLoading: false,
        error: null,
        isError: false,
      });

      render(<Page />);

      expect(
        screen.getByText(
          "Contact information can be configured in the admin settings."
        )
      ).toBeTruthy();
    });
  });

  describe("Error Handling", () => {
    it("handles query errors gracefully", () => {
      mockUseGarageInfo.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error("Failed to fetch garage info"),
        isError: true,
      });

      render(<Page />);

      // Should still render basic content
      expect(screen.getByText("AutoRepair Manager")).toBeTruthy();
      expect(
        screen.getByText("Comprehensive vehicle repair management system")
      ).toBeTruthy();

      // Should still show functional buttons
      expect(screen.getByRole("button", { name: /staff login/i })).toBeTruthy();
      expect(screen.getByRole("button", { name: /track order/i })).toBeTruthy();
    });

    it("buttons still work after error state", async () => {
      mockUseGarageInfo.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error("Test error"),
        isError: true,
      });

      render(<Page />);

      const staffLoginButton = screen.getByRole("button", {
        name: /staff login/i,
      });
      fireEvent.click(staffLoginButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/login");
      });
    });
  });

  describe("Static Content", () => {
    beforeEach(() => {
      mockUseGarageInfo.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
        isError: false,
      });
    });

    it("renders features section correctly", () => {
      render(<Page />);

      // Check main features heading
      expect(screen.getByText("Why Choose AutoRepair Manager?")).toBeTruthy();

      // Check feature titles
      expect(screen.getByText("Vehicle Management")).toBeTruthy();
      expect(screen.getByText("Staff Management")).toBeTruthy();
      expect(screen.getByText("Customer Tracking")).toBeTruthy();

      // Check feature descriptions
      expect(
        screen.getByText("Complete vehicle reception and tracking system")
      ).toBeTruthy();
      expect(
        screen.getByText("Role-based access control for admins and employees")
      ).toBeTruthy();
      expect(
        screen.getByText("Real-time order tracking for customers")
      ).toBeTruthy();
    });

    it("renders card content correctly", () => {
      render(<Page />);

      // Check card titles
      expect(screen.getByText("Login as Garage Member")).toBeTruthy();
      expect(screen.getByText("Track My Order")).toBeTruthy();

      // Check card descriptions
      expect(
        screen.getByText(
          "Access the management system to handle vehicle reception, repairs, and payments"
        )
      ).toBeTruthy();
      expect(
        screen.getByText(
          "Check the status of your vehicle repair by entering your license plate number"
        )
      ).toBeTruthy();
    });

    it("has proper heading structure for accessibility", () => {
      render(<Page />);

      // Check for main heading (h1)
      expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();

      // Check for section heading (h2)
      expect(screen.getByRole("heading", { level: 2 })).toBeTruthy();

      // Check for feature headings (h3)
      const h3Headings = screen.getAllByRole("heading", { level: 3 });
      expect(h3Headings).toHaveLength(3);
    });
  });

  describe("Button Behavior Edge Cases", () => {
    beforeEach(() => {
      mockUseGarageInfo.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
        isError: false,
      });
    });

    it("handles rapid button clicks", async () => {
      render(<Page />);

      const staffLoginButton = screen.getByRole("button", {
        name: /staff login/i,
      });

      // Rapid clicks
      fireEvent.click(staffLoginButton);
      fireEvent.click(staffLoginButton);
      fireEvent.click(staffLoginButton);

      // Should still call the navigation function
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/login");
      });
    });

    it("buttons work correctly after loading state changes", async () => {
      // Start with loading state
      mockUseGarageInfo.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
      });

      const { rerender } = render(<Page />);

      // Change to loaded state
      mockUseGarageInfo.mockReturnValue({
        data: {
          garageName: "Test Shop",
          phoneNumber: null,
          emailAddress: null,
          address: null,
        },
        isLoading: false,
        error: null,
        isError: false,
      });

      rerender(<Page />);

      // Button should still work
      const staffLoginButton = screen.getByRole("button", {
        name: /staff login/i,
      });
      fireEvent.click(staffLoginButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/login");
      });
    });

    it("verifies button text content", () => {
      render(<Page />);

      const staffLoginButton = screen.getByRole("button", {
        name: /staff login/i,
      });
      const trackOrderButton = screen.getByRole("button", {
        name: /track order/i,
      });

      expect(staffLoginButton.textContent).toContain("Staff Login");
      expect(trackOrderButton.textContent).toContain("Track Order");
    });

    it("verifies button styling classes", () => {
      render(<Page />);

      const staffLoginButton = screen.getByRole("button", {
        name: /staff login/i,
      });
      const trackOrderButton = screen.getByRole("button", {
        name: /track order/i,
      });

      // Check for common button classes
      expect(staffLoginButton.className).toContain("w-full");
      expect(trackOrderButton.className).toContain("w-full");
    });
  });
});
