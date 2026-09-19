import type { RoundResult, PlayerDecision, GameEvent, SsisInsight } from '../data/types';
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

export interface OptimalBudgetSuggestion {
  materials: number;
  production: number;
  marketing: number;
  logistics: number;
  totalAllocated: number;
  reserveCash: number;
  explanation: string;
}

export function suggestOptimalBudgetDistribution(round: number, cash: number): OptimalBudgetSuggestion {
  const targetAllocationRatio = 0.72;
  const allocableCash = Math.floor(cash * targetAllocationRatio);

  let matPct = 0.32;
  let prodPct = 0.32;
  let mktPct = 0.22;
  let logPct = 0.14;

  if (round === 2) {
    matPct = 0.34;
    prodPct = 0.34;
    mktPct = 0.18;
    logPct = 0.14;
  } else if (round === 3) {
    matPct = 0.31;
    prodPct = 0.31;
    mktPct = 0.23;
    logPct = 0.15;
  }

  const materials = Math.round((allocableCash * matPct) / 1000) * 1000;
  const production = Math.round((allocableCash * prodPct) / 1000) * 1000;
  const marketing = Math.round((allocableCash * mktPct) / 1000) * 1000;
  const logistics = Math.round((allocableCash * logPct) / 1000) * 1000;
  const totalAllocated = materials + production + marketing + logistics;
  const reserveCash = cash - totalAllocated;

  const explanation = `IA distribuiu R$ ${totalAllocated.toLocaleString('pt-BR')} (72% do caixa) em Matéria-Prima (${Math.round(matPct*100)}%), Produção (${Math.round(prodPct*100)}%), Marketing (${Math.round(mktPct*100)}%) e Logística (${Math.round(logPct*100)}%), preservando R$ ${reserveCash.toLocaleString('pt-BR')} em reserva de emergência.`;

  return {
    materials,
    production,
    marketing,
    logistics,
    totalAllocated,
    reserveCash,
    explanation
  };
}

export function suggestOptimalPricingAndProduction(round: number): {
  prices: Record<string, number>;
  productionQty: Record<string, number>;
  explanation: string;
} {
  const prices: Record<string, number> = {
    camiseta_basica: 39.90,
    polo_essenza: 74.90,
    moletom: 119.90,
    calca_jeans: 129.90,
    vestido_linho: 109.90,
    kit_meia_cueca: 44.90,
  };

  let productionQty: Record<string, number> = {
    camiseta_basica: 1000,
    polo_essenza: 800,
    moletom: 800,
    calca_jeans: 800,
    vestido_linho: 700,
    kit_meia_cueca: 900,
  };

  let explanation = '';

  if (round === 1) {
    explanation = 'Rodada 1 (Outono): Preços ajustados para margem de ~45% e lotes equilibrados de entrada.';
  } else if (round === 2) {
    productionQty = {
      camiseta_basica: 900,
      polo_essenza: 600,
      moletom: 1600,
      calca_jeans: 900,
      vestido_linho: 300,
      kit_meia_cueca: 800,
    };
    explanation = 'Rodada 2 (Inverno): Foco na produção de Moletom (1.600 un.) e redução de Vestido de Linho para evitar encalhe.';
  } else if (round === 3) {
    productionQty = {
      camiseta_basica: 1400,
      polo_essenza: 900,
      moletom: 250,
      calca_jeans: 700,
      vestido_linho: 1600,
      kit_meia_cueca: 1000,
    };
    explanation = 'Rodada 3 (Verão): Maximização de Vestido de Linho (1.600 un.) e Camiseta Básica (1.400 un.) para capturar o pico do calor.';
  }

  return { prices, productionQty, explanation };
}

