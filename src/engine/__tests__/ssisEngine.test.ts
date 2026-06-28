import { describe, it, expect } from 'vitest';
import {
  generateSsisFeedback,
  generateCouncilFeedback,
  generateRoundNewspaper,
  classifyManagementProfile,
} from '../ssisEngine';
import type { RoundResult, PlayerDecision, GameEvent } from '../../data/types';

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

const defaultMetrics: RoundResult['playerMetrics'] = {
  cash: 500000,
  revenue: 200000,
  costs: 170000,
  profit: 30000,
  reputation: 60,
  quality: 65,
  innovation: 55,
  satisfaction: 70,
  efficiency: 60,
  marketShare: 0.33,
  ige: 65,
  riskIndex: 25,
  productResults: [
    { productId: 'camiseta_basica', produced: 1000, demanded: 800, sold: 800, revenue: 23920, cost: 10000, profit: 13920, stockRemaining: 200 },
    { productId: 'polo_essenza', produced: 500, demanded: 400, sold: 400, revenue: 23960, cost: 10000, profit: 13960, stockRemaining: 100 },
    { productId: 'moletom', produced: 200, demanded: 150, sold: 150, revenue: 13485, cost: 6400, profit: 7085, stockRemaining: 50 },
    { productId: 'calca_jeans', produced: 400, demanded: 350, sold: 350, revenue: 34965, cost: 15200, profit: 19765, stockRemaining: 50 },
    { productId: 'vestido_linho', produced: 300, demanded: 200, sold: 200, revenue: 15980, cost: 8400, profit: 7580, stockRemaining: 100 },
    { productId: 'kit_meia_cueca', produced: 800, demanded: 700, sold: 700, revenue: 27930, cost: 9600, profit: 18330, stockRemaining: 100 },
  ],
};

const mockRivalA: RoundResult['rivalA'] = {
  name: 'Rival A', cash: 480000, investments: { materials: 120000, production: 140000, marketing: 50000, logistics: 40000 },
  prices: {}, productionQty: {}, sales: {}, revenue: 180000, costs: 350000, profit: -10000, marketShare: 0.30,
  efficiency: 55, quality: 50, innovation: 45, reputation: 48, satisfaction: 52,
};

const mockRivalB: RoundResult['rivalB'] = {
  name: 'Rival B', cash: 520000, investments: { materials: 80000, production: 70000, marketing: 130000, logistics: 90000 },
  prices: {}, productionQty: {}, sales: {}, revenue: 220000, costs: 370000, profit: 20000, marketShare: 0.37,
  efficiency: 65, quality: 70, innovation: 68, reputation: 72, satisfaction: 60,
};

const event: GameEvent = {
  id: 'influencer_viral', title: 'Influencer', description: 'test',
  type: 'positive', category: 'marketing', multiplier: 1.4, affectedArea: 'Marketing',
};

describe('generateSsisFeedback', () => {
  it('returns all required fields', () => {
    const result = generateSsisFeedback(1, defaultDecision, defaultMetrics, event, mockRivalA, mockRivalB);

    expect(result.diagnostic).toBeTruthy();
    expect(result.recommendation).toBeTruthy();
    expect(result.forecast).toBeTruthy();
    expect(result.pedagogicalGrade).toBeDefined();
    expect(result.pedagogicalGrade.planning).toBeGreaterThanOrEqual(0);
    expect(result.pedagogicalGrade.planning).toBeLessThanOrEqual(10);
    expect(result.pedagogicalGrade.finance).toBeGreaterThanOrEqual(0);
    expect(result.pedagogicalGrade.finance).toBeLessThanOrEqual(10);
    expect(result.pedagogicalGrade.people).toBeGreaterThanOrEqual(0);
    expect(result.pedagogicalGrade.people).toBeLessThanOrEqual(10);
    expect(result.pedagogicalGrade.innovation).toBeGreaterThanOrEqual(0);
    expect(result.pedagogicalGrade.innovation).toBeLessThanOrEqual(10);
  });

  it('gives excellent diagnostic for high profit', () => {
    const highProfitMetrics = { ...defaultMetrics, profit: 150000 };
    const result = generateSsisFeedback(1, defaultDecision, highProfitMetrics, event, mockRivalA, mockRivalB);

    expect(result.diagnostic).toContain('excelente');
  });

  it('gives negative diagnostic for loss', () => {
    const lossMetrics = { ...defaultMetrics, profit: -50000, cash: 450000 };
    const result = generateSsisFeedback(1, defaultDecision, lossMetrics, event, mockRivalA, mockRivalB);

    expect(result.diagnostic.toLowerCase()).toContain('prejuízo');
  });

  it('gives different forecasts per round', () => {
    const r1 = generateSsisFeedback(1, defaultDecision, defaultMetrics, event, mockRivalA, mockRivalB);
    const r2 = generateSsisFeedback(2, defaultDecision, defaultMetrics, event, mockRivalA, mockRivalB);
    const r3 = generateSsisFeedback(3, defaultDecision, defaultMetrics, event, mockRivalA, mockRivalB);

    expect(r1.forecast).not.toBe(r2.forecast);
    expect(r2.forecast).not.toBe(r3.forecast);
  });

  it('recommends lower production when stock is high', () => {
    const highStockMetrics = {
      ...defaultMetrics,
      productResults: defaultMetrics.productResults.map((r: typeof defaultMetrics.productResults[0]) => ({
        ...r, stockRemaining: r.produced, sold: 0
      })),
    };
    const result = generateSsisFeedback(1, defaultDecision, highStockMetrics, event, mockRivalA, mockRivalB);

    expect(result.recommendation.toLowerCase()).toContain('estoque');
  });
});

