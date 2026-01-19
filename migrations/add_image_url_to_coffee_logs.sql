-- Migration: Add image_url to coffee_logs table
-- Run this in Supabase SQL Editor

-- Step 1: Add image_url column (allow NULL temporarily)
ALTER TABLE coffee_logs 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Step 2: Update existing rows with placeholder
UPDATE coffee_logs 
SET image_url = 'https://via.placeholder.com/400x300/FFF6E5/4A2E25?text=Coffee'
WHERE image_url IS NULL;

-- Step 3: Make column required
ALTER TABLE coffee_logs 
ALTER COLUMN image_url SET NOT NULL;

-- Step 4: Add comment
COMMENT ON COLUMN coffee_logs.image_url IS 'URL to coffee photo in Supabase Storage (required)';
