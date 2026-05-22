-- Add is_archived column to targets
ALTER TABLE targets ADD COLUMN is_archived BOOLEAN NOT NULL DEFAULT false;
