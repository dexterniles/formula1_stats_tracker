import { supabase } from '@/lib/supabaseClient';
import StandingsClient from './StandingsClient';

export const revalidate = 60;

export default async function StandingsPage() {
  // Fetch drivers with their constructor relations
  const { data: driverStandings } = await supabase
    .from('driver_standings')
    .select(`
      *,
      drivers (
        first_name, 
        last_name, 
        number,
        constructors (name, color_hex)
      )
    `)
    .order('position', { ascending: true });

  const { data: constructorStandings } = await supabase
    .from('constructor_standings')
    .select('*, constructors(name, color_hex)')
    .order('position', { ascending: true });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2">Championship</h1>
        <p className="text-white/60">Live 2026 Season Standings</p>
      </header>

      <StandingsClient 
        driverStandings={driverStandings || []} 
        constructorStandings={constructorStandings || []} 
      />
    </div>
  );
}
