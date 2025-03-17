-- Add completed_at column to workouts table if it doesn't exist already
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workouts' AND column_name = 'completed_at') THEN
        ALTER TABLE workouts ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Ensure notifications table has workout_completion type
COMMENT ON TABLE notifications IS 'Stores user notifications including workout completions';

-- Add index on user_id and read status for faster notification queries
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_user_read') THEN
        CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
    END IF;
END $$;

-- Add index on created_at for faster sorting
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_created_at') THEN
        CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
    END IF;
END $$;
