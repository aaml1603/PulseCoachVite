-- Add feedback column to workouts table
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS feedback TEXT;

-- Add type column to notifications table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'type') THEN
    ALTER TABLE notifications ADD COLUMN type TEXT;
  END IF;
END $$;

-- Update existing notifications to have a default type
UPDATE notifications SET type = 'general' WHERE type IS NULL;
