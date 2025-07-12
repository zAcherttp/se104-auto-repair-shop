# AI Coding Agent Instructions for Automobile Repair Shop

## Project Architecture Overview

**Multi-tenant garage management system** built on Next.js 15 + Supabase with role-based access control. Core workflow: Vehicle reception → Repair tracking → Inventory management → Payment processing → Reporting.

### Critical Data Flow

- **Authentication**: Uses Supabase Auth with `is_garage_admin` boolean in user metadata (NOT profiles table)
- **RLS Security**: Each garage isolated via Row Level Security policies in Supabase
- **State Management**: TanStack Query for server state, React hooks for local state
- **Type Safety**: Database schema auto-generated as TypeScript types in `supabase/types.ts`

## Essential File Structure Patterns

```
app/
├── actions/           # Server actions grouped by feature (vehicles.ts, settings.ts, etc.)
├── (auth)/           # Public auth pages (login, track-order)
├── (protected)/      # Authenticated pages with layout
└── layout.tsx        # Root layout with providers

components/
├── ui/              # shadcn/ui base components (Button, Dialog, Table)
├── dialogs/         # Modal dialogs with proper state management
├── [feature]/       # Feature-specific components (reception/, settings/)
└── providers/       # Context providers (QueryProvider, ThemeProvider, i18n)

hooks/               # TanStack Query hooks following use-[feature].ts pattern
types/               # TypeScript definitions organized by feature
```

## Development Workflow Commands

```bash
pnpm dev --turbopack    # Development with Turbopack
pnpm test               # Jest + React Testing Library
pnpm test:watch         # Test watch mode
pnpm build              # Production build
```

## Critical Patterns & Conventions

### Server Actions Pattern

```typescript
// app/actions/[feature].ts
export async function actionName(data: FormData): Promise<ApiResponse<T>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Always check authentication & validate with Zod schemas
}
```

### TanStack Query Hook Pattern

```typescript
// hooks/use-[feature].ts
export function useFeature({ param, enabled = true }) {
  return useQuery({
    queryKey: ["feature", param],
    queryFn: async () => {
      /* Supabase call */
    },
    enabled: enabled && !!param,
    staleTime: 0, // Adjust based on data freshness needs
  });
}
```

### Database Query Patterns

- **Joins**: Use Supabase's `select("*, table:related_table(*)")` syntax
- **RLS**: Queries automatically filtered by user's garage via RLS policies
- **Types**: Import from `@/supabase/types` as `Tables<"table_name">`

### Form Handling Standard

- **Validation**: Zod schemas in `lib/form/definitions.ts`
- **Forms**: React Hook Form with `zodResolver`
- **Server Actions**: Always validate server-side with same Zod schema

## Business Logic Essentials

### User Roles & Permissions

- **Admin Check**: Use `useAdmin()` hook, NOT user metadata directly
- **Employee vs Admin**: Admins manage settings, employees handle daily operations
- **Authentication**: Only store `is_garage_admin` in auth metadata, other data in profiles table

### Vehicle Workflow States

```
Reception → Repair Order Creation → Item Assignment → Progress Tracking → Completion → Payment
```

### Critical Data Relationships

- Vehicle → Customer (one-to-one)
- Vehicle → RepairOrders (one-to-many)
- RepairOrder → RepairOrderItems (one-to-many)
- RepairOrderItem → SparePart | LaborType (polymorphic)

### Inventory Management

- **Stock Updates**: Automatically managed via `updateSparePartsStock()` function
- **Calculations**: Use `lib/inventory-calculations.ts` for stock level computations
- **Period Reports**: Beginning stock = current stock + usage during period

## Testing Approach

- **Location**: `__tests__/` directory with `.test.tsx` files
- **Mocking**: Global mocks in `jest.setup.js`, component mocks in individual tests
- **Patterns**: Focus on user interactions, not implementation details
- **Example**: See `__tests__/page.test.tsx` for comprehensive testing patterns

## Integration Points

### Supabase Integration

- **Client**: `createClient()` from `@/supabase/client` for client components
- **Server**: `createClient()` from `@/supabase/server` for server actions
- **Types**: Always use generated types from `supabase/types.ts`

### UI Component Integration

- **Base Components**: Import from `@/components/ui/` (shadcn/ui)
- **Icons**: Lucide React icons
- **Styling**: Tailwind CSS with CSS variables for theming
- **Dialogs**: Use Dialog components with proper open/close state management

### Internationalization (i18n)

- **Setup**: next-intl with cookie-based locale persistence
- **Usage**: `useTranslations("namespace")` hook in components
- **Files**: Messages in `messages/en.json` and `messages/vi.json`

## Key Areas Requiring Careful Attention

1. **RLS Policies**: Ensure all queries respect multi-tenant isolation
2. **Type Safety**: Use generated Supabase types, avoid `any`
3. **Form Validation**: Server-side validation with Zod schemas
4. **Error Handling**: Use `ApiResponse<T>` pattern with toast notifications
5. **Cache Management**: Proper TanStack Query key structure for data consistency
