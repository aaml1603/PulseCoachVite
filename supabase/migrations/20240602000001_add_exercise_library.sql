CREATE TABLE IF NOT EXISTS exercise_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  default_sets INTEGER DEFAULT 3,
  default_reps INTEGER DEFAULT 10,
  default_rest_seconds INTEGER DEFAULT 60,
  user_id UUID REFERENCES auth.users(id),
  is_global BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS exercise_library_user_id_idx ON exercise_library(user_id);
CREATE INDEX IF NOT EXISTS exercise_library_category_idx ON exercise_library(category);

alter publication supabase_realtime add table exercise_library;

-- Add some default exercises
INSERT INTO exercise_library (name, category, description, default_sets, default_reps, default_rest_seconds, is_global) VALUES
('Barbell Squat', 'Legs', 'A compound exercise that targets the quadriceps, hamstrings, and glutes', 4, 8, 90, true),
('Deadlift', 'Back', 'A compound exercise that targets the lower back, glutes, and hamstrings', 4, 6, 120, true),
('Bench Press', 'Chest', 'A compound exercise that targets the chest, shoulders, and triceps', 4, 8, 90, true),
('Pull-up', 'Back', 'A compound exercise that targets the back and biceps', 3, 10, 60, true),
('Push-up', 'Chest', 'A bodyweight exercise that targets the chest, shoulders, and triceps', 3, 15, 45, true),
('Plank', 'Core', 'An isometric exercise that targets the core muscles', 3, 30, 45, true),
('Lunges', 'Legs', 'A unilateral exercise that targets the quadriceps, hamstrings, and glutes', 3, 12, 60, true),
('Shoulder Press', 'Shoulders', 'A compound exercise that targets the shoulders and triceps', 3, 10, 60, true),
('Bicep Curl', 'Arms', 'An isolation exercise that targets the biceps', 3, 12, 45, true),
('Tricep Extension', 'Arms', 'An isolation exercise that targets the triceps', 3, 12, 45, true),
('Leg Press', 'Legs', 'A machine exercise that targets the quadriceps, hamstrings, and glutes', 3, 12, 60, true),
('Lat Pulldown', 'Back', 'A machine exercise that targets the back and biceps', 3, 12, 60, true),
('Chest Fly', 'Chest', 'An isolation exercise that targets the chest', 3, 12, 45, true),
('Russian Twist', 'Core', 'A rotational exercise that targets the obliques', 3, 20, 45, true),
('Calf Raise', 'Legs', 'An isolation exercise that targets the calves', 3, 15, 30, true);