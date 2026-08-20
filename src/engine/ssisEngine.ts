import type { RoundResult, PlayerDecision, GameEvent } from '../data/types';
import { products } from '../data/products';

export interface PedagogicalGrades {
  planning: number;
  finance: number;
  people: number;
  innovation: number;
}

export interface ManagementProfile {
  profileName: string;
  emoji: string;
  subtitle: string;
  description: string;
  strengths: string[];
  executiveAdvice: string;
}

export function generateSsisFeedback(
  round: number,
  decision: PlayerDecision,
  metrics: RoundResult['playerMetrics'],
  event: GameEvent | null,
  rivalA: RoundResult['rivalA'],
  rivalB: RoundResult['rivalB'],
  _playerEmail: string
) {
  const profit = metrics.profit;
  const quality = metrics.quality;
  const efficiency = metrics.efficiency;

  const totalProduced = metrics.productResults.reduce((acc, curr) => acc + curr.produced, 0);

  let topRevenueProduct = '';
  let maxRevenue = -1;
  
  let worstStockProduct = '';
  let worstStockProductId = '';
  let maxStockRemaining = 0;
  
  let worstLostSalesProduct = '';
  let maxLostSales = 0;
  
  let underpricedProduct = '';
  let thinMarginProduct = '';
  let thinMarginVal = 0;

  metrics.productResults.forEach((pr) => {
    const prodInfo = products.find(p => p.id === pr.productId);
    if (pr.revenue > maxRevenue) {
      maxRevenue = pr.revenue;
      topRevenueProduct = prodInfo ? prodInfo.name : pr.productId;
    }
    if (pr.stockRemaining > maxStockRemaining) {
      maxStockRemaining = pr.stockRemaining;
      worstStockProduct = prodInfo ? prodInfo.name : pr.productId;
      worstStockProductId = pr.productId;
    }
    const lost = pr.demanded - pr.sold;
    if (lost > maxLostSales) {
      maxLostSales = lost;
      worstLostSalesProduct = prodInfo ? prodInfo.name : pr.productId;
    }
    if (prodInfo) {
      const price = decision.prices[pr.productId] || prodInfo.defaultPrice;
      if (price < prodInfo.productionCost) {
        underpricedProduct = prodInfo.name;
      } else {
        const margin = price - prodInfo.productionCost;
        const marginPercent = (margin / price) * 100;
        if (marginPercent < 22 && pr.produced > 0) {
          thinMarginProduct = prodInfo.name;
          thinMarginVal = marginPercent;
        }
      }
    }
  });

  const maxCompetitorProfit = Math.max(rivalA.profit, rivalB.profit);
  const bestCompetitorName = rivalA.profit > rivalB.profit ? 'Rival A' : 'Rival B';

  // 1. Diagnostic (Condensed & Direct)
  let diagnostic = '';
  if (profit > 100000) {
    diagnostic = `Ótimo desempenho na Rodada ${round}: Lucro de R$ ${profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. `;
    if (topRevenueProduct) diagnostic += `Destaque: **${topRevenueProduct}** (R$ ${maxRevenue.toLocaleString('pt-BR')}). `;
    diagnostic += profit > maxCompetitorProfit ? `Você liderou o mercado!` : `Líder do setor: **${bestCompetitorName}** (R$ ${maxCompetitorProfit.toLocaleString('pt-BR')}).`;
  } else if (profit > 0) {
    diagnostic = `Rodada ${round} no azul: Lucro de R$ ${profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. `;
    if (topRevenueProduct) diagnostic += `Carro-chefe: **${topRevenueProduct}**. `;
    if (maxStockRemaining > 0 && worstStockProduct) diagnostic += `Atenção ao estoque de **${worstStockProduct}** (${maxStockRemaining} un. paradas). `;
    if (maxCompetitorProfit > profit) diagnostic += `Líder: **${bestCompetitorName}** (R$ ${maxCompetitorProfit.toLocaleString('pt-BR')}).`;
  } else {
    diagnostic = `Prejuízo de R$ ${Math.abs(profit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} na Rodada ${round}. `;
    if (totalProduced === 0) diagnostic += `Fábrica sem produção programada. `;
    else if (maxStockRemaining > totalProduced * 0.3 && worstStockProduct) diagnostic += `Sobras em **${worstStockProduct}** (${maxStockRemaining} un.). `;
    else diagnostic += `Custos operacionais superaram a receita. `;
    diagnostic += `Líder: **${bestCompetitorName}** (R$ ${maxCompetitorProfit.toLocaleString('pt-BR')}).`;
  }

  if (maxStockRemaining > 200 && worstStockProductId) {
    const playerPrice = decision.prices[worstStockProductId];
    diagnostic += ` Preço de **${worstStockProduct}** (R$ ${playerPrice.toFixed(2)}) ficou acima dos rivais.`;
  }

  if (maxLostSales > 100 && worstLostSalesProduct) {
    diagnostic += ` Ruptura: ~${Math.round(maxLostSales)} unidades de **${worstLostSalesProduct}** não atendidas.`;
  }

  if (event) {
    diagnostic += ` Impacto do evento "${event.title}" (${event.affectedArea}).`;
  }

  // 2. Recommendations (Condensed)
  const recommendationsList: string[] = [];

  if (underpricedProduct) {
    recommendationsList.push(`Suba o preço de **${underpricedProduct}** (está abaixo do custo).`);
  } else if (thinMarginProduct) {
    recommendationsList.push(`Margem baixa em **${thinMarginProduct}** (${thinMarginVal.toFixed(1)}%). Reajuste.`);
  }

  if (maxLostSales > 150 && worstLostSalesProduct) {
    recommendationsList.push(`Aumente a produção de **${worstLostSalesProduct}** (${Math.round(maxLostSales)} pedidos perdidos).`);
  }

  if (maxStockRemaining > 300 && worstStockProduct) {
    recommendationsList.push(`Reduza o lote ou promova desconto para **${worstStockProduct}** (${maxStockRemaining} paradas).`);
  }

  if (decision.investments.marketing < 40000) {
    recommendationsList.push(`Reforce o Marketing para sustentar a demanda da marca.`);
  }

  if (recommendationsList.length === 0) {
    recommendationsList.push(`Planejamento equilibrado. Mantenha o alinhamento com a estação.`);
  }

  const recommendation = recommendationsList.join(' ');

  // 3. Forecast (Condensed)
  let forecast = '';
  if (round === 1) {
    forecast = 'Rodada 2 (Inverno): Demanda por casacos e moletons vai multiplicar. Prepare matéria-prima e estoque.';
  } else if (round === 2) {
    forecast = 'Rodada 3 (Verão): Demanda migra para vestidos e peças leves. Rebalanceie o mix de produção.';
  } else {
    forecast = 'Simulação concluída! Veja suas métricas consolidadas e o Certificado Oficial no Relatório.';
  }

  // 4. Pedagogical Grades (0 to 10)
  let planningGrade = 7.5;
  if (maxStockRemaining > 500 || maxLostSales > 300) planningGrade -= 2.5;
  if (maxStockRemaining < 150 && maxLostSales < 100) planningGrade += 2.0;
  planningGrade = Math.min(10, Math.max(2, planningGrade));

  let financeGrade = 7.0;
  if (profit > 100000) financeGrade = 9.5;
  else if (profit > 50000) financeGrade = 8.5;
  else if (profit > 0) financeGrade = 7.5;
  else financeGrade = 4.0;
  if (underpricedProduct) financeGrade -= 2.0;

  let peopleGrade = Math.min(10, Math.max(3, (metrics.satisfaction / 10)));
  let innovationGrade = Math.min(10, Math.max(3, ((quality + efficiency) / 20)));

  const pedagogicalGrade: PedagogicalGrades = {
    planning: Math.round(planningGrade * 10) / 10,
    finance: Math.round(financeGrade * 10) / 10,
    people: Math.round(peopleGrade * 10) / 10,
    innovation: Math.round(innovationGrade * 10) / 10,
  };

  return {
    diagnostic,
    recommendation,
    forecast,
    pedagogicalGrade
  };
}

