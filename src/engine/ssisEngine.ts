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
  const bestCompetitorName = rivalA.profit > rivalB.profit ? 'Rival A (Volume)' : 'Rival B (Premium)';

  // 1. Diagnostic
  let diagnostic = '';
  if (profit > 100000) {
    diagnostic = `Desempenho excelente na Rodada ${round}! O lucro líquido alcançou R$ ${profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. `;
    if (topRevenueProduct) {
      diagnostic += `O grande destaque foi o/a **${topRevenueProduct}**, liderando vendas com R$ ${maxRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em receita. `;
    }
    if (profit > maxCompetitorProfit) {
      diagnostic += `Você superou todos os concorrentes e obteve o melhor resultado financeiro do mercado! `;
    } else {
      diagnostic += `Apesar do ótimo lucro, o **${bestCompetitorName}** faturou R$ ${maxCompetitorProfit.toLocaleString('pt-BR')} no mesmo período. `;
    }
  } else if (profit > 0) {
    diagnostic = `A Essenza fechou a Rodada ${round} no azul com lucro líquido de R$ ${profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. `;
    if (topRevenueProduct) {
      diagnostic += `O principal pilar de vendas foi o/a **${topRevenueProduct}** (R$ ${maxRevenue.toLocaleString('pt-BR')} de faturamento). `;
    }
    if (maxStockRemaining > 0 && worstStockProduct) {
      diagnostic += `Contudo, o desempenho geral foi freado pelo acúmulo de estoque em **${worstStockProduct}** (${maxStockRemaining} unidades paradas). `;
    }
    if (maxCompetitorProfit > profit) {
      diagnostic += `O **${bestCompetitorName}** liderou a rodada com lucro de R$ ${maxCompetitorProfit.toLocaleString('pt-BR')}. `;
    }
  } else {
    diagnostic = `A Rodada ${round} encerrou com saldo negativo (prejuízo de R$ ${Math.abs(profit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}). `;
    if (totalProduced === 0) {
      diagnostic += `Não houve programação de produção nesta rodada, gerando receita nula enquanto os custos operacionais drenaram o caixa. `;
    } else if (maxStockRemaining > totalProduced * 0.3 && worstStockProduct) {
      diagnostic += `O principal fator foi o excesso de estoque de **${worstStockProduct}** (${maxStockRemaining} unidades não vendidas). `;
    } else {
      diagnostic += `Os investimentos em Marketing e Operações pesaram mais do que o retorno imediato gerado pelo faturamento. `;
    }
    diagnostic += `Enquanto isso, o **${bestCompetitorName}** liderou com lucro de R$ ${maxCompetitorProfit.toLocaleString('pt-BR')}. `;
  }

  if (maxStockRemaining > 200 && worstStockProductId) {
    const playerPrice = decision.prices[worstStockProductId];
    const rAPrice = rivalA.prices[worstStockProductId];
    const rBPrice = rivalB.prices[worstStockProductId];
    if (playerPrice > rAPrice && playerPrice > rBPrice) {
      diagnostic += ` Seu preço para o/a **${worstStockProduct}** (R$ ${playerPrice.toFixed(2)}) ficou acima dos concorrentes (Rival A: R$ ${rAPrice.toFixed(2)}, Rival B: R$ ${rBPrice.toFixed(2)}).`;
    }
  }

  if (maxLostSales > 100 && worstLostSalesProduct) {
    diagnostic += ` Ruptura de estoque em **${worstLostSalesProduct}**: cerca de ${Math.round(maxLostSales)} unidades deixaram de ser vendidas por falta de estoque.`;
  }

  if (event) {
    if (event.category === 'materials') {
      diagnostic += ` O evento de mercado **"${event.title}"** causou impacto direto nos custos de insumos (${event.type === 'positive' ? 'reduzindo' : 'elevando'} despesas com matéria-prima).`;
    } else if (event.category === 'marketing') {
      diagnostic += ` O evento **"${event.title}"** causou impacto significativo na demanda e percepção da sua marca (${event.multiplier}x).`;
    } else if (event.category === 'production') {
      diagnostic += ` O evento operacional **"${event.title}"** influenciou a capacidade fabril e rendimento de produção.`;
    } else {
      diagnostic += ` O evento **"${event.title}"** alterou as dinâmicas de demanda de mercado nesta temporada.`;
    }
  }

  // 2. Recommendations
  const recommendationsList: string[] = [];

  if (underpricedProduct) {
    recommendationsList.push(`Você está vendendo o/a **${underpricedProduct}** abaixo do custo de fabricação. Aumente o preço imediatamente.`);
  } else if (thinMarginProduct) {
    recommendationsList.push(`A margem do/a **${thinMarginProduct}** está apertada (${thinMarginVal.toFixed(1)}%). Reajuste o preço ou reduza custos.`);
  }

  if (maxLostSales > 150 && worstLostSalesProduct) {
    recommendationsList.push(`Aumente a produção do/a **${worstLostSalesProduct}** para suprir a demanda reprimida (${Math.round(maxLostSales)} unidades perdidas).`);
  }

  if (maxStockRemaining > 300 && worstStockProduct) {
    recommendationsList.push(`Reduza a produção ou faça uma promoção para desencalhar as ${maxStockRemaining} peças de **${worstStockProduct}**.`);
  }

  if (decision.investments.marketing < 40000) {
    recommendationsList.push(`Amplie o orçamento de Marketing para aumentar o valor da marca e acelerar as vendas.`);
  }

  if (recommendationsList.length === 0) {
    recommendationsList.push(`Sua estrutura estratégica está bem equilibrada. Mantenha o acompanhamento dos concorrentes nas próximas temporadas.`);
  }

  const recommendation = recommendationsList.join(' ');

  // 3. Forecast
  let forecast = '';
  if (round === 1) {
    forecast = 'Para a Rodada 2 (Inverno), a demanda por agasalhos e moletons aumentará. Prepare o estoque e invista em matéria-prima com antecedência.';
  } else if (round === 2) {
    forecast = 'Para a Rodada 3 (Verão), a demanda migrará para camisetas e shorts leves. Ajuste o mix de produção para maximizar a rotação de caixa.';
  } else {
    forecast = 'Simulação concluída. Analise o balanço geral e o Certificado Oficial de Desempenho no Relatório Final.';
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
    rocha = `Excelente balanço financeiro! Lucro de R$ ${profit.toLocaleString('pt-BR')} comprova nossa boa gestão de caixa.`;
  } else if (profit < 0) {
    rocha = `Atenção ao déficit! O prejuízo de R$ ${Math.abs(profit).toLocaleString('pt-BR')} exige contenção imediata de custos desnecessários.`;
  } else {
    rocha = `Resultado estável, mas precisamos buscar margens mais robustas na próxima temporada.`;
  }

  // Dra. Luna (Diretora de Marketing)
  let luna = '';
  if (decision.investments.marketing < 45000) {
    luna = `Precisamos de mais presença de mercado. Investir apenas R$ ${decision.investments.marketing.toLocaleString('pt-BR')} limita nosso alcance frente aos concorrentes.`;
  } else if (reputation > 75) {
    luna = `Excelente posicionamento de marca! Nossa reputação de ${Math.round(reputation)} pontos reflete o acerto das campanhas.`;
  } else {
    luna = `O mercado de moda exige visibilidade constante. Recomendo otimizar o orçamento de divulgação.`;
  }

  // Eng. Vane (Diretora de Operações)
  let vane = '';
  if (maxStockRemaining > 500 && worstStockProduct) {
    vane = `Alerta de fábrica: acumulamos ${maxStockRemaining} unidades paradas de **${worstStockProduct}**. Ajuste o ritmo de produção.`;
  } else if (quality > 75 && efficiency > 70) {
    vane = `Parabéns à equipe de operações. Qualidade (${Math.round(quality)}) e eficiência (${Math.round(efficiency)}) estão alinhadas aos padrões premium.`;
  } else {
    vane = `Recomendo equilibrar a compra de matéria-prima e os investimentos em logística para otimizar as entregas.`;
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
    text = `A Essenza iniciou a temporada com receita de R$ ${metrics.revenue.toLocaleString('pt-BR')} e ${Math.round(metrics.marketShare * 100)}% de market share. `;
    if (event) text += `O cenário foi influenciado pelo evento "${event.title}". `;
    text += metrics.profit > 0 ? `Analistas destacam o início positivo da marca.` : `A empresa foca em ajustes operacionais para a próxima rodada.`;
  } else if (round === 2) {
    text = `Na segunda temporada, a Essenza alcançou faturamento de R$ ${metrics.revenue.toLocaleString('pt-BR')}. `;
    if (rivalA.profit > metrics.profit && rivalA.profit > rivalB.profit) {
      text += `O Rival A se destacou nas vendas por volume. `;
    } else if (rivalB.profit > metrics.profit) {
      text += `O Rival B manteve destaque na linha premium. `;
    } else {
      text += `A Essenza liderou em rentabilidade nesta temporada. `;
    }
  } else {
    text = `A temporada final consolidou a trajetória da Essenza com caixa final de R$ ${metrics.cash.toLocaleString('pt-BR')}. `;
    text += `A gestão encerra o ciclo com aprendizado prático em estratégia, precificação e visão de mercado.`;
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
      subtitle: 'Excelência Comercial, Escala de Margem & Liderança de Mercado',
      description: 'Sua gestão na Essenza foi caracterizada por um equilíbrio magistral entre expansão de receita e preservação rigorosa da saúde financeira. Você calibrou a força da marca com uma cadeia de suprimentos ágil, superando os concorrentes e transformando a Essenza em uma potência do setor.',
      strengths: [
        'Excelente relação de Retorno sobre Investimento (ROI)',
        'Visão holística entre produção, preço e expansão de mercado',
        'Capacidade de capturar market share sem comprometer o caixa'
      ],
      executiveAdvice: 'Mantenha esse ímpeto de liderança investindo continuamente no valor de marca a longo prazo para criar barreiras inabaláveis contra novos entrantes.'
    };
  }

  if (avgQuality > 72 && avgReputation > 70 && matPct > 0.28) {
    return {
      profileName: 'Mestre do Posicionamento Premium & Valor Agregado',
      emoji: '💎',
      subtitle: 'Foco na Excelência do Produto, Experiência da Marca & Margens Elevadas',
      description: 'Você conduziu a Essenza pela trilha da alta sofisticação. Em vez de entrar em uma guerra destrutiva de preços por volume, sua tomada de decisão garantiu tecidos de primeira linha, acabamento superior e reputação impecável junto ao consumidor exigente.',
      strengths: [
        'Construção de valor intangível de marca superior à média',
        'Lealdade do cliente ancorada em qualidade e acabamento',
        'Proteção contra guerras de preços pelo apelo exclusivo'
      ],
      executiveAdvice: 'Explore edições limitadas para aumentar ainda mais o preço médio por peça e maximizar o valor vitalício do cliente.'
    };
  }

  if (mktPct > 0.38 || (totalRevenue > 600000 && mktPct > 0.3)) {
    return {
      profileName: 'Líder Disruptivo & Expansão de Mercado',
      emoji: '🚀',
      subtitle: 'Domínio de Canais, Marketing Agressivo & Tráfego Qualificado',
      description: 'Sua marca registrada na simulação foi a coragem e a agressividade comercial. Você enxergou o marketing não como um custo, mas como o principal motor de crescimento da Essenza. Suas campanhas colocaram a empresa no topo do recall da marca.',
      strengths: [
        'Agressividade tática e domínio dos canais de divulgação',
        'Capacidade de gerar alta demanda reprimida rapidamente',
        'Visão orientada ao crescimento de faturamento'
      ],
      executiveAdvice: 'Garanta que a infraestrutura logística e o planejamento de matéria-prima acompanhem a força das campanhas para evitar rupturas de estoque.'
    };
  }

  if (finalCash > 580000 || totalInv < 200000) {
    return {
      profileName: 'Guardião da Saúde Financeira & Solidez de Capital',
      emoji: '🛡️',
      subtitle: 'Preservação de Caixa, Disciplina Fiscal & Gestão Racional de Riscos',
      description: 'Sua marca foi a estabilidade e a responsabilidade fiscal. Você manteve uma reserva financeira extremamente robusta na Essenza, garantindo proteção total contra volatilidades do mercado.',
      strengths: [
        'Saúde de caixa e liquidez imediatas impecáveis',
        'Rigor financeiro e aversão a desperdícios operacionais',
        'Proteção absoluta contra alavancagem excessiva'
      ],
      executiveAdvice: 'Reinvista pequenos percentuais do capital em inovação para impulsionar ainda mais o crescimento nas próximas oportunidades.'
    };
  }

  if (prodPct > 0.34 || (logPct > 0.28 && prodPct > 0.28)) {
    return {
      profileName: 'Arquiteto da Eficiência Operacional & Escala',
      emoji: '⚙️',
      subtitle: 'Engenharia de Processos, Logística Ágil & Sincronia Fabril',
      description: 'Sua liderança foi pautada pela eficiência de entrega e organização. Você alocou recursos em capacidade instalada, qualificação e logística para garantir que cada peça produzida chegasse com rapidez ao cliente.',
      strengths: [
        'Sincronismo de produção e mitigação de estoques ociosos',
        'Eficiência logístico-operacional e fluxo de entrega contínuo',
        'Domínio da cadeia de suprimentos (Supply Chain)'
      ],
      executiveAdvice: 'Alie sua potência operacional a um marketing mais forte para garantir que a demanda absorva 100% da sua capacidade fabril.'
    };
  }

  return {
    profileName: 'Arquiteto Estratégico Holístico',
    emoji: '🎯',
    subtitle: 'Visão 360°, Tomada de Decisão Equilibrada & Adaptabilidade',
    description: 'Sua atuação à frente da Essenza demonstrou maturidade executiva e flexibilidade. Você distribuiu recursos harmoniosamente entre suprimentos, produção, divulgação e distribuição, ajustando rotas conforme as oscilações do mercado.',
    strengths: [
      'Equilíbrio entre investimento em receita e controle de custos',
      'Flexibilidade estratégica para responder a eventos imprevisíveis',
      'Visão integrada de todas as áreas de negócios'
    ],
    executiveAdvice: 'Identifique a alavanca de maior potencial da sua coleção e concentre um investimento adicional nela para maximizar os lucros.'
  };
}
