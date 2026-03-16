'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, LineChart, Settings, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/', icon: Home, label: 'Dashboard' },
    { href: '/standings', icon: Trophy, label: 'Standings' },
    { href: '/analysis', icon: LineChart, label: 'Analysis' },
    { href: '/settings', icon: Settings, label: 'Preferences' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed top-0 left-0 glass-panel border-r border-t-0 border-b-0 border-l-0 rounded-none z-50">
      <div className="p-8 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-accent/20 border border-accent/30 text-accent">
          <Flag size={24} />
        </div>
        <h1 className="text-xl font-bold tracking-tighter">F1 Tracker</h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative",
                isActive ? "text-white bg-accent/10" : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-r-full shadow-[0_0_12px_var(--color-accent)]" />
              )}
              <Icon size={20} className={cn(isActive && "text-accent")} />
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto">
        <div className="relative overflow-hidden rounded-2xl glass-panel p-4 text-sm text-white/80 border-white/5">
           <div className="absolute top-0 right-0 p-8 bg-accent/20 blur-2xl -mr-10 -mt-10 rounded-full" />
           <p className="relative z-10">
             <span className="block font-bold text-white mb-1">2026 Season</span>
             Live Realtime Updates
           </p>
        </div>
      </div>
    </aside>
  );
}
