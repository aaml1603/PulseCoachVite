-- Add order column to exercises table
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS "order" INTEGER;

-- Enable realtime for exercises table
alter publication supabase_realtime add table exercises;