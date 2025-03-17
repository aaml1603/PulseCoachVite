-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  client_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  client_id UUID NOT NULL,
  sender_type TEXT NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Enable realtime for notifications and messages
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table messages;

-- Create trigger to create notification when workout is completed
CREATE OR REPLACE FUNCTION create_workout_completed_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status <> 'completed') THEN
    INSERT INTO notifications (user_id, client_id, title, message, type)
    SELECT 
      workouts.user_id,
      workouts.client_id,
      'Workout Completed',
      'Client has completed the workout: ' || workouts.title,
      'workout_completed'
    FROM workouts
    WHERE workouts.id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS workout_completed_notification_trigger ON workouts;
CREATE TRIGGER workout_completed_notification_trigger
AFTER UPDATE ON workouts
FOR EACH ROW
EXECUTE FUNCTION create_workout_completed_notification();
