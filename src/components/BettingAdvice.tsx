import { memo, useMemo } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface OddsData {
  initial: { home: number; draw: number; away: number };
  current: { home: number; draw: number; away: number };
}

interface KellyOption {
  kelly: number;
  probability: number;
  supportRate: number;
  odds: number;
}

interface KellyValue {
  home: KellyOption;
  draw: KellyOption;
  away: KellyOption;
}

interface SupportRate {
  home: number;
  draw: number;
  away: number;
}

interface BettingAdviceProps {
  oddsData: OddsData;
  kellyData: KellyValue;
  supportData: SupportRate;
}

interface BettingRecommendation {
  outcome: 'home' | 'draw' | 'away';
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'avoid';
  confidence: number;
  reasons: string[];
}

const OUTCOME_NAMES = {
  home: '主胜',
  draw: '平局',
  away: '客胜',
};

const OUTCOME_COLORS = {
  home: 'text-accent-green',
  draw: 'text-accent-yellow',
  away: 'text-accent-blue',
};

const RECOMMENDATION_CONFIG = {
  strong_buy: {
    label: '强烈推荐',
    color: 'bg-accent-green/20 border-accent-green/50',
    textColor: 'text-accent-green',
    icon: CheckCircle,
  },
  buy: {
    label: '建议投注',
    color: 'bg-accent-green/10 border-accent-green/30',
    textColor: 'text-accent-green',
    icon: TrendingUp,
  },
  hold: {
    label: '谨慎观望',
    color: 'bg-accent-yellow/10 border-accent-yellow/30',
    textColor: 'text-accent-yellow',
    icon: AlertCircle,
  },
  avoid: {
    label: '不建议',
    color: 'bg-red-500/10 border-red-500/30',
    textColor: 'text-red-500',
    icon: TrendingDown,
  },
};

function calculateImpliedProbability(odds: number): number {
  return (1 / odds) * 100;
}

function getOddsChange(initial: number, current: number): { direction: 'up' | 'down' | 'stable'; percentage: number } {
  const change = ((current - initial) / initial) * 100;
  if (Math.abs(change) < 0.5) return { direction: 'stable', percentage: 0 };
  return {
    direction: change > 0 ? 'up' : 'down',
    percentage: Math.abs(change),
  };
}

function analyzeKelly(kelly: number): { level: string; value: number } {
  if (kelly >= 0.8) return { level: '极高价值', value: 95 };
  if (kelly >= 0.6) return { level: '高价值', value: 75 };
  if (kelly >= 0.4) return { level: '中等价值', value: 50 };
  if (kelly >= 0.2) return { level: '低价值', value: 25 };
  return { level: '无价值', value: 0 };
}

function analyzeSupportVsImplied(supportRate: number, odds: number): {
  verdict: 'overvalued' | 'undervalued' | 'fair';
  difference: number;
} {
  const impliedProb = calculateImpliedProbability(odds);
  const diff = supportRate - impliedProb;
  if (Math.abs(diff) < 5) return { verdict: 'fair', difference: diff };
  return {
    verdict: diff > 0 ? 'overvalued' : 'undervalued',
    difference: diff,
  };
}

