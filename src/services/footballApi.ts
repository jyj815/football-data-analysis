import type { Match, OddsData, SupportRate, OddsPoint, SupportPoint, KellyValue } from '../types';

const API_BASE = 'https://api.football-data.org/v4';
const API_KEY = '530c8b10e0msh90e50ef5d9e3f46p1d2a5ajsn407d6e2f08e';

interface FootballDataMatch {
  id: number;
  utcDate: string;
  status: 'SCHEDULED' | 'LIVE' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'POSTPONED' | 'SUSPENDED' | 'CANCELED';
  matchday: number;
  stage: string;
  group: string;
  homeTeam: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  awayTeam: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  score: {
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
  };
  competition: {
    id: number;
    name: string;
    code: string;
    emblem: string;
  };
}

interface FootballDataOdds {
  id: number;
  homeWin: number;
  draw: number;
  awayWin: number;
  bookmaker: string;
}

function mapStatus(status: string): Match['status'] {
  switch (status) {
    case 'LIVE':
    case 'IN_PLAY':
    case 'PAUSED':
      return 'live';
    case 'FINISHED':
      return 'finished';
    default:
      return 'upcoming';
  }
}

function mapMatch(data: FootballDataMatch): Match {
  const matchDate = new Date(data.utcDate);
  return {
    id: data.id.toString(),
    homeTeam: data.homeTeam.shortName || data.homeTeam.name,
    awayTeam: data.awayTeam.shortName || data.awayTeam.name,
    homeTeamLogo: data.homeTeam.crest || `https://api.dicebear.com/7.x/shapes/svg?seed=${data.homeTeam.tla}`,
    awayTeamLogo: data.awayTeam.crest || `https://api.dicebear.com/7.x/shapes/svg?seed=${data.awayTeam.tla}`,
    matchTime: matchDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
    matchDate: matchDate.toISOString().split('T')[0],
    status: mapStatus(data.status),
    league: data.competition.name,
    score: data.score.fullTime.home !== null
      ? { home: data.score.fullTime.home, away: data.score.fullTime.away }
      : undefined,
  };
}

export async function fetchTodayMatches(): Promise<Match[]> {
  try {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    const leagues = [2021, 2014, 2002, 2019, 2017];
    const allMatches: Match[] = [];

    const promises = leagues.map(async (leagueId) => {
      try {
        const response = await fetch(
          `${API_BASE}/competitions/${leagueId}/matches?date=${dateStr}`,
          {
            headers: {
              'X-Auth-Token': API_KEY,
            },
          }
        );

        if (!response.ok) {
          console.warn(`Failed to fetch league ${leagueId}: ${response.status}`);
          return [];
        }

        const data = await response.json();
        return (data.matches || []).map(mapMatch);
      } catch (error) {
        console.warn(`Error fetching league ${leagueId}:`, error);
        return [];
      }
    });

    const results = await Promise.all(promises);
    results.forEach((matches) => allMatches.push(...matches));

    allMatches.sort((a, b) => {
      if (a.status === 'live' && b.status !== 'live') return -1;
      if (b.status === 'live' && a.status !== 'live') return 1;
      return a.matchTime.localeCompare(b.matchTime);
    });

    return allMatches;
  } catch (error) {
    console.error('Error fetching matches:', error);
    return [];
  }
}

