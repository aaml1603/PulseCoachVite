-- Add order_index column to exercises table if it doesn't exist
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS order_index INTEGER;
