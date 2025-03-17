-- Update existing notifications to correct type
UPDATE notifications
SET type = 'workout_assigned_to_client'
WHERE type = 'workout_assigned';

-- Create a trigger function to set the correct notification type
CREATE OR REPLACE FUNCTION set_workout_notification_type()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.type = 'workout_assigned' AND NEW.client_id IS NOT NULL THEN
        NEW.type := 'workout_assigned_to_client';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically correct notification types
DROP TRIGGER IF EXISTS workout_notification_type_trigger ON notifications;
CREATE TRIGGER workout_notification_type_trigger
BEFORE INSERT ON notifications
FOR EACH ROW
EXECUTE FUNCTION set_workout_notification_type();
