import type { OddsData, SupportRate, KellyValue, PredictionResult, PredictionFactor } from '../types';

interface OddsAnalysis {
  home: {
    change: number;
    changePercent: number;
    direction: 'up' | 'down' | 'stable';
    strength: 'strong' | 'moderate' | 'weak';
  };
  draw: {
    change: number;
    changePercent: number;
    direction: 'up' | 'down' | 'stable';
    strength: 'strong' | 'moderate' | 'weak';
  };
  away: {
    change: number;
    changePercent: number;
    direction: 'up' | 'down' | 'stable';
    strength: 'strong' | 'moderate' | 'weak';
  };
}

function analyzeOddsChange(initial: number, current: number): OddsAnalysis['home'] {
  const change = initial - current;
  const changePercent = (change / initial) * 100;
  
  let direction: 'up' | 'down' | 'stable' = 'stable';
  if (changePercent > 1) direction = 'down';
  else if (changePercent < -1) direction = 'up';
  
  let strength: 'strong' | 'moderate' | 'weak' = 'weak';
  if (Math.abs(changePercent) > 3) strength = 'strong';
  else if (Math.abs(changePercent) > 1.5) strength = 'moderate';
  
  return { change, changePercent, direction, strength };
}

function normalizeOdds(odds: { home: number; draw: number; away: number }): { home: number; draw: number; away: number } {
  const homeProb = 1 / odds.home;
  const drawProb = 1 / odds.draw;
  const awayProb = 1 / odds.away;
  const total = homeProb + drawProb + awayProb;

  return {
    home: (homeProb / total) * 100,
    draw: (drawProb / total) * 100,
    away: (awayProb / total) * 100,
  };
}

