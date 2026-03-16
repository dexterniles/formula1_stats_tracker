'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, LineChart, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePreferences } from '@/lib/store/PreferencesContext';

export function BottomNav() {
  const pathname = usePathname();
  const { favoriteTeam } = usePreferences();

  const links = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/standings', icon: Trophy, label: 'Standings' },
    { href: '/analysis', icon: LineChart, label: 'Analysis' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-b-0 border-l-0 border-r-0 rounded-t-2xl px-6 py-3 pb-safe">
      <ul className="flex items-center justify-between">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300",
                  isActive ? "text-accent scale-110" : "text-white/60 hover:text-white"
                )}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium tracking-wide">{link.label}</span>
                {isActive && (
                  <div className="absolute -top-3 w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)]" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
