-- Create the 'coffee-photos' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('coffee-photos', 'coffee-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies to ensure clean state and avoid "already exists" errors
DROP POLICY IF EXISTS "Users can upload coffee photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their coffee photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view coffee photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their coffee photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their coffee photos" ON storage.objects;

-- Allow authenticated users to upload their own photos
CREATE POLICY "Users can upload coffee photos" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (
    bucket_id = 'coffee-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to all photos in this bucket
CREATE POLICY "Public can view coffee photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'coffee-photos');

-- Allow users to update their own photos
CREATE POLICY "Users can update their coffee photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'coffee-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own photos
CREATE POLICY "Users can delete their coffee photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'coffee-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);
