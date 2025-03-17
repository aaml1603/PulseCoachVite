-- Add client_name and client_email to client_portals if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_portals' AND column_name = 'client_name') THEN
        ALTER TABLE client_portals ADD COLUMN client_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_portals' AND column_name = 'client_email') THEN
        ALTER TABLE client_portals ADD COLUMN client_email TEXT;
    END IF;
END $$;

-- Update client_portals with client name and email
UPDATE client_portals cp
SET 
    client_name = c.name,
    client_email = c.email
FROM clients c
WHERE cp.client_id = c.id AND (cp.client_name IS NULL OR cp.client_email IS NULL);

-- Fix notification type for workout assignments
UPDATE notifications
SET type = 'workout_assigned_to_client'
WHERE type = 'workout_assigned' AND client_id IS NOT NULL;
