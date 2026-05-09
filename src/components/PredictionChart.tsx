import { memo, useMemo } from 'react';
import { TrendingUp, AlertTriangle, Target, Zap, ArrowUp, ArrowDown, Minus, Activity, BarChart3, Users, TrendingDown } from 'lucide-react';
import type { PredictionResult as PredictionResultType, OddsData, KellyValue, SupportRate } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface PredictionChartProps {
  data: PredictionResultType;
  oddsData?: OddsData;
  kellyData?: KellyValue;
  supportData?: SupportRate;
}

function getInitialKelly(kelly: KellyValue): { home: number; draw: number; away: number } {
  if (kelly.initial) {
    return kelly.initial;
  }
  if (kelly.history && kelly.history.length > 0) {
    return {
      home: kelly.history[0].homeKelly,
      draw: kelly.history[0].drawKelly,
      away: kelly.history[0].awayKelly,
    };
  }
  return {
    home: kelly.home.kelly,
    draw: kelly.draw.kelly,
    away: kelly.away.kelly,
  };
}

function getInitialSupport(support: SupportRate): { home: number; draw: number; away: number } {
  if (support.initial) {
    return support.initial;
  }
  if (support.history && support.history.length > 0) {
    return {
      home: support.history[0].home,
      draw: support.history[0].draw,
      away: support.history[0].away,
    };
  }
  return {
    home: support.home,
    draw: support.draw,
    away: support.away,
  };
}

