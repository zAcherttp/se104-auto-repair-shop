# 🗄️ Database Setup Guide - Hướng Dẫn Thiết Lập Database

## 📋 Tổng quan

Thư mục này chứa các SQL migration files để khởi tạo toàn bộ database schema cho hệ thống quản lý garage ô tô.

## 📁 Các file SQL

### 1. `00000000000000_init_schema.sql`

**Mục đích:** Tạo toàn bộ cấu trúc database
**Bao gồm:**

- ✅ Enums (payment_method, repair_order_status)
- ✅ 9 Tables chính (profiles, customers, vehicles, spare_parts, labor_types, repair_orders, repair_order_items, payments, system_settings)
- ✅ Indexes để tối ưu query performance
- ✅ Functions (is_admin, is_staff)
- ✅ Triggers (auto-create profile, auto-update timestamps)
- ✅ Row Level Security (RLS) policies
- ✅ Comments (documentation)
- ✅ Initial system settings

### 2. `00000000000001_seed_data.sql`

**Mục đích:** Tạo users và data mẫu
**Bao gồm:**

- ✅ 3 tài khoản user (1 admin + 2 employees)
- ✅ 5 khách hàng mẫu
- ✅ 5 xe mẫu
- ✅ 15 phụ tùng mẫu
- ✅ 15 loại dịch vụ mẫu
- ✅ Verification queries

## 🚀 Cách Sử Dụng

### Phương pháp 1: Qua Supabase Dashboard (Khuyến nghị)

1. **Đăng nhập Supabase Dashboard:**

   ```
   https://supabase.com/dashboard/project/gniaismrsstgpfxdbgxd
   ```

2. **Chạy Schema Migration:**

   - Vào **SQL Editor**
   - Tạo **New query**
   - Copy toàn bộ nội dung file `00000000000000_init_schema.sql`
   - Paste vào editor
   - Click **Run** hoặc `Ctrl+Enter`
   - Chờ đợi (có thể mất 30-60 giây)
   - Kiểm tra kết quả: "Success. No rows returned"

3. **Chạy Seed Data:**

   - Tạo **New query** mới
   - Copy toàn bộ nội dung file `00000000000001_seed_data.sql`
   - Paste vào editor
   - Click **Run**
   - Kiểm tra output có hiển thị user IDs và verification results

4. **Verify Installation:**
   - Vào **Table Editor**
   - Kiểm tra các bảng đã được tạo:
     ```
     ✅ profiles
     ✅ customers
     ✅ vehicles
     ✅ spare_parts
     ✅ labor_types
     ✅ repair_orders
     ✅ repair_order_items
     ✅ payments
     ✅ system_settings
     ```

### Phương pháp 2: Qua Supabase CLI

```bash
# 1. Login to Supabase
npx supabase login

# 2. Link to your project
npx supabase link --project-ref gniaismrsstgpfxdbgxd

# 3. Apply migrations
npx supabase db push

# 4. Hoặc chạy từng file
npx supabase db execute --file supabase/migrations/00000000000000_init_schema.sql
npx supabase db execute --file supabase/migrations/00000000000001_seed_data.sql
```

### Phương pháp 3: Chạy Local với Docker

```bash
# 1. Start local Supabase
npx supabase start

# 2. Migrations sẽ tự động apply
# Hoặc force apply:
npx supabase db reset

# 3. Access local dashboard
# URL: http://localhost:54323
```

## 🔐 Tài Khoản Mặc Định

Sau khi chạy seed data, bạn có thể đăng nhập với các tài khoản sau:

### Admin Account

```
Email: admin@garage.com
Password: admin123
Role: Administrator (Full Access)
Quyền: Quản lý settings, inventory, employees, reports
```

### Employee Account 1

```
Email: nhanvien1@garage.com
Password: employee123
Role: Employee
Quyền: Tiếp nhận xe, tạo phiếu sửa chữa, xử lý thanh toán
Full Name: Nguyễn Văn A
```

### Employee Account 2

