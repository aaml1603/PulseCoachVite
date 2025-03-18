-- Improve the function to prevent duplicate workout completion notifications by checking workout_id
CREATE OR REPLACE FUNCTION prevent_duplicate_workout_completion_notifications()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if a notification for this specific workout completion already exists
  -- Parse the message to extract workout information
  IF NEW.type = 'workout_completion' AND
     EXISTS (
       SELECT 1 FROM notifications 
       WHERE type = 'workout_completion' 
       AND client_id = NEW.client_id
       AND message ILIKE '%' || (regexp_matches(NEW.message, 'completed (the|their) workout: ([^"]+)', 'i'))[2] || '%'
       AND created_at > NOW() - INTERVAL '10 minutes'
     ) THEN
    -- Skip creating another notification
    RETURN NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS prevent_duplicate_workout_completion_notifications_trigger ON notifications;
CREATE TRIGGER prevent_duplicate_workout_completion_notifications_trigger
BEFORE INSERT ON notifications
FOR EACH ROW
WHEN (NEW.type = 'workout_completion')
EXECUTE FUNCTION prevent_duplicate_workout_completion_notifications();
