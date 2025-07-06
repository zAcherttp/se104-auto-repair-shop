import React from "react";

// Mock for MonthYearPicker component
export const MockMonthYearPicker = jest
  .fn()
  .mockImplementation(
    ({
      onUpdate,
      initialMonth,
      initialYear,
    }: {
      onUpdate?: (values: { range: { from?: Date; to?: Date } }) => void;
      initialMonth: number;
      initialYear: number;
    }) => {
      return (
        <div data-testid="month-year-picker">
          <button
            onClick={() =>
              onUpdate?.({
                range: {
                  from: new Date(initialYear, initialMonth, 1),
                },
              })
            }
          >
            {initialMonth + 1}/{initialYear}
          </button>
        </div>
      );
    }
  );

// Mock for Chart components
export const MockSalesAnalyticsChart = jest
  .fn()
  .mockImplementation(({ data }: { data?: any }) => (
    <div data-testid="sales-analytics-chart">
      {data?.topServices?.length > 0 ? (
        <div>Chart with {data.topServices.length} services</div>
      ) : (
        <div>No sales data available</div>
      )}
    </div>
  ));

export const MockSalesTable = jest
  .fn()
  .mockImplementation(({ data }: { data?: any }) => (
    <div data-testid="sales-table">
      {data?.orders?.length > 0 ? (
        <table>
          <tbody>
            {data.orders.map((order: any, index: number) => (
              <tr key={index}>
                <td>{order.vehicleBrand}</td>
                <td>{order.repairCount}</td>
                <td>{order.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>No sales data available for this period</div>
      )}
    </div>
  ));

export const MockInventoryTable = jest
  .fn()
  .mockImplementation(({ data }: { data?: any }) => (
    <div data-testid="inventory-table">
      {data?.inventory?.length > 0 ? (
        <table>
          <tbody>
            {data.inventory.map((item: any, index: number) => (
              <tr key={index}>
                <td>{item.partName}</td>
                <td>{item.beginStock}</td>
                <td>{item.purchased}</td>
                <td>{item.endStock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>No inventory data available</div>
      )}
    </div>
  ));

// Mock for UI components
export const MockSkeleton = jest
  .fn()
  .mockImplementation(({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className}>
      Loading...
    </div>
  ));

export const MockAlert = jest
  .fn()
  .mockImplementation(
    ({
      variant,
      children,
    }: {
      variant?: string;
      children?: React.ReactNode;
    }) => (
      <div data-testid="alert" data-variant={variant}>
        {children}
      </div>
    )
  );

export const MockAlertDescription = jest
  .fn()
  .mockImplementation(({ children }: { children?: React.ReactNode }) => (
    <div data-testid="alert-description">{children}</div>
  ));
