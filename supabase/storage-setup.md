# Supabase Storage Setup for Banner and Logo Images

## Required Storage Bucket Configuration

To enable banner and logo image uploads, you need to configure storage buckets in your Supabase dashboard.

### 1. Create Storage Buckets

1. Go to your Supabase project dashboard
2. Navigate to Storage
3. Create two new buckets:
   - `garage-banners` - Set as **Public** (so banner images can be displayed)
   - `garage-logos` - Set as **Public** (so logo images can be displayed)

### 2. Storage Policies

Add these RLS policies to both buckets:

#### Policies for `garage-banners` bucket:

**Policy 1: Allow Admin Upload**

```sql
-- Policy for uploading banner images (admin only)
CREATE POLICY "Admin can upload banner images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'garage-banners'
  AND auth.jwt() ->> 'user_metadata' ->> 'is_garage_admin' = 'true'
);
```

**Policy 2: Allow Admin Delete**

```sql
-- Policy for deleting banner images (admin only)
CREATE POLICY "Admin can delete banner images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'garage-banners'
  AND auth.jwt() ->> 'user_metadata' ->> 'is_garage_admin' = 'true'
);
```

**Policy 3: Allow Public Read**

```sql
-- Policy for public access to banner images (anyone can view)
CREATE POLICY "Public read access for banner images" ON storage.objects
FOR SELECT USING (bucket_id = 'garage-banners');
```

#### Policies for `garage-logos` bucket:

**Policy 1: Allow Admin Upload**

```sql
-- Policy for uploading logo images (admin only)
CREATE POLICY "Admin can upload logo images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'garage-logos'
  AND auth.jwt() ->> 'user_metadata' ->> 'is_garage_admin' = 'true'
);
```

**Policy 2: Allow Admin Delete**

```sql
-- Policy for deleting logo images (admin only)
CREATE POLICY "Admin can delete logo images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'garage-logos'
  AND auth.jwt() ->> 'user_metadata' ->> 'is_garage_admin' = 'true'
);
```

**Policy 3: Allow Public Read**

```sql
-- Policy for public access to logo images (anyone can view)
CREATE POLICY "Public read access for logo images" ON storage.objects
FOR SELECT USING (bucket_id = 'garage-logos');
```

### 3. Alternative: Profile-based Policies

If you prefer to use the profiles table instead of user metadata:

#### Policy 1: Admin Upload (Profile-based)

```sql
CREATE POLICY "Admin can upload banner images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'garage-banners'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

#### Policy 2: Admin Delete (Profile-based)

```sql
CREATE POLICY "Admin can delete banner images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'garage-banners'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

### 4. Bucket Settings

- **Bucket Name**: `garage-banners`
- **Public**: Yes (required for public banner display)
- **File Size Limit**: 10MB (handled by application logic)
- **Allowed MIME Types**: `image/*` (handled by application logic)

## Testing

After setting up the policies, test the banner upload functionality:

1. Login as an admin user
2. Go to Settings
3. Upload a banner image
4. Verify it appears on the landing page
5. Upload a new banner to verify the old one is deleted

## Troubleshooting

If you get "RLS policy violation" errors:

1. Check that the user has `is_garage_admin: true` in their auth user metadata
2. Verify the storage policies are correctly applied
3. Ensure the bucket is created and set to public
4. Check that the user is authenticated and has admin role in profiles table
