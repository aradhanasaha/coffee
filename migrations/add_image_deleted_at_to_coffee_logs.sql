-- Add image_deleted_at column to coffee_logs table for soft deletion of images
ALTER TABLE coffee_logs 
ADD COLUMN IF NOT EXISTS image_deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
