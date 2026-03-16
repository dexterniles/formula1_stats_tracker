-- Migration: Extended Telemetry Integration
-- Description: Adds tables for Weather, Race Control messages, and Session Results to support deeper analytics.

-- 1. Weather Events Table
CREATE TABLE IF NOT EXISTS public.weather_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_key INT NOT NULL,
    meeting_key INT NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    air_temperature NUMERIC(5, 2),
    track_temperature NUMERIC(5, 2),
    humidity NUMERIC(5, 2),
    rainfall INT, -- usually an indicator (0 or 1)
    wind_speed NUMERIC(5, 2),
    wind_direction INT,
    UNIQUE(session_key, recorded_at)
);

-- Note: We do not set up foreign keys to `races` here yet if we are using string IDs for races currently. 
-- In our system, `races.id` is something like '2026-bhr', but OpenF1 `session_key` is an integer.
-- We will link them via the API sync process or rely on `session_key` directly from OpenF1 endpoints.

-- 2. Race Control Table
CREATE TABLE IF NOT EXISTS public.race_control (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_key INT NOT NULL,
    meeting_key INT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    category TEXT,
    message TEXT NOT NULL,
    flag TEXT,
    driver_number INT,
    scope TEXT,
    sector INT,
    UNIQUE(session_key, timestamp, message)
);

-- 3. Session Results Table
CREATE TABLE IF NOT EXISTS public.session_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_key INT NOT NULL,
    meeting_key INT NOT NULL,
    driver_number INT NOT NULL,
    position INT,
    grid_position INT,
    status TEXT, -- E.g., "Finished", "DNF"
    points NUMERIC(5, 1) DEFAULT 0,
    time_penalty NUMERIC(5, 2),
    fastest_lap BOOLEAN DEFAULT false,
    UNIQUE(session_key, driver_number)
);

-- Set up Realtime for the new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.weather_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.race_control;
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_results;

-- Enable Row Level Security (RLS) policies allowing public read access
ALTER TABLE public.weather_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-only access for weather_events."
    ON public.weather_events FOR SELECT USING (true);

ALTER TABLE public.race_control ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-only access for race_control."
    ON public.race_control FOR SELECT USING (true);

ALTER TABLE public.session_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-only access for session_results."
    ON public.session_results FOR SELECT USING (true);
