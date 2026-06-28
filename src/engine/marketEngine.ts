import type { GameEvent, PlayerDecision, CompetitorState, ProductResult, RoundResult } from '../data/types';
import { products } from '../data/products';
import { SimulationConstants } from '../config/simulationConstants';

// Helper to calculate baseline metrics based on investments
export function calculateMetrics(
  investments: { materials: number; production: number; marketing: number; logistics: number },
  event: GameEvent | null
) {
  const { materials, production, marketing, logistics } = investments;
  const { metrics, metricBounds, eventCategories } = SimulationConstants;

  // Baseline formulas using centralized constants
  let quality = metrics.quality.base + Math.min(
    metrics.quality.cap,
    (materials * metrics.quality.materialsWeight + logistics * metrics.quality.logisticsWeight) / metrics.quality.divisor
  );
  let innovation = metrics.innovation.base + Math.min(
    metrics.innovation.cap,
    (logistics * metrics.innovation.logisticsWeight + marketing * metrics.innovation.marketingWeight) / metrics.innovation.divisor
  );
  let satisfaction = metrics.satisfaction.base + Math.min(
    metrics.satisfaction.cap,
    (production * metrics.satisfaction.productionWeight) / metrics.satisfaction.divisor
  );
  let efficiency = metrics.efficiency.base + Math.min(
    metrics.efficiency.cap,
    (production * metrics.efficiency.productionWeight + logistics * metrics.efficiency.logisticsWeight) / metrics.efficiency.divisor
  );
  let reputation = metrics.reputation.base + Math.min(
    metrics.reputation.cap,
    (marketing * metrics.reputation.marketingWeight + quality * metrics.reputation.qualityWeight) / metrics.reputation.divisor
  );

  // Apply event multipliers
  if (event) {
    if (event.category === eventCategories.marketing) {
      reputation *= event.multiplier; // both positive and negative use multiplier
    } else if (event.category === eventCategories.production) {
      efficiency *= event.multiplier;
      satisfaction *= event.type === 'positive' ? event.multiplier : 0.9;
    } else if (event.category === eventCategories.logistics) {
      efficiency *= event.multiplier;
      innovation *= event.multiplier;
    }
  }

  // Bound metrics between min and max
  const bound = (val: number) => Math.max(metricBounds.min, Math.min(metricBounds.max, val));
  quality = bound(quality);
  innovation = bound(innovation);
  satisfaction = bound(satisfaction);
  efficiency = bound(efficiency);
  reputation = bound(reputation);

  return { quality, innovation, satisfaction, efficiency, reputation };
}

