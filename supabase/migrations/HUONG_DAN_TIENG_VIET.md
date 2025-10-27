# 🇻🇳 Hướng Dẫn Tạo Database & User - Tiếng Việt

## 📦 Các File SQL Đã Tạo

| File                             | Mục Đích                                                    |
| -------------------------------- | ----------------------------------------------------------- |
| `00000000000000_init_schema.sql` | **Tạo toàn bộ database** (tables, functions, RLS, triggers) |
| `00000000000001_seed_data.sql`   | **Tạo users và data mẫu** (3 users + sample data)           |
| `QUICK_REFERENCE.sql`            | **Câu lệnh nhanh** để tạo/sửa user thủ công                 |
| `README.md`                      | **Hướng dẫn chi tiết** (English)                            |

## 🚀 Cách Sử Dụng - 3 Bước Đơn Giản

### Bước 1: Truy Cập Supabase Dashboard

1. Mở: https://supabase.com/dashboard
2. Chọn project: `gniaismrsstgpfxdbgxd`
3. Vào menu: **SQL Editor** (icon database ở sidebar trái)

### Bước 2: Tạo Database Schema

1. Click **New query**
2. Mở file: `supabase/migrations/00000000000000_init_schema.sql`
3. Copy TOÀN BỘ nội dung
4. Paste vào SQL Editor
5. Click **Run** (hoặc nhấn `Ctrl+Enter`)
6. Chờ 30-60 giây
7. ✅ Thấy "Success. No rows returned" là thành công

**Kết quả:** Database đã có 9 tables, functions, triggers, RLS policies

### Bước 3: Tạo Users & Data Mẫu

1. Click **New query** (tạo query mới)
2. Mở file: `supabase/migrations/00000000000001_seed_data.sql`
3. Copy TOÀN BỘ nội dung
4. Paste vào SQL Editor
5. Click **Run**
6. ✅ Kiểm tra output có hiển thị User IDs và bảng thống kê

**Kết quả:** Đã tạo 3 users + 5 khách hàng + 5 xe + 15 phụ tùng + 15 dịch vụ

## 🔑 Tài Khoản Được Tạo

| Email                  | Password      | Vai Trò   | Quyền                                   |
| ---------------------- | ------------- | --------- | --------------------------------------- |
| `admin@garage.com`     | `admin123`    | Admin     | Toàn quyền (settings, báo cáo, quản lý) |
| `nhanvien1@garage.com` | `employee123` | Nhân viên | Tiếp nhận xe, sửa chữa, thanh toán      |
| `nhanvien2@garage.com` | `employee123` | Nhân viên | Tiếp nhận xe, sửa chữa, thanh toán      |

## ✅ Kiểm Tra Cài Đặt

### Kiểm tra qua Dashboard:

1. Vào **Table Editor**
2. Click vào table `profiles`
3. Phải thấy 3 users với email `@garage.com`

### Kiểm tra qua SQL:

```sql
-- Xem users đã tạo
SELECT
    u.email,
    u.raw_user_meta_data->>'full_name' as name,
    p.role
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email LIKE '%@garage.com';
```

### Test đăng nhập:

1. Mở app: http://localhost:3000/login
2. Nhập:
   - Email: `admin@garage.com`
   - Password: `admin123`
3. Click **Đăng nhập**
4. ✅ Phải redirect về `/reception`

## 🔧 Tạo User Thủ Công

### Cách Nhanh Nhất (Copy & Paste):

**Tạo Admin:**

```sql
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@example.com',  -- ⬅️ ĐỔI EMAIL
    crypt('password123', gen_salt('bf')),  -- ⬅️ ĐỔI PASSWORD
    now(),
    '{"is_garage_admin": true, "full_name": "Tên Admin", "role": "admin"}'::jsonb,  -- ⬅️ ĐỔI TÊN
    now(),
    now()
);
```

**Tạo Nhân Viên:**

```sql
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'nhanvien@example.com',  -- ⬅️ ĐỔI EMAIL
    crypt('password123', gen_salt('bf')),  -- ⬅️ ĐỔI PASSWORD
    now(),
    '{"is_garage_admin": false, "full_name": "Tên Nhân Viên", "role": "employee"}'::jsonb,  -- ⬅️ ĐỔI TÊN
    now(),
    now()
);
```