describe('generateCouncilFeedback', () => {
  it('returns feedback from all three council members', () => {
    const result = generateCouncilFeedback(defaultDecision, defaultMetrics, event);

    expect(result.rocha).toBeTruthy();
    expect(result.luna).toBeTruthy();
    expect(result.vane).toBeTruthy();
  });

  it('Rocha alerts on low cash', () => {
    const lowCashMetrics = { ...defaultMetrics, cash: 50000, profit: -10000 };
    const result = generateCouncilFeedback(defaultDecision, lowCashMetrics, event);

    expect(result.rocha.toLowerCase()).toContain('caixa');
  });

  it('Luna alerts on low marketing', () => {
    const lowMktDecision: PlayerDecision = {
      ...defaultDecision,
      investments: { ...defaultDecision.investments, marketing: 20000 },
    };
    const result = generateCouncilFeedback(lowMktDecision, defaultMetrics, event);

    expect(result.luna.toLowerCase()).toContain('marketing');
  });

  it('Vane alerts on high stock', () => {
    const highStockMetrics = {
      ...defaultMetrics,
      productResults: defaultMetrics.productResults.map((r: typeof defaultMetrics.productResults[0]) => ({
        ...r, stockRemaining: 1000
      })),
    };
    const result = generateCouncilFeedback(defaultDecision, highStockMetrics, event);

    expect(result.vane.toLowerCase()).toContain('estoque');
  });

  it('Rocha praises high profit', () => {
    const highProfitMetrics = { ...defaultMetrics, profit: 150000 };
    const result = generateCouncilFeedback(defaultDecision, highProfitMetrics, event);

    expect(result.rocha.toLowerCase()).toContain('excelente');
  });
});

describe('generateRoundNewspaper', () => {
  it('returns non-empty text for each round', () => {
    [1, 2, 3].forEach(round => {
      const text = generateRoundNewspaper(round, defaultMetrics, event, mockRivalA, mockRivalB);
      expect(text.length).toBeGreaterThan(0);
    });
  });

  it('mentions revenue in the text', () => {
    const text = generateRoundNewspaper(1, defaultMetrics, event, mockRivalA, mockRivalB);
    expect(text).toContain('R$');
  });

  it('mentions event when present', () => {
    const text = generateRoundNewspaper(1, defaultMetrics, event, mockRivalA, mockRivalB);
    expect(text).toContain(event.title);
  });
});

describe('classifyManagementProfile', () => {
  function makeHistory(materials: number, production: number, marketing: number, logistics: number, finalCash: number): RoundResult[] {
    return [{
      round: 1, event: null, playerDecision: {
        investments: { materials, production, marketing, logistics },
        prices: defaultDecision.prices,
        productionQty: defaultDecision.productionQty,
      },
      playerMetrics: { ...defaultMetrics, cash: finalCash },
      rivalA: mockRivalA, rivalB: mockRivalB,
      ssisFeedback: { diagnostic: '', recommendation: '', forecast: '', pedagogicalGrade: { planning: 5, finance: 5, people: 5, innovation: 5 } },
      councilFeedback: { rocha: '', luna: '', vane: '' },
    }];
  }

  it('classifies as Conservador Financeiro for low marketing, high cash', () => {
    const history = makeHistory(50000, 50000, 20000, 30000, 700000);
    const result = classifyManagementProfile(history);
    expect(result.profileName).toBe('Conservador Financeiro');
  });

  it('classifies as Dominador de Mercado for high marketing', () => {
    const history = makeHistory(50000, 50000, 200000, 30000, 500000);
    const result = classifyManagementProfile(history);
    expect(result.profileName).toBe('Dominador de Mercado');
  });

  it('classifies as Visionário Inovador for high logistics', () => {
    const history = makeHistory(50000, 50000, 40000, 200000, 500000);
    const result = classifyManagementProfile(history);
    expect(result.profileName).toBe('Visionário Inovador');
  });

  it('returns valid emoji and description', () => {
    const history = makeHistory(50000, 50000, 40000, 30000, 500000);
    const result = classifyManagementProfile(history);
    expect(result.emoji).toBeTruthy();
    expect(result.description.length).toBeGreaterThan(10);
  });

  it('handles zero investments', () => {
    const history = makeHistory(0, 0, 0, 0, 500000);
    const result = classifyManagementProfile(history);
    expect(result.profileName).toBe('Conservador Financeiro');
  });
});
