import type { OddsData, SupportRate, OddsPoint, SupportPoint } from '../types';
import dayjs from 'dayjs';

function randomOdds(base: number, variance: number = 0.3): number {
  return parseFloat((base + (Math.random() - 0.5) * variance).toFixed(2));
}

export function generateMockOdds(matchId: string): OddsData {
  const history: OddsPoint[] = [];
  let home = randomOdds(1.8, 0.5);
  let draw = randomOdds(3.5, 0.3);
  let away = randomOdds(4.5, 0.5);

  for (let i = 12; i >= 0; i--) {
    const time = dayjs().subtract(i * 10, 'minute').format('HH:mm');
    history.push({
      time,
      home: parseFloat(home.toFixed(2)),
      draw: parseFloat(draw.toFixed(2)),
      away: parseFloat(away.toFixed(2)),
    });

    home += (Math.random() - 0.5) * 0.1;
    draw += (Math.random() - 0.5) * 0.1;
    away += (Math.random() - 0.5) * 0.1;
    home = Math.max(1.1, Math.min(4.0, home));
    draw = Math.max(2.5, Math.min(5.0, draw));
    away = Math.max(1.5, Math.min(8.0, away));
  }

  const initial = history[0];
  const current = history[history.length - 1];

  return {
    matchId,
    company: 'Bet365',
    initial: { home: initial.home, draw: initial.draw, away: initial.away },
    current: { home: current.home, draw: current.draw, away: current.away },
    history,
  };
}

export function generateMockSupport(matchId: string): SupportRate {
  const history: SupportPoint[] = [];
  let home = randomOdds(50, 20);
  let draw = randomOdds(30, 10);
  let away = randomOdds(20, 10);

  for (let i = 12; i >= 0; i--) {
    const time = dayjs().subtract(i * 10, 'minute').format('HH:mm');
    const total = home + draw + away;
    history.push({
      time,
      home: parseFloat((home / total * 100).toFixed(1)),
      draw: parseFloat((draw / total * 100).toFixed(1)),
      away: parseFloat((away / total * 100).toFixed(1)),
    });

    home += (Math.random() - 0.5) * 5;
    draw += (Math.random() - 0.5) * 3;
    away += (Math.random() - 0.5) * 3;
    home = Math.max(15, Math.min(80, home));
    draw = Math.max(10, Math.min(50, draw));
    away = Math.max(10, Math.min(50, away));
  }

  const current = history[history.length - 1];

  return {
    matchId,
    home: current.home,
    draw: current.draw,
    away: current.away,
    history,
    totalBets: Math.floor(Math.random() * 50000) + 10000,
  };
}

export function calculateKelly(odds: number, supportRate: number): number {
  if (odds <= 0 || supportRate < 0) return 0;
  const probability = (1 / odds) * 100;
  return (odds * supportRate) / probability;
}

export function calculateProbability(odds: number): number {
  if (odds <= 0) return 0;
  return (1 / odds) * 100;
}

interface KellyPoint {
  time: string;
  homeKelly: number;
  drawKelly: number;
  awayKelly: number;
}

interface KellyOption {
  kelly: number;
  probability: number;
  supportRate: number;
  odds: number;
}

interface KellyValue {
  matchId: string;
  home: KellyOption;
  draw: KellyOption;
  away: KellyOption;
  history: KellyPoint[];
}

export function generateKellyValue(odds: OddsData, support: SupportRate): KellyValue {
  const homeKelly = calculateKelly(odds.current.home, support.home);
  const drawKelly = calculateKelly(odds.current.draw, support.draw);
  const awayKelly = calculateKelly(odds.current.away, support.away);

  const homeProb = calculateProbability(odds.current.home);
  const drawProb = calculateProbability(odds.current.draw);
  const awayProb = calculateProbability(odds.current.away);

  const history: KellyPoint[] = [];
  const minLen = Math.min(odds.history.length, support.history.length);

  for (let i = 0; i < minLen; i++) {
    const oddsPoint = odds.history[i];
    const supportPoint = support.history[i];
    history.push({
      time: oddsPoint.time,
      homeKelly: calculateKelly(oddsPoint.home, supportPoint.home),
      drawKelly: calculateKelly(oddsPoint.draw, supportPoint.draw),
      awayKelly: calculateKelly(oddsPoint.away, supportPoint.away),
    });
  }

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
    history,
  };
}