export function generateCouncilFeedback(
  _round: number,
  decision: PlayerDecision,
  metrics: RoundResult['playerMetrics'],
  _event: GameEvent | null
) {
  const profit = metrics.profit;
  const reputation = metrics.reputation;
  const quality = metrics.quality;
  const efficiency = metrics.efficiency;

  let worstStockProduct = '';
  let maxStockRemaining = 0;
  metrics.productResults.forEach((pr) => {
    if (pr.stockRemaining > maxStockRemaining) {
      maxStockRemaining = pr.stockRemaining;
      const p = products.find(prod => prod.id === pr.productId);
      worstStockProduct = p ? p.name : pr.productId;
    }
  });

  // Sr. Rocha (Diretor Financeiro)
  let rocha = '';
  if (profit > 80000) {
    rocha = `Excelente! Lucro de R$ ${profit.toLocaleString('pt-BR')} comprova solidez e gestão de caixa eficaz.`;
  } else if (profit < 0) {
    rocha = `Atenção: Prejuízo de R$ ${Math.abs(profit).toLocaleString('pt-BR')}. Corte desperdícios imediatamente!`;
  } else {
    rocha = `Resultado estável, mas precisamos buscar margens mais fortes na próxima rodada.`;
  }

  // Dra. Luna (Diretora de Marketing)
  let luna = '';
  if (decision.investments.marketing < 45000) {
    luna = `Com apenas R$ ${decision.investments.marketing.toLocaleString('pt-BR')} em Marketing, perdemos espaço para os rivais.`;
  } else if (reputation > 75) {
    luna = `Marca em alta! ${Math.round(reputation)} pontos de reputação mostram o acerto da divulgação.`;
  } else {
    luna = `Visibilidade contínua é essencial no vestuário. Otimize as campanhas.`;
  }

  // Eng. Vane (Diretora de Operações)
  let vane = '';
  if (maxStockRemaining > 500 && worstStockProduct) {
    vane = `Alerta fabril: ${maxStockRemaining} unidades encalhadas de **${worstStockProduct}**. Ajuste os lotes.`;
  } else if (quality > 75 && efficiency > 70) {
    vane = `Operações nota 10: Qualidade (${Math.round(quality)}) e eficiência (${Math.round(efficiency)}) no padrão premium.`;
  } else {
    vane = `Equilibre a compra de matéria-prima e logística para entregas rápidas.`;
  }

  return { rocha, luna, vane };
}