**Đổi Mật Khẩu:**

```sql
UPDATE auth.users
SET encrypted_password = crypt('password_moi', gen_salt('bf'))
WHERE email = 'user@example.com';  -- ⬅️ ĐỔI EMAIL
```

📝 **Xem thêm:** File `QUICK_REFERENCE.sql` có tất cả templates và lệnh hữu ích

## 🛠️ Các Thao Tác Thường Dùng

### 1. Xem Tất Cả Users:

```sql
SELECT
    u.id,
    u.email,
    u.raw_user_meta_data->>'full_name' as full_name,
    u.raw_user_meta_data->>'is_garage_admin' as is_admin,
    p.role,
    u.created_at
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
ORDER BY u.created_at DESC;
```

### 2. Nâng Cấp User Thành Admin:

```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"is_garage_admin": true}'::jsonb
WHERE email = 'user@example.com';

UPDATE profiles
SET role = 'admin'
WHERE email = 'user@example.com';
```

### 3. Reset Password Về Mặc Định:

```sql
UPDATE auth.users
SET encrypted_password = crypt('test123', gen_salt('bf'))
WHERE email LIKE '%@garage.com';
```

### 4. Xóa User:

```sql
DELETE FROM auth.users WHERE email = 'user@example.com';
```

## 📊 Cấu Trúc Database

### 9 Tables Chính:

- ✅ `profiles` - Thông tin user (role, name)
- ✅ `customers` - Khách hàng
- ✅ `vehicles` - Xe
- ✅ `spare_parts` - Phụ tùng (inventory)
- ✅ `labor_types` - Loại dịch vụ
- ✅ `repair_orders` - Phiếu sửa chữa
- ✅ `repair_order_items` - Chi tiết phiếu sửa chữa
- ✅ `payments` - Thanh toán
- ✅ `system_settings` - Cài đặt hệ thống

### Security (RLS Policies):

- ✅ Admin: Toàn quyền
- ✅ Employee: Chỉ CRUD data, không được sửa settings
- ✅ Public: Không có quyền gì

## ❗ Lỗi Thường Gặp & Cách Fix

### Lỗi: "permission denied for schema auth"

**Fix:** Chạy SQL trong SQL Editor, không phải ở Table Editor

### Lỗi: "relation already exists"

**Fix:** Database đã có tables rồi. Xóa và tạo lại:

```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
-- Rồi chạy lại migration
```

### Lỗi: Không login được

**Kiểm tra:**

1. User có trong `auth.users`? → Vào Table Editor xem
2. Profile có trong `profiles`? → Vào Table Editor xem
3. `email_confirmed_at` có giá trị không NULL?
4. File `.env.local` có đúng URL và KEY?

### Profile không tự động tạo

**Fix:** Tạo manual:

```sql
INSERT INTO profiles (id, email, full_name, role)
SELECT
    u.id, u.email,
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'role'
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE p.id IS NULL;
```

## 📚 Tài Liệu

- **README.md** - Hướng dẫn đầy đủ (English)
- **QUICK_REFERENCE.sql** - Tất cả câu lệnh SQL hữu ích
- **00000000000000_init_schema.sql** - Full database schema
- **00000000000001_seed_data.sql** - Sample data + users

## 💡 Tips

1. **Luôn backup** trước khi chạy migration
2. **Test trên local** trước khi chạy production
3. **Đổi password mặc định** trước khi deploy
4. **Dùng QUICK_REFERENCE.sql** cho các tác vụ thường xuyên
5. **Check Supabase Logs** nếu có lỗi: Dashboard → Logs

## 🆘 Cần Giúp Đỡ?

1. Check logs: Supabase Dashboard → Logs
2. Test SQL: SQL Editor → Run query
3. Verify data: Table Editor → Click vào table
4. Browser console: F12 → Console tab

---

**Tác giả:** GitHub Copilot  
**Ngày:** 26/10/2025  
**Version:** 1.0
