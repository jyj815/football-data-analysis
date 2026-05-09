import { memo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { SupportRate } from '../types';
import { Users } from 'lucide-react';

interface SupportRateChartProps {
  supportData: SupportRate;
}

export const SupportRateChart = memo(function SupportRateChart({ supportData }: SupportRateChartProps) {
  const chartData = supportData.history.map((point) => ({
    time: point.time,
    home: parseFloat(point.home.toFixed(1)),
    draw: parseFloat(point.draw.toFixed(1)),
    away: parseFloat(point.away.toFixed(1)),
  }));

  const firstSupport = supportData.initial || supportData.history[0];
  const lastSupport = supportData.history[supportData.history.length - 1];

  const homeChange = lastSupport.home - firstSupport.home;
  const drawChange = lastSupport.draw - firstSupport.draw;
  const awayChange = lastSupport.away - firstSupport.away;

  const renderSupportCard = (
    label: string,
    current: number,
    initial: number,
    change: number,
    color: string,
    bgColor: string,
    borderColor: string
  ) => {
    const changePercent = initial > 0 ? (change / initial) * 100 : 0;
    const isPositive = change >= 0;

    return (
      <div className={`${bgColor} rounded-xl p-3 border ${borderColor}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-text-secondary">{label}</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">初支持率</span>
            <span className="text-sm font-mono text-text-secondary">
              {initial.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">即支持率</span>
            <span className={`text-lg font-bold font-mono ${color}`}>
              {current.toFixed(1)}%
            </span>
          </div>
          
          <div className="flex items-center gap-2 pt-1 border-t border-bg-tertiary">
            <span className={`flex items-center text-xs ${isPositive ? 'text-accent-green' : 'text-accent-red'}`}>
              {isPositive ? '↑' : '↓'}
              {isPositive ? '+' : ''}{change.toFixed(1)}%
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
        <h3 className="text-sm font-medium text-text-primary">支持率对比</h3>
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <Users className="w-3.5 h-3.5" />
          <span>{supportData.totalBets.toLocaleString()} 注</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {renderSupportCard('主胜', lastSupport.home, firstSupport.home, homeChange, 'text-accent-green', 'bg-accent-green/10', 'border-accent-green/30')}
        {renderSupportCard('平局', lastSupport.draw, firstSupport.draw, drawChange, 'text-accent-yellow', 'bg-accent-yellow/10', 'border-accent-yellow/30')}
        {renderSupportCard('客胜', lastSupport.away, firstSupport.away, awayChange, 'text-accent-red', 'bg-accent-red/10', 'border-accent-red/30')}
      </div>

      <div className="bg-bg-secondary rounded-xl p-4 border border-bg-tertiary">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-text-secondary">支持率趋势</h3>
          <div className="flex items-center gap-1 text-xs text-text-muted">
            <span>注：初始→最新</span>
          </div>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="homeSupportGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00ff88" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="drawSupportGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffd93d" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ffd93d" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="awaySupportGradient" x1="0" y1="0" x2="0" y2="1">
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
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#5a6a8a', fontSize: 10 }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#152238',
                  border: '1px solid #1e3054',
                  borderRadius: '8px',
                  padding: '8px 12px',
                }}
                labelStyle={{ color: '#8b9dc3', fontSize: 12 }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
              />
              <Area
                type="monotone"
                dataKey="home"
                stroke="#00ff88"
                fill="url(#homeSupportGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="draw"
                stroke="#ffd93d"
                fill="url(#drawSupportGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="away"
                stroke="#ff4757"
                fill="url(#awaySupportGradient)"
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
        <h3 className="text-sm font-medium text-text-secondary mb-3">投注热度</h3>
        <div className="space-y-2">
          {[
            { label: '主胜热度', value: lastSupport.home, color: 'accent-green' },
            { label: '平局热度', value: lastSupport.draw, color: 'accent-yellow' },
            { label: '客胜热度', value: lastSupport.away, color: 'accent-red' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-xs text-text-secondary w-16">{label}</span>
              <div className="flex-1 h-2 bg-bg-tertiary rounded-full overflow-hidden">
                <div
                  className={`h-full bg-${color} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(value, 100)}%` }}
                />
              </div>
              <span className="text-xs font-mono text-text-primary w-12 text-right">
                {value.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
