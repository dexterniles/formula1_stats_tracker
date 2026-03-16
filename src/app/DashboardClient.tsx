'use client';

import { useEffect, useState } from 'react';
import { usePreferences } from '@/lib/store/PreferencesContext';
import { Trophy, Clock, Flag, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

interface Race {
  id: string;
  season: number;
  round: number;
  race_name: string;
  circuit_name: string;
  session_date: string;
}

interface Standing {
  id: string;
  constructor_id: string;
  points: number;
  position: number;
  wins: number;
  constructors: {
    name: string;
    color_hex: string;
  };
}

export default function DashboardClient({ nextRace, standings }: { nextRace: Race | null, standings: Standing[] }) {
  const { favoriteTeam } = usePreferences();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [mounted, setMounted] = useState(false);
  const [localTime, setLocalTime] = useState('');

  // Hydration fix & Initial Countdown setup
  useEffect(() => {
    setMounted(true);
    if (nextRace) {
      const raceDate = new Date(nextRace.session_date);
      setLocalTime(new Intl.DateTimeFormat('en-US', {
        weekday: 'short', month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit', timeZoneName: 'short'
      }).format(raceDate));
    }
  }, [nextRace]);

  // Live Countdown logic
  useEffect(() => {
    if (!nextRace) return;

    const interval = setInterval(() => {
      const end = new Date(nextRace.session_date).getTime();
      const now = new Date().getTime();
      const diff = end - now;

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          secs: Math.floor((diff % (1000 * 60)) / 1000),
        });
      } else {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextRace]);

  const teamData = standings.find(s => s.constructor_id === favoriteTeam) || standings[0];

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-[280px] w-full rounded-2xl" />
        <Skeleton className="h-[280px] w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* NEXT RACE CARD (Glassmorphism + Local Time Zone) */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-accent/20 transition-all duration-700" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-bold uppercase tracking-widest mb-6 border border-accent/20">
            <Clock size={12} /> Next Session
          </div>
          
          {nextRace ? (
            <>
              <h2 className="text-2xl md:text-3xl font-bold mb-1">{nextRace.race_name}</h2>
              <p className="flex items-center gap-2 text-white/60 mb-6 font-medium">
                <MapPin size={16} /> Round {nextRace.round} • {nextRace.circuit_name}
              </p>
              
              <div className="grid grid-cols-4 gap-2 md:gap-4 mb-6">
                {[
                  { label: 'Days', value: timeLeft.days },
                  { label: 'Hrs', value: timeLeft.hours.toString().padStart(2, '0') },
                  { label: 'Mins', value: timeLeft.mins.toString().padStart(2, '0') },
                  { label: 'Secs', value: timeLeft.secs.toString().padStart(2, '0') },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center justify-center bg-black/40 border border-white/10 rounded-xl py-3 px-1 backdrop-blur-md">
                    <span className="text-2xl md:text-3xl font-mono font-bold text-accent">{item.value}</span>
                    <span className="text-[10px] uppercase tracking-wider text-white/50">{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-sm">
                <span className="text-white/60">Local Time</span>
                <span className="font-semibold">{localTime}</span>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-12 text-center">
              <Flag className="w-12 h-12 text-white/20 mb-4" />
              <p className="text-white/60">No upcoming races found.</p>
            </div>
          )}
        </div>
      </div>

      {/* FAVORITE TEAM CARD */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group">
        {favoriteTeam !== 'default' ? (
          <div 
            className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full blur-3xl opacity-30 group-hover:opacity-40 transition-opacity duration-700"
            style={{ backgroundColor: teamData?.constructors.color_hex || 'var(--accent-primary)' }} 
          />
        ) : null}

        <div className="relative z-10 flex flex-col h-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-widest mb-6 w-fit border border-white/10">
            <Trophy size={12} /> Favorite Team
          </div>

          {teamData ? (
            <div className="flex-1 flex flex-col justify-center">
              <h3 className="text-3xl md:text-4xl font-black tracking-tight mb-2 uppercase break-words" style={{ color: teamData.constructors.color_hex }}>
                {teamData.constructors.name || 'Select a Team'}
              </h3>
              
              <div className="flex flex-wrap items-end gap-x-8 gap-y-4 mt-8">
                <div>
                  <p className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Position</p>
                  <p className="text-5xl font-mono font-bold">P{teamData.position || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Points</p>
                  <p className="text-4xl font-mono font-bold">{teamData.points || 0}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Wins</p>
                  <p className="text-4xl font-mono font-bold text-white/40">{teamData.wins || 0}</p>
                </div>
              </div>
            </div>
          ) : (
             <div className="h-full flex flex-col justify-center max-w-xs">
                <p className="text-white/60 mb-4">Go to preferences to setup a favored team for telemetry focus.</p>
             </div>
          )}
        </div>
      </div>

    </div>
  );
}
