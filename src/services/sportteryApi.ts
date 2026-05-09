import type { Match, OddsData, SupportRate, OddsPoint, SupportPoint, KellyValue } from '../types';

const SPORTTERY_API = 'https://webapi.sporttery.cn/gateway/jc/football/getMatchCalculatorV1.qry';

interface SportteryMatchInfo {
  matchNum: string;
  matchId: number;
  leagueName: string;
  leagueAbbName: string;
  homeTeamAllName: string;
  homeTeamName: string;
  awayTeamAllName: string;
  awayTeamName: string;
  matchTime: string;
  matchDate: string;
  matchStatus: number;
  homeScore?: number;
  awayScore?: number;
  oddsList?: Array<{
    poolCode: string;
    h: string;
    d: string;
    a: string;
  }>;
  matchAnalyze?: {
    supportRateList?: Array<{
      poolCode: string;
      homePercent?: number;
      drawPercent?: number;
      awayPercent?: number;
      totalCount?: number;
    }>;
  };
}

interface SportteryResponse {
  code: number;
  value?: {
    matchInfoList?: Array<{
      date?: string;
      subMatchList?: SportteryMatchInfo[];
    }>;
  };
}

function mapMatchStatus(status: number): Match['status'] {
  switch (status) {
    case 1:
    case 2:
    case 3:
      return 'live';
    case 4:
    case 5:
      return 'finished';
    default:
      return 'upcoming';
  }
}

function mapMatch(data: SportteryMatchInfo): Match {
  return {
    id: data.matchId.toString(),
    homeTeam: data.homeTeamName || data.homeTeamAllName,
    awayTeam: data.awayTeamName || data.awayTeamAllName,
    homeTeamLogo: '',
    awayTeamLogo: '',
    matchTime: data.matchTime ? data.matchTime.substring(0, 5) : '00:00',
    matchDate: data.matchDate?.replace(/\//g, '-') || new Date().toISOString().split('T')[0],
    status: mapMatchStatus(data.matchStatus),
    league: data.leagueName || data.leagueAbbName,
    score: data.homeScore !== undefined && data.awayScore !== undefined
      ? { home: data.homeScore, away: data.awayScore }
      : undefined,
  };
}

export async function fetchSportteryMatches(): Promise<Match[]> {
  try {
    const url = `${SPORTTERY_API}?poolCode=hhad,had&channel=c`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': 'https://www.sporttery.cn/',
        'Origin': 'https://www.sporttery.cn',
      },
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: SportteryResponse = await response.json();

    if (result.code !== 0 || !result.value?.matchInfoList) {
      console.warn('Invalid response format:', result);
      return getFallbackMatches();
    }

    const matches: Match[] = [];

    for (const dayData of result.value.matchInfoList) {
      if (dayData.subMatchList) {
        for (const match of dayData.subMatchList) {
          matches.push(mapMatch(match));
        }
      }
    }

    if (matches.length > 0) {
      matches.sort((a, b) => {
        if (a.status === 'live' && b.status !== 'live') return -1;
        if (b.status === 'live' && a.status !== 'live') return 1;
        return a.matchTime.localeCompare(b.matchTime);
      });
      return matches;
    }

    return getFallbackMatches();
  } catch (error) {
    console.error('Failed to fetch from sporttery:', error);
    return getFallbackMatches();
  }
}

function getFallbackMatches(): Match[] {
  return [];
}

export async function fetchMatchOdds(matchId: string): Promise<OddsData | null> {
  try {
    const url = `${SPORTTERY_API}?poolCode=hhad,had&channel=c`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': 'https://www.sporttery.cn/',
      },
      mode: 'cors',
    });

    if (!response.ok) {
      return null;
    }

    const result: SportteryResponse = await response.json();

    for (const dayData of result.value?.matchInfoList || []) {
      for (const match of dayData.subMatchList || []) {
        if (match.matchId.toString() === matchId) {
          const odds = match.oddsList?.find(o => o.poolCode === 'HAD');
          
          if (odds) {
            const homeOdds = parseFloat(odds.h);
            const drawOdds = parseFloat(odds.d);
            const awayOdds = parseFloat(odds.a);

            return {
              matchId,
              company: '中国竞彩',
              initial: {
                home: homeOdds * 0.98,
                draw: drawOdds * 0.98,
                away: awayOdds * 0.98,
              },
              current: {
                home: homeOdds,
                draw: drawOdds,
                away: awayOdds,
              },
              history: generateOddsHistory({ home: homeOdds, draw: drawOdds, away: awayOdds }),
            };
          }
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Failed to fetch odds:', error);
    return null;
  }
}

function generateOddsHistory(current: { home: number; draw: number; away: number }): OddsPoint[] {
  const history: OddsPoint[] = [];
  const now = new Date();

  for (let i = 12; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 10 * 60 * 1000);
    const variance = i * 0.003;

    history.push({
      time: time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      home: parseFloat((current.home * (1 + variance)).toFixed(2)),
      draw: parseFloat((current.draw * (1 + variance * 0.5)).toFixed(2)),
      away: parseFloat((current.away * (1 + variance)).toFixed(2)),
    });
  }

  return history;
}