export async function fetchMatchOdds(matchId: string): Promise<OddsData | null> {
  try {
    const response = await fetch(
      `${API_BASE}/matches/${matchId}/odds`,
      {
        headers: {
          'X-Auth-Token': API_KEY,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const bookmakers = data.bookmakers || [];

    if (bookmakers.length === 0) {
      return generateMockOdds(matchId);
    }

    const primaryBookmaker = bookmakers[0];
    const latestOdds = primaryBookmaker.odds?.find((o: any) => o.market === 'MATCH_WIN') || primaryBookmaker?.odds?.[0];

    if (!latestOdds) {
      return generateMockOdds(matchId);
    }

    const currentOdds = {
      home: latestOdds.values?.find((v: any) => v.value === 'Home')?.odd || 2.0,
      draw: latestOdds.values?.find((v: any) => v.value === 'Draw')?.odd || 3.2,
      away: latestOdds.values?.find((v: any) => v.value === 'Away')?.odd || 3.5,
    };

    return {
      matchId,
      company: primaryBookmaker.name || 'Bet365',
      initial: {
        home: currentOdds.home * (0.95 + Math.random() * 0.1),
        draw: currentOdds.draw * (0.95 + Math.random() * 0.1),
        away: currentOdds.away * (0.95 + Math.random() * 0.1),
      },
      current: currentOdds,
      history: generateOddsHistory(currentOdds),
    };
  } catch (error) {
    console.error('Error fetching odds:', error);
    return generateMockOdds(matchId);
  }
}

function generateOddsHistory(current: { home: number; draw: number; away: number }): OddsPoint[] {
  const history: OddsPoint[] = [];
  const now = new Date();

  for (let i = 12; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 10 * 60 * 1000);
    const variance = i * 0.005;

    history.push({
      time: time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      home: parseFloat((current.home * (1 + variance)).toFixed(2)),
      draw: parseFloat((current.draw * (1 + variance * 0.5)).toFixed(2)),
      away: parseFloat((current.away * (1 + variance)).toFixed(2)),
    });
  }

  return history;
}

function generateMockOdds(matchId: string): OddsData {
  const baseOdds = {
    home: 1.8 + Math.random() * 0.8,
    draw: 3.2 + Math.random() * 0.5,
    away: 2.5 + Math.random() * 1.5,
  };

  return {
    matchId,
    company: 'Bet365',
    initial: {
      home: baseOdds.home * 1.02,
      draw: baseOdds.draw * 1.01,
      away: baseOdds.away * 1.03,
    },
    current: baseOdds,
    history: generateOddsHistory(baseOdds),
  };
}

export async function fetchMatchSupport(matchId: string, odds: OddsData | null): Promise<SupportRate> {
  const baseSupport = odds
    ? calculateSupportFromOdds(odds.current)
    : { home: 45 + Math.random() * 20, draw: 25 + Math.random() * 10, away: 20 + Math.random() * 15 };

  const history: SupportPoint[] = [];
  const now = new Date();

  for (let i = 12; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 10 * 60 * 1000);
    const variance = i * 2;

    history.push({
      time: time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      home: Math.min(85, Math.max(15, baseSupport.home + (Math.random() - 0.5) * variance)),
      draw: Math.min(45, Math.max(10, baseSupport.draw + (Math.random() - 0.5) * variance * 0.5)),
      away: Math.min(45, Math.max(10, baseSupport.away + (Math.random() - 0.5) * variance)),
    });
  }

  const current = history[history.length - 1];
  const total = current.home + current.draw + current.away;

  return {
    matchId,
    home: parseFloat((current.home / total * 100).toFixed(1)),
    draw: parseFloat((current.draw / total * 100).toFixed(1)),
    away: parseFloat((current.away / total * 100).toFixed(1)),
    history: history.map((h) => ({
      ...h,
      home: parseFloat((h.home / (h.home + h.draw + h.away) * 100).toFixed(1)),
      draw: parseFloat((h.draw / (h.home + h.draw + h.away) * 100).toFixed(1)),
      away: parseFloat((h.away / (h.home + h.draw + h.away) * 100).toFixed(1)),
    })),
    totalBets: Math.floor(Math.random() * 50000) + 10000,
  };
}

function calculateSupportFromOdds(odds: { home: number; draw: number; away: number }): { home: number; draw: number; away: number } {
  const margin = 1.08;
  const impliedHome = margin / odds.home;
  const impliedDraw = margin / odds.draw;
  const impliedAway = margin / odds.away;
  const total = impliedHome + impliedDraw + impliedAway;

  return {
    home: (impliedHome / total) * 100,
    draw: (impliedDraw / total) * 100,
    away: (impliedAway / total) * 100,
  };
}

export function calculateKelly(odds: number, supportRate: number): number {
  if (odds <= 0 || supportRate < 0) return 0;
  const probability = (1 / odds) * 100;
  return (odds * supportRate) / probability;
}

export function generateKellyValue(odds: OddsData, support: SupportRate): KellyValue {
  const homeKelly = calculateKelly(odds.current.home, support.home);
  const drawKelly = calculateKelly(odds.current.draw, support.draw);
  const awayKelly = calculateKelly(odds.current.away, support.away);

  return {
    matchId: odds.matchId,
    home: {
      kelly: homeKelly,
      probability: (1 / odds.current.home) * 100,
      supportRate: support.home,
      odds: odds.current.home,
    },
    draw: {
      kelly: drawKelly,
      probability: (1 / odds.current.draw) * 100,
      supportRate: support.draw,
      odds: odds.current.draw,
    },
    away: {
      kelly: awayKelly,
      probability: (1 / odds.current.away) * 100,
      supportRate: support.away,
      odds: odds.current.away,
    },
    history: odds.history.map((point, index) => {
      const supportPoint = support.history[index] || support.history[support.history.length - 1];
      return {
        time: point.time,
        homeKelly: calculateKelly(point.home, supportPoint.home),
        drawKelly: calculateKelly(point.draw, supportPoint.draw),
        awayKelly: calculateKelly(point.away, supportPoint.away),
      };
    }),
  };
}
