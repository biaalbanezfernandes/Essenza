import type { RoundResult, PlayerDecision, GameEvent } from '../data/types';
import { products } from '../data/products';

export interface PedagogicalGrades {
  planning: number;
  finance: number;
  people: number;
  innovation: number;
}

export interface EntrepreneurProfileDef {
  id: 'visionario' | 'inovador' | 'gestor' | 'lider' | 'social' | 'pratico';
  title: string;
  emoji: string;
  shortSentence: string;
  pontoForte: string;
  risco: string;
  description: string;
  subtitle: string;
}

export interface ManagementProfile {
  profileName: string;
  emoji: string;
  subtitle: string;
  description: string;
  pontoForte: string;
  risco: string;
  personalizedExplanation: string;
  certificateSummary: string;
  strengths: string[];
  executiveAdvice: string;
  activeProfileId: 'visionario' | 'inovador' | 'gestor' | 'lider' | 'social' | 'pratico';
  allProfiles: EntrepreneurProfileDef[];
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

  // 4. Pedagogical Grades (0 to 10) - Real, dynamic calculations based on performance
  const totalSold = metrics.productResults.reduce((acc, curr) => acc + curr.sold, 0);
  const totalDemanded = metrics.productResults.reduce((acc, curr) => acc + curr.demanded, 0);
  const totalStockRemaining = metrics.productResults.reduce((acc, curr) => acc + curr.stockRemaining, 0);

  // A. Planejamento de Demanda & Estoque
  const sellThroughRate = totalProduced > 0 ? totalSold / totalProduced : 0.8;
  const fillRate = totalDemanded > 0 ? Math.min(1.0, totalSold / totalDemanded) : 0.8;
  const stockOverloadPenalty = totalProduced > 0 ? (totalStockRemaining / totalProduced) * 3.5 : 0;

  let seasonalityBonus = 0;
  if (round === 2) {
    const moletomRes = metrics.productResults.find(p => p.productId === 'moletom');
    if (moletomRes && moletomRes.produced >= 400) seasonalityBonus += 1.0;
    else if (moletomRes && moletomRes.produced < 200) seasonalityBonus -= 1.0;
  } else if (round === 3) {
    const vestidoRes = metrics.productResults.find(p => p.productId === 'vestido_linho');
    const moletomRes = metrics.productResults.find(p => p.productId === 'moletom');
    if (vestidoRes && vestidoRes.produced >= 350) seasonalityBonus += 1.0;
    if (moletomRes && moletomRes.produced > 350) seasonalityBonus -= 1.0;
  }

  let planningGrade = 4.0 + (sellThroughRate * 3.5) + (fillRate * 3.0) - stockOverloadPenalty + seasonalityBonus;
  planningGrade = Math.min(10, Math.max(2.0, Math.round(planningGrade * 10) / 10));

  // B. Gestão Financeira & Caixa
  let financeBase = 7.0;
  if (profit > 100000) financeBase = 9.5;
  else if (profit > 50000) financeBase = 8.5;
  else if (profit > 15000) financeBase = 7.8;
  else if (profit >= 0) financeBase = 7.0;
  else if (profit > -30000) financeBase = 5.5;
  else financeBase = 3.5;

  if (metrics.cash >= 450000) financeBase += 0.5;
  if (metrics.cash < 150000) financeBase -= 1.5;
  if (underpricedProduct) financeBase -= 2.0;
  else if (thinMarginProduct) financeBase -= 0.6;
  const financeGrade = Math.min(10, Math.max(2.0, Math.round(financeBase * 10) / 10));

  // C. Liderança & Gestão de Pessoas
  let peopleBase = (metrics.satisfaction / 10) * 0.7 + (Math.min(50000, decision.investments.logistics) / 50000) * 3.0;
  const peopleGrade = Math.min(10, Math.max(2.0, Math.round(peopleBase * 10) / 10));

  // D. Inovação Operacional & Qualidade
  let innovationBase = (quality * 0.5 + efficiency * 0.3 + metrics.innovation * 0.2) / 10;
  const innovationGrade = Math.min(10, Math.max(2.0, Math.round(innovationBase * 10) / 10));

