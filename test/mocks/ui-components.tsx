import React from "react";

// Mock Dialog Components
export const Dialog = ({ children, open, onOpenChange, ...props }: any) => {
  if (open === false) return null;
  return (
    <div data-testid="dialog" role="dialog" {...props}>
      {children}
    </div>
  );
};

export const DialogContent = ({ children, ...props }: any) => {
  const { asChild, ...domProps } = props;
  return (
    <div data-testid="dialog-content" {...domProps}>
      {children}
    </div>
  );
};

export const DialogHeader = ({ children, ...props }: any) => (
  <div data-testid="dialog-header" {...props}>
    {children}
  </div>
);

export const DialogTitle = ({ children, ...props }: any) => (
  <h2 data-testid="dialog-title" {...props}>
    {children}
  </h2>
);

export const DialogDescription = ({ children, ...props }: any) => (
  <p data-testid="dialog-description" {...props}>
    {children}
  </p>
);

export const DialogFooter = ({ children, ...props }: any) => (
  <div data-testid="dialog-footer" {...props}>
    {children}
  </div>
);

// Mock Button Component
export const Button = ({
  children,
  onClick,
  disabled,
  type,
  asChild,
  variant,
  size,
  ...props
}: any) => {
  // Strip out custom props that shouldn't appear in DOM
  const { className, ...domProps } = props;

  if (asChild) {
    // When asChild is true, render children directly
    return React.cloneElement(children, {
      ...domProps,
      onClick: onClick || children.props.onClick,
      disabled: disabled || children.props.disabled,
      type: type || children.props.type,
      "data-testid": "button",
      className: `${children.props.className || ""} ${className || ""}`.trim(),
    });
  }

  // Calculate accessible name from children for accessibility queries
  const getAccessibleName = (children: React.ReactNode): string => {
    if (typeof children === "string") return children;
    if (React.isValidElement(children)) {
      const childProps = (children as any).props;
      if (childProps.children) {
        return getAccessibleName(childProps.children);
      }
      return children.type === "span" && childProps.children
        ? String(childProps.children)
        : "";
    }
    if (Array.isArray(children)) {
      return children
        .map((child) => getAccessibleName(child))
        .join(" ")
        .trim();
    }
    return "";
  };

  const accessibleName = getAccessibleName(children);

  return (
    <button
      data-testid="button"
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={className}
      aria-label={accessibleName || undefined}
      {...domProps}
    >
      {children}
    </button>
  );
};

// Mock Input Component
export const Input = React.forwardRef<HTMLInputElement, any>(
  ({ onChange, value, ...props }: any, ref) => {
    const [internalValue, setInternalValue] = React.useState(value || "");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <input
        ref={ref}
        data-testid="input"
        onChange={handleChange}
        value={internalValue}
        {...props}
      />
    );
  }
);

// Mock Textarea Component
export const Textarea = React.forwardRef<HTMLTextAreaElement, any>(
  ({ onChange, value, ...props }: any, ref) => {
    const [internalValue, setInternalValue] = React.useState(value || "");

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <textarea
        ref={ref}
        data-testid="textarea"
        onChange={handleChange}
        value={internalValue}
        {...props}
      />
    );
  }
);

// Mock Label Component
export const Label = ({ children, ...props }: any) => (
  <label data-testid="label" {...props}>
    {children}
  </label>
);

// Mock Command Components
export const Command = ({ children, ...props }: any) => (
  <div data-testid="command" {...props}>
    {children}
  </div>
);

export const CommandInput = ({ ...props }: any) => (
  <input data-testid="command-input" {...props} />
);

export const CommandList = ({ children, ...props }: any) => (
  <div data-testid="command-list" {...props}>
    {children}
  </div>
);

export const CommandEmpty = ({ children, ...props }: any) => (
  <div data-testid="command-empty" {...props}>
    {children}
  </div>
);

export const CommandGroup = ({ children, ...props }: any) => (
  <div data-testid="command-group" {...props}>
    {children}
  </div>
);

export const CommandItem = ({ children, onSelect, ...props }: any) => (
  <div
    data-testid="command-item"
    onClick={() => onSelect && onSelect()}
    {...props}
  >
    {children}
  </div>
);

// Mock Popover Components
export const Popover = ({ children, ...props }: any) => (
  <div data-testid="popover" {...props}>
    {children}
  </div>
);

export const PopoverTrigger = ({ children, ...props }: any) => (
  <div data-testid="popover-trigger" {...props}>
    {children}
  </div>
);

export const PopoverContent = ({ children, ...props }: any) => (
  <div data-testid="popover-content" {...props}>
    {children}
  </div>
);

