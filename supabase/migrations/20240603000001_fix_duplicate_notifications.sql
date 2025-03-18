-- Create a function to prevent duplicate workout completion notifications
CREATE OR REPLACE FUNCTION prevent_duplicate_workout_completion_notifications()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if a notification for this workout completion already exists
  IF EXISTS (
    SELECT 1 FROM notifications 
    WHERE type = 'workout_completion' 
    AND client_id = NEW.client_id
    AND created_at > NOW() - INTERVAL '5 minutes'
  ) THEN
    -- Skip creating another notification
    RETURN NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to prevent duplicate notifications
DROP TRIGGER IF EXISTS prevent_duplicate_workout_completion_notifications_trigger ON notifications;
CREATE TRIGGER prevent_duplicate_workout_completion_notifications_trigger
BEFORE INSERT ON notifications
FOR EACH ROW
WHEN (NEW.type = 'workout_completion')
EXECUTE FUNCTION prevent_duplicate_workout_completion_notifications();
