-- Run this in your Supabase SQL Editor to enable syncing
-- This adds missing columns for stats tracking

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS total_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_wpm INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS weekly_activity JSONB DEFAULT '[false, false, false, false, false, false, false]'::jsonb;

-- Update RLS policies just in case
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
