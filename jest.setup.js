import "@testing-library/jest-dom";

// Polyfills for Node.js environment
import { TextEncoder, TextDecoder } from "util";
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock React Query - provide a more complete mock
jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
  QueryClient: jest.fn(),
  QueryClientProvider: ({ children }) => children,
  useQueryClient: () => ({
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
    getQueryData: jest.fn(),
  }),
}));

// Mock Lucide React icons
jest.mock("lucide-react", () => ({
  Car: () => <div data-testid="car-icon">Car</div>,
  Users: () => <div data-testid="users-icon">Users</div>,
  Search: () => <div data-testid="search-icon">Search</div>,
  Phone: () => <div data-testid="phone-icon">Phone</div>,
  Mail: () => <div data-testid="mail-icon">Mail</div>,
  MapPin: () => <div data-testid="mappin-icon">MapPin</div>,
}));

// Mock server actions
jest.mock("@/app/actions/settings", () => ({
  getGarageInfo: jest.fn(),
}));

// Mock hooks
jest.mock("@/hooks/use-garage-info", () => ({
  useGarageInfo: jest.fn(),
}));

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
