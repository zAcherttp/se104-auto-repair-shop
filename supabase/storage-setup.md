# Supabase Storage Setup for Banner Images

## Required Storage Bucket Configuration

To enable banner image uploads, you need to configure the `garage-banners` storage bucket in your Supabase dashboard.

### 1. Create Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to Storage
3. Create a new bucket named `garage-banners`
4. Set it as **Public** (so banner images can be displayed on the landing page)

### 2. Storage Policies

Add these RLS policies to the `garage-banners` bucket:

#### Policy 1: Allow Admin Upload

```sql
-- Policy for uploading banner images (admin only)
CREATE POLICY "Admin can upload banner images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'garage-banners'
  AND auth.jwt() ->> 'user_metadata' ->> 'is_garage_admin' = 'true'
);
```

#### Policy 2: Allow Admin Delete

```sql
-- Policy for deleting banner images (admin only)
CREATE POLICY "Admin can delete banner images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'garage-banners'
  AND auth.jwt() ->> 'user_metadata' ->> 'is_garage_admin' = 'true'
);
```

#### Policy 3: Allow Public Read

```sql
-- Policy for public access to banner images (anyone can view)
CREATE POLICY "Public read access for banner images" ON storage.objects
FOR SELECT USING (bucket_id = 'garage-banners');
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