function analyzeOddsMovement(odds: OddsData): OddsAnalysis {
  return {
    home: analyzeOddsChange(odds.initial.home, odds.current.home),
    draw: analyzeOddsChange(odds.initial.draw, odds.current.draw),
    away: analyzeOddsChange(odds.initial.away, odds.current.away),
  };
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

function calculateKellyTrend(kelly: KellyValue): { home: number; draw: number; away: number } {
  const initial = getInitialKelly(kelly);
  const current = {
    home: kelly.home.kelly,
    draw: kelly.draw.kelly,
    away: kelly.away.kelly,
  };

  return {
    home: current.home - initial.home,
    draw: current.draw - initial.draw,
    away: current.away - initial.away,
  };
}

function calculateSupportTrend(support: SupportRate): { home: number; draw: number; away: number } {
  const initial = getInitialSupport(support);
  const current = {
    home: support.home,
    draw: support.draw,
    away: support.away,
  };

  return {
    home: current.home - initial.home,
    draw: current.draw - initial.draw,
    away: current.away - initial.away,
  };
}

function calculateBookmakerProfitScore(
  oddsAnalysis: OddsAnalysis,
  odds: OddsData,
  impliedProb: { home: number; draw: number; away: number }
): { home: number; draw: number; away: number } {
  const scores = { home: 50, draw: 50, away: 50 };
  const options = ['home', 'draw', 'away'] as const;

  for (const option of options) {
    const analysis = oddsAnalysis[option];
    const currentOdds = odds.current[option];
    const prob = impliedProb[option];

    let score = 50;

    if (analysis.direction === 'down') {
      const decreaseAmount = Math.abs(analysis.changePercent);
      if (analysis.strength === 'strong') {
        score += 35;
      } else if (analysis.strength === 'moderate') {
        score += 20;
      } else {
        score += 10;
      }
      
      const bookmakerMargin = ((1 / currentOdds) / prob - 1) * 100;
      if (bookmakerMargin > 10) {
        score += 10;
      }
    } else if (analysis.direction === 'up') {
      if (analysis.strength === 'strong') {
        score -= 30;
      } else if (analysis.strength === 'moderate') {
        score -= 15;
      } else {
        score -= 5;
      }
    }

    const supportDeviation = prob - (100 / 3);
    if (supportDeviation > 5) {
      score -= 10;
    }

    scores[option] = Math.max(0, Math.min(100, score));
  }

  const total = scores.home + scores.draw + scores.away;
  if (total > 0) {
    return {
      home: (scores.home / total) * 100,
      draw: (scores.draw / total) * 100,
      away: (scores.away / total) * 100,
    };
  }

  return scores;
}

function calculateIntegratedScore(
  oddsAnalysis: OddsAnalysis,
  kellyTrend: { home: number; draw: number; away: number },
  supportTrend: { home: number; draw: number; away: number },
  kelly: KellyValue,
  odds: OddsData,
  impliedProb: { home: number; draw: number; away: number }
): { home: number; draw: number; away: number } {
  const scores = { home: 0, draw: 0, away: 0 };
  const options = ['home', 'draw', 'away'] as const;

  const weights = {
    oddsChange: 0.25,
    kellyIndex: 0.30,
    kellyChange: 0.15,
    supportChange: 0.15,
    bookmakerView: 0.15,
  };

  for (const option of options) {
    let score = 0;
    const analysis = oddsAnalysis[option];
    const currentKelly = kelly[option].kelly;
    const kellyTrendVal = kellyTrend[option];
    const supportTrendVal = supportTrend[option];

    if (analysis.direction === 'down') {
      const strength = analysis.strength === 'strong' ? 30 : analysis.strength === 'moderate' ? 20 : 10;
      score += strength * weights.oddsChange;
    } else if (analysis.direction === 'up') {
      const strength = analysis.strength === 'strong' ? -25 : analysis.strength === 'moderate' ? -15 : -5;
      score += strength * weights.oddsChange;
    }

    if (currentKelly > 1) {
      score -= Math.min(30, (currentKelly - 1) * 100) * weights.kellyIndex;
    } else if (currentKelly >= 0.85 && currentKelly < 1) {
      score += 15 * weights.kellyIndex;
    } else if (currentKelly >= 0.7 && currentKelly < 0.85) {
      score += 10 * weights.kellyIndex;
    } else if (currentKelly < 0.6) {
      score -= 10 * weights.kellyIndex;
    }

    if (kellyTrendVal > 0.02) {
      score -= kellyTrendVal * 200 * weights.kellyChange;
    } else if (kellyTrendVal < -0.02) {
      score += Math.abs(kellyTrendVal) * 150 * weights.kellyChange;
    }

    if (supportTrendVal > 3) {
      score -= supportTrendVal * 2 * weights.supportChange;
    } else if (supportTrendVal < -3) {
      score += Math.abs(supportTrendVal) * 1.5 * weights.supportChange;
    }

    const bookmakerScore = calculateBookmakerProfitScore(oddsAnalysis, odds, impliedProb);
    score += bookmakerScore[option] * weights.bookmakerView;

    scores[option] = 50 + score;
  }

  const total = scores.home + scores.draw + scores.away;
  if (total > 0) {
    return {
      home: (scores.home / total) * 100,
      draw: (scores.draw / total) * 100,
      away: (scores.away / total) * 100,
    };
  }

  return scores;
}

function generateIntegratedFactors(
  odds: OddsData,
  oddsAnalysis: OddsAnalysis,
  kelly: KellyValue,
  kellyTrend: { home: number; draw: number; away: number },
  support: SupportRate,
  supportTrend: { home: number; draw: number; away: number },
  impliedProb: { home: number; draw: number; away: number }
): PredictionFactor[] {
  const factors: PredictionFactor[] = [];
  const options = [
    { key: 'home', label: '主胜' },
    { key: 'draw', label: '平局' },
    { key: 'away', label: '客胜' },
  ] as const;

  for (const option of options) {
    const analysis = oddsAnalysis[option.key];
    const currentKelly = kelly[option.key].kelly;
    const initialKelly = getInitialKelly(kelly)[option.key];
    const kellyChange = kellyTrend[option.key];
    const currentSupport = support[option.key];
    const initialSupport = getInitialSupport(support)[option.key];
    const supportChange = supportTrend[option.key];
    const prob = impliedProb[option.key];
    const supportDeviation = currentSupport - prob;

    if (analysis.direction === 'down' && analysis.strength === 'strong') {
      factors.push({
        name: `${option.label}赔率大幅下降`,
        impact: 'positive',
        description: `赔率 ${odds.initial[option.key].toFixed(2)} → ${odds.current[option.key].toFixed(2)} (↓${Math.abs(analysis.changePercent).toFixed(1)}%)，庄家降低赔付风险`,
        weight: 0.20,
      });
    } else if (analysis.direction === 'down' && analysis.strength === 'moderate') {
      factors.push({
        name: `${option.label}赔率下降`,
        impact: 'positive',
        description: `赔率 ${odds.initial[option.key].toFixed(2)} → ${odds.current[option.key].toFixed(2)} (↓${Math.abs(analysis.changePercent).toFixed(1)}%)，庄家谨慎支持`,
        weight: 0.12,
      });
    } else if (analysis.direction === 'up' && analysis.strength === 'strong') {
      factors.push({
        name: `${option.label}赔率大幅上升`,
        impact: 'negative',
        description: `赔率 ${odds.initial[option.key].toFixed(2)} → ${odds.current[option.key].toFixed(2)} (↑${Math.abs(analysis.changePercent).toFixed(1)}%)，庄家不看好，存在诱空嫌疑`,
        weight: 0.20,
      });
    } else if (analysis.direction === 'up' && analysis.strength === 'moderate') {
      factors.push({
        name: `${option.label}赔率上升`,
        impact: 'negative',
        description: `赔率上升${Math.abs(analysis.changePercent).toFixed(1)}%，庄家对该结果信心下降`,
        weight: 0.12,
      });
    }

    if (currentKelly > 1.2) {
      factors.push({
        name: `${option.label}凯利值严重过热`,
        impact: 'negative',
        description: `凯利值 ${currentKelly.toFixed(3)} > 1.2，资金过热，庄家将大幅降赔赔付`,
        weight: 0.18,
      });
    } else if (currentKelly > 1 && currentKelly <= 1.2) {
      factors.push({
        name: `${option.label}凯利值过热`,
        impact: 'negative',
        description: `凯利值 ${currentKelly.toFixed(3)} > 1，庄家需降赔控制风险`,
        weight: 0.12,
      });
    } else if (currentKelly >= 0.85 && currentKelly <= 1) {
      factors.push({
        name: `${option.label}凯利值合理`,
        impact: 'positive',
        description: `凯利值 ${currentKelly.toFixed(3)} 处于合理区间，资金分布健康`,
        weight: 0.10,
      });
    } else if (currentKelly < 0.7) {
      factors.push({
        name: `${option.label}凯利值偏低`,
        impact: 'neutral',
        description: `凯利值 ${currentKelly.toFixed(3)} < 0.7，资金关注不足`,
        weight: 0.05,
      });
    }

    if (kellyChange > 0.05) {
      factors.push({
        name: `${option.label}凯利值快速上升`,
        impact: 'negative',
        description: `凯利值上升 ${kellyChange.toFixed(3)}，资金涌入，需防庄家降赔`,
        weight: 0.12,
      });
    } else if (kellyChange < -0.05) {
      factors.push({
        name: `${option.label}凯利值明显下降`,
        impact: 'positive',
        description: `凯利值下降 ${Math.abs(kellyChange).toFixed(3)}，资金撤离，庄家赔付压力减轻`,
        weight: 0.10,
      });
    }

    if (supportDeviation > 10) {
      factors.push({
        name: `${option.label}资金严重过热`,
        impact: 'negative',
        description: `支持率 ${currentSupport.toFixed(1)}% vs 概率 ${prob.toFixed(1)}%，偏离${supportDeviation.toFixed(1)}%，庄家大概率降赔`,
        weight: 0.15,
      });
    } else if (supportDeviation > 5) {
      factors.push({
        name: `${option.label}资金过热`,
        impact: 'negative',
        description: `支持率偏高，偏离概率${supportDeviation.toFixed(1)}%，存在风险`,
        weight: 0.08,
      });
    } else if (supportDeviation < -10) {
      factors.push({
        name: `${option.label}资金严重偏冷`,
        impact: 'positive',
        description: `支持率 ${currentSupport.toFixed(1)}% vs 概率 ${prob.toFixed(1)}%，偏离${Math.abs(supportDeviation).toFixed(1)}%，潜在价值高`,
        weight: 0.12,
      });
    } else if (supportDeviation < -5) {
      factors.push({
        name: `${option.label}资金偏冷`,
        impact: 'positive',
        description: `支持率偏低，存在一定潜在价值`,
        weight: 0.06,
      });
    }

    if (supportChange > 5) {
      factors.push({
        name: `${option.label}支持率快速上升`,
        impact: 'negative',
        description: `支持率上升 ${supportChange.toFixed(1)}%，资金流入增加庄家赔付压力`,
        weight: 0.10,
      });
    } else if (supportChange < -5) {
      factors.push({
        name: `${option.label}支持率明显下降`,
        impact: 'positive',
        description: `支持率下降 ${Math.abs(supportChange).toFixed(1)}%，资金撤离，庄家压力减轻`,
        weight: 0.08,
      });
    }
  }

  return factors;
}

export function generatePrediction(
  odds: OddsData,
  support: SupportRate,
  kelly: KellyValue
): PredictionResult {
  const impliedProb = normalizeOdds(odds.current);
  const oddsAnalysis = analyzeOddsMovement(odds);
  const kellyTrend = calculateKellyTrend(kelly);
  const supportTrend = calculateSupportTrend(support);

  const finalScores = calculateIntegratedScore(
    oddsAnalysis,
    kellyTrend,
    supportTrend,
    kelly,
    odds,
    impliedProb
  );

  const totalScore = finalScores.home + finalScores.draw + finalScores.away;
  const homeProbability = (finalScores.home / totalScore) * 100;
  const drawProbability = (finalScores.draw / totalScore) * 100;
  const awayProbability = (finalScores.away / totalScore) * 100;

  const allFactors: PredictionFactor[] = generateIntegratedFactors(
    odds,
    oddsAnalysis,
    kelly,
    kellyTrend,
    support,
    supportTrend,
    impliedProb
  );

  allFactors.sort((a, b) => b.weight - a.weight);

  let recommended: 'home' | 'draw' | 'away' | 'none' = 'none';
  let confidence = 0;
  const maxProb = Math.max(homeProbability, drawProbability, awayProbability);

  if (maxProb > 35) {
    if (maxProb === homeProbability) {
      recommended = 'home';
    } else if (maxProb === awayProbability) {
      recommended = 'away';
    } else {
      recommended = 'draw';
    }
    confidence = maxProb;
  }

  const positiveFactors = allFactors.filter(f => f.impact === 'positive');
  const negativeFactors = allFactors.filter(f => f.impact === 'negative');
  
  let analysis = '';
  
  const positiveWeight = positiveFactors.reduce((sum, f) => sum + f.weight, 0);
  const negativeWeight = negativeFactors.reduce((sum, f) => sum + f.weight, 0);

  if (recommended === 'home') {
    const homePositiveFactors = positiveFactors.filter(f => f.name.includes('主胜') || f.name.includes('凯利值合理') || f.name.includes('凯利值明显下降') || f.name.includes('资金偏冷'));
    const homeNegativeFactors = negativeFactors.filter(f => f.name.includes('主胜') || f.name.includes('凯利值过热') || f.name.includes('凯利值快速上升') || f.name.includes('资金过热'));

    if (homeNegativeFactors.length > homePositiveFactors.length) {
      analysis = '主胜概率较高，但存在资金过热风险，庄家可能降赔，需谨慎';
    } else if (homePositiveFactors.some(f => f.name.includes('赔率下降'))) {
      analysis = '主胜得到赔率下降等利好支撑，庄家降低赔付风险，数据较为支持';
    } else {
      analysis = '综合数据分析主胜概率最高，庄家倾向明确';
    }
  } else if (recommended === 'away') {
    const awayPositiveFactors = positiveFactors.filter(f => f.name.includes('客胜') || f.name.includes('资金偏冷'));
    const awayNegativeFactors = negativeFactors.filter(f => f.name.includes('客胜凯利值过热') || f.name.includes('客胜资金过热') || f.name.includes('客胜赔率大幅上升'));

    if (awayNegativeFactors.length > awayPositiveFactors.length) {
      analysis = '客胜概率较高，但需注意庄家可能的诱盘风险';
    } else {
      analysis = '客胜数据得到多项指标支撑，庄家赔付压力减轻，值得关注';
    }
  } else if (recommended === 'draw') {
    const drawOddsStable = oddsAnalysis.draw.strength === 'weak';
    if (drawOddsStable) {
      analysis = '平局概率较高，赔率结构稳定，庄家对双方实力评估接近，建议关注平局';
    } else {
      analysis = '平局概率较高，数据暗示双方实力接近';
    }
  } else {
    if (positiveWeight > negativeWeight * 1.2) {
      analysis = '利好因素明显占优，市场倾向明确';
    } else if (negativeWeight > positiveWeight * 1.2) {
      analysis = '利空因素较多，市场存在分歧，建议谨慎观望';
    } else {
      analysis = '各项指标分歧较大，庄家意图不明，建议观望';
    }
  }

  const hotOptions = negativeFactors.filter(f => f.name.includes('过热') || f.name.includes('快速上升'));
  if (hotOptions.length > 0) {
    analysis += ` 注意：${hotOptions[0].name}，庄家大概率降赔。`;
  }

  const coldOptions = positiveFactors.filter(f => f.name.includes('偏冷') || f.name.includes('凯利值合理'));
  if (coldOptions.length > 0 && hotOptions.length === 0) {
    analysis += ` ${coldOptions[0].name}，存在潜在投注价值。`;
  }

  return {
    matchId: odds.matchId,
    recommended,
    confidence,
    homeProbability,
    drawProbability,
    awayProbability,
    factors: allFactors,
    analysis,
  };
}

export { type OddsAnalysis };
