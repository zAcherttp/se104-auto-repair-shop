---
applyTo: "**/*.{ts,tsx,js,jsx}"
---

# Automobile Repair Shop - Development Guidelines

This document provides comprehensive development guidelines for AI agents and developers working on the Automobile Repair Shop project.

## Project Overview

### Technology Stack

- **Framework**: Next.js 15+ with App Router and TypeScript
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS)
- **Authentication**: Supabase Auth with role-based access control
- **UI Framework**: Tailwind CSS v4.1.10 + shadcn/ui components
- **State Management**: TanStack Query v5.80+ for server state, React hooks for local state
- **Form Handling**: React Hook Form v7.58+ with Zod validation
- **Tables**: TanStack Table v8.21+ for data tables
- **Testing**: Jest + React Testing Library + @testing-library/jest-dom
- **Package Manager**: pnpm v10.12+

### Core Business Logic

- **User Roles**: Garage admins (`is_garage_admin: true`) and employees with different permissions
- **Core Features**: Vehicle reception, repair management, inventory tracking, invoicing, debt management
- **Daily Limits**: Configurable vehicle reception limits with warnings and blocking
- **Settings**: Garage info, employee management, parts/labor types, car brands
- **Multi-tenant**: Each garage has isolated data with proper RLS policies

### Architecture Patterns

- **Server Actions**: Located in `app/actions/` grouped by feature
- **Client Components**: Organized by feature/page in `components/`
- **Custom Hooks**: Reusable logic in `hooks/` with TanStack Query integration
- **Type Safety**: Comprehensive TypeScript with database-generated types
- **Error Handling**: Structured `ApiResponse<T>` pattern with toast notifications

## File Organization & Structure

### Project Directory Structure

```
e:\Web\automobile-repair-shop\
├── app/                           # Next.js App Router
│   ├── (auth)/                   # Authentication pages (login, track-order)
│   ├── (protected)/              # Protected pages with authentication
│   ├── actions/                  # Server actions grouped by feature
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/                   # Reusable UI components
│   ├── ui/                       # shadcn/ui base components
│   ├── dialogs/                  # Modal dialogs
│   ├── [feature]/                # Feature-specific components
│   └── providers/                # Context providers
├── hooks/                        # Custom React hooks
├── lib/                          # Utility functions
├── supabase/                     # Database client and types
├── types/                        # TypeScript definitions
├── test/                         # Test files
├── .github/instructions/         # Development guidelines
└── package.json                  # Dependencies and scripts
```

### Key Directories Explained

#### `app/actions/`

Server actions grouped by feature:

- `settings.ts` - Employee management, garage settings, parts/labor types
- `vehicles.ts` - Vehicle CRUD, daily limits, reception management
- `debt-management.ts` - Payment processing, debt tracking
- `reports.ts` - Sales and inventory analytics
- `inventory.ts` - Parts and inventory management
- `tasks.ts` - Task management and assignment
- `login.ts` - Authentication actions

#### `components/`

- **Feature-based organization**: `reception/`, `settings/`, `reports/`, etc.
- **Shared components**: `app-header.tsx`, `app-sidebar.tsx`, etc.
- **UI components**: `ui/` contains shadcn/ui base components
- **Dialogs**: `dialogs/` for modal components with proper state management

#### `hooks/`

Custom hooks following the pattern `use-[feature-name].ts`:

- `use-garage-info.ts` - Garage information fetching
- `use-daily-vehicle-limit.ts` - Daily vehicle limit status
- `use-employees.ts` - Employee management
- `use-vehicles.ts` - Vehicle operations
- All hooks use TanStack Query for caching and state management

#### `types/`

TypeScript definitions organized by feature:

- `types.ts` - Core application types
- `settings.ts` - Settings-related types
- `reports.ts` - Report and analytics types
- `debt-management.ts` - Payment and debt types
- `dialog.ts` - Dialog component types

## Code Quality Standards

