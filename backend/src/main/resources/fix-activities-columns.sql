-- Fix activities table columns to support longer values
-- Run this script manually if automatic migration fails

-- Fix image_url column: Change from VARCHAR(255) to TEXT (unlimited)
ALTER TABLE public.activities 
ALTER COLUMN image_url TYPE TEXT USING image_url::TEXT;

-- Fix detected_object column: Change to VARCHAR(500) if smaller
ALTER TABLE public.activities 
ALTER COLUMN detected_object TYPE VARCHAR(500);

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'activities' 
AND column_name IN ('image_url', 'detected_object');
