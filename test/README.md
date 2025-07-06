# Test Structure Documentation

## Overview

This test suite provides comprehensive unit testing for the Reports page and its components using Jest and React Testing Library. The tests follow professional testing conventions and ensure data accuracy, component behavior, and user interactions.

## Test Structure

```
test/
├── components/
│   └── reports/
│       ├── sales-table.test.tsx
│       ├── inventory-table.test.tsx
│       └── sales-analytics-chart.test.tsx
├── pages/
│   └── reports.test.tsx
├── mocks/
│   ├── reports-data.ts
│   └── component-mocks.tsx
├── utils/
│   └── test-utils.tsx
├── setup.js
└── README.md
```

## Key Features

### 1. **Data Accuracy Testing**

- **Revenue Calculations**: Validates total revenue calculations and percentage distributions
- **Rate Calculations**: Ensures rates sum to 100% and are mathematically correct
- **Stock Balance Logic**: Verifies inventory movements are logical and realistic
- **Sequential Numbering**: Checks proper ordering and numbering of data rows

### 2. **Component Behavior Testing**

- **Rendering Logic**: Tests component rendering with different data states
- **Empty States**: Validates proper empty state handling
- **Loading States**: Ensures loading indicators work correctly
- **Error Handling**: Tests graceful error state management

### 3. **User Interaction Testing**

- **Tab Navigation**: Tests switching between sales and inventory tabs
- **Date Range Selection**: Validates month/year picker functionality
- **Component Integration**: Tests proper data flow between components

### 4. **Business Logic Validation**

- **Financial Calculations**: Ensures all monetary calculations are accurate
- **Inventory Turnover**: Validates stock movement calculations
- **Service Performance**: Tests top-performing service identification
- **Stock Alerts**: Identifies potential low stock situations

## Test Categories

### **Sales Table Tests** (`sales-table.test.tsx`)

- Data rendering and formatting
- Currency formatting validation
- Rate calculation accuracy
- Total revenue verification
- Empty state handling
- Component structure and accessibility

### **Inventory Table Tests** (`inventory-table.test.tsx`)

- Stock quantity validation
- Inventory movement logic
- Stock balance calculations
- Turnover rate verification
- Business rule validation
- Component accessibility

### **Sales Analytics Chart Tests** (`sales-analytics-chart.test.tsx`)

- Chart data visualization
- Color palette testing
- Percentage calculations
- Service performance metrics
- Interactive elements testing
- Empty state handling

### **Reports Page Tests** (`reports.test.tsx`)

- Page layout and structure
- Tab navigation functionality
- Loading state management
- Error handling and display
- Data integration between components
- Accessibility compliance

## Mock Data

### **Sales Report Mock**

```typescript
{
  month: "June 2025",
  totalRevenue: 15750000,
  orders: [
    {
      stt: 1,
      vehicleBrand: "Toyota",
      repairCount: 12,
      amount: 8400000,
      rate: 53.33,
    },
    // ... more orders
  ],
}
```

### **Inventory Report Mock**

```typescript
{
  month: "June 2025",
  inventory: [
    {
      stt: 1,
      partName: "Engine Oil (5W-30)",
      beginStock: 50,
      purchased: 25,
      endStock: 45,
    },
    // ... more inventory items
  ],
}
```

### **Sales Analytics Mock**

```typescript
{
  totalRevenue: 15750000,
  totalOrders: 28,
  averageOrderValue: 562500,
  completedOrders: 25,
  // ... more analytics data
}
```

## Running Tests

### **All Tests**

```bash
npm test
# or
pnpm test
```

### **Specific Test Files**

```bash
# Sales table tests
npm test sales-table.test.tsx

# Inventory table tests
npm test inventory-table.test.tsx

# Chart tests
npm test sales-analytics-chart.test.tsx

# Page tests
npm test reports.test.tsx
```

### **Watch Mode**

```bash
npm test -- --watch
```

### **Coverage Report**

```bash
npm test -- --coverage
```

## Test Utilities

### **Custom Render Function**

The `test-utils.tsx` provides a custom render function that includes:

- TanStack Query provider
- Test-specific query client configuration
- Proper cleanup between tests

### **Mock Components**

Component mocks are provided for:

- Chart components (Recharts)
- UI components (shadcn/ui)
- Date picker components
- Loading skeletons

## Best Practices Followed

### **1. Test Organization**

- **Descriptive Test Names**: Each test clearly describes what it's testing
- **Logical Grouping**: Related tests are grouped using `describe` blocks
- **Setup/Teardown**: Proper setup and cleanup between tests

### **2. Data Validation**

- **Accuracy Testing**: Mathematical calculations are verified
- **Edge Cases**: Empty states and error conditions are tested
- **Business Rules**: Real-world business logic is validated

### **3. User-Centric Testing**

- **Accessibility**: ARIA labels and semantic HTML are tested
- **User Interactions**: Tab navigation and form interactions are covered
- **Visual Feedback**: Loading states and error messages are validated

### **4. Clean Code Principles**

- **DRY Principle**: Mock data and utilities are reused
- **Single Responsibility**: Each test focuses on one specific behavior
- **Maintainability**: Tests are easy to understand and modify

## Data Accuracy Validations

### **Financial Calculations**

- Total revenue calculations
- Percentage distribution accuracy
- Rate calculations (sum to 100%)
- Currency formatting validation

### **Inventory Management**

- Stock balance logic (Beginning + Purchased - Used = Ending)
- Turnover rate calculations
- Stock movement validation
- Low stock identification

### **Service Analytics**

- Top service identification
- Revenue per service calculations
- Service count accuracy
- Performance metric validation

## Error Scenarios Tested

### **Data Errors**

- Empty data arrays
- Undefined data objects
- Invalid numerical values
- Missing required fields

### **Component Errors**

- Rendering failures
- Missing dependencies
- Invalid props
- State management errors

### **User Interaction Errors**

- Invalid date selections
- Tab navigation failures
- Component communication errors

## Accessibility Testing

### **ARIA Compliance**

- Proper role attributes
- Descriptive labels
- Keyboard navigation support
- Screen reader compatibility

### **Semantic HTML**

- Proper heading structure
- Table accessibility
- Form accessibility
- Focus management

This test suite provides comprehensive coverage for the Reports page functionality, ensuring both technical correctness and business logic validation while maintaining high code quality standards.
