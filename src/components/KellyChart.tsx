import { memo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { KellyValue } from '../types';
import { formatKelly } from '../utils/calculations';
import { TrendingUp, TrendingDown, AlertCircle, Edit2 } from 'lucide-react';

interface KellyChartProps {
  kellyData: KellyValue;
  onEditKelly?: () => void;
}

export const KellyChart = memo(function KellyChart({ kellyData, onEditKelly }: KellyChartProps) {
  const [showInitial, setShowInitial] = useState(true);

  const chartData = kellyData.history.map((point) => ({
    time: point.time,
    homeKelly: parseFloat(point.homeKelly.toFixed(3)),
    drawKelly: parseFloat(point.drawKelly.toFixed(3)),
    awayKelly: parseFloat(point.awayKelly.toFixed(3)),
  }));

  const currentKelly = kellyData.history[kellyData.history.length - 1];
  const firstKelly = kellyData.history[0];

  const homeChange = currentKelly?.homeKelly - firstKelly.homeKelly || 0;
  const drawChange = currentKelly?.drawKelly - firstKelly.drawKelly || 0;
  const awayChange = currentKelly?.awayKelly - firstKelly.awayKelly || 0;

  const initialKelly = kellyData.initial || {
    home: firstKelly.homeKelly,
    draw: firstKelly.drawKelly,
    away: firstKelly.awayKelly,
  };

  const renderKellyCard = (
    label: string,
    current: number,
    initial: number,
    change: number,
    color: string,
    bgColor: string,
    borderColor: string
  ) => {
    const changePercent = initial > 0 ? ((current - initial) / initial) * 100 : 0;
    const isPositive = change >= 0;
    const isOverheat = current > 1;

    return (
      <div className={`${bgColor} rounded-xl p-3 border ${borderColor}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-text-secondary">{label}</span>
          {isOverheat && <AlertCircle className="w-3.5 h-3.5 text-accent-red" />}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">初凯利</span>
            <span className="text-sm font-mono text-text-secondary">
              {formatKelly(initial)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">即凯利</span>
            <span className={`text-lg font-bold font-mono ${isOverheat ? 'text-accent-red' : color}`}>
              {formatKelly(current)}
            </span>
          </div>
          
          <div className="flex items-center gap-2 pt-1 border-t border-bg-tertiary">
            <span className={`flex items-center text-xs ${isPositive ? 'text-accent-green' : 'text-accent-red'}`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isPositive ? '+' : ''}{change.toFixed(3)}
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
        <h3 className="text-sm font-medium text-text-primary">凯利指数对比</h3>
        {onEditKelly && (
          <button
            onClick={onEditKelly}
            className="flex items-center gap-1 px-3 py-1.5 bg-accent-purple/20 text-accent-purple rounded-lg text-xs font-medium hover:bg-accent-purple/30 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            修改凯利
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {renderKellyCard('主胜', kellyData.home.kelly, initialKelly.home, homeChange, 'text-accent-green', 'bg-accent-green/10', 'border-accent-green/30')}
        {renderKellyCard('平局', kellyData.draw.kelly, initialKelly.draw, drawChange, 'text-accent-yellow', 'bg-accent-yellow/10', 'border-accent-yellow/30')}
        {renderKellyCard('客胜', kellyData.away.kelly, initialKelly.away, awayChange, 'text-accent-red', 'bg-accent-red/10', 'border-accent-red/30')}
      </div>

      <div className="bg-bg-secondary rounded-xl p-4 border border-bg-tertiary">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-text-secondary">凯利趋势</h3>
          <div className="flex items-center gap-1 text-xs text-text-muted">
            <span>红/↑=上升</span>
            <span className="mx-1">|</span>
            <span>绿/↓=下降</span>
          </div>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="homeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00ff88" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="drawGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffd93d" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ffd93d" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="awayGradient" x1="0" y1="0" x2="0" y2="1">
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
                domain={[0.5, 1.5]}
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
              <ReferenceLine
                y={1}
                stroke="#5a6a8a"
                strokeDasharray="3 3"
                label={{ value: '1.0', position: 'right', fill: '#5a6a8a', fontSize: 10 }}
              />
              <Area
                type="monotone"
                dataKey="homeKelly"
                stroke="#00ff88"
                fill="url(#homeGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="drawKelly"
                stroke="#ffd93d"
                fill="url(#drawGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="awayKelly"
                stroke="#ff4757"
                fill="url(#awayGradient)"
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
        <h3 className="text-sm font-medium text-text-secondary mb-3">理论概率</h3>
        <div className="space-y-2">
          {[
            { label: '主胜概率', value: kellyData.home.probability, color: 'accent-green' },
            { label: '平局概率', value: kellyData.draw.probability, color: 'accent-yellow' },
            { label: '客胜概率', value: kellyData.away.probability, color: 'accent-red' },
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
