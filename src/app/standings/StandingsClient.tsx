'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Trophy, ChevronDown, ChevronUp } from 'lucide-react';

export default function StandingsClient({ driverStandings, constructorStandings }: { driverStandings: any[], constructorStandings: any[] }) {
  const [activeTab, setActiveTab] = useState<'drivers' | 'constructors'>('drivers');

  return (
    <div className="space-y-6">
      <div className="flex bg-white/5 p-1 rounded-2xl w-fit border border-white/10">
        <button
          onClick={() => setActiveTab('drivers')}
          className={cn(
            "px-6 py-2.5 rounded-xl font-semibold text-sm transition-all",
            activeTab === 'drivers' 
              ? "bg-white text-black shadow-lg" 
              : "text-white/60 hover:text-white"
          )}
        >
          Drivers
        </button>
        <button
          onClick={() => setActiveTab('constructors')}
          className={cn(
            "px-6 py-2.5 rounded-xl font-semibold text-sm transition-all",
            activeTab === 'constructors' 
              ? "bg-white text-black shadow-lg" 
              : "text-white/60 hover:text-white"
          )}
        >
          Constructors
        </button>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-white/50 text-xs uppercase tracking-widest">
                <th className="px-6 py-4 font-medium w-16 text-center">Pos</th>
                <th className="px-6 py-4 font-medium">{activeTab === 'drivers' ? 'Driver' : 'Constructor'}</th>
                {activeTab === 'drivers' && <th className="px-6 py-4 font-medium hidden sm:table-cell">Team</th>}
                <th className="px-6 py-4 font-medium text-center">Wins</th>
                <th className="px-6 py-4 font-medium text-right text-accent">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {activeTab === 'drivers' ? (
                driverStandings.map((ds, i) => (
                  <tr key={ds.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-5 text-center font-mono font-bold text-white/80">{ds.position}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-1 h-8 rounded-full shadow-sm"
                          style={{ backgroundColor: ds.drivers.constructors.color_hex }}
                        />
                        <div>
                          <p className="font-bold text-lg tracking-tight">
                            <span className="font-medium text-white/60 mr-1.5">{ds.drivers.first_name}</span>
                            {ds.drivers.last_name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 hidden sm:table-cell text-sm text-white/60">
                      {ds.drivers.constructors.name}
                    </td>
                    <td className="px-6 py-5 text-center font-mono text-white/40">{ds.wins}</td>
                    <td className="px-6 py-5 text-right font-mono font-bold text-xl">{ds.points}</td>
                  </tr>
                ))
              ) : (
                constructorStandings.map((cs) => (
                  <tr key={cs.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-5 text-center font-mono font-bold text-white/80">{cs.position}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-1 h-8 rounded-full shadow-sm"
                          style={{ backgroundColor: cs.constructors.color_hex }}
                        />
                        <span className="font-bold text-lg tracking-tight">{cs.constructors.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center font-mono text-white/40">{cs.wins}</td>
                    <td className="px-6 py-5 text-right font-mono font-bold text-xl">{cs.points}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
