-- =====================================================
-- DEBUG LOGIN ISSUES
-- =====================================================
-- Chạy các query này để kiểm tra tại sao đăng nhập thất bại
-- =====================================================

-- 1. KIỂM TRA USER CÓ TỒN TẠI KHÔNG
SELECT 
    u.id,
    u.email,
    u.raw_user_meta_data->>'full_name' as full_name,
    u.email_confirmed_at IS NOT NULL as email_confirmed,
    u.banned_until,
    u.deleted_at,
    u.created_at,
    p.id IS NOT NULL as has_profile,
    p.role as profile_role
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'YOUR_EMAIL_HERE'  -- 🔴 Thay bằng email bạn dùng để login
ORDER BY u.created_at DESC;

-- 2. KIỂM TRA TẤT CẢ USERS
SELECT 
    u.id,
    u.email,
    u.raw_user_meta_data->>'full_name' as full_name,
    u.email_confirmed_at IS NOT NULL as email_confirmed,
    u.banned_until IS NULL as not_banned,
    u.deleted_at IS NULL as not_deleted,
    p.id IS NOT NULL as has_profile,
    p.role
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
ORDER BY u.created_at DESC
LIMIT 10;

-- 3. TEST PASSWORD (QUAN TRỌNG)
-- Thay 'YOUR_EMAIL' và 'YOUR_PASSWORD' bằng thông tin thực
SELECT 
    email,
    encrypted_password = crypt('YOUR_PASSWORD', encrypted_password) as password_correct,
    CASE 
        WHEN encrypted_password = crypt('YOUR_PASSWORD', encrypted_password) THEN 'Password ĐÚNG ✅'
        ELSE 'Password SAI ❌'
    END as password_status,
    email_confirmed_at IS NOT NULL as email_confirmed,
    banned_until IS NULL as not_banned
FROM auth.users
WHERE email = 'YOUR_EMAIL';

-- 4. KIỂM TRA CÁC VẤN ĐỀ THƯỜNG GẶP
SELECT 
    email,
    CASE 
        WHEN email_confirmed_at IS NULL THEN '❌ Email chưa được confirm'
        WHEN banned_until IS NOT NULL THEN '❌ User bị banned'
        WHEN deleted_at IS NOT NULL THEN '❌ User đã bị xóa'
        ELSE '✅ User OK'
    END as status,
    email_confirmed_at,
    banned_until,
    deleted_at
FROM auth.users
WHERE email = 'YOUR_EMAIL';

-- 5. XEM AUTH INSTANCES (Kiểm tra instance_id)
SELECT DISTINCT instance_id
FROM auth.users
LIMIT 5;

-- =====================================================
-- FIX COMMON ISSUES
-- =====================================================

-- Fix 1: Confirm email nếu chưa confirm
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'YOUR_EMAIL'
AND email_confirmed_at IS NULL;

-- Fix 2: Unban user nếu bị banned
UPDATE auth.users
SET banned_until = NULL
WHERE email = 'YOUR_EMAIL'
AND banned_until IS NOT NULL;

-- Fix 3: Reset password về giá trị mới
UPDATE auth.users
SET 
    encrypted_password = crypt('newpassword123', gen_salt('bf')),
    updated_at = now()
WHERE email = 'YOUR_EMAIL';

-- Fix 4: Recreate user hoàn toàn mới (nếu cần)
-- Xóa user cũ trước
DELETE FROM auth.users WHERE email = 'YOUR_EMAIL';

-- Tạo lại user mới
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_user_meta_data, created_at, updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'YOUR_EMAIL',
    crypt('YOUR_PASSWORD', gen_salt('bf')),
    now(),
    '{"is_garage_admin": true, "full_name": "YOUR_NAME", "role": "admin"}'::jsonb,
    now(),
    now()
);

-- =====================================================
-- VERIFICATION STEPS
-- =====================================================

-- Step 1: Xác nhận user tồn tại và active
SELECT 
    COUNT(*) as user_exists,
    SUM(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 ELSE 0 END) as confirmed_users,
    SUM(CASE WHEN banned_until IS NULL THEN 1 ELSE 0 END) as not_banned_users
FROM auth.users
WHERE email = 'YOUR_EMAIL';

-- Step 2: Xác nhận có profile
SELECT 
    u.email,
    p.id IS NOT NULL as has_profile,
    p.role,
    p.full_name
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'YOUR_EMAIL';

-- =====================================================
-- QUICK FIX: TẠO USER TEST MỚI
-- =====================================================

-- Tạo user test với thông tin cố định để test
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Xóa user test cũ nếu có
    DELETE FROM auth.users WHERE email = 'test@garage.com';
    
    -- Tạo user test mới
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'test@garage.com',
        crypt('test123', gen_salt('bf')),
        now(),
        '{"is_garage_admin": true, "full_name": "Test User", "role": "admin"}'::jsonb,
        now(),
        now()
    ) RETURNING id INTO test_user_id;
    
    RAISE NOTICE 'Test user created: test@garage.com / test123';
    RAISE NOTICE 'User ID: %', test_user_id;
END $$;

-- Verify test user
SELECT 
    email,
    encrypted_password = crypt('test123', encrypted_password) as password_works,
    email_confirmed_at IS NOT NULL as confirmed
FROM auth.users
WHERE email = 'test@garage.com';

-- =====================================================
-- COMMON ERROR MESSAGES & SOLUTIONS
-- =====================================================

/*
ERROR: "Invalid login credentials"
→ Nguyên nhân:
  1. Email hoặc password sai
  2. Email chưa được confirm (email_confirmed_at = NULL)
  3. User bị banned
  
→ Giải pháp:
  - Chạy query #3 để test password
  - Chạy Fix 1 để confirm email
  - Chạy Fix 2 để unban

ERROR: "Email not confirmed"
→ Giải pháp: Chạy Fix 1

ERROR: "User not found"
→ Giải pháp: User không tồn tại, tạo lại bằng Fix 4

ERROR: Connection issues
→ Kiểm tra:
  - .env.local có đúng SUPABASE_URL và ANON_KEY
  - Dev server đã restart sau khi thay đổi .env
  - Internet connection
*/

-- =====================================================
-- STEP-BY-STEP DEBUG PROCESS
-- =====================================================

-- Bước 1: Kiểm tra user tồn tại
SELECT * FROM auth.users WHERE email = 'YOUR_EMAIL';
-- Nếu không có kết quả → User không tồn tại, cần tạo mới

-- Bước 2: Nếu user tồn tại, test password
SELECT 
    email,
    encrypted_password = crypt('YOUR_PASSWORD', encrypted_password) as correct
FROM auth.users WHERE email = 'YOUR_EMAIL';
-- Nếu correct = false → Password sai, reset password

-- Bước 3: Kiểm tra email confirmed
SELECT email_confirmed_at FROM auth.users WHERE email = 'YOUR_EMAIL';
-- Nếu NULL → Cần confirm, chạy Fix 1

-- Bước 4: Kiểm tra profile
SELECT * FROM profiles WHERE email = 'YOUR_EMAIL';
-- Nếu không có → Tạo profile bằng query ở QUICK_REFERENCE.sql mục 5

-- Bước 5: Test login với user test
-- Login với: test@garage.com / test123
-- Nếu thành công → Vấn đề là user cũ, tạo lại user
-- Nếu vẫn lỗi → Vấn đề là code hoặc config

-- =====================================================
-- END DEBUG
-- =====================================================
