import "@testing-library/jest-dom";
import React from "react";

// Polyfills for Node.js environment
import { TextEncoder, TextDecoder } from "util";
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock server actions to prevent Next.js server imports in test environment
jest.mock("@/app/actions/vehicles", () =>
  require("./test/mocks/server-actions")
);
jest.mock("@/app/actions/settings", () =>
  require("./test/mocks/server-actions")
);
jest.mock("@/app/actions/reports", () =>
  require("./test/mocks/server-actions")
);
jest.mock("@/app/actions/inventory", () =>
  require("./test/mocks/server-actions")
);
jest.mock("@/app/actions/tasks", () => require("./test/mocks/server-actions"));
jest.mock("@/app/actions/login", () => require("./test/mocks/server-actions"));

// Mock UI components to use our test mocks
jest.mock("@/components/ui/dialog", () =>
  require("./test/mocks/ui-components.tsx")
);
jest.mock("@/components/ui/button", () =>
  require("./test/mocks/ui-components.tsx")
);
jest.mock("@/components/ui/input", () =>
  require("./test/mocks/ui-components.tsx")
);
jest.mock("@/components/ui/textarea", () =>
  require("./test/mocks/ui-components.tsx")
);
jest.mock("@/components/ui/label", () =>
  require("./test/mocks/ui-components.tsx")
);
jest.mock("@/components/ui/calendar", () =>
  require("./test/mocks/ui-components.tsx")
);
jest.mock("@/components/ui/command", () =>
  require("./test/mocks/ui-components.tsx")
);
jest.mock("@/components/ui/popover", () =>
  require("./test/mocks/ui-components.tsx")
);
jest.mock("@/components/ui/form", () =>
  require("./test/mocks/ui-components.tsx")
);
jest.mock("@/components/ui/alert", () =>
  require("./test/mocks/ui-components.tsx")
);
jest.mock("@/components/ui/dropdown-menu", () =>
  require("./test/mocks/ui-components")
);
jest.mock("@/components/ui/data-table-column-header", () =>
  require("./test/mocks/ui-components")
);
jest.mock("@/components/ui/badge", () => require("./test/mocks/ui-components"));
jest.mock("@/components/ui/table", () => require("./test/mocks/ui-components"));
jest.mock("@/components/ui/select", () =>
  require("./test/mocks/ui-components")
);
jest.mock("@/components/ui/scroll-area", () =>
  require("./test/mocks/ui-components")
);
jest.mock("@/components/ui/card", () =>
  require("./test/mocks/ui-components.tsx")
);

// Mock Lucide React icons
jest.mock("lucide-react", () => require("./test/mocks/ui-components"));

// Mock Radix UI primitives
jest.mock("@radix-ui/react-slot", () => require("./test/mocks/ui-components"));
jest.mock("@radix-ui/react-scroll-area", () =>
  require("./test/mocks/ui-components")
);

// Mock complex components that might have deep dependencies
jest.mock("@/components/dialogs/update-repair-order", () => ({
  UpdateDialog: ({ children }) =>
    React.createElement("div", { "data-testid": "update-dialog" }, children),
}));

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

// Mock hooks
jest.mock("@/hooks/use-garage-info", () => ({
  useGarageInfo: jest.fn(),
}));

// Mock hooks that might import server actions
jest.mock("@/hooks/use-spare-parts-labor-types", () => ({
  useSpareParts: jest.fn(),
  useLaborTypes: jest.fn(),
}));

jest.mock("@/hooks/use-line-items", () => ({
  useLineItems: jest.fn(),
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

// Mock Sonner toast
jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}));