export function getLiveSsisAdvice(round: number, decision: PlayerDecision, cash: number): SsisInsight {
  const totalInvestments = decision.investments.materials + decision.investments.production + decision.investments.marketing + decision.investments.logistics;

  // Calculate live capacity requirements
  const rawMaterialRequired = products.reduce((acc, p) => {
    const qty = decision.productionQty[p.id] || 0;
    return acc + (qty * p.productionCost * 0.5);
  }, 0);

  const laborRequired = products.reduce((acc, p) => {
    const qty = decision.productionQty[p.id] || 0;
    return acc + (qty * p.productionCost * 0.5);
  }, 0);

  if (totalInvestments > cash * 0.90) {
    return {
      type: 'critical',
      recommendation: 'Reduza os investimentos fixos.',
      justification: `Você alocou R$ ${totalInvestments.toLocaleString('pt-BR')} (${Math.round((totalInvestments/cash)*100)}% do caixa). Há risco extremo de insolvência se houver oscilações nas vendas.`,
      riskLevel: 'Alto',
      confidence: 98,
      suggestedAction: { field: 'investments.production', value: decision.investments.production * 0.75 }
    };
  }

  if (totalInvestments < cash * 0.15) {
    return {
      type: 'warning',
      recommendation: 'Aumente o investimento operacional.',
      justification: `Apenas R$ ${totalInvestments.toLocaleString('pt-BR')} (${Math.round((totalInvestments/cash)*100)}% do caixa) foi alocado. O orçamento está muito conservador e limitará as vendas.`,
      riskLevel: 'Médio',
      confidence: 88
    };
  }

  if (rawMaterialRequired > decision.investments.materials) {
    return {
      type: 'warning',
      recommendation: 'Aumente o investimento em Matéria-Prima.',
      justification: `Os lotes programados exigem R$ ${rawMaterialRequired.toLocaleString('pt-BR')} em matérias-primas, mas você investiu apenas R$ ${decision.investments.materials.toLocaleString('pt-BR')}. Há risco de paralisação na produção.`,
      riskLevel: 'Alto',
      confidence: 94,
      suggestedAction: { field: 'investments.materials', value: Math.ceil(rawMaterialRequired / 1000) * 1000 }
    };
  }

  if (laborRequired > decision.investments.production) {
    return {
      type: 'warning',
      recommendation: 'Reforce a verba de Produção & Salários.',
      justification: `A mão de obra dos lotes atuais exige R$ ${laborRequired.toLocaleString('pt-BR')}, superando os R$ ${decision.investments.production.toLocaleString('pt-BR')} alocados.`,
      riskLevel: 'Alto',
      confidence: 92,
      suggestedAction: { field: 'investments.production', value: Math.ceil(laborRequired / 1000) * 1000 }
    };
  }

  let underpricedProduct = '';
  let underpricedCost = 0;
  for (const prod of products) {
    const price = decision.prices[prod.id] || prod.defaultPrice;
    if (price < prod.productionCost) {
      underpricedProduct = prod.name;
      underpricedCost = prod.productionCost;
      break;
    }
  }

  if (underpricedProduct) {
    return {
      type: 'warning',
      recommendation: `Aumente o preço de venda de ${underpricedProduct}.`,
      justification: `O preço atual não cobre o custo de produção (R$ ${underpricedCost.toFixed(2)}). Cada unidade vendida gerará prejuízo direto.`,
      riskLevel: 'Alto',
      confidence: 99,
    };
  }

  if (decision.investments.marketing < 30000) {
    return {
      type: 'warning',
      recommendation: 'Aumente o orçamento de Marketing.',
      justification: 'Com marketing abaixo de R$ 30.000,00, a visibilidade da marca na Smart City pode despencar frente aos rivais.',
      riskLevel: 'Médio',
      confidence: 85,
      suggestedAction: { field: 'investments.marketing', value: 45000 }
    };
  }

  if (round === 2) {
    const moletomProd = decision.productionQty['moletom'] || 0;
    if (moletomProd < 1000) {
      return {
        type: 'opportunity',
        recommendation: 'Aumente agressivamente a produção de Moletom para a Frente Fria.',
        justification: `Você programou ${moletomProd} unidades. A previsão climática indica demanda de mais de 1.800 unidades no Inverno.`,
        riskLevel: 'Baixo',
        confidence: 93,
        suggestedAction: { field: 'productionQty.moletom', value: 1600 }
      };
    }
  }

  if (round === 3) {
    const vestidoProd = decision.productionQty['vestido_linho'] || 0;
    if (vestidoProd < 1000) {
      return {
        type: 'opportunity',
        recommendation: 'Maximize a produção de Vestido de Linho para o Verão.',
        justification: `Você programou ${vestidoProd} unidades. O calor extremo fará a procura por peças leves explodir.`,
        riskLevel: 'Baixo',
        confidence: 91,
        suggestedAction: { field: 'productionQty.vestido_linho', value: 1600 }
      };
    }
  }

  return {
    type: 'opportunity',
    recommendation: 'Planejamento e alocação operacional equilibrados.',
    justification: `Alocação total de R$ ${totalInvestments.toLocaleString('pt-BR')} com saldo livre de R$ ${(cash - totalInvestments).toLocaleString('pt-BR')}. Clique em "Distribuir Orçamento via IA" se desejar alocação otimizada automática.`,
    riskLevel: 'Baixo',
    confidence: 95
  };
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

  // Construct a rich, personalized executive diagnostic
  // 1. Ultra-concise Diagnostic Bullet Points
  const diagBullets: string[] = [];

  if (topRevenueProduct) {
    diagBullets.push(`🎯 Destaque: **${topRevenueProduct}** liderou seu faturamento (R$ ${maxRevenue.toLocaleString('pt-BR')}).`);
  }

  if (maxStockRemaining > 150 && worstStockProduct) {
    diagBullets.push(`⚠️ Alerta: **${worstStockProduct}** teve ${maxStockRemaining} un. paradas em estoque.`);
  } else if (underpricedProduct) {
    diagBullets.push(`⚠️ Alerta: **${underpricedProduct}** foi vendido com margem negativa.`);
  } else if (maxLostSales > 100 && worstLostSalesProduct) {
    diagBullets.push(`📦 Demanda: ~${Math.round(maxLostSales)} pedidos de **${worstLostSalesProduct}** não foram atendidos.`);
  }

  if (event) {
    diagBullets.push(`⚡ Evento: "${event.title}" impactou o mercado.`);
  }

  if (profit > 0) {
    diagBullets.push(`📊 Resultado: **Lucro de R$ ${profit.toLocaleString('pt-BR')}** (${profit > maxCompetitorProfit ? 'Você liderou!' : `Líder: ${bestCompetitorName}`}).`);
  } else {
    diagBullets.push(`📊 Resultado: **Prejuízo de R$ ${Math.abs(profit).toLocaleString('pt-BR')}** (Líder: ${bestCompetitorName}).`);
  }

  const diagnostic = diagBullets.join('\n');

  // 2. Personalized Recommendations (Concise Bullet Points)
  const recBullets: string[] = [];

  if (underpricedProduct) {
    recBullets.push(`• Suba o preço de **${underpricedProduct}** (está vendendo com prejuízo).`);
  } else if (thinMarginProduct) {
    recBullets.push(`• Reajuste o preço de **${thinMarginProduct}** (margem de apenas ${thinMarginVal.toFixed(1)}%).`);
  }

  if (maxLostSales > 120 && worstLostSalesProduct) {
    recBullets.push(`• Aumente o lote de **${worstLostSalesProduct}** (demanda reprimida).`);
  }

  if (maxStockRemaining > 250 && worstStockProduct) {
    recBullets.push(`• Reduza a produção de **${worstStockProduct}** para zerar o estoque.`);
  }

  if (recBullets.length === 0) {
    recBullets.push(`• Excelente alinhamento! Mantenha a atenção nas mudanças de estação.`);
  }

  const recommendation = recBullets.join('\n');

  // 3. Forecast (Ultra-concise & Direct)
  let forecast = '';
  if (round === 1) {
    forecast = '❄️ Rodada 2 (Inverno): Demanda por **MOLETOM** vai disparar (1.800+ un.). Reduza **VESTIDO DE LINHO** (< 500 un.).';
  } else if (round === 2) {
    forecast = '☀️ Rodada 3 (Verão): Demanda por **VESTIDO DE LINHO** e **CAMISETA** dispara (1.800+ un.). Reduza **MOLETOM** (< 400 un.).';
  } else {
    forecast = '🏆 Simulação Concluída! Confira seu Balanço Consolidado e Certificado Oficial.';
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

  // B. Gestão Financeira & Caixa (Rewarding realistic profitability)
  let financeBase = 7.0;
  if (profit > 100000) financeBase = 9.8;
  else if (profit > 50000) financeBase = 9.0;
  else if (profit > 15000) financeBase = 8.2;
  else if (profit >= 0) financeBase = 7.5;
  else if (profit > -30000) financeBase = 5.5;
  else financeBase = 4.0;

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

    if (h.ssisInteraction) {
      if (h.ssisInteraction.userFollowedRecommendation) {
        avgFinance += 0.5;
        avgPlanning += 0.5;
      } else if (h.ssisInteraction.userFollowedRecommendation === false) {
        if (h.playerMetrics.profit > 0) {
          avgInnovation += 0.8;
          avgReputation += 5;
        } else {
          avgPlanning -= 1.0;
        }
      }
    }
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

export interface StrategicBalanceReport {
  score: number;
  statusLabel: string;
  bottlenecks: string[];
  tips: string[];
  eventImpact: string | null;
  eventActionableAdvice: string | null;
  targetRanges: {
    materials: { min: number; max: number; label: string };
    production: { min: number; max: number; label: string };
    marketing: { min: number; max: number; label: string };
    logistics: { min: number; max: number; label: string };
  };
}

export function calculateStrategicBalance(
  round: number,
  decision: PlayerDecision,
  currentCash: number,
  activeEvent?: GameEvent | null
): StrategicBalanceReport {
  const totalInv = 
    decision.investments.materials + 
    decision.investments.production + 
    decision.investments.marketing + 
    decision.investments.logistics;

  let matPct = [0.30, 0.40];
  let prodPct = [0.25, 0.35];
  let mktPct = [0.15, 0.25];
  let logPct = [0.10, 0.15];

  if (round === 2) {
    matPct = [0.35, 0.45];
    prodPct = [0.30, 0.40];
    mktPct = [0.15, 0.20];
    logPct = [0.10, 0.15];
  } else if (round === 3) {
    matPct = [0.25, 0.35];
    prodPct = [0.25, 0.35];
    mktPct = [0.20, 0.30];
    logPct = [0.15, 0.20];
  }

  const targetRanges = {
    materials: {
      min: Math.round(currentCash * matPct[0]),
      max: Math.round(currentCash * matPct[1]),
      label: `R$ ${Math.round(currentCash * matPct[0] / 1000)}k – R$ ${Math.round(currentCash * matPct[1] / 1000)}k`
    },
    production: {
      min: Math.round(currentCash * prodPct[0]),
      max: Math.round(currentCash * prodPct[1]),
      label: `R$ ${Math.round(currentCash * prodPct[0] / 1000)}k – R$ ${Math.round(currentCash * prodPct[1] / 1000)}k`
    },
    marketing: {
      min: Math.round(currentCash * mktPct[0]),
      max: Math.round(currentCash * mktPct[1]),
      label: `R$ ${Math.round(currentCash * mktPct[0] / 1000)}k – R$ ${Math.round(currentCash * mktPct[1] / 1000)}k`
    },
    logistics: {
      min: Math.round(currentCash * logPct[0]),
      max: Math.round(currentCash * logPct[1]),
      label: `R$ ${Math.round(currentCash * logPct[0] / 1000)}k – R$ ${Math.round(currentCash * logPct[1] / 1000)}k`
    }
  };

  const bottlenecks: string[] = [];
  const tips: string[] = [];
  let score = 100;

  // 1. Check Total Budget & Insolvency
  if (totalInv > currentCash) {
    score -= 40;
    bottlenecks.push(`Orçamento de R$ ${totalInv.toLocaleString('pt-BR')} excede o caixa (R$ ${currentCash.toLocaleString('pt-BR')}).`);
    tips.push('Reduza seus investimentos totais para evitar falência imediata.');
  } else if (totalInv < currentCash * 0.35) {
    score -= 20;
    bottlenecks.push('Baixa utilização do caixa (Empresa operando com freio de mão puxado).');
    tips.push('Aumente os investimentos estratégicos para acelerar as vendas.');
  }

  // 2. Check Zero Investments
  if (decision.investments.materials === 0) {
    score -= 25;
    bottlenecks.push('Investimento em Matéria-Prima está ZERADO.');
    tips.push('Aloque recursos em Matéria-Prima para que a fábrica consiga produzir.');
  }
  if (decision.investments.production === 0) {
    score -= 25;
    bottlenecks.push('Investimento em Produção & Salários está ZERADO.');
    tips.push('Aloque verba em Produção para pagar os operários e máquinas.');
  }
  if (decision.investments.marketing === 0) {
    score -= 15;
    bottlenecks.push('Investimento em Marketing Comercial está ZERADO.');
    tips.push('Aloque verba em Marketing para atrair clientes e gerar demanda.');
  }
  if (decision.investments.logistics === 0) {
    score -= 10;
    bottlenecks.push('Investimento em Logística está ZERADO.');
    tips.push('Aloque recursos em Logística para garantir entregas no prazo.');
  }

  // 3. Category Deviations from Recommended Ranges
  const categories = [
    { key: 'materials', name: 'Matéria-Prima', val: decision.investments.materials, range: targetRanges.materials },
    { key: 'production', name: 'Produção', val: decision.investments.production, range: targetRanges.production },
    { key: 'marketing', name: 'Marketing', val: decision.investments.marketing, range: targetRanges.marketing },
    { key: 'logistics', name: 'Logística', val: decision.investments.logistics, range: targetRanges.logistics },
  ];

  categories.forEach(cat => {
    if (cat.val > 0) {
      if (cat.val < cat.range.min) {
        const diffRatio = (cat.range.min - cat.val) / cat.range.min;
        const penalty = Math.round(diffRatio * 15);
        score -= penalty;
        if (penalty > 4 && bottlenecks.length < 4) {
          bottlenecks.push(`Investimento em ${cat.name} (R$ ${(cat.val/1000).toFixed(0)}k) está abaixo da faixa recomendada.`);
        }
      } else if (cat.val > cat.range.max) {
        const diffRatio = (cat.val - cat.range.max) / cat.range.max;
        const penalty = Math.round(diffRatio * 12);
        score -= penalty;
        if (penalty > 4 && bottlenecks.length < 4) {
          bottlenecks.push(`Investimento em ${cat.name} (R$ ${(cat.val/1000).toFixed(0)}k) está acima da faixa sugerida.`);
        }
      }
    }
  });

  // 4. Production Quantities vs Material & Labor Insumos
  let totalRawMatNeeded = 0;
  let totalLaborNeeded = 0;
  let totalUnitsToProduce = 0;

  products.forEach(p => {
    const qty = decision.productionQty[p.id] || 0;
    totalUnitsToProduce += qty;
    totalRawMatNeeded += qty * (p.productionCost * 0.45);
    totalLaborNeeded += qty * (p.productionCost * 0.45);
  });

  if (totalUnitsToProduce > 0) {
    if (totalRawMatNeeded > decision.investments.materials) {
      score -= 20;
      bottlenecks.push(`Matéria-Prima necessária (R$ ${Math.round(totalRawMatNeeded/1000)}k) supera a verba alocada.`);
      tips.push('Aumente a Matéria-Prima no slider ou diminua os lotes de produção.');
    }
    if (totalLaborNeeded > decision.investments.production) {
      score -= 20;
      bottlenecks.push(`Mão de Obra necessária (R$ ${Math.round(totalLaborNeeded/1000)}k) supera a verba de Produção.`);
      tips.push('Aumente o slider de Produção/Salários ou reduza os lotes.');
    }
  } else {
    score -= 30;
    bottlenecks.push('Nenhum lote de produto foi configurado para produção.');
    tips.push('Defina a quantidade de produção de pelo menos um produto.');
  }

  // 5. Pricing checks
  products.forEach(p => {
    const qty = decision.productionQty[p.id] || 0;
    const price = decision.prices[p.id] || p.defaultPrice;
    if (qty > 0) {
      if (price < p.productionCost) {
        score -= 15;
        bottlenecks.push(`Preço do produto ${p.name} (R$ ${price}) está abaixo do custo de produção (R$ ${p.productionCost})!`);
        tips.push(`Aumente o preço de ${p.name} para garantir margem de lucro.`);
      } else if (price > p.productionCost * 3.5) {
        score -= 8;
        bottlenecks.push(`Preço de ${p.name} (R$ ${price}) é excessivo e reduzirá a demanda.`);
      }
    }
  });

  // 6. Active Event Impact Analysis
  let eventImpact: string | null = null;
  let eventActionableAdvice: string | null = null;

  if (activeEvent) {
    eventImpact = `📢 Evento "${activeEvent.title}": ${activeEvent.description}`;
    eventActionableAdvice = getEventActionableGuidance(activeEvent);

    if (activeEvent.type === 'negative') {
      if (activeEvent.category === 'materials' && decision.investments.materials < targetRanges.materials.min) {
        score -= 10;
        bottlenecks.push(`Evento Adverso (${activeEvent.title}): Aumente Matéria-Prima para conter custos.`);
      } else if (activeEvent.category === 'logistics' && decision.investments.logistics < targetRanges.logistics.min) {
        score -= 10;
        bottlenecks.push(`Evento Adverso (${activeEvent.title}): Reforce a Logística para conter atrasos.`);
      }
    } else if (activeEvent.type === 'positive') {
      if (activeEvent.category === 'marketing' && decision.investments.marketing < targetRanges.marketing.min) {
        tips.push(`Aproveite o evento "${activeEvent.title}" aumentando o investimento em Marketing.`);
      }
    }
  }

  score = Math.max(0, Math.min(100, score));

  let statusLabel = 'Excelente';
  if (score < 45) statusLabel = 'Alto Risco';
  else if (score < 70) statusLabel = 'Atenção';
  else if (score < 88) statusLabel = 'Equilibrado';

  if (tips.length === 0) {
    tips.push('Excelente trabalho de gestão! Suas alocações e preços estão bem equilibrados.');
  }

  return {
    score,
    statusLabel,
    bottlenecks,
    tips,
    eventImpact,
    eventActionableAdvice,
    targetRanges
  };
}

export function getEventActionableGuidance(event: GameEvent): string {
  switch (event.id) {
    case 'influencer_viral':
      return '💡 Orientação IA: A demanda disparou com a projeção viral! Eleve a verba de Marketing (R$ 120k+) e garanta estoque suficiente para não zerar nas vendas.';
    case 'verao_antecipado':
      return '💡 Orientação IA: Onda de calor em alta! Priorize lotes maiores para peças de verão (ex: Regata e Shorts) e reajuste seus preços para capturar valor.';
    case 'safra_algodao':
      return '💡 Orientação IA: Matéria-prima 25% mais barata! Aproveite para comprar mais insumos e expandir a margem de lucro de cada peça.';
    case 'logistica_eficiente':
      return '💡 Orientação IA: Frete 25% mais barato e rápido! É a hora de acelerar as entregas e expandir a penetração no mercado.';
    case 'incentivo_fiscal':
      return '💡 Orientação IA: Redução tributária aprovada! Reinvista a folga financeira em Logística & Inovação para consolidar eficiência.';
    case 'treinamento_equipe':
      return '💡 Orientação IA: Produtividade fabril subiu 20%! Aumente os lotes de produção para diluir custos fixos por unidade.';
    case 'tendencia_casual':
      return '💡 Orientação IA: Tendência casual em alta! Reajuste os preços e aumente a produção da Polo, Jeans e Camiseta BÁSICA.';
    case 'selo_sustentabilidade':
      return '💡 Orientação IA: Certificação Carbono-Zero atrai clientes! Recomenda-se elevar Marketing para R$ 120k+ e valorizar a marca.';
    case 'parceria_varejo':
      return '💡 Orientação IA: Vitrines no Metaverso atraíram forte público! Mantenha verba sólida em Marketing e evite ruptura de estoque.';
    case 'inovacao_tecido':
      return '💡 Orientação IA: Nanotecnologia reduziu defeitos fabris! Aporte em Logística & Inovação para acelerar entregas premium.';
    case 'greve_costureiros':
      return '💡 Orientação IA: Paralisação reduz produtividade em 30%! Eleve o orçamento de Produção & Salários para contornar gargalos ou reduza levemente os lotes.';
    case 'crise_algodao':
      return '💡 Orientação IA: Custo do algodão subiu 30%! Recomenda-se elevar Matéria-Prima para no mínimo R$ 200.000 ou reajustar os preços de venda.';
    case 'greve_transportes':
      return '💡 Orientação IA: Frete autônomo prejudicado! Aumente o investimento em Logística para no mínimo R$ 80.000 para conter insatisfação de clientes.';
    case 'crise_energia':
      return '💡 Orientação IA: Tarifa de energia fabril subiu 20%! Eleve o investimento em Produção & Salários para manter a capacidade operacional.';
    case 'boato_redes':
      return '💡 Orientação IA: Confiança do cliente abalada por fake news! Aumente a verba em Marketing Comercial (R$ 110k+) para proteger a reputação.';
    case 'inflacao_alta':
      return '💡 Orientação IA: Consumidores mais cautelosos! Evite preços abusivos e foque a produção nos produtos essenciais de maior giro.';
    case 'dumping_concorrente':
      return '💡 Orientação IA: Concorrência aplicando descontos agressivos! Reforce o Marketing Comercial para segurar a preferência dos clientes.';
    case 'defeito_lote':
      return '💡 Orientação IA: Glitch robótico gerou descarte! Recomenda-se verba reforçada em Produção para controle de qualidade e reposição.';
    case 'frio_atípico_verao':
      return '💡 Orientação IA: Frente fria esfriou produtos de verão! Reduza os lotes de regatas e direcione a produção para moletons e calças.';
    case 'vazamento_dados_fake':
      return '💡 Orientação IA: Hesitação dos clientes na loja virtual! Recomenda-se reforço conjunto em Marketing e Logística para recuperar a confiança.';
    default:
      if (event.type === 'negative') {
        return `💡 Orientação IA: Evento adverso em ${event.affectedArea}. Recomenda-se ajustar os investimentos correspondentes ou adequar margens para mitigar o impacto.`;
      }
      return `💡 Orientação IA: Oportunidade em ${event.affectedArea}! Aumente o investimento correspondente para potencializar seus lucros.`;
  }
}

export interface ProductProfitGuidance {
  productId: string;
  recommendedPriceMin: number;
  recommendedPriceMax: number;
  optimalPrice: number;
  recommendedLotMin: number;
  recommendedLotMax: number;
  estMarginPct: number;
  seasonalityStatus: 'alta' | 'normal' | 'baixa';
  seasonalityNote: string;
  profitTip: string;
}

export function getProductProfitGuidance(
  round: number,
  currentCash: number,
  activeEvent?: GameEvent | null
): { [productId: string]: ProductProfitGuidance } {
  const currentSeason = round === 1 ? 'Outono' : round === 2 ? 'Inverno' : 'Verão';
  const result: { [productId: string]: ProductProfitGuidance } = {};

  // Check if active event boosts product demand or price power
  let eventPriceBoost = 1.0;
  if (activeEvent) {
    if (activeEvent.id === 'influencer_viral' || activeEvent.id === 'tendencia_casual' || activeEvent.id === 'verao_antecipado') {
      eventPriceBoost = 1.20;
    } else if (activeEvent.id === 'selo_sustentabilidade' || activeEvent.id === 'inovacao_tecido') {
      eventPriceBoost = 1.15;
    }
  }

  products.forEach(p => {
    let seasonFactor = 1.0;
    let seasonalityStatus: 'alta' | 'normal' | 'baixa' = 'normal';
    let seasonalityNote = 'Demanda estável durante o ano';

    if (p.seasonality === currentSeason) {
      seasonFactor = 1.30;
      seasonalityStatus = 'alta';
      seasonalityNote = `⚡ Pico de demanda no ${currentSeason}! Aceita preços mais altos.`;
    } else if (p.seasonality !== 'Ano todo' && p.seasonality !== currentSeason) {
      seasonFactor = 0.80;
      seasonalityStatus = 'baixa';
      seasonalityNote = `❄️ Baixa procura no ${currentSeason}. Risco de estoque empacado.`;
    }

    // Dynamic High-Margin Retail Price Benchmarks (3.0x to 4.5x production cost)
    const baseMarkupMin = 3.0 * eventPriceBoost;
    const baseMarkupMax = 4.2 * seasonFactor * eventPriceBoost;

    const minPrice = Math.round(p.productionCost * baseMarkupMin);
    const maxPrice = Math.round(p.productionCost * baseMarkupMax);
    const optimalPrice = Math.round((minPrice + maxPrice) / 2);
    const estMarginPct = Math.round(((optimalPrice - p.productionCost) / optimalPrice) * 100);

    // Calculate Recommended Lot Size
    const baseScale = Math.max(0.5, currentCash / 200000);
    let lotMin = Math.round(((p.productionCost < 20 ? 600 : 300) * baseScale * seasonFactor) / 50) * 50;
    let lotMax = Math.round(((p.productionCost < 20 ? 1500 : 700) * baseScale * seasonFactor) / 50) * 50;

    let profitTip = `Margem de ~${estMarginPct}%. Preço recomendado R$ ${minPrice} – R$ ${maxPrice}.`;
    if (seasonalityStatus === 'alta') {
      profitTip = `Alta demanda no ${currentSeason}! Pratique preço próximo de R$ ${maxPrice} para maximizar lucro.`;
    } else if (seasonalityStatus === 'baixa') {
      profitTip = `Estação fraca. Pratique preço competitivo (~R$ ${minPrice}) e lote reduzido (~${lotMin} un.).`;
    }

    result[p.id] = {
      productId: p.id,
      recommendedPriceMin: minPrice,
      recommendedPriceMax: maxPrice,
      optimalPrice,
      recommendedLotMin: Math.max(100, lotMin),
      recommendedLotMax: Math.max(250, lotMax),
      estMarginPct,
      seasonalityStatus,
      seasonalityNote,
      profitTip
    };
  });

  return result;
}



