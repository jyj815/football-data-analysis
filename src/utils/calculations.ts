import type { KellyOption, KellyValue, OddsData, SupportRate, OddsPoint, KellyPoint, SupportPoint } from '../types';

export function calculateKelly(odds: number, supportRate: number): number {
  if (odds <= 0 || supportRate < 0) return 0;
  const probability = (1 / odds) * 100;
  return (odds * supportRate) / probability;
}

export function calculateProbability(odds: number): number {
  if (odds <= 0) return 0;
  return (1 / odds) * 100;
}

export function calculateChangeRate(current: number, initial: number): number {
  if (initial <= 0) return 0;
  return ((current - initial) / initial) * 100;
}

export function calculateReturnRate(home: number, draw: number, away: number): number {
  if (home <= 0 || draw <= 0 || away <= 0) return 0;
  return 1 / (1/home + 1/draw + 1/away) * 100;
}

export function isValueBet(kellyIndex: number): boolean {
  return kellyIndex > 1;
}

export function generateKellyValue(odds: OddsData, support: SupportRate): KellyValue {
  const homeKelly = calculateKelly(odds.current.home, support.home);
  const drawKelly = calculateKelly(odds.current.draw, support.draw);
  const awayKelly = calculateKelly(odds.current.away, support.away);

  const homeProb = calculateProbability(odds.current.home);
  const drawProb = calculateProbability(odds.current.draw);
  const awayProb = calculateProbability(odds.current.away);

  return {
    matchId: odds.matchId,
    home: {
      kelly: homeKelly,
      probability: homeProb,
      supportRate: support.home,
      odds: odds.current.home,
    },
    draw: {
      kelly: drawKelly,
      probability: drawProb,
      supportRate: support.draw,
      odds: odds.current.draw,
    },
    away: {
      kelly: awayKelly,
      probability: awayProb,
      supportRate: support.away,
      odds: odds.current.away,
    },
    history: generateKellyHistory(odds.history, support.history),
  };
}

function generateKellyHistory(oddsHistory: OddsPoint[], supportHistory: SupportPoint[]): KellyPoint[] {
  const history: KellyPoint[] = [];
  const minLen = Math.min(oddsHistory.length, supportHistory.length);

  for (let i = 0; i < minLen; i++) {
    const odds = oddsHistory[i];
    const support = supportHistory[i];
    history.push({
      time: odds.time,
      homeKelly: calculateKelly(odds.home, support.home),
      drawKelly: calculateKelly(odds.draw, support.draw),
      awayKelly: calculateKelly(odds.away, support.away),
    });
  }

  return history;
}

export function formatOdds(value: number): string {
  return value.toFixed(2);
}

export function formatKelly(value: number): string {
  return value.toFixed(3);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatChangeRate(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}
