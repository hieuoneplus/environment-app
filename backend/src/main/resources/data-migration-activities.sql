-- Migration script to fix image_url column length issue
-- Run this if you get "value too long for type character varying(255)" error

-- Check current column type
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'activities' AND column_name = 'image_url';

-- Alter column to TEXT (unlimited length)
ALTER TABLE public.activities 
ALTER COLUMN image_url TYPE TEXT;

-- Also ensure detected_object can handle longer values
ALTER TABLE public.activities 
ALTER COLUMN detected_object TYPE VARCHAR(500);

-- Verify changes
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'activities' 
AND column_name IN ('image_url', 'detected_object');
