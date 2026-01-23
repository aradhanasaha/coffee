-- Add soft delete columns to coffee_logs
ALTER TABLE coffee_logs 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deletion_reason TEXT DEFAULT NULL;

-- Index for performance on soft-deleted queries
CREATE INDEX IF NOT EXISTS idx_coffee_logs_deleted_at ON coffee_logs(deleted_at) WHERE deleted_at IS NULL;
