---
applyTo: "**/*.ts?(x)"
---

# React Rerender Optimization Ruleset

## Core Principles

### 1. Understand the Root Cause

- **Always profile before optimizing** - Use React DevTools Profiler to identify actual performance bottlenecks
- **Measure impact** - Quantify the performance gain before and after optimization
- **Premature optimization is the root of all evil** - Only optimize components that actually cause performance issues

### 2. Component Structure Optimization

#### Split Components Strategically

```javascript
// ❌ Avoid: Monolithic components
const Dashboard = () => {
  const [userData, setUserData] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({});

  return (
    <div>
      <UserProfile data={userData} />
      <NotificationList items={notifications} />
      <SettingsPanel config={settings} />
    </div>
  );
};

// ✅ Prefer: Isolated state management
const Dashboard = () => (
  <div>
    <UserProfileContainer />
    <NotificationContainer />
    <SettingsContainer />
  </div>
);
```

#### Move State Down

- Push state as close to where it's used as possible
- Prevent unnecessary rerenders of parent components
- Use state colocation to improve performance

### 3. Memoization Strategies

#### React.memo for Component Memoization

```javascript
// ✅ Memoize expensive components
const ExpensiveComponent = React.memo(({ data, onAction }) => {
  // Complex rendering logic
  return <div>{/* ... */}</div>;
});

// ✅ Custom comparison for complex props
const OptimizedComponent = React.memo(
  ({ items, config }) => {
    // Component logic
  },
  (prevProps, nextProps) => {
    return (
      prevProps.items.length === nextProps.items.length &&
      prevProps.config.theme === nextProps.config.theme
    );
  }
);
```

#### useMemo for Expensive Calculations

```javascript
// ✅ Memoize expensive computations
const processedData = useMemo(() => {
  return data
    .filter((item) => item.active)
    .map((item) => ({ ...item, computed: heavyCalculation(item) }))
    .sort((a, b) => a.priority - b.priority);
}, [data]);

// ❌ Avoid: Memoizing cheap operations
const simpleValue = useMemo(() => props.value * 2, [props.value]); // Unnecessary
```

#### useCallback for Function Stability

```javascript
// ✅ Memoize callbacks passed to child components
const handleClick = useCallback((id) => {
  setItems((items) => items.filter((item) => item.id !== id));
}, []);

// ✅ Memoize functions used in effects
const fetchData = useCallback(async () => {
  const response = await api.getData(userId);
  setData(response);
}, [userId]);

useEffect(() => {
  fetchData();
}, [fetchData]);
```

### 4. Prop Optimization

#### Avoid Inline Object/Array Creation

```javascript
// ❌ Avoid: Creates new objects on every render
<Component
  style={{ margin: 10, padding: 5 }}
  data={items.filter((item) => item.active)}
  config={{ theme: "dark", size: "large" }}
/>;

// ✅ Prefer: Stable references
const COMPONENT_STYLE = { margin: 10, padding: 5 };
const CONFIG = { theme: "dark", size: "large" };

const activeItems = useMemo(() => items.filter((item) => item.active), [items]);

<Component style={COMPONENT_STYLE} data={activeItems} config={CONFIG} />;
```

#### Use Stable Keys

```javascript
// ❌ Avoid: Index as key for dynamic lists
{
  items.map((item, index) => <Item key={index} data={item} />);
}

// ✅ Prefer: Stable, unique keys
{
  items.map((item) => <Item key={item.id} data={item} />);
}
```

### 5. State Management Optimization

#### Minimize State Updates

```javascript
// ❌ Avoid: Multiple state updates
const handleFormSubmit = (formData) => {
  setLoading(true);
  setError(null);
  setSuccess(false);
  // API call
  setLoading(false);
  setSuccess(true);
};

// ✅ Prefer: Batch updates or use reducer
const [state, dispatch] = useReducer(formReducer, initialState);

const handleFormSubmit = (formData) => {
  dispatch({ type: "SUBMIT_START" });
  // API call
  dispatch({ type: "SUBMIT_SUCCESS" });
};
```

#### Use State Updater Functions

```javascript
// ✅ Prevent unnecessary dependencies
const increment = useCallback(() => {
  setCount((count) => count + 1); // No dependency on count
}, []);

// ❌ Avoid: Direct state dependency
const increment = useCallback(() => {
  setCount(count + 1); // Requires count dependency
}, [count]);
```

