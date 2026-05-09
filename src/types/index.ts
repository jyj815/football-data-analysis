export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo: string;
  awayTeamLogo: string;
  matchTime: string;
  matchDate: string;
  status: 'upcoming' | 'live' | 'finished';
  league: string;
  score?: { home: number; away: number };
}

export interface OddsPoint {
  time: string;
  home: number;
  draw: number;
  away: number;
}

export interface OddsData {
  matchId: string;
  company: string;
  initial: { home: number; draw: number; away: number };
  current: { home: number; draw: number; away: number };
  history: OddsPoint[];
}

export interface SupportPoint {
  time: string;
  home: number;
  draw: number;
  away: number;
}

export interface SupportRate {
  matchId: string;
  home: number;
  draw: number;
  away: number;
  history: SupportPoint[];
  totalBets: number;
  initial?: {
    home: number;
    draw: number;
    away: number;
  };
}

export interface KellyPoint {
  time: string;
  homeKelly: number;
  drawKelly: number;
  awayKelly: number;
}

export interface KellyOption {
  kelly: number;
  probability: number;
  supportRate: number;
  odds: number;
}

export interface KellyValue {
  matchId: string;
  home: KellyOption;
  draw: KellyOption;
  away: KellyOption;
  history: KellyPoint[];
  initial?: {
    home: number;
    draw: number;
    away: number;
  };
  manualKelly?: {
    home: number;
    draw: number;
    away: number;
  };
}

export interface PredictionResult {
  matchId: string;
  recommended: 'home' | 'draw' | 'away' | 'none';
  confidence: number;
  homeProbability: number;
  drawProbability: number;
  awayProbability: number;
  factors: PredictionFactor[];
  analysis: string;
}

export interface PredictionFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
  weight: number;
}

export type TabType = 'kelly' | 'odds' | 'support' | 'prediction';
