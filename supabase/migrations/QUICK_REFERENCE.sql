-- =====================================================
-- QUICK REFERENCE: CREATE USER MANUALLY
-- =====================================================
-- Các câu lệnh SQL nhanh để tạo user thủ công
-- Copy và thay đổi thông tin theo nhu cầu
-- =====================================================

-- =====================================================
-- 1. TẠO USER VỚI PROFILE (CÁCH ĐƠN GIẢN NHẤT)
-- =====================================================

-- Tạo Admin User
DO $$
DECLARE
    new_user_id UUID := gen_random_uuid();
BEGIN
    -- Tạo user trong auth.users (trigger sẽ tự động tạo profile)
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
        updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        new_user_id,
        'authenticated',
        'authenticated',
        'your.email@example.com',  -- 🔴 THAY ĐỔI EMAIL
        crypt('your_password', gen_salt('bf')),  -- 🔴 THAY ĐỔI PASSWORD
        now(),
        jsonb_build_object(
            'is_garage_admin', true,  -- 🔴 true = admin, false = employee
            'full_name', 'Your Full Name',  -- 🔴 THAY ĐỔI TÊN
            'role', 'admin'  -- 🔴 'admin' hoặc 'employee'
        ),
        now(),
        now()
    );
    
    -- Profile đã được trigger tự động tạo
    -- Nếu trigger không hoạt động, dùng lệnh ở mục 5 để tạo profile
    
    RAISE NOTICE 'User created successfully with ID: %', new_user_id;
    RAISE NOTICE 'Profile auto-created by trigger';
END $$;

-- =====================================================
-- 2. TEMPLATE ADMIN USER
-- =====================================================

-- Copy và chỉnh sửa phần được đánh dấu 🔴
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_user_meta_data, created_at, updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@example.com',  -- 🔴 Email đăng nhập
    crypt('admin123456', gen_salt('bf')),  -- 🔴 Mật khẩu
    now(),
    '{"is_garage_admin": true, "full_name": "Admin Name", "role": "admin"}'::jsonb,
    now(),
    now()
);

-- =====================================================
-- 3. TEMPLATE EMPLOYEE USER
-- =====================================================

INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_user_meta_data, created_at, updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'employee@example.com',  -- 🔴 Email đăng nhập
    crypt('employee123', gen_salt('bf')),  -- 🔴 Mật khẩu
    now(),
    '{"is_garage_admin": false, "full_name": "Employee Name", "role": "employee"}'::jsonb,
    now(),
    now()
);

-- =====================================================
-- 4. TẠO NHIỀU USER CÙNG LÚC
-- =====================================================

DO $$
DECLARE
    users_data JSON := '[
        {"email": "user1@example.com", "password": "pass123", "name": "User One", "is_admin": true},
        {"email": "user2@example.com", "password": "pass123", "name": "User Two", "is_admin": false},
        {"email": "user3@example.com", "password": "pass123", "name": "User Three", "is_admin": false}
    ]';
    user_record JSON;
    new_id UUID;
BEGIN
    FOR user_record IN SELECT * FROM json_array_elements(users_data)
    LOOP
        new_id := gen_random_uuid();
        
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password,
            email_confirmed_at, raw_user_meta_data, created_at, updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            new_id,
            'authenticated',
            'authenticated',
            user_record->>'email',
            crypt(user_record->>'password', gen_salt('bf')),
            now(),
            jsonb_build_object(
                'is_garage_admin', (user_record->>'is_admin')::boolean,
                'full_name', user_record->>'name',
                'role', CASE WHEN (user_record->>'is_admin')::boolean THEN 'admin' ELSE 'employee' END
            ),
            now(),
            now()
        );
        
        RAISE NOTICE 'Created user: % with ID: %', user_record->>'email', new_id;
    END LOOP;
END $$;

-- =====================================================
-- 5. TẠO PROFILE CHO USER ĐÃ TỒN TẠI
-- =====================================================

-- Nếu user đã tồn tại nhưng chưa có profile
INSERT INTO profiles (id, email, full_name, role)
SELECT 
    u.id,
    u.email,
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'role'
FROM auth.users u
WHERE u.id = 'USER_ID_HERE'  -- 🔴 Thay bằng user ID
ON CONFLICT (id) DO NOTHING;

-- Hoặc tạo cho tất cả users chưa có profile
INSERT INTO profiles (id, email, full_name, role)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', ''),
    COALESCE(u.raw_user_meta_data->>'role', 'employee')
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 6. CẬP NHẬT THÔNG TIN USER
-- =====================================================

-- Đổi mật khẩu
UPDATE auth.users
SET 
    encrypted_password = crypt('new_password', gen_salt('bf')),  -- 🔴 Mật khẩu mới
    updated_at = now()
WHERE email = 'user@example.com';  -- 🔴 Email user cần đổi

-- Đổi role thành admin
UPDATE auth.users
SET 
    raw_user_meta_data = raw_user_meta_data || '{"is_garage_admin": true}'::jsonb,
    updated_at = now()
WHERE email = 'user@example.com';  -- 🔴 Email user

UPDATE profiles
SET role = 'admin', updated_at = now()
WHERE email = 'user@example.com';  -- 🔴 Email user

