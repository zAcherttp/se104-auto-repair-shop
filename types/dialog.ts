import { VehicleRegistration } from "@/app/(protected)/vehicles/columns";
import { LineItem } from "@/components/dialogs/update-repair-order/columns";

// Standard dialog props interface for consistency
export interface BaseDialogProps {
  trigger: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Dialog props for forms (without trigger, controlled externally)
export interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Dialog props for vehicle-related actions
export interface VehicleDialogProps extends BaseDialogProps {
  data: VehicleRegistration;
  onSuccess?: (data: VehicleRegistration) => void;
}

// Update dialog specific props
export interface UpdateDialogProps extends BaseDialogProps {
  data: VehicleRegistration;
  onSuccess?: (data: VehicleRegistration, updates: UpdateData) => void;
}

export interface UpdateData {
  status: string;
  notes: string;
  totalAmount: number;
  paidAmount: number;
  lineItems: LineItem[];
}