// Simulate competitor decisions
export function generateCompetitorDecision(
  competitorName: string,
  round: number,
  playerMarketing: number,
  competitorCash: number
): {
  investments: { materials: number; production: number; marketing: number; logistics: number };
  prices: { [productId: string]: number };
  productionQty: { [productId: string]: number };
} {
  const investments = { materials: 0, production: 0, marketing: 0, logistics: 0 };
  const prices: { [productId: string]: number } = {};
  const productionQty: { [productId: string]: number } = {};

  const { competitors, demand } = SimulationConstants;

  if (competitorName === 'Rival A') {
    const cfg = competitors.rivalA;
    const isPlayerHighMarketing = playerMarketing > cfg.highMarketingThreshold;
    investments.marketing = isPlayerHighMarketing ? cfg.highMarketingValue : cfg.baseMarketing;
    investments.materials = cfg.materialsBase + round * cfg.materialsPerRound;
    investments.production = cfg.productionBase + round * cfg.productionPerRound;
    investments.logistics = cfg.logistics;

    // Ensure they don't exceed cash
    const totalInv = investments.marketing + investments.materials + investments.production + investments.logistics;
    if (totalInv > competitorCash) {
      const ratio = competitorCash / totalInv;
      investments.marketing *= ratio;
      investments.materials *= ratio;
      investments.production *= ratio;
      investments.logistics *= ratio;
    }

    // Pricing is lower than default
    products.forEach((p) => {
      prices[p.id] = Math.round(p.defaultPrice * cfg.priceMultiplier * 10) / 10;
      // High volume
      let baseQty = cfg.baseVolume;
      if (p.seasonality === 'Inverno' && round === demand.seasonality.inverno.round) {
        baseQty = cfg.baseVolume * cfg.winterVolumeMultiplier;
      }
      if (p.seasonality === 'Verão' && round === demand.seasonality.verao.round) {
        baseQty = cfg.baseVolume * cfg.summerVolumeMultiplier;
      }
      productionQty[p.id] = Math.floor(baseQty * (investments.production / 150000));
    });
  } else {
    const cfg = competitors.rivalB;
    const isPlayerHighMarketing = playerMarketing > cfg.highMarketingThreshold;
    investments.marketing = cfg.baseMarketing + round * cfg.marketingPerRound;
    investments.materials = cfg.materialsBase + round * cfg.materialsPerRound;
    investments.production = cfg.production;
    investments.logistics = isPlayerHighMarketing ? cfg.highMarketingLogistics : cfg.normalLogistics;

    const totalInv = investments.marketing + investments.materials + investments.production + investments.logistics;
    if (totalInv > competitorCash) {
      const ratio = competitorCash / totalInv;
      investments.marketing *= ratio;
      investments.materials *= ratio;
      investments.production *= ratio;
      investments.logistics *= ratio;
    }

    // Pricing is premium
    products.forEach((p) => {
      prices[p.id] = Math.round(p.defaultPrice * cfg.priceMultiplier * 10) / 10;
      // Lower volume
      let baseQty = cfg.baseVolume;
      if (p.seasonality === 'Inverno' && round === demand.seasonality.inverno.round) {
        baseQty = cfg.baseVolume * cfg.winterVolumeMultiplier;
      }
      if (p.seasonality === 'Verão' && round === demand.seasonality.verao.round) {
        baseQty = cfg.baseVolume * cfg.summerVolumeMultiplier;
      }
      productionQty[p.id] = Math.floor(baseQty * (investments.production / 70000));
    });
  }

  return { investments, prices, productionQty };
}

// Helper to get base demand for a product
function getBaseDemand(productId: string): number {
  return SimulationConstants.demand.baseDemand[productId as keyof typeof SimulationConstants.demand.baseDemand] ?? 5000;
}

// Helper to get seasonality multiplier
function getSeasonalityMultiplier(productId: string, round: number): number {
  const { seasonality } = SimulationConstants.demand;
  const product = products.find(p => p.id === productId);
  if (!product) return 1.0;

  if (product.seasonality === 'Inverno') {
    if (round === seasonality.inverno.round) return seasonality.inverno.multiplier;
    return seasonality.inverno.offSeasonMultiplier;
  }
  if (product.seasonality === 'Verão') {
    if (round === seasonality.verao.round) return seasonality.verao.multiplier;
    return seasonality.verao.offSeasonMultiplier;
  }
  return seasonality.ano_todo.multiplier;
}

// Helper to get event demand multiplier
function getEventDemandMultiplier(event: GameEvent | null, productId: string): number {
  if (!event) return 1.0;
  const { eventDemandMultiplier } = SimulationConstants.demand;

  if (event.category === 'general') {
    return event.multiplier;
  }
  if (event.id === 'frio_atipico_verao' && productId === 'vestido_linho') {
    return event.multiplier;
  }
  if (event.id === 'boato_redes' && event.category === 'marketing') {
    return eventDemandMultiplier.boato_redes.marketingReduction;
  }
  return 1.0;
}

// Helper to calculate desirability
function calculateDesirability(
  stats: { reputation: number; quality: number; innovation: number },
  marketingInvestment: number,
  priceRatio: number
): number {
  const { desirability } = SimulationConstants.demand;
  const weightedStats = 
    stats.reputation * desirability.reputationWeight +
    stats.quality * desirability.qualityWeight +
    stats.innovation * desirability.innovationWeight;
  return (weightedStats * Math.log(marketingInvestment + desirability.marketingLogBase)) / 
    Math.pow(priceRatio, desirability.priceElasticityExponent);
}

