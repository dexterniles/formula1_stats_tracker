'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type TeamId = 'ferrari' | 'mclaren' | 'mercedes' | 'red_bull' | 'aston_martin' | 'audi' | 'williams' | 'haas' | 'cadillac' | 'default';

export const teamColors: Record<TeamId, string> = {
  ferrari: '#E8002D',
  mclaren: '#FF8000',
  mercedes: '#27F4D2',
  red_bull: '#3671C6',
  aston_martin: '#229971',
  audi: '#F50537',
  williams: '#1868DB',
  haas: '#DEE1E2',
  cadillac: '#AAAAAD',
  default: '#E8002D', // Default to red
};

interface PreferencesState {
  favoriteTeam: TeamId;
  setFavoriteTeam: (team: TeamId) => void;
}

const PreferencesContext = createContext<PreferencesState | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteTeam, setFavoriteTeamState] = useState<TeamId>('default');

  useEffect(() => {
    // Load from local storage
    const saved = localStorage.getItem('f1_favorite_team') as TeamId | null;
    if (saved && teamColors[saved]) {
      setFavoriteTeamState(saved);
      document.documentElement.style.setProperty('--accent-primary', teamColors[saved]);
    } else {
      document.documentElement.style.setProperty('--accent-primary', teamColors['default']);
    }
  }, []);

  const setFavoriteTeam = (team: TeamId) => {
    setFavoriteTeamState(team);
    localStorage.setItem('f1_favorite_team', team);
    // Instant CSS Variable application
    document.documentElement.style.setProperty('--accent-primary', teamColors[team]);
    
    // Dynamic Favicon logic via manipulating the DOM <link rel="icon">
    const currentFavicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (currentFavicon) {
       // Assuming we have `/teams/{team_id}.png` or svg icons
       currentFavicon.href = `/teams/${team}.svg`; 
    }
  };

  return (
    <PreferencesContext.Provider value={{ favoriteTeam, setFavoriteTeam }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