-- Đổi tên
UPDATE auth.users
SET 
    raw_user_meta_data = jsonb_set(
        raw_user_meta_data,
        '{full_name}',
        '"New Full Name"'  -- 🔴 Tên mới
    ),
    updated_at = now()
WHERE email = 'user@example.com';  -- 🔴 Email user

UPDATE profiles
SET full_name = 'New Full Name', updated_at = now()  -- 🔴 Tên mới
WHERE email = 'user@example.com';  -- 🔴 Email user

-- =====================================================
-- 7. XÓA USER
-- =====================================================

-- Xóa user (cascade sẽ xóa luôn profile)
DELETE FROM auth.users 
WHERE email = 'user@example.com';  -- 🔴 Email user cần xóa

-- Hoặc xóa theo ID
DELETE FROM auth.users 
WHERE id = 'USER_ID_HERE';  -- 🔴 User ID

-- =====================================================
-- 8. KIỂM TRA VÀ DEBUG
-- =====================================================

-- Xem tất cả users và profiles
SELECT 
    u.id,
    u.email,
    u.raw_user_meta_data->>'full_name' as full_name,
    u.raw_user_meta_data->>'is_garage_admin' as is_admin,
    p.role as profile_role,
    p.id IS NOT NULL as has_profile,
    u.email_confirmed_at IS NOT NULL as email_confirmed,
    u.created_at
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
ORDER BY u.created_at DESC;

-- Kiểm tra user cụ thể
SELECT 
    u.*,
    p.*
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'user@example.com';  -- 🔴 Email cần kiểm tra

-- Kiểm tra users không có profile
SELECT 
    u.id,
    u.email,
    u.raw_user_meta_data->>'full_name' as full_name
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- Test đăng nhập (verify password hash)
SELECT 
    email,
    encrypted_password = crypt('test_password', encrypted_password) as password_match  -- 🔴 Password để test
FROM auth.users
WHERE email = 'user@example.com';  -- 🔴 Email

-- =====================================================
-- 9. RESET MẬT KHẨU CHO TẤT CẢ TEST USERS
-- =====================================================

-- Đặt tất cả users có email @garage.com thành password: test123
UPDATE auth.users
SET 
    encrypted_password = crypt('test123', gen_salt('bf')),
    updated_at = now()
WHERE email LIKE '%@garage.com';

-- =====================================================
-- 10. XÓA TẤT CẢ TEST DATA
-- =====================================================

-- ⚠️ CẢNH BÁO: Lệnh này sẽ xóa TẤT CẢ data
-- Chỉ dùng trong môi trường development!

BEGIN;
-- Xóa users test
DELETE FROM auth.users WHERE email LIKE '%@garage.com';
-- Xóa data mẫu
DELETE FROM payments;
DELETE FROM repair_order_items;
DELETE FROM repair_orders;
DELETE FROM vehicles;
DELETE FROM customers;
DELETE FROM spare_parts;
DELETE FROM labor_types;
-- Kiểm tra trước khi commit
SELECT 
    (SELECT COUNT(*) FROM auth.users WHERE email LIKE '%@garage.com') as test_users,
    (SELECT COUNT(*) FROM profiles) as profiles,
    (SELECT COUNT(*) FROM customers) as customers;
-- Nếu OK thì: COMMIT;
-- Nếu sai thì: ROLLBACK;
ROLLBACK;  -- Mặc định rollback để an toàn

-- =====================================================
-- NOTES & BEST PRACTICES
-- =====================================================

/*
1. MẬT KHẨU:
   - Minimum 6 ký tự
   - Luôn dùng crypt() để hash
   - Không lưu plain text password

2. EMAIL:
   - Phải unique
   - Nên lowercase
   - Format hợp lệ

3. ROLE:
   - 'admin': Full access, quản lý settings
   - 'employee': Limited access, daily operations

4. METADATA:
   - is_garage_admin: boolean trong auth.users metadata
   - role: string trong profiles table
   - Phải sync cả 2 nơi

5. TRIGGER:
   - handle_new_user() tự động tạo profile
   - Nếu không work, tạo profile manual

6. RLS:
   - All tables có RLS enabled
   - Policies check is_staff() và is_admin()
   - Test kỹ permissions

7. TESTING:
   - Test login sau khi tạo user
   - Verify profile được tạo
   - Check email_confirmed_at NOT NULL

8. PRODUCTION:
   - Đổi password mặc định
   - Disable test accounts
   - Backup trước khi chạy migration
*/

-- =====================================================
-- QUICK TEMPLATES
-- =====================================================

-- Template 1: Quick Admin
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'EMAIL', crypt('PASSWORD', gen_salt('bf')), now(), '{"is_garage_admin": true, "full_name": "NAME", "role": "admin"}'::jsonb, now(), now());

-- Template 2: Quick Employee  
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'EMAIL', crypt('PASSWORD', gen_salt('bf')), now(), '{"is_garage_admin": false, "full_name": "NAME", "role": "employee"}'::jsonb, now(), now());

-- Template 3: Change Password
UPDATE auth.users SET encrypted_password = crypt('NEW_PASSWORD', gen_salt('bf')), updated_at = now() WHERE email = 'EMAIL';

-- Template 4: Make Admin
UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"is_garage_admin": true}'::jsonb WHERE email = 'EMAIL';
UPDATE profiles SET role = 'admin' WHERE email = 'EMAIL';

-- =====================================================
-- END OF QUICK REFERENCE
-- =====================================================
