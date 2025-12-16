-- Migration script to add new columns to existing users table
-- Run this manually if Hibernate auto-update fails

-- Add columns as nullable first
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS green_points INTEGER DEFAULT 0;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS rank VARCHAR(100) DEFAULT 'Mầm Non Tích Cực';

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS last_activity_date DATE;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update existing records with default values
UPDATE public.users 
SET green_points = 0 
WHERE green_points IS NULL;

UPDATE public.users 
SET rank = 'Mầm Non Tích Cực' 
WHERE rank IS NULL;

UPDATE public.users 
SET streak = 0 
WHERE streak IS NULL;

UPDATE public.users 
SET created_at = CURRENT_TIMESTAMP 
WHERE created_at IS NULL;

UPDATE public.users 
SET updated_at = CURRENT_TIMESTAMP 
WHERE updated_at IS NULL;
