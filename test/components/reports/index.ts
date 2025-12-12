// Reports test suite index
// This file provides documentation and overview for all reports-related tests

/**
 * Reports Test Suite Overview
 *
 * This test suite covers the data-related functionality of the reports system:
 *
 * Test Files:
 *
 * 1. reports-actions.test.tsx
 *    - Tests server actions for fetching sales and inventory analytics
 *    - Tests data fetching for B51 (sales) and B52 (inventory) reports
 *    - Validates error handling and authentication
 *    - Coverage: getSalesAnalytics, getInventoryAnalytics, getSalesReport, getInventoryReport
 *
 * 2. use-reports-hook.test.tsx
 *    - Tests the custom hook that manages report queries
 *    - Validates TanStack Query integration
 *    - Tests loading states and error handling
 *    - Coverage: useReportsQuery hook functionality
 *
 * 3. sales-analytics-chart.test.tsx
 *    - Tests data processing for the sales pie chart
 *    - Validates chart data transformation
 *    - Tests empty state handling
 *    - Coverage: SalesAnalyticsChart component data layer
 *
 * 4. sales-table.test.tsx
 *    - Tests sales report table data rendering
 *    - Validates currency formatting and calculations
 *    - Tests B51 report structure compliance
 *    - Coverage: SalesTable component data layer
 *
 * 5. inventory-table.test.tsx
 *    - Tests inventory report table data rendering
 *    - Validates stock quantity display and formatting
 *    - Tests B52 report structure compliance
 *    - Coverage: InventoryTable component data layer
 *
 * Test Focus Areas:
 * - Data fetching and processing
 * - Error handling and edge cases
 * - Data formatting and calculations
 * - Component data flow
 * - Empty state handling
 * - Authentication and permission validation
 *
 * Mock Data:
 * - Uses centralized mock data from @/test/mocks/reports-data
 * - Includes realistic sales and inventory analytics
 * - Covers edge cases like empty data states
 *
 * Testing Patterns:
 * - Follows project testing guidelines
 * - Focuses on data layer functionality rather than UI/UX aspects
 * - Uses React Testing Library for component testing
 * - Implements proper mock cleanup and setup
 *
 * Running Tests:
 * - Run all reports tests: `pnpm test test/components/reports`
 * - Run specific test: `pnpm test [test-file-name]`
 * - Run with coverage: `pnpm test:coverage test/components/reports`
 */

/**
 * Reports Test Suite Overview
 *
 * This test suite covers the data-related functionality of the reports system:
 *
 * 1. reports-actions.test.tsx
 *    - Tests server actions for fetching sales and inventory analytics
 *    - Tests data fetching for B51 (sales) and B52 (inventory) reports
 *    - Validates error handling and authentication
 *
 * 2. use-reports-hook.test.tsx
 *    - Tests the custom hook that manages report queries
 *    - Validates TanStack Query integration
 *    - Tests loading states and error handling
 *
 * 3. sales-analytics-chart.test.tsx
 *    - Tests data processing for the sales pie chart
 *    - Validates chart data transformation
 *    - Tests empty state handling
 *
 * 4. sales-table.test.tsx
 *    - Tests sales report table data rendering
 *    - Validates currency formatting and calculations
 *    - Tests B51 report structure compliance
 *
 * 5. inventory-table.test.tsx
 *    - Tests inventory report table data rendering
 *    - Validates stock quantity display and formatting
 *    - Tests B52 report structure compliance
 *
 * Test Focus Areas:
 * - Data fetching and processing
 * - Error handling and edge cases
 * - Data formatting and calculations
 * - Component data flow
 * - Empty state handling
 *
 * Note: These tests focus on data layer functionality rather than UI/UX aspects,
 * following the project's testing guidelines for component data handling.
 */