### TypeScript Best Practices

- **Strict Configuration**: Use strict TypeScript with proper type annotations
- **Variable Declarations**: Prefer `const` by default, `let` only when reassignment needed
- **Module Exports**: Use `export default` for primary exports, named exports for utilities
- **Type Safety**: Avoid `any`, leverage union types, generics, and database-generated types
- **Modern Syntax**: Use optional chaining (`?.`) and nullish coalescing (`??`) operators
- **Type Imports**: Use `import type` for type-only imports

### Function & Component Standards

- **Arrow Functions**: Use for callbacks and short functions: `const handler = (e) => { ... }`
- **Function Declarations**: Use for main component/utility functions when hoisting beneficial
- **Naming Conventions**:
  - `camelCase` for variables/functions
  - `PascalCase` for types/interfaces/components
  - `UPPER_CASE` for constants
  - Descriptive names: `getUserById` not `getUser`, `isLoading` not `loading`
- **Component Design**: Keep components focused (< 100 lines ideally), single responsibility
- **Composition**: Prefer composition over complex prop drilling

### Database & API Patterns

- **Consistent Responses**: Use `ApiResponse<T>` type for all server actions
- **Error Handling**: Implement try-catch blocks with structured error responses
- **Database Operations**: Use Supabase client with proper RLS policies
- **Authentication**: Always check user roles using `checkAdminRole()` helpers
- **User Metadata**: Store only `is_garage_admin` boolean in `auth.users.user_metadata`
- **Profile Data**: Store all other user info in the `profiles` table

### Project-Specific Conventions

- **Database Schema**: snake_case for DB, camelCase for TypeScript
- **Form Validation**: React Hook Form with Zod schemas
- **Data Fetching**: TanStack Query hooks for caching and optimistic updates
- **Error Feedback**: Toast notifications for user feedback
- **Loading States**: Implement proper loading states and error boundaries

## Testing Strategy

### Testing Stack & Configuration

- **Framework**: Jest v30.0.4 with jsdom environment
- **Component Testing**: React Testing Library v16.3.0
- **User Interaction**: @testing-library/user-event v14.6.1
- **Assertions**: @testing-library/jest-dom v6.6.3
- **Configuration**: See `jest.config.mjs` and `jest.setup.js`

### Testing Patterns & Best Practices

#### Test Organization

- **File Structure**: `__tests__/[component-name].test.tsx`
- **Group Related Tests**: Use `describe` blocks for logical grouping
- **Descriptive Names**: Test names should explain expected behavior
- **Setup/Teardown**: Use `beforeEach` for common setup, mock cleanup

#### Mock Management

- **Reset Mocks**: Always reset mocks in `beforeEach` to prevent test pollution
- **Realistic Data**: Provide mock data that matches production scenarios
- **Proper Typing**: Ensure mocks are properly typed with TypeScript
- **Global Mocks**: Add globally needed mocks to `jest.setup.js`

#### Testing Categories

1. **User Interaction Testing**: Focus on user-driven actions (clicks, form submissions)
2. **Content Rendering**: Verify correct rendering based on different data states
3. **Error Handling**: Test graceful handling of error states
4. **Loading States**: Verify loading indicators and async operations
5. **Accessibility**: Check proper ARIA attributes and semantic HTML

#### Element Selection Best Practices

- **Prefer Semantic**: Use `getByRole` for semantic elements
- **Content Verification**: Use `getByText` with case-insensitive regex: `/text/i`
- **Avoid Test IDs**: Use `getByTestId` sparingly, only when semantic queries insufficient
- **Type Casting**: Cast elements when accessing specific properties: `as HTMLButtonElement`

#### Assertion Patterns

