import { render, screen, fireEvent, waitFor } from "@/test/utils/test-utils";
import { DateRange } from "react-day-picker";
import ReceptionPage from "@/app/(protected)/reception/page";
import {
  mockVehicleRegistrationData,
  mockVehicleLimit,
} from "@/test/mocks/reception-data";

// Mock the hooks
const mockUseVehicleRegistration = jest.fn();
const mockUseDailyVehicleLimit = jest.fn();

jest.mock("@/hooks/use-vehicle-registration", () => ({
  useVehicleRegistration: () => mockUseVehicleRegistration(),
}));

jest.mock("@/hooks/use-daily-vehicle-limit", () => ({
  useDailyVehicleLimit: () => mockUseDailyVehicleLimit(),
}));

// Mock the components
jest.mock("@/app/(protected)/reception/data-table", () => ({
  VehicleDataTable: jest.fn(({ onNewReception, onDateRangeChange }) => (
    <div data-testid="vehicle-data-table">
      <button onClick={onNewReception} data-testid="new-reception-btn">
        New Reception
      </button>
      <button
        onClick={() => onDateRangeChange({ from: new Date(), to: new Date() })}
        data-testid="date-range-btn"
      >
        Change Date Range
      </button>
    </div>
  )),
}));

jest.mock("@/components/reception/reception-form", () => ({
  ReceptionForm: jest.fn(({ open, onClose, onSuccess }) => (
    <div
      data-testid="reception-form"
      style={{ display: open ? "block" : "none" }}
    >
      <button onClick={onClose} data-testid="close-form-btn">
        Close
      </button>
      <button onClick={onSuccess} data-testid="success-btn">
        Success
      </button>
    </div>
  )),
}));

describe("Reception Page", () => {
  const mockRefetch = jest.fn();
  const mockUpdateDateRange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementation
    mockUseVehicleRegistration.mockReturnValue({
      data: mockVehicleRegistrationData,
      isLoading: false,
      error: null,
      dateRange: { from: new Date(), to: new Date() },
      updateDateRange: mockUpdateDateRange,
      refetch: mockRefetch,
    });

    mockUseDailyVehicleLimit.mockReturnValue({
      data: mockVehicleLimit,
      isLoading: false,
      error: null,
    });
  });

  const renderReceptionPage = () => {
    return render(<ReceptionPage />);
  };

  it("renders without crashing", () => {
    renderReceptionPage();
    expect(screen.getByTestId("vehicle-data-table")).toBeInTheDocument();
    expect(screen.getByTestId("reception-form")).toBeInTheDocument();
  });

  it("shows reception form when New Reception button is clicked", () => {
    renderReceptionPage();

    const newReceptionBtn = screen.getByTestId("new-reception-btn");
    fireEvent.click(newReceptionBtn);

    const receptionForm = screen.getByTestId("reception-form");
    expect(receptionForm).toHaveStyle({ display: "block" });
  });

  it("hides reception form when close button is clicked", () => {
    renderReceptionPage();

    // Open form first
    const newReceptionBtn = screen.getByTestId("new-reception-btn");
    fireEvent.click(newReceptionBtn);

    // Close form
    const closeBtn = screen.getByTestId("close-form-btn");
    fireEvent.click(closeBtn);

    const receptionForm = screen.getByTestId("reception-form");
    expect(receptionForm).toHaveStyle({ display: "none" });
  });

  it("calls refetch when reception form submission is successful", async () => {
    renderReceptionPage();

    // Open form
    const newReceptionBtn = screen.getByTestId("new-reception-btn");
    fireEvent.click(newReceptionBtn);

    // Trigger success
    const successBtn = screen.getByTestId("success-btn");
    fireEvent.click(successBtn);

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it("passes correct props to VehicleDataTable", () => {
    renderReceptionPage();

    const {
      VehicleDataTable,
    } = require("@/app/(protected)/reception/data-table");

    expect(VehicleDataTable).toHaveBeenCalledWith(
      expect.objectContaining({
        data: mockVehicleRegistrationData,
        isLoading: false,
        dateRange: { from: expect.any(Date), to: expect.any(Date) },
        onDateRangeChange: expect.any(Function),
        onNewReception: expect.any(Function),
      }),
      expect.anything()
    );
  });

  it("passes correct props to ReceptionForm", () => {
    renderReceptionPage();

    const { ReceptionForm } = require("@/components/reception/reception-form");

    expect(ReceptionForm).toHaveBeenCalledWith(
      expect.objectContaining({
        open: false,
        onClose: expect.any(Function),
        onSuccess: expect.any(Function),
      }),
      expect.anything()
    );
  });

  it("handles date range change", () => {
    renderReceptionPage();

    const dateRangeBtn = screen.getByTestId("date-range-btn");
    fireEvent.click(dateRangeBtn);

    expect(mockUpdateDateRange).toHaveBeenCalledWith({
      from: expect.any(Date),
      to: expect.any(Date),
    });
  });

  it("shows error message when there is an error", () => {
    const errorMessage = "Failed to fetch data";
    mockUseVehicleRegistration.mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error(errorMessage),
      dateRange: { from: new Date(), to: new Date() },
      updateDateRange: mockUpdateDateRange,
      refetch: mockRefetch,
    });

    renderReceptionPage();

    expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
  });

  it("shows error message when error is a string", () => {
    const errorMessage = "Network error";
    mockUseVehicleRegistration.mockReturnValue({
      data: [],
      isLoading: false,
      error: errorMessage as any,
      dateRange: { from: new Date(), to: new Date() },
      updateDateRange: mockUpdateDateRange,
      refetch: mockRefetch,
    });

    renderReceptionPage();

    expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
  });

  it("sets default date range to today", () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    renderReceptionPage();

    expect(mockUseVehicleRegistration).toHaveBeenCalledWith({
      initialDateRange: {
        from: expect.any(Date),
        to: expect.any(Date),
      },
    });
  });

  it("renders page wrapper with correct styling", () => {
    renderReceptionPage();

    const wrapper = screen.getByTestId("vehicle-data-table").closest("div");
    expect(wrapper).toHaveClass("w-full", "p-4");
  });
});
