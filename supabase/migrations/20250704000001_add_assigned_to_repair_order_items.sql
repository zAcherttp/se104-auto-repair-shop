-- Add assigned_to column to repair_order_items table
ALTER TABLE repair_order_items 
ADD COLUMN assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_repair_order_items_assigned_to 
ON repair_order_items(assigned_to);

-- Add comment to document the column purpose
COMMENT ON COLUMN repair_order_items.assigned_to IS 'Employee assigned to this repair line item';
