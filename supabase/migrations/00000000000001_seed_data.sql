-- =====================================================
-- CREATE USERS AND SAMPLE DATA
-- =====================================================
-- This file creates sample users and initial test data
-- Run this AFTER running the main schema migration
-- =====================================================

-- =====================================================
-- CREATE USERS
-- =====================================================

-- Note: You need to run this in Supabase SQL Editor with admin privileges
-- The passwords will be hashed automatically

-- 1. Create Admin User
DO $$
DECLARE
    admin_id UUID;
BEGIN
    -- Insert into auth.users (requires admin/service_role privileges)
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'admin@garage.com',
        crypt('admin123', gen_salt('bf')),
        now(),
        jsonb_build_object(
            'is_garage_admin', true,
            'full_name', 'Administrator',
            'role', 'admin'
        ),
        now(),
        now(),
        '',
        ''
    ) RETURNING id INTO admin_id;

    -- The trigger will automatically create the profile
    RAISE NOTICE 'Admin user created with ID: %', admin_id;
END $$;

-- 2. Create Employee User 1
DO $$
DECLARE
    emp1_id UUID;
BEGIN
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'nhanvien1@garage.com',
        crypt('employee123', gen_salt('bf')),
        now(),
        jsonb_build_object(
            'is_garage_admin', false,
            'full_name', 'Nguyễn Văn A',
            'role', 'employee'
        ),
        now(),
        now(),
        '',
        ''
    ) RETURNING id INTO emp1_id;

    RAISE NOTICE 'Employee 1 created with ID: %', emp1_id;
END $$;

-- 3. Create Employee User 2
DO $$
DECLARE
    emp2_id UUID;
BEGIN
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'nhanvien2@garage.com',
        crypt('employee123', gen_salt('bf')),
        now(),
        jsonb_build_object(
            'is_garage_admin', false,
            'full_name', 'Trần Thị B',
            'role', 'employee'
        ),
        now(),
        now(),
        '',
        ''
    ) RETURNING id INTO emp2_id;

    RAISE NOTICE 'Employee 2 created with ID: %', emp2_id;
END $$;

-- =====================================================
-- ALTERNATIVE: Manual Profile Creation (if trigger doesn't work)
-- =====================================================

-- If the trigger didn't create profiles automatically, uncomment and run this:
/*
INSERT INTO profiles (id, email, full_name, role)
SELECT 
    u.id,
    u.email,
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'role'
FROM auth.users u
WHERE u.email IN ('admin@garage.com', 'nhanvien1@garage.com', 'nhanvien2@garage.com')
ON CONFLICT (id) DO NOTHING;
*/

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample customers
INSERT INTO customers (name, phone, email, address) VALUES
    ('Nguyễn Văn Minh', '0912345678', 'minh@email.com', '123 Đường ABC, Quận 1, TP.HCM'),
    ('Trần Thị Lan', '0987654321', 'lan@email.com', '456 Đường XYZ, Quận 2, TP.HCM'),
    ('Lê Hoàng Nam', '0901234567', 'nam@email.com', '789 Đường DEF, Quận 3, TP.HCM'),
    ('Phạm Thị Hoa', '0923456789', 'hoa@email.com', '321 Đường GHI, Quận 4, TP.HCM'),
    ('Võ Minh Tuấn', '0934567890', 'tuan@email.com', '654 Đường JKL, Quận 5, TP.HCM')
ON CONFLICT DO NOTHING;

-- Insert sample vehicles
INSERT INTO vehicles (license_plate, brand, customer_id) VALUES
    ('51A-12345', 'Toyota Camry', (SELECT id FROM customers WHERE phone = '0912345678')),
    ('51B-67890', 'Honda City', (SELECT id FROM customers WHERE phone = '0987654321')),
    ('51C-11111', 'Mazda 3', (SELECT id FROM customers WHERE phone = '0901234567')),
    ('51D-22222', 'Hyundai Accent', (SELECT id FROM customers WHERE phone = '0923456789')),
    ('51E-33333', 'Ford Ranger', (SELECT id FROM customers WHERE phone = '0934567890'))
ON CONFLICT (license_plate) DO NOTHING;

-- Insert sample spare parts
INSERT INTO spare_parts (name, price, stock_quantity) VALUES
    ('Dầu nhớt Castrol 5W-30', 250000, 50),
    ('Lọc gió động cơ', 150000, 30),
    ('Lọc dầu động cơ', 120000, 40),
    ('Má phanh trước', 450000, 20),
    ('Má phanh sau', 350000, 20),
    ('Lốp Michelin 195/65R15', 1200000, 12),
    ('Ắc quy GS 12V-65Ah', 1500000, 8),
    ('Bóng đèn pha Philips', 300000, 25),
    ('Gạt mưa Bosch', 280000, 15),
    ('Dây curoa', 350000, 18),
    ('Bugi NGK', 180000, 35),
    ('Lọc gió điều hòa', 200000, 22),
    ('Dầu phanh DOT4', 120000, 30),
    ('Nước làm mát', 150000, 40),
    ('Vỏ xe Dunlop 185/60R14', 950000, 16)
ON CONFLICT DO NOTHING;

-- Insert sample labor types
INSERT INTO labor_types (name, cost) VALUES
    ('Thay dầu động cơ', 100000),
    ('Kiểm tra hệ thống phanh', 150000),
    ('Cân bằng và đồng tâm bánh xe', 200000),
    ('Thay lốp xe', 150000),
    ('Sửa chữa hệ thống điện', 300000),
    ('Thay ắc quy', 100000),
    ('Vệ sinh kim phun', 400000),
    ('Thay má phanh', 200000),
    ('Kiểm tra và bảo dưỡng điều hòa', 350000),
    ('Thay bugi', 120000),
    ('Kiểm tra hệ thống treo', 250000),
    ('Sơn sửa chữa nhỏ', 500000),
    ('Đại tu động cơ', 5000000),
    ('Thay dây curoa', 150000),
    ('Cân chỉnh góc đặt bánh xe', 300000)
ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify created users
SELECT 
    u.id,
    u.email,
    u.raw_user_meta_data->>'full_name' as full_name,
    u.raw_user_meta_data->>'is_garage_admin' as is_admin,
    p.role,
    u.created_at
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email LIKE '%@garage.com'
ORDER BY u.email;

-- Verify sample data counts
SELECT 
    (SELECT COUNT(*) FROM customers) as total_customers,
    (SELECT COUNT(*) FROM vehicles) as total_vehicles,
    (SELECT COUNT(*) FROM spare_parts) as total_spare_parts,
    (SELECT COUNT(*) FROM labor_types) as total_labor_types,
    (SELECT COUNT(*) FROM profiles) as total_profiles;

-- =====================================================
-- LOGIN CREDENTIALS SUMMARY
-- =====================================================

-- Admin Account:
--   Email: admin@garage.com
--   Password: admin123
--   Role: Admin (full access)

-- Employee Account 1:
--   Email: nhanvien1@garage.com
--   Password: employee123
--   Role: Employee (limited access)

-- Employee Account 2:
--   Email: nhanvien2@garage.com
--   Password: employee123
--   Role: Employee (limited access)

-- =====================================================
-- NOTES
-- =====================================================
-- 1. Run this script in Supabase SQL Editor as service_role
-- 2. Passwords are hashed using bcrypt
-- 3. The trigger should auto-create profiles, but verify with the queries above
-- 4. Sample data includes Vietnamese automobile parts and services
-- 5. All prices are in VND (Vietnamese Dong)