export function generateRoundNewspaper(
  round: number,
  metrics: RoundResult['playerMetrics'],
  event: GameEvent | null,
  rivalA: RoundResult['rivalA'],
  rivalB: RoundResult['rivalB']
): string {
  let text = '';
  if (round === 1) {
    text = `A Essenza abriu a temporada com faturamento de R$ ${metrics.revenue.toLocaleString('pt-BR')} e ${Math.round(metrics.marketShare * 100)}% de market share. `;
    if (event) text += `Cenário afetado por: "${event.title}". `;
    text += metrics.profit > 0 ? `Início consistente no mercado.` : `A empresa busca recuperação na próxima estação.`;
  } else if (round === 2) {
    text = `Na 2ª temporada, a receita somou R$ ${metrics.revenue.toLocaleString('pt-BR')}. `;
    if (rivalA.profit > metrics.profit && rivalA.profit > rivalB.profit) {
      text += `Rival A destacou-se em volume de vendas. `;
    } else if (rivalB.profit > metrics.profit) {
      text += `Rival B manteve margens premium. `;
    } else {
      text += `Essenza liderou em rentabilidade e market share. `;
    }
  } else {
    text = `Ciclo encerrado com saldo em caixa de R$ ${metrics.cash.toLocaleString('pt-BR')}. `;
    text += `A gestão conclui a jornada empresarial com domínio prático de mercado e finanças.`;
  }
  return text;
}