- **Compatibility**: Use `.toBeTruthy()` instead of Jest DOM matchers for compatibility
- **Async Operations**: Use `waitFor` for asynchronous operations
- **Side Effects**: Verify navigation, API calls, and state changes occur correctly

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test __tests__/page.test.tsx
```

### Test Reference

- **Comprehensive Example**: See `__tests__/page.test.tsx` for landing page testing patterns
- **Documentation**: Refer to `TESTING.md` for detailed testing guidelines
- **Mocking Patterns**: Check `jest.setup.js` for established mock patterns

## Development Workflow

### Planning & Implementation

#### Pre-Implementation Checklist

1. **Read Existing Code**: Always read related files to understand current patterns
2. **Check Documentation**: Review `TODO.md` for current priorities and context
3. **Understand Dependencies**: Check related components, hooks, and actions
4. **Plan Implementation**: Propose clear implementation plan before coding
5. **Consider Impact**: Identify potential breaking changes and user workflow impacts

#### Implementation Process

1. **Start Small**: Make incremental changes rather than large batch updates
2. **Follow Patterns**: Use existing code patterns and conventions
3. **Test Incrementally**: Verify changes work as expected during development
4. **Document Changes**: Update `TODO.md` with progress and completion notes
5. **Clean Code**: Remove debugging code, unused imports, and dead code

#### Code Organization Best Practices

- **Import Ordering**: React/Next.js → External libraries → Internal utilities → Types → Relative imports
- **Remove Unused Code**: Consistently clean up unused imports, variables, and functions
- **Group Related Logic**: Keep related functionality together within files
- **Extract Reusable Code**: Move reusable logic to utility functions or custom hooks
- **Use Index Files**: Create clean import paths with index files where appropriate

### Database & Schema Changes

#### Database Operations

- **RLS Policies**: Ensure proper Row Level Security for multi-tenant data
- **Type Generation**: Update Supabase types when schema changes
- **Migration Testing**: Test schema changes with different user roles
- **Rollback Plan**: Consider rollback strategies for breaking changes

#### User Management Patterns

- **Admin Checks**: Always use `checkAdminRole()` for admin-only operations
- **User Metadata**: Only store `is_garage_admin` boolean in auth metadata
- **Profile Data**: Store all other user info in `profiles` table
- **Role Synchronization**: Keep auth metadata and profile data synchronized

### Error Handling & User Experience

#### Error Handling Standards

- **Structured Responses**: Use `ApiResponse<T>` pattern consistently
- **User Feedback**: Provide clear, actionable error messages
- **Toast Notifications**: Use toast notifications for user feedback
- **Loading States**: Implement proper loading states and error boundaries
- **Graceful Degradation**: Ensure app remains functional with partial failures

#### Performance Considerations

- **TanStack Query**: Use for server state caching and optimistic updates
- **React.memo**: Apply judiciously for expensive renders
- **Bundle Optimization**: Avoid unnecessary imports and use lazy loading
- **Database Queries**: Optimize queries and use proper indexing

## AI Agent Specific Guidelines

### Context Gathering & Analysis

#### Pre-Task Requirements

- **Read Related Files**: Always read existing code to understand patterns before making changes
- **Check Project Status**: Review `TODO.md` for current priorities and completed tasks
- **Understand User Roles**: Know the difference between admin and employee permissions
- **Review Dependencies**: Check related components, hooks, and actions for consistency
- **Identify Patterns**: Look for established patterns in similar features

#### Common Context Files to Review

- `TESTING.md` - Testing patterns and best practices
- `TODO.md` - Current project status and priorities
- `package.json` - Dependencies and available scripts
- `supabase/types.ts` - Database schema and types
- `types/` directory - Application type definitions
- Related components and hooks in the same feature area

### Communication & Documentation

#### Implementation Communication

- **Provide Clear Explanations**: Explain what changed and why specific approaches were chosen
- **Highlight Impacts**: Mention potential impacts or considerations for other features
- **Suggest Testing**: Recommend testing steps for new features
- **Document Decisions**: Explain complex business logic and architectural choices

#### Progress Tracking

- **Update TODO.md**: Mark tasks as complete with timestamps and brief summaries
- **Implementation Summaries**: Write short, concise summaries focusing on changes and reasons
- **Error Documentation**: Document any issues encountered and their solutions

### Common Development Patterns

#### Adding New Features

1. **Research Phase**: Check similar existing features for established patterns
2. **Type Definitions**: Create/update types in appropriate `types/` files
3. **Server Actions**: Implement backend logic in `app/actions/[feature].ts`
4. **UI Components**: Create components in `components/[feature]/`
5. **Custom Hooks**: Add hooks in `hooks/use-[feature].ts` if needed
6. **Testing**: Write tests following patterns in `__tests__/`
7. **Documentation**: Update relevant documentation files

#### Database Operations

- **Use Established Clients**: Use patterns from `supabase/client.ts` or `supabase/server.ts`
- **Follow RLS Patterns**: Ensure proper Row Level Security implementation
- **Update Types**: Regenerate TypeScript types when schema changes
- **Test Permissions**: Verify functionality with different user roles (admin/employee)
- **Error Handling**: Implement proper error handling with structured responses

#### UI Development

- **Use Existing Components**: Leverage components from `components/ui/` (shadcn/ui)
- **Follow Design Patterns**: Use established patterns for forms, modals, tables
- **Implement States**: Include proper loading states and error handling
- **Ensure Accessibility**: Follow accessibility best practices and ARIA guidelines
- **Responsive Design**: Ensure components work across different screen sizes

### Project-Specific Considerations

#### Critical Business Logic

- **Daily Vehicle Limits**: Reception has configurable daily limits with warnings/blocking
- **User Metadata**: Only store `is_garage_admin` boolean in auth metadata
- **Profile Data**: All other user info stored in `profiles` table
- **Role Verification**: Always verify user permissions before sensitive operations
- **Multi-tenant Data**: Ensure proper data isolation between garages

#### Common Gotchas & Solutions

- **RLS Policies**: Verify Row Level Security policies allow required operations
- **Type Compatibility**: Ensure TypeScript types match database schema
- **Authentication State**: Handle loading states during authentication checks
- **Error Messages**: Provide user-friendly error messages with toast notifications
- **Form Validation**: Use React Hook Form with Zod schemas for consistency

#### Performance & Optimization

- **TanStack Query**: Use for server state management and caching
- **Optimistic Updates**: Implement optimistic updates for better user experience
- **Loading States**: Show appropriate loading indicators during async operations
- **Error Boundaries**: Implement proper error boundaries for graceful failure handling

### Testing & Quality Assurance

#### Testing Requirements

- **Follow Established Patterns**: Use patterns from `__tests__/page.test.tsx`
- **Test User Interactions**: Focus on user-driven actions and outcomes
- **Mock External Dependencies**: Use established mocking patterns from `jest.setup.js`
- **Test Error States**: Verify graceful handling of error conditions
- **Accessibility Testing**: Check proper ARIA attributes and semantic HTML

#### Quality Checklist

- **Run Tests**: Execute `pnpm test` before major changes
- **Check TypeScript**: Ensure no TypeScript errors
- **Remove Dead Code**: Clean up unused imports and variables
- **Performance Review**: Check for unnecessary re-renders or expensive operations
- **Security Review**: Verify proper authentication and authorization

### Tools & Environment

#### Development Commands

```bash
# Development server with hot reload
pnpm dev

# Run tests
pnpm test
pnpm test:watch
pnpm test:coverage

# Linting and type checking
pnpm lint

# Build for production
pnpm build
```

#### Key Dependencies

- **Next.js 15+**: App Router with server actions
- **React 19**: Latest React with modern features
- **TanStack Query 5.80+**: Server state management
- **Supabase**: Database and authentication
- **Tailwind CSS 4.1+**: Styling with shadcn/ui components
- **TypeScript 5**: Strict type checking
- **Jest + RTL**: Testing framework