export const PredictionChart = memo(function PredictionChart({ data, oddsData, kellyData, supportData }: PredictionChartProps) {
  const integratedAnalysis = useMemo(() => {
    if (!oddsData || !kellyData || !supportData) return null;

    const initialKelly = getInitialKelly(kellyData);
    const initialSupport = getInitialSupport(supportData);

    const normalizeOdds = (o: number) => 1 / o;
    const currentProb = {
      home: normalizeOdds(oddsData.current.home),
      draw: normalizeOdds(oddsData.current.draw),
      away: normalizeOdds(oddsData.current.away),
    };
    const totalProb = currentProb.home + currentProb.draw + currentProb.away;
    const impliedProb = {
      home: (currentProb.home / totalProb) * 100,
      draw: (currentProb.draw / totalProb) * 100,
      away: (currentProb.away / totalProb) * 100,
    };

    const options = [
      { key: 'home' as const, label: '主胜', color: '#00ff88' },
      { key: 'draw' as const, label: '平局', color: '#ffd93d' },
      { key: 'away' as const, label: '客胜', color: '#ff4757' },
    ];

    return options.map(opt => {
      const oddsChange = ((oddsData.initial[opt.key] - oddsData.current[opt.key]) / oddsData.initial[opt.key]) * 100;
      const kellyChange = kellyData[opt.key].kelly - initialKelly[opt.key];
      const supportChange = supportData[opt.key] - initialSupport[opt.key];
      const currentKelly = kellyData[opt.key].kelly;
      const currentSupport = supportData[opt.key];
      const supportDeviation = currentSupport - impliedProb[opt.key];

      let bookmakerSignal: '利好' | '利空' | '中性' = '中性';
      let signalStrength = 0;
      let analysis: string[] = [];

      if (oddsChange > 3) {
        bookmakerSignal = '利好';
        signalStrength += 2;
        analysis.push(`赔率↓${oddsChange.toFixed(1)}%（庄家降赔付）`);
      } else if (oddsChange > 1) {
        bookmakerSignal = '利好';
        signalStrength += 1;
        analysis.push(`赔率↓${oddsChange.toFixed(1)}%`);
      } else if (oddsChange < -3) {
        bookmakerSignal = '利空';
        signalStrength -= 2;
        analysis.push(`赔率↑${Math.abs(oddsChange).toFixed(1)}%（诱多风险）`);
      } else if (oddsChange < -1) {
        bookmakerSignal = '利空';
        signalStrength -= 1;
        analysis.push(`赔率↑${Math.abs(oddsChange).toFixed(1)}%`);
      }

      if (currentKelly > 1.1) {
        bookmakerSignal = '利空';
        signalStrength -= 2;
        analysis.push(`凯利过热(${currentKelly.toFixed(3)}>1.1)`);
      } else if (currentKelly > 1) {
        bookmakerSignal = signalStrength > 0 ? '中性' : '利空';
        signalStrength -= 1;
        analysis.push(`凯利值偏高(${currentKelly.toFixed(3)})`);
      } else if (currentKelly < 0.8 && currentKelly > 0) {
        if (bookmakerSignal !== '利空') bookmakerSignal = '利好';
        signalStrength += 1;
        analysis.push(`凯利值健康(${currentKelly.toFixed(3)})`);
      }

      if (kellyChange > 0.03) {
        bookmakerSignal = '利空';
        signalStrength -= 1;
        analysis.push(`凯利值上升↑${kellyChange.toFixed(3)}`);
      } else if (kellyChange < -0.03) {
        if (bookmakerSignal !== '利空') bookmakerSignal = '利好';
        signalStrength += 1;
        analysis.push(`凯利值下降↓${Math.abs(kellyChange).toFixed(3)}`);
      }

      if (supportDeviation > 10) {
        bookmakerSignal = '利空';
        signalStrength -= 2;
        analysis.push(`资金过热(偏离${supportDeviation.toFixed(1)}%)`);
      } else if (supportDeviation > 5) {
        signalStrength -= 1;
        analysis.push(`支持率偏高(+${supportDeviation.toFixed(1)}%)`);
      } else if (supportDeviation < -10) {
        if (bookmakerSignal !== '利空') bookmakerSignal = '利好';
        signalStrength += 1;
        analysis.push(`资金偏冷(-${Math.abs(supportDeviation).toFixed(1)}%)`);
      }

      if (supportChange > 5) {
        bookmakerSignal = '利空';
        signalStrength -= 1;
        analysis.push(`支持率↑${supportChange.toFixed(1)}%`);
      } else if (supportChange < -5) {
        if (bookmakerSignal !== '利空') bookmakerSignal = '利好';
        signalStrength += 1;
        analysis.push(`支持率↓${Math.abs(supportChange).toFixed(1)}%`);
      }

      return {
        key: opt.key,
        label: opt.label,
        color: opt.color,
        oddsChange,
        kellyChange,
        supportChange,
        currentKelly,
        initialKelly: initialKelly[opt.key],
        currentSupport,
        initialSupport: initialSupport[opt.key],
        impliedProb: impliedProb[opt.key],
        supportDeviation,
        bookmakerSignal,
        signalStrength,
        analysis,
      };
    });
  }, [oddsData, kellyData, supportData]);

  const chartData = [
    { name: '主胜', value: data.homeProbability, color: '#00ff88' },
    { name: '平局', value: data.drawProbability, color: '#ffd93d' },
    { name: '客胜', value: data.awayProbability, color: '#ff4757' },
  ];

  const recommendedInfo = {
    home: { label: '主胜', color: '#00ff88', bgColor: 'bg-accent-green/20', borderColor: 'border-accent-green/30' },
    draw: { label: '平局', color: '#ffd93d', bgColor: 'bg-accent-yellow/20', borderColor: 'border-accent-yellow/30' },
    away: { label: '客胜', color: '#ff4757', bgColor: 'bg-accent-red/20', borderColor: 'border-accent-red/30' },
    none: { label: '待观察', color: '#6b7280', bgColor: 'bg-bg-tertiary', borderColor: 'border-bg-tertiary' },
  };

  const info = recommendedInfo[data.recommended];

  return (
    <div className="space-y-4">
      <div className={`rounded-xl p-4 border ${info.bgColor} ${info.borderColor}`}>
        <div className="flex items-center gap-2 mb-2">
          <Target className={`w-5 h-5`} style={{ color: info.color }} />
          <span className="text-sm text-text-secondary">综合推荐</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold" style={{ color: info.color }}>
            {info.label}
          </span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted">置信度</span>
              <div className="flex-1 h-2 bg-bg-primary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${data.confidence}%`, backgroundColor: info.color }}
                />
              </div>
              <span className="text-sm font-medium" style={{ color: info.color }}>
                {data.confidence.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-bg-secondary rounded-xl p-4 border border-bg-tertiary">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-accent-purple" />
          <span className="text-sm font-medium text-text-primary">庄家盈利综合分析</span>
          <span className="text-xs text-text-muted">（赔率+凯利+支持率融合）</span>
        </div>

        <div className="space-y-3">
          {integratedAnalysis?.map((item) => (
            <div
              key={item.key}
              className={`rounded-xl p-3 border ${
                item.bookmakerSignal === '利好'
                  ? 'bg-accent-green/10 border-accent-green/30'
                  : item.bookmakerSignal === '利空'
                  ? 'bg-accent-red/10 border-accent-red/30'
                  : 'bg-bg-tertiary/50 border-bg-tertiary'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-medium text-text-primary">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    item.bookmakerSignal === '利好'
                      ? 'bg-accent-green/20 text-accent-green'
                      : item.bookmakerSignal === '利空'
                      ? 'bg-accent-red/20 text-accent-red'
                      : 'bg-bg-primary text-text-muted'
                  }`}>
                    {item.bookmakerSignal}
                  </span>
                  <span className={`text-xs font-medium ${
                    item.signalStrength > 0 ? 'text-accent-green' : item.signalStrength < 0 ? 'text-accent-red' : 'text-text-muted'
                  }`}>
                    {item.signalStrength > 0 ? '+' : ''}{item.signalStrength}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-2">
                <div className="bg-bg-primary rounded-lg p-2">
                  <div className="flex items-center gap-1 mb-1">
                    <Activity className="w-3 h-3 text-accent-yellow" />
                    <span className="text-[10px] text-text-muted">赔率</span>
                  </div>
                  <div className="text-xs font-mono text-text-secondary">
                    {oddsData?.initial[item.key].toFixed(2)} → {oddsData?.current[item.key].toFixed(2)}
                  </div>
                  <div className={`text-xs ${item.oddsChange > 0 ? 'text-accent-green' : item.oddsChange < 0 ? 'text-accent-red' : 'text-text-muted'}`}>
                    {item.oddsChange > 0 ? '↓' : '↑'}{Math.abs(item.oddsChange).toFixed(1)}%
                  </div>
                </div>

                <div className="bg-bg-primary rounded-lg p-2">
                  <div className="flex items-center gap-1 mb-1">
                    <BarChart3 className="w-3 h-3 text-accent-purple" />
                    <span className="text-[10px] text-text-muted">凯利</span>
                  </div>
                  <div className="text-xs font-mono text-text-secondary">
                    {item.initialKelly.toFixed(3)} → {item.currentKelly.toFixed(3)}
                  </div>
                  <div className={`text-xs ${item.kellyChange > 0 ? 'text-accent-red' : item.kellyChange < 0 ? 'text-accent-green' : 'text-text-muted'}`}>
                    {item.kellyChange > 0 ? '↑' : '↓'}{Math.abs(item.kellyChange).toFixed(3)}
                  </div>
                </div>

                <div className="bg-bg-primary rounded-lg p-2">
                  <div className="flex items-center gap-1 mb-1">
                    <Users className="w-3 h-3 text-accent-green" />
                    <span className="text-[10px] text-text-muted">支持率</span>
                  </div>
                  <div className="text-xs font-mono text-text-secondary">
                    {item.initialSupport.toFixed(1)}% → {item.currentSupport.toFixed(1)}%
                  </div>
                  <div className={`text-xs ${item.supportChange > 0 ? 'text-accent-green' : item.supportChange < 0 ? 'text-accent-red' : 'text-text-muted'}`}>
                    {item.supportChange > 0 ? '↑' : '↓'}{Math.abs(item.supportChange).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="text-xs text-text-muted bg-bg-primary/50 rounded-lg p-2">
                <span className="text-accent-yellow">庄家视角：</span>
                {item.analysis.join(' | ') || '数据稳定，庄家无明显倾向'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-bg-secondary rounded-xl p-3 border border-bg-tertiary">
          <div className="text-xs text-text-muted text-center mb-1">主胜概率</div>
          <div className="text-lg font-bold text-center text-accent-green">{data.homeProbability.toFixed(1)}%</div>
        </div>
        <div className="bg-bg-secondary rounded-xl p-3 border border-bg-tertiary">
          <div className="text-xs text-text-muted text-center mb-1">平局概率</div>
          <div className="text-lg font-bold text-center text-accent-yellow">{data.drawProbability.toFixed(1)}%</div>
        </div>
        <div className="bg-bg-secondary rounded-xl p-3 border border-bg-tertiary">
          <div className="text-xs text-text-muted text-center mb-1">客胜概率</div>
          <div className="text-lg font-bold text-center text-accent-red">{data.awayProbability.toFixed(1)}%</div>
        </div>
      </div>

      <div className="bg-bg-secondary rounded-xl p-4 border border-bg-tertiary">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-accent-blue" />
          <span className="text-sm font-medium text-text-primary">综合分析</span>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">
          {data.analysis}
        </p>
      </div>

      {data.factors.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Activity className="w-4 h-4 text-accent-purple" />
            <span className="text-sm font-medium text-text-primary">关键信号</span>
            <span className="text-xs text-text-muted">（庄家行为分析）</span>
          </div>
          {data.factors.slice(0, 6).map((factor, index) => (
            <div
              key={index}
              className={`rounded-lg p-3 border ${
                factor.impact === 'positive'
                  ? 'bg-accent-green/10 border-accent-green/20'
                  : factor.impact === 'negative'
                  ? 'bg-accent-red/10 border-accent-red/20'
                  : 'bg-bg-tertiary/50 border-bg-tertiary'
              }`}
            >
              <div className="flex items-start gap-2">
                {factor.impact === 'positive' ? (
                  <ArrowUp className="w-4 h-4 text-accent-green mt-0.5 flex-shrink-0" />
                ) : factor.impact === 'negative' ? (
                  <ArrowDown className="w-4 h-4 text-accent-red mt-0.5 flex-shrink-0" />
                ) : (
                  <Minus className="w-4 h-4 text-text-muted mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-text-primary">
                      {factor.name}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      factor.impact === 'positive'
                        ? 'bg-accent-green/20 text-accent-green'
                        : factor.impact === 'negative'
                        ? 'bg-accent-red/20 text-accent-red'
                        : 'bg-bg-tertiary text-text-muted'
                    }`}>
                      {factor.impact === 'positive' ? '利好' : factor.impact === 'negative' ? '利空' : '中性'}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    {factor.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-bg-secondary rounded-xl p-4 border border-bg-tertiary">
        <div className="text-sm text-text-secondary mb-3">概率分布</div>
        <div className="flex items-center gap-4">
          <div className="w-28 h-28">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
                  contentStyle={{
                    backgroundColor: '#152238',
                    border: '1px solid #1e3054',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-text-secondary">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-text-primary">
                  {item.value.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-accent-yellow/10 rounded-xl p-3 border border-accent-yellow/20">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-accent-yellow mt-0.5 flex-shrink-0" />
          <div className="text-xs text-text-secondary leading-relaxed">
            <strong className="text-accent-yellow">庄家盈利逻辑：</strong>
            庄家通过调整赔率和凯利值来平衡投注，当某选项资金过热时会降赔以降低赔付风险。
            <br />
            <span className="text-accent-green">• 利好信号：</span>赔率↓ + 凯利值↓ + 支持率↓
            <br />
            <span className="text-accent-red">• 利空信号：</span>赔率↑ + 凯利值↑ + 支持率↑ + 凯利过热
            <br />
            仅供参考，请理性投注。
          </div>
        </div>
      </div>
    </div>
  );
});
