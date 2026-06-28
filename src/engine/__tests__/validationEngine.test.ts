import { describe, it, expect } from 'vitest';
import {
  calculateProductionRequirements,
  checkBottlenecks,
  generateLiveSsisAdvice,
  calculateTotalInvestments,
  calculateRemainingCash,
  isDecisionValid,
} from '../validationEngine';
import type { PlayerDecision } from '../../data/types';

const defaultDecision: PlayerDecision = {
  investments: { materials: 50000, production: 50000, marketing: 40000, logistics: 30000 },
  prices: {
    camiseta_basica: 29.90, polo_essenza: 59.90, moletom: 89.90,
    calca_jeans: 99.90, vestido_linho: 79.90, kit_meia_cueca: 39.90,
  },
  productionQty: {
    camiseta_basica: 1000, polo_essenza: 500, moletom: 200,
    calca_jeans: 400, vestido_linho: 300, kit_meia_cueca: 800,
  },
};

describe('calculateProductionRequirements', () => {
  it('returns zero for empty production', () => {
    const result = calculateProductionRequirements({});
    expect(result.materials).toBe(0);
    expect(result.labor).toBe(0);
  });

  it('splits cost 50/50 between materials and labor', () => {
    const result = calculateProductionRequirements({ camiseta_basica: 100 });
    const totalCost = 100 * 10.00;
    expect(result.materials).toBeCloseTo(totalCost * 0.5, 2);
    expect(result.labor).toBeCloseTo(totalCost * 0.5, 2);
  });
});

describe('checkBottlenecks', () => {
  it('reports no bottleneck when investments cover requirements', () => {
    const result = checkBottlenecks(
      { materials: 100000, production: 100000 },
      { materials: 50000, labor: 50000 }
    );
    expect(result.hasBottleneck).toBe(false);
    expect(result.multiplier).toBe(1.0);
    expect(result.messages).toHaveLength(0);
  });

  it('reports material bottleneck', () => {
    const result = checkBottlenecks(
      { materials: 10000, production: 100000 },
      { materials: 50000, labor: 50000 }
    );
    expect(result.hasBottleneck).toBe(true);
    expect(result.multiplier).toBeLessThan(1.0);
    expect(result.messages.some(m => m.includes('Matéria-Prima'))).toBe(true);
  });

  it('reports labor bottleneck', () => {
    const result = checkBottlenecks(
      { materials: 100000, production: 10000 },
      { materials: 50000, labor: 50000 }
    );
    expect(result.hasBottleneck).toBe(true);
    expect(result.messages.some(m => m.includes('Mão de Obra'))).toBe(true);
  });
});

describe('generateLiveSsisAdvice', () => {
  it('returns danger when over budget', () => {
    const overBudgetDecision: PlayerDecision = {
      ...defaultDecision,
      investments: { materials: 200000, production: 200000, marketing: 200000, logistics: 200000 },
    };
    const result = generateLiveSsisAdvice(overBudgetDecision, 500000);
    expect(result.type).toBe('danger');
  });

  it('returns warning when bottleneck exists', () => {
    const bottleneckDecision: PlayerDecision = {
      ...defaultDecision,
      investments: { materials: 1000, production: 1000, marketing: 40000, logistics: 30000 },
    };
    const result = generateLiveSsisAdvice(bottleneckDecision, 500000);
    expect(result.type).toBe('warning');
  });

  it('returns info when marketing is low', () => {
    const lowMktDecision: PlayerDecision = {
      ...defaultDecision,
      investments: { materials: 50000, production: 50000, marketing: 10000, logistics: 30000 },
    };
    const result = generateLiveSsisAdvice(lowMktDecision, 500000);
    expect(result.type).toBe('info');
  });

  it('returns success for balanced decision', () => {
    const result = generateLiveSsisAdvice(defaultDecision, 500000);
    expect(result.type).toBe('success');
  });
});

describe('calculateTotalInvestments', () => {
  it('sums all investment areas', () => {
    const total = calculateTotalInvestments(defaultDecision);
    expect(total).toBe(50000 + 50000 + 40000 + 30000);
  });
});

describe('calculateRemainingCash', () => {
  it('subtracts investments from current cash', () => {
    const remaining = calculateRemainingCash(500000, defaultDecision);
    expect(remaining).toBe(500000 - 170000);
  });
});

describe('isDecisionValid', () => {
  it('returns true for valid decision within budget', () => {
    expect(isDecisionValid(defaultDecision, 500000)).toBe(true);
  });

  it('returns false when over budget', () => {
    const overBudget: PlayerDecision = {
      ...defaultDecision,
      investments: { materials: 200000, production: 200000, marketing: 200000, logistics: 200000 },
    };
    expect(isDecisionValid(overBudget, 500000)).toBe(false);
  });

  it('returns false when total investments is zero', () => {
    const zeroDecision: PlayerDecision = {
      ...defaultDecision,
      investments: { materials: 0, production: 0, marketing: 0, logistics: 0 },
    };
    expect(isDecisionValid(zeroDecision, 500000)).toBe(false);
  });
});
