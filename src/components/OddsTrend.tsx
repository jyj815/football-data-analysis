import { memo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { OddsData } from '../types';
import { formatOdds } from '../utils/calculations';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface OddsTrendProps {
  oddsData: OddsData;
}

export const OddsTrend = memo(function OddsTrend({ oddsData }: OddsTrendProps) {
  const chartData = oddsData.history.map((point) => ({
    time: point.time,
    home: parseFloat(point.home.toFixed(2)),
    draw: parseFloat(point.draw.toFixed(2)),
    away: parseFloat(point.away.toFixed(2)),
  }));

  const initial = oddsData.initial;
  const current = oddsData.current;

  const homeChange = current.home - initial.home;
  const drawChange = current.draw - initial.draw;
  const awayChange = current.away - initial.away;

  const homeChangePercent = initial.home > 0 ? ((current.home - initial.home) / initial.home) * 100 : 0;
  const drawChangePercent = initial.draw > 0 ? ((current.draw - initial.draw) / initial.draw) * 100 : 0;
  const awayChangePercent = initial.away > 0 ? ((current.away - initial.away) / initial.away) * 100 : 0;

  const renderOddsCard = (
    label: string,
    current: number,
    initial: number,
    change: number,
    changePercent: number,
    color: string,
    bgColor: string,
    borderColor: string
  ) => {
    const isPositive = change >= 0;

    return (
      <div className={`${bgColor} rounded-xl p-3 border ${borderColor}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-text-secondary">{label}</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">初赔</span>
            <span className="text-sm font-mono text-text-secondary">
              {formatOdds(initial)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">即赔</span>
            <span className={`text-lg font-bold font-mono ${color}`}>
              {formatOdds(current)}
            </span>
          </div>
          
          <div className="flex items-center gap-2 pt-1 border-t border-bg-tertiary">
            <span className={`flex items-center text-xs ${isPositive ? 'text-accent-green' : 'text-accent-red'}`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isPositive ? '+' : ''}{change.toFixed(2)}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${
              changePercent > 0 ? 'bg-accent-green/20 text-accent-green' :
              changePercent < 0 ? 'bg-accent-red/20 text-accent-red' :
              'bg-bg-tertiary text-text-muted'
            }`}>
              {changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-text-primary">赔率对比</h3>
        <span className="text-xs text-text-muted">{oddsData.company}</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {renderOddsCard('主胜', current.home, initial.home, homeChange, homeChangePercent, 'text-accent-green', 'bg-accent-green/10', 'border-accent-green/30')}
        {renderOddsCard('平局', current.draw, initial.draw, drawChange, drawChangePercent, 'text-accent-yellow', 'bg-accent-yellow/10', 'border-accent-yellow/30')}
        {renderOddsCard('客胜', current.away, initial.away, awayChange, awayChangePercent, 'text-accent-red', 'bg-accent-red/10', 'border-accent-red/30')}
      </div>

      <div className="bg-bg-secondary rounded-xl p-4 border border-bg-tertiary">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-text-secondary">赔率走势</h3>
          <div className="flex items-center gap-1 text-xs text-text-muted">
            <span>绿/↑=上升</span>
            <span className="mx-1">|</span>
            <span>红/↓=下降</span>
          </div>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="homeOddsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00ff88" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="drawOddsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffd93d" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ffd93d" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="awayOddsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff4757" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ff4757" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#5a6a8a', fontSize: 10 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#5a6a8a', fontSize: 10 }}
                tickFormatter={(v) => v.toFixed(1)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#152238',
                  border: '1px solid #1e3054',
                  borderRadius: '8px',
                  padding: '8px 12px',
                }}
                labelStyle={{ color: '#8b9dc3', fontSize: 12 }}
                itemStyle={{ fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="home"
                stroke="#00ff88"
                fill="url(#homeOddsGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="draw"
                stroke="#ffd93d"
                fill="url(#drawOddsGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="away"
                stroke="#ff4757"
                fill="url(#awayOddsGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-accent-green" />
            <span className="text-xs text-text-secondary">主胜</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-accent-yellow" />
            <span className="text-xs text-text-secondary">平局</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-accent-red" />
            <span className="text-xs text-text-secondary">客胜</span>
          </div>
        </div>
      </div>

      <div className="bg-bg-secondary rounded-xl p-4 border border-bg-tertiary">
        <h3 className="text-sm font-medium text-text-secondary mb-3">返还率</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary w-16">初盘返还率</span>
            <div className="flex-1 h-2 bg-bg-tertiary rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-yellow rounded-full transition-all duration-500"
                style={{ width: `${Math.min((1 / (1 / initial.home + 1 / initial.draw + 1 / initial.away)) * 100, 100)}%` }}
              />
            </div>
            <span className="text-xs font-mono text-text-primary w-12 text-right">
              {((1 / (1 / initial.home + 1 / initial.draw + 1 / initial.away)) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary w-16">即时返还率</span>
            <div className="flex-1 h-2 bg-bg-tertiary rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-green rounded-full transition-all duration-500"
                style={{ width: `${Math.min((1 / (1 / current.home + 1 / current.draw + 1 / current.away)) * 100, 100)}%` }}
              />
            </div>
            <span className="text-xs font-mono text-text-primary w-12 text-right">
              {((1 / (1 / current.home + 1 / current.draw + 1 / current.away)) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});
