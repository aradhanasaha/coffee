-- Storage bucket policies for coffee photos
-- Run this in Supabase SQL Editor after creating the 'coffee-photos' bucket

-- Allow authenticated users to upload their own photos
CREATE POLICY "Users can upload coffee photos" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (
    bucket_id = 'coffee-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to read their own photos
CREATE POLICY "Users can view their coffee photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'coffee-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

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
