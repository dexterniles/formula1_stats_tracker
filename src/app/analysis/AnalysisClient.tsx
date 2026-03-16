'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { usePreferences } from '@/lib/store/PreferencesContext';

// Mock progression data based on the top 5 teams
const generateProgressionData = (teams: any[]) => {
  const races = ['BHR', 'SAU', 'AUS', 'JPN', 'CHN', 'MIA', 'EMI'];
  return races.map((race, idx) => {
    const dataPoint: any = { name: race };
    teams.forEach((team) => {
      // Create a cumulative mock point curve based on their actual current points
      const baseGrowth = (team.points / races.length) * (idx + 1);
      const variance = Math.floor(Math.random() * 10);
      dataPoint[team.constructors.name] = Math.max(0, Math.floor(baseGrowth + (idx > 0 ? variance : 0)));
    });
    return dataPoint;
  });
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-4 rounded-xl border border-white/10 shadow-xl">
        <p className="font-bold mb-2 uppercase tracking-wider text-xs text-white/60">{label} Grand Prix</p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-2 text-sm mb-1 font-mono">
            <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: entry.color, color: entry.color }} />
            <span className="text-white/80">{entry.name}:</span>
            <span className="font-bold text-white ml-auto pl-4">{entry.value} pts</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalysisClient({ topTeams }: { topTeams: any[] }) {
  const { favoriteTeam, setFavoriteTeam } = usePreferences();
  
  const chartData = useMemo(() => generateProgressionData(topTeams), [topTeams]);

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/10 h-[500px] flex flex-col relative overflow-hidden group">
        
        {/* Dynamic Glow based on favorite team for the chart background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-accent/5 blur-3xl rounded-full opacity-50 pointer-events-none" />

        <h2 className="text-xl font-bold mb-6 relative z-10">Top 5 Constructors Progression</h2>
        
        <div className="flex-1 relative z-10 w-full min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="rgba(255,255,255,0.3)" 
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} 
                tickMargin={10} 
                axisLine={false} 
              />
              <YAxis 
                stroke="rgba(255,255,255,0.3)" 
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'monospace' }} 
                axisLine={false} 
                tickLine={false} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', opacity: 0.8, fontSize: '12px' }} />
              
              {topTeams.map((team) => (
                <Line 
                  key={team.constructor_id} 
                  type="monotone" 
                  dataKey={team.constructors.name} 
                  stroke={team.constructors.color_hex} 
                  strokeWidth={favoriteTeam === team.constructor_id ? 4 : 2} 
                  dot={{ r: 4, fill: team.constructors.color_hex, strokeWidth: 0 }}
                  activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                  style={{
                    filter: favoriteTeam === team.constructor_id ? `drop-shadow(0 0 8px ${team.constructors.color_hex})` : 'none',
                    opacity: favoriteTeam === 'default' || favoriteTeam === team.constructor_id ? 1 : 0.4
                  }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
