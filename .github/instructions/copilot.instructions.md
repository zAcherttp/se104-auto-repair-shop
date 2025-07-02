---
applyTo: "**/*.ts"
---

## Code Quality Standards

### TypeScript Best Practices

- Use strict TypeScript configuration with proper type annotations
- Prefer `const` and `let` over `var` - use `const` by default, `let` only when reassignment is needed
- Use `export default` for primary module exports, named exports for utilities
- Leverage TypeScript's type system - avoid `any`, use union types and generics appropriately
- Use optional chaining (`?.`) and nullish coalescing (`??`) operators where appropriate

### Function & Variable Standards

- Use arrow functions for callbacks and short functions: `const handler = (e) => { ... }`
- Use regular function declarations for main component/utility functions when hoisting is beneficial
- Choose descriptive, self-documenting names: `getUserById` not `getUser`, `isLoading` not `loading`
- Use camelCase for variables/functions, PascalCase for types/interfaces/components
- Prefer meaningful names over comments: `const activeUsers = users.filter(u => u.isActive)`

### API & Response Handling

- Use consistent `ApiResponse<T>` type for all API responses and server actions
- Implement proper error handling with typed error responses
- Use status codes and error messages consistently across API endpoints

## Architecture & Organization

### Component Design

- Keep components focused on single responsibility (< 100 lines ideally)
- Extract complex logic into custom hooks or utility functions
- Use composition over complex prop drilling
- Prefer functional components with hooks over class components

### File Structure & Types

- Separate types into dedicated `types.ts` files per module/feature
- Group related types together with clear naming conventions
- Use index files to create clean import paths
- Organize by feature/domain rather than by file type

### Code Organization

- Remove unused imports, variables, and dead code consistently
- Use consistent import ordering: external libraries, internal modules, relative imports
- Group related functionality together within files
- Extract reusable logic into utility functions or custom hooks

## Development Workflow

### Planning & Documentation

- **Always** propose an implementation plan before coding
- Add tasks to `TODO.md` with clear descriptions and acceptance criteria
- Mark completed tasks with timestamps and brief summaries
- Document complex business logic and architectural decisions

### Development Process

- Write implementation summaries that are short, concise, and clear
- Focus on what changed and why, not how the code works
- No need to restart `pnpm dev` after code changes (hot reload handles this)
- Test changes incrementally rather than making large batch updates

### Code Maintenance

- Clean up after each task - remove debugging code, unused variables, etc.
- Refactor when you see opportunities for improvement
- Update types when data structures change
- Keep dependencies up to date and remove unused packages

## Tools & Environment

### Package Management

- Use `pnpm` for all package management operations
- Prefer exact versions for critical dependencies
- Keep `package.json` organized with clear dependency categories
- Use `pnpm dlx` for one-time tool executions

### Performance Considerations

- Use React.memo() judiciously for expensive renders
- Implement proper loading states and error boundaries
- Optimize bundle size by avoiding unnecessary imports
- Use lazy loading for code splitting where appropriate

## Quality Assurance

### Error Handling

- Implement comprehensive error boundaries
- Use typed error objects with consistent structure
- Provide meaningful error messages for users and developers
- Log errors appropriately for debugging

### Testing Mindset

- Write code that's easily testable (pure functions, dependency injection)
- Consider edge cases during implementation
- Use TypeScript's type system to catch errors at compile time
- Validate inputs and handle edge cases gracefully
