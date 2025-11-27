-- Remove related_id column from notifications table
ALTER TABLE notifications 
DROP COLUMN IF EXISTS related_id;
