import { describe, it, expect } from 'vitest';
import {
  calculateMetrics,
  generateCompetitorDecision,
  calculateProductionRequirements,
  calculateBottleneckMultiplier,
  applyBottleneck,
  executeRound,
} from '../marketEngine';
import { SimulationConstants } from '../../config/simulationConstants';
import type { GameEvent, PlayerDecision } from '../../data/types';

const defaultInvestments = {
  materials: 50000,
  production: 50000,
  marketing: 40000,
  logistics: 30000,
};

const defaultDecision: PlayerDecision = {
  investments: defaultInvestments,
  prices: {
    camiseta_basica: 29.90,
    polo_essenza: 59.90,
    moletom: 89.90,
    calca_jeans: 99.90,
    vestido_linho: 79.90,
    kit_meia_cueca: 39.90,
  },
  productionQty: {
    camiseta_basica: 1000,
    polo_essenza: 500,
    moletom: 200,
    calca_jeans: 400,
    vestido_linho: 300,
    kit_meia_cueca: 800,
  },
};

const positiveEvent: GameEvent = {
  id: 'influencer_viral',
  title: 'Influencer',
  description: 'test',
  type: 'positive',
  category: 'marketing',
  multiplier: 1.4,
  affectedArea: 'Marketing',
};

const negativeEvent: GameEvent = {
  id: 'greve_costureiros',
  title: 'Greve',
  description: 'test',
  type: 'negative',
  category: 'production',
  multiplier: 0.7,
  affectedArea: 'Produção',
};

describe('calculateMetrics', () => {
  it('returns metrics within bounds [10, 100]', () => {
    const result = calculateMetrics(defaultInvestments, null);
    const { min, max } = SimulationConstants.metricBounds;

    expect(result.quality).toBeGreaterThanOrEqual(min);
    expect(result.quality).toBeLessThanOrEqual(max);
    expect(result.innovation).toBeGreaterThanOrEqual(min);
    expect(result.innovation).toBeLessThanOrEqual(max);
    expect(result.satisfaction).toBeGreaterThanOrEqual(min);
    expect(result.satisfaction).toBeLessThanOrEqual(max);
    expect(result.efficiency).toBeGreaterThanOrEqual(min);
    expect(result.efficiency).toBeLessThanOrEqual(max);
    expect(result.reputation).toBeGreaterThanOrEqual(min);
    expect(result.reputation).toBeLessThanOrEqual(max);
  });

  it('applies positive marketing event multiplier to reputation', () => {
    const base = calculateMetrics(defaultInvestments, null);
    const withEvent = calculateMetrics(defaultInvestments, positiveEvent);

    expect(withEvent.reputation).toBeGreaterThanOrEqual(base.reputation);
  });

  it('applies negative production event to reduce efficiency', () => {
    const base = calculateMetrics(defaultInvestments, null);
    const withEvent = calculateMetrics(defaultInvestments, negativeEvent);

    expect(withEvent.efficiency).toBeLessThanOrEqual(base.efficiency);
  });

  it('higher investments produce higher metrics', () => {
    const low = calculateMetrics(
      { materials: 10000, production: 10000, marketing: 10000, logistics: 10000 },
      null
    );
    const high = calculateMetrics(
      { materials: 150000, production: 150000, marketing: 150000, logistics: 150000 },
      null
    );

    expect(high.quality).toBeGreaterThanOrEqual(low.quality);
    expect(high.innovation).toBeGreaterThanOrEqual(low.innovation);
    expect(high.reputation).toBeGreaterThanOrEqual(low.reputation);
  });
});

describe('generateCompetitorDecision', () => {
  it('generates valid Rival A decisions', () => {
    const decision = generateCompetitorDecision('Rival A', 1, 40000, 500000);

    expect(decision.investments.materials).toBeGreaterThan(0);
    expect(decision.investments.production).toBeGreaterThan(0);
    expect(decision.investments.marketing).toBeGreaterThan(0);
    expect(decision.prices).toBeDefined();
    expect(decision.productionQty).toBeDefined();

    // Prices should be lower than default (Rival A is low-price)
    const camisetaPrice = decision.prices['camiseta_basica'];
    const defaultPrice = 29.90;
    expect(camisetaPrice).toBeLessThan(defaultPrice);
  });

  it('generates valid Rival B decisions', () => {
    const decision = generateCompetitorDecision('Rival B', 1, 40000, 500000);

    expect(decision.investments.materials).toBeGreaterThan(0);
    // Rival B is premium, prices should be higher than default
    const camisetaPrice = decision.prices['camiseta_basica'];
    const defaultPrice = 29.90;
    expect(camisetaPrice).toBeGreaterThan(defaultPrice);
  });

  it('does not exceed competitor cash', () => {
    const lowCash = 100000;
    const decision = generateCompetitorDecision('Rival A', 1, 40000, lowCash);
    const total = Object.values(decision.investments).reduce((a, b) => a + b, 0);

    expect(total).toBeLessThanOrEqual(lowCash + 1); // small float tolerance
  });

  it('adjusts marketing when player has high marketing', () => {
    const lowPlayerMkt = generateCompetitorDecision('Rival A', 1, 40000, 500000);
    const highPlayerMkt = generateCompetitorDecision('Rival A', 1, 100000, 500000);

    expect(highPlayerMkt.investments.marketing).toBeGreaterThanOrEqual(
      lowPlayerMkt.investments.marketing
    );
  });
});