```
Email: nhanvien2@garage.com
Password: employee123
Role: Employee
Quyền: Tiếp nhận xe, tạo phiếu sửa chữa, xử lý thanh toán
Full Name: Trần Thị B
```

## 🧪 Kiểm Tra Cài Đặt

### 1. Kiểm tra Users đã tạo

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
WHERE u.email LIKE '%@garage.com'
ORDER BY u.email;
```

### 2. Kiểm tra Sample Data

```sql
SELECT
    (SELECT COUNT(*) FROM customers) as customers,
    (SELECT COUNT(*) FROM vehicles) as vehicles,
    (SELECT COUNT(*) FROM spare_parts) as spare_parts,
    (SELECT COUNT(*) FROM labor_types) as labor_types,
    (SELECT COUNT(*) FROM profiles) as profiles;
```

Expected output:

```
customers: 5
vehicles: 5
spare_parts: 15
labor_types: 15
profiles: 3
```

### 3. Test RLS Policies

```sql
-- Test as admin (replace USER_ID with actual admin ID)
SET request.jwt.claims.sub = 'USER_ID';
SELECT * FROM spare_parts; -- Should return all parts
```

### 4. Test Login từ App

```bash
# 1. Start development server
pnpm dev --turbopack

# 2. Open browser
http://localhost:3000/login

# 3. Login với admin@garage.com / admin123
# Should redirect to /reception
```

## 🔧 Troubleshooting

### Lỗi: "permission denied for schema auth"

**Giải pháp:** Chạy SQL script với quyền `service_role`, không phải `anon` key

### Lỗi: "relation already exists"

**Giải pháp:**

```sql
-- Drop existing tables first
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
-- Then re-run migration
```

### Lỗi: Trigger không tạo profile tự động

**Giải pháp:** Chạy manual insert trong file seed:

```sql
INSERT INTO profiles (id, email, full_name, role)
SELECT
    u.id, u.email,
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'role'
FROM auth.users u
WHERE u.email LIKE '%@garage.com'
ON CONFLICT (id) DO NOTHING;
```

### Không thể login

**Kiểm tra:**

1. User có trong `auth.users`?
2. Profile có trong `profiles` table?
3. Email confirmed (`email_confirmed_at` NOT NULL)?
4. `.env.local` có đúng SUPABASE_URL và ANON_KEY?

## 📊 Database Schema Diagram

```
auth.users (Supabase Auth)
    ↓ (1:1)
profiles (User info + Role)
    ↓ (1:N)
repair_orders
    ↓ (1:N)
repair_order_items
    ↓ (N:1)
spare_parts / labor_types

customers
    ↓ (1:N)
vehicles
    ↓ (1:N)
repair_orders
    ↓ (1:N)
payments
```

## 🔄 Updates và Migrations

Để tạo migration mới:

```bash
# 1. Create new migration file
npx supabase migration new your_migration_name

# 2. Edit the generated file in supabase/migrations/

# 3. Apply migration
npx supabase db push
```

## 📚 Tài Liệu Tham Khảo

- [Supabase Database](https://supabase.com/docs/guides/database)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Functions](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [Supabase CLI](https://supabase.com/docs/reference/cli/introduction)

## ⚠️ Lưu Ý Quan Trọng

1. **Production:** Đổi mật khẩu mặc định trước khi deploy
2. **Backup:** Luôn backup database trước khi chạy migration
3. **RLS:** Kiểm tra kỹ RLS policies để đảm bảo security
4. **Indexes:** Các indexes đã được tạo sẵn cho performance
5. **Multi-tenant:** Mỗi garage cần có RLS riêng (chưa implement garage_id)

## 🆘 Support

Nếu gặp vấn đề:

1. Check Supabase logs: Dashboard → Logs
2. Check app logs: Browser DevTools → Console
3. Verify RLS policies: Dashboard → Authentication → Policies
4. Test SQL queries: Dashboard → SQL Editor

---

**Version:** 1.0  
**Last Updated:** October 26, 2025  
**Database Version:** PostgreSQL 15.x (Supabase)
