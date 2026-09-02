import type { GameEvent, PlayerDecision, CompetitorState, ProductResult, RoundResult } from '../data/types';
import { products } from '../data/products';

// Helper to calculate baseline metrics based on investments
export function calculateMetrics(
  investments: { materials: number; production: number; marketing: number; logistics: number },
  event: GameEvent | null,
  isPlayer: boolean = true
) {
  const materials = investments.materials;
  const production = investments.production;
  const marketing = investments.marketing;
  const logistics = investments.logistics;

  // Baseline formulas (scaling logarithmically or linearly with caps)
  let quality = 40 + Math.min(60, (materials * 0.4 + logistics * 0.6) / 1200);
  let innovation = 35 + Math.min(65, (logistics * 0.7 + marketing * 0.3) / 1000);
  let satisfaction = 45 + Math.min(55, (production * 0.8) / 1000);
  let efficiency = 40 + Math.min(60, (production * 0.4 + logistics * 0.6) / 1100);
  let reputation = 35 + Math.min(65, (marketing * 0.7 + quality * 0.3) / 1100);

  // Apply event multipliers based on scope
  if (event) {
    const isTargeted = event.scope === 'player' ? isPlayer : true;
    if (isTargeted) {
      if (event.category === 'marketing') {
        reputation *= event.multiplier;
      } else if (event.category === 'production') {
        efficiency *= event.multiplier;
        satisfaction *= event.type === 'positive' ? 1.1 : 0.85;
      } else if (event.category === 'logistics') {
        efficiency *= event.multiplier;
        innovation *= event.multiplier;
      }
    }
  }

  // Bound metrics between 10 and 100
  quality = Math.max(10, Math.min(100, quality));
  innovation = Math.max(10, Math.min(100, innovation));
  satisfaction = Math.max(10, Math.min(100, satisfaction));
  efficiency = Math.max(10, Math.min(100, efficiency));
  reputation = Math.max(10, Math.min(100, reputation));

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

  if (competitorName === 'Rival A') {
    // Rival A - Fast Fashion / Volume / Preço Acessível
    // Foco em volume comercial e custo-benefício
    const isPlayerHighMarketing = playerMarketing > 70000;
    investments.marketing = isPlayerHighMarketing ? 50000 : 40000;
    investments.materials = 50000 + round * 5000;
    investments.production = 60000 + round * 5000;
    investments.logistics = 25000;

    // Ensure they don't exceed cash
    const totalInv = investments.marketing + investments.materials + investments.production + investments.logistics;
    if (totalInv > competitorCash) {
      const ratio = competitorCash / totalInv;
      investments.marketing *= ratio;
      investments.materials *= ratio;
      investments.production *= ratio;
      investments.logistics *= ratio;
    }

    // Pricing: ~10% lower than standard baseline
    products.forEach((p) => {
      prices[p.id] = Math.round(p.defaultPrice * 0.90 * 10) / 10;
      // Balanced competitive volume
      let baseQty = 800;
      if (p.id === 'camiseta_basica') baseQty = 1400;
      if (p.id === 'kit_meia_cueca') baseQty = 1100;
      if (p.id === 'polo_essenza') baseQty = 700;
      if (p.id === 'calca_jeans') baseQty = 550;
      if (p.id === 'vestido_linho') baseQty = 400;
      if (p.id === 'moletom') baseQty = 350;

      if (p.seasonality === 'Inverno' && round === 2) baseQty = 1200;
      if (p.seasonality === 'Verão' && round === 3) baseQty = 1300;
      productionQty[p.id] = Math.floor(baseQty * (investments.production / 60000));
    });
  } else {
    // Rival B - Marca Premium / Alto Valor Agregado
    // Foco em branding, qualidade e margem unitária
    const isPlayerHighMarketing = playerMarketing > 70000;
    investments.marketing = isPlayerHighMarketing ? 70000 : 55000;
    investments.materials = 55000 + round * 5000;
    investments.production = 40000;
    investments.logistics = 35000;

    const totalInv = investments.marketing + investments.materials + investments.production + investments.logistics;
    if (totalInv > competitorCash) {
      const ratio = competitorCash / totalInv;
      investments.marketing *= ratio;
      investments.materials *= ratio;
      investments.production *= ratio;
      investments.logistics *= ratio;
    }

    // Pricing: ~25% premium above standard baseline
    products.forEach((p) => {
      prices[p.id] = Math.round(p.defaultPrice * 1.25 * 10) / 10;
      // Selective premium volume
      let baseQty = 450;
      if (p.id === 'camiseta_basica') baseQty = 700;
      if (p.id === 'kit_meia_cueca') baseQty = 550;
      if (p.id === 'polo_essenza') baseQty = 450;
      if (p.id === 'calca_jeans') baseQty = 350;
      if (p.id === 'vestido_linho') baseQty = 300;
      if (p.id === 'moletom') baseQty = 250;

      if (p.seasonality === 'Inverno' && round === 2) baseQty = 750;
      if (p.seasonality === 'Verão' && round === 3) baseQty = 800;
      productionQty[p.id] = Math.floor(baseQty * (investments.production / 40000));
    });
  }

  return { investments, prices, productionQty };
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
  // Stochastic noise factor for event intensity per round execution (0.925 to 1.075)
  const randomNoise = event ? (0.925 + Math.random() * 0.15) : 1.0;
  const effectiveEventMult = event ? 1 + (event.multiplier - 1) * randomNoise : 1.0;

  // 1. Calculate stats for player and competitors
  const pStats = calculateMetrics(playerDecision.investments, event, true);

  // Competitor decisions
  const rivalADecision = generateCompetitorDecision('Rival A', round, playerDecision.investments.marketing, rivalACash);
  const rivalBDecision = generateCompetitorDecision('Rival B', round, playerDecision.investments.marketing, rivalBCash);

  // Competitor stats
  const rAStats = calculateMetrics(rivalADecision.investments, event, false);
  const rBStats = calculateMetrics(rivalBDecision.investments, event, false);

  // 2. Compute demand and sales for each product
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
    let baseDemand = 0;
    switch (product.id) {
      case 'camiseta_basica': baseDemand = 16000; break;
      case 'polo_essenza': baseDemand = 9000; break;
      case 'moletom': baseDemand = 3000; break;
      case 'calca_jeans': baseDemand = 6500; break;
      case 'vestido_linho': baseDemand = 4000; break;
      case 'kit_meia_cueca': baseDemand = 13000; break;
      default: baseDemand = 5000;
    }

    // Sazonalidade: Inverno in Round 2, Verão in Round 3
    let seasonalityMult = 1.0;
    if (product.seasonality === 'Inverno' && round === 2) seasonalityMult = 2.2;
    if (product.seasonality === 'Inverno' && round !== 2) seasonalityMult = 0.6;
    if (product.seasonality === 'Verão' && round === 3) seasonalityMult = 2.4;
    if (product.seasonality === 'Verão' && round !== 3) seasonalityMult = 0.5;

    // Apply global and category event multipliers to base demand
    let eventDemandMult = 1.0;
    if (event) {
      if (event.category === 'general') {
        if (event.id === 'verao_antecipado' && (product.seasonality === 'Verão' || product.id === 'camiseta_basica')) {
          eventDemandMult = effectiveEventMult * 1.15;
        } else if (event.id === 'tendencia_casual' && ['camiseta_basica', 'polo_essenza', 'moletom'].includes(product.id)) {
          eventDemandMult = effectiveEventMult * 1.10;
        } else if (event.id === 'frio_atípico_verao') {
          if (product.id === 'vestido_linho') eventDemandMult = 0.50 * randomNoise;
          if (product.id === 'moletom') eventDemandMult = 1.35 * randomNoise;
        } else if (event.id === 'inflacao_alta') {
          eventDemandMult = effectiveEventMult;
        } else {
          eventDemandMult = effectiveEventMult;
        }
      }
    }

    const totalProductMarketDemand = baseDemand * seasonalityMult * eventDemandMult;

    // Calculate Desirability Scores
    // Player
    const playerPriceRatio = playerDecision.prices[product.id] / product.defaultPrice;
    let playerDesirability =
      ((pStats.reputation * 0.35 + pStats.quality * 0.35 + pStats.innovation * 0.3) *
        Math.log(playerDecision.investments.marketing + 1000)) /
      Math.pow(playerPriceRatio, 2.2);

    // Apply player-specific marketing/reputation event multipliers directly to desirability score
    if (event && event.scope === 'player' && event.category === 'marketing') {
      playerDesirability *= effectiveEventMult;
    }

    // Rival A
    const rAPriceRatio = rivalADecision.prices[product.id] / product.defaultPrice;
    let rADesirability =
      ((rAStats.reputation * 0.35 + rAStats.quality * 0.35 + rAStats.innovation * 0.3) *
        Math.log(rivalADecision.investments.marketing + 1000)) /
      Math.pow(rAPriceRatio, 2.2);

    // Rival B
    const rBPriceRatio = rivalBDecision.prices[product.id] / product.defaultPrice;
    let rBDesirability =
      ((rBStats.reputation * 0.35 + rBStats.quality * 0.35 + rBStats.innovation * 0.3) *
        Math.log(rivalBDecision.investments.marketing + 1000)) /
      Math.pow(rBPriceRatio, 2.2);

    if (event && event.id === 'dumping_concorrente') {
      rADesirability *= 1.25;
      rBDesirability *= 1.20;
    }

    const totalDesirability = playerDesirability + rADesirability + rBDesirability;

    // Share of demand
    const playerShare = playerDesirability / totalDesirability;
    const rAShare = rADesirability / totalDesirability;
    const rBShare = rBDesirability / totalDesirability;

    // Calculate unit demand
    const playerDemand = Math.round(totalProductMarketDemand * playerShare);
    const rADemand = Math.round(totalProductMarketDemand * rAShare);
    const rBDemand = Math.round(totalProductMarketDemand * rBShare);

    // Production quantity with event modifications (e.g. factory defects, strikes)
    let playerProd = playerDecision.productionQty[product.id] || 0;
    let rAProd = rivalADecision.productionQty[product.id] || 0;
    let rBProd = rivalBDecision.productionQty[product.id] || 0;

    if (event) {
      if (event.id === 'defeito_lote') {
        playerProd = Math.floor(playerProd * 0.80); // 20% lost to dye batch defects
      } else if (event.id === 'greve_costureiros') {
        playerProd = Math.floor(playerProd * 0.75);
        rAProd = Math.floor(rAProd * 0.75);
        rBProd = Math.floor(rBProd * 0.75);
      }
    }

    // Sales are capped by production quantity & logistics delivery conversion
    let logisticsConversion = 1.0;
    if (event && event.id === 'greve_transportes') {
      logisticsConversion = 0.70 * randomNoise;
    } else if (event && event.id === 'logistica_eficiente') {
      logisticsConversion = 1.10;
    }

    const playerSold = Math.min(Math.round(playerDemand * logisticsConversion), playerProd);
    const rASold = Math.min(Math.round(rADemand * logisticsConversion), rAProd);
    const rBSold = Math.min(Math.round(rBDemand * logisticsConversion), rBProd);

    // Event costs multiplier (materials price spike/drop)
    let costMult = 1.0;
    if (event && event.category === 'materials') {
      costMult = effectiveEventMult;
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

  // 3. Bottleneck Check
  const playerFixedInv =
    playerDecision.investments.materials +
    playerDecision.investments.production +
    playerDecision.investments.marketing +
    playerDecision.investments.logistics;

  let playerBottleneckMult = 1.0;
  const playerRequiredMaterials = productResults.reduce((acc, curr) => {
    const prod = products.find((p) => p.id === curr.productId);
    return acc + curr.produced * (prod?.productionCost || 0) * 0.5;
  }, 0);

  const playerRequiredProduction = productResults.reduce((acc, curr) => {
    const prod = products.find((p) => p.id === curr.productId);
    return acc + curr.produced * (prod?.productionCost || 0) * 0.5;
  }, 0);

  if (playerDecision.investments.materials < playerRequiredMaterials && playerRequiredMaterials > 0) {
    const materialsRatio = playerDecision.investments.materials / playerRequiredMaterials;
    playerBottleneckMult = Math.min(playerBottleneckMult, materialsRatio);
  }
  if (playerDecision.investments.production < playerRequiredProduction && playerRequiredProduction > 0) {
    const productionRatio = playerDecision.investments.production / playerRequiredProduction;
    playerBottleneckMult = Math.min(playerBottleneckMult, productionRatio);
  }

  // Apply bottleneck if any
  if (playerBottleneckMult < 0.99) {
    playerTotalRevenue = 0;
    productResults.forEach((res) => {
      res.produced = Math.floor(res.produced * playerBottleneckMult);
      res.sold = Math.min(res.demanded, res.produced);
      res.revenue = res.sold * playerDecision.prices[res.productId];
      res.stockRemaining = res.produced - res.sold;
      playerTotalRevenue += res.revenue;
    });
  }

  // 4. Calculate Direct Event Cost Adjustments (Cotton crisis, energy tariff, tax breaks)
  let extraEventCosts = 0;
  if (event) {
    if (event.category === 'materials') {
      // Cotton price spike / bumper crop alters raw material expense directly
      extraEventCosts += playerDecision.investments.materials * (effectiveEventMult - 1);
    } else if (event.id === 'crise_energia') {
      // Energy tariff adds surcharge to production overhead
      extraEventCosts += playerDecision.investments.production * 0.20 * randomNoise;
    } else if (event.id === 'incentivo_fiscal') {
      // Tax break provides a rebate on fixed investments
      extraEventCosts -= playerFixedInv * 0.15 * randomNoise;
    }
  }

  const playerCosts = Math.round(playerFixedInv + extraEventCosts);
  const playerProfit = playerTotalRevenue - playerCosts;
  const playerNewCash = playerCash + playerProfit;

  // Competitors
  const rACosts = Math.round(
    (rivalADecision.investments.materials +
      rivalADecision.investments.production +
      rivalADecision.investments.marketing +
      rivalADecision.investments.logistics) * (event?.category === 'materials' ? effectiveEventMult : 1.0)
  );
  const rAProfit = rivalATotalRevenue - rACosts;
  const rANewCash = rivalACash + rAProfit;

  const rBCosts = Math.round(
    (rivalBDecision.investments.materials +
      rivalBDecision.investments.production +
      rivalBDecision.investments.marketing +
      rivalBDecision.investments.logistics) * (event?.category === 'materials' ? effectiveEventMult : 1.0)
  );
  const rBProfit = rivalBTotalRevenue - rBCosts;
  const rBNewCash = rivalBCash + rBProfit;

  // 5. Calculate Market Shares
  const totalMarketRevenue = playerTotalRevenue + rivalATotalRevenue + rivalBTotalRevenue;
  const playerShare = totalMarketRevenue > 0 ? playerTotalRevenue / totalMarketRevenue : 0.33;
  const rAShare = totalMarketRevenue > 0 ? rivalATotalRevenue / totalMarketRevenue : 0.33;
  const rBShare = totalMarketRevenue > 0 ? rivalBTotalRevenue / totalMarketRevenue : 0.33;

  // 6. IGE (Índice Geral de Gestão): 0 - 100
  const profitScore = Math.max(0, Math.min(100, (playerProfit + 50000) / 2500));
  const shareScore = playerShare * 200;
  const ige = Math.round(
    (profitScore * 0.25 +
      pStats.reputation * 0.2 +
      pStats.quality * 0.15 +
      pStats.innovation * 0.15 +
      pStats.satisfaction * 0.15 +
      shareScore * 0.1)
  );

  // 7. Risk Index: 0 - 100
  const cashRisk = playerNewCash < 50000 ? 80 : playerNewCash < 150000 ? 40 : 10;
  const satisfRisk = (100 - pStats.satisfaction) * 0.8;
  const qualRisk = (100 - pStats.quality) * 0.6;
  const bottleneckRisk = playerBottleneckMult < 0.99 ? 75 : 10;
  const riskIndex = Math.round(cashRisk * 0.3 + satisfRisk * 0.25 + qualRisk * 0.2 + bottleneckRisk * 0.25);

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
      revenue: playerTotalRevenue,
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
      productResults
    },
    rivalA: rivalAState,
    rivalB: rivalBState
  };
}
