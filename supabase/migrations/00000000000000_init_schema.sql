-- =====================================================
-- COMPLETE DATABASE SCHEMA FOR AUTO REPAIR SHOP
-- =====================================================
-- This file creates all tables, enums, functions, RLS policies
-- and initial data for the automobile repair shop system
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE payment_method AS ENUM ('cash', 'transfer', 'card');
CREATE TYPE repair_order_status AS ENUM ('pending', 'in_progress', 'completed');

-- =====================================================
-- TABLES
-- =====================================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'employee')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    license_plate TEXT NOT NULL UNIQUE,
    brand TEXT NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    total_paid NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spare parts table
CREATE TABLE IF NOT EXISTS spare_parts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Labor types table
CREATE TABLE IF NOT EXISTS labor_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    cost NUMERIC(12, 2) NOT NULL CHECK (cost >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Repair orders table
CREATE TABLE IF NOT EXISTS repair_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    reception_date DATE NOT NULL DEFAULT CURRENT_DATE,
    completion_date DATE,
    status repair_order_status DEFAULT 'pending',
    total_amount NUMERIC(12, 2) DEFAULT 0,
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Repair order items table
CREATE TABLE IF NOT EXISTS repair_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repair_order_id UUID REFERENCES repair_orders(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    spare_part_id UUID REFERENCES spare_parts(id) ON DELETE SET NULL,
    labor_type_id UUID REFERENCES labor_types(id) ON DELETE SET NULL,
    quantity INTEGER CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) CHECK (unit_price >= 0),
    labor_cost NUMERIC(12, 2) CHECK (labor_cost >= 0),
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_item_type CHECK (
        (spare_part_id IS NOT NULL AND labor_type_id IS NULL) OR
        (spare_part_id IS NULL AND labor_type_id IS NOT NULL)
    )
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_method payment_method DEFAULT 'cash',
    payment_date DATE DEFAULT CURRENT_DATE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_vehicles_license_plate ON vehicles(license_plate);
CREATE INDEX IF NOT EXISTS idx_vehicles_customer_id ON vehicles(customer_id);
CREATE INDEX IF NOT EXISTS idx_repair_orders_vehicle_id ON repair_orders(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_repair_orders_status ON repair_orders(status);
CREATE INDEX IF NOT EXISTS idx_repair_orders_created_by ON repair_orders(created_by);
CREATE INDEX IF NOT EXISTS idx_repair_order_items_repair_order_id ON repair_order_items(repair_order_id);
CREATE INDEX IF NOT EXISTS idx_repair_order_items_spare_part_id ON repair_order_items(spare_part_id);
CREATE INDEX IF NOT EXISTS idx_repair_order_items_labor_type_id ON repair_order_items(labor_type_id);
CREATE INDEX IF NOT EXISTS idx_repair_order_items_assigned_to ON repair_order_items(assigned_to);
CREATE INDEX IF NOT EXISTS idx_payments_vehicle_id ON payments(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_by ON payments(created_by);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT COALESCE(
            (raw_user_meta_data->>'is_garage_admin')::boolean,
            false
        )
        FROM auth.users
        WHERE id = user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is staff (admin or employee)
CREATE OR REPLACE FUNCTION is_staff(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = user_id
        AND role IN ('admin', 'employee')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-create profile when new user is created
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'employee')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Updated_at triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repair_orders_updated_at
    BEFORE UPDATE ON repair_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repair_order_items_updated_at
    BEFORE UPDATE ON repair_order_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE spare_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE labor_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Customers policies
CREATE POLICY "Staff can view all customers" ON customers
    FOR SELECT USING (is_staff(auth.uid()));

CREATE POLICY "Staff can insert customers" ON customers
    FOR INSERT WITH CHECK (is_staff(auth.uid()));

CREATE POLICY "Staff can update customers" ON customers
    FOR UPDATE USING (is_staff(auth.uid()));

-- Vehicles policies
CREATE POLICY "Staff can view all vehicles" ON vehicles
    FOR SELECT USING (is_staff(auth.uid()));

CREATE POLICY "Staff can insert vehicles" ON vehicles
    FOR INSERT WITH CHECK (is_staff(auth.uid()));

CREATE POLICY "Staff can update vehicles" ON vehicles
    FOR UPDATE USING (is_staff(auth.uid()));

-- Spare parts policies
CREATE POLICY "Staff can view spare parts" ON spare_parts
    FOR SELECT USING (is_staff(auth.uid()));

CREATE POLICY "Admins can insert spare parts" ON spare_parts
    FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update spare parts" ON spare_parts
    FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete spare parts" ON spare_parts
    FOR DELETE USING (is_admin(auth.uid()));

-- Labor types policies
CREATE POLICY "Staff can view labor types" ON labor_types
    FOR SELECT USING (is_staff(auth.uid()));

CREATE POLICY "Admins can insert labor types" ON labor_types
    FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update labor types" ON labor_types
    FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete labor types" ON labor_types
    FOR DELETE USING (is_admin(auth.uid()));

-- Repair orders policies
CREATE POLICY "Staff can view repair orders" ON repair_orders
    FOR SELECT USING (is_staff(auth.uid()));

CREATE POLICY "Staff can insert repair orders" ON repair_orders
    FOR INSERT WITH CHECK (is_staff(auth.uid()));

CREATE POLICY "Staff can update repair orders" ON repair_orders
    FOR UPDATE USING (is_staff(auth.uid()));

-- Repair order items policies
CREATE POLICY "Staff can view repair order items" ON repair_order_items
    FOR SELECT USING (is_staff(auth.uid()));

CREATE POLICY "Staff can insert repair order items" ON repair_order_items
    FOR INSERT WITH CHECK (is_staff(auth.uid()));

CREATE POLICY "Staff can update repair order items" ON repair_order_items
    FOR UPDATE USING (is_staff(auth.uid()));

CREATE POLICY "Staff can delete repair order items" ON repair_order_items
    FOR DELETE USING (is_staff(auth.uid()));

-- Payments policies
CREATE POLICY "Staff can view payments" ON payments
    FOR SELECT USING (is_staff(auth.uid()));

CREATE POLICY "Staff can insert payments" ON payments
    FOR INSERT WITH CHECK (is_staff(auth.uid()));

-- System settings policies
CREATE POLICY "Staff can view settings" ON system_settings
    FOR SELECT USING (is_staff(auth.uid()));

CREATE POLICY "Admins can modify settings" ON system_settings
    FOR ALL USING (is_admin(auth.uid()));

-- =====================================================
-- COMMENTS (Documentation)
-- =====================================================

COMMENT ON TABLE profiles IS 'User profiles extending auth.users with role information';
COMMENT ON TABLE customers IS 'Customer information for vehicle owners';
COMMENT ON TABLE vehicles IS 'Vehicle information with customer relationship';
COMMENT ON TABLE spare_parts IS 'Inventory of spare parts with stock tracking';
COMMENT ON TABLE labor_types IS 'Types of labor/services with standard costs';
COMMENT ON TABLE repair_orders IS 'Main repair orders for vehicles';
COMMENT ON TABLE repair_order_items IS 'Line items for repair orders (parts or labor)';
COMMENT ON TABLE payments IS 'Payment records for repair services';
COMMENT ON TABLE system_settings IS 'System configuration settings';

COMMENT ON COLUMN repair_order_items.assigned_to IS 'Employee assigned to this repair line item';
COMMENT ON COLUMN profiles.role IS 'User role: admin or employee';

-- =====================================================
-- INITIAL DATA (Optional - for testing)
-- =====================================================

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value) VALUES
    ('daily_vehicle_limit', '10'),
    ('garage_name', 'Auto Repair Shop'),
    ('currency', 'VND')
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Grant permissions on tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- =====================================================
-- END OF SCHEMA
-- =====================================================
