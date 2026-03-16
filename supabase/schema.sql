-- Formula 1 Stats Tracker Schema

-- 1. Constructors (Teams)
CREATE TABLE public.constructors (
    id TEXT PRIMARY KEY, -- e.g., 'ferrari', 'mclaren'
    name TEXT NOT NULL,
    color_hex TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Drivers
CREATE TABLE public.drivers (
    id TEXT PRIMARY KEY, -- e.g., 'leclerc', 'norris'
    constructor_id TEXT REFERENCES public.constructors(id),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    number INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Races
CREATE TABLE public.races (
    id TEXT PRIMARY KEY, -- e.g., '2026-bahrain'
    season INTEGER NOT NULL,
    round INTEGER NOT NULL,
    race_name TEXT NOT NULL,
    circuit_name TEXT NOT NULL,
    session_date TIMESTAMP WITH TIME ZONE NOT NULL, -- UTC Time of the main race
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Driver Standings
CREATE TABLE public.driver_standings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id TEXT REFERENCES public.drivers(id),
    points NUMERIC NOT NULL,
    position INTEGER NOT NULL,
    wins INTEGER NOT NULL DEFAULT 0,
    season INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Constructor Standings
CREATE TABLE public.constructor_standings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    constructor_id TEXT REFERENCES public.constructors(id),
    points NUMERIC NOT NULL,
    position INTEGER NOT NULL,
    wins INTEGER NOT NULL DEFAULT 0,
    season INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Configure Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.races;
ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_standings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.constructor_standings;

-- Insert Base 2026 Constructors Data (Mock Data for Initialization)
INSERT INTO public.constructors (id, name, color_hex) VALUES 
('ferrari', 'Ferrari', '#E8002D'),
('mclaren', 'McLaren', '#FF8000'),
('mercedes', 'Mercedes', '#27F4D2'),
('red_bull', 'Red Bull Racing', '#3671C6'),
('aston_martin', 'Aston Martin', '#229971'),
('audi', 'Audi', '#F50537'),
('williams', 'Williams', '#1868DB'),
('haas', 'Haas F1 Team', '#DEE1E2'),
('cadillac', 'Cadillac', '#AAAAAD')
ON CONFLICT (id) DO NOTHING;

-- Insert Mock Drivers Data
INSERT INTO public.drivers (id, constructor_id, first_name, last_name, number) VALUES
('leclerc', 'ferrari', 'Charles', 'Leclerc', 16),
('hamilton', 'ferrari', 'Lewis', 'Hamilton', 44),
('norris', 'mclaren', 'Lando', 'Norris', 4),
('piastri', 'mclaren', 'Oscar', 'Piastri', 81),
('russell', 'mercedes', 'George', 'Russell', 63),
('antonelli', 'mercedes', 'Kimi', 'Antonelli', 12),
('verstappen', 'red_bull', 'Max', 'Verstappen', 1),
('tsunoda', 'red_bull', 'Yuki', 'Tsunoda', 22),
('alonso', 'aston_martin', 'Fernando', 'Alonso', 14),
('stroll', 'aston_martin', 'Lance', 'Stroll', 18),
('hulkenberg', 'audi', 'Nico', 'Hülkenberg', 27),
('bortoleto', 'audi', 'Gabriel', 'Bortoleto', 5),
('sainz', 'williams', 'Carlos', 'Sainz', 55),
('albon', 'williams', 'Alexander', 'Albon', 23),
('ocon', 'haas', 'Esteban', 'Ocon', 31),
('bearman', 'haas', 'Oliver', 'Bearman', 87),
('herta', 'cadillac', 'Colton', 'Herta', 26)
ON CONFLICT (id) DO NOTHING;

-- Insert Base Race Schedule (First 3 internal mock races starting from March 2026)
INSERT INTO public.races (id, season, round, race_name, circuit_name, session_date) VALUES 
('2026-01', 2026, 1, 'Bahrain Grand Prix', 'Bahrain International Circuit', '2026-03-21T15:00:00Z'),
('2026-02', 2026, 2, 'Saudi Arabian Grand Prix', 'Jeddah Corniche Circuit', '2026-03-28T17:00:00Z'),
('2026-03', 2026, 3, 'Australian Grand Prix', 'Albert Park Circuit', '2026-04-12T05:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Insert Driver Standings Mock Init
INSERT INTO public.driver_standings (driver_id, points, position, wins, season) VALUES
('leclerc', 25, 1, 1, 2026),
('norris', 18, 2, 0, 2026),
('verstappen', 15, 3, 0, 2026),
('hamilton', 12, 4, 0, 2026),
('piastri', 10, 5, 0, 2026)
ON CONFLICT (id) DO NOTHING;

-- Insert Constructor Standings Mock Init
INSERT INTO public.constructor_standings (constructor_id, points, position, wins, season) VALUES
('ferrari', 37, 1, 1, 2026),
('mclaren', 28, 2, 0, 2026),
('red_bull', 15, 3, 0, 2026),
('mercedes', 8, 4, 0, 2026)
ON CONFLICT (id) DO NOTHING;
