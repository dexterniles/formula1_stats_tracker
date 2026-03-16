'use client';

import { usePreferences, teamColors, TeamId } from '@/lib/store/PreferencesContext';
import { Settings as SettingsIcon, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const TEAMS: { id: TeamId; name: string }[] = [
  { id: 'ferrari', name: 'Ferrari' },
  { id: 'mclaren', name: 'McLaren' },
  { id: 'mercedes', name: 'Mercedes' },
  { id: 'red_bull', name: 'Red Bull Racing' },
  { id: 'aston_martin', name: 'Aston Martin' },
  { id: 'audi', name: 'Audi' },
  { id: 'williams', name: 'Williams' },
  { id: 'haas', name: 'Haas F1 Team' },
  { id: 'cadillac', name: 'Cadillac' },
];

export default function SettingsPage() {
  const { favoriteTeam, setFavoriteTeam } = usePreferences();

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <header className="mb-8 flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
          <SettingsIcon size={32} className="text-white/80" />
        </div>
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2">Preferences</h1>
          <p className="text-white/60">Customize your telemetry and UI experience</p>
        </div>
      </header>

      <section className="glass-panel rounded-3xl p-6 md:p-8">
        <h2 className="text-xl font-bold mb-6">Select Favorite Team</h2>
        <p className="text-white/50 text-sm mb-8">
          Choosing a favorite team will dynamically change the application's accent color scheme and default your dashboard telemetry to track their progress.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEAMS.map((team) => {
            const isSelected = favoriteTeam === team.id;
            const hex = teamColors[team.id];

            return (
              <button
                key={team.id}
                onClick={() => setFavoriteTeam(team.id)}
                className={cn(
                  "relative overflow-hidden flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 text-left",
                  isSelected 
                    ? "bg-white/10 border-white/20 shadow-lg scale-[1.02]" 
                    : "bg-black/20 border-white/5 hover:bg-white/5"
                )}
              >
                {/* Team Color Ambient Glow inside button */}
                <div 
                  className="absolute inset-0 opacity-20 transition-opacity"
                  style={{ background: `linear-gradient(to right, transparent, ${hex} 150%)` }}
                />
                
                <div className="relative z-10 flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full shadow-[0_0_8px_currentColor]" 
                    style={{ backgroundColor: hex, color: hex }}
                  />
                  <span className="font-semibold tracking-wide text-sm md:text-base">{team.name}</span>
                </div>

                {isSelected && (
                  <Check size={20} className="relative z-10 text-white drop-shadow-md" style={{ color: hex }} />
                )}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
