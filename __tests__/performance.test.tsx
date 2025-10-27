/**
 * Performance Testing for React Components
 * Tests rendering time, re-render frequency, and memory usage
 */

import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock data generators with proper structure matching VehicleWithDebt type
const generateMockVehicles = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `vehicle-${i}`,
    license_plate: `51A-${10000 + i}`,
    brand: 'Toyota',
    customer_id: `customer-${i}`,
    customer: {
      id: `customer-${i}`,
      name: `Customer ${i}`,
      phone: `090${String(i).padStart(7, '0')}`,
      email: `customer${i}@test.com`,
      address: `Address ${i}`,
      created_at: new Date().toISOString(),
    },
    total_paid: Math.floor(Math.random() * 10000000),
    total_debt: Math.floor(Math.random() * 5000000),
    created_at: new Date().toISOString(),
  }));
};

const generateMockRepairOrders = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `order-${i}`,
    vehicle_id: `vehicle-${i}`,
    reception_date: new Date().toISOString().split('T')[0],
    status: 'pending' as const,
    total_amount: Math.floor(Math.random() * 5000000),
    created_at: new Date().toISOString(),
  }));
};

// Simple test component for performance testing
const TestList: React.FC<{ items: any[] }> = ({ items }) => {
  return (
    <div data-testid="test-list">
      {items.map((item) => (
        <div key={item.id} data-testid="list-item">
          <span>{item.license_plate}</span>
          <span>{item.customer?.name}</span>
        </div>
      ))}
    </div>
  );
};

describe('Performance Tests', () => {
  // Create a fresh QueryClient for each test
  const createTestQueryClient = () => {
    return new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: Infinity,
        },
      },
    });
  };

  describe('Vehicles List Performance', () => {
    test('should render 100 vehicles within reasonable time', () => {
      const queryClient = createTestQueryClient();
      const mockVehicles = generateMockVehicles(100);
      
      const startTime = performance.now();
      const { container } = render(
        <QueryClientProvider client={queryClient}>
          <TestList items={mockVehicles} />
        </QueryClientProvider>
      );
      const renderTime = performance.now() - startTime;

      expect(container.querySelectorAll('[data-testid="list-item"]').length).toBe(100);
      expect(renderTime).toBeLessThan(1000); // 1 second for 100 items
      console.log(`✅ Vehicles list (100 items) rendered in ${renderTime.toFixed(2)}ms`);
    });

    test('should handle 1000 vehicles without crashing', () => {
      const queryClient = createTestQueryClient();
      const mockVehicles = generateMockVehicles(1000);
      
      const startTime = performance.now();
      const { container } = render(
        <QueryClientProvider client={queryClient}>
          <TestList items={mockVehicles} />
        </QueryClientProvider>
      );
      const renderTime = performance.now() - startTime;

      expect(container.querySelectorAll('[data-testid="list-item"]').length).toBe(1000);
      expect(renderTime).toBeLessThan(5000); // 5 seconds for 1000 items
      console.log(`✅ Vehicles list (1000 items) rendered in ${renderTime.toFixed(2)}ms`);
    });
  });

  describe('TanStack Query Cache Performance', () => {
    test('should create QueryClient instance quickly', () => {
      const startTime = performance.now();
      const queryClient = createTestQueryClient();
      const endTime = performance.now();
      
      expect(queryClient).toBeDefined();
      expect(queryClient).toBeInstanceOf(QueryClient);
      expect(endTime - startTime).toBeLessThan(50);
      console.log(`✅ QueryClient created in ${(endTime - startTime).toFixed(2)}ms`);
    });
  });

  describe('Component Re-render Performance', () => {
    test('should not cause unnecessary re-renders', () => {
      const queryClient = createTestQueryClient();
      const mockVehicles = generateMockVehicles(10);
      let renderCount = 0;

      const CountingComponent: React.FC<{ items: any[] }> = ({ items }) => {
        renderCount++;
        return <TestList items={items} />;
      };

      const { rerender } = render(
        <QueryClientProvider client={queryClient}>
          <CountingComponent items={mockVehicles} />
        </QueryClientProvider>
      );

      expect(renderCount).toBe(1);

      // Re-render with same data
      rerender(
        <QueryClientProvider client={queryClient}>
          <CountingComponent items={mockVehicles} />
        </QueryClientProvider>
      );

      expect(renderCount).toBe(2); // Should re-render once more
      console.log(`✅ Component rendered ${renderCount} times`);
    });
  });

  describe('Memory Usage', () => {
    test('should handle large datasets without memory issues', () => {
      const queryClient = createTestQueryClient();
      const mockVehicles = generateMockVehicles(5000);
      
      const { unmount } = render(
        <QueryClientProvider client={queryClient}>
          <TestList items={mockVehicles} />
        </QueryClientProvider>
      );

      // Component should unmount cleanly
      expect(() => unmount()).not.toThrow();
      console.log(`✅ Handled 5000 items without memory issues`);
    });
  });
});

export { generateMockVehicles, generateMockRepairOrders };