  const pedagogicalGrade: PedagogicalGrades = {
    planning: planningGrade,
    finance: financeGrade,
    people: peopleGrade,
    innovation: innovationGrade,
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

export const ALL_ENTREPRENEUR_PROFILES: EntrepreneurProfileDef[] = [
  {
    id: 'visionario',
    title: 'CEO Estrategista & Visionário',
    emoji: '🚀',
    shortSentence: 'Pensa no longo prazo e enxerga tendências antes dos concorrentes.',
    pontoForte: 'Estratégia',
    risco: 'Apostar demais no futuro e esquecer o presente',
    description: 'Pensa no longo prazo. Enxerga tendências antes dos concorrentes. Gosta de expansão e grandes projetos.',
    subtitle: 'Visão de Futuro, Tendências & Expansão Comercial'
  },
  {
    id: 'inovador',
    title: 'Mestre do Posicionamento Inovador',
    emoji: '💡',
    shortSentence: 'Busca produtos, processos e soluções diferentes com tecnologia e experimentação.',
    pontoForte: 'Criatividade',
    risco: 'Ter muitas ideias e pouca execução',
    description: 'Busca produtos, processos e soluções diferentes. Gosta de tecnologia e experimentação. Está sempre tentando melhorar o negócio.',
    subtitle: 'Criatividade, Sofisticação & Experimentação Inovadora'
  },
  {
    id: 'gestor',
    title: 'Guardião da Gestão & Finanças',
    emoji: '📊',
    shortSentence: 'Focado em organização, processos, custos e decisões baseadas em dados.',
    pontoForte: 'Eficiência',
    risco: 'Ser excessivamente conservador',
    description: 'Focado em organização, processos e números. Controla custos, estoque, funcionários e resultados. Prefere decisões baseadas em dados.',
    subtitle: 'Organização, Controle de Custos & Preservação de Caixa'
  },
  {
    id: 'lider',
    title: 'Líder Inspiracional & Pessoas',
    emoji: '🤝',
    shortSentence: 'Prioriza pessoas, equipes e relacionamentos, valorizando networking e parcerias.',
    pontoForte: 'Liderança',
    risco: 'Tomar decisões pensando demais em agradar os outros',
    description: 'Prioriza pessoas, equipes e relacionamentos. Sabe negociar e motivar funcionários. Valoriza networking e parcerias.',
    subtitle: 'Gestão de Pessoas, Motivação & Parcerias Estratégicas'
  },
  {
    id: 'social',
    title: 'Arquiteto Estratégico Holístico',
    emoji: '🎯',
    shortSentence: 'Equilíbrio consistente entre suprimentos, produção, divulgação, finanças e propósito.',
    pontoForte: 'Visão 360°',
    risco: 'Dividir foco entre muitas áreas sem concentração prioritária',
    description: 'Equilíbrio consistente entre suprimentos, produção, divulgação e entrega com flexibilidade frente ao mercado e compromisso social.',
    subtitle: 'Equilíbrio consistente entre suprimentos, produção, divulgação e entrega com flexibilidade frente ao mercado.'
  },
  {
    id: 'pratico',
    title: 'Arquiteto da Eficiência Operacional',
    emoji: '⚡',
    shortSentence: 'Focado em resultados imediatos e execução rápida com mão na massa.',
    pontoForte: 'Agilidade',
    risco: 'Tomar decisões rápidas sem analisar suficientemente as consequências',
    description: 'Focado em resultados imediatos e execução. Identifica um problema e tenta resolvê-lo rapidamente. Tem facilidade para colocar a mão na massa.',
    subtitle: 'Processos Otimizados, Logística Ágil & Escala Fabril'
  }
];

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
  let avgPeople = 0;
  let avgInnovation = 0;
  let avgFinance = 0;
  let avgPlanning = 0;
  let maxStockRemaining = 0;

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

    if (h.ssisFeedback && h.ssisFeedback.pedagogicalGrade) {
      avgPeople += h.ssisFeedback.pedagogicalGrade.people;
      avgInnovation += h.ssisFeedback.pedagogicalGrade.innovation;
      avgFinance += h.ssisFeedback.pedagogicalGrade.finance;
      avgPlanning += h.ssisFeedback.pedagogicalGrade.planning;
    }

    h.playerMetrics.productResults.forEach((pr) => {
      if (pr.stockRemaining > maxStockRemaining) {
        maxStockRemaining = pr.stockRemaining;
      }
    });
  });

  const roundsCount = history.length || 1;
  avgQuality = Math.round(avgQuality / roundsCount);
  avgReputation = Math.round(avgReputation / roundsCount);
  avgPeople = Math.round((avgPeople / roundsCount) * 10) / 10;
  avgInnovation = Math.round((avgInnovation / roundsCount) * 10) / 10;
  avgFinance = Math.round((avgFinance / roundsCount) * 10) / 10;
  avgPlanning = Math.round((avgPlanning / roundsCount) * 10) / 10;

  const totalInv = totalMaterials + totalProduction + totalMarketing + totalLogistics;
  const prodPct = totalInv > 0 ? totalProduction / totalInv : 0;
  const mktPct = totalInv > 0 ? totalMarketing / totalInv : 0;
  const logPct = totalInv > 0 ? totalLogistics / totalInv : 0;
  const matPct = totalInv > 0 ? totalMaterials / totalInv : 0;

  // Balanced, sensitive profile scoring (0 - 100+ scale based on signature strengths)
  const invVariance = Math.max(prodPct, mktPct, matPct, logPct) - Math.min(prodPct, mktPct, matPct, logPct);
  const isBalancedPortfolio = invVariance <= 0.16;

  const scores: Record<EntrepreneurProfileDef['id'], number> = {
    // Visionário: Lidera em Marketing, faturamento bruto e expansão de mercado
    visionario: (mktPct * 165) + ((totalRevenue / 500000) * 30) + ((avgReputation / 100) * 25),

    // Inovador: Lidera em Matéria-Prima de alta qualidade, padrão de excelência e inovação
    inovador: (matPct * 165) + ((avgQuality / 100) * 35) + ((avgInnovation / 10) * 30),

    // Gestor: Lidera em Preservação de Caixa, Eficiência Financeira e Controle de Estoque
    gestor: (avgFinance * 6.5) + (avgPlanning * 3.5) + (finalCash >= 520000 ? 25 : finalCash >= 480000 ? 10 : 0) + (maxStockRemaining < 200 ? 15 : 0) + (mktPct < 0.25 ? 15 : 0),

    // Líder: Lidera em Gestão de Pessoas, Logística de entrega e Clima Organizacional
    lider: (logPct * 155) + (avgPeople * 7.5) + ((avgReputation / 100) * 25),

    // Prático: Lidera em Produção Fabril, agilidade de vazão e vendas imediatas
    pratico: (prodPct * 165) + ((totalRevenue / 500000) * 30) + (avgPlanning * 2.5),

    // Social: Lidera em Equilíbrio 360°, consistência entre todas as áreas e alta reputação
    social: (isBalancedPortfolio ? 55 : 5) + (avgPeople * 5.0) + ((avgReputation / 100) * 30) + (totalProfit > 0 ? 15 : 0),
  };

  let bestId: EntrepreneurProfileDef['id'] = 'gestor' as EntrepreneurProfileDef['id'];
  let maxScore = -1;

  (Object.keys(scores) as Array<EntrepreneurProfileDef['id']>).forEach((id) => {
    if (scores[id] > maxScore) {
      maxScore = scores[id];
      bestId = id;
    }
  });

  const activeProfile = ALL_ENTREPRENEUR_PROFILES.find(p => p.id === bestId) || ALL_ENTREPRENEUR_PROFILES[0];

  let personalizedExplanation = '';
  let certificateSummary = '';
  let strengths: string[] = [];
  let executiveAdvice = '';

  switch (bestId) {
    case 'visionario':
      personalizedExplanation = `Sua gestão destacou-se por antecipar tendências e apostar forte na expansão da marca. Ao longo das ${roundsCount} rodadas, você alocou R$ ${totalMarketing.toLocaleString('pt-BR')} em estratégias de marketing e posicionamento, impulsionando o faturamento acumulado da Essenza para R$ ${totalRevenue.toLocaleString('pt-BR')} (Lucro de R$ ${totalProfit.toLocaleString('pt-BR')}) com nota pedagógica de planejamento em ${avgPlanning}/10.`;
      certificateSummary = `Demonstrou visão de futuro e gestão estratégica de expansão: alocou R$ ${totalMarketing.toLocaleString('pt-BR')} em marketing e impulsionou o faturamento para R$ ${totalRevenue.toLocaleString('pt-BR')}.`;
      strengths = ['Visão de expansão comercial', 'Forte presença de marca', 'Antecipação de oportunidades'];
      executiveAdvice = 'Consolide os custos operacionais do presente para dar base sólida aos projetos futuros.';
      break;

    case 'inovador':
      personalizedExplanation = `Sua trajetória foi guiada pela busca de sofisticação e excelência de produto. Você destinou R$ ${totalMaterials.toLocaleString('pt-BR')} para matérias-primas nobres, alcançando ${avgQuality}% de padrão de qualidade, nota de inovação pedagógica ${avgInnovation}/10 e gerando R$ ${totalRevenue.toLocaleString('pt-BR')} em receita.`;
      certificateSummary = `Demonstrou elevado padrão de sofisticação e inovação contínua: destinou R$ ${totalMaterials.toLocaleString('pt-BR')} em matérias-primas e atingiu ${avgQuality}% de qualidade.`;
      strengths = ['Sofisticação de produto', 'Padrão elevado de qualidade', 'Identidade única de mercado'];
      executiveAdvice = 'Assegure que as inovações se traduzam em execução prática e margens de lucro sustentáveis.';
      break;

    case 'gestor':
      personalizedExplanation = `Sua liderança destacou-se pela disciplina analítica, controle de números e foco em liquidez. Você encerrou a simulação preservando R$ ${finalCash.toLocaleString('pt-BR')} em caixa disponível, com baixo nível de desperdício em estoque e nota pedagógica de gestão financeira em ${avgFinance}/10.`;
      certificateSummary = `Demonstrou controle rigoroso de caixa e excelência na gestão financeira: preservou R$ ${finalCash.toLocaleString('pt-BR')} em liquidez e obteve nota ${avgFinance}/10 em finanças.`;
      strengths = ['Excelente controle de liquidez', 'Decisões embasadas em dados', 'Rigor e aversão a desperdícios'];
      executiveAdvice = 'Reinvista fatias calculadas do caixa para acelerar o crescimento do negócio.';
      break;

    case 'lider':
      personalizedExplanation = `Sua condução priorizou a motivação da equipe, o clima organizacional e a consolidação de parcerias comerciais. Alcançou nota pedagógica de pessoas em ${avgPeople}/10 e manteve equilíbrio operacional ao investir R$ ${totalLogistics.toLocaleString('pt-BR')} em logística de entregas.`;
      certificateSummary = `Demonstrou habilidade exemplar em gestão de pessoas e alianças de mercado: alcançou nota de liderança ${avgPeople}/10 e fortaleceu a cadeia logística.`;
      strengths = ['Gestão e motivação de equipe', 'Parcerias na cadeia de suprimentos', 'Alta reputação institucional'];
      executiveAdvice = 'Mantenha a firmeza em decisões difíceis de caixa sem receio de impopularidade.';
      break;

    case 'social':
      personalizedExplanation = `Você demonstrou equilíbrio holístico consistente em todas as frentes do negócio, unindo forte desempenho financeiro (Faturamento de R$ ${totalRevenue.toLocaleString('pt-BR')}, Lucro de R$ ${totalProfit.toLocaleString('pt-BR')}) com alta reputação institucional (${avgReputation} pts) e compromisso humano.`;
      certificateSummary = `Demonstrou visão 360° e equilíbrio consistente em todas as áreas do negócio: conciliou suprimentos, produção, divulgação e entrega com flexibilidade frente ao mercado.`;
      strengths = ['Visão integrada 360° do negócio', 'Equilíbrio entre vendas e pessoas', 'Boa capacidade de adaptação'];
      executiveAdvice = 'Identifique o produto de maior rentabilidade e concentre nele seus investimentos prioritários.';
      break;

    case 'pratico':
    default:
      personalizedExplanation = `Sua marca principal foi a agilidade e capacidade de execução fabril imediata. Diante dos desafios de cada estação, você alocou R$ ${totalProduction.toLocaleString('pt-BR')} no ritmo produtivo da fábrica, garantindo vazão aos pedidos e gerando R$ ${totalRevenue.toLocaleString('pt-BR')} em faturamento.`;
      certificateSummary = `Demonstrou alta agilidade operacional e capacidade de execução fabril: investiu R$ ${totalProduction.toLocaleString('pt-BR')} em produção e assegurou vazão comercial imediata.`;
      strengths = ['Agilidade na solução de problemas', 'Execução fabril rápida', 'Foco em vazão e vendas imediatas'];
      executiveAdvice = 'Reserve momentos entre as rodadas para planejar cenários preventivos de longo prazo.';
      break;
  }

  return {
    profileName: activeProfile.title,
    emoji: activeProfile.emoji,
    subtitle: activeProfile.subtitle,
    description: activeProfile.description,
    pontoForte: activeProfile.pontoForte,
    risco: activeProfile.risco,
    personalizedExplanation,
    certificateSummary,
    strengths,
    executiveAdvice,
    activeProfileId: activeProfile.id,
    allProfiles: ALL_ENTREPRENEUR_PROFILES
  };
}
