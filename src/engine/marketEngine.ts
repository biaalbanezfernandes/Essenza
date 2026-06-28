import type { GameEvent, PlayerDecision, CompetitorState, ProductResult, RoundResult } from '../data/types';
import { products } from '../data/products';

// Helper to calculate baseline metrics based on investments
export function calculateMetrics(
  investments: { materials: number; production: number; marketing: number; logistics: number },
  event: GameEvent | null
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

  // Apply event multipliers
  if (event) {
    if (event.category === 'marketing') {
      reputation *= event.type === 'positive' ? event.multiplier : event.multiplier;
    } else if (event.category === 'production') {
      efficiency *= event.type === 'positive' ? event.multiplier : event.multiplier;
      satisfaction *= event.type === 'positive' ? event.multiplier : 0.9;
    } else if (event.category === 'logistics') {
      efficiency *= event.type === 'positive' ? event.multiplier : event.multiplier;
      innovation *= event.type === 'positive' ? event.multiplier : event.multiplier;
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
    // Rival A - Preço Baixo / Volume
    // Investe pesado em produção e volume.
    // Reage ao marketing do jogador.
    const isPlayerHighMarketing = playerMarketing > 80000;
    investments.marketing = isPlayerHighMarketing ? 80000 : 50000;
    investments.materials = 120000 + round * 15000;
    investments.production = 140000 + round * 20000;
    investments.logistics = 40000;

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
      prices[p.id] = Math.round(p.defaultPrice * 0.85 * 10) / 10;
      // High volume
      let baseQty = 2500;
      if (p.seasonality === 'Inverno' && round === 2) baseQty = 4000; // Winter in round 2
      if (p.seasonality === 'Verão' && round === 3) baseQty = 4500; // Summer in round 3
      productionQty[p.id] = Math.floor(baseQty * (investments.production / 150000));
    });
  } else {
    // Rival B - Marca Premium
    // Investe em inovação e marketing.
    // Dobra inovação se o jogador cresce em marketing.
    const isPlayerHighMarketing = playerMarketing > 80000;
    investments.marketing = 130000 + round * 15000;
    investments.materials = 80000 + round * 10000;
    investments.production = 70000;
    investments.logistics = isPlayerHighMarketing ? 150000 : 90000;

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
      prices[p.id] = Math.round(p.defaultPrice * 1.3 * 10) / 10;
      // Lower volume
      let baseQty = 1200;
      if (p.seasonality === 'Inverno' && round === 2) baseQty = 2000;
      if (p.seasonality === 'Verão' && round === 3) baseQty = 2200;
      productionQty[p.id] = Math.floor(baseQty * (investments.production / 70000));
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

    // Apply global event multiplier to base demand
    let eventDemandMult = 1.0;
    if (event) {
      if (event.category === 'general') {
        eventDemandMult = event.multiplier;
      } else if (event.id === 'frio_atípico_verao' && product.id === 'vestido_linho') {
        eventDemandMult = event.multiplier;
      } else if (event.id === 'boato_redes' && event.category === 'marketing') {
        eventDemandMult = 0.85; // general reduction for affected
      }
    }

    const totalProductMarketDemand = baseDemand * seasonalityMult * eventDemandMult;

    // Calculate Desirability Scores
    // Player
    const playerPriceRatio = playerDecision.prices[product.id] / product.defaultPrice;
    const playerDesirability =
      ((pStats.reputation * 0.35 + pStats.quality * 0.35 + pStats.innovation * 0.3) *
        Math.log(playerDecision.investments.marketing + 1000)) /
      Math.pow(playerPriceRatio, 2.2);

    // Rival A
    const rAPriceRatio = rivalADecision.prices[product.id] / product.defaultPrice;
    const rADesirability =
      ((rAStats.reputation * 0.35 + rAStats.quality * 0.35 + rAStats.innovation * 0.3) *
        Math.log(rivalADecision.investments.marketing + 1000)) /
      Math.pow(rAPriceRatio, 2.2);

    // Rival B
    const rBPriceRatio = rivalBDecision.prices[product.id] / product.defaultPrice;
    const rBDesirability =
      ((rBStats.reputation * 0.35 + rBStats.quality * 0.35 + rBStats.innovation * 0.3) *
        Math.log(rivalBDecision.investments.marketing + 1000)) /
      Math.pow(rBPriceRatio, 2.2);

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
    if (event && event.category === 'materials') {
      costMult = event.multiplier; // ex: 1.30x for materials
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

  // Let's establish that the cost of goods produced is covered by the raw materials & production investments.
  // Wait, if the investments themselves ARE the expenses, then the player has already spent that money from cash.
  // To avoid double-counting, the cash remaining is cash_previous - investments_made + revenue_earned.
  // This is clean: cash spent = total investments made.
  // Wait, what if the player schedules production but didn't invest enough in Materials or Production to cover it?
  // Let's implement a penalty or validation:
  // Let's calculate the required budget:
  // Raw material cost: 50% of the production cost.
  // Production labor cost: 50% of the production cost.
  // If player's materials investment < 50% of production cost, they get a bottleneck (can only produce up to their material investment).
  // If player's production investment < 50% of production cost, they get a bottleneck (can only produce up to their labor investment).
  // Let's apply this bottleneck dynamically! It makes the simulation incredibly realistic and strategic.
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

  // Calculate net profit for player in this round
  // Revenue - Total Investments made
  const playerCosts = playerFixedInv;
  const playerProfit = playerTotalRevenue - playerCosts;
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
  const totalMarketRevenue = playerTotalRevenue + rivalATotalRevenue + rivalBTotalRevenue;
  const playerShare = totalMarketRevenue > 0 ? playerTotalRevenue / totalMarketRevenue : 0.33;
  const rAShare = totalMarketRevenue > 0 ? rivalATotalRevenue / totalMarketRevenue : 0.33;
  const rBShare = totalMarketRevenue > 0 ? rivalBTotalRevenue / totalMarketRevenue : 0.33;

  // 6. IGE (Índice Geral de Gestão): 0 - 100
  // Lucro score, Reputação, Qualidade, Inovação, Satisfação, Market Share
  const profitScore = Math.max(0, Math.min(100, (playerProfit + 50000) / 2500)); // scaling R$ -50k to R$ 200k
  const shareScore = playerShare * 200; // 50% share is 100 points
  const ige = Math.round(
    (profitScore * 0.25 +
      pStats.reputation * 0.2 +
      pStats.quality * 0.15 +
      pStats.innovation * 0.15 +
      pStats.satisfaction * 0.15 +
      shareScore * 0.1)
  );

  // 7. Risk Index: 0 - 100
  // Caixa, Satisfação, Qualidade, Estabilidade Operacional (evitar gargalo)
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
