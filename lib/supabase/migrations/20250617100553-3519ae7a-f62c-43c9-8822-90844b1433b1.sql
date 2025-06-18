
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'employee')),
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create customers table
CREATE TABLE public.customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vehicles table
CREATE TABLE public.vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  license_plate TEXT NOT NULL UNIQUE,
  brand TEXT NOT NULL,
  customer_id UUID REFERENCES public.customers(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create spare parts table
CREATE TABLE public.spare_parts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create labor types table
CREATE TABLE public.labor_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cost DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create repair orders table
CREATE TABLE public.repair_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES public.vehicles(id),
  customer_id UUID REFERENCES public.customers(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
  reception_date DATE DEFAULT CURRENT_DATE,
  completion_date DATE,
  total_amount DECIMAL(10,2) DEFAULT 0,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create repair order items table
CREATE TABLE public.repair_order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  repair_order_id UUID REFERENCES public.repair_orders(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  spare_part_id UUID REFERENCES public.spare_parts(id),
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) DEFAULT 0,
  labor_type_id UUID REFERENCES public.labor_types(id),
  labor_cost DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  repair_order_id UUID REFERENCES public.repair_orders(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE DEFAULT CURRENT_DATE,
  payment_method TEXT DEFAULT 'cash',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system settings table
CREATE TABLE public.system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spare_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labor_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- Create function to check if user is authenticated staff
CREATE OR REPLACE FUNCTION public.is_staff(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role IN ('admin', 'employee')
  );
$$;

-- Admin-only policies
CREATE POLICY "Only admins can manage profiles" 
  ON public.profiles FOR ALL 
  USING (public.is_admin(auth.uid()));

-- Staff policies for main tables
CREATE POLICY "Staff can manage customers" 
  ON public.customers FOR ALL 
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can manage vehicles" 
  ON public.vehicles FOR ALL 
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can manage spare parts" 
  ON public.spare_parts FOR ALL 
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can manage labor types" 
  ON public.labor_types FOR ALL 
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can manage repair orders" 
  ON public.repair_orders FOR ALL 
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can manage repair order items" 
  ON public.repair_order_items FOR ALL 
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can manage payments" 
  ON public.payments FOR ALL 
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can manage settings" 
  ON public.system_settings FOR ALL 
  USING (public.is_staff(auth.uid()));

-- Public policies for customer order tracking
CREATE POLICY "Anyone can view repair orders by license plate" 
  ON public.repair_orders FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can view vehicles for tracking" 
  ON public.vehicles FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can view customers for tracking" 
  ON public.customers FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can view repair order items for tracking" 
  ON public.repair_order_items FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can view spare parts for tracking" 
  ON public.spare_parts FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can view labor types for tracking" 
  ON public.labor_types FOR SELECT 
  USING (true);

-- Create trigger to auto-update profiles table when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'role', 'employee'),
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.email)
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert initial system settings
INSERT INTO public.system_settings (setting_key, setting_value) VALUES
('daily_vehicle_limit', '30'),
('car_brands', '["Toyota", "Honda", "Ford", "Chevrolet", "Nissan", "BMW", "Mercedes-Benz", "Audi", "Volkswagen", "Hyundai"]');

-- Insert some initial spare parts
INSERT INTO public.spare_parts (name, price, stock_quantity) VALUES
('Oil Filter', 15.99, 50),
('Air Filter', 12.50, 30),
('Brake Pads', 45.00, 20),
('Spark Plugs', 8.75, 40),
('Battery', 89.99, 15),
('Transmission Fluid', 25.00, 25),
('Coolant', 18.50, 20),
('Brake Fluid', 12.00, 30),
('Power Steering Fluid', 15.00, 25),
('Engine Oil', 22.00, 40);

-- Insert some initial labor types
INSERT INTO public.labor_types (name, cost) VALUES
('Oil Change', 25.00),
('Brake Service', 75.00),
('Engine Tune-up', 120.00),
('Diagnostic', 50.00),
('General Maintenance', 60.00),
('Transmission Service', 95.00),
('Cooling System Service', 85.00),
('Electrical Repair', 70.00),
('Suspension Repair', 90.00),
('Exhaust Repair', 65.00);
