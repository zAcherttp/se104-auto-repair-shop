import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/reports',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock Recharts components globally
jest.mock('recharts', () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ data }: { data: any[] }) => (
    <div data-testid="pie">
      {data?.map((item, index) => (
        <div key={index} data-testid="pie-segment">
          {item.name}: {item.value}
        </div>
      ))}
    </div>
  ),
  Cell: ({ fill }: { fill: string }) => (
    <div data-testid="pie-cell" style={{ backgroundColor: fill }}></div>
  ),
  Tooltip: ({ content }: { content: React.ComponentType<any> }) => (
    <div data-testid="tooltip">{content && 'Custom Tooltip'}</div>
  ),
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Legend: ({ formatter }: { formatter: (value: string, entry: any) => React.ReactNode }) => (
    <div data-testid="legend">
      {formatter && formatter('Test Service', { color: '#3b82f6' })}
    </div>
  ),
}));

// Mock CSS modules
jest.mock('*.module.css', () => ({
  __esModule: true,
  default: {},
}));

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
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

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  trigger: (entries: any[]) => callback(entries),
}));

// Console error suppression for known issues
const originalError = console.error;
console.error = (...args) => {
  if (
    args[0]?.includes?.('Warning: ReactDOM.render is no longer supported') ||
    args[0]?.includes?.('Warning: Each child in a list should have a unique "key" prop')
  ) {
    return;
  }
  originalError.call(console, ...args);
};

// Cleanup function to reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Global teardown
afterEach(() => {
  jest.restoreAllMocks();
});