// Mock Form Components
// Form components that handle proper label/input associations
export const Form = ({ children, ...props }: any) => {
  // Strip out React Hook Form props that shouldn't go to DOM
  const {
    control,
    handleSubmit,
    subscribe,
    trigger,
    register,
    watch,
    setValue,
    getValues,
    reset,
    resetField,
    clearErrors,
    unregister,
    setError,
    setFocus,
    getFieldState,
    formState,
    ...domProps
  } = props;

  return (
    <div data-testid="form" {...domProps}>
      {children}
    </div>
  );
};

export const FormItem = ({ children, ...props }: any) => (
  <div data-testid="form-item" {...props}>
    {children}
  </div>
);

let labelCounter = 0;

export const FormLabel = ({ children, htmlFor, ...props }: any) => {
  const labelId = htmlFor || `form-label-${labelCounter}`;
  return (
    <label data-testid="form-label" htmlFor={labelId} {...props}>
      {children}
    </label>
  );
};

export const FormControl = ({ children, ...props }: any) => {
  return (
    <div data-testid="form-control" {...props}>
      {React.isValidElement(children)
        ? React.cloneElement(children as any, {
            id: `form-label-${labelCounter++}`,
          })
        : children}
    </div>
  );
};

export const FormMessage = ({ children, ...props }: any) => (
  <div data-testid="form-message" {...props}>
    {children}
  </div>
);

export const FormField = ({ control, name, render, ...props }: any) => {
  const mockField = {
    value: "",
    onChange: jest.fn(),
    onBlur: jest.fn(),
    name,
    ref: jest.fn(),
  };

  const mockFieldState = {
    invalid: false,
    isTouched: false,
    isDirty: false,
    error: undefined,
  };

  const mockFormState = {
    isSubmitting: false,
    errors: {},
  };

  return (
    <div data-testid="form-field" {...props}>
      {render({
        field: mockField,
        fieldState: mockFieldState,
        formState: mockFormState,
      })}
    </div>
  );
};

// Mock Alert Components
export const Alert = ({ children, ...props }: any) => (
  <div data-testid="alert" {...props}>
    {children}
  </div>
);

export const AlertDescription = ({ children, ...props }: any) => (
  <div data-testid="alert-description" {...props}>
    {children}
  </div>
);

// Mock DropdownMenu Components
export const DropdownMenu = ({ children, ...props }: any) => (
  <div data-testid="dropdown-menu" {...props}>
    {children}
  </div>
);

export const DropdownMenuTrigger = ({ children, asChild, ...props }: any) => {
  // Strip out custom props that shouldn't appear in DOM
  const { className, ...domProps } = props;

  if (asChild) {
    // When asChild is true, render children directly
    return React.cloneElement(children, {
      ...domProps,
      "data-testid": "dropdown-menu-trigger",
      className: `${children.props.className || ""} ${className || ""}`.trim(),
    });
  }

  return (
    <button
      data-testid="dropdown-menu-trigger"
      className={className}
      {...domProps}
    >
      {children}
    </button>
  );
};

export const DropdownMenuContent = ({ children, ...props }: any) => (
  <div data-testid="dropdown-menu-content" {...props}>
    {children}
  </div>
);

export const DropdownMenuItem = ({ children, onSelect, ...props }: any) => (
  <div
    data-testid="dropdown-menu-item"
    onClick={() => onSelect && onSelect()}
    {...props}
  >
    {children}
  </div>
);

export const DropdownMenuSeparator = ({ ...props }: any) => (
  <hr data-testid="dropdown-menu-separator" {...props} />
);

export const DropdownMenuLabel = ({ children, ...props }: any) => (
  <div data-testid="dropdown-menu-label" {...props}>
    {children}
  </div>
);

// DataTable components
export const DataTableColumnHeader = ({ children, ...props }: any) => {
  const { asChild, ...domProps } = props;
  return (
    <div data-testid="data-table-column-header" {...domProps}>
      {children}
    </div>
  );
};

// Badge component
export const Badge = ({ children, variant, ...props }: any) => {
  const { className, ...domProps } = props;
  return (
    <span data-testid="badge" className={className} {...domProps}>
      {children}
    </span>
  );
};

// Table components
export const Table = ({ children, ...props }: any) => (
  <table data-testid="table" {...props}>
    {children}
  </table>
);

export const TableHeader = ({ children, ...props }: any) => (
  <thead data-testid="table-header" {...props}>
    {children}
  </thead>
);

export const TableBody = ({ children, ...props }: any) => (
  <tbody data-testid="table-body" {...props}>
    {children}
  </tbody>
);

export const TableRow = ({ children, ...props }: any) => (
  <tr data-testid="table-row" {...props}>
    {children}
  </tr>
);

export const TableHead = ({ children, ...props }: any) => (
  <th data-testid="table-head" {...props}>
    {children}
  </th>
);

