-- Create exercises table if it doesn't exist
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  rest_seconds INTEGER NOT NULL,
  notes TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Create policy for exercises
DROP POLICY IF EXISTS "Coaches can CRUD their clients' exercises" ON exercises;
CREATE POLICY "Coaches can CRUD their clients' exercises"
  ON exercises
  USING (
    EXISTS (
      SELECT 1 FROM workouts w
      JOIN clients c ON w.client_id = c.id
      WHERE w.id = exercises.workout_id AND c.user_id = auth.uid()
    )
  );

-- Skip adding to realtime publication since it's already a member