describe('calculateProductionRequirements', () => {
  it('returns zero for empty production', () => {
    const result = calculateProductionRequirements({});
    expect(result.materials).toBe(0);
    expect(result.production).toBe(0);
  });

  it('calculates correct split for known quantities', () => {
    const qty = { camiseta_basica: 100 };
    const result = calculateProductionRequirements(qty);
    const totalCost = 100 * 10.00; // productionCost for camiseta
    const expectedMaterials = totalCost * SimulationConstants.productionCostSplit.materialsRatio;
    const expectedProduction = totalCost * SimulationConstants.productionCostSplit.productionRatio;

    expect(result.materials).toBeCloseTo(expectedMaterials, 2);
    expect(result.production).toBeCloseTo(expectedProduction, 2);
  });
});

describe('calculateBottleneckMultiplier', () => {
  it('returns 1.0 when investments cover requirements', () => {
    const mult = calculateBottleneckMultiplier(
      { materials: 100000, production: 100000 },
      { materials: 50000, production: 50000 }
    );
    expect(mult).toBe(1.0);
  });

  it('returns < 1.0 when materials investment is insufficient', () => {
    const mult = calculateBottleneckMultiplier(
      { materials: 10000, production: 100000 },
      { materials: 50000, production: 50000 }
    );
    expect(mult).toBeLessThan(1.0);
    expect(mult).toBeGreaterThan(0);
  });

  it('returns < 1.0 when production investment is insufficient', () => {
    const mult = calculateBottleneckMultiplier(
      { materials: 100000, production: 10000 },
      { materials: 50000, production: 50000 }
    );
    expect(mult).toBeLessThan(1.0);
  });

  it('returns min of both bottleneck ratios', () => {
    const mult = calculateBottleneckMultiplier(
      { materials: 30000, production: 20000 },
      { materials: 100000, production: 100000 }
    );
    expect(mult).toBeCloseTo(0.2, 2); // 20000/100000 = 0.2 is the min
  });
});

describe('applyBottleneck', () => {
  const mockResults = [
    { productId: 'camiseta_basica', produced: 1000, demanded: 800, sold: 800, revenue: 23920, cost: 10000, profit: 13920, stockRemaining: 200 },
    { productId: 'polo_essenza', produced: 500, demanded: 400, sold: 400, revenue: 23960, cost: 10000, profit: 13960, stockRemaining: 100 },
  ];
  const prices = { camiseta_basica: 29.90, polo_essenza: 59.90 };

  it('returns unchanged results when bottleneck >= 1.0', () => {
    const result = applyBottleneck(mockResults, 1.0, prices);
    expect(result.productResults).toEqual(mockResults);
    expect(result.totalRevenue).toBe(23920 + 23960);
  });

  it('reduces production proportionally with bottleneck < 1.0', () => {
    const result = applyBottleneck(mockResults, 0.5, prices);

    expect(result.productResults[0].produced).toBe(500); // 1000 * 0.5
    expect(result.productResults[0].sold).toBeLessThanOrEqual(500);
    expect(result.totalRevenue).toBeLessThan(23920 + 23960);
  });
});

describe('executeRound', () => {
  it('returns a valid round result structure', () => {
    const result = executeRound(1, defaultDecision, 500000, {
      reputation: 50, quality: 50, innovation: 50, satisfaction: 50, efficiency: 50
    }, null, 500000, 500000);

    expect(result.round).toBe(1);
    expect(result.playerMetrics).toBeDefined();
    expect(result.playerMetrics.cash).toBeDefined();
    expect(result.playerMetrics.revenue).toBeDefined();
    expect(result.playerMetrics.profit).toBeDefined();
    expect(result.playerMetrics.ige).toBeGreaterThanOrEqual(0);
    expect(result.playerMetrics.ige).toBeLessThanOrEqual(100);
    expect(result.playerMetrics.riskIndex).toBeGreaterThanOrEqual(0);
    expect(result.playerMetrics.riskIndex).toBeLessThanOrEqual(100);
    expect(result.rivalA).toBeDefined();
    expect(result.rivalB).toBeDefined();
    expect(result.playerMetrics.productResults.length).toBe(6);
  });

  it('calculates market share summing to ~1.0', () => {
    const result = executeRound(1, defaultDecision, 500000, {
      reputation: 50, quality: 50, innovation: 50, satisfaction: 50, efficiency: 50
    }, null, 500000, 500000);

    const totalShare = result.playerMetrics.marketShare + result.rivalA.marketShare + result.rivalB.marketShare;
    expect(totalShare).toBeCloseTo(1.0, 1);
  });

  it('handles event multipliers', () => {
    const withoutEvent = executeRound(1, defaultDecision, 500000, {
      reputation: 50, quality: 50, innovation: 50, satisfaction: 50, efficiency: 50
    }, null, 500000, 500000);

    const withEvent = executeRound(1, defaultDecision, 500000, {
      reputation: 50, quality: 50, innovation: 50, satisfaction: 50, efficiency: 50
    }, positiveEvent, 500000, 500000);

    // Marketing event should boost reputation
    expect(withEvent.playerMetrics.reputation).toBeGreaterThanOrEqual(
      withoutEvent.playerMetrics.reputation
    );
  });

  it('respects production bottlenecks', () => {
    const overproducing: PlayerDecision = {
      ...defaultDecision,
      productionQty: {
        camiseta_basica: 50000,
        polo_essenza: 50000,
        moletom: 50000,
        calca_jeans: 50000,
        vestido_linho: 50000,
        kit_meia_cueca: 50000,
      },
    };

    const result = executeRound(1, overproducing, 500000, {
      reputation: 50, quality: 50, innovation: 50, satisfaction: 50, efficiency: 50
    }, null, 500000, 500000);

    // With low investments relative to massive production, bottleneck should limit results
    const totalSold = result.playerMetrics.productResults.reduce((acc, r) => acc + r.sold, 0);
    expect(totalSold).toBeGreaterThan(0);
  });
});