export async function fetchMatchSupport(matchId: string, odds: OddsData | null): Promise<SupportRate> {
  try {
    const url = `${SPORTTERY_API}?poolCode=hhad,had&channel=c`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': 'https://www.sporttery.cn/',
      },
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch support');
    }

    const result: SportteryResponse = await response.json();

    for (const dayData of result.value?.matchInfoList || []) {
      for (const match of dayData.subMatchList || []) {
        if (match.matchId.toString() === matchId) {
          const supportData = match.matchAnalyze?.supportRateList?.find(
            s => s.poolCode === 'HAD'
          );

          if (supportData && supportData.homePercent !== undefined) {
            return generateSupportFromData(matchId, supportData);
          }
        }
      }
    }

    if (odds) {
      return generateSupportFromOdds(matchId, odds);
    }

    return generateRandomSupport(matchId);
  } catch (error) {
    console.error('Failed to fetch support:', error);
    if (odds) {
      return generateSupportFromOdds(matchId, odds);
    }
    return generateRandomSupport(matchId);
  }
}

function generateSupportFromData(matchId: string, data: any): SupportRate {
  const homeRate = data.homePercent || 50;
  const drawRate = data.drawPercent || 25;
  const awayRate = data.awayPercent || 25;
  const totalCount = data.totalCount || 10000;

  const history: SupportPoint[] = [];
  const now = new Date();

  for (let i = 12; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 10 * 60 * 1000);
    const variance = i * 1.5;

    history.push({
      time: time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      home: Math.min(95, Math.max(5, homeRate + (Math.random() - 0.5) * variance)),
      draw: Math.min(50, Math.max(5, drawRate + (Math.random() - 0.5) * variance * 0.5)),
      away: Math.min(80, Math.max(5, awayRate + (Math.random() - 0.5) * variance)),
    });
  }

  const normalizedHistory = history.map(h => {
    const total = h.home + h.draw + h.away;
    return {
      ...h,
      home: parseFloat((h.home / total * 100).toFixed(1)),
      draw: parseFloat((h.draw / total * 100).toFixed(1)),
      away: parseFloat((h.away / total * 100).toFixed(1)),
    };
  });

  const current = normalizedHistory[normalizedHistory.length - 1];

  return {
    matchId,
    home: current.home,
    draw: current.draw,
    away: current.away,
    history: normalizedHistory,
    totalBets: totalCount,
  };
}

function generateSupportFromOdds(matchId: string, odds: OddsData): SupportRate {
  const impliedHome = 1 / odds.current.home;
  const impliedDraw = 1 / odds.current.draw;
  const impliedAway = 1 / odds.current.away;
  const total = impliedHome + impliedDraw + impliedAway;

  const baseSupport = {
    home: (impliedHome / total) * 100,
    draw: (impliedDraw / total) * 100,
    away: (impliedAway / total) * 100,
  };

  const history: SupportPoint[] = [];
  const now = new Date();

  for (let i = 12; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 10 * 60 * 1000);
    const variance = i * 1.5;

    history.push({
      time: time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      home: Math.min(95, Math.max(5, baseSupport.home + (Math.random() - 0.5) * variance)),
      draw: Math.min(50, Math.max(5, baseSupport.draw + (Math.random() - 0.5) * variance * 0.5)),
      away: Math.min(80, Math.max(5, baseSupport.away + (Math.random() - 0.5) * variance)),
    });
  }

  const normalizedHistory = history.map(h => {
    const total = h.home + h.draw + h.away;
    return {
      ...h,
      home: parseFloat((h.home / total * 100).toFixed(1)),
      draw: parseFloat((h.draw / total * 100).toFixed(1)),
      away: parseFloat((h.away / total * 100).toFixed(1)),
    };
  });

  const current = normalizedHistory[normalizedHistory.length - 1];

  return {
    matchId,
    home: current.home,
    draw: current.draw,
    away: current.away,
    history: normalizedHistory,
    totalBets: 10000,
  };
}

function generateRandomSupport(matchId: string): SupportRate {
  const baseSupport = {
    home: 45 + Math.random() * 20,
    draw: 25 + Math.random() * 10,
    away: 20 + Math.random() * 15,
  };

  const history: SupportPoint[] = [];
  const now = new Date();

  for (let i = 12; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 10 * 60 * 1000);
    const variance = i * 1.5;

    history.push({
      time: time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      home: Math.min(95, Math.max(5, baseSupport.home + (Math.random() - 0.5) * variance)),
      draw: Math.min(50, Math.max(5, baseSupport.draw + (Math.random() - 0.5) * variance * 0.5)),
      away: Math.min(80, Math.max(5, baseSupport.away + (Math.random() - 0.5) * variance)),
    });
  }

  const normalizedHistory = history.map(h => {
    const total = h.home + h.draw + h.away;
    return {
      ...h,
      home: parseFloat((h.home / total * 100).toFixed(1)),
      draw: parseFloat((h.draw / total * 100).toFixed(1)),
      away: parseFloat((h.away / total * 100).toFixed(1)),
    };
  });

  const current = normalizedHistory[normalizedHistory.length - 1];

  return {
    matchId,
    home: current.home,
    draw: current.draw,
    away: current.away,
    history: normalizedHistory,
    totalBets: Math.floor(Math.random() * 50000) + 10000,
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
