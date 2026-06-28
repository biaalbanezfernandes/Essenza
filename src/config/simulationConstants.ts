// simulationConstants.ts
// Centralized configuration for all simulation formulas and magic numbers
// This makes the game balanceable without touching engine logic

export const SimulationConstants = {
  // ===== BASE METRICS CALCULATION =====
  // Formula: base + min(cap, (weightedInvestment) / divisor)
  metrics: {
    quality: {
      base: 40,
      cap: 60,
      materialsWeight: 0.4,
      logisticsWeight: 0.6,
      divisor: 1200,
    },
    innovation: {
      base: 35,
      cap: 65,
      logisticsWeight: 0.7,
      marketingWeight: 0.3,
      divisor: 1000,
    },
    satisfaction: {
      base: 45,
      cap: 55,
      productionWeight: 0.8,
      divisor: 1000,
    },
    efficiency: {
      base: 40,
      cap: 60,
      productionWeight: 0.4,
      logisticsWeight: 0.6,
      divisor: 1100,
    },
    reputation: {
      base: 35,
      cap: 65,
      marketingWeight: 0.7,
      qualityWeight: 0.3,
      divisor: 1100,
    },
  },

  // Metric bounds
  metricBounds: {
    min: 10,
    max: 100,
  },

  // ===== EVENT MULTIPLIERS =====
  eventCategories: {
    marketing: 'marketing',
    production: 'production',
    logistics: 'logistics',
    materials: 'materials',
    general: 'general',
  },

  // ===== COMPETITOR BEHAVIOR =====
  competitors: {
    rivalA: {
      // Low Price / Volume strategy
      baseMarketing: 50000,
      highMarketingThreshold: 80000,
      highMarketingValue: 80000,
      materialsBase: 120000,
      materialsPerRound: 15000,
      productionBase: 140000,
      productionPerRound: 20000,
      logistics: 40000,
      priceMultiplier: 0.85,
      baseVolume: 2500,
      winterVolumeMultiplier: 4000 / 2500, // round 2
      summerVolumeMultiplier: 4500 / 2500, // round 3
    },
    rivalB: {
      // Premium / Innovation strategy
      baseMarketing: 130000,
      marketingPerRound: 15000,
      highMarketingThreshold: 80000,
      highMarketingLogistics: 150000,
      normalLogistics: 90000,
      materialsBase: 80000,
      materialsPerRound: 10000,
      production: 70000,
      priceMultiplier: 1.3,
      baseVolume: 1200,
      winterVolumeMultiplier: 2000 / 1200,
      summerVolumeMultiplier: 2200 / 1200,
    },
  },

  // ===== DEMAND CALCULATION =====
  demand: {
    baseDemand: {
      camiseta_basica: 16000,
      polo_essenza: 9000,
      moletom: 3000,
      calca_jeans: 6500,
      vestido_linho: 4000,
      kit_meia_cueca: 13000,
    },
    seasonality: {
      inverno: {
        round: 2,
        multiplier: 2.2,
        offSeasonMultiplier: 0.6,
      },
      verao: {
        round: 3,
        multiplier: 2.4,
        offSeasonMultiplier: 0.5,
      },
      ano_todo: {
        multiplier: 1.0,
      },
    },
    // Desirability formula weights
    desirability: {
      reputationWeight: 0.35,
      qualityWeight: 0.35,
      innovationWeight: 0.3,
      marketingLogBase: 1000,
      priceElasticityExponent: 2.2,
    },
    // Event demand multipliers
    eventDemandMultiplier: {
      general: 1.0, // uses event.multiplier directly
      frio_atipico_verao: {
        productId: 'vestido_linho',
        multiplierKey: 'multiplier',
      },
      boato_redes: {
        marketingReduction: 0.85,
      },
    },
  },

  // ===== PRODUCTION COST STRUCTURE =====
  productionCostSplit: {
    materialsRatio: 0.5,
    productionRatio: 0.5,
  },

  // ===== FINANCIAL SCORING =====
  scoring: {
    // Profit score: maps profit to 0-100
    // profit = -50000 -> 0, profit = 200000 -> 100
    profitScore: {
      minProfit: -50000,
      maxProfit: 200000,
      maxScore: 100,
    },
    // Market share score: 50% share = 100 points
    shareScoreMultiplier: 200,
    // IGE (Índice Geral de Gestão) weights
    igeWeights: {
      profit: 0.25,
      reputation: 0.2,
      quality: 0.15,
      innovation: 0.15,
      satisfaction: 0.15,
      marketShare: 0.1,
    },
    // Risk Index weights and thresholds
    risk: {
      cash: {
        criticalThreshold: 50000,
        criticalScore: 80,
        warningThreshold: 150000,
        warningScore: 40,
        safeScore: 10,
      },
      satisfactionWeight: 0.8,
      qualityWeight: 0.6,
      bottleneckScore: 75,
      normalScore: 10,
      weights: {
        cash: 0.3,
        satisfaction: 0.25,
        quality: 0.2,
        bottleneck: 0.25,
      },
    },
  },

  // ===== LIVE VALIDATION THRESHOLDS (for S.S.I.S. Assistant) =====
  validation: {
    marketingMinimum: 30000,
    pricingHighMultiplier: 1.5,
    stockWarningThreshold: 0.3, // 30% of produced
    stockCriticalThreshold: 0.5, // 50% of produced
    bottleneckTolerance: 0.99, // < 99% triggers bottleneck
  },

  // ===== S.S.I.S. PEDAGOGICAL GRADES =====
  pedagogicalGrades: {
    planning: {
      baseGood: 9.5,
      baseAverage: 6,
      winterMoletomBonus: 1, // round 2, moletom > 1500
      stockPenalty: 2.5, // if stock > 50% produced
      min: 2,
      max: 10,
    },
    finance: {
      excellentProfit: 100000,
      excellentGrade: 9.8,
      positiveGrade: 8.0,
      lowCashThreshold: 50000,
      lowCashGrade: 3.0,
      neutralGrade: 5.5,
      min: 1,
      max: 10,
    },
    people: {
      satisfactionDivisor: 10,
      min: 2,
      max: 10,
    },
    innovation: {
      innovationDivisor: 10,
      efficiencyBonus: 1,
      efficiencyThreshold: 70,
      min: 2,
      max: 10,
    },
  },

  // ===== COUNCIL FEEDBACK THRESHOLDS =====
  council: {
    rocha: {
      criticalCash: 80000,
      excellentProfit: 100000,
    },
    luna: {
      lowMarketing: 40000,
      highReputation: 75,
    },
    vane: {
      highStock: 2000,
      highQuality: 75,
      highEfficiency: 70,
    },
  },

  // ===== PROFILE CLASSIFICATION =====
  profiles: {
    financialConservative: {
      finalCashThreshold: 600000,
      marketingRatioMax: 0.25,
    },
    marketDominator: {
      marketingRatioMin: 0.4,
    },
    visionaryInnovator: {
      logisticsRatioMin: 0.35,
    },
    operationalExecutor: {
      productionRatioMin: 0.35,
      materialsGtMarketing: true,
    },
    humanizedManager: {
      materialsGtMarketing: true,
      productionGtMarketing: true,
    },
  },

  // ===== ROUND CONFIGURATION =====
  rounds: {
    total: 3,
    initialCash: 500000,
    initialReputation: 50,
    initialQuality: 50,
    initialInnovation: 50,
    initialSatisfaction: 50,
    initialEfficiency: 50,
    initialMarketShare: 0.33,
  },
} as const;

export type SimulationConstants = typeof SimulationConstants;