export const TableCell = ({ children, ...props }: any) => (
  <td data-testid="table-cell" {...props}>
    {children}
  </td>
);

// Select components
export const Select = ({
  children,
  value,
  onValueChange,
  defaultValue,
  ...props
}: any) => (
  <div data-testid="select" {...props}>
    {children}
  </div>
);

export const SelectTrigger = ({ children, ...props }: any) => (
  <button data-testid="select-trigger" {...props}>
    {children}
  </button>
);

export const SelectContent = ({ children, ...props }: any) => (
  <div data-testid="select-content" {...props}>
    {children}
  </div>
);

export const SelectItem = ({ children, value, onSelect, ...props }: any) => (
  <div
    data-testid="select-item"
    onClick={() => onSelect && onSelect(value)}
    {...props}
  >
    {children}
  </div>
);

export const SelectValue = ({ placeholder, ...props }: any) => (
  <span data-testid="select-value" {...props}>
    {placeholder}
  </span>
);

// Mock icons and other primitives
export const ChevronLeftIcon = (props: any) => (
  <div data-testid="chevron-left-icon" {...props}>
    ←
  </div>
);
export const ChevronRightIcon = (props: any) => (
  <div data-testid="chevron-right-icon" {...props}>
    →
  </div>
);
export const ChevronsLeftIcon = (props: any) => (
  <div data-testid="chevrons-left-icon" {...props}>
    ⟸
  </div>
);
export const ChevronsRightIcon = (props: any) => (
  <div data-testid="chevrons-right-icon" {...props}>
    ⟹
  </div>
);
export const ChevronsUpDownIcon = (props: any) => (
  <div data-testid="chevrons-up-down-icon" {...props}>
    ⬆️⬇️
  </div>
);
export const CheckIcon = (props: any) => (
  <div data-testid="check-icon" {...props}>
    ✅
  </div>
);
export const CalendarIcon = (props: any) => (
  <div data-testid="calendar-icon" {...props}>
    📅
  </div>
);

// Mock Lucide React icons
export const ArrowLeft = (props: any) => (
  <div data-testid="arrow-left-icon" {...props} />
);
export const Car = (props: any) => <div data-testid="car-icon" {...props} />;
export const User = (props: any) => <div data-testid="user-icon" {...props} />;
export const Phone = (props: any) => (
  <div data-testid="phone-icon" {...props} />
);
export const Mail = (props: any) => <div data-testid="mail-icon" {...props} />;
export const CheckCircle = (props: any) => (
  <div data-testid="check-circle-icon" {...props} />
);
export const Clock = (props: any) => (
  <div data-testid="clock-icon" {...props} />
);
export const AlertCircle = (props: any) => (
  <div data-testid="alert-circle-icon" {...props} />
);

// Primitive components and Slot
export const Slot = ({ children, ...props }: any) => {
  if (React.isValidElement(children)) {
    const childProps = (children as any).props || {};
    return React.cloneElement(children, { ...childProps, ...props });
  }
  return <span {...props}>{children}</span>;
};

// Create a slot function mock
export const createSlot = () => ({
  Slot: Slot,
  Slottable: ({ children }: any) => children,
});

// Primitive span component
export const Primitive = {
  span: {
    SlotClone: ({ children, ...props }: any) => (
      <span data-testid="primitive-span-slot-clone" {...props}>
        {children}
      </span>
    ),
  },
};

// Calendar component updates to return a proper button
export const Calendar = ({ selected, onSelect, disabled, ...props }: any) => (
  <div data-testid="calendar" {...props}>
    <button
      data-testid="calendar-date-btn"
      onClick={() => onSelect && onSelect(new Date(2024, 0, 15))}
    >
      Select Date
    </button>
  </div>
);

// ScrollArea components
export const ScrollArea = ({ children, ...props }: any) => (
  <div data-testid="scroll-area" {...props}>
    {children}
  </div>
);

export const ScrollBar = ({ ...props }: any) => (
  <div data-testid="scroll-bar" {...props} />
);

// Mock Card Components
export const Card = ({ children, className, ...props }: any) => (
  <div data-testid="card" className={className} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ children, className, ...props }: any) => (
  <div data-testid="card-header" className={className} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className, ...props }: any) => (
  <h3 data-testid="card-title" className={className} {...props}>
    {children}
  </h3>
);

export const CardContent = ({ children, className, ...props }: any) => (
  <div data-testid="card-content" className={className} {...props}>
    {children}
  </div>
);

export const CardDescription = ({ children, className, ...props }: any) => (
  <p data-testid="card-description" className={className} {...props}>
    {children}
  </p>
);

export const CardFooter = ({ children, className, ...props }: any) => (
  <div data-testid="card-footer" className={className} {...props}>
    {children}
  </div>
);