// Helper to calculate production requirements
export function calculateProductionRequirements(
  productionQty: { [productId: string]: number }
): { materials: number; production: number } {
  const { productionCostSplit } = SimulationConstants;
  let materials = 0;
  let production = 0;

  products.forEach((product) => {
    const qty = productionQty[product.id] || 0;
    const cost = qty * product.productionCost;
    materials += cost * productionCostSplit.materialsRatio;
    production += cost * productionCostSplit.productionRatio;
  });

  return { materials, production };
}

// Helper to calculate bottleneck multiplier
export function calculateBottleneckMultiplier(
  investments: { materials: number; production: number },
  required: { materials: number; production: number }
): number {
  const { bottleneckTolerance } = SimulationConstants.validation;
  let multiplier = 1.0;

  if (required.materials > 0 && investments.materials < required.materials) {
    multiplier = Math.min(multiplier, investments.materials / required.materials);
  }
  if (required.production > 0 && investments.production < required.production) {
    multiplier = Math.min(multiplier, investments.production / required.production);
  }

  return multiplier < bottleneckTolerance ? multiplier : 1.0;
}

// Helper to apply bottleneck to results
export function applyBottleneck(
  productResults: ProductResult[],
  bottleneckMult: number,
  prices: { [productId: string]: number }
): { productResults: ProductResult[]; totalRevenue: number } {
  if (bottleneckMult >= 1.0) {
    const totalRevenue = productResults.reduce((acc, r) => acc + r.revenue, 0);
    return { productResults, totalRevenue };
  }

  const updatedResults = productResults.map((res) => {
    const newProduced = Math.floor(res.produced * bottleneckMult);
    const newSold = Math.min(res.demanded, newProduced);
    const newRevenue = newSold * prices[res.productId];
    return {
      ...res,
      produced: newProduced,
      sold: newSold,
      revenue: newRevenue,
      stockRemaining: newProduced - newSold,
    };
  });

  const totalRevenue = updatedResults.reduce((acc, r) => acc + r.revenue, 0);
  return { productResults: updatedResults, totalRevenue };
}

