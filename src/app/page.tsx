import { supabase } from '@/lib/supabaseClient';
import DashboardClient from './DashboardClient';

export const revalidate = 60; // 1-minute revalidation at edge

export default async function DashboardPage() {
  // Fetch next race
  const { data: nextRaces, error: raceError } = await supabase
    .from('races')
    .select('*')
    .gte('session_date', new Date().toISOString())
    .order('session_date', { ascending: true })
    .limit(1);

  // Fetch all constructor standings
  const { data: constructorStandings, error: constructorsError } = await supabase
    .from('constructor_standings')
    .select('*, constructors(name, color_hex)')
    .order('position', { ascending: true });

  // Fetch the latest Weather telemetry for the track
  const { data: weatherData } = await supabase
    .from('weather_events')
    .select('*')
    .order('recorded_at', { ascending: false })
    .limit(1)
    .single();

  // Fetch recent Race Control messages (latest 20)
  const { data: raceControlData } = await supabase
    .from('race_control')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(20);

  const nextRace = nextRaces?.[0] || null;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2">Race Control</h1>
        <p className="text-white/60">Live session details and personalized telemetry</p>
      </header>

      <DashboardClient 
        nextRace={nextRace} 
        standings={constructorStandings || []} 
        weatherEvent={weatherData || null}
        recentControls={raceControlData || []}
      />
    </div>
  );
}