export const BettingAdvice = memo(function BettingAdvice({
  oddsData,
  kellyData,
  supportData,
}: BettingAdviceProps) {
  const analysis = useMemo(() => {
    const outcomes: ('home' | 'draw' | 'away')[] = ['home', 'draw', 'away'];
    const recommendations: BettingRecommendation[] = [];

    const overallTips: string[] = [];
    let bestBet: BettingRecommendation | null = null;

    outcomes.forEach((outcome) => {
      const odds = oddsData.current[outcome];
      const kelly = kellyData[outcome].kelly;
      const supportRate = supportData[outcome];
      const impliedProb = calculateImpliedProbability(odds);

      const oddsChange = getOddsChange(oddsData.initial[outcome], oddsData.current[outcome]);
      const kellyAnalysis = analyzeKelly(kelly);
      const supportAnalysis = analyzeSupportVsImplied(supportRate, odds);

      let confidence = 0;
      const reasons: string[] = [];

      if (kellyAnalysis.value >= 75) {
        confidence += 40;
        reasons.push(`凯利值${kellyAnalysis.level} (+${kellyAnalysis.value}%)`);
      } else if (kellyAnalysis.value >= 50) {
        confidence += 20;
        reasons.push(`凯利值${kellyAnalysis.level} (+${kellyAnalysis.value}%)`);
      } else {
        reasons.push(`凯利值${kellyAnalysis.level} (+${kellyAnalysis.value}%)`);
      }

      if (oddsChange.direction === 'down') {
        confidence += 20;
        reasons.push(`赔率下降 ${oddsChange.percentage.toFixed(1)}%，庄家看好`);
      } else if (oddsChange.direction === 'up') {
        confidence -= 10;
        reasons.push(`赔率上升 ${oddsChange.percentage.toFixed(1)}%，庄家看低`);
      }

      if (supportAnalysis.verdict === 'undervalued') {
        confidence += 15;
        reasons.push(`支持率低于隐含概率 ${Math.abs(supportAnalysis.difference).toFixed(1)}%，价值被低估`);
      } else if (supportAnalysis.verdict === 'overvalued') {
        confidence -= 15;
        reasons.push(`支持率高于隐含概率 ${Math.abs(supportAnalysis.difference).toFixed(1)}%，可能被高估`);
      }

      const edge = (1 / odds) * 100 - supportRate;
      if (edge > 5) {
        confidence += 15;
        reasons.push(`存在${edge.toFixed(1)}%的价值空间`);
      }

      confidence = Math.max(0, Math.min(100, confidence));

      let recommendation: BettingRecommendation['recommendation'];
      if (confidence >= 65) {
        recommendation = 'strong_buy';
      } else if (confidence >= 40) {
        recommendation = 'buy';
      } else if (confidence >= 20) {
        recommendation = 'hold';
      } else {
        recommendation = 'avoid';
      }

      const rec: BettingRecommendation = {
        outcome,
        recommendation,
        confidence,
        reasons,
      };
      recommendations.push(rec);

      if (!bestBet || rec.confidence > bestBet.confidence) {
        bestBet = rec;
      }
    });

    const oddsMoveAnalysis = useMemo(() => {
      const changes = outcomes.map((o) => ({
        outcome: o,
        ...getOddsChange(oddsData.initial[o], oddsData.current[o]),
      }));

      const allDown = changes.every((c) => c.direction === 'down');
      const allUp = changes.every((c) => c.direction === 'up');

      if (allDown) {
        overallTips.push('所有赔率同时下降，通常表示庄家对比赛结果有信心');
      } else if (allUp) {
        overallTips.push('所有赔率同时上升，市场存在较大不确定性');
      } else {
        const biggestDrop = changes.reduce((max, c) =>
          c.direction === 'down' && c.percentage > max.percentage ? c : max,
          { outcome: '', direction: 'stable' as const, percentage: 0 }
        );
        if (biggestDrop.percentage > 1) {
          overallTips.push(`${OUTCOME_NAMES[biggestDrop.outcome as keyof typeof OUTCOME_NAMES]}赔率降幅最大，庄家明显看好`);
        }
      }
    }, []);

    const kellyComparison = useMemo(() => {
      const kellyValues = outcomes.map((o) => ({
        outcome: o,
        kelly: kellyData[o].kelly,
      }));
      const bestKelly = kellyValues.reduce((max, k) => (k.kelly > max.kelly ? k : max), kellyValues[0]);
      const worstKelly = kellyValues.reduce((min, k) => (k.kelly < min.kelly ? k : min), kellyValues[0]);

      if (bestKelly.kelly > 0.6 && bestKelly.kelly - worstKelly.kelly > 0.2) {
        overallTips.push(`${OUTCOME_NAMES[bestKelly.outcome]}凯利值最高(${bestKelly.kelly.toFixed(2)})，投资价值突出`);
      }
    }, []);

    const publicVsSharp = useMemo(() => {
      const discrepancies = outcomes.map((o) => {
        const impliedProb = calculateImpliedProbability(oddsData.current[o]);
        const diff = supportData[o] - impliedProb;
        return { outcome: o, diff };
      });

      const largestUndervalued = discrepancies.reduce((max, d) =>
        d.diff < max.diff ? d : max,
        discrepancies[0]
      );

      if (largestUndervalued.diff < -10) {
        overallTips.push(`公众对${OUTCOME_NAMES[largestUndervalued.outcome]}支持率明显偏低，可能存在价值`);
      }
    }, []);

    return { recommendations, bestBet, overallTips };
  }, [oddsData, kellyData, supportData]);

  const renderRecommendation = (rec: BettingRecommendation) => {
    const config = RECOMMENDATION_CONFIG[rec.recommendation];
    const IconComponent = config.icon;

    return (
      <div
        key={rec.outcome}
        className={`p-4 rounded-xl border ${config.color} transition-all`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <IconComponent className={`w-5 h-5 ${config.textColor}`} />
            <span className={`font-semibold ${OUTCOME_COLORS[rec.outcome]}`}>
              {OUTCOME_NAMES[rec.outcome]}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${config.textColor}`}>
              {config.label}
            </span>
            <div className="w-16 h-1.5 bg-bg-primary rounded-full overflow-hidden">
              <div
                className={`h-full ${config.textColor.replace('text-', 'bg-')}`}
                style={{ width: `${rec.confidence}%` }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          {rec.reasons.map((reason, idx) => (
            <div key={idx} className="text-xs text-text-secondary flex items-start gap-1.5">
              <span className="text-accent-green mt-0.5">•</span>
              <span>{reason}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-bg-tertiary/50 flex items-center justify-between text-xs">
          <span className="text-text-muted">当前赔率: {oddsData.current[rec.outcome].toFixed(2)}</span>
          <span className="text-text-muted">支持率: {supportData[rec.outcome].toFixed(1)}%</span>
          <span className="text-text-muted">凯利值: {kellyData[rec.outcome].kelly.toFixed(2)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {analysis.bestBet && (
        <div className="bg-gradient-to-r from-accent-green/20 to-accent-green/5 rounded-xl p-4 border border-accent-green/30">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-accent-green" />
            <span className="font-semibold text-accent-green">最佳投注选择</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-2xl font-bold ${OUTCOME_COLORS[analysis.bestBet.outcome]}`}>
              {OUTCOME_NAMES[analysis.bestBet.outcome]}
            </span>
            <div className="flex-1">
              <div className="text-sm text-text-secondary">
                信心指数: {analysis.bestBet.confidence}%
              </div>
              <div className="text-xs text-text-muted mt-0.5">
                赔率 {oddsData.current[analysis.bestBet.outcome].toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
          <Info className="w-4 h-4" />
          各选项分析
        </h3>
        <div className="space-y-3">
          {analysis.recommendations.map(renderRecommendation)}
        </div>
      </div>

      {analysis.overallTips.length > 0 && (
        <div className="bg-bg-tertiary/30 rounded-xl p-4 border border-bg-tertiary">
          <h3 className="text-sm font-medium text-text-secondary mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent-yellow" />
            综合分析
          </h3>
          <div className="space-y-2">
            {analysis.overallTips.map((tip, idx) => (
              <div key={idx} className="text-sm text-text-secondary flex items-start gap-2">
                <span className="text-accent-yellow mt-1">▸</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-bg-secondary/50 rounded-xl p-3 border border-bg-tertiary/50">
        <p className="text-xs text-text-muted text-center">
          ⚠️ 投注建议仅供参考，请理性投注，量力而行
        </p>
      </div>
    </div>
  );
});
