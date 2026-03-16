import { supabase } from '@/lib/supabaseClient';
import AnalysisClient from './AnalysisClient';

export const revalidate = 60;

export default async function AnalysisPage() {
  // We fetch current standings to build the chart lines dynamically around the active teams
  const { data: constructorStandings } = await supabase
    .from('constructor_standings')
    .select('*, constructors(name, color_hex)')
    .order('position', { ascending: true })
    .limit(5); // Top 5 teams for the chart

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2">Telemetry & Analysis</h1>
        <p className="text-white/60">Championship Points Progression over the 2026 Season</p>
      </header>

      <AnalysisClient topTeams={constructorStandings || []} />
    </div>
  );
}
