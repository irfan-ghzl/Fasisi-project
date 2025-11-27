-- Add related_id column to notifications table
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS related_id BIGINT DEFAULT 0;
