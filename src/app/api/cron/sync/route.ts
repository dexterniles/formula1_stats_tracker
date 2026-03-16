import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const runtime = 'edge';
export const revalidate = 3600;

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const seasonYear = 2026; // Hardcoded tracking for 2026 season
    const syncResults: any = { racesSynced: 0, driversSynced: 0, constructorsSynced: 0, weatherSynced: 0, raceControlSynced: 0, sessionResultsSynced: 0 };

    // --- 1. Fetch Racing Sessions ---
    // Taking the master race sessions only
    const sessionsRes = await fetch(`https://api.openf1.org/v1/sessions?year=${seasonYear}&session_name=Race`);
    if (sessionsRes.ok) {
      const sessions = await sessionsRes.json();
      
      const racesToUpsert = sessions.map((s: any, index: number) => ({
        id: `${s.year}-${s.country_code.toLowerCase()}`,
        season: s.year,
        round: index + 1, // Fallback round mapping since API doesn't guarantee round numbers
        race_name: `${s.country_name} Grand Prix`,
        circuit_name: s.circuit_short_name,
        session_date: s.date_start,
      }));

      const { data: racesData, error: racesError } = await supabase.from('races').upsert(racesToUpsert, { onConflict: 'id' }).select();
      if (!racesError) syncResults.racesSynced = racesData?.length || racesToUpsert.length;

      // To get the latest standings, we need the most recent session's `session_key`
      const latestSession = sessions[sessions.length - 1];

      if (latestSession && latestSession.session_key) {
        const sessionKey = latestSession.session_key;

        // --- 2. Fetch Driver Standings (beta) ---
        const driversRes = await fetch(`https://api.openf1.org/v1/championship_drivers?session_key=${sessionKey}`);
        if (driversRes.ok) {
           const championshipDrivers = await driversRes.json();
           
           // We map the numbers to Supabase UUID manually
           const { data: dbDrivers } = await supabase.from('drivers').select('id, number');
           const driverMap = new Map((dbDrivers || []).map(d => [d.number, d.id]));

           const driverStandings = championshipDrivers
            .filter((d: any) => driverMap.has(d.driver_number))
            .map((d: any) => ({
              driver_id: driverMap.get(d.driver_number),
              points: d.points_current,
              position: d.position_current,
              wins: 0, // Not provided directly in basic payload
              season: seasonYear
            }));

           // Clear current season to prevent duplicate UUIDs piling up, then insert
           await supabase.from('driver_standings').delete().eq('season', seasonYear);
           const { data: dsData, error: dsError } = await supabase.from('driver_standings').insert(driverStandings).select();
           if (!dsError) syncResults.driversSynced = dsData?.length || driverStandings.length;
        }

        // --- 3. Fetch Constructor Standings (beta) ---
        const constructorsRes = await fetch(`https://api.openf1.org/v1/championship_teams?session_key=${sessionKey}`);
        if (constructorsRes.ok) {
           const championshipTeams = await constructorsRes.json();
           
           const { data: dbConstructors } = await supabase.from('constructors').select('id, name');
           const teamMap = new Map((dbConstructors || []).map(c => [c.name.toLowerCase(), c.id]));

           const teamStandings = championshipTeams.map((t: any) => {
             // Fuzzy matching: e.g. "Red Bull Racing Honda" vs "Red Bull Racing"
             let matchedId = teamMap.get(t.team_name.toLowerCase());
             if (!matchedId) {
                const fuzzyObj = dbConstructors?.find(c => c.name.toLowerCase().includes(t.team_name.toLowerCase()) || t.team_name.toLowerCase().includes(c.name.toLowerCase()));
                if (fuzzyObj) matchedId = fuzzyObj.id;
             }

             if (matchedId) {
               return {
                 constructor_id: matchedId,
                 points: t.points_current,
                 position: t.position_current,
                 wins: 0,
                 season: seasonYear
               };
             }
             return null;
           }).filter((t: any) => t !== null);

           // Replace existing year stats and insert updated array
           await supabase.from('constructor_standings').delete().eq('season', seasonYear);
           const { data: csData, error: csError } = await supabase.from('constructor_standings').insert(teamStandings).select();
           if (!csError) syncResults.constructorsSynced = csData?.length || teamStandings.length;
        }

        // --- 4. Fetch Weather Events ---
        const weatherRes = await fetch(`https://api.openf1.org/v1/weather?session_key=${sessionKey}`);
        if (weatherRes.ok) {
           const weatherEvents = await weatherRes.json();
           const weatherData = weatherEvents.map((w: any) => ({
             session_key: sessionKey,
             meeting_key: latestSession.meeting_key,
             recorded_at: w.date,
             air_temperature: w.air_temperature,
             track_temperature: w.track_temperature,
             humidity: w.humidity,
             rainfall: w.rainfall,
             wind_speed: w.wind_speed,
             wind_direction: w.wind_direction
           }));
           
           if (weatherData.length > 0) {
              const { data: wData, error: wError } = await supabase.from('weather_events').upsert(weatherData, { onConflict: 'session_key, recorded_at' }).select();
              if (!wError) syncResults.weatherSynced = wData?.length || weatherData.length;
           }
        }

        // --- 5. Fetch Race Control Messages ---
        const controlRes = await fetch(`https://api.openf1.org/v1/race_control?session_key=${sessionKey}`);
        if (controlRes.ok) {
           const controlEvents = await controlRes.json();
           const controlData = controlEvents.map((c: any) => ({
             session_key: sessionKey,
             meeting_key: latestSession.meeting_key,
             timestamp: c.date,
             category: c.category,
             message: c.message,
             flag: c.flag,
             driver_number: c.driver_number,
             scope: c.scope,
             sector: c.sector
           }));
           
           if (controlData.length > 0) {
              const { data: cData, error: cError } = await supabase.from('race_control').upsert(controlData, { onConflict: 'session_key, timestamp, message' }).select();
              if (!cError) syncResults.raceControlSynced = cData?.length || controlData.length;
           }
        }

        // --- 6. Fetch Session Results ---
        const resultsRes = await fetch(`https://api.openf1.org/v1/session_result?session_key=${sessionKey}`);
        if (resultsRes.ok) {
           const sessionResults = await resultsRes.json();
           const resultsData = sessionResults.filter((r: any) => r.driver_number).map((r: any) => ({
             session_key: sessionKey,
             meeting_key: latestSession.meeting_key,
             driver_number: r.driver_number,
             position: r.position,
             grid_position: r.starting_grid_position,
             status: r.status,
             points: r.points,
             time_penalty: r.time_penalty,
             fastest_lap: r.fastest_lap || false
           }));

           if (resultsData.length > 0) {
              const { data: rData, error: rError } = await supabase.from('session_results').upsert(resultsData, { onConflict: 'session_key, driver_number' }).select();
              if (!rError) syncResults.sessionResultsSynced = rData?.length || resultsData.length;
           }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'F1 Sync Cron executed completely. External OpenF1 endpoints integrated.', 
      syncResults 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