export function classifyManagementProfile(history: RoundResult[]): ManagementProfile {
  let totalMaterials = 0;
  let totalProduction = 0;
  let totalMarketing = 0;
  let totalLogistics = 0;
  let totalProfit = 0;
  let totalRevenue = 0;
  let finalCash = 500000;
  let avgQuality = 0;
  let avgReputation = 0;

  history.forEach((h) => {
    totalMaterials += h.playerDecision.investments.materials;
    totalProduction += h.playerDecision.investments.production;
    totalMarketing += h.playerDecision.investments.marketing;
    totalLogistics += h.playerDecision.investments.logistics;
    totalProfit += h.playerMetrics.profit;
    totalRevenue += h.playerMetrics.revenue;
    avgQuality += h.playerMetrics.quality;
    avgReputation += h.playerMetrics.reputation;
    finalCash = h.playerMetrics.cash;
  });

  const roundsCount = history.length || 1;
  avgQuality = Math.round(avgQuality / roundsCount);
  avgReputation = Math.round(avgReputation / roundsCount);

  const totalInv = totalMaterials + totalProduction + totalMarketing + totalLogistics;
  const prodPct = totalInv > 0 ? totalProduction / totalInv : 0;
  const mktPct = totalInv > 0 ? totalMarketing / totalInv : 0;
  const logPct = totalInv > 0 ? totalLogistics / totalInv : 0;
  const matPct = totalInv > 0 ? totalMaterials / totalInv : 0;

  if (totalProfit > 120000 && finalCash > 550000 && mktPct > 0.22) {
    return {
      profileName: 'CEO Estrategista de Alta Performance',
      emoji: '🏆',
      subtitle: 'Excelência Comercial, Margens Altas & Liderança',
      description: 'Gestão de altíssimo nível, unindo expansão de faturamento, marketing forte e preservação rigorosa do caixa.',
      strengths: [
        'Alto Retorno sobre Investimento (ROI)',
        'Sincronia entre produção, preço e demanda',
        'Crescimento veloz sem comprometer a liquidez'
      ],
      executiveAdvice: 'Mantenha os investimentos no valor da marca para criar barreiras sólidas contra os concorrentes.'
    };
  }

  if (avgQuality > 72 && avgReputation > 70 && matPct > 0.28) {
    return {
      profileName: 'Mestre do Posicionamento Premium',
      emoji: '💎',
      subtitle: 'Qualidade Superior, Experiência de Marca & Alto Valor',
      description: 'Foco na alta sofisticação, materiais nobres e fidelidade do cliente em vez de guerras predatórias de preços.',
      strengths: [
        'Forte construção de valor intangível da marca',
        'Lealdade e satisfação do consumidor exigente',
        'Margens unitárias protegidas'
      ],
      executiveAdvice: 'Lance coleções exclusivas de edição limitada para elevar ainda mais o ticket médio.'
    };
  }

  if (mktPct > 0.38 || (totalRevenue > 600000 && mktPct > 0.3)) {
    return {
      profileName: 'Líder Disruptivo & Expansão de Mercado',
      emoji: '🚀',
      subtitle: 'Marketing Agressivo, Tração & Domínio de Canais',
      description: 'Agressividade comercial marcante, utilizando a publicidade como principal alavanca para acelerar a receita.',
      strengths: [
        'Domínio ágil dos canais de divulgação',
        'Capacidade de capturar demanda rapidamente',
        'Crescimento expressivo de faturamento'
      ],
      executiveAdvice: 'Alinhe a capacidade fabril e estoque à força do marketing para evitar rupturas de pedidos.'
    };
  }

  if (finalCash > 580000 || totalInv < 200000) {
    return {
      profileName: 'Guardião da Saúde Financeira',
      emoji: '🛡️',
      subtitle: 'Preservação de Caixa, Disciplina & Baixo Risco',
      description: 'Gestão prudente e foco em liquidez, garantindo blindagem do capital e solvência contra qualquer imprevisto.',
      strengths: [
        'Excelente saúde financeira e caixa protegido',
        'Disciplina orçamentária e aversão a desperdícios',
        'Segurança contra oscilações de mercado'
      ],
      executiveAdvice: 'Reinvista pequenos percentuais do caixa em inovação para capturar ganhos ainda maiores.'
    };
  }

  if (prodPct > 0.34 || (logPct > 0.28 && prodPct > 0.28)) {
    return {
      profileName: 'Arquiteto da Eficiência Operacional',
      emoji: '⚙️',
      subtitle: 'Processos Otimizados, Logística Ágil & Escala',
      description: 'Foco na produtividade fabril, entrega rápida e controle minucioso da cadeia de suprimentos têxtil.',
      strengths: [
        'Controle de estoques e ritmo fabril eficiente',
        'Logística ágil e fluxo de entrega contínuo',
        'Domínio da cadeia de suprimentos (Supply Chain)'
      ],
      executiveAdvice: 'Reforce o marketing para garantir que a demanda absorva 100% da sua capacidade produtiva.'
    };
  }

  return {
    profileName: 'Arquiteto Estratégico Holístico',
    emoji: '🎯',
    subtitle: 'Visão 360°, Equilíbrio & Adaptabilidade',
    description: 'Equilíbrio consistente entre suprimentos, produção, divulgação e entrega com flexibilidade frente ao mercado.',
    strengths: [
      'Balanço harmônico entre receitas e despesas',
      'Boa capacidade de adaptação aos eventos sazonais',
      'Visão integrada de todas as áreas do negócio'
    ],
    executiveAdvice: 'Identifique o produto de maior rentabilidade da coleção e concentre nele seu investimento prioritário.'
  };
}