### 6. Context Optimization

#### Split Contexts by Update Frequency

```javascript
// ✅ Separate frequently changing data
const UserContext = createContext();
const SettingsContext = createContext();

// ❌ Avoid: Mixing fast and slow changing data
const AppContext = createContext(); // Contains both user and settings
```

#### Memoize Context Values

```javascript
// ✅ Memoize context value to prevent rerenders
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const value = useMemo(
    () => ({
      user,
      login: (userData) => setUser(userData),
      logout: () => setUser(null),
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

### 7. Effect Optimization

#### Minimize Effect Dependencies

```javascript
// ✅ Extract stable values
const API_CONFIG = { timeout: 5000 };

const fetchData = useCallback(async () => {
  const response = await api.get("/data", API_CONFIG);
  setData(response);
}, []);

// ❌ Avoid: Unnecessary object dependencies
useEffect(() => {
  fetchData({ timeout: 5000 }); // Creates new object
}, [fetchData]);
```

#### Use Separate Effects for Different Concerns

```javascript
// ✅ Separate effects by responsibility
useEffect(() => {
  // Handle user data
  if (userId) {
    fetchUserData(userId);
  }
}, [userId]);

useEffect(() => {
  // Handle theme changes
  document.body.className = theme;
}, [theme]);
```

### 8. Performance Monitoring

#### Use React DevTools Profiler

- Enable profiling in development
- Identify components with excessive rerenders
- Measure time spent in each component

#### Implement Performance Monitoring

```javascript
// ✅ Add performance markers
const ExpensiveComponent = ({ data }) => {
  useEffect(() => {
    performance.mark("expensive-component-start");
    return () => {
      performance.mark("expensive-component-end");
      performance.measure(
        "expensive-component-duration",
        "expensive-component-start",
        "expensive-component-end"
      );
    };
  }, []);

  // Component logic
};
```

### 9. Anti-Patterns to Avoid

#### Don't Overuse Memoization

```javascript
// ❌ Unnecessary memoization
const SimpleComponent = React.memo(({ text }) => <div>{text}</div>);
const simpleValue = useMemo(() => text.toUpperCase(), [text]);

// ✅ Only memoize when beneficial
const ExpensiveComponent = React.memo(({ data }) => {
  // Expensive rendering logic
  return <ComplexVisualization data={data} />;
});
```

#### Don't Create Functions in Render

```javascript
// ❌ Creates new function on every render
<button onClick={() => handleClick(item.id)}>Click me</button>;

// ✅ Use stable callback
const handleItemClick = useCallback(
  (id) => {
    handleClick(id);
  },
  [handleClick]
);

<button onClick={() => handleItemClick(item.id)}>Click me</button>;
```

### 10. Advanced Optimization Techniques

#### Lazy Loading and Code Splitting

```javascript
// ✅ Lazy load heavy components
const HeavyChart = lazy(() => import("./HeavyChart"));

const Dashboard = () => (
  <Suspense fallback={<ChartSkeleton />}>
    <HeavyChart data={chartData} />
  </Suspense>
);
```

#### Virtualization for Large Lists

```javascript
// ✅ Use virtualization for large datasets
import { FixedSizeList } from "react-window";

const VirtualizedList = ({ items }) => (
  <FixedSizeList
    height={400}
    itemCount={items.length}
    itemSize={50}
    itemData={items}
  >
    {ListItem}
  </FixedSizeList>
);
```

## Optimization Checklist

- [ ] Profile components before optimizing
- [ ] Move state close to where it's used
- [ ] Memoize expensive calculations with useMemo
- [ ] Stabilize callbacks with useCallback
- [ ] Wrap expensive components with React.memo
- [ ] Avoid inline object/array creation in props
- [ ] Use stable keys for list items
- [ ] Split contexts by update frequency
- [ ] Minimize effect dependencies
- [ ] Implement performance monitoring
- [ ] Consider lazy loading for heavy components
- [ ] Use virtualization for large lists

## Tools and Resources

- **React DevTools Profiler** - Identify rerender bottlenecks
- **React Developer Tools** - Inspect component props and state
- **Chrome DevTools Performance** - Analyze runtime performance
- **react-window** - Virtualization library
- **React.lazy()** - Code splitting utility

Remember: The goal is to optimize the user experience, not to use every optimization technique available. Measure first, optimize second, and always consider the trade-offs between code complexity and performance gains.
