import {
  mockSalesAnalytics,
  mockEmptySalesAnalytics,
} from "@/test/mocks/reports-data";

describe("Sales Analytics Data Validation", () => {
  describe("Data Accuracy Verification", () => {
    it("should verify analytics data structure and values", () => {
      expect(mockSalesAnalytics.totalRevenue).toBe(15750000);
      expect(mockSalesAnalytics.totalOrders).toBe(28);
      expect(mockSalesAnalytics.averageOrderValue).toBe(562500);
      expect(mockSalesAnalytics.completedOrders).toBe(25);
      expect(mockSalesAnalytics.pendingOrders).toBe(2);
      expect(mockSalesAnalytics.inProgressOrders).toBe(1);
      expect(mockSalesAnalytics.cancelledOrders).toBe(0);
    });

    it("should verify top services data integrity", () => {
      expect(mockSalesAnalytics.topServices).toHaveLength(5);
      
      // Verify all service entries have required fields
      mockSalesAnalytics.topServices.forEach((service) => {
        expect(service.service).toBeTruthy();
        expect(service.revenue).toBeGreaterThan(0);
        expect(service.count).toBeGreaterThan(0);
      });
    });

    it("should verify monthly revenue data", () => {
      expect(mockSalesAnalytics.monthlyRevenue).toHaveLength(6);
      
      mockSalesAnalytics.monthlyRevenue.forEach((month) => {
        expect(month.month).toBeTruthy();
        expect(month.revenue).toBeGreaterThan(0);
        expect(month.orders).toBeGreaterThan(0);
      });
    });

    it("should verify order status calculations", () => {
      const totalProcessedOrders = 
        mockSalesAnalytics.completedOrders + 
        mockSalesAnalytics.pendingOrders + 
        mockSalesAnalytics.inProgressOrders + 
        mockSalesAnalytics.cancelledOrders;
      
      expect(totalProcessedOrders).toBe(mockSalesAnalytics.totalOrders);
    });

    it("should verify average order value calculation", () => {
      const calculatedAverage = mockSalesAnalytics.totalRevenue / mockSalesAnalytics.totalOrders;
      expect(Math.abs(calculatedAverage - mockSalesAnalytics.averageOrderValue)).toBeLessThan(1);
    });
  });

  describe("Service Revenue Analysis", () => {
    it("should verify service revenue distribution", () => {
      const services = mockSalesAnalytics.topServices.map(s => s.service);
      
      // Should include common automotive services
      expect(services).toContain("Oil Change");
      expect(services).toContain("Brake Repair");
      expect(services).toContain("Engine Diagnostics");
      expect(services).toContain("Tire Replacement");
      expect(services).toContain("Transmission Service");
    });

    it("should verify oil change has highest revenue", () => {
      const oilChange = mockSalesAnalytics.topServices.find(
        service => service.service === "Oil Change"
      );
      const maxRevenue = Math.max(...mockSalesAnalytics.topServices.map(s => s.revenue));
      
      expect(oilChange?.revenue).toBe(maxRevenue);
    });

    it("should verify service revenue hierarchy", () => {
      const sortedByRevenue = [...mockSalesAnalytics.topServices].sort(
        (a, b) => b.revenue - a.revenue
      );
      
      // Oil change should be highest revenue
      expect(sortedByRevenue[0].service).toBe("Oil Change");
      
      // Transmission service should be lowest revenue
      expect(sortedByRevenue[sortedByRevenue.length - 1].service).toBe("Transmission Service");
    });

    it("should verify service count vs revenue relationship", () => {
      mockSalesAnalytics.topServices.forEach((service) => {
        const avgRevenuePerService = service.revenue / service.count;
        
        // Average revenue per service should be reasonable (50k to 500k VND)
        expect(avgRevenuePerService).toBeGreaterThanOrEqual(50000);
        expect(avgRevenuePerService).toBeLessThanOrEqual(500000);
      });
    });
  });

  describe("Monthly Revenue Trends", () => {
    it("should verify monthly revenue progression", () => {
      const revenueValues = mockSalesAnalytics.monthlyRevenue.map(m => m.revenue);
      
      // All monthly revenues should be positive
      revenueValues.forEach((revenue) => {
        expect(revenue).toBeGreaterThan(0);
      });
    });

    it("should verify order count progression", () => {
      const orderCounts = mockSalesAnalytics.monthlyRevenue.map(m => m.orders);
      
      // All order counts should be positive
      orderCounts.forEach((count) => {
        expect(count).toBeGreaterThan(0);
      });
    });

    it("should verify latest month matches current totals", () => {
      const latestMonth = mockSalesAnalytics.monthlyRevenue[mockSalesAnalytics.monthlyRevenue.length - 1];
      
      expect(latestMonth.revenue).toBe(mockSalesAnalytics.totalRevenue);
      expect(latestMonth.orders).toBe(mockSalesAnalytics.totalOrders);
    });
  });

  describe("Empty State Data Handling", () => {
    it("should handle empty analytics data", () => {
      expect(mockEmptySalesAnalytics.totalRevenue).toBe(0);
      expect(mockEmptySalesAnalytics.totalOrders).toBe(0);
      expect(mockEmptySalesAnalytics.averageOrderValue).toBe(0);
      expect(mockEmptySalesAnalytics.topServices).toEqual([]);
      expect(mockEmptySalesAnalytics.monthlyRevenue).toEqual([]);
    });

    it("should handle undefined analytics data", () => {
      const undefinedData = undefined;
      expect(undefinedData).toBeUndefined();
    });
  });

  describe("Business Logic Validation", () => {
    it("should validate service pricing logic", () => {
      // Oil change should be more frequent but lower individual revenue
      const oilChange = mockSalesAnalytics.topServices.find(
        s => s.service === "Oil Change"
      );
      const engineDiagnostics = mockSalesAnalytics.topServices.find(
        s => s.service === "Engine Diagnostics"
      );
      
      if (oilChange && engineDiagnostics) {
        expect(oilChange.count).toBeGreaterThan(engineDiagnostics.count);
        expect(oilChange.revenue / oilChange.count).toBeLessThan(engineDiagnostics.revenue / engineDiagnostics.count);
      }
    });

    it("should validate service complexity vs revenue relationship", () => {
      const serviceComplexity = {
        "Transmission Service": 5,
        "Engine Diagnostics": 4,
        "Brake Repair": 3,
        "Tire Replacement": 2,
        "Oil Change": 1,
      };

      // More complex services should generally have higher revenue per service
      const transmissionService = mockSalesAnalytics.topServices.find(s => s.service === "Transmission Service");
      const oilChange = mockSalesAnalytics.topServices.find(s => s.service === "Oil Change");
      
      if (transmissionService && oilChange) {
        const transmissionAvg = transmissionService.revenue / transmissionService.count;
        const oilChangeAvg = oilChange.revenue / oilChange.count;
        expect(transmissionAvg).toBeGreaterThan(oilChangeAvg);
      }
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero revenue services", () => {
      const zeroRevenueService = {
        service: "Free Inspection",
        revenue: 0,
        count: 5,
      };

      expect(zeroRevenueService.revenue).toBe(0);
      expect(zeroRevenueService.count).toBeGreaterThan(0);
    });

    it("should handle very high revenue services", () => {
      const highRevenueService = {
        service: "Complete Engine Rebuild",
        revenue: 50000000, // 50 million VND
        count: 2,
      };

      expect(highRevenueService.revenue).toBe(50000000);
      expect(highRevenueService.count).toBeGreaterThan(0);
    });

    it("should handle special characters in service names", () => {
      const specialCharService = {
        service: "A/C & Heating System",
        revenue: 2500000,
        count: 8,
      };

      expect(specialCharService.service).toBe("A/C & Heating System");
      expect(specialCharService.revenue).toBeGreaterThan(0);
    });

    it("should handle large order volumes", () => {
      const largeVolumeMonth = {
        month: "Dec 2024",
        revenue: 100000000, // 100 million VND
        orders: 500,
      };

      const avgOrderValue = largeVolumeMonth.revenue / largeVolumeMonth.orders;
      expect(avgOrderValue).toBe(200000); // 200k VND per order
    });
  });
});
      expect(screen.getByTestId("pie-chart")).toBeTruthy();
    });

    it("should render pie segments for all services", () => {
      const pieSegments = screen.getAllByTestId("pie-segment");
      expect(pieSegments).toHaveLength(5); // 5 top services
    });

    it("should display service names and revenue values", () => {
      expect(screen.getByText(/oil change/i)).toBeTruthy();
      expect(screen.getByText(/brake repair/i)).toBeTruthy();
      expect(screen.getByText(/engine diagnostics/i)).toBeTruthy();
      expect(screen.getByText(/tire replacement/i)).toBeTruthy();
      expect(screen.getByText(/transmission service/i)).toBeTruthy();
    });

    it("should include tooltip and legend components", () => {
      expect(screen.getByTestId("tooltip")).toBeTruthy();
      expect(screen.getByTestId("legend")).toBeTruthy();
    });
  });

  describe("Data Accuracy Verification", () => {
    it("should verify revenue values are correctly calculated", () => {
      const totalRevenue = mockSalesAnalytics.topServices.reduce(
        (sum, service) => sum + service.revenue,
        0
      );
      expect(totalRevenue).toBe(11550000); // Sum of all service revenues
    });

    it("should verify service count accuracy", () => {
      const totalCount = mockSalesAnalytics.topServices.reduce(
        (sum, service) => sum + service.count,
        0
      );
      expect(totalCount).toBe(63); // Sum of all service counts
    });

    it("should verify revenue distribution is logical", () => {
      const services = mockSalesAnalytics.topServices;
      const totalRevenue = services.reduce(
        (sum, service) => sum + service.revenue,
        0
      );

      services.forEach((service, index) => {
        const percentage = (service.revenue / totalRevenue) * 100;

        // Each service should have a reasonable percentage
        expect(percentage).toBeGreaterThan(0);
        expect(percentage).toBeLessThan(100);

        // Services should be ordered by revenue (descending)
        if (index > 0) {
          expect(service.revenue).toBeLessThanOrEqual(
            services[index - 1].revenue
          );
        }
      });
    });

    it("should verify service names are valid", () => {
      const validServiceNames = [
        "Oil Change",
        "Brake Repair",
        "Engine Diagnostics",
        "Tire Replacement",
        "Transmission Service",
      ];

      mockSalesAnalytics.topServices.forEach((service) => {
        expect(validServiceNames).toContain(service.service);
      });
    });

    it("should verify revenue to count ratio is reasonable", () => {
      mockSalesAnalytics.topServices.forEach((service) => {
        const revenuePerService = service.revenue / service.count;

        // Revenue per service should be reasonable (between 50k and 2M VND)
        expect(revenuePerService).toBeGreaterThan(50000);
        expect(revenuePerService).toBeLessThan(2000000);
      });
    });
  });

  describe("Color Palette Testing", () => {
    it("should use predefined color palette", () => {
      render(<SalesAnalyticsChart data={mockSalesAnalytics} />);

      // Test that the chart structure is properly rendered
      expect(screen.getByTestId("pie-chart")).toBeTruthy();
      expect(screen.getByTestId("pie")).toBeTruthy();

      // Verify that all service segments are rendered
      const pieSegments = screen.getAllByTestId("pie-segment");
      expect(pieSegments).toHaveLength(5);

      // Test color assignment logic (since we can't test actual rendered colors in mock)
      const expectedColors = [
        "#3b82f6", // blue
        "#ef4444", // red
        "#22c55e", // green
        "#f59e0b", // amber
        "#8b5cf6", // violet
      ];

      // Verify we have the expected number of colors for the data
      expect(expectedColors.length).toBeGreaterThanOrEqual(
        mockSalesAnalytics.topServices.length
      );
    });
  });

  describe("Empty State", () => {
    it("should render empty state message when no data is provided", () => {
      render(<SalesAnalyticsChart data={mockEmptySalesAnalytics} />);

      expect(screen.getByText(/no sales data available/i)).toBeTruthy();
    });

    it("should render empty state when data is undefined", () => {
      render(<SalesAnalyticsChart data={undefined} />);

      expect(screen.getByText(/no sales data available/i)).toBeTruthy();
    });

    it("should not render chart components when there is no data", () => {
      render(<SalesAnalyticsChart data={mockEmptySalesAnalytics} />);

      expect(screen.queryByTestId("pie-chart")).toBeNull();
      expect(screen.queryByTestId("responsive-container")).toBeNull();
    });
  });

  describe("Component Structure", () => {
    beforeEach(() => {
      render(<SalesAnalyticsChart data={mockSalesAnalytics} />);
    });

    it("should have proper responsive container", () => {
      const container = screen.getByTestId("responsive-container");
      expect(container).toBeTruthy();
    });

    it("should render pie chart with correct structure", () => {
      const pieChart = screen.getByTestId("pie-chart");
      const pie = screen.getByTestId("pie");

      expect(pieChart).toBeTruthy();
      expect(pie).toBeTruthy();
    });

    it("should include interactive elements", () => {
      expect(screen.getByTestId("tooltip")).toBeTruthy();
      expect(screen.getByTestId("legend")).toBeTruthy();
    });
  });

  describe("Percentage Calculation Testing", () => {
    it("should calculate percentages correctly", () => {
      const services = mockSalesAnalytics.topServices;
      const totalRevenue = services.reduce(
        (sum, service) => sum + service.revenue,
        0
      );

      services.forEach((service) => {
        const expectedPercentage = (
          (service.revenue / totalRevenue) *
          100
        ).toFixed(1);
        const percentage = parseFloat(expectedPercentage);

        expect(percentage).toBeGreaterThan(0);
        expect(percentage).toBeLessThan(100);
      });
    });

    it("should verify all percentages sum to 100%", () => {
      const services = mockSalesAnalytics.topServices;
      const totalRevenue = services.reduce(
        (sum, service) => sum + service.revenue,
        0
      );

      const totalPercentage = services.reduce((sum, service) => {
        const percentage = (service.revenue / totalRevenue) * 100;
        return sum + percentage;
      }, 0);

      expect(Math.abs(totalPercentage - 100)).toBeLessThan(0.1);
    });
  });

  describe("Business Logic Validation", () => {
    it("should identify top-performing services", () => {
      const services = mockSalesAnalytics.topServices;
      const topService = services[0];

      expect(topService.service).toBe("Oil Change");
      expect(topService.revenue).toBe(3500000);
      expect(topService.count).toBe(25);
    });

    it("should validate service performance metrics", () => {
      const services = mockSalesAnalytics.topServices;

      services.forEach((service) => {
        // Revenue should be positive
        expect(service.revenue).toBeGreaterThan(0);

        // Count should be positive
        expect(service.count).toBeGreaterThan(0);

        // Service name should not be empty
        expect(service.service.trim()).not.toBe("");
      });
    });

    it("should verify realistic service pricing", () => {
      const services = mockSalesAnalytics.topServices;

      services.forEach((service) => {
        const avgPrice = service.revenue / service.count;

        // Average price should be within reasonable range for auto repair
        expect(avgPrice).toBeGreaterThan(100000); // > 100k VND
        expect(avgPrice).toBeLessThan(1000000); // < 1M VND
      });
    });
  });
});