// Main execution engine for a round
export function executeRound(
  round: number,
  playerDecision: PlayerDecision,
  playerCash: number,
  _playerStats: { reputation: number; quality: number; innovation: number; satisfaction: number; efficiency: number },
  event: GameEvent | null,
  rivalACash: number,
  rivalBCash: number
): Omit<RoundResult, 'ssisFeedback' | 'councilFeedback'> {
  // 1. Calculate player's stats for this round based on current investments
  const pStats = calculateMetrics(playerDecision.investments, event);

  // 2. Generate competitor decisions
  const rivalADecision = generateCompetitorDecision('Rival A', round, playerDecision.investments.marketing, rivalACash);
  const rivalBDecision = generateCompetitorDecision('Rival B', round, playerDecision.investments.marketing, rivalBCash);

  // Calculate competitor stats
  const rAStats = calculateMetrics(rivalADecision.investments, event);
  const rBStats = calculateMetrics(rivalBDecision.investments, event);

  // 3. Compute demand and sales for each product
  const productResults: ProductResult[] = [];
  const rivalASales: { [pId: string]: number } = {};
  const rivalBSales: { [pId: string]: number } = {};

  let playerTotalRevenue = 0;
  let playerTotalProdCost = 0;

  let rivalATotalRevenue = 0;
  let rivalATotalProdCost = 0;

  let rivalBTotalRevenue = 0;
  let rivalBTotalProdCost = 0;

  products.forEach((product) => {
    // Determine base market demand
    const baseDemand = getBaseDemand(product.id);

    // Sazonalidade
    const seasonalityMult = getSeasonalityMultiplier(product.id, round);

    // Apply global event multiplier to base demand
    const eventDemandMult = getEventDemandMultiplier(event, product.id);

    const totalProductMarketDemand = baseDemand * seasonalityMult * eventDemandMult;

    // Calculate Desirability Scores
    const playerPriceRatio = playerDecision.prices[product.id] / product.defaultPrice;
    const playerDesirability = calculateDesirability(
      pStats,
      playerDecision.investments.marketing,
      playerPriceRatio
    );

    const rAPriceRatio = rivalADecision.prices[product.id] / product.defaultPrice;
    const rADesirability = calculateDesirability(
      rAStats,
      rivalADecision.investments.marketing,
      rAPriceRatio
    );

    const rBPriceRatio = rivalBDecision.prices[product.id] / product.defaultPrice;
    const rBDesirability = calculateDesirability(
      rBStats,
      rivalBDecision.investments.marketing,
      rBPriceRatio
    );

    const totalDesirability = playerDesirability + rADesirability + rBDesirability;

    // Share of demand
    const playerShare = playerDesirability / totalDesirability;
    const rAShare = rADesirability / totalDesirability;
    const rBShare = rBDesirability / totalDesirability;

    // Calculate unit demand
    const playerDemand = Math.round(totalProductMarketDemand * playerShare);
    const rADemand = Math.round(totalProductMarketDemand * rAShare);
    const rBDemand = Math.round(totalProductMarketDemand * rBShare);

    // Sales are capped by production quantity
    const playerProd = playerDecision.productionQty[product.id] || 0;
    const rAProd = rivalADecision.productionQty[product.id] || 0;
    const rBProd = rivalBDecision.productionQty[product.id] || 0;

    const playerSold = Math.min(playerDemand, playerProd);
    const rASold = Math.min(rADemand, rAProd);
    const rBSold = Math.min(rBDemand, rBProd);

    // Event costs multiplier (materials price spike)
    let costMult = 1.0;
    if (event && event.category === SimulationConstants.eventCategories.materials) {
      costMult = event.multiplier;
    }

    const playerProdCost = playerProd * product.productionCost * costMult;
    const playerRevenue = playerSold * playerDecision.prices[product.id];
    playerTotalRevenue += playerRevenue;
    playerTotalProdCost += playerProdCost;

    rivalASales[product.id] = rASold;
    const rAProdCost = rAProd * product.productionCost * costMult;
    const rARevenue = rASold * rivalADecision.prices[product.id];
    rivalATotalRevenue += rARevenue;
    rivalATotalProdCost += rAProdCost;

    rivalBSales[product.id] = rBSold;
    const rBProdCost = rBProd * product.productionCost * costMult;
    const rBRevenue = rBSold * rivalBDecision.prices[product.id];
    rivalBTotalRevenue += rBRevenue;
    rivalBTotalProdCost += rBProdCost;

    productResults.push({
      productId: product.id,
      produced: playerProd,
      demanded: playerDemand,
      sold: playerSold,
      revenue: playerRevenue,
      cost: playerProdCost,
      profit: playerRevenue - playerProdCost,
      stockRemaining: playerProd - playerSold
    });
  });

  // 4. Calculate total costs and profits
  // Player
  const playerFixedInv =
    playerDecision.investments.materials +
    playerDecision.investments.production +
    playerDecision.investments.marketing +
    playerDecision.investments.logistics;

  // Calculate production requirements and bottleneck
  const required = calculateProductionRequirements(playerDecision.productionQty);
  const bottleneckMult = calculateBottleneckMultiplier(playerDecision.investments, required);

  // Apply bottleneck if any
  const { productResults: finalProductResults, totalRevenue: finalPlayerRevenue } = 
    applyBottleneck(productResults, bottleneckMult, playerDecision.prices);

  // Calculate net profit for player in this round
  const playerCosts = playerFixedInv;
  const playerProfit = finalPlayerRevenue - playerCosts;
  const playerNewCash = playerCash + playerProfit;

  // Competitors
  const rACosts =
    rivalADecision.investments.materials +
    rivalADecision.investments.production +
    rivalADecision.investments.marketing +
    rivalADecision.investments.logistics;
  const rAProfit = rivalATotalRevenue - rACosts;
  const rANewCash = rivalACash + rAProfit;

  const rBCosts =
    rivalBDecision.investments.materials +
    rivalBDecision.investments.production +
    rivalBDecision.investments.marketing +
    rivalBDecision.investments.logistics;
  const rBProfit = rivalBTotalRevenue - rBCosts;
  const rBNewCash = rivalBCash + rBProfit;

  // 5. Calculate Market Shares
  const totalMarketRevenue = finalPlayerRevenue + rivalATotalRevenue + rivalBTotalRevenue;
  const playerShare = totalMarketRevenue > 0 ? finalPlayerRevenue / totalMarketRevenue : 0.33;
  const rAShare = totalMarketRevenue > 0 ? rivalATotalRevenue / totalMarketRevenue : 0.33;
  const rBShare = totalMarketRevenue > 0 ? rivalBTotalRevenue / totalMarketRevenue : 0.33;

  // 6. IGE (Índice Geral de Gestão): 0 - 100
  const { profitScore, shareScoreMultiplier, igeWeights } = SimulationConstants.scoring;
  const profitScoreValue = Math.max(0, Math.min(100, (playerProfit - profitScore.minProfit) / 
    ((profitScore.maxProfit - profitScore.minProfit) / profitScore.maxScore)));
  const shareScore = playerShare * shareScoreMultiplier;
  const ige = Math.round(
    profitScoreValue * igeWeights.profit +
    pStats.reputation * igeWeights.reputation +
    pStats.quality * igeWeights.quality +
    pStats.innovation * igeWeights.innovation +
    pStats.satisfaction * igeWeights.satisfaction +
    shareScore * igeWeights.marketShare
  );

  // 7. Risk Index: 0 - 100
  const { risk } = SimulationConstants.scoring;
  const cashRisk = playerNewCash < risk.cash.criticalThreshold ? risk.cash.criticalScore :
    playerNewCash < risk.cash.warningThreshold ? risk.cash.warningScore : risk.cash.safeScore;
  const satisfRisk = (100 - pStats.satisfaction) * risk.satisfactionWeight;
  const qualRisk = (100 - pStats.quality) * risk.qualityWeight;
  const bottleneckRisk = bottleneckMult < 1.0 ? risk.bottleneckScore : risk.normalScore;
  const riskIndex = Math.round(
    cashRisk * risk.weights.cash +
    satisfRisk * risk.weights.satisfaction +
    qualRisk * risk.weights.quality +
    bottleneckRisk * risk.weights.bottleneck
  );

  const rivalAState: CompetitorState = {
    name: 'Rival A',
    cash: rANewCash,
    investments: rivalADecision.investments,
    prices: rivalADecision.prices,
    productionQty: rivalADecision.productionQty,
    sales: rivalASales,
    revenue: rivalATotalRevenue,
    costs: rACosts,
    profit: rAProfit,
    marketShare: rAShare,
    efficiency: rAStats.efficiency,
    quality: rAStats.quality,
    innovation: rAStats.innovation,
    reputation: rAStats.reputation,
    satisfaction: rAStats.satisfaction
  };

  const rivalBState: CompetitorState = {
    name: 'Rival B',
    cash: rBNewCash,
    investments: rivalBDecision.investments,
    prices: rivalBDecision.prices,
    productionQty: rivalBDecision.productionQty,
    sales: rivalBSales,
    revenue: rivalBTotalRevenue,
    costs: rBCosts,
    profit: rBProfit,
    marketShare: rBShare,
    efficiency: rBStats.efficiency,
    quality: rBStats.quality,
    innovation: rBStats.innovation,
    reputation: rBStats.reputation,
    satisfaction: rBStats.satisfaction
  };

  return {
    round,
    event,
    playerDecision,
    playerMetrics: {
      cash: playerNewCash,
      revenue: finalPlayerRevenue,
      costs: playerCosts,
      profit: playerProfit,
      reputation: pStats.reputation,
      quality: pStats.quality,
      innovation: pStats.innovation,
      satisfaction: pStats.satisfaction,
      efficiency: pStats.efficiency,
      marketShare: playerShare,
      ige: Math.min(100, Math.max(0, ige)),
      riskIndex: Math.min(100, Math.max(0, riskIndex)),
      productResults: finalProductResults
    },
    rivalA: rivalAState,
    rivalB: rivalBState
  };
}

